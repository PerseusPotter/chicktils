import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { getPartialServerTick } from '../util/draw';
import { colorForNumber } from '../util/format';
import reg, { customRegs } from '../util/registerer';

const timer = createTextGui(() => data.witherShieldTimer, () => ['&6Shield: &aREADY']);

let useTime = 0;
let cooldown = 0;
let isCooldownPending = false;

const renderReg = reg('renderOverlay', () => {
  let str = '&aREADY';
  if (cooldown > 0) {
    const ticksRemaining = useTime + cooldown - customRegs.serverTick.tick - getPartialServerTick();
    if (ticksRemaining < 0 && (isCooldownPending || ticksRemaining < -20)) {
      cooldown = 0;
      isCooldownPending = false;
    } else str = `${colorForNumber(ticksRemaining, cooldown)}${(Math.max(ticksRemaining, 0) / 20).toFixed(2)}s`;
  }

  timer.setLine('&6Shield: ' + str);
  timer.render();
});
const isWitherShield = new (Java.type('java.util.WeakHashMap'))();
const PlayerInteractAction = Java.type('com.chattriggers.ctjs.minecraft.listeners.ClientListener').PlayerInteractAction;
const MCBlockPos = Java.type('net.minecraft.util.BlockPos');
const BlockRegistry = Java.type('com.perseuspotter.chicktilshelper.BlockRegistry');
const rcReg = reg('playerInteract', (action, pos) => {
  if (cooldown > 0 && customRegs.serverTick.tick < cooldown + useTime) return;

  const item = Player.getHeldItem();
  if (!item) return;

  const type = isWitherShield.computeIfAbsent(item.itemStack, v => {
    const scrolls = v.func_77978_p()?.func_74775_l('ExtraAttributes')?.func_150295_c('ability_scroll', 8);
    if (!scrolls) return 0;
    const count = scrolls.func_74745_c();
    for (let i = 0; i < count; i++) {
      if (scrolls.func_150307_f(i) === 'WITHER_SHIELD_SCROLL') return count === 3 ? 2 : 1;
    }
    return 0;
  });
  if (!type) return;

  if (action.equals(PlayerInteractAction.RIGHT_CLICK_BLOCK)) {
    const block = World.getWorld().func_180495_p(new MCBlockPos(pos.x, pos.y, pos.z)).func_177230_c();
    if (BlockRegistry.isInteractable(block)) return;
  }

  useTime = customRegs.serverTick.tick;
  cooldown = type === 2 ? 100 : 200;
  isCooldownPending = true;
});
const soundReg = reg('packetReceived', pack => {
  const name = pack.func_149212_c();
  if (isCooldownPending && name === 'random.explode' && pack.func_149208_g() === 1 && pack.func_149209_h() === 1) {
    isCooldownPending = false;
    useTime = customRegs.serverTick.tick;
  }
  if (name === 'random.levelup' && pack.func_149208_g() === 1 && pack.func_149209_h() === 3) {
    cooldown = 0;
    isCooldownPending = false;
  }
}).setFilteredClass(net.minecraft.network.play.server.S29PacketSoundEffect);
const unloadReg = reg('worldUnload', () => {
  cooldown = 0;
  isCooldownPending = false;
});

export function init() {
  settings._moveWitherShieldTimer.onAction(() => timer.edit());
}
export function load() {
  renderReg.register();
  rcReg.register();
  soundReg.register();
  unloadReg.register();
}
export function unload() {
  renderReg.unregister();
  rcReg.unregister();
  soundReg.unregister();
  unloadReg.unregister();
}