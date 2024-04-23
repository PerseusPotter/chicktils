import { drawBoxAtBlock, drawBoxAtBlockNotVisThruWalls, renderArrowTo, renderWaypoints } from '../util/draw';
import settings from '../settings';
import data from '../data';
import drawBeaconBeam from '../../BeaconBeam/index';
import createTextGui from '../util/customtextgui';
import { colorForNumber } from '../util/format';
import { reg, regForge } from '../util/registerer';
const { gsl_sf_lambert_W0: W, intersectPL } = require('../util/math');

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
  { x: -98, y: 79, z: -99 }
];
let dropLocs = dropLocsStatic.slice();
let pearlLocs = [];
let supplies = [];
let chunks = [];
let ticksUntilPickup = 0;
let pickupStart = 0;
let lastPickUpdate = 0;
let isOnCannon = false;
let isT5 = false;
let kuuder;
let hasBuildEnded = false;
const hpDisplay = createTextGui(() => data.kuudraHpLoc, () => ['&d300M']);
const renderReg = reg('renderWorld', () => {
  if (settings.kuudraRenderPearlTarget && pearlLocs.length > 0) {
    const c = settings.kuudraPearlTargetColor;
    const r = ((c >> 24) & 0xFF) / 256;
    const g = ((c >> 16) & 0xFF) / 256;
    const b = ((c >> 8) & 0xFF) / 256;
    // const a = ((c >> 0) & 0xFF) / 256;

    const ticksLeft = ticksUntilPickup - (Date.now() - pickupStart);
    pearlLocs.forEach(v => v.text = Math.max(0, (ticksLeft - v.ticks * 50) / 1000).toFixed(2) + 's');
    renderWaypoints(pearlLocs, r, g, b);
  }
  if (settings.kuudraRenderEmptySupplySpot && dropLocs.length > 0) {
    const c = settings.kuudraEmptySupplySpotColor;
    const r = ((c >> 24) & 0xFF) / 256;
    const g = ((c >> 16) & 0xFF) / 256;
    const b = ((c >> 8) & 0xFF) / 256;
    // const a = ((c >> 0) & 0xFF) / 256;
    renderWaypoints(dropLocs, r, g, b);
  }
  if (settings.kuudraBoxSupplies && supplies.length > 0) {
    const c = settings.kuudraBoxSuppliesColor;
    const r = ((c >> 24) & 0xFF) / 256;
    const g = ((c >> 16) & 0xFF) / 256;
    const b = ((c >> 8) & 0xFF) / 256;
    const a = ((c >> 0) & 0xFF) / 256;

    supplies.forEach(v => {
      const x = v.getRenderX();
      const y = v.getRenderY();
      const z = v.getRenderZ();
      if (settings.kuudraBoxSuppliesEsp) drawBoxAtBlock(x - 3.25, y + 8, z + 2, r, g, b, 2.5, 2.5, a);
      else drawBoxAtBlockNotVisThruWalls(x - 3.25, y + 8, z + 2, r, g, b, 2.5, 2.5, a);
      drawBeaconBeam(x - 2.5, y + 11, z + 2.75, r, g, b, a, false);
    });
  }
  if (settings.kuudraBoxChunks && chunks.length > 0) {
    const c = settings.kuudraBoxChunksColor;
    const r = ((c >> 24) & 0xFF) / 256;
    const g = ((c >> 16) & 0xFF) / 256;
    const b = ((c >> 8) & 0xFF) / 256;
    const a = ((c >> 0) & 0xFF) / 256;

    chunks.forEach(v => {
      const x = v.getRenderX();
      const y = v.getRenderY();
      const z = v.getRenderZ();
      if (settings.kuudraBoxSuppliesEsp) drawBoxAtBlock(x - 3.25, y + 8, z + 2, r, g, b, 2.5, 2.5, a);
      else drawBoxAtBlockNotVisThruWalls(x - 3.25, y + 8, z + 2, r, g, b, 2.5, 2.5, a);
    });
  }
  if (settings.kuudraShowCannonAim && isOnCannon && Player.getY() > 60) {
    const theta = (Player.getX() > -100 ? 130 : 50) / 180 * Math.PI;
    const phi = 80 / 180 * Math.PI;
    const c = settings.kuudraCannonAimColor;
    const r = ((c >> 24) & 0xFF) / 256;
    const g = ((c >> 16) & 0xFF) / 256;
    const b = ((c >> 8) & 0xFF) / 256;
    // const a = ((c >> 0) & 0xFF) / 256;
    renderWaypoints([{
      ...intersectPL(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
        Player.getX(), Player.getY(), Player.getZ(),
        0, 0, 1,
        0, 0, -80
      ),
      w: 1,
      h: 1
    }], r, g, b);
  }
  if (settings.kuudraBoxKuudra && kuuder) {
    const c = settings.kuudraBoxKuudraColor;
    const r = ((c >> 24) & 0xFF) / 256;
    const g = ((c >> 16) & 0xFF) / 256;
    const b = ((c >> 8) & 0xFF) / 256;
    const a = ((c >> 0) & 0xFF) / 256;
    if (settings.kuudraBoxKuudraEsp) drawBoxAtBlock(kuuder.getX() - 7.5, kuuder.getY(), kuuder.getZ() - 7.5, r, g, b, 15, 15, a);
    else drawBoxAtBlockNotVisThruWalls(kuuder.getX() - 7.5, kuuder.getY(), kuuder.getZ() - 7.5, r, g, b, 15, 15, a);
  }
});

const tickReg = reg('tick', () => {
  if (settings.kuudraRenderPearlTarget) {
    pearlLocs = dropLocs.map(({ x, y, z }) => {
      let { phi, theta, ticks } = solvePearl(
        x - Player.getX(),
        y - (Player.getY() + 1.5),
        z - Player.getZ()
      );
      if (Number.isNaN(phi)) return;
      return {
        ...intersectPL(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta),
          Player.getX(),
          Player.getY() + 1.5,
          Player.getZ(),
          0, 1, 0,
          0, 140, 0
        ),
        w: 1,
        h: 1,
        ticks
      };
    }).filter(Boolean);
  }
});
const kuudraName = new TextComponent('§6﴾ §c§lKuudra§6 ﴿').chatComponentText;
// https://github.com/Marcelektro/MCP-919/blob/main/temp/src/minecraft/net/minecraft/entity/boss/BossStatus.java
const customBossBar = new JavaAdapter(Java.type('net.minecraft.entity.boss.IBossDisplayData'), {
  func_145748_c_() {
    return kuudraName;
  },
  func_110143_aJ() {
    if (!kuuder) return 100_000;
    const h = kuuder.getHP();
    if (h <= 25_000) return h * 4;
    return (h - 25_000) / 3 * 4;
  },
  func_110138_aP() {
    return 100_000;
  }
});
const updateReg1 = reg('step', () => {
  World.getAllEntities().forEach(e => {
    if (e.getName() === '§a§l✓ SUPPLIES RECEIVED ✓') {
      dropLocs.forEach(v => v.d = (v.x - e.getX()) ** 2 + (v.z - e.getZ()) ** 2);
      dropLocs.sort((a, b) => a.d - b.d);
      if (dropLocs.length > 0 && dropLocs[0].d < 4) dropLocs.shift();
    }
    if (e.getClassName() === 'EntityMagmaCube' && e.entity.func_70809_q() === 30 && e.entity.func_110143_aJ() <= 100_000) kuuder = new EntityLivingBase(e.entity);
  });
  if (settings.kuudraBoxSupplies) supplies = supplies.filter(v => !v.isDead());
  if (settings.kuudraBoxChunks) chunks = chunks.filter(v => !v.isDead());
}).setFps(1);
const bossBarReg = reg('renderBossHealth', () => {
  if (isT5 && settings.kuudraCustomBossBar) Java.type('net.minecraft.entity.boss.BossStatus').func_82824_a(customBossBar, false);
});

const supplyPickReg = reg('renderTitle', (title, sub) => {
  if (sub !== '§cDon\'t Move!§r') return;
  const m = title.match(/^§8\[(?:§.\|*)+§8\] §b(\d+)%§r$/);
  if (!m) return;
  const progress = +m[1];
  const t = Date.now();
  if (progress === 0) {
    if (pickupStart && t - pickupStart < 1000) return;
    pickupStart = t;
    ticksUntilPickup = 14 * 500;
    lastPickUpdate = progress;
    return;
  }
  if (lastPickUpdate > 0) return;
  ticksUntilPickup = Math.floor(100 / progress) * 500;
  lastPickUpdate = progress;
});

const hideTitleReg = reg('renderTitle', (_, __, evn) => settings.kuudraDrawHpGui && cancel(evn));
const hpOverlayReg = reg('renderOverlay', () => {
  if (!settings.kuudraDrawHpGui || !hasBuildEnded) return;
  if (kuuder) {
    let h = kuuder.getHP();
    if (isT5) {
      if (h < 25_000) hpDisplay.setLine(`${colorForNumber(h / 25 * 30 / 100, 300)}${(h / 25 * 30 / 100).toPrecision(3)}M`);
      else hpDisplay.setLine(`${colorForNumber((h - 25_000) / 3 * 4 / 1000, 100)}${((h - 25_000) / 3 * 4 / 1000).toFixed(settings.kuudraDrawHpDec)}%`);
    } else hpDisplay.setLine(`${colorForNumber(h / 1000, 100)}${(h / 1000).toFixed(settings.kuudraDrawHpDec)}%`);
  } else hpDisplay.setLine('&4where is octo boi');
  hpDisplay.render();
});
const dirOverlayReg = reg('renderOverlay', () => {
  if (!settings.kuudraDrawArrowToKuudra || !kuuder) return;
  const kt =
    kuuder.getX() > -80 ? 0 :
      kuuder.getZ() > -85 ? 0.5 :
        kuuder.getX() < -120 ? 1 :
          1.5;
  renderArrowTo(settings.kuudraArrowToKuudraColor, kt * Math.PI, 20, Player.getY() > 60 ? 0 : Player.getYaw());
});

let regInst = regForge(net.minecraftforge.event.entity.EntityJoinWorldEvent, undefined, entitySpawn);
function entitySpawn(evn) {
  if (evn.entity.getClass().getSimpleName() === 'EntityGiantZombie') {
    const e = new Entity(evn.entity);
    const y = e.getY();
    if (y < 60) chunks.push(e);
    else if (y < 67) supplies.push(e);
    else if (y < 80) chunks.push(e);
  }
}

const cannonReg = reg('chat', () => {
  isOnCannon = true;
  Client.scheduleTask(() => isOnCannon = false, 200);
}).setChatCriteria('&r&aYou purchased Human Cannonball!&r');

function addPearls() {
  if (!settings.kuudraAutoRefillPearls) return;
  const inv = Player.getInventory();
  if (!inv) return;
  let total = 0;
  inv.getItems().forEach(v => {
    if (!v) return;
    const nbt = v.getNBT().getCompoundTag('tag').getCompoundTag('ExtraAttributes');
    if (!nbt) return;
    if (nbt.getString('id') === 'ENDER_PEARL') total += v.getStackSize();
  });
  const count = Math.max(0, settings.kuudraAutoRefillPearlsAmount - total);
  if (count > 0) ChatLib.command('gfs ender_pearl ' + count);
}

function onBuildStart() {
  dropLocs = [];
  pearlLocs = [];
  supplies = [];
  chunks = [];
  ticksUntilPickup = 0;
  pickupStart = 0;
  lastPickUpdate = 0;
  supplyPickReg.unregister();
  cannonReg.register();
}

function reset() {
  regInst.unregister();
  onBuildStart();
  renderReg.unregister();
  tickReg.unregister();
  updateReg1.unregister();
  bossBarReg.unregister();

  buildStartReg.unregister();
  buildEndReg.unregister();
  dpsStartReg.unregister();
  kuudraLeaveReg.unregister();

  cannonReg.unregister();
  hideTitleReg.unregister();
  hpOverlayReg.unregister();
  dirOverlayReg.unregister();
}
function start() {
  hasBuildEnded = false;
  kuuder = null;
  isT5 = (Scoreboard.getLines().map(v => v.getName()).find(v => v.includes('⏣')) || '').slice(-2, -1) === '5';
  regInst.register();
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

  hpOverlayReg.register();
  addPearls();
}

// const kuudraJoinReg = reg('chat', () => kuudra.emit('kuudraJoin')).setChatCriteria('&e[NPC] &cElle&f: &rTalk with me to begin!&r');
const kuudraStartReg = reg('chat', () => start()).setChatCriteria('&e[NPC] &cElle&f: &rOkay adventurers, I will go and fish up Kuudra!&r');
// const supplyStartReg = reg('chat', () => kuudra.emit('supplyStart')).setChatCriteria('&e[NPC] &cElle&f: &rNot again!&r');
const buildStartReg = reg('chat', () => onBuildStart()).setCriteria('&e[NPC] &cElle&f: &rOMG! Great work collecting my supplies!&r');
const buildEndReg = reg('chat', () => {
  hpOverlayReg.register();
  hasBuildEnded = true;
}).setCriteria('&e[NPC] &cElle&f: &rPhew! The Ballista is finally ready! It should be strong enough to tank Kuudra\'s blows now!&r');
// const stunReg = reg('chat', () => kuudra.emit('stun')).setChatCriteria('&e[NPC] &cElle&f: &rThat looks like it hurt! Quickly, while &cKuudra is distracted, shoot him with the Ballista&f!&r');
const dpsStartReg = reg('chat', () => {
  hideTitleReg.register();
  dirOverlayReg.register();
}).setChatCriteria('&e[NPC] &cElle&f: &rPOW! SURELY THAT\'S IT! I don\'t think he has any more in him!&r');
// const kuudraEndReg = reg('chat', () => kuudra.emit('kuudraEnd')).setChatCriteria('&r&f                               &r&6&lKUUDRA DOWN!&r');
const kuudraLeaveReg = reg('worldUnload', () => kuudra.emit('kuudraLeave'));

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