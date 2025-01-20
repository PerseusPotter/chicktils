import PogObject from '../PogData';
import { log } from './util/log';

// if reloading modules without cache it resets data :(
let isMainData = false;
export function setIsMain() {
  isMainData = true;
};

/**
 * @typedef {{ x: number, y: number, s: number }} Location
 */
/**
 * @typedef {Location & { a: number, b: boolean, c: number }} TextLocation
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
 *  serverScrutinizerFPSDisplay: TextLocation;
 *  spotifyDisplayLoc: TextLocation;
 *  clipboardData: Record<string, string>;
 *  avariceCoinCounterLoc: TextLocation;
 *  deployableHUDLoc: TextLocation;
 *  greatSpookPrimalTimerLoc: TextLocation;
 *  dragonHelperTimer: TextLocation;
 *  goldorFrenzyTimer: TextLocation;
 *  serverScrutinizerPingDisplay: TextLocation;
 *  assfangCheeseLoc: TextLocation;
 *  feroEstimateLoc: TextLocation;
 *  serverScrutinizerPPSDisplay: TextLocation;
 * }}
 */
const data = new PogObject('chicktils', { firstLoad: true, clipboardData: {} }, 'data.json');

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
  data[key].b = true;
  data[key].c = 0;
  reset(key, mute);
}
function verifyTextLocation(value) {
  return typeof value.a === 'number' && typeof value.b === 'boolean' && typeof value.c === 'number';
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
  'dungeonSilverfishHasteTimerLoc',
  'serverScrutinizerFPSDisplay',
  'spotifyDisplayLoc',
  'avariceCoinCounterLoc',
  'deployableHUDLoc',
  'greatSpookPrimalTimerLoc',
  'dragonHelperTimer',
  'goldorFrenzyTimer',
  'serverScrutinizerPingDisplay',
  'assfangCheeseLoc',
  'feroEstimateLoc',
  'serverScrutinizerPPSDisplay'
].forEach(v => {
  if (!verifyLocation(data[v])) resetLocation(v);
  if (!verifyTextLocation(data[v])) resetTextLocation(v);
});

if (!data.statLocs || !Array.isArray(data.statLocs)) {
  data.statLocs = new Array(17).fill(0).map(() => ({ x: 50, y: 50, s: 1, a: 0, b: true, c: 0 }));
  reset('statLocs');
}
data.statLocs.forEach((_, i) => {
  if (!verifyLocation(data.statLocs[i])) {
    data.statLocs[i] = { x: 50, y: 50, s: 1, a: 0, b: true, c: 0 };
    reset(`statLocs[${i}]`);
  }
  if (!verifyTextLocation(data.statLocs[i])) {
    data.statLocs[i].a = 0;
    data.statLocs[i].b = true;
    data.statLocs[i].c = 0;
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