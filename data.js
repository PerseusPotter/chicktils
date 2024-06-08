import PogObject from '../PogData';

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
 *  statLocs: TextLocation[],
 *  quiverLoc: TextLocation,
 *  kuudraHpLoc: TextLocation,
 *  dungeonCampSkipTimerLoc: TextLocation,
 *  dungeonMapLoc: Location,
 *  dungeonNecronDragTimerLoc: TextLocation,
 *  unlockedHubWarps: boolean[],
 *  dianaWarpKey: number,
 *  dungeonSpiritBearTimerLoc: TextLocation
 * }}
 */
const data = new PogObject('chicktils', {
  // a: tl tr bl br
  statLocs: new Array(17).fill(0).map(() => ({ x: 50, y: 50, s: 1, a: 0 })),
  quiverLoc: { x: 50, y: 50, s: 1, a: 0 },
  kuudraHpLoc: { x: 50, y: 50, s: 1, a: 0 },
  dungeonCampSkipTimerLoc: { x: 50, y: 50, s: 1, a: 0 },
  dungeonMapLoc: { x: 50, y: 50, s: 1 },
  dungeonNecronDragTimerLoc: { x: 50, y: 50, s: 1, a: 0 },
  unlockedHubWarps: [],
  dianaWarpKey: 0,
  dungeonSpiritBearTimerLoc: { x: 50, y: 50, s: 1, a: 0 }
}, 'data.json');

register('gameUnload', () => isMainData && data.save());

export default data;