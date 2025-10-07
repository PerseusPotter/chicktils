import settings from '../../settings';
import { getBlockPos } from '../../util/mc';
import { Deque } from '../../util/polyfill';
import reg from '../../util/registerer';

/** @type {Deque<[number, number, number, number]>} */
const previousBlocks = new Deque();
const lock = new (Java.type('java.util.concurrent.locks.ReentrantLock'))();
let heldItemIndex = 0;

const breakReg = reg('blockBreak', block => {
  lock.lock();
  previousBlocks.push([block.x, block.y, block.z, Player.getHeldItemIndex()]);
  if (previousBlocks.length > 2) previousBlocks.shift();
  lock.unlock();
}).setEnabled(settings._dungeonStonkSound);
const heldItemReg = reg('packetSent', pack => {
  heldItemIndex = pack.func_149614_c();
}).setFilteredClass(net.minecraft.network.play.client.C09PacketHeldItemChange).setEnabled(settings._dungeonStonkSound);
const START_DESTROY_BLOCK = net.minecraft.network.play.client.C07PacketPlayerDigging.Action.START_DESTROY_BLOCK;
const blockBreakReg = reg('packetSent', pack => {
  if (pack.func_180762_c() !== START_DESTROY_BLOCK) return;

  const pos = getBlockPos(pack.func_179715_a());

  lock.lock();
  const success = previousBlocks.some(v =>
    v[0] === pos.x &&
    v[1] === pos.y &&
    v[2] === pos.z &&
    v[3] !== heldItemIndex
  );
  lock.unlock();

  // World.playSound doesn't work??
  if (success) Client.scheduleTask(() =>
    Player.getPlayer()?.func_85030_a?.(settings.dungeonStonkSoundName, settings.dungeonStonkSoundVolume, settings.dungeonStonkSoundPitch)
  );
}).setFilteredClass(net.minecraft.network.play.client.C07PacketPlayerDigging).setEnabled(settings._dungeonStonkSound);

export function enter() {
  previousBlocks.clear();
  heldItemIndex = 0;

  breakReg.register();
  heldItemReg.register();
  blockBreakReg.register();
}
export function reset() {
  breakReg.unregister();
  heldItemReg.unregister();
  blockBreakReg.unregister();
}