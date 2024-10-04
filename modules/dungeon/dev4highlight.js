import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';
import { getBlockPos } from '../../util/mc';
import { toArray } from '../../util/math';
import { renderFilledBox } from '../../util/draw';

const stateEnable = new StateProp(stateFloor).equalsmult('F7', 'M7').and(stateIsInBoss).and(settings._dungeonDev4HighlightBlock);

const resetPos = [66, 132, 50];
let emBlockPos = resetPos;

const EMERALD_BLOCK = net.minecraft.init.Blocks.field_150475_bE;
function blockUpdate(bp, bs) {
  const pos = getBlockPos(bp);
  if (pos.z !== 50) return;
  if (pos.x !== 64 && pos.x !== 66 && pos.x !== 68) return;
  if (pos.y !== 126 && pos.y !== 128 && pos.y !== 130) return;

  if (bs.func_177230_c() === EMERALD_BLOCK) emBlockPos = toArray(pos);
  else if (pos.x === emBlockPos[0] && pos.y === emBlockPos[1]) emBlockPos = resetPos;

  return true;
}
const blockChangeReg = reg('packetReceived', pack => {
  blockUpdate(pack.func_179827_b(), pack.func_180728_a());
}).setFilteredClass(net.minecraft.network.play.server.S23PacketBlockChange).setEnabled(stateEnable);
const blockMultiChangeReg = reg('packetReceived', pack => {
  pack.func_179844_a().some(v => blockUpdate(v.func_180090_a(), v.func_180088_c()));
}).setFilteredClass(net.minecraft.network.play.server.S22PacketMultiBlockChange).setEnabled(stateEnable);
const renderReg = reg('renderWorld', () => {
  renderFilledBox(
    emBlockPos[0] - 0.005, emBlockPos[1] - 0.005, emBlockPos[2] - 0.005,
    1.01, 1.01,
    settings.dungeonDev4HighlightBlockColor, settings.dungeonDev4HighlightBlockEsp,
    false
  );
}).setEnabled(stateEnable);

export function init() { }
export function start() {
  emBlockPos = resetPos;

  blockChangeReg.register();
  blockMultiChangeReg.register();
  renderReg.register();
}
export function reset() {
  blockChangeReg.unregister();
  blockMultiChangeReg.unregister();
  renderReg.unregister();
}