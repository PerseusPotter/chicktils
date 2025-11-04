import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import { stateSinglePlayer } from '../util/mc';
import { getAveragePing, getMedianPing, getPing } from '../util/ping';
import { Deque } from '../util/polyfill';
import reg from '../util/registerer';
import { StateProp } from '../util/state';
import { FrameTimer } from '../util/timers';

class TickInfo {
  /** @type {Deque<number>} */
  arr = new Deque();
  min = [];
  max = [];
  // rhino is bad with sparse arrays
  /** @type {Deque<number>} */
  idxmin = new Deque();
  /** @type {Deque<number>} */
  idxmax = new Deque();
  maxAge = 0;
  maxSpan = 0;
  dirty = true;
  cspan = 0;
  avg = 0;
  minspan = 0;
  maxspan = 0;
  cap = Number.POSITIVE_INFINITY;
  /**
   * @param {number} maxAge
   * @param {number} maxSpan
   * @param {number?} cap
   */
  constructor(maxAge, maxSpan, cap) {
    this.maxAge = maxAge;
    this.maxSpan = maxSpan;
    if (cap) this.cap = cap;
  }
  add(val) {
    if (!val) return;
    this.arr.unshift(val);
    this.cspan++;
    this.dirty = true;
  }
  clear() {
    this.arr = new Deque();
    this.dirty = true;
  }
  calc() {
    const d = Date.now();
    // WHY ARE THERE UNDEFINEDS IN MY ARRAY HOLY SHIT GONNA LOSE MY MIND FUCK YOU RHINO
    while (this.arr.length > 0 && (!this.arr.getLast() || d - this.arr.getLast() > this.maxAge)) {
      this.arr.pop();
      this.dirty = true;
    }
    if (!this.dirty) return;
    this.dirty = false;
    if (this.arr.length === 0) return void (this.cspan = this.avg = this.minspan = this.maxspan = 0);

    // this.cspan = 0;
    // while (this.arr.length > this.cspan && d - this.arr[this.cspan] <= this.maxSpan) this.cspan++;
    // while the cspan can only increase by 1, it could jump if ._calc() is not called after every .add(), so we instead increase the current span in add
    // this.cspan++;
    // in the unlikely case of a .clear() or spike followed by a .add() before a .calc()
    this.cspan = Math.min(this.cspan, this.arr.length - 1);
    const aIter = this.arr.iter(this.cspan - 1);
    while (this.cspan > 0 && d - aIter.value() > this.maxSpan) {
      this.cspan--;
      aIter.prev();
    }

    this.avg = this.arr.length / this.maxAge * this.maxSpan;

    {
      // this.idxmin = this.idxmin.slice(0, this.idxmin.findIndex(v => v >= this.cspan));
      const i = this.idxmin;
      this.idxmin = new Deque();
      i.some(v => {
        if (v >= this.cspan) return false;
        this.idxmin.add(v);
        return true;
      });
    }
    this.idxmin.push(this.cspan);
    this.min[this.cspan] = this.arr.getFirst();

    while (true) {
      let i = this.idxmin.getFirst();
      if (d - this.min[i] > this.maxAge) this.idxmin.shift();
      else {
        this.minspan = i;
        break;
      }
    }

    {
      // this.idxmax = this.idxmax.slice(0, this.idxmax.findIndex(v => v <= this.cspan));
      const i = this.idxmax;
      this.idxmax = new Deque();
      i.some(v => {
        if (v <= this.cspan) return false;
        this.idxmax.add(v);
        return true;
      });
    }
    this.idxmax.push(this.cspan);
    this.max[this.cspan] = this.arr.getFirst();

    while (true) {
      let i = this.idxmax.getFirst();
      if (d - this.max[i] > this.maxAge) this.idxmax.shift();
      else {
        this.maxspan = i;
        break;
      }
    }
  }
  getCur() {
    return Math.min(this.cap, this.cspan);
  }
  getAvg() {
    return Math.min(this.cap, this.avg);
  }
  getMin() {
    return Math.min(this.cap, this.minspan);
  }
  getMax() {
    return Math.min(this.cap, this.maxspan);
  }
}

const stateTrackTicks = new StateProp(settings._serverScrutinizerTPSDisplay).or(settings._serverScrutinizerLastTickDisplay);
let lastTickTime = Date.now();
const ticks = new TickInfo(settings.serverScrutinizerTPSMaxAge, 1_000, settings.serverScrutinizerTPSDisplayCap20 ? 20 : undefined);

const serverTickReg = reg('serverTick', () => {
  const t = Date.now();
  ticks.add(t);
  lastTickTime = t;
}).setEnabled(stateTrackTicks);
const worldLoadReg = reg('worldLoad', () => {
  ticks.clear();
}).setEnabled(stateTrackTicks);

function getTickColor(val, max, min) {
  return colorForNumber(val - max * min, max * (1 - min));
}

const tpsCmd = reg('command', () => {
  ticks.calc();
  log('Current TPS:', getTickColor(ticks.getCur(), 20, 0.75) + ticks.getCur());
  log('Average TPS:', getTickColor(ticks.getAvg(), 20, 0.75) + ticks.getAvg().toFixed(1));
  log('Minimum TPS:', getTickColor(ticks.getMin(), 20, 0.75) + ticks.getMin());
  log('Maximum TPS:', getTickColor(ticks.getMax(), 20, 0.75) + ticks.getMax());
}).setName('tps').setEnabled(stateTrackTicks);

function formatTps(curr, avg, min, max) {
  if (settings.serverScrutinizerTPSDisplayCurr + settings.serverScrutinizerTPSDisplayAvg + settings.serverScrutinizerTPSDisplayMin + settings.serverScrutinizerFPSDisplayMax === 1) {
    if (settings.serverScrutinizerTPSDisplayCurr) return ['TPS: ' + getTickColor(curr, 20, 0.75) + curr];
    if (settings.serverScrutinizerTPSDisplayAvg) return ['TPS: ' + getTickColor(avg, 20, 0.75) + avg.toFixed(1)];
    if (settings.serverScrutinizerTPSDisplayMin) return ['TPS: ' + getTickColor(min, 20, 0.75) + min];
    if (settings.serverScrutinizerTPSDisplayMax) return ['TPS: ' + getTickColor(max, 20, 0.75) + max];
  }
  const lines = [];
  if (settings.serverScrutinizerTPSDisplayCurr) lines.push('Current TPS: ' + getTickColor(curr, 20, 0.75) + curr);
  if (settings.serverScrutinizerTPSDisplayAvg) lines.push('Average TPS: ' + getTickColor(avg, 20, 0.75) + avg.toFixed(1));
  if (settings.serverScrutinizerTPSDisplayMin) lines.push('Minimum TPS: ' + getTickColor(min, 20, 0.75) + min);
  if (settings.serverScrutinizerTPSDisplayMax) lines.push('Maximum TPS: ' + getTickColor(max, 20, 0.75) + max);
  return lines;
}
const tpsDisplay = createTextGui(() => data.serverScrutinizerTPSDisplay, () => formatTps(20, 18.4, 11, 21));
const tpsLimiter = new FrameTimer(settings.serverScrutinizerTPSDisplayFpsCap);
const rendOvTps = reg('renderOverlay', () => {
  if (tpsLimiter.shouldRender()) {
    ticks.calc();
    tpsDisplay.setLines(formatTps(ticks.getCur(), ticks.getAvg(), ticks.getMin(), ticks.getMax()));
  }
  tpsDisplay.render();
}).setEnabled(settings._serverScrutinizerTPSDisplay);

const lastTickDisplay = createTextGui(() => data.serverScrutinizerLastPacketDisplay, () => ['zzz for &469.42s']);
const rendOvLTD = reg('renderOverlay', () => {
  const t = Date.now() - lastTickTime;
  if (t < settings.serverScrutinizerLastTickThreshold) return;
  lastTickDisplay.setLine(`zzz for ${colorForNumber(2000 - t, 2000)}${(t / 1000).toFixed(2)}s`);
  lastTickDisplay.render();
}).setEnabled(new StateProp(stateSinglePlayer).not().and(settings._serverScrutinizerLastTickDisplay));

const frames = new TickInfo(settings.serverScrutinizerFPSMaxAge, 1_000);
const renderTickReg = reg('renderWorld', () => frames.add(Date.now())).setEnabled(settings._serverScrutinizerFPSDisplay);

function formatFps(curr, avg, min, max) {
  if (settings.serverScrutinizerFPSDisplayCurr + settings.serverScrutinizerFPSDisplayAvg + settings.serverScrutinizerFPSDisplayMin + settings.serverScrutinizerFPSDisplayMax === 1) {
    if (settings.serverScrutinizerFPSDisplayCurr) return ['FPS: ' + getTickColor(curr, max, 0.5) + curr];
    if (settings.serverScrutinizerFPSDisplayAvg) return ['FPS: ' + getTickColor(avg, max, 0.5) + avg.toFixed(1)];
    if (settings.serverScrutinizerFPSDisplayMin) return ['FPS: ' + getTickColor(min, max, 0.5) + min];
    if (settings.serverScrutinizerFPSDisplayMax) return ['FPS: ' + getTickColor(max, max, 0.5) + max];
  }
  const lines = [];
  if (settings.serverScrutinizerFPSDisplayCurr) lines.push('Current FPS: ' + getTickColor(curr, max, 0.5) + curr);
  if (settings.serverScrutinizerFPSDisplayAvg) lines.push('Average FPS: ' + getTickColor(avg, max, 0.5) + avg.toFixed(1));
  if (settings.serverScrutinizerFPSDisplayMin) lines.push('Minimum FPS: ' + getTickColor(min, max, 0.5) + min);
  if (settings.serverScrutinizerFPSDisplayMax) lines.push('Maximum FPS: ' + getTickColor(max, max, 0.5) + max);
  return lines;
}
const fpsDisplay = createTextGui(() => data.serverScrutinizerFPSDisplay, () => formatFps(217, 213.1, 180, 240));
const fpsLimiter = new FrameTimer(settings.serverScrutinizerFPSDisplayFpsCap);
const rendOvFps = reg('renderOverlay', () => {
  if (fpsLimiter.shouldRender()) {
    frames.calc();
    fpsDisplay.setLines(formatFps(frames.getCur(), frames.getAvg(), frames.getMin(), frames.getMax()));
  }
  fpsDisplay.render();
}).setEnabled(settings._serverScrutinizerFPSDisplay);

function formatPingN(n) {
  if (n < 50) return `&a${n.toFixed(2)} &7ms`;
  if (n < 100) return `&2${n.toFixed(2)} &7ms`;
  if (n < 150) return `&e${n.toFixed(2)} &7ms`;
  if (n < 200) return `&6${n.toFixed(2)} &7ms`;
  return `&c${n.toFixed(2)} &7ms`;
}
function formatPing(c, a, m) {
  if (settings.serverScrutinizerPingDisplayCurr + settings.serverScrutinizerPingDisplayAvg + settings.serverScrutinizerPingDisplayMedian === 1) {
    if (settings.serverScrutinizerPingDisplayCurr) return ['Ping: ' + formatPingN(c)];
    if (settings.serverScrutinizerPingDisplayAvg) return ['Ping: ' + formatPingN(a)];
    if (settings.serverScrutinizerPingDisplayMedian) return ['Ping: ' + formatPingN(m)];
  }
  const lines = [];
  if (settings.serverScrutinizerPingDisplayCurr) lines.push('Current Ping: ' + formatPingN(c));
  if (settings.serverScrutinizerPingDisplayAvg) lines.push('Average Ping: ' + formatPingN(a));
  if (settings.serverScrutinizerPingDisplayMedian) lines.push('Median Ping: ' + formatPingN(m));
  return lines;
}
const pingDisplay = createTextGui(() => data.serverScrutinizerPingDisplay, () => formatPing(69.42, 42.69));
const pingLimiter = new FrameTimer(settings.serverScrutinizerPingDisplayFpsCap);
const rendOvPing = reg('renderOverlay', () => {
  if (pingLimiter.shouldRender()) pingDisplay.setLines(formatPing(getPing(), getAveragePing(), getMedianPing()));
  pingDisplay.render();
}).setEnabled(settings._serverScrutinizerPingDisplay);

const packets = new TickInfo(settings.serverScrutinizerPPSMaxAge, 1_000);
const packetSentReg = reg('packetSent', () => packets.add(Date.now())).setEnabled(settings._serverScrutinizerPPSDisplay);

function ppsColor(n) {
  return colorForNumber(60 - n, 20);
}
function formatPps(curr, avg, min, max) {
  if (settings.serverScrutinizerPPSDisplayCurr + settings.serverScrutinizerPPSDisplayAvg + settings.serverScrutinizerPPSDisplayMin + settings.serverScrutinizerPPSDisplayMax === 1) {
    if (settings.serverScrutinizerPPSDisplayCurr) return ['PPS: ' + ppsColor(curr) + curr];
    if (settings.serverScrutinizerPPSDisplayAvg) return ['PPS: ' + ppsColor(avg) + avg.toFixed(1)];
    if (settings.serverScrutinizerPPSDisplayMin) return ['PPS: ' + ppsColor(min) + min];
    if (settings.serverScrutinizerPPSDisplayMax) return ['PPS: ' + ppsColor(max) + max];
  }
  const lines = [];
  if (settings.serverScrutinizerPPSDisplayCurr) lines.push('Current PPS: ' + ppsColor(curr) + curr);
  if (settings.serverScrutinizerPPSDisplayAvg) lines.push('Average PPS: ' + ppsColor(avg) + avg.toFixed(1));
  if (settings.serverScrutinizerPPSDisplayMin) lines.push('Minimum PPS: ' + ppsColor(min) + min);
  if (settings.serverScrutinizerPPSDisplayMax) lines.push('Maximum PPS: ' + ppsColor(max) + max);
  return lines;
}
const ppsDisplay = createTextGui(() => data.serverScrutinizerPPSDisplay, () => formatPps(42, 42.2, 41, 45));
const ppsLimiter = new FrameTimer(settings.serverScrutinizerPPSDisplayFpsCap);
const rendOvPps = reg('renderOverlay', () => {
  if (ppsLimiter.shouldRender()) {
    packets.calc();
    ppsDisplay.setLines(formatPps(packets.getCur(), packets.getAvg(), packets.getMin(), packets.getMax()));
  }
  ppsDisplay.render();
}).setEnabled(settings._serverScrutinizerPPSDisplay);

export function init() {
  settings._moveTPSDisplay.onAction(v => tpsDisplay.edit(v));;
  settings._serverScrutinizerTPSDisplayFpsCap.listen(v => tpsLimiter.target = 1000 / v);
  settings._serverScrutinizerTPSDisplayCap20.listen(v => ticks.cap = v ? 20 : Number.POSITIVE_INFINITY);
  settings._serverScrutinizerTPSMaxAge.listen(v => ticks.maxAge = v);
  settings._moveLastTickDisplay.onAction(v => lastTickDisplay.edit(v))
  settings._moveFPSDisplay.onAction(v => fpsDisplay.edit(v));
  settings._serverScrutinizerFPSDisplayFpsCap.listen(v => fpsLimiter.target = 1000 / v);
  settings._serverScrutinizerFPSMaxAge.listen(v => frames.maxAge = v);
  settings._movePingDisplay.onAction(v => pingDisplay.edit(v));
  settings._serverScrutinizerPingDisplayFpsCap.listen(v => pingLimiter.target = 1000 / v);
  settings._movePPSDisplay.onAction(v => ppsDisplay.edit(v));
  settings._serverScrutinizerPPSDisplayFpsCap.listen(v => ppsLimiter.target = 1000 / v);
  settings._serverScrutinizerPPSMaxAge.listen(v => packets.maxAge = v);
}
export function load() {
  ticks.clear();
  frames.clear();

  serverTickReg.register();
  worldLoadReg.register();
  tpsCmd.register();
  rendOvTps.register();
  rendOvLTD.register();
  renderTickReg.register();
  rendOvFps.register();
  rendOvPing.register();
  packetSentReg.register();
  rendOvPps.register();
}
export function unload() {
  serverTickReg.unregister();
  worldLoadReg.unregister();
  tpsCmd.unregister();
  rendOvTps.unregister();
  rendOvLTD.unregister();
  renderTickReg.unregister();
  rendOvFps.unregister();
  rendOvPing.unregister();
  packetSentReg.unregister();
  rendOvPps.unregister();
}