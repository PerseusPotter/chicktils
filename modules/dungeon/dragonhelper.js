import settings from '../../settings';
import data from '../../data';
import { drawArrow3DPos, getPartialServerTick } from '../../util/draw';
import createAlert from '../../util/alert';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import createTextGui from '../../util/customtextgui';
import { log } from '../../util/log';
import { AtomicStateVar, StateProp, StateVar } from '../../util/state';
import { getPlayers, registerTrackPlayers, stateFloor, stateIsInBoss, statePlayerClass } from '../dungeon.js';
import { fastDistance, lerp } from '../../util/math';
import { getRenderX, getRenderY, getRenderZ, renderBillboardString, renderBoxFilled, renderTracer } from '../../../Apelles/index';
import { getMedianPing } from '../../util/ping';
import { toArrayList } from '../../util/polyfill';

const stateDragonHelper = new StateProp(stateFloor).equals('M7').and(stateIsInBoss).and(settings._dungeonDragonHelper);
const stateInP5 = new StateVar(false);
const stateDragonHelperActive = stateDragonHelper.and(stateInP5);
const stateDragonHelperHits = stateDragonHelperActive.and(new StateProp(settings._dungeonDragonHelperTrackHits).notequals('None'));
const stateDragon = new StateVar();
const stateDragonHelperTrackHits = stateDragonHelperHits.and(stateDragon);
const stateDragonHelperAim = stateDragonHelperActive.and(settings._dungeonDragonHelperShowStackAimer).and(new StateProp(statePlayerClass).customBinary(settings._dungeonDragonHelperShowStackClass, (c, s) => c === 'Unknown' || s.includes(c[0].toLowerCase())));
const stateDragonHelperStackRunTimer = stateDragonHelperAim.and(settings._dungeonDragonHelperStackTimeUntilRun);

/** @typedef {'r' | 'o' | 'b' | 'p' | 'g'} DragonType */
/** @type {Map<DragonType, number>} */
const spawnedDrags = new Map();
const spawnAlert = createAlert('', 5, settings.dungeonDragonHelperAlertSound);
let dragonCount = 0;
const timerHud = createTextGui(() => data.dragonHelperTimer, () => ['&24269']);
const runTimerHud = createTextGui(() => data.dragonHelperStackRunTimer, () => ['&24269']);
/** @typedef {{ color: string, pos: number[], name: string, path: any }} DragonInfo */
/** @type {{ [k in DragonType]: DragonInfo }} */
const DRAGONS = {
  r: {
    color: '&c',
    pos: [32, 20, 59],
    name: 'POWER',
    path: toArrayList([
      [864, 448, 1888],
      [879, 467, 1880],
      [886, 476, 1876],
      [894, 486, 1872],
      [902, 495, 1868],
      [909, 505, 1865],
      [917, 514, 1861],
      [925, 524, 1857],
      [932, 533, 1853],
      [940, 543, 1849],
      [947, 552, 1846],
      [963, 572, 1838],
      [978, 591, 1830],
      [987, 591, 1821],
      [995, 592, 1811],
      [1004, 592, 1802],
      [1013, 593, 1793],
      [1021, 593, 1783],
      [1030, 594, 1774],
      [1038, 594, 1764],
      [1047, 595, 1755],
      [1056, 595, 1745],
      [1064, 596, 1736],
      [1073, 597, 1726],
      [1082, 597, 1717],
      [1090, 598, 1708],
      [1099, 598, 1698],
      [1107, 599, 1689],
      [1116, 599, 1679],
      [1125, 600, 1670],
    ].map(v => [v[0] / 32, v[1] / 32 + 4, v[2] / 32]).map(v => toArrayList(v)))
  },
  o: {
    color: '&6',
    pos: [80, 20, 56],
    name: 'FLAME',
    path: toArrayList([
      [2720, 448, 1792],
      [2710, 455, 1796],
      [2700, 462, 1800],
      [2690, 469, 1804],
      [2680, 476, 1808],
      [2670, 483, 1813],
      [2660, 490, 1817],
      [2651, 497, 1821],
      [2641, 504, 1825],
      [2631, 511, 1829],
      [2621, 518, 1834],
      [2611, 525, 1838],
      [2601, 532, 1842],
      [2592, 539, 1846],
      [2582, 546, 1851],
      [2572, 553, 1855],
      [2562, 560, 1859],
      [2552, 567, 1863],
      [2542, 574, 1867],
      [2533, 581, 1872],
      [2523, 588, 1876],
      [2513, 595, 1880],
      [2516, 595, 1892],
      [2520, 596, 1905],
      [2523, 596, 1917],
      [2527, 596, 1929],
      [2530, 597, 1942],
      [2533, 597, 1954],
      [2537, 597, 1966],
      [2540, 597, 1979],
      [2543, 598, 1991],
      [2547, 598, 2003],
    ].map(v => [v[0] / 32, v[1] / 32 + 4, v[2] / 32]).map(v => toArrayList(v)))
  },
  b: {
    color: '&b',
    pos: [79, 20, 94],
    name: 'ICE',
    path: toArrayList([
      [2688, 448, 3008],
      [2683, 452, 3019],
      [2678, 457, 3030],
      [2674, 461, 3041],
      [2669, 466, 3052],
      [2665, 470, 3063],
      [2660, 475, 3074],
      [2655, 480, 3085],
      [2651, 484, 3096],
      [2646, 489, 3107],
      [2642, 493, 3118],
      [2637, 498, 3129],
      [2632, 503, 3140],
      [2628, 507, 3151],
      [2623, 512, 3162],
      [2619, 516, 3173],
      [2614, 521, 3184],
      [2609, 526, 3195],
      [2605, 530, 3206],
      [2600, 535, 3217],
      [2596, 539, 3228],
      [2591, 544, 3239],
      [2586, 549, 3250],
      [2582, 553, 3261],
      [2577, 558, 3272],
      [2573, 562, 3283],
      [2568, 567, 3294],
      [2563, 572, 3305],
      [2559, 576, 3316],
      [2554, 581, 3327],
      [2550, 585, 3338],
      [2545, 590, 3349],
    ].map(v => [v[0] / 32, v[1] / 32 + 4, v[2] / 32]).map(v => toArrayList(v)))
  },
  p: {
    color: '&d',
    pos: [56, 20, 128],
    name: 'SOUL',
    path: toArrayList([
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
      [1792, 448, 4000],
    ].map(v => [v[0] / 32, v[1] / 32 + 4, v[2] / 32]).map(v => toArrayList(v)))
  },
  g: {
    color: '&a',
    pos: [32, 20, 94],
    name: 'APEX',
    path: toArrayList([
      [864, 448, 3008],
      [858, 456, 2984],
      [855, 461, 2972],
      [853, 465, 2961],
      [850, 470, 2949],
      [847, 474, 2937],
      [845, 479, 2926],
      [842, 483, 2914],
      [839, 488, 2902],
      [837, 492, 2891],
      [834, 497, 2879],
      [831, 501, 2867],
      [828, 506, 2856],
      [826, 510, 2844],
      [823, 515, 2832],
      [820, 519, 2821],
      [818, 524, 2809],
      [815, 528, 2797],
      [812, 533, 2786],
      [810, 537, 2774],
      [807, 542, 2762],
      [804, 546, 2751],
      [802, 551, 2739],
      [799, 555, 2727],
      [796, 560, 2716],
      [793, 564, 2704],
      [791, 569, 2692],
      [788, 573, 2680],
      [785, 578, 2669],
      [783, 582, 2657],
    ].map(v => [v[0] / 32, v[1] / 32 + 4, v[2] / 32]).map(v => toArrayList(v)))
  }
};
/** @type {DragonType} */
let currDragPrio;
let isHighDragon = false;
let hitTimes = [0];
let prevBestTarget = 0;
/** @type {[number, number, number]?} */
let aimPosition;

const tickReg = reg('tick', () => stateInP5.set(Player.getY() < 30)).setEnabled(stateDragonHelper);
/**
 * @param {DragonType} d1
 * @param {DragonType} d2
 * @param {string} bersTeam
 * @param {string} prio
 * @param {string} role
 * @returns {DragonType}
 */
function getSplitDrag(d1, d2, bersTeam, prio, role) {
  const i1 = prio.indexOf(d1);
  const i2 = prio.indexOf(d2);
  if (bersTeam.includes(role)) return i1 < i2 ? d1 : d2;
  return i1 > i2 ? d1 : d2;
}
/** @param {DragonType} c */
function addDragon(c) {
  if (spawnedDrags.has(c)) return;
  spawnedDrags.set(c, 100);
  prevBestTarget = 0;
  aimPosition = null;

  let dragD = DRAGONS[c];
  currDragPrio = c;
  if (++dragonCount === 2) {
    const drags = Array.from(spawnedDrags.keys());
    const role = getPlayers()[0]?.['class'];
    if (!role) return log('&4failed to parse class');
    const drag = getSplitDrag(
      drags[0], drags[1],
      settings.dungeonDragonHelperSplit ? settings.dungeonDragonHelperBersTeam : 'bmhat',
      settings.dungeonDragonHelperSplit ? settings.dungeonDragonHelperPrioS : settings.dungeonDragonHelperPrioNS,
      role[0].toLowerCase()
    );
    dragD = DRAGONS[drag];
    currDragPrio = drag;
    if (settings.dungeonDragonHelperAlert === 'None') return;
  } else if (settings.dungeonDragonHelperAlert !== 'All') return;

  spawnAlert.text = `&l${dragD.color}${dragD.name}` + (isHighDragon ? ' HIGH' : '');
  spawnAlert.show(settings.dungeonDragonHelperAlertTime);
}
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const partSpawnReg = reg('packetReceived', pack => {
  if (
    pack.func_149222_k() !== 20 ||
    (
      pack.func_149226_e() !== 19 &&
      pack.func_149226_e() !== 27
    ) ||
    !pack.func_179749_a().equals(EnumParticleTypes.FLAME) ||
    pack.func_149221_g() !== 2 ||
    pack.func_149224_h() !== 3 ||
    pack.func_149223_i() !== 2 ||
    pack.func_149227_j() !== 0 ||
    !pack.func_179750_b()
  ) return;
  isHighDragon = pack.func_149226_e() === 27;

  const x = Math.trunc(pack.func_149220_d());
  const z = Math.trunc(pack.func_149225_f());
  if (x >= 27 && x <= 32) {
    if (z === 59) addDragon('r');
    else if (z === 94) addDragon('g');
  } else if (x >= 79 && x <= 85) {
    if (z === 94) addDragon('b');
    else if (z === 56) addDragon('o');
  } else if (x === 56) addDragon('p');
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(stateDragonHelperActive);
const serverTickReg = reg('serverTick', () => {
  spawnedDrags.forEach((v, k) => {
    if (v > -60) spawnedDrags.set(k, v - 1);
    else spawnedDrags.delete(k);
  });
}).setEnabled(stateDragonHelperActive);
const renderWorldReg = reg('renderWorld', () => {
  spawnedDrags.forEach((v, k) => {
    if (v < 0) return;
    const drag = DRAGONS[k];
    const t = (v - getPartialServerTick()) * 50;
    renderBillboardString(0xFFFFFFFF, `${colorForNumber(t, 5000)}${t.toFixed(0)}`, drag.pos[0], drag.pos[1], drag.pos[2], { scale: 10, blackBox: 0, phase: true });
  });
}).setEnabled(stateDragonHelperActive.and(settings._dungeonDragonHelperTimer3D));
const renderOverlayReg = reg('renderOverlay', () => {
  const ticks = spawnedDrags.values().next().value;
  if (!ticks || ticks < 0) return;

  const t = (ticks - getPartialServerTick()) * 50;
  timerHud.setLine(colorForNumber(t, 5000) + t.toFixed(0));
  timerHud.render();
}).setEnabled(stateDragonHelperActive.and(settings._dungeonDragonHelperTimer2D));
const EntityDragon = Java.type('net.minecraft.entity.boss.EntityDragon');
const dragonSpawnReg = reg('spawnEntity', ent => {
  if (ent instanceof EntityDragon) {
    const drag = DRAGONS[currDragPrio];
    if (fastDistance(
      drag.pos[0] - ent.field_70165_t,
      drag.pos[2] - ent.field_70161_v
    ) > 10) return;
    stateDragon.set(ent);
    hitTimes = [0];
  }
}).setEnabled(stateDragonHelperHits);
function formatTime(ticks) {
  switch (settings.dungeonDragonHelperTrackHitsTimeUnit) {
    case 'Ticks': return `${ticks} ticks`;
    case 'Seconds': return `${(ticks / 20).toFixed(2)}s`;
    case 'Both': return `${(ticks / 20).toFixed(2)}s (${ticks} ticks)`;
  }
  return ticks.toString();
}
const serverTickHitReg = reg('serverTick', () => {
  const drag = stateDragon.get();
  if (drag.field_70128_L || drag.func_110143_aJ() <= 0 || hitTimes.length >= 4 * 20) {
    const d = DRAGONS[currDragPrio];
    let endI = 0;
    let sum = 0;
    let stack = 0;
    const isDB = ['Healer', 'Tank', 'Mage'].includes(getPlayers()[0]?.['class']);
    hitTimes.forEach((v, i) => {
      if (v) endI = i;
      sum += v;
      if (isDB) {
        if (sum >= 5 && !stack) stack = i;
      } else {
        if (i < 20) stack += v;
      }
    });
    if (isDB && !stack) stack = endI;
    switch (settings.dungeonDragonHelperTrackHits) {
      case 'Full':
        log(`&aHit &b${sum}&a arrows in &d${formatTime(endI)}&a on ${d.color}${d.name}&a.`);
        break;
      case 'Burst':
        if (isDB) log(`&aHit &b${Math.min(sum, 5)}&a arrows in &d${formatTime(stack)}&a on ${d.color}${d.name}&a.`);
        else log(`&aHit &b${stack}&a arrows in &d${formatTime(Math.min(20, endI))}&a on ${d.color}${d.name}&a.`);
        break;
      case 'Both':
        if (isDB) log(`${d.color}${d.name}&7: &b${sum}&a arrows in &d${formatTime(endI)} &7| &b${Math.min(sum, 5)}&a arrows in &d${formatTime(stack)}`);
        else log(`${d.color}${d.name}&7: &b${sum}&a arrows in &d${formatTime(endI)} &7| &b${stack}&a arrows in &d${formatTime(Math.min(20, endI))}`);
        break;
    }

    stateDragon.set();
    hitTimes = [0];
    return;
  }
  hitTimes.push(0);
}).setEnabled(stateDragonHelperTrackHits);
const bowHitReg = reg('soundPlay', () => hitTimes[hitTimes.length - 1]++).setCriteria('random.successful_hit').setEnabled(stateDragonHelperTrackHits);
const ProjectileHelper = Java.type('com.perseuspotter.chicktilshelper.ProjectileHelper');
const worldRenAimReg = reg('renderWorld', () => {
  let ticksRemaining = spawnedDrags.get(currDragPrio);
  // only the position of the first 30 ticks are defined
  if (ticksRemaining === undefined || ticksRemaining < -30) return aimPosition = null;
  ticksRemaining -= getMedianPing() / 50;

  const best = ProjectileHelper.aimFixedVelocity(
    ticksRemaining,
    DRAGONS[currDragPrio].path,
    prevBestTarget,
    0.001, -0.05, 3, 0.99, false,
    getRenderX(), getRenderY() + (isHighDragon ? 8 : 0), getRenderZ()
  );
  const theta = best.data.theta;
  const phi = best.data.phi;
  prevBestTarget = best.index;
  aimPosition = [theta, phi, best.data.ticks];
  renderBoxFilled(
    settings.dungeonDragonHelperStackAimerColor,
    getRenderX() + 50 * Math.sin(phi) * Math.cos(theta),
    getRenderY() + 50 * Math.cos(phi) - 0.5,
    getRenderZ() + 50 * Math.sin(phi) * Math.sin(theta),
    1, 1,
    { centered: true, phase: true }
  );
  if (settings.dungeonDragonHelperStackAimerPointTo && settings.preferUseTracer) renderTracer(
    settings.dungeonDragonHelperStackAimerColor,
    getRenderX() + 50 * Math.sin(phi) * Math.cos(theta),
    getRenderY() + 50 * Math.cos(phi),
    getRenderZ() + 50 * Math.sin(phi) * Math.sin(theta),
    { lw: 5, smooth: true }
  );
}).setEnabled(stateDragonHelperAim);
const renderOvAimReg = reg('renderOverlay', () => {
  if (!aimPosition) return;
  const [theta, phi] = aimPosition;
  drawArrow3DPos(
    settings.dungeonDragonHelper,
    50 * Math.sin(phi) * Math.cos(theta),
    50 * Math.cos(phi),
    50 * Math.sin(phi) * Math.sin(theta),
    false
  );
}).setEnabled(stateDragonHelperAim.and(settings.dungeonDragonHelperStackAimerPointTo).and(new StateProp(settings._preferUseTracer).not()));
const renderOvRunReg = reg('renderOverlay', () => {
  const ticks = spawnedDrags.values().next().value;
  if (ticks === undefined) return;
  if (!aimPosition) return;
  const arrowTime = aimPosition[2];
  const remaining = (ticks - getPartialServerTick() - arrowTime) * 50 - getMedianPing();
  runTimerHud.setLine(remaining < 0 ? '&bNOW' : colorForNumber(remaining, 5000) + remaining.toFixed(0));
  runTimerHud.render();
}).setEnabled(stateDragonHelperStackRunTimer);

export function init() {
  registerTrackPlayers(stateDragonHelper);

  settings._dungeonDragonHelperAlertSound.listen(v => spawnAlert.sound = v);
  settings._moveDragonHelperTimer.onAction(v => timerHud.edit(v));
  function checkPrio(v, o) {
    if (v.length === 5 && v.split('').sort().join('') === 'bgopr') return;
    log('&4invalid prio, it should only contain each of the characters "bgopr" exactly once (case sensitive)');
    this.set(o);
  }
  settings._dungeonDragonHelperPrioS.listen(checkPrio);
  settings._dungeonDragonHelperPrioNS.listen(checkPrio);
  function checkTeam(v, o) {
    if (!/[^bmhat]/.test(v)) return;
    log('&4invalid classes, it should only contain the characters "bmhat" (case sensitive)');
    this.set(o);
  }
  settings._dungeonDragonHelperBersTeam.listen(checkTeam);
  settings._dungeonDragonHelperShowStackClass.listen(checkTeam);
  settings._moveDragonHelperStackTimeUntilRun.onAction(v => runTimerHud.edit(v));
}
export function enter() {
  stateInP5.set(false);
  spawnedDrags.clear();
  dragonCount = 0;
  stateDragon.set();
  hitTimes = [0];
}
export function start() {
  tickReg.register();
  partSpawnReg.register();
  serverTickReg.register();
  renderWorldReg.register();
  renderOverlayReg.register();
  dragonSpawnReg.register();
  serverTickHitReg.register();
  bowHitReg.register();
  worldRenAimReg.register();
  renderOvAimReg.register();
  renderOvRunReg.register();
}
export function reset() {
  tickReg.unregister();
  partSpawnReg.unregister();
  serverTickReg.unregister();
  renderWorldReg.unregister();
  renderOverlayReg.unregister();
  dragonSpawnReg.unregister();
  serverTickHitReg.unregister();
  bowHitReg.unregister();
  worldRenAimReg.unregister();
  renderOvAimReg.unregister();
  renderOvRunReg.unregister();
}