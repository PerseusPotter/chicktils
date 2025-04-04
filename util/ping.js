import settings from '../settings';
import { Deque, JavaTypeOrNull } from './polyfill';

// lazy stfu
const Ping = JavaTypeOrNull('gg.skytils.skytilsmod.features.impl.misc.Ping');
let lastPing = 0;
const PING_WINDOW_TIME = 60;
let PING_WINDOW_SIZE = Math.max(2, ~~(PING_WINDOW_TIME / settings.pingRefreshDelay));
const pingWindow = new Deque();
let pingSum = 0;
export function getPing() {
  if (!Ping || settings.pingRefreshDelay === 0) return 0;
  const t = Date.now();
  if (t - lastPing > settings.pingRefreshDelay * 1000) {
    Ping.INSTANCE.sendPing();
    lastPing = t;
  }
  return Ping.INSTANCE.getPingCache();
}
export function getAveragePing() {
  const p = getPing();
  if (pingWindow.length === 0) {
    pingWindow.push(p);
    pingSum += p;
    return p;
  }
  if (p === pingWindow.getFirst()) return pingSum / pingWindow.length;
  if (pingWindow.length === PING_WINDOW_SIZE) {
    const m = pingSum / pingWindow.length;
    const stddev = Math.sqrt(pingWindow.reduce((a, v) => a + (v - m) ** 2, 0)) / (PING_WINDOW_SIZE - 1);
    // 10 lmao
    if ((p - m) / stddev > 10) return m;
  }
  pingWindow.unshift(p);
  pingSum += p;
  if (pingWindow.length > PING_WINDOW_SIZE) {
    const o = pingWindow.pop();
    pingSum -= o;
  }
  return pingSum / pingWindow.length;
}