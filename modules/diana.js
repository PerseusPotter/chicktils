import settings from '../settings';
import data from '../data';
import { reg } from '../util/registerer';
import { log } from '../util/log';
import createAlert from '../util/alert';
import { pointTo3D } from '../util/draw';
import { lineRectColl } from '../util/math';
import { execCmd } from '../util/format';

const warps = [
  {
    name: 'hub',
    loc: [-2.5, 70, -69.5],
    pos: 13,
    cost: 0
  },
  {
    name: 'castle',
    loc: [-250, 130, 45],
    pos: 20,
    cost: 10
  },
  {
    name: 'da',
    loc: [91.5, 75, 173.5],
    pos: 21,
    cost: 50
  },
  // crypt
  {
    name: 'museum',
    loc: [-75.5, 76, 80.5],
    pos: 23,
    cost: 10
  },
  {
    name: 'wizard_tower',
    loc: [42.5, 122, 69],
    pos: 24,
    cost: 30
  }
];

const lowerInvF = Java.type('net.minecraft.client.gui.inventory.GuiChest').class.getDeclaredField('field_147015_w');
lowerInvF.setAccessible(true);
const whatIsThisCringeShit = Java.type('net.minecraft.item.Item').field_150901_e;
const warpOpenReg = reg('guiOpened', evn => {
  const gui = evn.gui;
  if (gui.getClass().getSimpleName() !== 'GuiChest') return;
  // net.minecraft.client.player.inventory.ContainerLocalMenu
  const inv = lowerInvF.get(gui);
  const name = inv.func_70005_c_();
  if (name !== 'Hub Warps') return;
  Client.scheduleTask(() => {
    data.unlockedHubWarps = warps.map(v => {
      const item = inv.func_70301_a(v.pos);
      if (!item) return false;
      return whatIsThisCringeShit.func_177774_c(item.func_77973_b()).toString() === 'minecraft:paper';
    });
  });
});

const burrowFoundAlert = createAlert('Burrow Found');
let numNotStartBurrows = 0;
let targetLoc = null;
const renderOvReg = reg('renderOverlay', () => {
  if (targetLoc) pointTo3D(settings.dianaArrowToBurrowColor, targetLoc[0], targetLoc[1], targetLoc[2], false);
});
const GriffinBurrows = Java.type('gg.skytils.skytilsmod.features.impl.events.GriffinBurrows');
// 0 repetition, clean code
const tickReg = reg('tick', () => {
  let burrowCount = 0;
  let closest;
  let closestD;
  GriffinBurrows.INSTANCE.getParticleBurrows().forEach((k, v) => {
    const t = v.getType().get();
    if (t === 0) return;
    burrowCount++;
    if (!settings.dianaPreferFinish) return;
    const d = Math.hypot(Player.getX() - v.getX(), Player.getY() - v.getY(), Player.getZ() - v.getZ());
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
  });
  if (burrowCount > numNotStartBurrows) burrowFoundAlert.show(settings.dianaAlertFoundBurrowTime);
  numNotStartBurrows = burrowCount;
  if (closest) return targetLoc = [closest.getX(), closest.getY(), closest.getZ()];

  if (!settings.dianaPreferFinish) GriffinBurrows.INSTANCE.getParticleBurrows().forEach((k, v) => {
    const d = Math.hypot(Player.getX() - v.getX(), Player.getY() - v.getY(), Player.getZ() - v.getZ());
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
  });
  GriffinBurrows.BurrowEstimation.INSTANCE.getGuesses().forEach((k, v) => {
    const d = Math.hypot(Player.getX() - k.getX(), Player.getY() - k.getY(), Player.getZ() - k.getZ());
    if (!closest || d < closestD) {
      closest = k;
      closestD = d;
    }
  });
  if (closest) return targetLoc = [closest.getX(), closest.getY(), closest.getZ()];
  if (!settings.dianaPreferFinish) return targetLoc = null;
  GriffinBurrows.INSTANCE.getParticleBurrows().forEach((k, v) => {
    const d = Math.hypot(Player.getX() - v.getX(), Player.getY() - v.getY(), Player.getZ() - v.getZ());
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
  });
  if (closest) targetLoc = [closest.getX(), closest.getY(), closest.getZ()];
  else targetLoc = null;
});
const startBurrowReg = reg('chat', () => {
  numNotStartBurrows = 0;
  renderOvReg.register();
  tickReg.register();
}).setCriteria('&r&eYou dug out a Griffin Burrow! &r&7(1/4)&r');
const unloadReg = reg('worldUnload', () => {
  renderOvReg.unregister();
  tickReg.unregister();
});

const warpKey = new KeyBind('Diana Warp', 0, 'ChickTils');
warpKey.registerKeyRelease(() => {
  if (!targetLoc) return;
  if (data.unlockedHubWarps.length === 0) return log('open warps menu pweese');
  let best = null;
  let bestD = Math.hypot(Player.getX() - targetLoc[0], Player.getY() - targetLoc[1], Player.getZ() - targetLoc[2]);
  if (lineRectColl(Player.getX(), Player.getZ(), targetLoc[0], targetLoc[2], -60, 0, 90, 70)) bestD += 50;
  warps.forEach((v, i) => {
    if (!data.unlockedHubWarps[i]) return;
    const d = Math.hypot(Player.getX() - v.loc[0], Player.getY() - v.loc[1], Player.getZ() - v.loc[2]) + v.cost;
    if (d < bestD) {
      bestD = d;
      best = v.name;
    }
  });
  if (best) execCmd('warp ' + best);
});

export function init() { }
export function load() {
  if (!GriffinBurrows) return log('requires skytils');
  warpOpenReg.register();
  startBurrowReg.register();
  unloadReg.register();
}
export function unload() {
  warpOpenReg.unregister();
  startBurrowReg.unregister();
  unloadReg.unregister();
}