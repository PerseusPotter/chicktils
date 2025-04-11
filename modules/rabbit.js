import settings from '../settings';
import reg from '../util/registerer';
import { DelayTimer } from '../util/timers';
import { getItemId, getLowerContainer, listenInventory } from '../util/mc';
import { deleteMessages } from '../util/helper';

const guiReg = reg('guiOpened', evn => {
  if (!settings.rabbitShowBestUpgrade) return;
  const gui = evn.gui;
  if (gui.getClass().getSimpleName() !== 'GuiChest') return;
  // net.minecraft.client.player.inventory.ContainerLocalMenu
  const inv = getLowerContainer(gui);
  const name = inv.func_70005_c_();
  if (name !== 'Chocolate Factory') return;
  Client.scheduleTask(() => {
    if (inv.func_70301_a(0).func_77960_j() !== 15) return;
    let updater = new DelayTimer(100);
    let wasChanged = false;
    function update(inv) {
      if (!wasChanged) return;
      wasChanged = false;
      const cp = inv.func_70301_a(45);
      if (!cp || getItemId(cp) !== 'minecraft:dye') return;
      const tag = cp.func_77978_p().func_74775_l('display');
      const lore = tag.func_150295_c('Lore', 8);
      let cps;
      let mul;
      let ttb;
      for (let i = 0; i < lore.func_74745_c(); i++) {
        let m;
        if (!cps && (m = lore.func_150307_f(i).match(/^§6([\d,.]+) Chocolate §8per second$/))) {
          cps = +(m[1].replace(/,/g, ''));
          continue;
        }
        if (!mul && (m = lore.func_150307_f(i).match(/^§7Total Multiplier: §6([\d,.]+)x$/))) {
          mul = +(m[1].replace(/,/g, ''));
          continue;
        }
        if (!ttb && (m = lore.func_150307_f(i).match(/^  §6\+([\d,.]+)x §8\(§dTime Tower§8\)$/))) {
          ttb = +(m[1].replace(/,/g, ''));
          continue;
        }
      }
      if (!cps || !mul) return;
      if (ttb) {
        cps /= mul;
        mul -= ttb;
        cps *= mul;
      }
      const rabbitP = [19, 20, 21, 22, 23, 24, 25, 43];
      const rabbits = [28, 29, 30, 31, 32, 33, 34, 42]
        .map((v, i) => ({ a: i, v: inv.func_70301_a(v) }))
        .filter(({ v }) => v && getItemId(v) === 'minecraft:skull')
        .map(({ a, v }) => {
          const tag = v.func_77978_p().func_74775_l('display');
          const lore = tag.func_150295_c('Lore', 8);
          let cost = Number.POSITIVE_INFINITY;
          for (let i = 0; i < lore.func_74745_c(); i++) {
            let m = lore.func_150307_f(i).match(/^§6([\d,]+) Chocolate$/);
            if (m) {
              cost = +(m[1].replace(/,/g, ''));
              break;
            }
          }
          return { a, u: (a === 7 ? cps * (mul + 0.01) / mul - cps : (a + 1) * mul) / cost, v };
        });
      if (rabbits.length > 0) {
        const bestRabbit = rabbits.reduce((a, v) => a.u < v.u ? v : a, rabbits[0]);
        if (bestRabbit.u === 0) return;
        rabbitP.forEach(v => inv.func_70301_a(v).func_77964_b(15));
        inv.func_70301_a(rabbitP[bestRabbit.a]).func_77964_b(5);
      }
    }
    listenInventory(inv, inv => {
      wasChanged = true;
      // cringe shit gets called ~100 times per click
      if (!updater.shouldTick()) return;
      update(inv);
      Client.scheduleTask(1, () => update(inv));
      Client.scheduleTask(2, () => update(inv));
      Client.scheduleTask(3, () => update(inv));
      Client.scheduleTask(4, () => update(inv));
    });
  });
}).setEnabled(settings._rabbitShowBestUpgrade);

const prevMessages = {};
const promoteReg = reg('chat', (name, lvl, status, evn) => {
  const n = name.removeFormatting();
  cancel(evn);
  deleteMessages([prevMessages[n]]);
  const msg = new Message(`${name}&7 -> Lvl &b${lvl} ${status}`);
  msg.chat();
  prevMessages[n] = msg.getFormattedText();
}).setCriteria('&r${name} &r&7has been promoted to &r&7[${lvl}&r&7] &r${status}&r&7!&r').setEnabled(settings._rabbitCondenseChat);

export function init() { }
export function load() {
  guiReg.register();
  promoteReg.register();
}
export function unload() {
  guiReg.unregister();
  promoteReg.unregister();
}