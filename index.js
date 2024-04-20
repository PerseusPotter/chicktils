import { log } from './util/log';
import settings, { Property, props, setIsMain as setIsMainS } from './settings';
import { setIsMain as setIsMainD } from './data';
import { load, unload, postInit } from './loader';
import tabCompletion from './util/tabcompletion';
import * as Updater from './updater';
import { centerMessage } from './util/format';
setIsMainS();
setIsMainD();
const VERSION = '0.0.6';

let sev;
function tryUpdate(delay = 0) {
  try {
    const m = Updater.loadMeta();
    const v = Updater.getVersion(m);
    if (v === VERSION) return -1;
    if (delay > 0) Thread.sleep(delay);
    ChatLib.chat(ChatLib.getCenteredText('&9&lChickTils &r&5Update Found!'));
    ChatLib.chat(ChatLib.getCenteredText(`&4v${VERSION} &r-> &2v${v}`));
    centerMessage(new Message(new TextComponent('&nClick to Open').setClick('open_url', 'https://github.com/PerseusPotter/chicktils/releases/latest'))).chat();
    const u = Updater.getAssetURL(m);
    try {
      Updater.downloadUpdate(u);
    } catch (e) {
      if (settings.isDev) log('failed to download update:', e, e.stack);
      else log('failed to download update');
      centerMessage(new Message(new TextComponent('&nClick to Manually Update').setClick('open_url', 'https://github.com/PerseusPotter/chicktils/releases/latest'))).chat();
      return 1;
    }
    const vv = Updater.getCurrVV();
    const uvv = Updater.getUpdateVV();
    sev = vv.findIndex((v, i) => v < uvv[i]);
    if (sev < 0) return -1; // if i fuck up idk
    ChatLib.chat(ChatLib.getCenteredText('&9&lChickTils &r&5Update Found!'));
    ChatLib.chat(ChatLib.getCenteredText(`&4v${VERSION} &r-> &2v${v}`));
    if (sev === 0 || (sev === 1 && !settings.isDev)) ChatLib.chat(ChatLib.getCenteredText('&l&cNote: Your game will be restarted.'));
    if (sev === 1 && settings.isDev) ChatLib.chat(ChatLib.getCenteredText('&l&cNote: Your CT Modules will be reloaded.'));
    const ans = new Message(new TextComponent('&a[YES]').setClick('run_command', '/csmupdate accept'), '   ', new TextComponent('&4[NO]').setClick('run_command', '/csmupdate deny'));
    centerMessage(ans);
    ans.chat();
    return 0;
  } catch (e) {
    if (settings.isDev) log('failed to fetch update:', e, e.stack);
    else log('failed to fetch update');
  }
}
register('command', res => {
  if (sev === undefined) return;
  if (res === 'accept') {
    Updater.applyUpdate();
    if (sev === 0) crashGame('updating !');
    if (sev === 1) Java.type('com.chattriggers.ctjs.Reference').reloadCT();
    if (sev === 2) settings.isDev ? ChatLib.command('chicktils reload', true) : Java.type('com.chattriggers.ctjs.Reference').reloadCT();
    sev = void 0;
  } else sev = void loadMod();
}).setName('csmupdate');
function loadMod() {
  log('&7Loading ChickTils...');
  load();
  settings.refresh();
  postInit();
  log('&7ChickTils Loaded!');
}

function crashGame(txt) {
  const cr = new (Java.type('net.minecraft.crash.CrashReport'))('ChickTils', new (Java.type('java.lang.Throwable'))(txt));
  Client.getMinecraft().func_71404_a(cr);
}

register('command', ...args => {
  if (!args) args = ['config'];

  const cmdName = args.shift();

  try {
    switch (cmdName) {
      case 'help':
      case '?':
        [
          `&9&l-> ChickTils v${VERSION}`,
          ' &3/chicktils &7(Alias &f/cts, /csm&7)',
          ' &3/chicktils update &l-> &bchecks for updates',
          ' &3/chicktils help &l-> &bshows this help menu &7(Alias &f/chicktils ?&7)',
          ' &3/chicktils reload &l-> &breloads modules',
          ' &3/chicktils unload &l-> &bunloads modules',
          ' &3/chicktils config view [<page>] &l-> &bopens the settings',
          ' &3/chicktils config edit <name> [<value>] &l-> &bopens the settings',
          ' &3/chicktils config search <search term> &l-> &bsearches the settings'
        ].forEach(v => ChatLib.chat(v));
        break;
      case 'update':
        new Thread(() => {
          if (tryUpdate() === -1) log('You are up to date!');
        }).start();
        break;
      case 'config':
        if (args.length === 0) args = ['view'];
        if (args[0] === 'view') {
          if (args.length === 1) args[1] = settings.minPage.toString();
          // how scuffed do you want it: yes
          const p = new Property('pageHelper', 0, 0, Property.Type.Integer, 1, { min: settings.minPage, max: settings.maxPage });
          const page = p.parse(args[1]);
          p.validate(page);
          settings.display(page);
        } else if (args[0] === 'search') {
          settings.displaySearch(args[1] || '');
        } else if (args[0] === 'edit') {
          if (args.length === 1) throw 'missing arguments';
          settings.update(args[1], args.slice(2).join(' '));
        } else throw 'unknown argument: ' + args[0];
        break;
      case 'reload':
        unload();
        load();
        break;
      case 'unload':
        unload();
        break;
      default:
        throw 'Unknown command: ' + cmdName;
    }
  } catch (e) {
    log(e.toString());
    if (settings.isDev) log(e.stack);
  }
}).setTabCompletions(tabCompletion({
  help: [],
  '?': [],
  config: {
    search: [],
    view: [],
    edit: Object.values(props).map(p => [p.name, p.type === Property.Type.Option ? p.opts.options : p.type === Property.Type.Toggle ? ['true', 'false'] : []]).reduce((a, [k, v]) => (a[k] = v, a), {})
  },
  reload: []
})).setName('chicktils').setAliases('csm', 'cts');

if (!Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper')?.instance) {
  // log('helper mod not found, please copy it from `/ct files -> modules -> chicktils -> chicktilshelper -> build -> libs` to your mod folder');
  const src = new (Java.type('java.io.File'))('./config/ChatTriggers/modules/chicktils/chicktilshelper/build/libs/chicktilshelper-1.0.jar').toPath();
  const dst = Java.type('java.nio.file.Paths').get('./mods/chicktilshelper-1.0.jar');
  Java.type('java.nio.Files').copy(src, dst, Java.type('java.nio.file.StandardCopyOption').REPLACE_EXISTING);
  crashGame('need to load helper mod (it has been copied for you) :D');
}

const worldLoadOnce = register('worldLoad', () => {
  new Thread(() => {
    // TODO: check for skyblock
    settings.load();
    if (settings.autoUpdate && tryUpdate(1000) !== -1) { }
    else loadMod();

    worldLoadOnce.unregister();
  }).start();
});