import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import reg from '../util/registerer';

let ticks = [];
let lastLoadTime = Date.now();
let lastTickTime = Date.now();
const cap = n => settings.serverScrutinizerTPSDisplayCap20 ? Math.min(20, n) : n;
function trimTicks() {
  const t = Date.now();
  // sometimes undefined is added to array???
  while (ticks.length > 0 && (t - ticks[ticks.length - 1] > settings.serverScrutinizerTPSMaxAge || !ticks[ticks.length - 1])) ticks.pop();
}
let lTps = 0;
let rTps = 0;
let cTps = 0;
let aTps = 0;
let mTps = 0;
function calcTps() {
  if (ticks.length === 0) {
    cTps = 0;
    aTps = 0;
    mTps = 0;
    return;
  }
  if (ticks[0] === lTps && ticks[ticks.length - 1] === rTps) return;
  lTps = ticks[0];
  rTps = ticks[ticks.length - 1];
  const d = Date.now();

  cTps = 0;
  while (ticks.length > cTps && d - ticks[cTps] <= 1_000) cTps++;

  aTps = ticks.length / settings.serverScrutinizerTPSMaxAge * 1000;

  if (ticks.length === 1) mTps = 1;
  else {
    let lt = d;
    let l = 0, r = -1;
    mTps = Number.POSITIVE_INFINITY;
    while (l < ticks.length && r < ticks.length - 1) {
      while (r < ticks.length - 1 && lt - ticks[r + 1] <= 1_000) r++;
      let d = r - l + 1;
      if (
        r === l &&
        (
          r < ticks.length - 1 && ticks[r] - ticks[r + 1] > 1_000 ||
          r > 0 && ticks[r - 1] - ticks[r] > 1_000 ||
          r === 0 && d - ticks[r] > 1_000
        )
      ) d = 0;
      mTps = Math.min(mTps, d);
      l++;
      lt = ticks[l];
    }
  }
}

const serverTickReg = reg('packetReceived', () => {
  const t = Date.now();
  ticks.unshift(t);
  lastTickTime = t;
}, 'serverscrutinizer').setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction'));
const worldLoadReg = reg('worldLoad', () => {
  ticks = [];
  lastLoadTime = lastTickTime = Date.now();
}, 'serverscrutinizer');

function getTPSColor(tps) {
  return colorForNumber(tps - 15, 5);
}

const tpsCmd = reg('command', () => {
  trimTicks();
  calcTps();
  log('Current TPS:', getTPSColor(cTps) + cTps);
  log('Average TPS:', getTPSColor(aTps) + aTps.toFixed(1));
  log('Minimum TPS:', getTPSColor(mTps) + mTps);
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
  trimTicks();
  calcTps();
  tpsDisplay.setLines(formatTps(cap(cTps), cap(aTps), cap(mTps)));
  tpsDisplay.render();
}, 'serverscrutinizer').setEnabled(settings._serverScrutinizerTPSDisplay);

const lastTickDisplay = createTextGui(() => data.serverScrutinizerLastPacketDisplay, () => ['zzz for &469.42s']);
const rendOvLTD = reg('renderOverlay', () => {
  const d = Date.now();
  if (d - lastLoadTime < 11_000) return;
  trimTicks();
  const t = d - (ticks.length ? ticks[0] : lastTickTime);
  if (t < settings.serverScrutinizerLastTickThreshold) return;
  lastTickDisplay.setLine(`zzz for ${colorForNumber(2000 - t, 2000)}${(t / 1000).toFixed(2)}s`);
  lastTickDisplay.render();
}, 'serverscrutinizer').setEnabled(settings._serverScrutinizerLastTickDisplay);

export function init() {
  settings._moveTPSDisplay.onAction(() => tpsDisplay.edit());
  settings._moveLastTickDisplay.onAction(() => lastTickDisplay.edit());
}
export function load() {
  ticks = [];

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