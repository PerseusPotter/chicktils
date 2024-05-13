import settings from '../settings';

// lazy stfu
const Ping = Java.type('gg.skytils.skytilsmod.features.impl.misc.Ping');
let lastPing = 0;
export default function getPing() {
  if (!Ping || settings.pingRefreshDelay === 0) return 0;
  const t = Date.now();
  if (t - lastPing > settings.pingRefreshDelay * 1000) {
    Ping.INSTANCE.sendPing();
    lastPing = t;
  }
  return Ping.INSTANCE.getPingCache();
}