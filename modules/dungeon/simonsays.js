import settings from '../../settings';
import reg from '../../util/registerer';
import { compareFloat } from '../../util/math';
import { StateProp, StateVar } from '../../util/state';
import { getBlockPos } from '../../util/mc';
import { stateFloor, stateIsInBoss } from '../dungeon.js';
import { renderFilledBox } from '../../util/draw';

const stateSimonSays = new StateProp(stateFloor).equalsmult('F7', 'M7').and(stateIsInBoss).and(settings._dungeonSimonSays);
const stateAtSS = new StateVar(false);
const stateDoSimonSays = stateSimonSays.and(stateAtSS);

let solution = [];
function getButtonId(y, z) {
  if (y === 121 && z === 91) return 0;
  const dy = y - 120;
  const dz = z - 92;
  if (dy < 0 || dy > 3) return;
  if (dz < 0 || dz > 3) return;
  return ((dy << 2) | dz) + 1;
}
function getButtonPos(id) {
  return [((id - 1) >> 2) + 120, ((id - 1) & 3) + 92];
}

const tickReg = reg('tick', () => stateAtSS.set(
  compareFloat(Player.getY(), 121, 1.1) === 0 &&
  compareFloat(Player.getX(), 108, 5) === 0 &&
  compareFloat(Player.getZ(), 94, 5) === 0
)).setEnabled(stateSimonSays);
function onSeaLantern(x, y, z) {
  if (x !== 111) return;
  const id = getButtonId(y, z);
  if (id) solution.push(id);
  return !!id;
}
const MCBlock = net.minecraft.block.Block;
const blockChangeReg = reg('packetReceived', pack => {
  if (MCBlock.func_149682_b(pack.func_180728_a().func_177230_c()) !== 169) return;

  const pos = getBlockPos(pack.func_179827_b());
  onSeaLantern(pos.x, pos.y, pos.z);
}).setFilteredClass(net.minecraft.network.play.server.S23PacketBlockChange).setEnabled(stateDoSimonSays);
const multiBlockReg = reg('packetReceived', pack => {
  const changes = pack.func_179844_a();
  if (changes.some(v => {
    if (MCBlock.func_149682_b(v.func_180088_c().func_177230_c()) !== 169) return;
    const pos = getBlockPos(v.func_180090_a());
    return onSeaLantern(pos.x, pos.y, pos.z);
  })) return;
  const change = changes[0];
  if (!change) return;

  const pos = getBlockPos(change.func_180090_a());
  if (pos.x !== 110 || pos.y !== 121 || pos.z !== 94) return;
  if (MCBlock.func_149682_b(change.func_180088_c().func_177230_c()) !== 0) return;

  solution = [];
}).setFilteredClass(net.minecraft.network.play.server.S22PacketMultiBlockChange).setEnabled(stateDoSimonSays);
const renderWorldReg = reg('renderWorld', () => {
  solution.forEach((v, i) => {
    const c = i === 0 ? settings.dungeonSimonSaysColor1 : i === 1 ? settings.dungeonSimonSaysColor2 : settings.dungeonSimonSaysColor3;
    const [y, z] = getButtonPos(v);
    renderFilledBox(111.05, y + 0.371, z + 0.5, 0.4, 0.26, c, true);
  });
}).setEnabled(stateDoSimonSays);
const PlayerInteractAction = Java.type('com.chattriggers.ctjs.minecraft.listeners.ClientListener').PlayerInteractAction;
const playerInteractReg = reg('playerInteract', (action, pos, evn) => {
  if (solution.length === 0) return;
  if (!action.equals(PlayerInteractAction.RIGHT_CLICK_BLOCK)) return;
  if (pos.x !== 110) return;
  const id = getButtonId(pos.y, pos.z);
  if (id === undefined) return;
  if (World.getBlockAt(pos.x, pos.y, pos.z).type.getID() !== 77) return;

  if (solution[0] === id) return solution.shift();
  const isSneaking = Player.isSneaking();
  if (
    settings.dungeonSimonSaysBlock === 'Always' ||
    settings.dungeonSimonSaysBlock === 'WhenCrouching' && isSneaking ||
    settings.dungeonSimonSaysBlock === 'ExceptWhenCrouching' && !isSneaking
  ) return cancel(evn);
  while (solution[0] && solution[0] !== id) solution.shift();
  solution.shift();
}).setEnabled(stateDoSimonSays);

export function init() { }
export function start() {
  stateAtSS.set(false);
  solution = [];

  tickReg.register();
  blockChangeReg.register();
  multiBlockReg.register();
  renderWorldReg.register();
  playerInteractReg.register();
}
export function reset() {
  tickReg.unregister();
  blockChangeReg.unregister();
  multiBlockReg.unregister();
  renderWorldReg.unregister();
  playerInteractReg.unregister();
}