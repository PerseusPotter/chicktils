import settings from './settings';

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
    return require('./modules/' + name);
  }

  StrongCachingModuleScriptProvider = new StrongCachingModuleScriptProviderClass(UrlModuleSourceProviderInstance);
  CTRequire = new JSLoader.CTRequire(StrongCachingModuleScriptProvider);
  return CTRequire('./modules/' + name);
}

export function unload() {
  modules.forEach(v => v.unload());
  modules.clear();
}
export function load() {
  const list = JSON.parse(FileLib.read('chicktils', 'modules/modules.json'));
  list.forEach(v => settings['enable' + v] && loadModule(v));
}
export function loadModule(name) {
  const m = modules.has(name) ? modules.get(name) : RequireNoCache(name);
  if (!modules.has(name)) m.init();
  modules.set(name, m);
  m.load();
  return m;
}
export function unloadModule(name) {
  if (!modules.has(name)) return;
  modules.get(name).unload();
}

export function postInit() {
  JSON.parse(FileLib.read('chicktils', 'modules/modules.json')).forEach(n => settings['_enable' + n].onAfterChange(v => moduleEnableListener(n, v)));
  settings._enableGlobal.onAfterChange(v => v ? load() : unload());
}

function moduleEnableListener(name, value) {
  if (value) loadModule(name);
  else unloadModule(name);
}