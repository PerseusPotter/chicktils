import settings from '../../settings';
import createAlert from '../../util/alert';
import reg from '../../util/registerer';
import { StateProp, StateVar } from '../../util/state';
import { getPlayers, registerTrackPlayers, stateFloor, stateIsInBoss } from '../dungeon.js';

const goldorDpsStartAlert = createAlert('DPS!', 10);

const stateGoldorDps = new StateProp(stateFloor).equalsmult('F7', 'M7').and(settings._dungeonGoldorDpsStartAlert).and(stateIsInBoss);
const stateIsInGoldorDps = new StateVar(false);

const tickReg = reg('tick', () => {
  if (getPlayers().every(({ e }) => !e || (e !== Player && e.isDead()) || (e.getX() > 40 && e.getX() < 69 && e.getY() > 110 && e.getY() < 150 && e.getZ() > 53.5 && e.getZ() < 120))) {
    stateIsInGoldorDps.set(false);
    goldorDpsStartAlert.show(settings.dungeonGoldorDpsStartAlertTime);
  }
}).setEnabled(stateIsInGoldorDps);
const terminalsEndReg = reg('chat', () => stateIsInGoldorDps.set(true)).setCriteria('&r&aThe Core entrance is opening!&r').setEnabled(stateGoldorDps);
const goldorDpsStartReg = reg('chat', () => stateIsInGoldorDps.set(false)).setCriteria('&r&4[BOSS] Goldor&r&c: &r&cYou have done it, you destroyed the factory…&r').setEnabled(stateGoldorDps);

export function init() {
  registerTrackPlayers(stateGoldorDps);

  settings._dungeonGoldorDpsStartAlert.listen(v => !v && stateIsInGoldorDps.set(false));
  settings._dungeonGoldorDpsStartAlertSound.listen(v => goldorDpsStartAlert.sound = v);
}
export function start() {
  stateIsInGoldorDps.set(false);

  tickReg.register();
  terminalsEndReg.register();
  goldorDpsStartReg.register();
}
export function reset() {
  tickReg.unregister();
  terminalsEndReg.unregister();
  goldorDpsStartReg.unregister();
}