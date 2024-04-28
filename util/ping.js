import settings from '../settings';

// lazy stfu
const Ping = Java.type('gg.skytils.skytilsmod.features.impl.misc.Ping');
let lastPing = 0;
export default function getPing() {
  if (!Ping) return 0;
  const t = Date.now();
  if (t - lastPing > settings.pingRefreshDelay) {
    Ping.sendPing();
    lastPing = t;
  }
  return Ping.pingCache;
}