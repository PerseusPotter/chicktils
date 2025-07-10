import { renderBillboardString, renderBoxFilled, renderBoxOutline } from '../../../Apelles/index';
import data from '../../data';
import settings from '../../settings';
import createTextGui from '../../util/customtextgui';
import { getPartialServerTick } from '../../util/draw';
import { colorForNumber } from '../../util/format';
import { getBlockId } from '../../util/mc';
import { Deque } from '../../util/polyfill';
import reg from '../../util/registerer';
import { StateProp, StateVar } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

/** @type {Deque<number[]>} */
const deathPos = new Deque();
const stateMaxTicks = new StateProp(stateFloor).customUnary(f => f === 'F6' ? 300 : 240);
const stateTerraPhase = new StateVar(false);
const stateTerraRespawn = new StateProp(stateFloor).equalsmult('F6', 'M6').and(settings._dungeonTerracottaRespawn).and(stateIsInBoss).and(stateTerraPhase);
const respawnGui = createTextGui(() => data.terracottaRespawnTimer, () => ['&66.90s']);

const blockUpdateReg = reg('blockChange', (pos, bs) => {
  if (getBlockId(bs.func_177230_c()) !== 140) return;
  deathPos.push([
    stateMaxTicks.get(),
    pos.x + 0.5, 69, pos.z + 0.5
  ]);
}).setEnabled(stateTerraRespawn);
const stickReg = reg('serverTick', () => {
  if (deathPos.length === 0) return;
  const iter = deathPos.iter();
  while (!iter.done()) {
    if (--iter.value()[0] === 0) iter.remove();
    iter.next();
  }
}).setEnabled(stateTerraRespawn);
const renderReg = reg('renderWorld', () => {
  const doBox = settings.dungeonTerracottaRespawnType === 'Box' || settings.dungeonTerracottaRespawnType === 'Both';
  const doTimer = settings.dungeonTerracottaRespawnType === 'Timer' || settings.dungeonTerracottaRespawnType === 'Both';
  deathPos.forEach(v => {
    const t = v[0] - getPartialServerTick();
    const m = 1 - t / stateMaxTicks.get();
    if (doBox) {
      renderBoxFilled(
        settings.dungeonTerracottaRespawnFillColor,
        v[1], v[2], v[3],
        0.6, 1.8 * m
      );
      renderBoxOutline(
        settings.dungeonTerracottaRespawnOutlineColor,
        v[1], v[2], v[3],
        0.6, 1.8,
      );
    }
    if (doTimer) renderBillboardString(
      0xFFFFFFFF,
      `${colorForNumber(t, stateMaxTicks.get())}${(t / 20).toFixed(2)}s`,
      v[1], v[2] + 0.5, v[3],
      { scale: 1.5, phase: true, blackBox: 0 }
    );
  });
}).setEnabled(stateTerraRespawn);
const terraStopReg = reg('chat', () => stateTerraPhase.set(false)).setCriteria('&r&c[BOSS] Sadan&r&f: ENOUGH!&r').setEnabled(stateTerraRespawn);
const terraRespawnGuiReg = reg('renderOverlay', () => {
  if (deathPos.length === 0) return;
  const first = deathPos.getFirst();
  const t = first[0] - getPartialServerTick();
  respawnGui.setLine(`${colorForNumber(t, stateMaxTicks.get())}${(t / 20).toFixed(2)}s`);
  respawnGui.render();
}).setEnabled(stateTerraRespawn.and(settings._dungeonTerracottaRespawnGui));

export function init() {
  settings._moveDungeonTerracottaRespawnGui.onAction(v => respawnGui.edit(v));
}
export function enter() {
  stateTerraPhase.set(true);
}
export function start() {
  blockUpdateReg.register();
  stickReg.register();
  renderReg.register();
  terraStopReg.register();
  terraRespawnGuiReg.register();
}
export function reset() {
  deathPos.clear();

  blockUpdateReg.unregister();
  stickReg.unregister();
  renderReg.unregister();
  terraStopReg.unregister();
  terraRespawnGuiReg.unregister();
}