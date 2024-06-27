import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import reg from '../util/registerer';

let ticks = [];
let lastLoadTime = Date.now();
let lastTickTime = Date.now();
const MAX_TICK_AGE = 5_000;
const cap = n => settings.serverScrutinizerTPSDisplayCap20 ? Math.min(20, n) : n;
function getCurrentTPS() {
  if (ticks.length === 0) return 0;
  const f = Date.now();
  let i = 0;
  while (ticks.length > i && f - ticks[i] <= 1_000) i++;
  return cap(i);
}
function getAverageTPS() {
  return cap(ticks.length / MAX_TICK_AGE * 1000);
}
function getMinimumTPS() {
  if (ticks.length <= 1) return ticks.length;
  const n = Date.now();
  let lt = n;
  let l = 0, r = -1;
  let m = Number.POSITIVE_INFINITY;
  while (l < ticks.length && r < ticks.length - 1) {
    while (r < ticks.length - 1 && lt - ticks[r + 1] <= 1_000) r++;
    let d = r - l + 1;
    if (
      r === l &&
      (
        r < ticks.length - 1 && ticks[r] - ticks[r + 1] > 1_000 ||
        r > 0 && ticks[r - 1] - ticks[r] > 1_000 ||
        r === 0 && n - ticks[r] > 1_000
      )
    ) d = 0;
    m = Math.min(m, d);
    l++;
    lt = ticks[l];
  }
  return cap(m);
}
function trimTicks() {
  const t = Date.now();
  while (t - ticks[ticks.length - 1] > MAX_TICK_AGE) ticks.pop();
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
  const tps = getCurrentTPS();
  log('Current TPS:', getTPSColor(tps) + tps);
  const aTPS = getAverageTPS();
  log('Average TPS:', getTPSColor(aTPS) + aTPS.toFixed(1));
  const mTPS = getMinimumTPS();
  log('Minimum TPS:', getTPSColor(mTPS) + mTPS);
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
  tpsDisplay.setLines(formatTps(getCurrentTPS(), getAverageTPS(), getMinimumTPS()));
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