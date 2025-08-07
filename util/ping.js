import settings from '../settings';
import { getBlockPos } from './mc';
import { Deque } from './polyfill';
import reg from './registerer';

const MAX_PING = 60_000;
const MAX_PING_AGE = 120_000;

/** @type {Deque<{ t: number, v: number, w: number }>} */
const pingSamples = new Deque();
const samplesLock = new (Java.type('java.util.concurrent.locks.ReentrantLock'))();
let pingSum = 0;
let pingWeightSum = 0;
function addSample(ping, weight) {
  samplesLock.lock();
  try {
    pingSamples.push({ t: getTimeMS(), v: ping, w: weight });
    pingSum += ping * weight;
    pingWeightSum += weight;
  } finally {
    samplesLock.unlock();
  }
}
function trimSamples() {
  const t = getTimeMS() - MAX_PING_AGE;
  samplesLock.lock();
  try {
    while (pingSamples.length > 0 && pingSamples.getFirst().t < t) {
      let sample = pingSamples.shift();
      pingSum -= sample.v;
      pingWeightSum -= sample.w;
    }
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
const awaitingBlockUpdates = new Map();

const EnumFacing = Java.type('net.minecraft.util.EnumFacing');

const C16PacketClientStatus = Java.type('net.minecraft.network.play.client.C16PacketClientStatus');
const C07PacketPlayerDigging = Java.type('net.minecraft.network.play.client.C07PacketPlayerDigging');
const C08PacketPlayerBlockPlacement = Java.type('net.minecraft.network.play.client.C08PacketPlayerBlockPlacement');
reg('packetSent', pack => {
  if (pack instanceof C16PacketClientStatus) {
    if (pack.func_149435_c() === C16PacketClientStatus.EnumState.REQUEST_STATS) {
      if (!didBeat && lastHeartbeat && getTimeMS() < lastHeartbeat + 1000 * settings.pingRefreshDelay) cancel(pack);
      else lastHeartbeat = getTimeMS();
    }
  } else if (pack instanceof C07PacketPlayerDigging) {
    const status = pack.func_180762_c();
    if (status === C07PacketPlayerDigging.Action.ABORT_DESTROY_BLOCK || status === C07PacketPlayerDigging.Action.STOP_DESTROY_BLOCK) {
      const pos = getBlockPos(pack.func_179715_a());
      awaitingBlockUpdates.set(`${pos.x},${pos.y},${pos.z}`, getTimeMS());
    }
  } else if (pack instanceof C08PacketPlayerBlockPlacement) {
    const dir = pack.func_149568_f();
    if (dir !== 255) {
      const pos = pack.func_179724_a();
      const facing = EnumFacing.func_82600_a(dir);
      const pos1 = getBlockPos(pos);
      const pos2 = getBlockPos(pos.func_177972_a(facing));
      const t = getTimeMS();
      awaitingBlockUpdates.set(`${pos1.x},${pos1.y},${pos1.z}`, t);
      awaitingBlockUpdates.set(`${pos2.x},${pos2.y},${pos2.z}`, t);
    }
  }
}).setFilteredClasses([C16PacketClientStatus, C07PacketPlayerDigging, C08PacketPlayerBlockPlacement]).register();
const S37PacketStatistics = Java.type('net.minecraft.network.play.server.S37PacketStatistics');
const S23PacketBlockChange = Java.type('net.minecraft.network.play.server.S23PacketBlockChange');
reg('packetReceived', pack => {
  if (pack instanceof S37PacketStatistics) {
    if (!didBeat && lastHeartbeat) {
      addSample(getTimeMS() - lastHeartbeat, 20);
      didBeat = true;
    }
  } else if (pack instanceof S23PacketBlockChange) {
    const pos = getBlockPos(pack.func_179827_b());
    const key = `${pos.x},${pos.y},${pos.z}`;
    if (awaitingBlockUpdates.has(key)) {
      addSample(getTimeMS() - awaitingBlockUpdates.get(key), 1);
      awaitingBlockUpdates.delete(key);
    }
  }
}).setFilteredClasses([S37PacketStatistics, S23PacketBlockChange]).register();
reg('worldUnload', () => {
  lastHeartbeat = 0;
  didBeat = true;
  awaitingBlockUpdates.clear();
}).register();
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
    ping = pingSamples.length === 0 ? 0 : pingSum / pingWeightSum;
  } finally {
    samplesLock.unlock();
  }
  return ping;
}