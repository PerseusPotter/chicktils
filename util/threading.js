import { log } from './log';

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