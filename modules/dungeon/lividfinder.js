import settings from '../../settings';
import { renderOutline, drawArrow3DPos, renderTracer } from '../../util/draw';
import reg from '../../util/registerer';
import { StateProp, StateVar } from '../../util/state';
import { _setTimeout } from '../../util/timers';
import { getBlockPos } from '../../util/mc';
import { stateFloor, stateIsInBoss } from '../dungeon.js';
import { run } from '../../util/threading';

const stateFindLivid = new StateProp(stateFloor).equalsmult('F5', 'M5').and(settings._dungeonBoxLivid).and(stateIsInBoss);
const stateLivid = new StateVar();

const BlockStainedGlass = Java.type('net.minecraft.block.BlockStainedGlass');
let currColor = 14;
const nameDict = [
  'Vendetta',
  'orange - not used',
  'Crossed',
  'lightBlue - not used',
  'Arcade',
  'Smile',
  'pink - not used',
  'Doctor',
  'silver - not used',
  'cyan - not used',
  'Purple',
  'Scream',
  'brown - not used',
  'Frog',
  'Hockey',
  'black - not used'
];

function findLivid() {
  const name = nameDict[currColor] + ' Livid';
  stateLivid.set(World.getAllPlayers().find(v => v.getName() === name));
}
function processBlockState(bs) {
  try {
    const prev = currColor;
    currColor = bs.func_177229_b(BlockStainedGlass.field_176547_a).func_176765_a();
    if (prev !== currColor) run(() => findLivid());
    return prev !== currColor;
  } catch (e) {
    // blockstate is not a glass pane (world has not loaded, etc)
    return false;
  }
}
const blockChangeReg = reg('blockChange', (pos, bs) => {
  if (pos.x !== 13 || pos.y !== 107 || pos.z !== 25) return;
  processBlockState(bs);
}).setEnabled(stateFindLivid);
const lividBP = new BlockPos(13, 107, 25);
const tickReg = reg('tick', () => {
  if (processBlockState(World.getBlockStateAt(lividBP))) return;
  const livid = stateLivid.get();
  if (!livid || livid.isDead()) run(() => findLivid());
}).setEnabled(stateFindLivid);
const rendWrldReg = reg('renderWorld', () => {
  const livid = stateLivid.get();
  renderOutline(livid.getRenderX(), livid.getRenderY(), livid.getRenderZ(), 1, 2, settings.dungeonBoxLividColor, settings.dungeonBoxLividEsp, true, 5);
  if (settings.preferUseTracer) renderTracer(settings.dungeonBoxLividColor, livid.getRenderX(), livid.getRenderY() + 1, livid.getRenderZ(), false);
}).setEnabled(stateFindLivid.and(stateLivid));
const rendOverReg = reg('renderOverlay', () => {
  const livid = stateLivid.get();
  drawArrow3DPos(settings.dungeonBoxLividColor, livid.getRenderX(), livid.getRenderY() + 1, livid.getRenderZ(), false, 5);
}).setEnabled(stateFindLivid.and(stateLivid).and(new StateProp(settings._preferUseTracer).not()));

export function init() { }
export function start() {
  stateLivid.set(null);
  currColor = 14;

  blockChangeReg.register();
  tickReg.register();
  rendWrldReg.register();
  rendOverReg.register();
}
export function reset() {
  blockChangeReg.unregister();
  tickReg.unregister();
  rendWrldReg.unregister();
  rendOverReg.unregister();
}