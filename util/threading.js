import { log } from './log';

const Threading = Java.type('gg.essential.api.utils.Multithreading');
let mainThread;
Client.scheduleTask(() => mainThread = Thread.currentThread());
export function run(cb) {
  if (!mainThread || mainThread === Thread.currentThread()) Threading.runAsync(wrap(cb));
  else wrap(cb)();
}
export function unrun(cb) {
  if (mainThread === Thread.currentThread()) cb();
  else Client.scheduleTask(cb);
}
export function wrap(cb) {
  return function(...args) {
    try {
      cb(...args);
    } catch (e) {
      log('error', e);
      log(e.stack);
      console.error(e);
    }
  };
}