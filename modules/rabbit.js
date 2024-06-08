import createAlert from '../util/alert';
import { pointTo3D, drawBoxAtBlock, drawBoxAtBlockNotVisThruWalls, drawBeaconBeam } from '../util/draw';
import settings from '../settings';
import reg from '../util/registerer';
import { getSbDate } from '../util/skyblock';
import { StateProp } from '../util/state';
import { DelayTimer } from '../util/timers';
import { getItemId, getLowerContainer, listenInventory } from '../util/mc';

const eggSpawnAlert = createAlert('Egg Spawned !');
const eggFoundAlert = createAlert('Egg Found !');
let eggs = [];
let activeEggs = [2, 2, 2];
let lastSpawnDays = [0, 0, 0];
function reset() {
  eggs = [];
  eggCollectReg.unregister();
  eggAlrCollectReg.unregister();
  // eggStepReg.unregister();
  eggRenWrldReg.unregister();
  eggRendOvReg.unregister();
  unloadReg.unregister();
}
function start() {
  unloadReg.register();
  eggCollectReg.register();
  eggAlrCollectReg.register();
  eggRenWrldReg.register();
  eggRendOvReg.register();
}
const unloadReg = reg('worldUnload', () => reset());
function scanEgg() {
  if (!settings.rabbitSniffer) return;
  const l = eggs.length;
  eggs = World.getAllEntities().filter(v => {
    if (v.getClassName() !== 'EntityArmorStand') return false;
    const nbt = v.entity.func_71124_b(4)?.func_77978_p();
    if (!nbt) return false;
    const id = nbt.func_74775_l('SkullOwner').func_74779_i('Id');
    return ['015adc61-0aba-3d4d-b3d1-ca47a68a154b', '55ae5624-c86b-359f-be54-e0ec7c175403', 'e67f7c89-3a19-3f30-ada2-43a3856e5028'].find((v, i) => activeEggs[i] === 2 && v === id);
  });
  if (settings.rabbitAlertEggFound && eggs.length > l) {
    start();
    Client.scheduleTask(() => eggFoundAlert.show(settings.rabbitAlertFoundTime));
  }
}
const eggSpawnReg = reg('step', () => {
  const { year, month, day, hour } = getSbDate();
  if (month > 3) return reset();
  start();
  const dayHash = year * 631 * 631 + month * 631 + day;
  let type;
  if (hour === 7) type = 0;
  else if (hour === 14) type = 1;
  else if (hour === 21) type = 2;
  else return;

  if (lastSpawnDays[type] === dayHash) return;
  lastSpawnDays[type] = dayHash;
  activeEggs[type] = 2;

  scanEgg();
  if (settings.rabbitAlertEggSpawn && (!settings.rabbitAlertOnlyDinner || activeEggs.every(v => v === 2))) eggSpawnAlert.show(settings.rabbitAlertFoundTime);
}).setDelay(5).setEnabled(new StateProp(settings._rabbitAlertEggSpawn).or(settings._rabbitSniffer));
const eggStepReg = reg('step', () => scanEgg()).setDelay(2).setEnabled(settings._rabbitSniffer);
const types = {
  Breakfast: 0,
  Lunch: 1,
  Dinner: 2
};
function onCollect(type) {
  activeEggs[types[type]] = 1;
  Client.scheduleTask(() => scanEgg());
}
const eggCollectReg = reg('chat', onCollect).setCriteria('&r&d&lHOPPITY\'S HUNT &r&dYou found a &r&${*}Chocolate ${type} Egg &r&d${*}').unregister();
const eggAlrCollectReg = reg('chat', onCollect).setCriteria('&r&cYou have already collected this Chocolate ${type} Egg&r&c! Try again when it respawns!&r').unregister();
const eggRenWrldReg = reg('renderWorld', () => {
  const c = settings.rabbitBoxColor;
  const r = ((c >> 24) & 0xFF) / 256;
  const g = ((c >> 16) & 0xFF) / 256;
  const b = ((c >> 8) & 0xFF) / 256;
  const a = ((c >> 0) & 0xFF) / 256;
  eggs.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    if (settings.rabbitBoxEsp) drawBoxAtBlock(x - 0.25, y + 1.5, z - 0.25, r, g, b, 0.5, 0.5, a);
    else drawBoxAtBlockNotVisThruWalls(x - 0.25, y + 1.5, z - 0.25, r, g, b, 0.5, 0.5, a);
    drawBeaconBeam(x - 0.5, y + 2.5, z - 0.5, r, g, b, a, !settings.rabbitBoxEsp);
  });
});
const eggRendOvReg = reg('renderOverlay', () => {
  if (eggs.length === 0) return;
  eggs.sort((a, b) => Player.asPlayerMP().distanceTo(a) - Player.asPlayerMP().distanceTo(b));
  pointTo3D(settings.rabbitBoxColor, eggs[0].getX(), eggs[0].getY() + 1.75, eggs[0].getZ(), false);
});

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
const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');
const promoteReg = reg('chat', (name, lvl, status, evn) => {
  if (!helper) return;
  const n = name.removeFormatting();
  cancel(evn);
  helper.deleteMessages([prevMessages[n]]);
  const msg = new Message(`${name}&7 -> Lvl &b${lvl} ${status}`);
  msg.chat();
  prevMessages[n] = msg.getFormattedText();
}).setCriteria('&r${name} &r&7has been promoted to &r&7[${lvl}&r&7] &r${status}&r&7!&r').setEnabled(settings._rabbitCondenseChat);

export function init() {
  settings._rabbitAlertSpawnSound.onAfterChange(v => eggSpawnAlert.sound = v);
  settings._rabbitAlertFoundSound.onAfterChange(v => eggFoundAlert.sound = v);
}
export function load() {
  eggSpawnReg.register();
  eggStepReg.register();
  guiReg.register();
  promoteReg.register();
}
export function unload() {
  eggSpawnReg.unregister();
  eggStepReg.unregister();
  guiReg.unregister();
  promoteReg.unregister();
  reset();
}