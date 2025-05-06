import { log } from './log';
import { endTick, PROFILER, start } from './profiler';

const Threading = Java.type('gg.essential.api.utils.Multithreading');
let mainThread;
Client.scheduleTask(() => {
  mainThread = Thread.currentThread();
  packetThreadReg.register();
});
let packetThread;
const packetThreadReg = register('packetReceived', () => {
  packetThread = Thread.currentThread();
  packetThreadReg.unregister();
}).unregister();
export function run(cb) {
  cb = wrap(cb);
  const t = Thread.currentThread();
  if (!mainThread || mainThread === t || packetThread === t) Threading.runAsync(cb);
  else cb();
}
export function unrun(cb) {
  cb = wrap(cb);
  if (PROFILER) {
    const stack = Thread.currentThread().getStackTrace();
    let fileName = '<unknown>';
    let lineNum = 0;
    for (let i = stack.length - 1; i >= 0; i--) {
      let fn = stack[i].getFileName();
      if (!fn) continue;
      if (fn.endsWith('/chicktils/util/threading.js')) {
        let fn1 = stack[i + 1].getFileName();
        let fn2 = stack[i + 2].getFileName();
        if (fn1 === 'OptRuntime.java') {
          fileName = fn2.split('modules/chicktils/').pop();
          lineNum = stack[i + 2].getLineNumber();
        } else if (fn1 === 'Require.java') {
          fileName = 'util/threading.js';
          lineNum = stack[i - 2].getLineNumber();
        }
        else console.error('error parsing stack: ' + fn1);
        break;
      }
    }
    const orig = cb;
    cb = () => {
      start();
      orig();
      endTick(`${fileName}:${lineNum}|scheduleTask`);
    };
  }
  if (mainThread === Thread.currentThread()) cb();
  else Client.scheduleTask(cb);
}
export function wrap(cb) {
  return function(...args) {
    try {
      if (args && args.length && !(args.length === 1 && args[0] === undefined)) return cb(...args);
      else return cb();
    } catch (e) {
      log('error', e);
      log(e.stack);
      console.log(e + '\n' + e.stack);
    }
  };
}