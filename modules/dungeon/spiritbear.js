import settings from '../../settings';
import data from '../../data';
import { drawBoxAtBlockNotVisThruWalls, drawBoxAtBlock, drawFilledBox, drawString } from '../../util/draw';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import getPing from '../../util/ping';
import createTextGui from '../../util/customtextgui';
import { lerp, linReg } from '../../util/math';
import { log } from '../../util/log';
import { StateProp, StateVar } from '../../util/state';
import { DelayTimer } from '../../util/timers';
import { stateIsInBoss } from '../dungeon.js';

const bearSpawnTicks = 70;
const bearParticleHeightCap = 80;
const bearSpawnRadius = 0.8;
const fm4Center = { x: 5.5, y: 69, z: 5.5 };
let particles = [];
const ticks = new StateVar(0);
let est = null;
let estPrev = null;
let prevTime = 0;
let lastY = bearParticleHeightCap;
let updateGrace = Number.POSITIVE_INFINITY;
const spiritBearGuessDelay = new DelayTimer(settings.dungeonSpiritBearSmoothTime);
const spiritBearTimer = createTextGui(() => data.dungeonSpiritBearTimerLoc, () => ['§l§26.42s']);

const stateInFM4 = new StateVar(false);
const stateBearSpawning = new StateProp(ticks).equalsmult(0, -1).not().and(stateInFM4);

function resetFM4Vars() {
  particles = [];
  ticks.set(0);
  est = null;
  estPrev = null;
  prevTime = 0;
  lastY = bearParticleHeightCap;
  updateGrace = Number.POSITIVE_INFINITY;
}

const tickReg = reg('tick', () => {
  const t = Date.now();
  if (t > updateGrace && World.getBlockAt(7, 77, 34).type.getID() === 169) {
    prevTime = t;
    ticks.set(bearSpawnTicks);
    const thorn = World.getAllEntities().find(v => v.getClassName() === 'EntityGhast');
    if (!thorn) {
      log('cannot find thorn');
      est = estPrev = fm4Center;
    } else {
      const d = bearSpawnRadius / Math.hypot(thorn.getX() - fm4Center.x, thorn.getZ() - fm4Center.z);
      est = estPrev = {
        x: lerp(fm4Center.x, thorn.getX(), d),
        y: fm4Center.y,
        z: lerp(fm4Center.z, thorn.getZ(), d)
      };
    }
  }
}, 'dungeon/spiritbear').setEnabled(new StateProp(ticks).equals(0).and(stateInFM4));
const serverTickReg = reg('packetReceived', () => ticks.set(ticks.get() - 1), 'dungeon/spiritbear').setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction')).setEnabled(stateBearSpawning);
const particleReg = reg('spawnParticle', (part, id, evn) => {
  if (id.toString() !== 'SPELL_MOB') return;
  const pos = { x: part.getX(), y: part.getY(), z: part.getZ(), t: ticks.get() };
  if (pos.y < fm4Center.y || pos.y > lastY || Math.hypot(pos.x - fm4Center.x, pos.z - fm4Center.z) > 10) return;

  lastY = pos.y;
  particles.push(pos);
  if (spiritBearGuessDelay.shouldTick()) {
    const { r: rX, b: bX } = linReg(particles.map(v => [v.t, v.x]));
    const { r: rZ, b: bZ } = linReg(particles.map(v => [v.t, v.z]));

    const d = bearSpawnRadius / Math.hypot(bX - fm4Center.x, bZ - fm4Center.z);
    estPrev = est;
    est = {
      x: lerp(fm4Center.x, bX, d),
      y: fm4Center.y,
      z: lerp(fm4Center.z, bZ, d)
    };
  }
}, 'dungeon/spiritbear').setEnabled(stateBearSpawning);
const fm4StartReg = reg('chat', () => stateInFM4.set(true), 'dungeon/spiritbear').setCriteria('&r&c[BOSS] Thorn&r&f: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!&r').setEnabled(new StateProp(stateIsInBoss).and(settings._dungeonSpiritBearHelper));
const spiritBearSpawnReg = reg('chat', () => {
  resetFM4Vars();
  ticks.set(-1);
}, 'dungeon/spiritbear').setCriteria('&r&a&lA &r&5&lSpirit Bear &r&a&lhas appeared!&r').setEnabled(stateInFM4);
const spiritBowDropReg = reg('chat', () => {
  ticks.set(-1);
  updateGrace = Date.now() + 1000;
}, 'dungeon/spiritbear').setCriteria('&r&a&lThe &r&5&lSpirit Bow &r&a&lhas dropped!&r').setEnabled(stateInFM4);
const renderWorldReg = reg('renderWorld', () => {
  if (!est) return;
  const dt = Date.now() - prevTime;
  let x;
  let y;
  let z;
  if (dt > settings.dungeonSpiritBearSmoothTime) {
    x = est.x;
    y = est.y;
    z = est.z;
  } else {
    const smoothFactor = dt / settings.dungeonSpiritBearSmoothTime;
    x = lerp(estPrev.x, est.x, smoothFactor);
    y = lerp(estPrev.y, est.y, smoothFactor);
    z = lerp(estPrev.z, est.z, smoothFactor);
  }
  const br = ((settings.dungeonSpiritBearBoxColor >> 24) & 0xFF) / 256;
  const bg = ((settings.dungeonSpiritBearBoxColor >> 16) & 0xFF) / 256;
  const bb = ((settings.dungeonSpiritBearBoxColor >> 8) & 0xFF) / 256;
  const ba = ((settings.dungeonSpiritBearBoxColor >> 0) & 0xFF) / 256;
  const wr = ((settings.dungeonSpiritBearWireColor >> 24) & 0xFF) / 256;
  const wg = ((settings.dungeonSpiritBearWireColor >> 16) & 0xFF) / 256;
  const wb = ((settings.dungeonSpiritBearWireColor >> 8) & 0xFF) / 256;
  const wa = ((settings.dungeonSpiritBearWireColor >> 0) & 0xFF) / 256;
  const m = (bearSpawnTicks - ticks.get() - Tessellator.partialTicks + getPing() / 50) / bearSpawnTicks;
  drawFilledBox(x, y + 1 - m, z, m, 2 * m, br, bg, bb, ba, settings.dungeonSpiritBearBoxEsp);
  if (settings.dungeonSpiritBearBoxEsp) drawBoxAtBlock(x - 0.5, y, z - 0.5, wr, wg, wb, 1, 2, wa, 3);
  else drawBoxAtBlockNotVisThruWalls(x - 0.5, y, z - 0.5, wr, wg, wb, 1, 2, wa, 3);

  if (settings.dungeonSpiritBearTimer) drawString(((ticks.get() - Tessellator.partialTicks) / 20).toFixed(2), x, y + 2.5, z);
}, 'dungeon/spiritbear').setEnabled(stateBearSpawning);
const renderOvlyReg = reg('renderOverlay', () => {
  const d = (ticks + 1 - Tessellator.partialTicks) * 50;
  spiritBearTimer.setLine(`§l${colorForNumber(d, bearSpawnTicks * 50)}${(d / 1000).toFixed(2)}s`.toString());
  spiritBearTimer.render();
}, 'dungeon/spiritbear').setEnabled(new StateProp(settings._dungeonSpiritBearTimerHud).and(stateBearSpawning));

export function init() {
  settings._dungeonSpiritBearSmoothTime.onAfterChange(v => spiritBearGuessDelay.delay = v);
  settings._moveSpiritBearTimerHud.onAction(() => spiritBearTimer.edit());
}
export function start() {
  tickReg.register();
  serverTickReg.register();
  particleReg.register();
  fm4StartReg.register();
  spiritBearSpawnReg.register();
  spiritBowDropReg.register();
  renderWorldReg.register();
  renderOvlyReg.register();
}
export function reset() {
  tickReg.unregister();
  serverTickReg.unregister();
  particleReg.unregister();
  fm4StartReg.unregister();
  spiritBearSpawnReg.unregister();
  spiritBowDropReg.unregister();
  renderWorldReg.unregister();
  renderOvlyReg.unregister();
}