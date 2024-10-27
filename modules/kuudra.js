import { renderOutline, drawArrow2D, getRenderX, getRenderY, getRenderZ, renderBeaconBeam, renderLine3D, renderString, renderWaypoint } from '../util/draw';
import settings from '../settings';
import data from '../data';
import createTextGui from '../util/customtextgui';
import { colorForNumber, execCmd } from '../util/format';
import reg from '../util/registerer';
import { StateProp, StateVar } from '../util/state';
import { createBossBar, getEyeHeight, setBossBar } from '../util/mc';
import { countItems } from '../util/skyblock';
import { run, unrun } from '../util/threading';
const { gsl_sf_lambert_W0: W, intersectPL, fastDistance } = require('../util/math');

/**
 * t_{heta}=y_{aw}+90
 * p_{hi}=p_{itch}+90
 * v=1.5
 * a=-0.03
 * d=-0.01
 * v_{x}\left(t\right)=\left(1+d\right)^{t}v\sin\left(p_{hi}\right)\cos\left(t_{heta}\right)
 * v_{y}\left(t\right)=\left(1+d\right)^{t}v\cos\left(p_{hi}\right)+a\frac{\left(1+d\right)^{t}-1}{d}
 * v_{z}\left(t\right)=\left(1+d\right)^{t}v\sin\left(p_{hi}\right)\sin\left(t_{heta}\right)
 * p\left(t\right)=\left(\sum_{n=0}^{t-1}v_{x}\left(n\right)+x_{0},\sum_{n=0}^{t-1}v_{z}\left(n\right)+z_{0},\sum_{n=0}^{t-1}v_{y}\left(n\right)+y_{0}\right)
 * p\left(\left[0...100\right]\right)
 *
 * plug solution to y(t) into x, z to obtain new functions for landing point given angle
 * phi and solution to y(t) is same for both function so x is of form Ccos(theta) and z is of form Csin(theta)
 * use arctan to solve for theta
 *
 * pos_x(phi, theta) = (100 - 100 * 0.99 ^ y-1(phi)) * sin(phi) * cos(theta)
 */
const solvePearl = (function() {
  const y1 = (vy, y0) => 33.1664 * (1.00503 * vy + 0.00100503 * y0 + 3 * W(-0.122625 * Math.exp(-0.335011 * vy - 0.00335011 * y0) * (vy + 3)) + 3.0151);
  const m = (p, y) => v * (100 - 100 * (0.99 ** y)) * Math.sin(p);
  const a = -0.03;
  const v = 1.5;
  const v2 = v * v;
  const pe = (r, y) => {
    const r2 = r * r;
    const y2 = y * y;
    return Math.PI - Math.acos(- Math.sqrt((r2 * Math.sqrt(-a * a * r2 - 2 * a * y * v2 + v2 * v2) + a * r2 * y + r2 * v2 + 2 * y2 * v2) / (v2 * (r2 + y2))) * Math.SQRT1_2);
  };
  return function(dx, dy, dz) {
    const theta = Math.atan2(dz, dx);
    let dp = 1 / 180 * Math.PI;
    // const err = 0.001 / 180 * Math.PI;
    const err = 0.001;
    const R = Math.hypot(dx, dz);
    let phi = pe(R, -dy);
    if (Number.isNaN(phi)) return { theta: NaN, phi: NaN, ticks: NaN };
    let d = 1;
    let t, r;
    let i = 0;
    let pr = 0;
    rngcarried:
    do {
      let td = 0;
      do {
        phi += td * dp;
        // doesn't update t, rhino = :clown:
        // const t = ...;
        t = y1(v * Math.cos(phi), -dy);
        r = Math.abs(m(phi, t));
        if (td > 0 && r < pr) return { theta: NaN, phi: NaN, ticks: NaN };
        td = Math.sign(R - r);
        pr = r;
        if (td === 0) break rngcarried;
      } while (td === d && i++ < 100);
      d = td;
      dp /= 2;
    } while (/*dp > err*/ Math.abs(R - pr) > err && i < 100);
    return { theta, phi, ticks: t };
  };
}());

const dropLocsStatic = [
  { x: -110, y: 79, z: -106 },
  { x: -106, y: 79, z: -99 },
  { x: -106, y: 79, z: -113 },
  { x: -98, y: 79, z: -113 },
  { x: -94, y: 79, z: -106 },
  { x: -98, y: 79, z: -99 },

  { x: -139.5, y: 79, z: -90.5 }
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
const hpDisplay = createTextGui(() => data.kuudraHpLoc, () => ['&2300M']);
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
      renderLine3D(c, x - 1, y, z - 1, x + 1, y, z + 1, true, 2);
      renderLine3D(c, x - 1, y, z + 1, x + 1, y, z - 1, true, 2);
      renderString(Math.max(0, (timeLeft - v.ticks * 50) / 1000).toFixed(2) + 's', x, y + 1, z, c);
    });
  }
  if (settings.kuudraRenderEmptySupplySpot) dropLocs.forEach(v => renderWaypoint(v.x, v.y, v.z, 1, 1, settings.kuudraEmptySupplySpotColor, true));
  if (settings.kuudraBoxSupplies && supplies.length > 0) supplies.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    renderWaypoint(x, y, z, 3.6, 11.7, settings.kuudraBoxSuppliesGiantColor, settings.kuudraBoxSuppliesEsp, false);
    renderOutline(x - 3.25, y + 8, z + 2, 2.5, 2.5, settings.kuudraBoxSuppliesColor, settings.kuudraBoxSuppliesEsp, false);
    renderBeaconBeam(x - 2.5, y + 11, z + 2.75, settings.kuudraBoxSuppliesColor, settings.useScuffedBeacon, settings.kuudraBoxSuppliesEsp, false);
  });
  if (settings.kuudraBoxChunks && chunks.length > 0) chunks.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    renderOutline(x - 3.25, y + 8, z + 2, 2.5, 2.5, settings.kuudraBoxChunksColor, settings.kuudraBoxChunksEsp, false);
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
  if (settings.kuudraBoxKuudra && kuuder) renderOutline(kuuder.getX(), kuuder.getY(), kuuder.getZ(), 15, 15, settings.kuudraBoxKuudraColor, settings.kuudraBoxKuudraEsp);
}).setEnabled(new StateProp(settings._kuudraRenderPearlTarget).or(settings._kuudraRenderEmptySupplySpot).or(settings._kuudraBoxSupplies).or(settings._kuudraBoxChunks).or(settings._kuudraShowCannonAim).or(settings._kuudraBoxKuudra));

const tickReg = reg('tick', () => {
  run(() => {
    const px = Math.floor(Player.getX()) + 0.5;
    const py = Math.ceil(Player.getY() + getEyeHeight());
    const pz = Math.floor(Player.getZ()) + 0.5;
    pearlLocs = dropLocs.map(({ x, y, z }) => solvePearl(x - px, y - py, z - pz)).filter(v => !Number.isNaN(v.phi));
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
      if (h < 25_000) hpDisplay.setLine(`${colorForNumber(h / 25 * 30 / 100, 300)}${(h / 25 * 30 / 100).toPrecision(3)}M`);
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
  settings._moveKuudraHp.onAction(() => hpDisplay.edit());
}
export function load() {
  kuudraStartReg.register();
}
export function unload() {
  kuudraStartReg.unregister();
  reset();
}