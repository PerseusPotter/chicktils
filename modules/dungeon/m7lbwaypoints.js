import settings from '../../settings';
import { drawBeaconBeam } from '../../util/draw';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateIsInBoss } from '../dungeon.js';

const renderWorldReg = reg('renderWorld', () => {
  if (Player.getY() > 30) return;
  drawBeaconBeam(27, 0, 56, 1, 0, 0, 1, true, 17);
  drawBeaconBeam(56, 0, 124, 0.5, 0, 0.5, 1, true, 17);
  drawBeaconBeam(82, 0, 56, 1, 0.5, 0, 1, true, 17);
  drawBeaconBeam(82, 0, 96, 0, 0, 1, 1, true, 17);
  drawBeaconBeam(27, 0, 92, 0, 1, 0, 1, true, 17);
}, 'dungeon/m7lbwaypoints').setEnabled(new StateProp(stateIsInBoss).and(settings._dungeonM7LBWaypoints));

export function init() { }
export function start() {
  renderWorldReg.register();
}
export function reset() {
  renderWorldReg.register();
}