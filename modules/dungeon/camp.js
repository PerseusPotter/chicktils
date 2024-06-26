import settings from '../../settings';
import data from '../../data';
import { drawBoxAtBlockNotVisThruWalls, drawBoxAtBlock, drawFilledBox, drawString } from '../../util/draw';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import getPing from '../../util/ping';
import createTextGui from '../../util/customtextgui';
import { dist, lerp, linReg } from '../../util/math';
import { StateProp, StateVar } from '../../util/state';
import { DelayTimer } from '../../util/timers';
import { getItemId } from '../../util/mc';
import { listenBossMessages, roundRoomCoords, stateIsInBoss } from '../dungeon.js';
import { run } from '../../util/threading';

let bloodMobs = [];
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
  bloodMobs.push(skull);
}

const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  if (e.getClass().getSimpleName() === 'EntityArmorStand') possibleSkulls.push(e);
}, 'dungeon/camp').setEnabled(stateCamp);
const tickReg = reg('tick', () => {
  run(() => {
    possibleSkulls.forEach(e => {
      if (!isSkull(e)) return;
      if (bloodX === -1) {
        const i = e.func_71124_b(4);
        const b = i && i.func_77978_p();
        if (b && b.func_74775_l('SkullOwner').func_74779_i('Id') === Player.getUUID()) {
          const ent = new Entity(e);
          bloodX = roundRoomCoords(ent.getX());
          bloodZ = roundRoomCoords(ent.getZ());
          World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).forEach(e => isSkull(e.entity) && addSkull(e));
        }
      } else addSkull(new Entity(e));
    });
    possibleSkulls = [];
  });
}, 'dungeon/camp').setEnabled(stateCamp);
const serverTickReg = reg('packetReceived', () => {
  if (bloodOpenTime === 0) return;
  run(() => {
    const t = Date.now();
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
          motionData.set(uuid, data);
          if (ttl === 80 && bloodMobCount >= 4) lastSpawnedBloodMob = data;
        }
      }
      if (data) {
        data.ttl--;
        if (data.ttl <= 0) return void motionData.delete(uuid);
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
  });
}, 'dungeon/camp').setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction')).setEnabled(stateCampFinal);
const renderWorldReg = reg('renderWorld', () => {
  // bloodMobs.forEach(e => motionData.has(e.getUUID().toString()) || drawBoxAtBlock(e.getX() - 0.5, e.getY() + 1.5, e.getZ() - 0.5, 1, +(!e.isDead()), +(e.getX() === e.getLastX()), 1, 1));
  // drawBoxAtBlock(bloodX, 69, bloodZ, 1, 0, 0, 32, 16);

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
    const br = ((settings.dungeonCampBoxColor >> 24) & 0xFF) / 256;
    const bg = ((settings.dungeonCampBoxColor >> 16) & 0xFF) / 256;
    const bb = ((settings.dungeonCampBoxColor >> 8) & 0xFF) / 256;
    const ba = ((settings.dungeonCampBoxColor >> 0) & 0xFF) / 256;
    const wr = ((settings.dungeonCampWireColor >> 24) & 0xFF) / 256;
    const wg = ((settings.dungeonCampWireColor >> 16) & 0xFF) / 256;
    const wb = ((settings.dungeonCampWireColor >> 8) & 0xFF) / 256;
    const wa = ((settings.dungeonCampWireColor >> 0) & 0xFF) / 256;
    const m = (maxTtl - ttl - Tessellator.partialTicks + getPing() / 50) / maxTtl;
    drawFilledBox(x, y + 2.5 - m, z, m, 2 * m, br, bg, bb, ba, settings.dungeonCampBoxEsp);
    if (settings.dungeonCampBoxEsp) drawBoxAtBlock(x - 0.5, y + 1.5, z - 0.5, wr, wg, wb, 1, 2, wa, 3);
    else drawBoxAtBlockNotVisThruWalls(x - 0.5, y + 1.5, z - 0.5, wr, wg, wb, 1, 2, wa, 3);

    if (settings.dungeonCampTimer) drawString(((ttl - Tessellator.partialTicks) / 20).toFixed(2), x, y + 1, z);
  });
}, 'dungeon/camp').setEnabled(stateCampFinal);
const renderOverlayReg = reg('renderOverlay', () => {
  if (lastSpawnedBloodMob && lastSpawnedBloodMob.ttl) {
    const d = (lastSpawnedBloodMob.ttl + 1 - Tessellator.partialTicks) * 50;
    dialogueSkipTimer.setLine(`§l${colorForNumber(d, 4000)}${(d / 1000).toFixed(2)}s`.toString());
    dialogueSkipTimer.render();
  }
}, 'dungeon/camp').setEnabled(stateCamp.and(settings._dungeonCampSkipTimer));
const bloodOpenReg = reg('chat', () => bloodOpenTime || (bloodOpenTime = Date.now()), 'dungeon/camp').setChatCriteria('&r&cThe &r&c&lBLOOD DOOR&r&c has been opened!&r').setEnabled(stateCamp);

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
  possibleSkulls = [];
  bloodX = -1;
  bloodZ = -1;
  bloodMobCount = 0;
  motionData.clear();
  lastSpawnedBloodMob = null;
  bloodOpenTime = 0;
  stateBloodClosed.set(false);

  entSpawnReg.register();
  tickReg.register();
  serverTickReg.register();
  renderWorldReg.register();
  renderOverlayReg.register();
  bloodOpenReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  tickReg.unregister();
  serverTickReg.unregister();
  renderWorldReg.unregister();
  renderOverlayReg.unregister();
  bloodOpenReg.unregister();
}