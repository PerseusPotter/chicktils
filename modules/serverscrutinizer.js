import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import reg from '../util/registerer';
import { StateProp } from '../util/state';

class TickInfo {
  arr = [];
  min = [];
  max = [];
  // rhino is bad with sparse arrays
  idxmin = [];
  idxmax = [];
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
  _mark() {
    this.dirty = true;
    return this;
  }
  add(val) {
    if (!val) return;
    this.arr.unshift(val);
    this.cspan++;
    this._mark();
  }
  clear() {
    this.arr = [];
    this._mark();
  }
  calc() {
    const d = Date.now();
    // WHY ARE THERE UNDEFINEDS IN MY ARRAY HOLY SHIT GONNA LOSE MY MIND FUCK YOU RHINO
    while (this.arr.length > 0 && (!this.arr[this.arr.length - 1] || d - this.arr[this.arr.length - 1] > this.maxAge)) this._mark().arr.pop();
    if (!this.dirty) return;
    this.dirty = false;
    if (this.arr.length === 0) return void (this.cspan = this.avg = this.minspan = 0);

    // this.cspan = 0;
    // while (this.arr.length > this.cspan && d - this.arr[this.cspan] <= this.maxSpan) this.cspan++;
    // while the cspan can only increase by 1, it could jump if ._calc() is not called after every .add(), so we instead increase the current span in add
    // this.cspan++;
    // in the unlikely case of a .clear() or spike followed by a .add() before a .calc()
    this.cspan = Math.min(this.cspan, this.arr.length - 1);
    while (this.cspan > 0 && d - this.arr[this.cspan - 1] > this.maxSpan) this.cspan--;

    this.avg = this.arr.length / this.maxAge * this.maxSpan;

    this.idxmin = this.idxmin.slice(0, (function(arr, v) {
      let l = 0;
      let r = arr.length;
      while (l !== r) {
        let m = (l + r) >> 1;
        if (arr[m] === v) return m;
        if (arr[m] < v) l = m + 1;
        else r = m;
      }
      return r;
    }(this.idxmin, this.cspan)));
    this.idxmin.push(this.cspan);
    this.min[this.cspan] = this.arr[0];

    while (true) {
      let i = this.idxmin[0];
      if (d - this.min[i] > this.maxAge) this.idxmin.shift();
      else {
        this.minspan = i;
        break;
      }
    }

    this.idxmax = this.idxmax.slice(0, (function(arr, v) {
      let l = 0;
      let r = arr.length;
      while (l !== r) {
        let m = (l + r) >> 1;
        if (arr[m] === v) return m;
        if (arr[m] > v) l = m + 1;
        else r = m;
      }
      return r;
    }(this.idxmax, this.cspan)));
    this.idxmax.push(this.cspan);
    this.max[this.cspan] = this.arr[0];

    while (true) {
      let i = this.idxmax[0];
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
let lastLoadTime = Date.now();
let lastTickTime = Date.now();
const ticks = new TickInfo(settings.serverScrutinizerTPSMaxAge, 1_000, settings.serverScrutinizerTPSDisplayCap20 ? 20 : undefined);

const serverTickReg = reg('packetReceived', pack => {
  if (pack.func_148888_e()) return;
  const t = Date.now();
  ticks.add(t);
  lastTickTime = t;
}, 'serverscrutinizer').setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction')).setEnabled(stateTrackTicks);
const worldLoadReg = reg('worldLoad', () => {
  ticks.clear();
  lastLoadTime = lastTickTime = Date.now();
}, 'serverscrutinizer').setEnabled(stateTrackTicks);

function getTickColor(val, max, min) {
  return colorForNumber(val - max * min, max * (1 - min));
}

const tpsCmd = reg('command', () => {
  ticks.calc();
  log('Current TPS:', getTickColor(ticks.getCur(), 20, 0.75) + ticks.getCur());
  log('Average TPS:', getTickColor(ticks.getAvg(), 20, 0.75) + ticks.getAvg().toFixed(1));
  log('Minimum TPS:', getTickColor(ticks.getMin(), 20, 0.75) + ticks.getMin());
  log('Maximum TPS:', getTickColor(ticks.getMax(), 20, 0.75) + ticks.getMax());
}, 'serverscrutinizer').setName('tps').setEnabled(stateTrackTicks);

function formatTps(curr, avg, min, max) {
  if (Date.now() - lastLoadTime < 11_000) return ['TPS: Loading...'];
  if (settings.serverScrutinizerTPSDisplayCurr + settings.serverScrutinizerTPSDisplayAvg + settings.serverScrutinizerTPSDisplayMin + settings.serverScrutinizerFPSDisplayMax === 1) {
    if (settings.serverScrutinizerTPSDisplayCurr || settings.serverScrutinizerTPSDisplayMin || settings.serverScrutinizerTPSDisplayMax) return ['TPS: ' + getTickColor(curr, 20, 0.75) + curr];
    return ['TPS: ' + getTickColor(avg, 20, 0.75) + avg.toFixed(1)];
  }
  const lines = [];
  if (settings.serverScrutinizerTPSDisplayCurr) lines.push('Current TPS: ' + getTickColor(curr, 20, 0.75) + curr);
  if (settings.serverScrutinizerTPSDisplayAvg) lines.push('Average TPS: ' + getTickColor(avg, 20, 0.75) + avg.toFixed(1));
  if (settings.serverScrutinizerTPSDisplayMin) lines.push('Minimum TPS: ' + getTickColor(min, 20, 0.75) + min);
  if (settings.serverScrutinizerTPSDisplayMax) lines.push('Maximum TPS: ' + getTickColor(max, 20, 0.75) + max);
  return lines;
}
const tpsDisplay = createTextGui(() => data.serverScrutinizerTPSDisplay, () => formatTps(20, 18.4, 11, 21));
const rendOvTps = reg('renderOverlay', () => {
  ticks.calc();
  tpsDisplay.setLines(formatTps(ticks.getCur(), ticks.getAvg(), ticks.getMin(), ticks.getMax()));
  tpsDisplay.render();
}, 'serverscrutinizer').setEnabled(settings._serverScrutinizerTPSDisplay);

const lastTickDisplay = createTextGui(() => data.serverScrutinizerLastPacketDisplay, () => ['zzz for &469.42s']);
const rendOvLTD = reg('renderOverlay', () => {
  const d = Date.now();
  if (d - lastLoadTime < 11_000) return;
  const t = d - lastTickTime;
  if (t < settings.serverScrutinizerLastTickThreshold) return;
  lastTickDisplay.setLine(`zzz for ${colorForNumber(2000 - t, 2000)}${(t / 1000).toFixed(2)}s`);
  lastTickDisplay.render();
}, 'serverscrutinizer').setEnabled(settings._serverScrutinizerLastTickDisplay);

const frames = new TickInfo(settings.serverScrutinizerFPSMaxAge, 1_000);

const renderTickReg = reg('renderWorld', () => frames.add(Date.now()), 'serverscrutinizer').setEnabled(settings._serverScrutinizerFPSDisplay);

function formatFps(curr, avg, min, max) {
  if (settings.serverScrutinizerFPSDisplayCurr + settings.serverScrutinizerFPSDisplayAvg + settings.serverScrutinizerFPSDisplayMin + settings.serverScrutinizerFPSDisplayMax === 1) {
    if (settings.serverScrutinizerFPSDisplayCurr || settings.serverScrutinizerFPSDisplayMin || settings.serverScrutinizerFPSDisplayMax) return ['FPS: ' + getTickColor(curr, max, 0.5) + curr];
    return ['FPS: ' + getTickColor(avg, max, 0.5) + avg.toFixed(1)];
  }
  const lines = [];
  if (settings.serverScrutinizerFPSDisplayCurr) lines.push('Current FPS: ' + getTickColor(curr, max, 0.5) + curr);
  if (settings.serverScrutinizerFPSDisplayAvg) lines.push('Average FPS: ' + getTickColor(avg, max, 0.5) + avg.toFixed(1));
  if (settings.serverScrutinizerFPSDisplayMin) lines.push('Minimum FPS: ' + getTickColor(min, max, 0.5) + min);
  if (settings.serverScrutinizerFPSDisplayMax) lines.push('Maximum FPS: ' + getTickColor(max, max, 0.5) + max);
  return lines;
}
const fpsDisplay = createTextGui(() => data.serverScrutinizerFPSDisplay, () => formatFps(217, 213.1, 180, 240));
const rendOvFps = reg('renderOverlay', () => {
  frames.calc();
  fpsDisplay.setLines(formatFps(frames.getCur(), frames.getAvg(), frames.getMin(), frames.getMax()));
  fpsDisplay.render();
}, 'serverscrutinizer').setEnabled(settings._serverScrutinizerFPSDisplay);

export function init() {
  settings._moveTPSDisplay.onAction(() => tpsDisplay.edit());
  settings._moveLastTickDisplay.onAction(() => lastTickDisplay.edit());
  settings._serverScrutinizerTPSMaxAge.onAfterChange(v => ticks.maxAge = v);
  settings._serverScrutinizerTPSDisplayCap20.onAfterChange(v => ticks.cap = v ? 20 : Number.POSITIVE_INFINITY);
  settings._moveFPSDisplay.onAction(() => fpsDisplay.edit());
  settings._serverScrutinizerFPSMaxAge.onAfterChange(v => frames.maxAge = v);
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
}
export function unload() {
  serverTickReg.unregister();
  worldLoadReg.unregister();
  tpsCmd.unregister();
  rendOvTps.unregister();
  rendOvLTD.unregister();
  renderTickReg.unregister();
  rendOvFps.unregister();
}