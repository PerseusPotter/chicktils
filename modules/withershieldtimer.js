import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { getPartialServerTick } from '../util/draw';
import { colorForNumber } from '../util/format';
import reg, { customRegs } from '../util/registerer';

const timer = createTextGui(() => data.witherShieldTimer, () => ['&6Shield: &aREADY']);

let useTime = 0;
let cooldown = 0;

const renderReg = reg('renderOverlay', () => {
  let str = '&aREADY';
  if (cooldown > 0) {
    const ticksRemaining = useTime + cooldown - customRegs.serverTick.tick - getPartialServerTick();
    if (ticksRemaining < 0) cooldown = 0;
    else str = `${colorForNumber(ticksRemaining, cooldown)}${(ticksRemaining / 20).toFixed(2)}s`;
  }

  timer.setLine('&6Shield: ' + str);
  timer.render();
});
const isWitherShield = new (Java.type('java.util.WeakHashMap'))();
const rcReg = reg('playerInteract', () => {
  if (cooldown > 0) return;

  const item = Player.getHeldItem();
  if (!item) return;

  const type = isWitherShield.computeIfAbsent(item.itemStack, v => {
    const scrolls = v.func_77978_p()?.func_74775_l('ExtraAttributes')?.func_150295_c('ability_scroll', 8);
    const count = scrolls.func_74745_c();
    for (let i = 0; i < count; i++) {
      if (scrolls.func_150307_f(0) === 'WITHER_SHIELD_SCROLL') return count === 3 ? 2 : 1;
    }
    return 0;
  });
  if (!type) return;

  useTime = customRegs.serverTick.tick;
  cooldown = type === 2 ? 100 : 200;
});
const unloadReg = reg('worldUnload', () => cooldown = 0);

export function init() {
  settings._moveWitherShieldTimer.onAction(() => timer.edit());
}
export function load() {
  renderReg.register();
  rcReg.register();
  unloadReg.register();
}
export function unload() {
  renderReg.unregister();
  rcReg.unregister();
  unloadReg.unregister();
}