import { dungeon } from '../util/game';
import settings from '../settings';
import data from '../data';
import createGui from '../util/customgui';
import { drawBoxAtBlockNotVisThruWalls, drawBoxAtBlock, drawBoxPos, drawFilledBox } from '../util/draw';
import createAlert from '../util/alert';
import { reg, regForge } from '../util/registerer';
import { execCmd } from '../util/format';

let entSpawnReg = regForge(net.minecraftforge.event.entity.EntityJoinWorldEvent, undefined, entitySpawn);
function reset() {
  renderEntReg.unregister();
  renderWorldReg.unregister();
  renderOvlyReg.unregister();
  step10Reg.unregister();
  tickReg.unregister();
  stepVarReg.unregister();
  particleReg.unregister();
  entSpawnReg.unregister();
  puzzleFailReg.unregister();
  quizFailReg.unregister();
  architectUseReg.unregister();

  dungeon.removeListener('bloodOpen', onBloodOpen);
  dungeon.removeListener('bossEnter', onBossEnter);
  dungeon.removeListener('bossEnd', onBossEnd);
  dungeon.removeListener('dungeonLeave', reset);
}
function start() {
  isInBoss = false;
  // boxMobs = [];
  // shouldOcclude.clear();
  boxMobs.clear();
  mobCand = [];
  nameCand = [];
  bloodMobs = [];
  possibleSkulls = [];
  bloodX = -1;
  bloodZ = -1;
  map = null;
  lastRoom = '';
  motionData.clear();
  bloodOpenTime = 0;
  powerupCand = [];
  hiddenPowerups.clear();
  renderEntReg.register();
  renderWorldReg.register();
  renderOvlyReg.register();
  step10Reg.register();
  tickReg.register();
  stepVarReg.register();
  particleReg.register();
  entSpawnReg.register();
  puzzleFailReg.register();
  quizFailReg.register();
  architectUseReg.register();

  dungeon.on('bloodOpen', onBloodOpen);
  dungeon.on('bossEnter', onBossEnter);
  dungeon.on('bossEnd', onBossEnd);
  dungeon.on('dungeonLeave', reset);
}

const dist = (n1, n2) => n1 < n2 ? n2 - n1 : n1 - n2;
const equalish = (n1, n2) => dist(n1, n2) < 0.25;

let isInBoss = false;
// let boxMobs = [];
// let shouldOcclude = new Map();
const boxMobs = new Map();
let mobCand = [];
let nameCand = [];
const bucketSize = 1;
const bucket = new Map();
const bucketKey = 631;
let bloodMobs = [];
let possibleSkulls = [];
let bloodX = -1;
let bloodZ = -1;
const motionData = new Map();
let bloodOpenTime = 0;
let map;
const mapDisplay = createGui(() => data.dungeonMapLoc, renderMap, renderMapEdit);
let lastRoom = '';
const hecAlert = createAlert('Hecatomb');
const orbNames = [
  '§c§lABILITY DAMAGE',
  '§c§lDAMAGE',
  '§a§lDEFENSE'
];
const orbIds = [
  'DUNGEON_BLUE_SUPPORT_ORB',
  'DUNGEON_RED_SUPPORT_ORB',
  'DUNGEON_GREEN_SUPPORT_ORB'
];
let powerupCand = [];
const hiddenPowerups = new Map();
const shitterAlert = createAlert('Shitter', 10);
function getBucketId(ent) {
  return (ent.field_70165_t >> bucketSize) * bucketKey + (ent.field_70161_v >> bucketSize);
}
function isDungeonMob(name) {
  return name === 'EntityZombie' ||
    name === 'EntitySkeleton' ||
    name === 'EntityOtherPlayerMP' ||
    name === 'EntityEnderman' ||
    name === 'EntityWitherSkeleton';
}
function isSkull(e) {
  const i = e.func_71124_b(4);
  if (!i) return false;
  const item = new Item(i);
  const id = item.getRegistryName();
  return id === 'minecraft:skull';
}
function addSkull(skull) {
  if (bloodX === -1) return;
  const x = roundRoomCoords(skull.getX());
  const z = roundRoomCoords(skull.getZ());
  if (x !== bloodX || z !== bloodZ) return;
  bloodMobs.push(skull);
}
function roundRoomCoords(c) {
  return ((c + 9) & 0b11111111111111111111111111100000) - 9;
}
function addToBucket(id, v) {
  if (!bucket.has(id)) bucket.set(id, []);
  bucket.get(id).push(v);
}
function entitySpawn(evn) {
  const e = evn.entity;
  const c = e.getClass().getSimpleName();
  if (c === 'EntityArmorStand') {
    if (settings.dungeonHideHealerPowerups) powerupCand.unshift([Date.now(), e]);
    if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss)) nameCand.push(e);
    if (settings.dungeonCamp) possibleSkulls.push(e);
  } else if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss) && isDungeonMob(c)) mobCand.push(e);
}
function toJavaCol(c) {
  return new (Java.type('java.awt.Color'))(((c & 0xFF) << 24) | c >> 8, true);
}

/*
org.mozilla.javascript.WrappedException: Wrapped java.lang.RuntimeException: No OpenGL context found in the current thread.
Caused by: java.lang.RuntimeException: No OpenGL context found in the current thread.
  at org.lwjgl.opengl.GLContext.getCapabilities(GLContext.java:124)
  at org.lwjgl.opengl.GL15.glBeginQuery(GL15.java:405)
  at club.sk1er.patcher.util.world.render.culling.EntityCulling.checkEntity(EntityCulling.java:181)
*/
// const EntityCulling = Java.type('club.sk1er.patcher.util.world.render.culling.EntityCulling');
// const checkEntity = EntityCulling.class.getDeclaredMethod('checkEntity', [Java.type('net.minecraft.entity.Entity').class]);
// checkEntity.setAccessible(true);
// Java.type('org.lwjgl.opengl.GL').createCapabilities(false);
const step10Reg = reg('step', () => {
  if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss)) {
    new Thread(() => {
      bucket.clear();
      mobCand = mobCand.filter(e => {
        if (e.field_70128_L) return false;
        const n = e.func_70005_c_();
        if (n === 'Shadow Assassin') {
          // boxMobs.push({ yO: 0, h: 2, c: toJavaCol(settings.dungeonBoxSAColor), e });
          boxMobs.set(e.func_110124_au().toString(), { yO: 0, h: 2, c: toJavaCol(settings.dungeonBoxSAColor) });
          return false;
        }
        const id = getBucketId(e);
        // addToBucket(id - bucketKey - 1, e);
        // addToBucket(id - bucketKey + 0, e);
        // addToBucket(id - bucketKey + 1, e);
        // addToBucket(id - 1, e);
        addToBucket(id + 0, e);
        // addToBucket(id + 1, e);
        // addToBucket(id + bucketKey - 1, e);
        // addToBucket(id + bucketKey + 0, e);
        // addToBucket(id + bucketKey + 1, e);
        return true;
      });
      // boxMobs = boxMobs.filter(v => !v.e.field_70128_L);
      nameCand = nameCand.filter(e => {
        if (e.field_70128_L) return false;
        const n = e.func_70005_c_();
        if (n === '§c§cBlood Key' || n === '§6§8Wither Key') {
          // boxMobs.push({ yO: -1, h: 1, c: toJavaCol(settings.dungeonBoxKeyColor), e });
          boxMobs.set(e.func_110124_au().toString(), { yO: -1, h: 1, c: toJavaCol(settings.dungeonBoxKeyColor) });
          return false;
        }
        if (!n.startsWith('§6✯ ')) return false;
        const x = e.field_70165_t;
        const y = e.field_70163_u;
        const z = e.field_70161_v;

        const id = getBucketId(e);
        if (!bucket.has(id)) return true;
        const ent = bucket.get(id).find(v => equalish(v.field_70165_t, x) && equalish(v.field_70161_v, z) && v.field_70163_u < y && y - v.field_70163_u < 5);
        if (!ent) return true;

        let h = 2;
        let c = settings.dungeonBoxMobColor;
        if (n.includes('Fels', 6)) {
          h = 3;
          c = settings.dungeonBoxFelColor;
        } else if (n.includes('Withermancer', 6)) {
          h = 3;
          c = settings.dungeonBoxMancerColor;
        }
        // boxMobs.push({ yO: 0, h, c: toJavaCol(c), e: ent });
        boxMobs.set(ent.func_110124_au().toString(), { yO: 0, h, c: toJavaCol(c) });

        return false;
      });

      // shouldOcclude.clear();
      // boxMobs.forEach(({ e }) => shouldOcclude.set(e.func_110124_au().toString(), checkEntity.invoke(EntityCulling, e)));
    }).start();
  }
}).setFps(10);

const tickReg = reg('tick', () => {
  if (settings.dungeonCamp) {
    const t = Date.now();
    bloodMobs = bloodMobs.filter(e => {
      const uuid = e.getUUID().toString();
      const x = e.getX();
      const y = e.getY();
      const z = e.getZ();
      const dx = Math.abs(x - e.getLastX());
      const dz = Math.abs(z - e.getLastZ());
      if (motionData.has(uuid)) {
        const data = motionData.get(uuid);
        data.ttl--;
        if (data.ttl <= 0) return void motionData.delete(uuid);
      } else if (bloodOpenTime > 0 && (dx !== 0 || dz !== 0)) {
        const ttl = (t - bloodOpenTime > 26000) ? 40 : 80;
        motionData.set(uuid, { startX: x, startY: y, startZ: z, startT: t, estX: x, estY: y, estZ: z, lastEstX: x, lastEstY: y, lastEstZ: z, ttl, maxTtl: ttl, lastUpdate: t });
      }
      return true;
    });
  }
  if (settings.dungeonMap) {
    map = null;
    const mapI = Player.getInventory()?.getStackInSlot(8);
    if (!mapI || mapI.getRegistryName() !== 'minecraft:filled_map') return;
    map = mapI.item.func_77873_a(mapI.itemStack, World.getWorld());

    const x = roundRoomCoords(Player.getX());
    const z = roundRoomCoords(Player.getZ());
    const k = x + ',' + z;
    if (k === lastRoom) return;
    // TODO: update doors
    // TODO: check if room coords are in same room based on map doors
    lastRoom = k;
  }
  if (settings.dungeonHideHealerPowerups) {
    let f = 0;
    const t = Date.now();
    for (let j = 0; j < powerupCand.length; j++) {
      if (t - powerupCand[j][0] < 500) f++;
      let e = powerupCand[j][1];
      const n = e.func_70005_c_();
      if (orbNames.some(v => n.startsWith(v))) {
        hiddenPowerups.set(e.func_110124_au().toString(), e);
        continue;
      }
      let i = e.func_71124_b(4);
      let b = i && i.func_77978_p();
      if (b) {
        const d = b.func_74775_l('ExtraAttributes').func_74779_i('id');
        if (orbIds.some(v => d === v)) {
          hiddenPowerups.set(e.func_110124_au().toString(), e);
          continue;
        }
      }
      i = e.func_71124_b(0);
      b = i && i.func_77978_p();
      if (b && b.func_74775_l('SkullOwner').func_74775_l('Properties').func_150295_c('textures', 10).func_150305_b(0).func_74775_l('Value').func_74775_l('textures').func_74775_l('SKIN').func_74779_i('url') === 'http://textures.minecraft.net/texture/96c3e31cfc66733275c42fcfb5d9a44342d643b55cd14c9c77d273a2352') {
        hiddenPowerups.set(e.func_110124_au().toString(), e);
      }
    }
    powerupCand = powerupCand.slice(0, f);
  }
});

const stepVarReg = reg('step', () => {
  if (!settings.dungeonCamp) return;
  if (possibleSkulls.length) {
    possibleSkulls.forEach(e => {
      if (!isSkull(e)) return;
      const ent = new Entity(e);
      // const texture = item.getNBT().getCompoundTag('tag').getCompoundTag('SkullOwner').getCompoundTag('Properties').getTagList('textures', 10).func_150305_b(0).func_74779_i('Value');
      const ownerUUID = new Item(e.func_71124_b(4)).getNBT().getCompoundTag('tag').getCompoundTag('SkullOwner').getString('Id');
      if (ownerUUID === Player.getUUID() && bloodX === -1) {
        bloodX = roundRoomCoords(ent.getX());
        bloodZ = roundRoomCoords(ent.getZ());
        World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).forEach(e => isSkull(e.getEntity()) && addSkull(e));
      } else addSkull(ent);
    });
    possibleSkulls = [];
  }

  const t = Date.now();
  bloodMobs = bloodMobs.filter(e => {
    const uuid = e.getUUID().toString();
    if (motionData.has(uuid)) {
      const x = e.getX();
      const y = e.getY();
      const z = e.getZ();
      const data = motionData.get(uuid);
      const dt = (t - data.startT) / 50;
      const dx = x - data.startX;
      const dy = y - data.startY;
      const dz = z - data.startZ;
      const estX = x + dx / dt * data.ttl;
      const estY = y + dy / dt * data.ttl;
      const estZ = z + dz / dt * data.ttl;
      data.lastEstX = data.estX;
      data.lastEstY = data.estY;
      data.lastEstZ = data.estZ;
      data.estX = estX;
      data.estY = estY;
      data.estZ = estZ;
      data.lastUpdate = t;
    }
    return true;
  });
});

function onPuzzleFail(name) {
  let i = name.indexOf(' ');
  if (i < 0) i = name.length;
  if (name.slice(1, i) !== Player.getName()) return;
  execCmd('gfs ARCHITECT_FIRST_DRAFT 1');
  shitterAlert.show();
}
const puzzleFailReg = register('chat', onPuzzleFail).setCriteria('&r&c&lPUZZLE FAIL! &r&${name} ${*}');
const quizFailReg = register('chat', onPuzzleFail).setCriteria('&r&4[STATUE] Oruo the Omniscient&r&f: &r&${name} &r&cchose the wrong answer! I shall never forget this moment of misrememberance.&r');
const architectUseReg = register('chat', () => shitterAlert.hide()).setCriteria('&r&aYou used the &r&5Architect\'s First Draft${*}');

// const renderReg = reg('renderWorld', partial => {
const renderEntReg = reg('renderEntity', (e, pos, partial, evn) => {
  if (settings.dungeonHideHealerPowerups && hiddenPowerups.has(e.getUUID().toString())) return void cancel(evn);
  if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss)) {
    const uuid = e.getUUID().toString();
    if (!boxMobs.has(uuid)) return;
    const { yO, h, c } = boxMobs.get(uuid);
    // boxMobs.forEach(({ yO, h, c, e }) => {
    // if (e.field_70128_L) return;

    // const uuid = e.func_110124_au().toString();
    // if (shouldOcclude.get(uuid)) return;
    // drawBoxBB(e.func_174813_aQ(), c, partial);
    // drawBoxPos(e.field_70165_t, e.field_70163_u - yO, e.field_70161_v, 1, h, c, partial, true, false);
    drawBoxPos(pos.getX(), pos.getY() - yO, pos.getZ(), 1, h, c, partial, settings.dungeonBoxMobEsp, false);
    // drawBoxAtBlock(px - 0.5, py - yO, pz - 0.5, r, g, b, 1, h, a);
    // drawBoxAtBlockNotVisThruWalls(px - 0.5, py - yO, pz - 0.5, r, g, b, 1, h, a);
    // });
  }
});

const renderWorldReg = reg('renderWorld', () => {
  if (settings.dungeonCamp) {
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
        x = lastEstX + (estX - lastEstX) * smoothFactor;
        y = lastEstY + (estY - lastEstY) * smoothFactor;
        z = lastEstZ + (estZ - lastEstZ) * smoothFactor;
      }
      const m = (maxTtl - ttl) / maxTtl;
      const br = ((settings.dungeonCampBoxColor >> 24) & 0xFF) / 256;
      const bg = ((settings.dungeonCampBoxColor >> 16) & 0xFF) / 256;
      const bb = ((settings.dungeonCampBoxColor >> 8) & 0xFF) / 256;
      const ba = ((settings.dungeonCampBoxColor >> 0) & 0xFF) / 256;
      const wr = ((settings.dungeonCampWireColor >> 24) & 0xFF) / 256;
      const wg = ((settings.dungeonCampWireColor >> 16) & 0xFF) / 256;
      const wb = ((settings.dungeonCampWireColor >> 8) & 0xFF) / 256;
      const wa = ((settings.dungeonCampWireColor >> 0) & 0xFF) / 256;
      drawFilledBox(x, y + 2.5 - m, z, m, 2 * m, br, bg, bb, ba, settings.dungeonCampBoxEsp);
      if (settings.dungeonCampBoxEsp) drawBoxAtBlock(x - 0.5, y + 1.5, z - 0.5, wr, wg, wb, 1, 2, wa);
      else drawBoxAtBlockNotVisThruWalls(x - 0.5, y + 1.5, z - 0.5, wr, wg, wb, 1, 2, wa);
    });
  }
  if (settings.dungeonMap) {
    if (settings.dungeonMapBoxDoors) renderDoor();
  }
});

const renderOvlyReg = reg('renderOverlay', () => {
  if (settings.dungeonMap) {
    mapDisplay.render();
  }
});

function renderMap() {
  if (!map) return;
  // copy map to screen

  if (settings.dungeonMapRenderHead) renderHeads.call(this);

  const isHoldingLeap = false;
  if (settings.dungeonMapRenderName === 'Always' || (settings.dungeonMapRenderName === 'Holding Leap' && isHoldingLeap)) renderPlayerText.call(this, 'name');
  else if (settings.dungeonMapRenderClass === 'Always' || (settings.dungeonMapRenderClass === 'Holding Leap' && isHoldingLeap)) renderPlayerText.call(this, 'class');
}
function renderHeads() {

}
function renderPlayerText() {
  // draw text with shadow
}
function renderMapEdit() {

}
let doors = [];
function renderDoor() {
  doors.forEach(v => {

  });
}

const particleReg = reg('spawnParticle', (part, id, evn) => {
  if (!settings.dungeonHideHealerPowerups) return;
  if (id.toString() !== 'REDSTONE') return;
  try {
    // chattriggers :clown:
    // org.mozilla.javascript.WrappedException: Wrapped java.lang.IllegalArgumentException: Color parameter outside of expected range: Green Blue
    const b = part.getColor().getBlue();
    if (b === 0 || b > 10) return;
    // something something bucket ¯\_(ツ)_/¯
    if (Array.from(hiddenPowerups.values()).some(e => dist(e.field_70165_t, part.getX()) < 1 && dist(e.field_70161_v, part.getZ()) < 1 && dist(e.field_70163_u, part.getY() < 2))) cancel(evn);
  } catch (e) { }
});

function onBloodOpen() {
  if (!bloodOpenTime) bloodOpenTime = Date.now();
}
function onBossEnter() {
  isInBoss = true;
}
function onBossEnd() {
  if (settings.dungeonHecatombAlert) {
    /**
     * @type {{getName(): string}[]}
     */
    const lines = Scoreboard.getLines(false);
    let score = lines[6].getName();
    if (!score) return;
    score = score.removeFormatting().match(/\((\d+)\)/);
    if (!score) return;
    score = +(score[1]);
    if (score < 270) return;
    hecAlert.show(settings.dungeonHecatombAlert);
  }
}

export function init() {
  settings._dungeonCampSmoothTime.onAfterChange(v => {
    if (v <= 1000) stepVarReg.setFps(1000 / v);
    else stepVarReg.setDelay(v / 1000);
  });
  settings._moveDungeonMap.onAction(() => mapDisplay.edit());
}
export function load() {
  dungeon.on('dungeonStart', start);
}
export function unload() {
  dungeon.removeListener('dungeonStart', start);
  reset();
}
