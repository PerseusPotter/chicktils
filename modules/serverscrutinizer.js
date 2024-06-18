import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import reg from '../util/registerer';

let tpsC = 0;
let ticks = [Date.now()];
const MAX_TICK_AGE = 5_000;
const cap = n => settings.serverScrutinizerTPSDisplayCap20 ? Math.min(20, n) : n;
function getCurrentTPS() {
  if (ticks.length === 0) return 0;
  const f = ticks[0];
  let i = 1;
  while (ticks.length > i && f - ticks[i] <= 1_000) i++;
  return cap(i);
}
function getAverageTPS() {
  return cap(ticks.length / MAX_TICK_AGE * 1000);
}
let minTPSC = 0;
let minTPSV = -1;
function getMinimumTPS() {
  if (tpsC === minTPSV) return minTPSC;
  minTPSC = _getMinimumTPS();
  minTPSV = tpsC;
  return minTPSC;
}
function _getMinimumTPS() {
  if (ticks.length === 0) return 0;
  let l = 0;
  let r = 1;
  let m = Number.POSITIVE_INFINITY;
  while (ticks.length > r) {
    while (ticks.length > r && ticks[l] - ticks[r] <= 1_000) r++;
    if (r - l < m) m = r - l;
    l++;
  }
  return cap(m);
}

const serverTickReg = reg('packetReceived', () => {
  const t = Date.now();
  ticks.unshift(t);
  tpsC++;
}, 'serverscrutinizer').setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction'));

function getTPSColor(tps) {
  return colorForNumber(tps - 15, 5);
}

const tpsCmd = reg('command', () => {
  const tps = getCurrentTPS();
  log('Current TPS:', getTPSColor(tps) + tps);
  const aTPS = getAverageTPS();
  log('Average TPS:', getTPSColor(aTPS) + aTPS.toFixed(1));
  const mTPS = getMinimumTPS();
  log('Minimum TPS:', getTPSColor(mTPS) + mTPS);
}, 'serverscrutinizer').setName('tps');

function formatTps(curr, avg, min) {
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
  while (t - ticks[ticks.length - 1] > MAX_TICK_AGE) ticks.pop();
  tpsDisplay.setLines(formatTps(getCurrentTPS(), getAverageTPS(), getMinimumTPS()));
  tpsDisplay.render();
}, 'serverscrutinizer').setEnabled(settings._serverScrutinizerTPSDisplay);

const lastTickDisplay = createTextGui(() => data.serverScrutinizerLastPacketDisplay, () => ['zzz for &469.42s']);
const rendOvLTD = reg('renderOverlay', () => {
  const t = Date.now() - ticks[0];
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
  tpsCmd.register();
  rendOvTps.register();
  rendOvLTD.register();
}
export function unload() {
  serverTickReg.unregister();
  tpsCmd.unregister();
  rendOvTps.unregister();
  rendOvLTD.unregister();
}