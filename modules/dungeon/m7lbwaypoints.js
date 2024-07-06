import settings from '../../settings';
import { drawBeaconBeam } from '../../util/draw';
import { fastDistance } from '../../util/math';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

const lbs = [
  [27, 56, 0xFF0000FF],
  [56, 124, 0x800080FF],
  [82, 56, 0xFF8000FF],
  [82, 96, 0x0000FFFF],
  [27, 92, 0x00FF00FF]
];
const renderWorldReg = reg('renderWorld', () => {
  if (Player.getY() > 30) return;
  const lb = lbs.map(v => [fastDistance(Player.getX() - v[0], Player.getZ() - v[1]), v]).reduce((a, v) => a ? a[0] < v[0] ? a : v : v, null)[1];
  drawBeaconBeam(lb[0], 0, lb[1], lb[2], true, false, 17);
}, 'dungeon/m7lbwaypoints').setEnabled(new StateProp(stateFloor).equals('M7').and(stateIsInBoss).and(settings._dungeonM7LBWaypoints));

export function init() { }
export function start() {
  renderWorldReg.register();
}
export function reset() {
  renderWorldReg.register();
}