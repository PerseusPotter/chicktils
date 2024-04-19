import settings from '../settings';
import data from '../data';
import createTextGui from '../util/customtextgui';
import { cleanNumber, colorForNumber } from '../util/format';
import { reg } from '../util/registerer';

const display = createTextGui(() => data.quiverLoc, () => ['&5Flint Arrow &fx&26969'].concat(settings.quiverShowRefill ? ['&fRefill: &9Social Life &fx&d6969 &8(Instant: &9&d6969&8)'] : []));
const quivSizes = {
  Medium: 27 * 64,
  Large: 36 * 64,
  Giant: 45 * 64
};
// flint weaponsmith 3.333 per
// flint jax 97/90 * 288
// 64 57
/**
 * @type {{ [K: string]: { stackCost: number, instCost: number, unit: string, jaxCost?: number, stackSize?: number, sackable: boolean } }}
 */
const arrowTypes = {
  '§fFlint Arrow': {
    stackCost: 288,
    instCost: 64 * 10 / 3,
    jaxCost: 97 / 90 * 288,
    unit: '&6Coins',
    sackable: true
  },
  '§fReinforced Iron Arrow': {
    stackCost: 21,
    instCost: 24,
    unit: '&fIron Ingot',
    sackable: true
  },
  '§fGold-tipped Arrow': {
    stackCost: 36,
    instCost: 40,
    unit: '&fGold Ingot',
    sackable: true
  },
  '§aRedstone-tipped Arrow': {
    stackCost: 21,
    instCost: 24,
    unit: '&fBlock of Redstone',
    sackable: false
  },
  '§aEmerald-tipped Arrow': {
    stackCost: 14,
    instCost: 16,
    unit: '&fBlock of Emerald',
    sackable: false
  },
  '§9Bouncy Arrow': {
    stackCost: 21,
    instCost: 24,
    unit: '&fSlime Block',
    sackable: false
  },
  '§9Icy Arrow': {
    stackCost: 57,
    instCost: 64,
    unit: '&fPacked Ice',
    sackable: true
  },
  '§9Armorshred Arrow': {
    stackCost: 2,
    instCost: 2,
    unit: '&aEnchanted Sand',
    sackable: true
  },
  '§9Explosive Arrow': {
    stackCost: 21,
    instCost: 24,
    unit: '&fBlock of Coal',
    sackable: false
  },
  '§9Glue Arrow': {
    stackCost: 57,
    instCost: 64,
    unit: '&aTarantula Web',
    sackable: true
  },
  '§9Nansorb Arrow': {
    stackCost: 7,
    instCost: 8,
    unit: '&aEnchanted Cactus Green',
    sackable: true
  },
  '§5Magma Arrow': {
    stackCost: 1,
    instCost: 1,
    unit: '&5Bundle of Magma Arrows',
    stackSize: 2,
    sackable: true
  }
};
let shouldRender = false;
const renderReg = reg('renderOverlay', () => shouldRender && display.render());
const updateReg = reg('step', () => {
  shouldRender = false;
  const inv = Player.getInventory();
  if (!inv) return;
  const item = inv.getStackInSlot(8);
  if (!item || item.getRegistryName() !== 'minecraft:feather') return;

  const lore = item.getLore()[5];
  if (!lore) return;
  const m = lore.match(/^§5§o§7Active Arrow: (§.+?) §7\(§e(\d+)§7\)$/);
  if (!m) return;
  shouldRender = true;
  const a = m[1];
  const c = +m[2];
  const maxSize = quivSizes[settings.quiverSize] || quivSizes.Giant;
  display.clearLines();
  display.addLine(`${a} &fx${colorForNumber(c, maxSize)}${c}`);
  if (settings.quiverShowRefill && c / maxSize < settings.quiverShowRefillThresh) {
    const missing = maxSize - c;
    const data = arrowTypes[a];
    if (!data) return;
    const stacks = Math.ceil(missing / (64 * (data.stackSize || 1)));
    if (stacks <= 0) return;
    const cost = (function() {
      switch (settings.quiverRefillCost) {
        case 'Instant': return data.instCost;
        case 'Individual': return data.stackCost;
        case 'Jax': return data.jaxCost || data.instCost;
        case 'Ophelia': return data.instCost;
      }
    }()) * stacks;
    let costStr;
    if (data.sackable) costStr = cleanNumber(cost, 1);
    else {
      const costStacks = cost >> 6;
      const costItems = cost & 63;
      if (costStacks > 0) costStr = `${costStacks}s ${costItems}`;
      else costStr = costItems.toString();
    }
    display.addLine(`&fRefill: ${data.unit} &fx&d${costStr}`);
  }
}).setFps(5);

export function init() {
  settings._moveQuiver.onAction(() => display.edit());
}
export function load() {
  updateReg.register();
  renderReg.register();
}
export function unload() {
  updateReg.unregister();
  renderReg.unregister();
}