import { renderBoxFilled, renderBoxOutline } from '../../../Apelles/index';
import settings from '../../settings';
import { getPartialServerTick, renderString } from '../../util/draw';
import { colorForNumber } from '../../util/format';
import { getBlockId } from '../../util/mc';
import reg from '../../util/registerer';
import { StateProp, StateVar } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

/** @type {number[][]} */
let deathPos = [];
const stateMaxTicks = new StateProp(stateFloor).customUnary(f => f === 'F6' ? 300 : 240);
const stateTerraPhase = new StateVar(false);
const stateTerraRespawn = new StateProp(stateFloor).equalsmult('F6', 'M6').and(settings._dungeonTerracottaRespawn).and(stateIsInBoss).and(stateTerraPhase);

const blockUpdateReg = reg('blockChange', (pos, bs) => {
  if (getBlockId(bs.func_177230_c()) !== 140) return;
  deathPos.push([
    stateMaxTicks.get(),
    pos.x + 0.5, 69, pos.z + 0.5
  ]);
}).setEnabled(stateTerraRespawn);
const stickReg = reg('serverTick2', () => {
  if (deathPos.length === 0) return;
  let m = 0;
  let i = 0;
  while (i < deathPos.length) {
    if (--deathPos[i][0] === 0) m++;
    i++;
  }
  if (m > 0) deathPos = deathPos.slice(m);
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
    if (doTimer) renderString(
      `${colorForNumber(t, stateMaxTicks.get())}${(t / 20).toFixed(2)}s`,
      v[1], v[2] + 0.5, v[3],
      0xFFFFFFFF,
      false,
      0.03,
      false,
      true
    );
  });
}).setEnabled(stateTerraRespawn);
const terraStopReg = reg('chat', () => stateTerraPhase.set(false)).setCriteria('&r&c[BOSS] Sadan&r&f: ENOUGH!&r').setEnabled(stateTerraRespawn);

export function init() { }
export function start() {
  stateTerraPhase.set(true);

  blockUpdateReg.register();
  stickReg.register();
  renderReg.register();
  terraStopReg.register();
}
export function reset() {
  deathPos = [];

  blockUpdateReg.unregister();
  stickReg.unregister();
  renderReg.unregister();
  terraStopReg.unregister();
}