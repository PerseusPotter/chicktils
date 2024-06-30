import settings from '../../settings';
import { drawBeaconBeam } from '../../util/draw';
import { fastDistance } from '../../util/math.js';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

const lbs = [
  [27, 56, 1, 0, 0],
  [56, 124, 0.5, 0, 0.5],
  [82, 56, 1, 0.5, 0,],
  [82, 96, 0, 0, 1],
  [27, 92, 0, 1, 0]
];
const renderWorldReg = reg('renderWorld', () => {
  if (Player.getY() > 30) return;
  const lb = lbs.map(v => [fastDistance(Player.getX() - v[0], Player.getZ() - v[1]), v]).reduce((a, v) => a ? a[0] < v[0] ? a : v : v, null)[1];
  drawBeaconBeam(lb[0], 0, lb[1], lb[2], lb[3], lb[4], 1, true, 17);
}, 'dungeon/m7lbwaypoints').setEnabled(new StateProp(stateFloor).equals('M7').and(stateIsInBoss).and(settings._dungeonM7LBWaypoints));

export function init() { }
export function start() {
  renderWorldReg.register();
}
export function reset() {
  renderWorldReg.register();
}