import { drawArrow2D, renderString, renderWaypoint } from '../util/draw';
import settings from '../settings';
import data from '../data';
import createTextGui from '../util/customtextgui';
import { colorForNumber, execCmd } from '../util/format';
import reg from '../util/registerer';
import { StateProp, StateVar } from '../util/state';
import { createBossBar, getEyeHeight, setBossBar } from '../util/mc';
import { countItems } from '../util/skyblock';
import { run, unrun } from '../util/threading';
import { getRenderX, getRenderY, getRenderZ, renderBeacon, renderBoxOutline, renderLine } from '../../Apelles/index';
const { intersectPL, fastDistance } = require('../util/math');

const dropLocsStatic = [
  { x: -110, y: 79, z: -106 },
  { x: -106, y: 79, z: -99 },
  { x: -106, y: 79, z: -113 },
  { x: -98, y: 79, z: -113 },
  { x: -94, y: 79, z: -106 },
  { x: -98, y: 79, z: -99 },

  { x: -139, y: 79, z: -90 }
];
let dropLocs = dropLocsStatic.slice();
let pearlLocs = [];
let supplies = [];
let chunks = [];
let ticksUntilPickup = 0;
let pickupStart = 0;
let pickupAmount = 0;
let lastPickUpdate = 0;
let lastPickUpdateTime = 0;
let isOnCannon = false;
let isT5 = new StateVar(false);
let kuuder;
const hpDisplay = createTextGui(() => data.kuudraHpLoc, () => ['&2240M']);
const renderReg = reg('renderWorld', () => {
  if (settings.kuudraRenderPearlTarget && pearlLocs.length > 0) {
    const c = settings.kuudraPearlTargetColor;
    const timeLeft = ticksUntilPickup - (Date.now() - lastPickUpdateTime);
    pearlLocs.forEach(v => {
      const { x, y, z } = intersectPL(
        Math.sin(v.phi) * Math.cos(v.theta),
        Math.cos(v.phi),
        Math.sin(v.phi) * Math.sin(v.theta),
        getRenderX(),
        getRenderY() + getEyeHeight(),
        getRenderZ(),
        0, 1, 0,
        0, 140, 0
      );
      renderLine(c, [[x - 1, y, z - 1], [x + 1, y, z + 1]], { phase: true, lw: 2 });
      renderLine(c, [[x - 1, y, z + 1], [x + 1, y, z - 1]], { phase: true, lw: 2 });
      renderString(Math.max(0, (timeLeft - v.ticks * 50) / 1000).toFixed(2) + 's', x, y + 1, z, c);
    });
  }
  if (settings.kuudraRenderEmptySupplySpot) dropLocs.forEach(v => renderWaypoint(v.x, v.y, v.z, 1, 1, settings.kuudraEmptySupplySpotColor, true));
  if (settings.kuudraBoxSupplies && supplies.length > 0) supplies.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    renderWaypoint(x, y, z, 3.6, 11.7, settings.kuudraBoxSuppliesGiantColor, settings.kuudraBoxSuppliesEsp, false);
    renderBoxOutline(settings.kuudraBoxSuppliesColor, x - 3.25, y + 8, z + 2, 2.5, 2.5, { phase: settings.kuudraBoxSuppliesEsp, centered: false, lw: 3 });
    renderBeacon(settings.kuudraBoxSuppliesColor, x - 2.5, y + 11, z + 2.75, { phase: settings.kuudraBoxSuppliesEsp, centered: false });
  });
  if (settings.kuudraBoxChunks && chunks.length > 0) chunks.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    renderBoxOutline(settings.kuudraBoxChunksColor, x - 3.25, y + 8, z + 2, 2.5, 2.5, { phase: settings.kuudraBoxChunksEsp, centered: false, lw: 3 });
  });
  if (settings.kuudraShowCannonAim && isOnCannon && Player.getY() > 60) {
    const theta = (Player.getX() > -100 ? 130 : 50) / 180 * Math.PI;
    const phi = 80 / 180 * Math.PI;
    const { x, y, z } = intersectPL(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
      getRenderX(), getRenderY() + getEyeHeight(), getRenderZ(),
      0, 0, 1,
      0, 0, -80
    );
    renderWaypoint(x, y, z, 1, 1, settings.kuudraCannonAimColor, true);
  }
  if (settings.kuudraBoxKuudra && kuuder) renderBoxOutline(settings.kuudraBoxKuudraColor, kuuder.getX(), kuuder.getY(), kuuder.getZ(), 15, 15, { phase: settings.kuudraBoxKuudraEsp, lw: 3 });
}).setEnabled(new StateProp(settings._kuudraRenderPearlTarget).or(settings._kuudraRenderEmptySupplySpot).or(settings._kuudraBoxSupplies).or(settings._kuudraBoxChunks).or(settings._kuudraShowCannonAim).or(settings._kuudraBoxKuudra));

const PearlHelper = Java.type('com.perseuspotter.chicktilshelper.PearlHelper');
const tickReg = reg('tick', () => {
  run(() => {
    const yaw = Player.getRawYaw() / 180 * Math.PI;
    const px = Player.getX() - Math.cos(yaw) * 0.16;
    const py = Player.getY() + getEyeHeight() - 0.1;
    const pz = Player.getZ() - Math.sin(yaw) * 0.16;
    pearlLocs = dropLocs.map(({ x, y, z }) => PearlHelper.solve(x - px, y - py, z - pz, 0.01)).filter(v => !Number.isNaN(v.phi));
  });
}).setEnabled(settings._kuudraRenderPearlTarget);
const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const EntityMagmaCube = Java.type('net.minecraft.entity.monster.EntityMagmaCube');
const updateReg1 = reg('step', () => {
  if (settings.kuudraBoxSupplies) {
    const s = supplies.filter(v => !v.isDead());
    unrun(() => supplies = s);
  }
  if (settings.kuudraBoxChunks) {
    const c = chunks.filter(v => !v.isDead());
    unrun(() => chunks = c);
  }
  unrun(() => {
    const ent = World.getAllEntities();
    run(() => ent.forEach(e => {
      if (e.entity instanceof EntityArmorStand && e.getName() === '§a§l✓ SUPPLIES RECEIVED ✓') unrun(() => {
        dropLocs.forEach(v => v.d = fastDistance(v.x - e.getX(), v.z - e.getZ()));
        dropLocs.sort((a, b) => a.d - b.d);
        if (dropLocs.length > 0 && dropLocs[0].d < 4) dropLocs.shift();
      });
      if (e.entity instanceof EntityMagmaCube && e.entity.func_70809_q() === 30 && e.entity.func_110143_aJ() <= 100_000) kuuder = new EntityLivingBase(e.entity);
    }));
  });
}).setFps(1);

const customBossBar = createBossBar('§6﴾ §c§lKuudra§6 ﴿', () => {
  if (!kuuder) return 100_000;
  const h = kuuder.getHP();
  if (h <= 25_000) return h * 4;
  return (h - 25_000) / 3 * 4;
}, 100_000);
const bossBarReg = reg('renderBossHealth', () => {
  setBossBar(customBossBar);
}).setEnabled(new StateProp(settings._kuudraCustomBossBar).and(isT5));

const supplyPickReg = reg('renderTitle', (title, sub) => {
  if (sub !== '§cDon\'t Move!§r') return;
  const m = title.match(/^§8\[(?:§.\|*)+§8\] §b(\d+)%§r$/);
  if (!m) return;
  const progress = +m[1];
  const t = Date.now();
  if (progress === 0) {
    if (t - pickupStart < 1000) return;
    pickupStart = t;
    ticksUntilPickup = 14 * 500;
    lastPickUpdate = progress;
    lastPickUpdateTime = t;
    return;
  }
  if (lastPickUpdate === progress) return;
  if (lastPickUpdate === 0) pickupAmount = progress;
  lastPickUpdate = progress;
  lastPickUpdateTime = t;
  ticksUntilPickup = Math.round(100 / pickupAmount - Math.round(progress / pickupAmount)) * 500;
}).setEnabled(settings._kuudraRenderPearlTarget);

const hideTitleReg = reg('renderTitle', (_, __, evn) => cancel(evn)).setEnabled(settings._kuudraDrawHpGui);
const hpOverlayReg = reg('renderOverlay', () => {
  if (kuuder) {
    let h = kuuder.getHP();
    if (isT5.get()) {
      if (h < 25_000) hpDisplay.setLine(`${colorForNumber(h / 25 * 24 / 100, 240)}${(h / 25 * 24 / 100).toPrecision(3)}M`);
      else hpDisplay.setLine(`${colorForNumber((h - 25_000) / 3 * 4 / 1000, 100)}${((h - 25_000) / 3 * 4 / 1000).toFixed(settings.kuudraDrawHpDec)}%`);
    } else hpDisplay.setLine(`${colorForNumber(h / 1000, 100)}${(h / 1000).toFixed(settings.kuudraDrawHpDec)}%`);
  } else hpDisplay.setLine('&4where is octo boi');
  hpDisplay.render();
}).setEnabled(settings._kuudraDrawHpGui);
const dirOverlayReg = reg('renderOverlay', () => {
  if (!kuuder) return;
  const kt =
    kuuder.getX() > -80 ? 0 :
      kuuder.getZ() > -85 ? 0.5 :
        kuuder.getX() < -120 ? 1 :
          1.5;
  drawArrow2D(settings.kuudraArrowToKuudraColor, kt * Math.PI, 20, Player.getY() > 60 ? 0 : undefined);
}).setEnabled(settings._kuudraDrawArrowToKuudra);

const EntityGiantZombie = Java.type('net.minecraft.entity.monster.EntityGiantZombie');
const entSpawnReg = reg('spawnEntity', ent => {
  if (!(ent instanceof EntityGiantZombie)) return;
  const e = new Entity(ent);
  const y = e.getY();
  if (y < 60) chunks.push(e);
  else if (y < 67) supplies.push(e);
  else if (y < 80) chunks.push(e);
}).setEnabled(new StateProp(settings._kuudraBoxSupplies).or(settings._kuudraBoxChunks));

const cannonReg = reg('chat', () => {
  isOnCannon = true;
  Client.scheduleTask(200, () => isOnCannon = false);
}).setChatCriteria('&r&aYou purchased Human Cannonball!&r').setEnabled(settings._kuudraShowCannonAim);

function onBuildStart() {
  dropLocs = [];
  pearlLocs = [];
  supplies = [];
  chunks = [];
  ticksUntilPickup = 0;
  pickupStart = 0;
  pickupAmount = 0;
  lastPickUpdate = 0;
  lastPickUpdateTime = 0;
  isOnCannon = false;
  supplyPickReg.unregister();
  cannonReg.register();
}

function reset() {
  entSpawnReg.unregister();
  onBuildStart();
  renderReg.unregister();
  tickReg.unregister();
  updateReg1.unregister();
  bossBarReg.unregister();

  buildStartReg.unregister();
  buildEndReg.unregister();
  dpsStartReg.unregister();
  kuudraLeaveReg.unregister();
  kuudraEndReg.unregister();

  cannonReg.unregister();
  hideTitleReg.unregister();
  hpOverlayReg.unregister();
  dirOverlayReg.unregister();
}
function start() {
  kuuder = null;
  isT5.set((Scoreboard.getLines().map(v => v.getName()).find(v => v.includes('⏣')) || '').slice(-2, -1) === '5');
  entSpawnReg.register();
  dropLocs = dropLocsStatic.slice();
  renderReg.register();
  tickReg.register();
  updateReg1.register();
  bossBarReg.register();
  supplyPickReg.register();

  buildStartReg.register();
  buildEndReg.register();
  dpsStartReg.register();
  kuudraLeaveReg.register();
  kuudraEndReg.register();

  if (settings.kuudraAutoRefillPearls) {
    const c = settings.kuudraAutoRefillPearlsAmount - countItems('ENDER_PEARL');
    if (c > 0) execCmd('gfs ENDER_PEARL ' + c);
  }
}

// const kuudraJoinReg = reg('chat', () => kuudra.emit('kuudraJoin')).setChatCriteria('&e[NPC] &cElle&f: &rTalk with me to begin!&r');
const kuudraStartReg = reg('chat', () => start()).setChatCriteria('&e[NPC] &cElle&f: &rOkay adventurers, I will go and fish up Kuudra!&r');
// const supplyStartReg = reg('chat', () => kuudra.emit('supplyStart')).setChatCriteria('&e[NPC] &cElle&f: &rNot again!&r');
const buildStartReg = reg('chat', () => onBuildStart()).setCriteria('&e[NPC] &cElle&f: &rOMG! Great work collecting my supplies!&r');
const buildEndReg = reg('chat', () => hpOverlayReg.register()).setCriteria('&e[NPC] &cElle&f: &rPhew! The Ballista is finally ready! It should be strong enough to tank Kuudra\'s blows now!&r');
// const stunReg = reg('chat', () => kuudra.emit('stun')).setChatCriteria('&e[NPC] &cElle&f: &rThat looks like it hurt! Quickly, while &cKuudra is distracted, shoot him with the Ballista&f!&r');
const dpsStartReg = reg('chat', () => {
  hideTitleReg.register();
  dirOverlayReg.register();
}).setChatCriteria('&e[NPC] &cElle&f: &rPOW! SURELY THAT\'S IT! I don\'t think he has any more in him!&r').setEnabled(isT5);
const kuudraEndReg = reg('chat', () => reset()).setChatCriteria('&r&f                               &r&6&lKUUDRA DOWN!&r');
const kuudraLeaveReg = reg('worldUnload', () => reset());

export function init() {
  settings._moveKuudraHp.onAction(v => hpDisplay.edit(v));
}
export function load() {
  kuudraStartReg.register();
}
export function unload() {
  kuudraStartReg.unregister();
  reset();
}