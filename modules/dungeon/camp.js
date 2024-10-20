import settings from '../../settings';
import data from '../../data';
import { renderOutline, renderFilledBox, renderString, getPartialServerTick } from '../../util/draw';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import getPing from '../../util/ping';
import createTextGui from '../../util/customtextgui';
import { dist, lerp, linReg } from '../../util/math';
import { StateProp, StateVar } from '../../util/state';
import { DelayTimer } from '../../util/timers';
import { getItemId } from '../../util/mc';
import { listenBossMessages, roundRoomCoords, stateIsInBoss } from '../dungeon.js';
import { run, unrun } from '../../util/threading';

let bloodMobs = [];
let bloodMobsSet = new Set();
let possibleSkulls = [];
let bloodX = -1;
let bloodZ = -1;
let bloodMobCount = 0;
const motionData = new Map();
const dialogueSkipTimer = createTextGui(() => data.dungeonCampSkipTimerLoc, () => ['§l§23.69s']);
let lastSpawnedBloodMob;
let bloodOpenTime = 0;

const stateBloodClosed = new StateVar(false);
const stateCamp = new StateProp(stateBloodClosed).not().and(settings._dungeonCamp);
const stateCampFinal = new StateProp(stateIsInBoss).not().and(settings._dungeonCamp);

function isSkull(e) {
  const i = e.func_71124_b(4);
  return i && getItemId(i) === 'minecraft:skull';
}
function addSkull(skull) {
  if (bloodX === -1) return;
  const x = roundRoomCoords(skull.getX());
  const z = roundRoomCoords(skull.getZ());
  if (x !== bloodX || z !== bloodZ) return;
  const uuid = skull.getUUID().toString();
  if (bloodMobsSet.has(uuid)) return;
  bloodMobs.push(skull);
  bloodMobsSet.add(uuid);
}

const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const entSpawnReg = reg('spawnEntity', e => {
  if (e instanceof EntityArmorStand) possibleSkulls.push(e);
}).setEnabled(stateCamp);
const serverTickReg = reg('serverTick2', () => {
  if (bloodOpenTime === 0 || (possibleSkulls.length === 0 && bloodMobs.length === 0)) return;
  const arr = possibleSkulls;
  possibleSkulls = [];
  run(() => {
    arr.forEach(e => {
      if (!isSkull(e)) return;
      if (bloodX === -1) {
        const i = e.func_71124_b(4);
        const b = i && i.func_77978_p();
        if (b && b.func_74775_l('SkullOwner').func_74779_i('Id') === Player.getUUID()) {
          const ent = new Entity(e);
          bloodX = roundRoomCoords(ent.getX());
          bloodZ = roundRoomCoords(ent.getZ());
          World.getAllEntitiesOfType(EntityArmorStand).forEach(e => isSkull(e.entity) && addSkull(e));
        }
      } else addSkull(new Entity(e));
    });

    const t = Date.now();
    const motionBuff = [];
    bloodMobs = bloodMobs.filter(e => {
      const uuid = e.getUUID().toString();
      let data = motionData.get(uuid);
      const x = e.getX();
      const y = e.getY();
      const z = e.getZ();
      if (!data) {
        const dx = dist(x, e.getLastX());
        const dz = dist(z, e.getLastZ());
        if (y > 71 && (dx > 0.01 || dz > 0.01) && dx < 0.5 && dz < 0.5) {
          bloodMobCount++;
          const ttl = t - bloodOpenTime < 32000 && (bloodMobCount <= 4 || t - bloodOpenTime < 24000) ? 80 : 40;
          data = {
            posX: [e.getLastX()],
            posY: [e.getLastY()],
            posZ: [e.getLastZ()],
            estX: x,
            estY: y,
            estZ: z,
            lastEstX: x,
            lastEstY: y,
            lastEstZ: z,
            ttl,
            maxTtl: ttl,
            startT: t,
            lastUpdate: t,
            timer: new DelayTimer(settings.dungeonCampSmoothTime)
          };
          motionBuff.push([uuid, data]);
          if (ttl === 80 && bloodMobCount >= 4) lastSpawnedBloodMob = data;
        }
      }
      if (data) {
        data.ttl--;
        if (data.ttl <= 0) return void motionBuff.push([uuid]);
        data.posX.push(x);
        data.posY.push(y);
        data.posZ.push(z);
        if (data.timer.shouldTick()) {
          const { r: rX, b: bX } = linReg(data.posX.map((v, i) => [i, v]));
          const { r: rY, b: bY } = linReg(data.posY.map((v, i) => [i, v]));
          const { r: rZ, b: bZ } = linReg(data.posZ.map((v, i) => [i, v]));
          data.lastEstX = data.estX;
          data.lastEstY = data.estY;
          data.lastEstZ = data.estZ;
          data.estX = x + bX * data.ttl;
          data.estY = y + bY * data.ttl;
          data.estZ = z + bZ * data.ttl;
          data.lastUpdate = t;
        }
      }
      return true;
    });
    if (motionBuff.length) unrun(() => motionBuff.forEach(v => {
      if (v.length === 1) motionData.delete(v[0]);
      else motionData.set(v[0], v[1]);
    }));
  });
}).setEnabled(stateCampFinal);
const renderWorldReg = reg('renderWorld', () => {
  const t = Date.now();
  motionData.forEach(({ estX, estY, estZ, lastEstX, lastEstY, lastEstZ, ttl, maxTtl, lastUpdate }) => {
    const dt = t - lastUpdate;
    let x;
    let y;
    let z;
    if (dt > settings.dungeonCampSmoothTime) {
      x = estX;
      y = estY;
      z = estZ;
    } else {
      const smoothFactor = dt / settings.dungeonCampSmoothTime;
      x = lerp(lastEstX, estX, smoothFactor);
      y = lerp(lastEstY, estY, smoothFactor);
      z = lerp(lastEstZ, estZ, smoothFactor);
    }
    const m = Math.min(1, (maxTtl - ttl - getPartialServerTick() + getPing() / 50) / maxTtl);
    renderOutline(x, y + 1.5, z, 1, 2, settings.dungeonCampWireColor, settings.dungeonCampBoxEsp, true, 3);
    renderFilledBox(x, y + 2.5 - m, z, m, 2 * m, settings.dungeonCampBoxColor, settings.dungeonCampBoxEsp);

    if (settings.dungeonCampTimer) renderString(((ttl - getPartialServerTick()) / 20).toFixed(2), x, y + 1, z);
  });
}).setEnabled(stateCampFinal);
const renderOverlayReg = reg('renderOverlay', () => {
  if (lastSpawnedBloodMob && lastSpawnedBloodMob.ttl) {
    const d = (lastSpawnedBloodMob.ttl + 1 - getPartialServerTick()) * 50;
    dialogueSkipTimer.setLine(`§l${colorForNumber(d, 4000)}${(d / 1000).toFixed(2)}s`.toString());
    dialogueSkipTimer.render();
  }
}).setEnabled(stateCamp.and(settings._dungeonCampSkipTimer));
const bloodOpenReg = reg('chat', () => bloodOpenTime || (bloodOpenTime = Date.now())).setChatCriteria('&r&cThe &r&c&lBLOOD DOOR&r&c has been opened!&r').setEnabled(stateCamp);

export function init() {
  listenBossMessages((name, msg) => {
    if (name !== 'The Watcher') return;
    if (msg === 'That will be enough for now.') stateBloodClosed.set(true);
    if (msg === 'You have proven yourself. You may pass.') stateBloodClosed.set(true);
    if (msg === 'Let\'s see how you can handle this.') bloodMobCount = 4;
    if (!bloodOpenTime) bloodOpenTime = Date.now();
  });
  settings._moveDungeonCampSkipTimer.onAction(() => dialogueSkipTimer.edit());
}
export function start() {
  bloodMobs = [];
  bloodMobsSet.clear();
  possibleSkulls = [];
  bloodX = -1;
  bloodZ = -1;
  bloodMobCount = 0;
  motionData.clear();
  lastSpawnedBloodMob = null;
  bloodOpenTime = 0;
  stateBloodClosed.set(false);

  entSpawnReg.register();
  serverTickReg.register();
  renderWorldReg.register();
  renderOverlayReg.register();
  bloodOpenReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  serverTickReg.unregister();
  renderWorldReg.unregister();
  renderOverlayReg.unregister();
  bloodOpenReg.unregister();
}