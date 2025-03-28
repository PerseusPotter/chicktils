import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';
import { toArray } from '../../util/math';
import { renderFilledBox } from '../../util/draw';

const stateEnable = new StateProp(stateFloor).equalsmult('F7', 'M7').and(stateIsInBoss).and(settings._dungeonDev4HighlightBlock);

const resetPos = [66, 132, 50];
let emBlockPos = resetPos;

const EMERALD_BLOCK = net.minecraft.init.Blocks.field_150475_bE;
const blockChangeReg = reg('blockChange', (pos, bs) => {
  if (pos.z !== 50) return;
  if (pos.x !== 64 && pos.x !== 66 && pos.x !== 68) return;
  if (pos.y !== 126 && pos.y !== 128 && pos.y !== 130) return;

  if (bs.func_177230_c() === EMERALD_BLOCK) emBlockPos = toArray(pos);
  else if (pos.x === emBlockPos[0] && pos.y === emBlockPos[1]) emBlockPos = resetPos;
}).setEnabled(stateEnable);
const renderReg = reg('renderWorld', () => {
  if (emBlockPos === resetPos) return;
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
  renderReg.register();
}
export function reset() {
  blockChangeReg.unregister();
  renderReg.unregister();
}