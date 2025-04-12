import { renderBeacon } from '../../../Apelles/index';
import settings from '../../settings';
import { fastDistance } from '../../util/math';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

const stateM7LBWaypoints = new StateProp(stateFloor).equals('M7').and(stateIsInBoss).and(settings._dungeonM7LBWaypoints);

const lbs = [
  [27, 56, 0xFF0000FF],
  [56, 124, 0x800080FF],
  [82, 56, 0xFF8000FF],
  [82, 96, 0x0000FFFF],
  [27, 92, 0x00FF00FF]
];
let nearest;
const tickReg = reg('tick', () => {
  nearest = lbs.map(v => [fastDistance(Player.getX() - v[0], Player.getZ() - v[1]), v]).reduce((a, v) => a ? a[0] < v[0] ? a : v : v, null)[1];
}).setEnabled(stateM7LBWaypoints);
const renderWorldReg = reg('renderWorld', () => {
  if (Player.getY() > 30 || !nearest) return;
  renderBeacon(nearest[2], nearest[0], 0, nearest[1], { centered: false, h: 17 });
}).setEnabled(stateM7LBWaypoints);

export function init() { }
export function start() {
  tickReg.register();
  renderWorldReg.register();
}
export function reset() {
  tickReg.unregister();
  renderWorldReg.unregister();
}