const Threading = Java.type('gg.essential.api.utils.Multithreading');
const mainThread = Thread.currentThread();
export function run(cb) {
  if (mainThread === Thread.currentThread()) Threading.runAsync(cb);
  else cb();
}
export function unrun(cb) {
  if (mainThread === Thread.currentThread()) cb();
  else Client.scheduleTask(cb);
}