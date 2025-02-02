import createAlert from '../util/alert';
import { renderOutline, renderBeaconBeam, drawArrow3DPos, renderTracer } from '../util/draw';
import settings from '../settings';
import reg from '../util/registerer';
import { getSbDate } from '../util/skyblock';
import { StateProp, StateVar } from '../util/state';
import { DelayTimer } from '../util/timers';
import { getItemId, getLowerContainer, listenInventory } from '../util/mc';
import { run, unrun } from '../util/threading';
import { deleteMessages } from '../util/helper';

const stateIsSpring = new StateVar(false);
const stateDoSpring = new StateProp(settings._rabbitSniffer).and(stateIsSpring);

const eggSpawnAlert = createAlert('Egg Spawned !');
const eggFoundAlert = createAlert('Egg Found !');
let eggs = [];
let activeEggs = [2, 2, 2, 2, 2, 2];
let lastSpawnDays = [0, 0, 0, 0, 0, 0];
let foundPos = new Map();
const types = {
  Breakfast: 0,
  Lunch: 1,
  Dinner: 2,
  Brunch: 3,
  Déjeuner: 4,
  Supper: 5
};
const eggTextures = [
  'ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY3MzE0OSwKICAicHJvZmlsZUlkIiA6ICJiN2I4ZTlhZjEwZGE0NjFmOTY2YTQxM2RmOWJiM2U4OCIsCiAgInByb2ZpbGVOYW1lIiA6ICJBbmFiYW5hbmFZZzciLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYTQ5MzMzZDg1YjhhMzE1ZDAzMzZlYjJkZjM3ZDhhNzE0Y2EyNGM1MWI4YzYwNzRmMWI1YjkyN2RlYjUxNmMyNCIKICAgIH0KICB9Cn0',
  'ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjU2ODExMiwKICAicHJvZmlsZUlkIiA6ICI3NzUwYzFhNTM5M2Q0ZWQ0Yjc2NmQ4ZGUwOWY4MjU0NiIsCiAgInByb2ZpbGVOYW1lIiA6ICJSZWVkcmVsIiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzdhZTZkMmQzMWQ4MTY3YmNhZjk1MjkzYjY4YTRhY2Q4NzJkNjZlNzUxZGI1YTM0ZjJjYmM2NzY2YTAzNTZkMGEiCiAgICB9CiAgfQp9',
  'ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY0OTcwMSwKICAicHJvZmlsZUlkIiA6ICI3NGEwMzQxNWY1OTI0ZTA4YjMyMGM2MmU1NGE3ZjJhYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZXp6aXIiLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZTVlMzYxNjU4MTlmZDI4NTBmOTg1NTJlZGNkNzYzZmY5ODYzMTMxMTkyODNjMTI2YWNlMGM0Y2M0OTVlNzZhOCIKICAgIH0KICB9Cn0',
  'ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY3MzE0OSwKICAicHJvZmlsZUlkIiA6ICJiN2I4ZTlhZjEwZGE0NjFmOTY2YTQxM2RmOWJiM2U4OCIsCiAgInByb2ZpbGVOYW1lIiA6ICJBbmFiYW5hbmFZZzciLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYTQ5MzMzZDg1YjhhMzE1ZDAzMzZlYjJkZjM3ZDhhNzE0Y2EyNGM1MWI4YzYwNzRmMWI1YjkyN2RlYjUxNmMyNCIKICAgIH0KICB9Cn0',
  'ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjU2ODExMiwKICAicHJvZmlsZUlkIiA6ICI3NzUwYzFhNTM5M2Q0ZWQ0Yjc2NmQ4ZGUwOWY4MjU0NiIsCiAgInByb2ZpbGVOYW1lIiA6ICJSZWVkcmVsIiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzdhZTZkMmQzMWQ4MTY3YmNhZjk1MjkzYjY4YTRhY2Q4NzJkNjZlNzUxZGI1YTM0ZjJjYmM2NzY2YTAzNTZkMGEiCiAgICB9CiAgfQp9',
  'ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY0OTcwMSwKICAicHJvZmlsZUlkIiA6ICI3NGEwMzQxNWY1OTI0ZTA4YjMyMGM2MmU1NGE3ZjJhYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZXp6aXIiLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZTVlMzYxNjU4MTlmZDI4NTBmOTg1NTJlZGNkNzYzZmY5ODYzMTMxMTkyODNjMTI2YWNlMGM0Y2M0OTVlNzZhOCIKICAgIH0KICB9Cn0'
];
const unloadReg = reg('worldUnload', () => {
  eggs = [];
  list = [];
}).setEnabled(stateIsSpring);
const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
let list = [];
function scanEgg() {
  if (!settings.rabbitSniffer) return;
  unrun(() => list = World.getAllEntitiesOfType(EntityArmorStand));
  run(() => {
    const l = eggs.length;
    const { year, month, day, hour } = getSbDate();
    const dayHash = year * 631 * 631 + month * 631 + day;
    eggs = list.filter(v => {
      const nbt = v.entity.func_71124_b(4)?.func_77978_p();
      if (!nbt) return false;
      const tex = nbt.func_74775_l('SkullOwner')?.func_74775_l('Properties')?.func_150295_c('textures', 10)?.func_150305_b(0)?.func_74779_i('Value');
      const pos = `${~~v.getX()},${~~v.getY()},${~~v.getZ()}`;
      return eggTextures.find((v, i) => activeEggs[i] === 2 && v === tex && foundPos.get(`${pos}|${i % 3}`) !== dayHash);
    }).sort((a, b) => Player.asPlayerMP().distanceTo(a) - Player.asPlayerMP().distanceTo(b));
    if (settings.rabbitAlertEggFound && eggs.length > l) unrun(() => eggFoundAlert.show(settings.rabbitAlertFoundTime));
  });
}
const eggSpawnReg = reg('step', () => {
  unrun(() => {
    const { year, month, day, hour } = getSbDate();
    stateIsSpring.set(month <= 3);
    if (month > 3) return;
    const dayHash = year * 631 * 631 + month * 631 + day;
    let type;
    if (hour === 7) type = 0;
    else if (hour === 14) type = 1;
    else if (hour === 21) type = 2;
    else return;
    if (day & 1 === 0) type += 3;

    if (lastSpawnDays[type] === dayHash) return;
    lastSpawnDays[type] = dayHash;
    activeEggs[type] = 2;

    if (settings.rabbitAlertEggSpawn && (!settings.rabbitAlertOnlyDinner || activeEggs.every(v => v === 2))) eggSpawnAlert.show(settings.rabbitAlertFoundTime);
  });
}).setDelay(5).setEnabled(new StateProp(settings._rabbitAlertEggSpawn).or(settings._rabbitSniffer));
const eggStepReg = reg('step', () => scanEgg()).setDelay(1).setEnabled(stateDoSpring);
function onCollect(type) {
  const t = types[type];
  activeEggs[t] = 1;
  const e = eggs[0];
  if (e) {
    const tex = e.entity.func_71124_b(4)?.func_77978_p()?.func_74775_l('SkullOwner')?.func_74775_l('Properties')?.func_150295_c('textures', 10)?.func_150305_b(0)?.func_74779_i('Value');
    const i = eggTextures.indexOf(tex);
    if (i >= 0 && i === t % 3) {
      const { year, month, day, hour } = getSbDate();
      const dayHash = year * 631 * 631 + month * 631 + day;
      foundPos.set(`${~~e.getX()},${~~e.getY()},${~~e.getZ()}|${t % 3}`, dayHash);
    }
  }
  Client.scheduleTask(() => scanEgg());
}
const eggCollectReg = reg('chat', onCollect).setCriteria('&r&d&lHOPPITY\'S HUNT &r&dYou found a &r&${*}Chocolate ${type} Egg &r&d${*}').setEnabled(stateDoSpring);
const eggAlrCollectReg = reg('chat', onCollect).setCriteria('&r&cYou have already collected this Chocolate ${type} Egg&r&c! Try again when it respawns!&r').setEnabled(stateDoSpring);
const eggRenWrldReg = reg('renderWorld', () => {
  eggs.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    renderOutline(x, y + 1.5, z, 0.5, 0.5, settings.rabbitBoxColor, settings.rabbitBoxEsp);
    renderBeaconBeam(x, y + 2.5, z, settings.rabbitBoxColor, settings.useScuffedBeacon, settings.rabbitBoxEsp);
  });
  if (settings.preferUseTracer && eggs.length > 0) renderTracer(settings.rabbitBoxColor, eggs[0].getX(), eggs[0].getY() + 1.75, eggs[0].getZ(), false);
}).setEnabled(stateDoSpring);
const eggRendOvReg = reg('renderOverlay', () => {
  if (eggs.length > 0) drawArrow3DPos(settings.rabbitBoxColor, eggs[0].getX(), eggs[0].getY() + 1.75, eggs[0].getZ(), false);
}).setEnabled(new StateProp(settings._preferUseTracer).not().and(stateDoSpring));

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

export function init() {
  settings._rabbitAlertSpawnSound.listen(v => eggSpawnAlert.sound = v);
  settings._rabbitAlertFoundSound.listen(v => eggFoundAlert.sound = v);
}
export function load() {
  eggSpawnReg.register();
  eggStepReg.register();
  guiReg.register();
  promoteReg.register();
  unloadReg.register();
  eggCollectReg.register();
  eggAlrCollectReg.register();
  eggRenWrldReg.register();
  eggRendOvReg.register();
}
export function unload() {
  eggSpawnReg.unregister();
  eggStepReg.unregister();
  guiReg.unregister();
  promoteReg.unregister();
  unloadReg.unregister();
  eggCollectReg.unregister();
  eggAlrCollectReg.unregister();
  eggRenWrldReg.unregister();
  eggRendOvReg.unregister();
}