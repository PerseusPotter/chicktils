import settings from '../../settings';
import reg from '../../util/registerer';
import { dist } from '../../util/math';
import { StateProp, StateVar } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

const stateIsAtDev4 = new StateVar(false);

const tickReg = reg('tick', () => stateIsAtDev4.set(dist(Player.getX(), 63) + dist(Player.getY(), 127) + dist(Player.getZ(), 35) < 3), 'dungeon/dev4helper').setEnabled(new StateProp(settings._dungeonDev4Helper).notequals('None').and(new StateProp(stateFloor).equalsmult('F7', 'M7')).and(stateIsInBoss));
const particleReg = reg('spawnParticle', (part, id, evn) => cancel(evn), 'dungeon/dev4helper').setEnabled(new StateProp(settings._dungeonDev4Helper).equalsmult('Particles', 'Both').and(stateIsAtDev4));
const titleReg = reg('renderTitle', (t, s, evn) => {
  if (s === '§aThe gate has been destroyed!§r' || s.includes('activated a')) cancel(evn);
}, 'dungeon/dev4helper').setEnabled(new StateProp(settings._dungeonDev4Helper).equalsmult('Titles', 'Both').and(stateIsAtDev4));

export function init() {
  settings._dungeonDev4Helper.listen(v => v === 'None' && stateIsAtDev4.set(false));
}
export function start() {
  stateIsAtDev4.set(false);

  tickReg.register();
  particleReg.register();
  titleReg.register();
}
export function reset() {
  tickReg.unregister();
  particleReg.unregister();
  titleReg.unregister();
}