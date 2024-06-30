const Threading = Java.type('gg.essential.api.utils.Multithreading');
export function run(cb) {
  Threading.runAsync(cb);
}