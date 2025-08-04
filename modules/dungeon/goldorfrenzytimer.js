import settings from '../../settings';
import data from '../../data';
import { getPartialServerTick } from '../../util/draw';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import createTextGui from '../../util/customtextgui';
import { StateProp, StateVar } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

const stateGoldorTimer = new StateProp(stateFloor).equalsmult('F7', 'M7').and(stateIsInBoss).and(settings._dungeonGoldorFrenzyTimer);
const stateInGoldor = new StateVar(false);

const timerHud = createTextGui(() => data.goldorFrenzyTimer, () => {
  const t = 3000 - (Date.now() % 3000);
  return [colorForNumber(t, 3000) + t.toFixed(0)];
});
let ticksInvul = 60;

const renderReg = reg('renderOverlay', () => {
  const t = Math.max(0, 50 * (ticksInvul - getPartialServerTick()));
  timerHud.setLine(colorForNumber(t, 3000) + t.toFixed(0));
  timerHud.render();
}).setEnabled(stateGoldorTimer.and(stateInGoldor));
const serverTickReg = reg('serverTick', () => ticksInvul = ticksInvul > 1 ? ticksInvul - 1 : 60).setEnabled(stateGoldorTimer.and(stateInGoldor));
const goldorStartReg = reg('chat', () => stateInGoldor.set(true)).setCriteria('&r&4[BOSS] Storm&r&c: &r&cAt least my son died by your hands.&r').setEnabled(stateGoldorTimer);
const goldorEndReg = reg('chat', () => stateInGoldor.set(false)).setCriteria('&r&aThe Core entrance is opening!&r').setEnabled(stateGoldorTimer);

export function init() {
  settings._moveGoldorFrenzyTimer.onAction(v => timerHud.edit(v));
}
export function enter() {
  stateInGoldor.set(false);
  ticksInvul = 99;
}
export function start() {
  renderReg.register();
  serverTickReg.register();
  goldorStartReg.register();
  goldorEndReg.register();
}
export function reset() {
  renderReg.unregister();
  serverTickReg.unregister();
  goldorStartReg.unregister();
  goldorEndReg.unregister();
}