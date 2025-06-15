import settings from '../../settings';
import data from '../../data';
import { renderString, getPartialServerTick } from '../../util/draw';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import { getAveragePing } from '../../util/ping';
import createTextGui from '../../util/customtextgui';
import { fastDistance, lerp, linReg } from '../../util/math';
import { log } from '../../util/log';
import { StateProp, StateVar } from '../../util/state';
import { DelayTimer } from '../../util/timers';
import { listenBossMessages } from '../dungeon.js';
import { renderBoxFilled, renderBoxOutline } from '../../../Apelles/index';

const bearSpawnTicks = 70;
const bearParticleHeightCap = 80;
const bearSpawnRadius = 0.8;
const fm4Center = { x: 5.5, y: 69, z: 5.5 };
let particles = [];
const ticks = new StateVar(0);
let justSpawned = false;
let est = null;
let estPrev = null;
let prevTime = 0;
let lastY = bearParticleHeightCap;
const spiritBearGuessDelay = new DelayTimer(settings.dungeonSpiritBearSmoothTime);
const spiritBearTimer = createTextGui(() => data.dungeonSpiritBearTimerLoc, () => ['&2&l6.42s']);

const stateInFM4 = new StateVar(false);
const stateBearSpawning = new StateProp(ticks).equalsmult(0, -1).not().and(stateInFM4);

function resetFM4Vars() {
  particles = [];
  ticks.set(0);
  justSpawned = false;
  est = null;
  estPrev = null;
  prevTime = 0;
  lastY = bearParticleHeightCap;
}

const EntityGhast = Java.type('net.minecraft.entity.monster.EntityGhast');
const tickReg = reg('tick', () => {
  if (World.getBlockAt(7, 77, 34).type.getID() !== 169) return justSpawned = false;
  if (justSpawned) return;
  prevTime = Date.now();
  ticks.set(bearSpawnTicks);
  const thorn = World.getAllEntitiesOfType(EntityGhast)[0];
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
}).setEnabled(new StateProp(ticks).equals(0).and(stateInFM4));
const serverTickReg = reg('serverTick', () => ticks.set(ticks.get() - 1)).setEnabled(stateBearSpawning);
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const particleReg = reg('spawnParticle', (part, id, evn) => {
  if (!id.equals(EnumParticleTypes.SPELL_MOB)) return;
  const pos = { x: part.getX(), y: part.getY(), z: part.getZ(), t: ticks.get() };
  if (pos.y < fm4Center.y || pos.y > lastY || fastDistance(pos.x - fm4Center.x, pos.z - fm4Center.z) > 10) return;

  lastY = pos.y;
  particles.push(pos);
  if (particles.length >= 2 && spiritBearGuessDelay.shouldTick()) {
    const { r: rX, b: bX } = linReg(particles.map(v => [v.t, v.x]));
    const { r: rZ, b: bZ } = linReg(particles.map(v => [v.t, v.z]));

    const d = bearSpawnRadius / Math.hypot(bX, bZ);
    estPrev = est;
    est = {
      x: bX * d + fm4Center.x,
      y: fm4Center.y,
      z: bZ * d + fm4Center.z
    };
  }
}).setEnabled(stateBearSpawning);
const spiritBearSpawnReg = reg('chat', () => {
  resetFM4Vars();
  ticks.set(-1);
}).setCriteria('&r&a&lA &r&5&lSpirit Bear &r&a&lhas appeared!&r').setEnabled(stateInFM4);
const spiritBowDropReg = reg('chat', () => {
  ticks.set(0);
  justSpawned = true;
}).setCriteria('&r&a&lThe &r&5&lSpirit Bow &r&a&lhas dropped!&r').setEnabled(stateInFM4);
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
  const m = Math.min(1, (bearSpawnTicks - ticks.get() + getPartialServerTick() + getAveragePing() / 50) / bearSpawnTicks);
  renderBoxOutline(settings.dungeonSpiritBearWireColor, x, y, z, 1, 2, { phase: settings.dungeonSpiritBearBoxEsp, lw: 3 });
  renderBoxFilled(settings.dungeonSpiritBearBoxColor, x, y + 1 - m, z, m, 2 * m, { phase: settings.dungeonSpiritBearBoxEsp });

  if (settings.dungeonSpiritBearTimer) renderString(((ticks.get() - getPartialServerTick() - getAveragePing() / 50) / 20).toFixed(2), x, y + 2.5, z);
}).setEnabled(stateBearSpawning);
const renderOvlyReg = reg('renderOverlay', () => {
  const d = (ticks.get() - getPartialServerTick() - getAveragePing() / 50) * 50;
  spiritBearTimer.setLine(`§l${colorForNumber(d, bearSpawnTicks * 50)}${(d / 1000).toFixed(2)}s`.toString());
  spiritBearTimer.render();
}).setEnabled(new StateProp(settings._dungeonSpiritBearTimerHud).and(stateBearSpawning));

export function init() {
  settings._dungeonSpiritBearSmoothTime.listen(v => spiritBearGuessDelay.delay = v);
  settings._moveSpiritBearTimerHud.onAction(v => spiritBearTimer.edit(v));
  listenBossMessages((name, msg) => settings.dungeonSpiritBearHelper && name === 'Thorn' && msg === 'Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!' && stateInFM4.set(true));
}
export function start() {
  resetFM4Vars();

  tickReg.register();
  serverTickReg.register();
  particleReg.register();
  spiritBearSpawnReg.register();
  spiritBowDropReg.register();
  renderWorldReg.register();
  renderOvlyReg.register();
}
export function reset() {
  tickReg.unregister();
  serverTickReg.unregister();
  particleReg.unregister();
  spiritBearSpawnReg.unregister();
  spiritBowDropReg.unregister();
  renderWorldReg.unregister();
  renderOvlyReg.unregister();
}