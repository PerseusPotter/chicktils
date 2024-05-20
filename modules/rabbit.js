import createAlert from '../util/alert';
import { pointTo3D, drawBoxAtBlock, drawBoxAtBlockNotVisThruWalls, drawBeaconBeam } from '../util/draw';
import settings from '../settings';
import { reg } from '../util/registerer';

const eggSpawnAlert = createAlert('Egg Spawned !');
const eggFoundAlert = createAlert('Egg Found !');
let eggs = [];
let activeEggs = [2, 2, 2];
function reset() {
  eggs = [];
  // activeEggs = [2, 2, 2];
  eggCollectReg.unregister();
  eggAlrCollectReg.unregister();
  // eggStepReg.unregister();
  eggRenWrldReg.unregister();
  eggRendOvReg.unregister();
  unloadReg.unregister();
  eggStepReg.setDelay(2);
}
function start() {
  unloadReg.register();
  eggCollectReg.register();
  eggAlrCollectReg.register();
  eggRenWrldReg.register();
  eggRendOvReg.register();
  eggStepReg.setFps(5);
}
const unloadReg = reg('worldUnload', () => reset());
function scanEgg() {
  const l = eggs.length;
  eggs = World.getAllEntities().filter(v => {
    if (v.getClassName() !== 'EntityArmorStand') return false;
    const nbt = v.entity.func_71124_b(4)?.func_77978_p();
    if (!nbt) return false;
    const id = nbt.func_74775_l('SkullOwner').func_74779_i('Id');
    return ['015adc61-0aba-3d4d-b3d1-ca47a68a154b', '55ae5624-c86b-359f-be54-e0ec7c175403', 'e67f7c89-3a19-3f30-ada2-43a3856e5028'].find((v, i) => activeEggs[i] === 2 && v === id);
  });
  if (eggs.length > l) {
    start();
    Client.scheduleTask(() => eggFoundAlert.show(settings.rabbitAlertTime));
  }
}
const types = {
  Breakfast: 0,
  Lunch: 1,
  Dinner: 2
};
const eggSpawnReg = reg('chat', type => {
  // if (type === 'Breakfast') eggs = activeEggs = [];
  start();
  for (let i = 0; i <= types[type]; i++) {
    if (activeEggs[i] !== 1) activeEggs[i] = 2;
  }
  activeEggs[types[type]] = 2;
  scanEgg();
  if (!settings.rabbitAlertOnlyDinner || type === 'Dinner') eggSpawnAlert.show(settings.rabbitAlertTime);
}).setCriteria('&r&d&lHOPPITY\'S HUNT &r&dA &r&${*}Chocolate ${type} Egg &r&dhas appeared!&r');
const eggStepReg = reg('step', () => scanEgg()).setDelay(2);
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

const lowerInvF = Java.type('net.minecraft.client.gui.inventory.GuiChest').class.getDeclaredField('field_147015_w');
lowerInvF.setAccessible(true);
const whatIsThisCringeShit = Java.type('net.minecraft.item.Item').field_150901_e;
const guiReg = reg('guiOpened', evn => {
  if (!settings.rabbitShowBestUpgrade) return;
  const gui = evn.gui;
  if (gui.getClass().getSimpleName() !== 'GuiChest') return;
  // net.minecraft.client.player.inventory.ContainerLocalMenu
  const inv = lowerInvF.get(gui);
  const name = inv.func_70005_c_();
  if (name !== 'Chocolate Factory') return;
  Client.scheduleTask(() => {
    if (inv.func_70301_a(0).func_77960_j() !== 15) return;
    let lastUpdate = 0;
    let wasChanged = false;
    function update(inv) {
      if (!wasChanged) return;
      wasChanged = false;
      const rabbits = [29, 30, 31, 32, 33]
        .map(v => ({ a: v, v: inv.func_70301_a(v) }))
        .filter(({ v }) => v &&
          whatIsThisCringeShit.func_177774_c(v.func_77973_b()).toString() === 'minecraft:skull'
        )
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
          return { a, u: (a - 28) / cost, v };
        });
      if (rabbits.length > 0) {
        const bestRabbit = rabbits.reduce((a, v) => a.u < v.u ? v : a, rabbits[0]);
        if (bestRabbit.u === 0) return;
        for (let i = 29; i <= 33; i++) {
          inv.func_70301_a(i - 9).func_77964_b(15);
        }
        inv.func_70301_a(bestRabbit.a - 9).func_77964_b(5);
      }
    }
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
}).setCriteria('&r${name} &r&7has been promoted to &r&7[${lvl}&r&7] &r${status}&r&7!&r');

export function init() {
  settings._rabbitAlertSound.onAfterChange(v => eggSpawnAlert.sound = eggFoundAlert.sound = v);
  settings._rabbitCondenseChat.onAfterChange(v => {
    if (v) promoteReg.register();
    else promoteReg.unregister();
  })
}
export function load() {
  eggSpawnReg.register();
  eggStepReg.register();
  guiReg.register();
}
export function unload() {
  eggSpawnReg.unregister();
  eggStepReg.unregister();
  guiReg.unregister();
  reset();
}