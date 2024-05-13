import settings from '../settings';
import data from '../data';
import createGui from '../util/customgui';
import { drawBoxAtBlockNotVisThruWalls, drawBoxAtBlock, drawBoxPos, drawFilledBox } from '../util/draw';
import createAlert from '../util/alert';
import { reg, regForge } from '../util/registerer';
import { colorForNumber, execCmd } from '../util/format';
import getPing from '../util/ping';
import runHelper from '../util/runner';
import createTextGui from '../util/customtextgui';
import { compareFloat } from '../util/math';
import Grid from '../util/grid';
import { logDebug } from '../util/log';

let entSpawnReg = regForge(net.minecraftforge.event.entity.EntityJoinWorldEvent, undefined, entitySpawn);
function reset() {
  renderEntReg.unregister();
  renderEntPostReg.unregister();
  renderWorldReg.unregister();
  renderOvlyReg.unregister();
  step2Reg.unregister();
  tickReg.unregister();
  stepVarReg.unregister();
  particleReg.unregister();
  titleReg.unregister();
  entSpawnReg.unregister();
  puzzleFailReg.unregister();
  quizFailReg.unregister();
  architectUseReg.unregister();
  necronStartReg.unregister();

  bloodOpenReg.unregister();
  bloodEndReg.unregister();
  bossEnterReg.unregister();
  bossEndReg.unregister();
  dungeonLeaveReg.unregister();

  shitterAlert.hide();
  if (instaMidProc && instaMidProc.isAlive()) {
    instaMidProc.destroyForcibly();
    instaMidProc = void 0;
  }
}
function start() {
  isInBoss = false;
  boxMobs.clear();
  mobCand = [];
  nameCand = [];
  bloodMobs = [];
  possibleSkulls = [];
  bloodX = -1;
  bloodZ = -1;
  map = null;
  mapId = null;
  lastRoom = '';
  motionData.clear();
  bloodOpenTime = 0;
  bloodClosed = false;
  powerupCand = [];
  hiddenPowerups.clear();
  hiddenPowerupsBucket.clear();
  necronDragStart = 0;
  isAtDev4 = false;

  renderEntReg.register();
  renderEntPostReg.register();
  renderWorldReg.register();
  renderOvlyReg.register();
  step2Reg.register();
  tickReg.register();
  stepVarReg.register();
  particleReg.register();
  titleReg.register();
  entSpawnReg.register();
  puzzleFailReg.register();
  quizFailReg.register();
  architectUseReg.register();
  necronStartReg.register();

  bloodOpenReg.register();
  bloodEndReg.register();
  bossEnterReg.register();
  bossEndReg.register();
  dungeonLeaveReg.register();
}

const dist = (n1, n2) => n1 < n2 ? n2 - n1 : n1 - n2;

let isInBoss = false;
const boxMobs = new (Java.type('java.util.WeakHashMap'))();
let mobCand = [];
let nameCand = [];
const mobCandBucket = new Grid();
let bloodMobs = [];
let possibleSkulls = [];
let bloodX = -1;
let bloodZ = -1;
const motionData = new Map();
let bloodOpenTime = 0;
let bloodClosed = false;
let map;
let mapId;
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
const hiddenPowerups = new (Java.type('java.util.HashSet'))();
const hiddenPowerupsBucket = new Grid({ addNeighbors: true });
const shitterAlert = createAlert('Shitter', 10);
let instaMidProc;
const necronDragTimer = createTextGui(() => data.dungeonNecronDragTimerLoc, () => ['§l§26.42s']);
let necronDragStart = 0;
let isAtDev4 = false;
function isDungeonMob(name) {
  return name === 'EntityZombie' ||
    name === 'EntitySkeleton' ||
    name === 'EntityOtherPlayerMP' ||
    name === 'EntityEnderman';
}
function getBoxMobType(n) {
  if (n.includes('Fels', 6)) return 1;

  if (n.includes('Withermancer', 6)) return 2;
  // if (n.includes('Zombie Lord', 6)) return 2;
  // if (n.includes('Skeleton Lord', 6)) return 2;
  if (n.includes('Lord', 6)) return 2;
  if (n.includes('Zombie Commander', 6)) return 2;
  if (n.includes('Super Archer')) return 2;

  // if (n.includes('Lost Adventurer', 6)) return 3;
  // if (n.includes('Frozen Adventurer', 6)) return 3;
  if (n.includes('Adventurer', 6)) return 3;
  if (n.includes('Angry Archaeologist', 6)) return 3;

  return 4;
}
function matchesMobType(n, e) {
  const c = e.getClass().getSimpleName();
  if (n.includes('Zombie Commander', 6)) return c === 'EntityOtherPlayerMP';
  if (n.includes('Zombie', 6)) return c === 'EntityZombie';
  if (n.includes('Skele', 6)) return c === 'EntitySkeleton';
  if (n.includes('Fels', 6)) return c === 'EntityEnderman';
  if (n.includes('Withermancer', 6)) return c === 'EntitySkeleton' && e.func_82202_m() === 1;
  if (n.includes('Crypt Lurker', 6)) return c === 'EntityZombie';
  if (n.includes('Super Archer', 6)) return c === 'EntitySkeleton';
  if (n.includes('Sniper', 6)) return c === 'EntitySkeleton';
  return c === 'EntityOtherPlayerMP';
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
function entitySpawn(evn) {
  const e = evn.entity;
  const c = e.getClass().getSimpleName();
  if (c === 'EntityArmorStand') {
    if (settings.dungeonHideHealerPowerups) powerupCand.push([Date.now(), e]);
    if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss)) nameCand.push(e);
    if (settings.dungeonCamp && !bloodClosed) possibleSkulls.push(e);
  } else if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss) && isDungeonMob(c)) mobCand.push(e);
}
function toJavaCol(c) {
  return new (Java.type('java.awt.Color'))(((c & 0xFF) << 24) | c >> 8, true);
}

const step2Reg = reg('step', () => {
  if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss)) {
    mobCandBucket.clear();
    mobCand = mobCand.filter(e => {
      if (e.field_70128_L) return false;
      const n = e.func_70005_c_();
      if (n === 'Shadow Assassin') {
        boxMobs.put(e, { yO: 0, h: 2, c: toJavaCol(settings.dungeonBoxSAColor) });
        return false;
      }
      mobCandBucket.add(e.field_70165_t, e.field_70161_v, e);
      return true;
    });
  }
}).setFps(2);

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
  if (settings.dungeonHideHealerPowerups) {
    const t = Date.now();
    powerupCand = powerupCand.filter(v => {
      const e = v[1];
      const n = e.func_70005_c_();
      if (n === 'Armor Stand') {
        let i = e.func_71124_b(4);
        let b = i && i.func_77978_p();
        if (b) {
          const d = b.func_74775_l('ExtraAttributes').func_74779_i('id');
          if (orbIds.some(v => d === v)) {
            hiddenPowerups.add(e);
            hiddenPowerupsBucket.add(e.field_70165_t, e.field_70161_v, e);
            return false;
          }
        }
        i = e.func_71124_b(0);
        b = i && i.func_77978_p();
        if (b && b.func_74775_l('SkullOwner').func_74775_l('Properties').func_150295_c('textures', 10).func_150305_b(0).func_74775_l('Value').func_74775_l('textures').func_74775_l('SKIN').func_74779_i('url') === 'http://textures.minecraft.net/texture/96c3e31cfc66733275c42fcfb5d9a44342d643b55cd14c9c77d273a2352') {
          hiddenPowerups.add(e);
          hiddenPowerupsBucket.add(e.field_70165_t, e.field_70161_v, e);
        }
        return t - v[0] < 500;
      } else if (orbNames.some(v => n.startsWith(v))) {
        hiddenPowerups.add(e);
        hiddenPowerupsBucket.add(e.field_70165_t, e.field_70161_v, e);
      }
      return false;
    });
  }
  if (instaMidProc) {
    if (instaMidProc.isAlive()) {
      instaMidProc.getOutputStream().write(10);
      instaMidProc.getOutputStream().flush();
    } else instaMidProc = void 0;
  }
  isAtDev4 = dist(Player.getX(), 63) + dist(Player.getY(), 127) + dist(Player.getZ(), 35) < 3;
  new Thread(() => {
    if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss)) {
      nameCand.forEach(e => {
        if (e.field_70128_L) return;
        const n = e.func_70005_c_();
        if (n === '§c§cBlood Key' || n === '§6§8Wither Key') {
          boxMobs.put(e, { yO: -1, h: 1, c: toJavaCol(settings.dungeonBoxKeyColor) });
          return;
        }
        if (!n.startsWith('§6✯ ')) return;
        const x = e.field_70165_t;
        const y = e.field_70163_u;
        const z = e.field_70161_v;

        let ents = mobCandBucket.get(e.field_70165_t, e.field_70161_v);
        if (!ents) return;
        ents = ents.filter(v => compareFloat(v.field_70165_t, x, 1) === 0 && compareFloat(v.field_70161_v, z, 1) === 0 && v.field_70163_u < y && y - v.field_70163_u < 5).filter(v => matchesMobType(n, v));
        if (ents.length === 0) return;
        const ent = ents.reduce((a, v) => dist(a.field_70165_t, x) + dist(a.field_70161_v, z) > dist(v.field_70165_t, x) - dist(v.field_70161_v, z) ? v : a, ents[0]);

        let h = 2;
        const t = getBoxMobType(n);
        let c = settings.dungeonBoxMobColor;
        if (t === 1) {
          h = 3;
          c = settings.dungeonBoxFelColor;
        } else if (t === 2) {
          c = settings.dungeonBoxChonkColor;
          if (n.includes('Withermancer', 6)) h = 3;
        } else if (t === 3) {
          c = settings.dungeonBoxMiniColor;
        }
        boxMobs.put(ent, { yO: 0, h, c: toJavaCol(c) });
      });
      nameCand = [];
    }
    if (settings.dungeonMap) {
      map = null;
      const mapI = Player.getInventory()?.getStackInSlot(8);
      if (mapI && mapI.getRegistryName() === 'minecraft:filled_map') {
        map = mapI.item.func_77873_a(mapI.itemStack, World.getWorld());
        if (map && !mapId) mapId = mapI.getMetadata();
      } else if (mapId) map = World.getWorld().func_72943_a(Java.type('net.minecraft.world.storage.MapData').class, 'map_' + mapId);

      const x = roundRoomCoords(Player.getX());
      const z = roundRoomCoords(Player.getZ());
      const k = x + ',' + z;
      if (k === lastRoom) return;
      // TODO: update doors
      // TODO: check if room coords are in same room based on map doors
      lastRoom = k;
    }
  }).start();
});

register('command', () => {
  const obj = {};
  if (map) map.field_76203_h.forEach((k, v) => obj[k] = `${v.func_176110_a()}, ${v.func_176112_b()}, ${v.func_176113_c()}, ${v.func_176111_d()}`);
  logDebug({
    id: mapId,
    data: Array.from(map?.field_76198_e),
    dec: obj
  });
}).setName('csmdump');

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
  bloodMobs.forEach(e => {
    const uuid = e.getUUID().toString();
    if (!motionData.has(uuid)) return;
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
  });
});

function onPuzzleFail(name) {
  let i = name.indexOf(' ');
  if (i < 0) i = name.length;
  if (name.slice(1, i) !== Player.getName()) return;
  // You can't use this command while in combat! (blaze)
  Client.scheduleTask(20, () => execCmd('gfs ARCHITECT_FIRST_DRAFT 1'));
  shitterAlert.show();
}
const puzzleFailReg = reg('chat', onPuzzleFail).setCriteria('&r&c&lPUZZLE FAIL! &r&${name} ${*}');
const quizFailReg = reg('chat', onPuzzleFail).setCriteria('&r&4[STATUE] Oruo the Omniscient&r&f: &r&${name} &r&cchose the wrong answer! I shall never forget this moment of misrememberance.&r');
const architectUseReg = reg('chat', () => shitterAlert.hide()).setCriteria('&r&aYou used the &r&5Architect\'s First Draft${*}');

const necronStartReg = reg('chat', () => {
  necronDragStart = Date.now();
  if (settings.dungeonNecronDragTimer === 'InstaMid' || settings.dungeonNecronDragTimer === 'Both') instaMidProc = runHelper('InstaMidHelper');
}).setCriteria('&r&4[BOSS] Necron&r&c: &r&cYou went further than any human before, congratulations.&r');

const renderEntReg = reg('renderEntity', (e, pos, partial, evn) => {
  if (settings.dungeonHideHealerPowerups && hiddenPowerups.contains(e.entity)) cancel(evn);
});
const renderEntPostReg = reg('postRenderEntity', (e, pos, partial) => {
  if (settings.dungeonBoxMobs && (!isInBoss || !settings.dungeonBoxMobDisableInBoss)) {
    const data = boxMobs.get(e.entity);
    if (data) drawBoxPos(pos.getX(), pos.getY() - data.yO, pos.getZ(), 1, data.h, data.c, partial, settings.dungeonBoxMobEsp, false);
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
      const m = (maxTtl - ttl + getPing() / 50) / maxTtl;
      const br = ((settings.dungeonCampBoxColor >> 24) & 0xFF) / 256;
      const bg = ((settings.dungeonCampBoxColor >> 16) & 0xFF) / 256;
      const bb = ((settings.dungeonCampBoxColor >> 8) & 0xFF) / 256;
      const ba = ((settings.dungeonCampBoxColor >> 0) & 0xFF) / 256;
      const wr = ((settings.dungeonCampWireColor >> 24) & 0xFF) / 256;
      const wg = ((settings.dungeonCampWireColor >> 16) & 0xFF) / 256;
      const wb = ((settings.dungeonCampWireColor >> 8) & 0xFF) / 256;
      const wa = ((settings.dungeonCampWireColor >> 0) & 0xFF) / 256;
      drawFilledBox(x, y + 2.5 - m, z, m, 2 * m, br, bg, bb, ba, settings.dungeonCampBoxEsp);
      if (settings.dungeonCampBoxEsp) drawBoxAtBlock(x - 0.5, y + 1.5, z - 0.5, wr, wg, wb, 1, 2, wa, 3);
      else drawBoxAtBlockNotVisThruWalls(x - 0.5, y + 1.5, z - 0.5, wr, wg, wb, 1, 2, wa, 3);
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
  if (necronDragStart > 0 && (settings.dungeonNecronDragTimer === 'OnScreen' || settings.dungeonNecronDragTimer === 'Both')) {
    const d = 6000 - Date.now() + necronDragStart;
    if (d >= 0) {
      necronDragTimer.setLine(`§l${colorForNumber(d, 6000)}${(d / 1000).toFixed(2)}s`.toString());
      necronDragTimer.render();
    }
  }
});

/**
 * @this typeof mapDisplay
 */
function renderMap() {
  if (!map) return;
  // copy map to screen

  if (settings.dungeonMapRenderHead) renderHeads.call(this);

  const isHoldingLeap = false;
  if (settings.dungeonMapRenderName === 'Always' || (settings.dungeonMapRenderName === 'Holding Leap' && isHoldingLeap)) renderPlayerText.call(this, 'name');
  else if (settings.dungeonMapRenderClass === 'Always' || (settings.dungeonMapRenderClass === 'Holding Leap' && isHoldingLeap)) renderPlayerText.call(this, 'class');
}
/**
 * @this typeof mapDisplay
 */
function renderHeads() {

}
/**
 * @this typeof mapDisplay
 */
function renderPlayerText(type) {
  // draw text with shadow
}
/**
 * @this typeof mapDisplay
 */
function renderMapEdit() {

}
let doors = [];
function renderDoor() {
  doors.forEach(v => {

  });
}

const particleReg = reg('spawnParticle', (part, id, evn) => {
  if (isAtDev4 && (settings.dungeonDev4Helper === 'Particles' || settings.dungeonDev4Helper === 'Both')) return cancel(evn);
  if (!settings.dungeonHideHealerPowerups) return;
  if (id.toString() !== 'REDSTONE') return;
  try {
    // chattriggers :clown:
    // org.mozilla.javascript.WrappedException: Wrapped java.lang.IllegalArgumentException: Color parameter outside of expected range: Green Blue
    const b = part.getColor().getBlue();
    if (b === 0 || b > 10) return;
    if (hiddenPowerupsBucket.get(part.getX(), part.getZ()).some(e => dist(e.field_70165_t, part.getX()) < 1 && dist(e.field_70161_v, part.getZ()) < 1 && dist(e.field_70163_u, part.getY() < 2))) cancel(evn);
  } catch (e) { }
});

const titleReg = reg('renderTitle', (t, s, evn) => {
  if (isAtDev4 && (settings.dungeonDev4Helper === 'Titles' || settings.dungeonDev4Helper === 'Both') && (s === '§aThe gate has been destroyed!§r' || s.includes('activated a'))) return cancel(evn);
});

const mapPacketReg = reg('packetReceived', p => {
  if (map && !mapId) mapId = p.func_149188_c();
}).setFilteredClass(Java.type('net.minecraft.network.play.server.S34PacketMaps'));

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

// const dungeonJoinReq = reg('chat', () => dungeon.emit('dungeonJoin')).setChatCriteria('{"server":"${*}","gametype":"SKYBLOCK","mode":"dungeon","map":"Dungeon"}');
const dungeonStartReg = reg('chat', () => start()).setChatCriteria('&e[NPC] &bMort&f: &rHere, I found this map when I first entered the dungeon.&r');
const dungeonLeaveReg = reg('worldUnload', () => reset());
const bloodOpenReg = reg('chat', () => bloodOpenTime || (bloodOpenTime = Date.now())).setChatCriteria('&r&cThe &r&c&lBLOOD DOOR&r&c has been opened!&r');
const bloodEndReg = reg('chat', () => bloodClosed = true).setCriteria('&r&c[BOSS] The Watcher&r&f: That will be enough for now.&r');
const bossEnterReg = reg('chat', (name, msg) => {
  switch (name) {
    case 'The Watcher':
      if (!bloodOpenTime) bloodOpenTime = Date.now();
      break;
    case 'Scarf':
      if (msg === `How can you move forward when you keep regretting the past?`) break;
      if (msg === `If you win, you live. If you lose, you die. If you don't fight, you can't win.`) break;
      if (msg === `If I had spent more time studying and less time watching anime, maybe mother would be here with me!`) break;
    default:
      isInBoss = true;
  }
}).setChatCriteria('&r&c[BOSS] ${name}&r&f: ${msg}&r');
const bossEndReg = reg('chat', (name, msg) => {
  if (name.endsWith('Livid') && msg === `Impossible! How did you figure out which one I was?!`) onBossEnd();
  switch (name) {
    case 'Bonzo':
      if (msg === `Alright, maybe I'm just weak after all..`) onBossEnd();
      break;
    case 'Scarf':
      if (msg === `Whatever...`) onBossEnd();
      break;
    case 'The Professor':
      if (msg === `What?! My Guardian power is unbeatable!`) onBossEnd();
      break;
    case 'Thorn':
      // if (msg === `This is it... where shall I go now?`) onBossEnd();
      break;
    case 'Sadan':
      if (msg === `Maybe in another life. Until then, meet my ultimate corpse.`) onBossEnd();
      break;
    case 'Necron':
      if (msg === `All this, for nothing...`) onBossEnd();
      break;
    case 'Wither King':
      // if (msg === `Incredible. You did what I couldn't do myself.`) onBossEnd();
      break;
  }
}).setChatCriteria('&r&c[BOSS] ${name}&r&f: ${msg}&r');
// const dungeonEndReg = reg('chat', () => dungeon.emit('dungeonEnd')).setChatCriteria('&r&f                            &r&fTeam Score:').setParameter('START');

export function init() {
  settings._dungeonCampSmoothTime.onAfterChange(v => {
    if (v <= 1000) stepVarReg.setFps(1000 / v);
    else stepVarReg.setDelay(v / 1000);
  });
  settings._moveDungeonMap.onAction(() => mapDisplay.edit());
  settings._moveNecronDragTimer.onAction(() => necronDragTimer.edit());
  settings._dungeonMap.onAfterChange(v => {
    if (v) mapPacketReg.register();
    else mapPacketReg.unregister();
  });
}
export function load() {
  dungeonStartReg.register();
}
export function unload() {
  dungeonStartReg.unregister();
  reset();
}
