import settings from '../settings';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import { reg, regForge } from '../util/registerer';

const fossilNames = [
  'Tusk',
  'Webbed',
  'Club',
  'Spine',
  'Claw',
  'Footprint',
  'Helix',
  'Ugly'
];
const fossils = [
  // tusk
  `00100
   01010
   10001
   10010
   10000.`,
  // webbed
  `0011100
   0101010
   1001001
   0001000`,
  // club
  `00011110
   00100001
   11000010
   11000000.`,
  // spine
  `001100
   011110
   111111`,
  // claw
  `000010
   001111
   010110
   101010
   010100.`,
  // footprint
  `00011
   01100
   11111
   01100
   00011`,
  // helix
  `1111
   1001
   1101
   0001
   1111.`,
  // ugly
  `011110
   111111
   011110
   001100`
].map(s => {
  s = s.trim();
  const a = s[s.length - 1] === '.';
  if (a) s = s.slice(0, -1);
  const l = s.split('\n').map(v => v.trim().split('').map(v => v === '1' ? true : false));
  return {
    arr: l,
    w: l[0].length,
    h: l.length,
    size: l.reduce((a, v) => a + v.reduce((a, v) => a + v, 0), 0),
    a
  };
});

const route = [31, 32, 21, 22, 25, 12, 19, 23, 30, 40];

const lowerInvF = Java.type('net.minecraft.client.gui.inventory.GuiChest').class.getDeclaredField('field_147015_w');
lowerInvF.setAccessible(true);
const whatIsThisCringeShit = Java.type('net.minecraft.item.Item').field_150901_e;
let tooltipReg;
const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');
const guiReg = reg('guiOpened', evn => {
  const gui = evn.gui;
  if (gui.getClass().getSimpleName() !== 'GuiChest') return;
  // net.minecraft.client.player.inventory.ContainerLocalMenu
  const inv = lowerInvF.get(gui);
  const name = inv.func_70005_c_();
  if (name !== 'Fossil Excavator') return;
  Client.scheduleTask(() => {
    if (inv.func_70301_a(0).func_77960_j() === 15) return;
    /**
     * @typedef {{ f: number, p: number, r: number, m: boolean }} Loc
     */
    /**
     * @type {Loc[]?}
     */
    let poss = [];
    let size = 0;
    let dust = new Array(54).fill(false);
    let dirt = new Array(54).fill(false);
    let trea = new Array(54).fill(false);
    let dc = 0;
    let charges = 0;
    let hist = new Array(54).fill(0);
    /**
     * @param {Loc} l
     * @param {number} i
     * @returns {boolean}
     */
    const test = (l, i) => {
      const f = fossils[l.f];
      let y = ~~(i / 9) - ~~(l.p / 9);
      let x = (i % 9) - (l.p % 9);
      if (x < 0 || y < 0) return false;
      if (l.r & 1) {
        const t = y;
        y = x;
        x = t;
      }
      if (x >= f.w || y >= f.h) return false;
      if (l.m ^ (l.r === 1 || l.r === 2)) x = f.w - x - 1;
      if (l.r === 2 || l.r === 3) y = f.h - y - 1;
      return f.arr[y][x];
    };
    let lastUpdate = 0;
    let wasChanged = false;
    function update(inv) {
      if (!wasChanged) return;
      wasChanged = false;
      cacheTTFossil = undefined;
      cacheTTSlot = undefined;
      dust = new Array(54).fill(false);
      dirt = new Array(54).fill(false);
      trea = new Array(54).fill(false);
      dc = 0;
      charges = -1;
      let d;
      for (let i = 0; i < 54; i++) {
        let item = inv.func_70301_a(i);
        if (item === null) continue;
        if (whatIsThisCringeShit.func_177774_c(item.func_77973_b()).toString() !== 'minecraft:stained_glass_pane') continue;
        let dmg = item.func_77960_j();
        dust[i] = dmg === 0;
        dirt[i] = dmg !== 0/* && dmg !== 5*/;
        trea[i] = dmg === 5;
        if (dust[i]) {
          d = item;
          dc++;
        } else if (dirt[i] && charges === -1) {
          const tag = item.func_77978_p().func_74775_l('display');
          const lore = tag.func_150295_c('Lore', 8);
          for (let i = 0; i < lore.func_74745_c(); i++) {
            let m = lore.func_150307_f(i).match(/^§7Chisel Charges Remaining: §.(\d+)$/);
            if (m) {
              charges = +m[1];
              break;
            }
          }
        }
      }
      if (charges === 0 && settings.excavatorSolverAutoClose) {
        Client.scheduleTask(3, () => Client.currentGui.close());
        return;
      }
      // indentation go brrr
      if (d && size === 0) {
        const tag = d.func_77978_p().func_74775_l('display');
        const lore = tag.func_150295_c('Lore', 8);
        for (let i = 0; i < lore.func_74745_c(); i++) {
          let m = lore.func_150307_f(i).match(/^§7Fossil Excavation Progress: §.([\d.]+)%$/);
          if (m) {
            size = Math.round(100 / (+m[1]) * dc);
            break;
          }
        }
      }
      // have to regenerate because people left clicking may cause false "empty" slots
      poss = [];
      fossils.forEach((v, i) => {
        if (size > 0 && v.size !== size) return;
        for (let y = 0; y <= 6 - v.h; y++) {
          for (let x = 0; x <= 9 - v.w; x++) {
            poss.push({ f: i, p: (y * 9) + x, r: 0, m: false });
            poss.push({ f: i, p: (y * 9) + x, r: 2, m: false });
            if (v.a) {
              poss.push({ f: i, p: (y * 9) + x, r: 0, m: true });
              poss.push({ f: i, p: (y * 9) + x, r: 2, m: true });
            }
          }
        }
        for (let y = 0; y <= 6 - v.w; y++) {
          for (let x = 0; x <= 9 - v.h; x++) {
            poss.push({ f: i, p: (y * 9) + x, r: 1, m: false });
            poss.push({ f: i, p: (y * 9) + x, r: 3, m: false });
            if (v.a) {
              poss.push({ f: i, p: (y * 9) + x, r: 1, m: true });
              poss.push({ f: i, p: (y * 9) + x, r: 3, m: true });
            }
          }
        }
      });
      poss = poss.filter(v => {
        if (size > 0 && fossils[v.f].size !== size) return false;
        for (let i = 0; i < 54; i++) {
          if ((!dirt[i]/* || trea[i]*/) && (test(v, i) ^ dust[i])) return false;
        }
        return true;
      });
      inv.func_110133_a(`${poss.length} Orientations | ${charges} Charges`);
      if (poss.length === 0) return;
      hist = new Array(54).fill(0);
      poss.forEach(v => {
        // fight me
        for (let i = 0; i < 54; i++) {
          if (!dirt[i]/* || trea[i]*/) continue;
          if (test(v, i)) hist[i]++;
        }
      });

      let best = hist.reduce((a, v, i) => hist[a] > v ? a : i, 0);
      for (let i = 0; i < 54; i++) {
        if (!dirt[i] || trea[i]) continue;
        let c = 0;
        if (hist[i] === 0) c = 15;
        else if (hist[i] === poss.length || (settings.excavatorSolverOnlyShowBest && hist[i] === hist[best]) || i === best) c = 11;
        else if (hist[i] < 0.25 * poss.length) c = 14;
        else if (hist[i] < 0.50 * poss.length) c = 1;
        else if (hist[i] < 0.75 * poss.length) c = 4;
        else c = 13;
        if ((!settings.excavatorSolverOnlyShowBest || c === 11) && (!settings.excavatorSolverShowRoute || dc > 0)) inv.func_70301_a(i).func_77964_b(c);
      }

      if (settings.excavatorSolverShowRoute && dc === 0) route.some((v, i) => {
        if (!dirt[v]) return false;
        inv.func_70301_a(v).func_77964_b(2);
        if (i !== route.length - 1) inv.func_70301_a(route[i + 1])?.func_77964_b(3);
        return true;
      });
    }
    let cacheTTFossil;
    let cacheTTSlot;
    function onToolTip(evn) {
      if (Client.currentGui.get() !== gui) return tooltipReg.unregister();
      const item = evn.itemStack;
      if (!item || whatIsThisCringeShit.func_177774_c(item.func_77973_b()).toString() !== 'minecraft:stained_glass_pane') return;
      const opt = item.func_77960_j() === 0 ? settings.excavatorSolverDustTooltip : settings.excavatorSolverDirtTooltip;
      if (opt === 'Default') return;
      else {
        if (!helper) return log('cannot hide tooltips without helper mod :(');
        helper.clearTooltip(evn);
        if (opt === 'Custom') {
          if (item.func_77960_j() === 0) {
            if (!cacheTTFossil) {
              cacheTTFossil = [];
              let fossilTypes = new Array(fossils.length).fill(0);
              poss.forEach(v => fossilTypes[v.f]++);
              fossilTypes = fossilTypes.map((v, i) => [v, fossilNames[i]]).filter(v => v[0] > 0).sort((a, b) => b[0] - a[0]);
              fossilTypes = fossilTypes.map(([v, n]) => `${colorForNumber(v, poss.length)}${(v / poss.length * 100).toFixed(0)}% §6${n}`).join('§7, ');
              cacheTTFossil.push(`§7Type: ${fossilTypes}`);
              cacheTTFossil.push(`${colorForNumber(dc, size)}${dc}§7/${size}`);
            }
            cacheTTFossil.forEach(v => helper.addTooltip(evn, v));
          } else {
            if (poss.length === 0) return;
            let i = 0;
            if (cacheTTSlot !== undefined && inv.func_70301_a(cacheTTSlot) === item) i = cacheTTSlot;
            else {
              for (; i < 54; i++) {
                if (inv.func_70301_a(i) === item) break;
              }
              if (i === 54) return;
            }
            helper.addTooltip(evn, `${colorForNumber(hist[i], poss.length)}${(hist[i] / poss.length * 100).toFixed(0)}%`);
          }
        }
      }
    }
    tooltipReg?.unregister();
    tooltipReg = regForge(net.minecraftforge.event.entity.player.ItemTooltipEvent, undefined, onToolTip).register();
    const cb = new JavaAdapter(Java.type('net.minecraft.inventory.IInvBasic'), {
      func_76316_a(inv) {
        wasChanged = true;
        const t = Date.now();
        // cringe shit gets called ~100 times per click
        if (t - lastUpdate <= 100) return;
        lastUpdate = t;
        update(inv);
        Client.scheduleTask(1, () => update(inv));
        Client.scheduleTask(2, () => update(inv));
        Client.scheduleTask(3, () => update(inv));
        Client.scheduleTask(4, () => update(inv));
      }
    });
    inv.func_110134_a(cb);
    // inv.func_110132_b(cb); // remove hook
  });
});

export function init() { }
export function load() {
  guiReg.register();
}
export function unload() {
  guiReg.unregister();
  tooltipReg?.unregister();
}