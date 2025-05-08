import { getOrPut } from './polyfill';

export const PROFILER = false;

const nanoTime = java.lang.System.nanoTime;
if (PROFILER) {
  var $rendData = new Map();
  var $tickData = new Map();
  var $mainThread;
  Client.scheduleTask(() => $mainThread = Thread.currentThread());
  const writer = new java.io.BufferedWriter(new java.io.FileWriter('./config/ChatTriggers/modules/chicktils/ticktimes.log', false));
  register('gameUnload', () => writer.close());
  let rTickStart = 0;
  register(net.minecraftforge.fml.common.gameevent.TickEvent.RenderTickEvent, evn => {
    if (evn.phase.toString() !== 'END') return rTickStart = nanoTime();
    writer.write('RENDER TICK START\n');
    const time = dumpData($rendData);
    const dt = nanoTime() - rTickStart;
    writer.write(`RENDER TICK END ${time} frame: ${dt} fps: ${~~(1e9 / dt)}\n`);
    $rendData.clear();
  });
  register(net.minecraftforge.fml.common.gameevent.TickEvent.ClientTickEvent, evn => {
    if (evn.phase.toString() !== 'END') return;
    writer.write('CLIENT TICK START\n');
    const time = dumpData($tickData);
    writer.write(`CLIENT TICK END ${time}\n`);
    $tickData.clear();
  });
  function dumpData(map) {
    let totalTime = 0;
    map.forEach((v, k) => {
      if (v.length === 1) {
        writer.write(`${k}> ${v[0]}\n`);
        totalTime += v[0];
      } else {
        writer.write(`${k}> [${v.join(', ')}]\n`);
        let min = v[0];
        let max = v[0];
        let sum = v[0];
        for (let i = 1; i < v.length; i++) {
          let k = v[i];
          if (k < min) min = k;
          if (k > max) max = k;
          sum += k;
        }
        totalTime += sum;
        writer.write(`sum ${sum} | min ${min} | max ${max} | avg ${~~(sum / v.length)}\n`);
      }
    });
    return totalTime;
  }
}

let startTime;
export function start() {
  startTime = nanoTime();
}
export function endRender(key) {
  if (Thread.currentThread() !== $mainThread) return;
  const t = nanoTime() - startTime;
  getOrPut($rendData, key, () => []).push(t);
}
export function endTick(key) {
  if (Thread.currentThread() !== $mainThread) return;
  const t = nanoTime() - startTime;
  getOrPut($tickData, key, () => []).push(t);
}