import settings from '../settings';
import { Deque } from './polyfill';
import reg from './registerer';

const MAX_PING = 60_000;
const MAX_PING_AGE = 120_000;

/** @type {Deque<{ t: number, v: number }>} */
const pingSamples = new Deque();
const samplesLock = new (Java.type('java.util.concurrent.locks.ReentrantLock'))();
let pingSum = 0;
function addSample(ping) {
  samplesLock.lock();
  try {
    pingSamples.push({ t: getTimeMS(), v: ping });
    pingSum += ping;
  } finally {
    samplesLock.unlock();
  }
}
function trimSamples() {
  const t = getTimeMS() - MAX_PING_AGE;
  samplesLock.lock();
  try {
    while (pingSamples.length > 0 && pingSamples.getFirst().t < t) pingSum -= pingSamples.shift().v;
  } finally {
    samplesLock.unlock();
  }
}

const getTimeMS = (function() {
  const nanoTime = Java.type('java.lang.System').nanoTime;
  return () => nanoTime() / 1e6;
})();

let lastHeartbeat = 0;
let didBeat = true;

const C16PacketClientStatus = Java.type('net.minecraft.network.play.client.C16PacketClientStatus');
reg('packetSent', pack => {
  if (pack instanceof C16PacketClientStatus) {
    if (pack.func_149435_c() === C16PacketClientStatus.EnumState.REQUEST_STATS) {
      if (!didBeat && lastHeartbeat && getTimeMS() < lastHeartbeat + 1000 * settings.pingRefreshDelay) cancel(pack);
      else lastHeartbeat = getTimeMS();
    }
  }

}).setFilteredClasses([C16PacketClientStatus]).register();
const S37PacketStatistics = Java.type('net.minecraft.network.play.server.S37PacketStatistics');
reg('packetReceived', pack => {
  if (pack instanceof S37PacketStatistics) {
    if (!didBeat && lastHeartbeat) {
      addSample(getTimeMS() - lastHeartbeat);
      didBeat = true;
    }
  }

}).setFilteredClasses([S37PacketStatistics]).register();
reg('step', () => {
  samplesLock.lock();
  try {
    trimSamples();
  } finally {
    samplesLock.unlock();
  }

  const t = getTimeMS();
  if (
    (t - lastHeartbeat > 1000 * settings.pingRefreshDelay && didBeat) ||
    (t - lastHeartbeat > MAX_PING)
  ) {
    Client.sendPacket(new C16PacketClientStatus(C16PacketClientStatus.EnumState.REQUEST_STATS));
    didBeat = false;
  }
}).setDelay(1).register();

export function getPing() {
  let ping = 0;
  samplesLock.lock();
  try {
    ping = pingSamples.getLast()?.v ?? 0;
  } finally {
    samplesLock.unlock();
  }
  return ping;
}
export function getAveragePing() {
  let ping = 0;
  samplesLock.lock();
  try {
    ping = pingSamples.length === 0 ? 0 : pingSum / pingSamples.length;
  } finally {
    samplesLock.unlock();
  }
  return ping;
}