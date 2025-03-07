import settings from './settings';
import { log } from './util/log';

const JSLoader = Java.type('com.chattriggers.ctjs.engine.langs.js.JSLoader');
const UrlModuleSourceProvider = Java.type('org.mozilla.javascript.commonjs.module.provider.UrlModuleSourceProvider');
const UrlModuleSourceProviderInstance = new UrlModuleSourceProvider(null, null);
const StrongCachingModuleScriptProviderClass = Java.type('org.mozilla.javascript.commonjs.module.provider.StrongCachingModuleScriptProvider');
let StrongCachingModuleScriptProvider = new StrongCachingModuleScriptProviderClass(UrlModuleSourceProviderInstance);
let CTRequire = new JSLoader.CTRequire(StrongCachingModuleScriptProvider);

export const modules = new Map();
// soopy !
function RequireNoCache(name) {
  if (!settings.isDev) {
    if (modules.has(name)) return modules.get(name);
    return require('./modules/' + name + '.js');
  }

  // StrongCachingModuleScriptProvider = new StrongCachingModuleScriptProviderClass(UrlModuleSourceProviderInstance);
  // CTRequire = new JSLoader.CTRequire(StrongCachingModuleScriptProvider);
  return CTRequire('./modules/' + name + '.js');
}

export function unload() {
  modules.forEach(v => v.unload());
  modules.clear();
}
export function load() {
  const list = JSON.parse(FileLib.read('chicktils', 'modules/modules.json'));
  list.forEach(v => {
    initModule(v);
    if (settings['enable' + v]) loadModule(v);
  });
}
export function initModule(name) {
  try {
    if (modules.has(name)) return;
    const m = RequireNoCache(name);
    modules.set(name, m);
    m.init();
  } catch (e) {
    log('error preloading module', name);
    if (settings.isDev) {
      log(e.message);
      log(e.stack);
    }
    console.log(e + '\n' + e.stack);
  }
}
export function loadModule(name) {
  try {
    modules.get(name)?.load();
  } catch (e) {
    log('error loading module', name);
    if (settings.isDev) {
      log(e.message);
      log(e.stack);
    }
    console.log(e + '\n' + e.stack);
  }
}
export function unloadModule(name) {
  modules.get(name)?.unload();
}

export function postInit() {
  JSON.parse(FileLib.read('chicktils', 'modules/modules.json')).forEach(n => settings['_enable' + n].listen(v => moduleEnableListener(n, v)));
  settings._enableGlobal.listen(v => v ? load() : unload());
}

function moduleEnableListener(name, value) {
  if (value) loadModule(name);
  else unloadModule(name);
}