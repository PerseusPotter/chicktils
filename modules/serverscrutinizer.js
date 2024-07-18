import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import reg from '../util/registerer';

class TickInfo {
  arr = [];
  min = [];
  // rhino is bad with sparse arrays
  idx = [];
  maxAge = 0;
  maxSpan = 0;
  dirty = true;
  cspan = 0;
  avg = 0;
  mspan = 0;
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
  _calc() {
    if (!this.dirty) return;
    this.dirty = false;
    if (this.arr.length === 0) return void (this.cspan = this.avg = this.mspan = 0);

    const d = Date.now();
    // this.cspan = 0;
    // while (this.arr.length > this.cspan && d - this.arr[this.cspan] <= this.maxSpan) this.cspan++;
    // while the cspan can only increase by 1, it could jump if ._calc() is not called after every .add(), so we instead increase the current span in add
    // this.cspan++;
    // in the unlikely case of a .clear() or spike followed by a .add() before a .calc()
    this.cspan = Math.min(this.cspan, this.arr.length - 1);
    while (this.cspan > 0 && d - this.arr[this.cspan - 1] > this.maxSpan) this.cspan--;

    this.avg = this.arr.length / this.maxAge * this.maxSpan;

    const i = (function(arr, v) {
      let l = 0;
      let r = arr.length;
      while (l !== r) {
        let m = (l + r) >> 1;
        if (arr[m] === v) return m;
        if (arr[m] < v) l = m + 1;
        else r = m;
      }
      return r;
    }(this.idx, this.cspan));
    this.idx = this.idx.slice(0, i);
    this.idx.push(this.cspan);
    this.min[this.cspan] = this.arr[0];

    while (true) {
      let i = this.idx[0];
      if (d - this.min[i] > this.maxAge) this.idx.shift();
      else {
        this.mspan = i;
        break;
      }
    }
  }
  trim() {
    const t = Date.now();
    while (this.arr.length > 0 && t - this.arr[this.arr.length - 1] > this.maxAge) this._mark().arr.pop();
  }
  getCur() {
    this._calc();
    return Math.min(this.cap, this.cspan);
  }
  getAvg() {
    this._calc();
    return Math.min(this.cap, this.avg);
  }
  getMin() {
    this._calc();
    return Math.min(this.cap, this.mspan);
  }
}

let lastLoadTime = Date.now();
let lastTickTime = Date.now();
const ticks = new TickInfo(settings.serverScrutinizerTPSMaxAge, 1_000, settings.serverScrutinizerTPSDisplayCap20 ? 20 : undefined);

const serverTickReg = reg('packetReceived', () => {
  const t = Date.now();
  ticks.add(t);
  lastTickTime = t;
  lastLoadTime = 0;
}, 'serverscrutinizer').setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction'));
const worldLoadReg = reg('worldLoad', () => {
  ticks.clear();
  lastLoadTime = lastTickTime = Date.now();
}, 'serverscrutinizer');

function getTPSColor(tps) {
  return colorForNumber(tps - 15, 5);
}

const tpsCmd = reg('command', () => {
  ticks.trim();
  log('Current TPS:', getTPSColor(ticks.getCur()) + ticks.getCur());
  log('Average TPS:', getTPSColor(ticks.getAvg()) + ticks.getAvg().toFixed(1));
  log('Minimum TPS:', getTPSColor(ticks.getMin()) + ticks.getMin());
}, 'serverscrutinizer').setName('tps');

function formatTps(curr, avg, min) {
  if (Date.now() - lastLoadTime < 11_000) return ['TPS: Loading...'];
  if (settings.serverScrutinizerTPSDisplayCurr + settings.serverScrutinizerTPSDisplayAvg + settings.serverScrutinizerTPSDisplayMin === 1) {
    if (settings.serverScrutinizerTPSDisplayCurr || settings.serverScrutinizerTPSDisplayMin) return ['TPS: ' + getTPSColor(curr) + curr];
    return ['TPS: ' + getTPSColor(avg) + avg.toFixed(1)];
  }
  const lines = [];
  if (settings.serverScrutinizerTPSDisplayCurr) lines.push('Current TPS: ' + getTPSColor(curr) + curr);
  if (settings.serverScrutinizerTPSDisplayAvg) lines.push('Average TPS: ' + getTPSColor(avg) + avg.toFixed(1));
  if (settings.serverScrutinizerTPSDisplayMin) lines.push('Minimum TPS: ' + getTPSColor(min) + min);
  return lines;
}
const tpsDisplay = createTextGui(() => data.serverScrutinizerTPSDisplay, () => formatTps(20, 18.4, 11));
const rendOvTps = reg('renderOverlay', () => {
  ticks.trim();
  tpsDisplay.setLines(formatTps(ticks.getCur(), ticks.getAvg(), ticks.getMin()));
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

export function init() {
  settings._moveTPSDisplay.onAction(() => tpsDisplay.edit());
  settings._moveLastTickDisplay.onAction(() => lastTickDisplay.edit());
  settings._serverScrutinizerTPSMaxAge.onAfterChange(v => ticks.maxAge = v);
  settings._serverScrutinizerTPSDisplayCap20.onAfterChange(v => ticks.cap = v ? 20 : Number.POSITIVE_INFINITY);
}
export function load() {
  ticks.clear();

  serverTickReg.register();
  worldLoadReg.register();
  tpsCmd.register();
  rendOvTps.register();
  rendOvLTD.register();
}
export function unload() {
  serverTickReg.unregister();
  worldLoadReg.unregister();
  tpsCmd.unregister();
  rendOvTps.unregister();
  rendOvLTD.unregister();
}