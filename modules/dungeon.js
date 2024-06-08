// 🍝
import settings from '../settings';
import data from '../data';
import createGui from '../util/customgui';
import { drawBoxAtBlockNotVisThruWalls, drawBoxAtBlock, drawBoxPos, drawFilledBox, drawLine3D, rgbaToJavaColor, drawString, drawBeaconBeam } from '../util/draw';
import createAlert from '../util/alert';
import reg from '../util/registerer';
import { colorForNumber, execCmd, getPlayerName } from '../util/format';
import getPing from '../util/ping';
import runHelper from '../util/runner';
import createTextGui from '../util/customtextgui';
import { compareFloat, cross, dist, lerp, linReg, normalize, rotate } from '../util/math';
import Grid from '../util/grid';
import { log, logDebug } from '../util/log';
import { StateProp, StateVar } from '../util/state';
import { DelayTimer } from '../util/timers';
import { fromVec3, getItemId, getLowerContainer, toVec3 } from '../util/mc';
import { countItems, getSbId } from '../util/skyblock';

function reset() {
  renderEntReg.unregister();
  renderEntPostReg.unregister();
  renderWorldReg.unregister();
  renderOvlyReg.unregister();
  step2Reg.unregister();
  clientTickReg.unregister();
  serverTickReg.unregister();
  particleReg.unregister();
  titleReg.unregister();
  entSpawnReg.unregister();
  puzzleFailReg.unregister();
  quizFailReg.unregister();
  architectUseReg.unregister();
  necronStartReg.unregister();
  stairBreakReg.unregister();
  terminalsEndReg.unregister();
  goldorDpsStartReg.unregister();
  pickupKeyReg.unregister();
  termCompleteReg.unregister();
  termOpenReg.unregister();
  fm4StartReg.unregister();
  spiritBearSpawnReg.unregister();
  spiritBowDropReg.unregister();

  bloodOpenReg.unregister();
  bossMessageReg.unregister();
  dungeonLeaveReg.unregister();

  shitterAlert.hide();
  if (instaMidProc && instaMidProc.isAlive()) {
    instaMidProc.destroyForcibly();
    instaMidProc = void 0;
  }
}
function start() {
  stateIsInBoss.set(false);
  boxMobs.clear();
  mobCand = [];
  nameCand = [];
  bloodMobs = [];
  possibleSkulls = [];
  bloodX = -1;
  bloodZ = -1;
  bloodMobCount = 0;
  motionData.clear();
  lastSpawnedBloodMob = null;
  map = null;
  mapId = null;
  lastRoom = '';
  bloodOpenTime = 0;
  bloodClosed.set(false);
  powerupCand = [];
  hiddenPowerups.clear();
  hiddenPowerupsBucket.clear();
  necronDragTicks = 0;
  isAtDev4 = false;
  brokenStairBucket.clear();
  players = [];
  isInGoldorDps = false;
  withers = [];
  teamTerms.clear();
  allMobs = [];
  allMobsBucket.clear();
  itemCand = [];
  frozenMobs.clear();
  origGuiSize.set(-1);
  stateInFM4.set(false);

  renderEntReg.register();
  renderEntPostReg.register();
  renderWorldReg.register();
  renderOvlyReg.register();
  step2Reg.register();
  clientTickReg.register();
  serverTickReg.register();
  particleReg.register();
  titleReg.register();
  entSpawnReg.register();
  puzzleFailReg.register();
  quizFailReg.register();
  architectUseReg.register();
  necronStartReg.register();
  stairBreakReg.register();
  terminalsEndReg.register();
  goldorDpsStartReg.register();
  pickupKeyReg.register();
  termCompleteReg.register();
  termOpenReg.register();
  fm4StartReg.register();
  spiritBearSpawnReg.register();
  spiritBowDropReg.register();

  bloodOpenReg.register();
  bossMessageReg.register();
  dungeonLeaveReg.register();

  if (settings.dungeonAutoRefillPearls) {
    const c = settings.dungeonAutoRefillPearlsAmount - countItems('ENDER_PEARL');
    if (c > 0) execCmd('gfs ENDER_PEARL ' + c);
  }
}

const boxMobs = new (Java.type('java.util.WeakHashMap'))();
let mobCand = [];
let nameCand = [];
const mobCandBucket = new Grid();
let bloodMobs = [];
let possibleSkulls = [];
let bloodX = -1;
let bloodZ = -1;
let bloodMobCount = 0;
const motionData = new Map();
const dialogueSkipTimer = createTextGui(() => data.dungeonCampSkipTimerLoc, () => ['§l§23.69s']);
let lastSpawnedBloodMob;
let bloodOpenTime = 0;
let bloodClosed = new StateVar(false);
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
const hiddenPowerupsBucket = new Grid({ addNeighbors: 1 });
const shitterAlert = createAlert('Shitter', 10);
let instaMidProc;
const necronDragTimer = createTextGui(() => data.dungeonNecronDragTimerLoc, () => ['§l§26.42s']);
let necronDragTicks = 0;
let isAtDev4 = false;
const brokenStairBucket = new Grid({ size: 2, addNeighbors: 2 });
let players = [];
const goldorDpsStartAlert = createAlert('DPS!', 10);
let isInGoldorDps = false;
const iceSprayAlert = createAlert('ice spray :O', 10);
let withers = [];
const teamTerms = new Map();
let allMobs = [];
const allMobsBucket = new Grid({ size: 3, addNeighbors: 2 });
let itemCand = [];
let frozenMobs = new (Java.type('java.util.HashMap'))();
const pearlRefillDelay = new DelayTimer(2_000);
const origGuiSize = new StateVar(-1);
const bearSpawnTicks = 70;
const bearParticleHeightCap = 80;
const bearSpawnRadius = 0.8;
const fm4Center = { x: 5.5, y: 69, z: 5.5 };
const spiritBearVars = {
  particles: [],
  ticks: 0,
  est: null,
  estPrev: null,
  prevTime: 0,
  lastY: bearParticleHeightCap,
  updateGrace: Number.POSITIVE_INFINITY
};
const spiritBearGuessDelay = new DelayTimer(settings.dungeonSpiritBearSmoothTime);
const spiritBearTimer = createTextGui(() => data.dungeonSpiritBearTimerLoc, () => ['§l§26.42s']);

const stateIsInBoss = new StateVar(false);
const stateBoxMob = new StateProp(settings._dungeonBoxMobs).and(new StateProp(settings._dungeonBoxMobDisableInBoss).not().or(new StateProp(stateIsInBoss).not()));
const stateCamp = new StateProp(bloodClosed).not().and(settings._dungeonCamp);
const stateMap = new StateProp(settings._dungeonMap).and(new StateProp(settings._dungeonMapHideBoss).not().or(new StateProp(stateIsInBoss).not()));
const stateInFM4 = new StateVar(false);

function isMob(name) {
  return isDungeonMob(name) ||
    name === 'EntityWither' ||
    name === 'EntityGiantZombie' ||
    name === 'EntityIronGolem' ||
    name === 'EntityDragon';
}
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
let entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  const c = e.getClass().getSimpleName();
  if (c === 'EntityArmorStand') {
    if (settings.dungeonHideHealerPowerups) powerupCand.push([Date.now(), e]);
    if (settings.dungeonBoxMobs && !stateIsInBoss.get()) nameCand.push(e);
    if (stateCamp.get()) possibleSkulls.push(e);
  } else {
    if (stateBoxMob.get() && isDungeonMob(c)) {
      mobCand.push(e);
      mobCandBucket.add(e.field_70165_t, e.field_70161_v, e);
    }
    if (settings.dungeonBoxIceSprayed) {
      if (isMob(c)) {
        allMobs.push(e);
        allMobsBucket.add(e.field_70165_t, e.field_70161_v, e);
      }
      else if (c === 'EntityItem') itemCand.push(e);
    }
  }
  if (c === 'EntityOtherPlayerMP' && e.func_110124_au().version() === 4) {
    const p = players.find(v => v.ign === e.func_70005_c_());
    if (p) p.e = new EntityLivingBase(e);
  }
  if (settings.dungeonBoxWither && c === 'EntityWither') withers.push(new EntityLivingBase(e));
}).setEnabled(new StateProp(settings.dungeonHideHealerPowerups).or(stateBoxMob).or(stateCamp).or(settings._dungeonBoxTeammates).or(settings._dungeonGoldorDpsStartAlert).or(settings._dungeonBoxWither).or(settings._dungeonBoxIceSprayed));

const step2Reg = reg('step', () => {
  if (stateBoxMob.get()) {
    mobCandBucket.clear();
    mobCand = mobCand.filter(e => {
      if (e.field_70128_L) return false;
      const n = e.func_70005_c_();
      if (n === 'Shadow Assassin') {
        boxMobs.put(e, { yO: 0, h: 2, c: rgbaToJavaColor(settings.dungeonBoxSAColor) });
        return false;
      }
      mobCandBucket.add(e.field_70165_t, e.field_70161_v, e);
      return true;
    });
  }
  if (settings.dungeonIceSprayAlert && World.getAllEntities().some(e => e.getClassName() === 'EntityArmorStand' && e.getName().includes('Ice Spray Wand'))) iceSprayAlert.show(settings.dungeonIceSprayAlertTime);
  if (settings.dungeonBoxIceSprayed) {
    allMobsBucket.clear();
    allMobs = allMobs.filter(e => {
      if (e.field_70128_L) return false;
      const c = e.getClass().getSimpleName();
      if (c === 'EntityOtherPlayerMP') {
        if (e.func_110124_au().version() === 4) return false;
      } else if (c === 'EntityWither') {
        if (e.func_110138_aP() === 300) return false;
      }
      allMobsBucket.add(e.field_70165_t, e.field_70161_v, e);
      return true;
    });
  }
}).setFps(2).setEnabled(stateBoxMob.or(settings._dungeonIceSprayAlert).or(settings._dungeonBoxIceSprayed));

const clientTickReg = reg('tick', () => {
  if (settings.dungeonCamp) {
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
  if (players.length === 0) {
    const tab = TabList.getNames();
    let expectEmpty = false;
    for (let i = 1; i < tab.length; i++) {
      let s = tab[i];
      if (expectEmpty) {
        if (s !== '§r') break;
        expectEmpty = false;
        continue;
      }
      if (s === '§r' || /^§r§7and \d+ other players\.\.\.§r$/.test(s)) break;
      if (s.startsWith('§r Revive Stones:')) {
        expectEmpty = true;
        continue;
      }
      if (s.startsWith('§r Ultimate:') || s.startsWith('§r         §r§a§lPlayers')) continue;
      let m = s.match(/§r§f\(§r§d(\w+) \w+?§r§f\)§r$/);
      if (!m) break; // "EMPTY"
      players.push({ ign: getPlayerName(s), class: m[1], e: null });
    }
    if (players.length) {
      World.getAllEntities().forEach(v => {
        if (v.getClassName() !== 'EntityOtherPlayerMP') return;
        const player = players.find(p => p.ign === v.getName());
        if (player) player.e = new EntityLivingBase(v.entity);
      });
      const player = players.find(p => p.ign === Player.getName());
      if (player) player.e = Player;
    }
  }
  if (isInGoldorDps && players.every(({ e }) => !e || (e !== Player && e.isDead()) || (e.getX() > 40 && e.getX() < 69 && e.getY() > 110 && e.getY() < 150 && e.getZ() > 53.5 && e.getZ() < 120))) {
    isInGoldorDps = false;
    goldorDpsStartAlert.show(settings.dungeonGoldorDpsStartAlertTime);
  }
  if (settings.dungeonBoxWither) withers = withers.filter(v => !v.isDead() && v.getName() === 'Wither' && v.getMaxHP() !== 300);
  if (settings.dungeonBoxIceSprayed) {
    const hasIce = itemCand.some(e => getItemId(e.func_92059_d()) === 'minecraft:ice');
    itemCand = [];
    if (hasIce) {
      const icers = players.filter(({ e }) => {
        if (!e) return;
        const heldItem = e === Player ? e.getHeldItem() : e.getItemInSlot(0);
        return heldItem && getSbId(heldItem) === 'ICE_SPRAY_WAND';
      });
      const wS = 1;
      const l = 8;
      const ls = l * l;
      const wE = 3.4;
      const n = 5;
      icers.forEach(({ e: p }) => {
        const ent = (p === Player ? p.getPlayer() : p.entity);
        if (!ent) return;
        const look = ent.func_70040_Z();
        const h = rotate(look.field_72450_a, 0, look.field_72449_c, Math.PI / 2, 0, 0);
        // const v = rotate(look.field_72450_a, look.field_72448_b, look.field_72449_c, 0, Math.PI / 2, 0);
        const v = cross(fromVec3(look), h);
        const vs = [];
        const ve = [];
        const hso = toVec3(normalize(h, wS / n));
        const vso = toVec3(normalize(v, wS / n));
        const heo = toVec3(normalize(h, wE / n));
        const veo = toVec3(normalize(v, wE / n));
        vs.push(ent.func_174824_e(1));
        ve.push(toVec3(normalize(fromVec3(look), l)).func_178787_e(vs[0]));
        for (let i = 0; i < n; i++) {
          vs.push(vs[i].func_178787_e(hso));
          ve.push(ve[i].func_178787_e(heo));
        }
        for (let i = 0; i < n; i++) {
          vs.push(vs[i === 0 ? 0 : vs.length - 1].func_178788_d(hso));
          ve.push(ve[i === 0 ? 0 : ve.length - 1].func_178788_d(heo));
        }
        for (let x = 0; x <= n; x++) {
          for (let y = 0; y < n; y++) {
            vs.push(vs[y === 0 ? x : vs.length - 1].func_178787_e(vso));
            ve.push(ve[y === 0 ? x : ve.length - 1].func_178787_e(veo));
          }
        }
        for (let x = 0; x <= n; x++) {
          for (let y = 0; y < n; y++) {
            vs.push(vs[y === 0 ? x : vs.length - 1].func_178788_d(vso));
            ve.push(ve[y === 0 ? x : ve.length - 1].func_178788_d(veo));
          }
        }
        for (let x = 0; x < n; x++) {
          for (let y = 0; y < n; y++) {
            vs.push(vs[y === 0 ? x + n + 1 : vs.length - 1].func_178787_e(vso));
            ve.push(ve[y === 0 ? x + n + 1 : ve.length - 1].func_178787_e(veo));
          }
        }
        for (let x = 0; x < n; x++) {
          for (let y = 0; y < n; y++) {
            vs.push(vs[y === 0 ? x + n + 1 : vs.length - 1].func_178788_d(vso));
            ve.push(ve[y === 0 ? x + n + 1 : ve.length - 1].func_178788_d(veo));
          }
        }
        const pAABB = ent.func_174813_aQ().func_72314_b(0.2, 0, 0.2);
        allMobsBucket.get(p.getX(), p.getZ()).forEach(e => {
          if (
            (ent.field_70165_t - e.field_70165_t) ** 2 +
            (ent.field_70163_u - e.field_70163_u) ** 2 +
            (ent.field_70161_v - e.field_70161_v) ** 2 > ls
          ) return;
          const aabb = e.func_174813_aQ();
          if (aabb.func_72326_a(pAABB) || vs.some((v, i) => aabb.func_72327_a(v, ve[i]))) frozenMobs.put(e, 5 * 20);
        });
      });
    }
  }
  if (settings.dungeonAutoRefillPearlsAmount) {
    const c = countItems('ENDER_PEARL');
    if (
      c < settings.dungeonAutoRefillPearlsThreshold &&
      c < settings.dungeonAutoRefillPearlsAmount &&
      pearlRefillDelay.shouldTick()
    ) Client.scheduleTask(6, () => {
      const inv = Player.getInventory();
      if (!inv) return;
      if (getSbId(inv.getStackInSlot(0)) === 'HAUNT_ABILITY') return;
      const c = countItems('ENDER_PEARL');
      if (c >= settings.dungeonAutoRefillPearlsThreshold || c >= settings.dungeonAutoRefillPearlsAmount) return;
      if (settings.dungeonAutoRefillPearlsGhostPickFix) {
        let pickCount = 0;
        if (inv.getItems().some(v => {
          if (!v) return;
          if (v.getRegistryName().endsWith('_pickaxe')) pickCount++;
          return pickCount === 2;
        })) return;
      }
      execCmd('gfs ENDER_PEARL ' + (settings.dungeonAutoRefillPearlsAmount - c));
    });
  }
  if (origGuiSize.get() >= 0 && !Client.currentGui.get()) {
    Client.settings.video.setGuiScale(origGuiSize.get());
    origGuiSize.set(-1);
  }
  if (stateInFM4.get() && spiritBearVars.ticks === 0) {
    const t = Date.now();
    if (t > spiritBearVars.updateGrace && World.getBlockAt(7, 77, 34).type.getID() === 169) {
      spiritBearVars.prevTime = t;
      spiritBearVars.ticks = bearSpawnTicks;
      const thorn = World.getAllEntities().find(v => v.getClassName() === 'EntityGhast');
      if (!thorn) {
        log('cannot find thorn');
        spiritBearVars.est = spiritBearVars.estPrev = fm4Center;
      } else {
        const d = bearSpawnRadius / Math.hypot(thorn.getX() - fm4Center.x, thorn.getZ() - fm4Center.z);
        spiritBearVars.est = spiritBearVars.estPrev = {
          x: lerp(fm4Center.x, thorn.getX(), d),
          y: fm4Center.y,
          z: lerp(fm4Center.z, thorn.getZ(), d)
        };
      }
    }
  }

  new Thread(() => {
    if (stateBoxMob.get()) {
      nameCand = nameCand.filter(e => {
        if (e.field_70128_L) return;
        const n = e.func_70005_c_();
        if (n === '§c§cBlood Key' || n === '§6§8Wither Key') {
          boxMobs.put(e, { yO: -1, h: 1, c: rgbaToJavaColor(settings.dungeonBoxKeyColor) });
          return;
        }
        if (!n.startsWith('§6✯ ')) return;
        const x = e.field_70165_t;
        const y = e.field_70163_u;
        const z = e.field_70161_v;

        let ents = mobCandBucket.get(e.field_70165_t, e.field_70161_v);
        if (!ents) return true;
        ents = ents.filter(v => compareFloat(v.field_70165_t, x, 1) === 0 && compareFloat(v.field_70161_v, z, 1) === 0 && v.field_70163_u < y && y - v.field_70163_u < 5).filter(v => matchesMobType(n, v));
        if (ents.length === 0) return true;
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
        boxMobs.put(ent, { yO: 0, h, c: rgbaToJavaColor(c) });
      });
    }
    if (stateMap.get()) {
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
}).setEnabled(new StateProp(settings._dungeonCamp).or(settings._dungeonHideHealerPowerups).or(new StateProp(settings._dungeonNecronDragTimer).equalsmult('InstaMid', 'Both')).or(new StateProp(settings._dungeonDev4Helper).notequals('None')).or(stateBoxMob).or(stateMap).or(settings._dungeonBoxTeammates).or(settings._dungeonGoldorDpsStartAlert).or(settings._dungeonBoxWither).or(settings._dungeonBoxIceSprayed).or(new StateProp(settings._dungeonAutoRefillPearlsThreshold).notequals(0).and(settings._dungeonAutoRefillPearls)).or(new StateProp(settings._dungeonTerminalsGuiSize).notequals('Unchanged').and(new StateProp(origGuiSize).equals(-1))).or(stateInFM4));

const serverTickReg = reg('packetReceived', () => {
  if (settings.dungeonCamp) {
    const t = Date.now();
    bloodMobs = bloodMobs.filter(e => {
      const uuid = e.getUUID().toString();
      let data = motionData.get(uuid);
      const x = e.getX();
      const y = e.getY();
      const z = e.getZ();
      if (!data && bloodOpenTime > 0) {
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
        data.posX.push(x);
        data.posY.push(y);
        data.posZ.push(z);
        if (data.ttl <= 0) return void motionData.delete(uuid);
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
  }
  if (necronDragTicks > 0) necronDragTicks--;
  if (settings.dungeonBoxIceSprayed) {
    // const it = frozenMobs.entrySet().iterator();
    // while (it.hasNext()) {
    //   let pair = it.next();
    //   let v = pair.getValue() - 1;
    //   if (v === 0) it.remove();
    //   else it.setValue(v);
    // }
    frozenMobs.entrySet().forEach(p => {
      const v = p.getValue() - 1;
      if (v === 0) frozenMobs.remove(p.getKey());
      else frozenMobs.replace(p.getKey(), v);
    });
  }
  if (stateInFM4.get()) {
    if (spiritBearVars.ticks > 0) spiritBearVars.ticks--;
  }
}).setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction')).setEnabled(new StateProp(settings._dungeonNecronDragTimer).notequals('None').or(settings._dungeonCamp).or(settings._dungeonBoxIceSprayed).or(stateInFM4));

register('command', () => {
  const obj = {};
  if (map) map.field_76203_h.forEach((k, v) => obj[k] = `${v.func_176110_a()}, ${v.func_176112_b()}, ${v.func_176113_c()}, ${v.func_176111_d()}`);
  logDebug({
    id: mapId,
    data: Array.from(map?.field_76198_e),
    dec: obj
  });
}).setName('csmdump');

function onPuzzleFail(name) {
  let i = name.indexOf(' ');
  if (i < 0) i = name.length;
  if (name.slice(1, i) !== Player.getName()) return;
  // You can't use this command while in combat! (blaze)
  // Client.scheduleTask(20, () => execCmd('gfs ARCHITECT_FIRST_DRAFT 1'));
  execCmd('gfs ARCHITECT_FIRST_DRAFT 1');
  shitterAlert.show();
}
const puzzleFailReg = reg('chat', onPuzzleFail).setCriteria('&r&c&lPUZZLE FAIL! &r&${name} ${*}').setEnabled(settings._dungeonAutoArchitect);
const quizFailReg = reg('chat', onPuzzleFail).setCriteria('&r&4[STATUE] Oruo the Omniscient&r&f: &r&${name} &r&cchose the wrong answer! I shall never forget this moment of misrememberance.&r').setEnabled(settings._dungeonAutoArchitect);
const architectUseReg = reg('chat', () => shitterAlert.hide()).setCriteria('&r&aYou used the &r&5Architect\'s First Draft${*}').setEnabled(settings._dungeonAutoArchitect);

const necronStartReg = reg('chat', () => {
  necronDragTicks = settings.dungeonNecronDragDuration;
  if (settings.dungeonNecronDragTimer === 'InstaMid' || settings.dungeonNecronDragTimer === 'Both') instaMidProc = runHelper('InstaMidHelper');
}).setCriteria('&r&4[BOSS] Necron&r&c: &r&cYou went further than any human before, congratulations.&r').setEnabled(new StateProp(settings._dungeonNecronDragTimer).notequals('None'));

const particleReg = reg('spawnParticle', (part, id, evn) => {
  if (isAtDev4 && (settings.dungeonDev4Helper === 'Particles' || settings.dungeonDev4Helper === 'Both')) return cancel(evn);
  const i = id.toString();
  if (i === 'SPELL_MOB' && stateInFM4.get() && spiritBearVars.ticks > 0) {
    const pos = { x: part.getX(), y: part.getY(), z: part.getZ(), t: spiritBearVars.ticks };
    if (pos.y < fm4Center.y || pos.y > spiritBearVars.lastY || Math.hypot(pos.x - fm4Center.x, pos.z - fm4Center.z) > 10) return;

    spiritBearVars.lastY = pos.y;
    spiritBearVars.particles.push(pos);
    if (spiritBearGuessDelay.shouldTick()) {
      const { r: rX, b: bX } = linReg(spiritBearVars.particles.map(v => [v.t, v.x]));
      const { r: rZ, b: bZ } = linReg(spiritBearVars.particles.map(v => [v.t, v.z]));

      const d = bearSpawnRadius / Math.hypot(bX - fm4Center.x, bZ - fm4Center.z);
      spiritBearVars.estPrev = spiritBearVars.est;
      spiritBearVars.est = {
        x: lerp(fm4Center.x, bX, d),
        y: fm4Center.y,
        z: lerp(fm4Center.z, bZ, d)
      };
    }
  }
  if (i === 'REDSTONE' && settings.dungeonHideHealerPowerups) {
    try {
      // chattriggers :clown:
      // org.mozilla.javascript.WrappedException: Wrapped java.lang.IllegalArgumentException: Color parameter outside of expected range: Green Blue
      const b = part.getColor().getBlue();
      if (b === 0 || b > 10) return;
      if (hiddenPowerupsBucket.get(part.getX(), part.getZ()).some(e => dist(e.field_70165_t, part.getX()) < 1 && dist(e.field_70161_v, part.getZ()) < 1 && dist(e.field_70163_u, part.getY() < 2))) cancel(evn);
    } catch (e) { }
  }
}).setEnabled(new StateProp(settings._dungeonDev4Helper).equalsmult('Particles', 'Both').or(settings._dungeonHideHealerPowerups).or(stateInFM4));

const titleReg = reg('renderTitle', (t, s, evn) => {
  if (isAtDev4 && (s === '§aThe gate has been destroyed!§r' || s.includes('activated a'))) return cancel(evn);
}).setEnabled(new StateProp(settings._dungeonDev4Helper).equalsmult('Titles', 'Both'));

const BlockStairs = Java.type('net.minecraft.block.BlockStairs');
const stairBreakReg = reg('blockBreak', b => {
  if (!(b.type.mcBlock instanceof BlockStairs)) return;
  const x = b.getX();
  const y = b.getY();
  const z = b.getZ();
  const n = x * 631 * 631 + y * 631 + z;
  if (brokenStairBucket.get(x, z).some(v => v[0] === n)) return;
  switch (b.getMetadata()) {
    case 0:
      brokenStairBucket.add(x, z, [n, [x + 0.24, y + 1.1, z], [x + 0.24, y + 1.1, z + 1]]);
      break;
    case 1:
      brokenStairBucket.add(x, z, [n, [x + 0.76, y + 1.1, z], [x + 0.76, y + 1.1, z + 1]]);
      break;
    case 2:
      brokenStairBucket.add(x, z, [n, [x, y + 1.1, z + 0.24], [x + 1, y + 1.1, z + 0.24]]);
      break;
    case 3:
      brokenStairBucket.add(x, z, [n, [x, y + 1.1, z + 0.76], [x + 1, y + 1.1, z + 0.76]]);
      break;
  }
}).setEnabled(settings._dungeonStairStonkHelper);

const terminalsEndReg = reg('chat', () => {
  if (settings.dungeonGoldorDpsStartAlert) isInGoldorDps = true;
  if (settings.dungeonTerminalBreakdown) {
    log('Terminals Breakdown:');
    Array.from(teamTerms.entries()).sort((a, b) => b[1].terminal - a[1].terminal).forEach(([ign, data]) => log(`&b${ign}&r: Terminal x&a${data.terminal}&r | Lever x&a${data.lever}&r | Device x&a${data.device}`));
  }
}).setCriteria('&r&aThe Core entrance is opening!&r').setEnabled(new StateProp(settings._dungeonGoldorDpsStartAlert).or(settings._dungeonTerminalBreakdown));

const goldorDpsStartReg = reg('chat', () => isInGoldorDps = false).setCriteria('&r&4[BOSS] Goldor&r&c: &r&cYou have done it, you destroyed the factory…&r').setEnabled(settings._dungeonGoldorDpsStartAlert);

const SecretSounds = Java.type('dulkirmod.features.dungeons.SecretSounds');
const pickupKeyReg = reg('chat', () => {
  SecretSounds.INSTANCE.playSound();
}).setCriteria('&r&e&lRIGHT CLICK &r&7on ${*} to open it. This key can only be used to open &r&a1&r&7 door!&r').setEnabled(new StateProp(Boolean(SecretSounds)).and(settings._dungeonPlaySoundKey));

const termCompleteReg = reg('chat', (name, type) => {
  const ign = getPlayerName(name);
  let data = teamTerms.get(ign);
  if (!data) teamTerms.set(ign, data = {
    terminal: 0,
    lever: 0,
    device: 0
  });
  data[type]++;
}).setCriteria(/^&r(.+?)&a (?:completed|activated) a (.+?)! \(&r&c\d&r&a\/(?:7|8)\)&r$/).setEnabled(settings._dungeonTerminalBreakdown);

const termOpenReg = reg('guiOpened', evn => {
  const gui = evn.gui;
  if (gui.getClass().getSimpleName() !== 'GuiChest') return;
  // net.minecraft.client.player.inventory.ContainerLocalMenu
  const inv = getLowerContainer(gui);
  const name = inv.func_70005_c_();
  if (!(
    name === 'Change all to same color!' ||
    name === 'Click in order!' ||
    name === 'Correct all the panes!' ||
    name === 'Click the button on time!' ||
    name.startsWith('Select all the') ||
    name.startsWith('What starts with:')
  )) return;

  origGuiSize.set(Client.settings.video.getGuiScale());
  Client.settings.video.setGuiScale(function() {
    switch (settings.dungeonTerminalsGuiSize) {
      case 'Small': return 1;
      case 'Normal': return 2;
      case 'Large': return 3;
      case '4x': return 4;
      case '5x': return 5;
      case 'Auto': return 0;
    }
  }());
}).setEnabled(new StateProp(settings._dungeonTerminalsGuiSize).notequals('Unchanged').and(new StateProp(origGuiSize).equals(-1)));

function resetFM4Vars() {
  spiritBearVars.particles = [];
  spiritBearVars.ticks = 0;
  spiritBearVars.est = null;
  spiritBearVars.estPrev = null;
  spiritBearVars.prevTime = 0;
  spiritBearVars.lastY = bearParticleHeightCap;
  spiritBearVars.updateGrace = Number.POSITIVE_INFINITY;
}
const fm4StartReg = reg('chat', () => stateInFM4.set(true)).setCriteria('&r&c[BOSS] Thorn&r&f: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!&r').setEnabled(settings._dungeonSpiritBearHelper);

const spiritBearSpawnReg = reg('chat', () => {
  resetFM4Vars();
  spiritBearVars.ticks = -1;
}).setCriteria('&r&a&lA &r&5&lSpirit Bear &r&a&lhas appeared!&r').setEnabled(stateInFM4);
const spiritBowDropReg = reg('chat', () => {
  spiritBearVars.ticks = 0;
  spiritBearVars.updateGrace = Date.now() + 1000;
}).setCriteria('&r&a&lThe &r&5&lSpirit Bow &r&a&lhas dropped!&r').setEnabled(stateInFM4);

const renderEntReg = reg('renderEntity', (e, pos, partial, evn) => {
  if (hiddenPowerups.contains(e.entity)) cancel(evn);
}).setEnabled(settings._dungeonHideHealerPowerups);
const renderEntPostReg = reg('postRenderEntity', (e, pos, partial) => {
  const data = boxMobs.get(e.entity);
  if (data) drawBoxPos(pos.getX(), pos.getY() - data.yO, pos.getZ(), 1, data.h, data.c, partial, settings.dungeonBoxMobEsp, false);
}).setEnabled(stateBoxMob);

const renderWorldReg = reg('renderWorld', partial => {
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
  }
  if (settings.dungeonMap) {
    if (settings.dungeonMapBoxDoors) renderDoor();
  }
  if (settings.dungeonStairStonkHelper) {
    brokenStairBucket.get(Player.getX(), Player.getZ()).forEach(v => {
      // average rhino L
      // java.lang.ClassCastException: java.lang.Boolean cannot be cast to [Ljava.lang.Object;
      // drawLine(settings.dungeonStairStonkHelperColor, ...v[1], ...v[2], 2);
      drawLine3D(
        settings.dungeonStairStonkHelperColor,
        v[1][0], v[1][1], v[1][2],
        v[2][0], v[2][1], v[2][2],
        2
      );
    });
  }
  if (settings.dungeonM7LBWaypoints && Player.getY() < 50) {
    drawBeaconBeam(27, 0, 56, 1, 0, 0, 1, true, 17);
    drawBeaconBeam(56, 0, 124, 0.5, 0, 0.5, 1, true, 17);
    drawBeaconBeam(82, 0, 56, 1, 0.5, 0, 1, true, 17);
    drawBeaconBeam(82, 0, 96, 0, 0, 1, 1, true, 17);
    drawBeaconBeam(27, 0, 92, 0, 1, 0, 1, true, 17);
  }
  if (settings.dungeonBoxTeammates) {
    players.forEach(v => {
      if (!v.e) return;
      if (v.e === Player) {
        if (!settings.dungeonBoxTeammatesBoxSelf) return;
        if (Client.settings.getSettings().field_74320_O === 0) return;
      } else if (v.e.isDead()) return;
      const x = v.e.getRenderX();
      const y = v.e.getRenderY();
      const z = v.e.getRenderZ();
      const c = settings[`dungeonBoxTeammates${v.class.slice(0, 4)}Color`] ?? settings.boxAllEntitiesColor;
      const r = ((c >> 24) & 0xFF) / 256;
      const g = ((c >> 16) & 0xFF) / 256;
      const b = ((c >> 8) & 0xFF) / 256;
      const a = ((c >> 0) & 0xFF) / 256;
      if (settings.dungeonBoxTeammatesEsp) drawBoxAtBlock(x - 0.4, y, z - 0.4, r, g, b, 0.8, 2, a, 5);
      else drawBoxAtBlockNotVisThruWalls(x - 0.4, y, z - 0.4, r, g, b, 0.8, 2, a, 5);
    });
  }
  if (settings.dungeonBoxWither) {
    const r = ((settings.dungeonBoxWitherColor >> 24) & 0xFF) / 256;
    const g = ((settings.dungeonBoxWitherColor >> 16) & 0xFF) / 256;
    const b = ((settings.dungeonBoxWitherColor >> 8) & 0xFF) / 256;
    const a = ((settings.dungeonBoxWitherColor >> 0) & 0xFF) / 256;
    withers.forEach(e => {
      const x = e.getRenderX();
      const y = e.getRenderY();
      const z = e.getRenderZ();
      if (settings.dungeonBoxWitherEsp) drawBoxAtBlock(x - 0.75, y - 0.25, z - 0.75, r, g, b, 1.5, 4, a, 5);
      else drawBoxAtBlockNotVisThruWalls(x - 0.75, y - 0.25, z - 0.75, r, g, b, 1.5, 4, a, 5);
    })
  }
  if (settings.dungeonBoxIceSprayed) {
    const or = ((settings.dungeonBoxIceSprayedOutlineColor >> 24) & 0xFF) / 256;
    const og = ((settings.dungeonBoxIceSprayedOutlineColor >> 16) & 0xFF) / 256;
    const ob = ((settings.dungeonBoxIceSprayedOutlineColor >> 8) & 0xFF) / 256;
    const oa = ((settings.dungeonBoxIceSprayedOutlineColor >> 0) & 0xFF) / 256;
    const fr = ((settings.dungeonBoxIceSprayedFillColor >> 24) & 0xFF) / 256;
    const fg = ((settings.dungeonBoxIceSprayedFillColor >> 16) & 0xFF) / 256;
    const fb = ((settings.dungeonBoxIceSprayedFillColor >> 8) & 0xFF) / 256;
    const fa = ((settings.dungeonBoxIceSprayedFillColor >> 0) & 0xFF) / 256;
    frozenMobs.keySet().forEach(e => {
      if (e.field_70128_L) return;
      const x = lerp(e.field_70169_q, e.field_70165_t, partial);
      const y = lerp(e.field_70167_r, e.field_70163_u, partial);
      const z = lerp(e.field_70166_s, e.field_70161_v, partial);
      const w = e.field_70130_N + 0.2;
      const h = e.field_70131_O + 0.2;
      if (settings.dungeonBoxIceSprayedEsp) drawBoxAtBlock(x - w / 2, y, z - w / 2, or, og, ob, w, h, oa, 5);
      else drawBoxAtBlockNotVisThruWalls(x - w / 2, y, z - w / 2, or, og, ob, w, h, oa, 5);

      drawFilledBox(x, y, z, w, h, fr, fg, fb, fa, settings.dungeonBoxIceSprayedEsp);
    });
  }
  if (stateInFM4.get() && spiritBearVars.est) {
    const dt = Date.now() - spiritBearVars.prevTime;
    let x;
    let y;
    let z;
    if (dt > settings.dungeonSpiritBearSmoothTime) {
      x = spiritBearVars.est.x;
      y = spiritBearVars.est.y;
      z = spiritBearVars.est.z;
    } else {
      const smoothFactor = dt / settings.dungeonSpiritBearSmoothTime;
      x = lerp(spiritBearVars.estPrev.x, spiritBearVars.est.x, smoothFactor);
      y = lerp(spiritBearVars.estPrev.y, spiritBearVars.est.y, smoothFactor);
      z = lerp(spiritBearVars.estPrev.z, spiritBearVars.est.z, smoothFactor);
    }
    const br = ((settings.dungeonSpiritBearBoxColor >> 24) & 0xFF) / 256;
    const bg = ((settings.dungeonSpiritBearBoxColor >> 16) & 0xFF) / 256;
    const bb = ((settings.dungeonSpiritBearBoxColor >> 8) & 0xFF) / 256;
    const ba = ((settings.dungeonSpiritBearBoxColor >> 0) & 0xFF) / 256;
    const wr = ((settings.dungeonSpiritBearWireColor >> 24) & 0xFF) / 256;
    const wg = ((settings.dungeonSpiritBearWireColor >> 16) & 0xFF) / 256;
    const wb = ((settings.dungeonSpiritBearWireColor >> 8) & 0xFF) / 256;
    const wa = ((settings.dungeonSpiritBearWireColor >> 0) & 0xFF) / 256;
    const m = (bearSpawnTicks - spiritBearVars.ticks - Tessellator.partialTicks + getPing() / 50) / bearSpawnTicks;
    drawFilledBox(x, y + 1 - m, z, m, 2 * m, br, bg, bb, ba, settings.dungeonSpiritBearBoxEsp);
    if (settings.dungeonSpiritBearBoxEsp) drawBoxAtBlock(x - 0.5, y, z - 0.5, wr, wg, wb, 1, 2, wa, 3);
    else drawBoxAtBlockNotVisThruWalls(x - 0.5, y, z - 0.5, wr, wg, wb, 1, 2, wa, 3);

    if (settings.dungeonSpiritBearTimer) drawString(((spiritBearVars.ticks - Tessellator.partialTicks) / 20).toFixed(2), x, y + 2.5, z);
  }
}).setEnabled(new StateProp(settings._dungeonCamp).or(settings._dungeonMap).or(settings._dungeonStairStonkHelper).or(settings._dungeonM7LBWaypoints).or(settings._dungeonBoxTeammates).or(settings._dungeonBoxWither).or(settings._dungeonBoxIceSprayed).or(stateInFM4));

const renderOvlyReg = reg('renderOverlay', () => {
  if (settings.dungeonMap) {
    mapDisplay.render();
  }
  if (necronDragTicks > 0 && (settings.dungeonNecronDragTimer === 'OnScreen' || settings.dungeonNecronDragTimer === 'Both')) {
    const d = necronDragTicks * 50;
    necronDragTimer.setLine(`§l${colorForNumber(d, settings.dungeonNecronDragDuration * 50)}${(d / 1000).toFixed(2)}s`.toString());
    necronDragTimer.render();
  }
  if (settings.dungeonCampSkipTimer && lastSpawnedBloodMob && lastSpawnedBloodMob.ttl) {
    const d = (lastSpawnedBloodMob.ttl + 1 - Tessellator.partialTicks) * 50;
    dialogueSkipTimer.setLine(`§l${colorForNumber(d, 4000)}${(d / 1000).toFixed(2)}s`.toString());
    dialogueSkipTimer.render();
  }
  if (settings.dungeonSpiritBearTimerHud && stateInFM4.get() && spiritBearVars.ticks > 0) {
    const d = (spiritBearVars.ticks + 1 - Tessellator.partialTicks) * 50;
    spiritBearTimer.setLine(`§l${colorForNumber(d, bearSpawnTicks * 50)}${(d / 1000).toFixed(2)}s`.toString());
    spiritBearTimer.render();
  }
}).setEnabled(new StateProp(settings._dungeonNecronDragTimer).equalsmult('OnScreen', 'Both').or(settings._dungeonMap).or(stateCamp.and(settings._dungeonCampSkipTimer)).or(new StateProp(settings._dungeonSpiritBearTimerHud).and(stateInFM4)));

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

const mapPacketReg = reg('packetReceived', p => {
  if (map && !mapId) mapId = p.func_149188_c();
}).setFilteredClass(Java.type('net.minecraft.network.play.server.S34PacketMaps')).setEnabled(settings._dungeonMap);

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
    hecAlert.show(settings.dungeonHecatombAlertTime);
  }
}

// const dungeonJoinReq = reg('chat', () => dungeon.emit('dungeonJoin')).setChatCriteria('{"server":"${*}","gametype":"SKYBLOCK","mode":"dungeon","map":"Dungeon"}');
const dungeonStartReg = reg('chat', () => start()).setChatCriteria('&e[NPC] &bMort&f: &rHere, I found this map when I first entered the dungeon.&r');
const dungeonLeaveReg = reg('worldUnload', () => reset());
const bloodOpenReg = reg('chat', () => bloodOpenTime || (bloodOpenTime = Date.now())).setChatCriteria('&r&cThe &r&c&lBLOOD DOOR&r&c has been opened!&r').setEnabled(stateCamp)
const bossMessageReg = reg('chat', (name, msg) => {
  if (name.endsWith('Livid') && msg === `Impossible! How did you figure out which one I was?!`) onBossEnd();
  switch (name) {
    case 'The Watcher':
      if (msg === 'That will be enough for now.') bloodClosed.set(true);
      if (msg === 'You have proven yourself. You may pass.') bloodClosed.set(true);
      if (msg === 'Let\'s see how you can handle this.') bloodMobCount = 4;
      if (!bloodOpenTime) bloodOpenTime = Date.now();
      return;
    case 'Bonzo':
      if (msg === `Alright, maybe I'm just weak after all..`) onBossEnd();
      break;
    case 'Scarf':
      if (msg === `Whatever...`) onBossEnd();
      if (msg === `How can you move forward when you keep regretting the past?`) return;
      if (msg === `If you win, you live. If you lose, you die. If you don't fight, you can't win.`) return;
      if (msg === `If I had spent more time studying and less time watching anime, maybe mother would be here with me!`) return;
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
  stateIsInBoss.set(true);
}).setChatCriteria('&r&c[BOSS] ${name}&r&f: ${msg}&r');
// const dungeonEndReg = reg('chat', () => dungeon.emit('dungeonEnd')).setChatCriteria('&r&f                            &r&fTeam Score:').setParameter('START');

export function init() {
  settings._moveDungeonMap.onAction(() => mapDisplay.edit());
  settings._dungeonHecatombAlertSound.onAfterChange(v => hecAlert.sound = v);
  settings._moveNecronDragTimer.onAction(() => necronDragTimer.edit());
  settings._moveDungeonCampSkipTimer.onAction(() => dialogueSkipTimer.edit());
  settings._dungeonGoldorDpsStartAlertSound.onAfterChange(v => goldorDpsStartAlert.sound = v);
  settings._dungeonPlaySoundKey.onAfterChange(v => v && !SecretSounds && log('Dulkir not found. (will not work)'));
  settings._dungeonIceSprayAlertSound.onAfterChange(v => iceSprayAlert.sound = v);
  settings._dungeonSpiritBearSmoothTime.onAfterChange(v => spiritBearGuessDelay.delay = v);
  settings._moveSpiritBearTimerHud.onAction(() => spiritBearTimer.edit());
}
export function load() {
  dungeonStartReg.register();
}
export function unload() {
  dungeonStartReg.unregister();
  reset();
}
