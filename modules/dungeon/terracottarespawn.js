import settings from '../../settings';
import { getPartialServerTick, renderFilledBox, renderOutline, renderString } from '../../util/draw';
import { colorForNumber } from '../../util/format';
import { getBlockPos } from '../../util/mc';
import reg from '../../util/registerer';
import { StateProp, StateVar } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

/** @type {number[][]} */
let deathPos = [];
const stateMaxTicks = new StateProp(stateFloor).customUnary(f => f === 'F6' ? 300 : 240);
const stateTerraPhase = new StateVar(false);
const stateTerraRespawn = new StateProp(stateFloor).equalsmult('F6', 'M6').and(settings._dungeonTerracottaRespawn).and(stateIsInBoss).and(stateTerraPhase);

const MCBlock = Java.type('net.minecraft.block.Block');
function onBlockUpdate(bp, bs) {
  const block = bs.func_177230_c();
  if (MCBlock.func_149682_b(block) === 140) {
    const pos = getBlockPos(bp);
    deathPos.push([
      stateMaxTicks.get(),
      pos.x + 0.5, 69, pos.z + 0.5
    ]);
  }
}
const blockUpdateReg = reg('packetReceived', pack => {
  if (pack.func_179827_b) {
    const bp = pack.func_179827_b();
    const bs = pack.func_180728_a();
    onBlockUpdate(bp, bs);
  } else pack.func_179844_a().forEach(v => {
    const bp = v.func_180090_a();
    const bs = v.func_180088_c();
    onBlockUpdate(bp, bs);
  });
}).setFilteredClasses([net.minecraft.network.play.server.S22PacketMultiBlockChange, net.minecraft.network.play.server.S23PacketBlockChange]).setEnabled(stateTerraRespawn);
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
      renderFilledBox(
        v[1], v[2], v[3],
        0.6, 1.8 * m,
        settings.dungeonTerracottaRespawnFillColor,
        false, true
      );
      renderOutline(
        v[1], v[2], v[3],
        0.6, 1.8,
        settings.dungeonTerracottaRespawnOutlineColor,
        false, true
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