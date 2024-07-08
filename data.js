import PogObject from '../PogData';
import { log, logDebug } from './util/log';

// if reloading modules without cache it resets data :(
let isMainData = false;
export function setIsMain() {
  isMainData = true;
};

/**
 * @typedef {{ x: number, y: number, s: number }} Location
 */
/**
 * @typedef {Location & { a: number }} TextLocation
 */
/**
 * @type {{
 *  statLocs: TextLocation[];
 *  quiverLoc: TextLocation;
 *  kuudraHpLoc: TextLocation;
 *  dungeonCampSkipTimerLoc: TextLocation;
 *  dungeonMapLoc: Location;
 *  dungeonNecronDragTimerLoc: TextLocation;
 *  unlockedHubWarps: boolean[];
 *  dianaWarpKey: number;
 *  dungeonSpiritBearTimerLoc: TextLocation;
 *  serverScrutinizerTPSDisplay: TextLocation;
 *  serverScrutinizerLastPacketDisplay: TextLocation;
 *  dungeonSilverfishHasteTimerLoc: TextLocation;
 * }}
 */
const data = new PogObject('chicktils', { firstLoad: true }, 'data.json');

function reset(key, mute) {
  if (!data.firstLoad && !mute) log(`&4unable to read data &7"&b${key}&7"&4, resetting it`);
}
function resetLocation(key, mute) {
  data[key] = { x: 50, y: 50, s: 1 };
  reset(key, mute);
}
function verifyLocation(value) {
  return Boolean(value) && ['x', 'y', 's'].every(v => typeof value[v] === 'number');
}
function resetTextLocation(key, mute) {
  data[key].a = 0;
  reset(key, mute);
}
function verifyTextLocation(value) {
  return typeof value.a === 'number';
}

[
  'dungeonMapLoc'
].forEach(v => verifyLocation(data[v]) || resetLocation(v));

[
  'quiverLoc',
  'kuudraHpLoc',
  'dungeonCampSkipTimerLoc',
  'dungeonNecronDragTimerLoc',
  'dungeonSpiritBearTimerLoc',
  'serverScrutinizerTPSDisplay',
  'serverScrutinizerLastPacketDisplay',
  'dungeonSilverfishHasteTimerLoc'
].forEach(v => {
  if (!verifyLocation(data[v])) resetLocation(v);
  if (!verifyTextLocation(data[v])) resetTextLocation(v)
});

if (!data.statLocs || !Array.isArray(data.statLocs)) {
  data.statLocs = new Array(17).fill(0).map(() => ({ x: 50, y: 50, s: 1, a: 0 }));
  reset('statLocs');
}
data.statLocs.forEach((_, i) => {
  if (!verifyLocation(data.statLocs[i])) {
    data.statLocs[i] = { x: 50, y: 50, s: 1, a: 0 };
    reset(`statLocs[${i}]`);
  }
  if (!verifyTextLocation(data.statLocs[i])) {
    data.statLocs[i].a = 0;
    reset(`statLocs[${i}]`);
  }
});

if (!data.unlockedHubWarps || !Array.isArray(data.unlockedHubWarps) || !data.unlockedHubWarps.every(v => typeof v === 'boolean')) {
  data.unlockedHubWarps = [];
  reset('unlockedHubWarps');
}

if (typeof data.dianaWarpKey !== 'number') {
  data.dianaWarpKey = 0;
  reset('dianaWarpKey');
}

data.firstLoad = false;

register('gameUnload', () => isMainData && data.save());

export default data;