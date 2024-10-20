import settings from '../../settings';
import data from '../../data';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import runHelper from '../../util/runner';
import createTextGui from '../../util/customtextgui';
import { StateProp, StateVar } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

const instaMidProc = new StateVar(undefined);
const necronDragTimer = createTextGui(() => data.dungeonNecronDragTimerLoc, () => ['§l§26.42s']);
const necronDragTicks = new StateVar(0);

const tickReg = reg('tick', () => {
  const inst = instaMidProc.get();
  if (inst.isAlive()) {
    inst.getOutputStream().write(10);
    inst.getOutputStream().flush();
  } else instaMidProc.set(void 0);
}).setEnabled(new StateProp(instaMidProc).notequals(undefined));
const serverTickReg = reg('serverTick2', () => necronDragTicks.set(necronDragTicks.get() - 1)).setEnabled(new StateProp(necronDragTicks).notequals(0));
const necronStartReg = reg('chat', () => {
  necronDragTicks.set(settings.dungeonNecronDragDuration);
  if (settings.dungeonNecronDragTimer === 'InstaMid' || settings.dungeonNecronDragTimer === 'Both') instaMidProc.set(runHelper('InstaMidHelper'));
}).setCriteria('&r&4[BOSS] Necron&r&c: &r&cYou went further than any human before, congratulations.&r').setEnabled(new StateProp(settings._dungeonNecronDragTimer).notequals('None').and(new StateProp(stateFloor).equalsmult('F7', 'M7')).and(stateIsInBoss));
const renderOverlayReg = reg('renderOverlay', () => {
  const d = necronDragTicks.get() * 50;
  necronDragTimer.setLine(`§l${colorForNumber(d, settings.dungeonNecronDragDuration * 50)}${(d / 1000).toFixed(2)}s`.toString());
  necronDragTimer.render();
}).setEnabled(new StateProp(settings._dungeonNecronDragTimer).equalsmult('OnScreen', 'Both').and(new StateProp(necronDragTicks).notequals(0)));

export function init() {
  settings._moveNecronDragTimer.onAction(() => necronDragTimer.edit());
}
export function start() {
  necronDragTicks.set(0);

  tickReg.register();
  serverTickReg.register();
  necronStartReg.register();
  renderOverlayReg.register();
}
export function reset() {
  const inst = instaMidProc.get();
  if (inst && inst.isAlive()) {
    inst.destroyForcibly();
    instaMidProc.set(void 0);
  }

  tickReg.unregister();
  serverTickReg.unregister();
  necronStartReg.unregister();
  renderOverlayReg.unregister();
}