import { log } from './util/log';
import settings, { Property, props, setIsMain as setIsMainS } from './settings';
import { setIsMain as setIsMainD } from './data';
import { load, unload, postInit } from './loader';
import tabCompletion from './util/tabcompletion';
import * as Updater from './updater';
import { centerMessage, cleanNumber } from './util/format';
import { getPing, getAveragePing } from './util/ping';
import { getRegs, simulate } from './util/registerer';
import { calcMedian } from './util/math';
setIsMainS();
setIsMainD();
const VERSION = '0.10.0';

let sev;
function tryUpdate(delay = 0) {
  try {
    const m = Updater.loadMeta();
    const v = Updater.getVersion(m);
    if (v === VERSION) return -1;
    if (delay > 0) Thread.sleep(delay);
    const u = Updater.getAssetURL(m);
    try {
      Updater.downloadUpdate(u);
    } catch (e) {
      if (settings.isDev) log('failed to download update:', e, e.stack);
      else log('failed to download update');
      console.log(e + '\n' + e.stack);
      centerMessage(new Message(new TextComponent('&nClick to Manually Update').setClick('open_url', 'https://github.com/PerseusPotter/chicktils/releases/latest'))).chat();
      return 1;
    }
    const vv = Updater.getCurrVV();
    const uvv = Updater.getUpdateVV();
    sev = vv.findIndex((v, i) => v < uvv[i]);
    if (sev < 0) { // if i fuck up idk
      Updater.deleteDownload();
      return -1;
    }
    ChatLib.chat(centerMessage('&9&lChickTils &r&5Update Found!'));
    centerMessage(new Message(new TextComponent('&3&nClick to View on GitHub').setClick('open_url', 'https://github.com/PerseusPotter/chicktils/releases/latest'))).chat();
    centerMessage(new Message(new TextComponent('&3&nClick to Print Changelog').setClick('run_command', '/ChickTilsViewChangelog'))).chat();
    ChatLib.chat(centerMessage(`&4v${VERSION} &r-> &2v${v}`));
    ChatLib.chat('')
    if (sev === 0) ChatLib.chat(centerMessage('&c&lNote: Your game will be restarted.'));
    else if (sev === 1 || (sev === 2 && !settings.isDev)) ChatLib.chat(centerMessage('&c&lNote: Your CT Modules will be reloaded.'));
    else {
      ChatLib.chat(centerMessage('&c&lNote: ChickTils will be reloaded.'));
      ChatLib.chat(centerMessage('&c&l(but you already knew that)'));
    }
    centerMessage(new Message(new TextComponent('&a[YES]').setClick('run_command', '/ChickTilsUpdate accept'), '   ', new TextComponent('&4[NO]').setClick('run_command', '/ChickTilsUpdate deny'))).chat();
    return 0;
  } catch (e) {
    if (settings.isDev) log('failed to fetch update:', e, e.stack);
    else log('failed to fetch update');
    console.log(e + '\n' + e.stack);
  }
}
register('command', res => {
  if (sev === undefined) log('there is not an update pending');
  else if (res === 'accept') {
    Updater.applyUpdate(sev);
    if (sev === 0) crashGame('updating !');
    if (sev === 1) Java.type('com.chattriggers.ctjs.Reference').reloadCT();
    if (sev === 2) settings.isDev ? ChatLib.command('chicktils reload', true) : Java.type('com.chattriggers.ctjs.Reference').reloadCT();
    sev = void 0;
  } else {
    sev = void 0;
    Updater.deleteDownload();
    loadMod();
  }
}).setName('ChickTilsUpdate');
register('command', () => {
  try {
    /** @type {{ version: string, changes: { type: 'feat' | 'fix' | 'misc' | 'del' | 'change', desc: string }[] }[]} */
    const changelog = Updater.getChangelogDiff(VERSION).reverse();
    const typeColors = {
      'feat': '&a+ feat: ',
      'fix': '&f= fix: ',
      'misc': '&7= misc: ',
      'change': '&6/ change: ',
      'del': '&4- remove: '
    };
    const typeSort = ['feat', 'del', 'change', 'fix', 'misc'];
    changelog.forEach(({ version, changes }, i) => {
      if (i > 0) ChatLib.chat('');
      ChatLib.chat(centerMessage('&3&lv' + version));
      changes.sort((a, b) => typeSort.indexOf(a.type) - typeSort.indexOf(b.type)).forEach(({ type, desc }) => ChatLib.chat(typeColors[type] + desc));
    });
  } catch (e) {
    log('&4failed to get changelog, is the update downloaded?');
  }
}).setName('ChickTilsViewChangelog');

function loadMod() {
  log('&7Loading ChickTils...');
  load();
  settings.triggerAll();
  postInit();
  log('&7ChickTils Loaded!');
}

function crashGame(txt) {
  const cr = new (Java.type('net.minecraft.crash.CrashReport'))('ChickTils', new (Java.type('java.lang.Throwable'))(txt));
  Client.getMinecraft().func_71404_a(cr);
}

register('command', ...args => {
  if (!args) args = ['config', 'gui'];

  const cmdName = args.shift();

  try {
    switch (cmdName) {
      case 'help':
      case '?':
        [
          `&9&l-> ChickTils v${VERSION}`,
          ' &3/chicktils &7(Alias &f/cts, /csm&7)',
          ' &3/chicktils help &l-> &bshows this help menu &7(Alias &f/chicktils ?&7)',
          ' &3/chicktils update &l-> &bchecks for updates',
          ' &3/chicktils ping &l-> &bcurrent ping (not refreshed maybe)',
          ' &3/chicktils reload &l-> &breloads modules',
          ' &3/chicktils unload &l-> &bunloads modules',
          ' &3/chicktils config view [<page>] &l-> &bopens the settings',
          ' &3/chicktils config edit <name> [<value>] &l-> &bopens the settings',
          ' &3/chicktils config search <search term> &l-> &bsearches the settings',
          ' &3/chicktils stats &l-> &bshows stats',
          ' &3/chicktils simulate <message> &l-> &bsimulates chat message'
        ].forEach(v => ChatLib.chat(v));
        break;
      case 'update':
        new Thread(() => {
          if (tryUpdate() === -1) log('You are up to date!');
        }).start();
        break;
      case 'ping':
        log('ping:', getPing());
        log('avg ping:', getAveragePing());
        break;
      case 'config_edit':
        World.playSound('gui.button.press', 1, 1);
        Client.setCurrentChatMessage(`/${settings.module} config edit ${args.join(' ')}`);
        break;
      case 'config_':
        World.playSound('gui.button.press', 1, 1);
      case 'config':
        if (args.length === 0) args[0] = 'view';
        if (args[0] === 'gui') settings.amaterasu.openGui();
        else if (args[0] === 'view') {
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
      case 'stats': {
        function format(t) {
          return Object.entries(t).sort((a, b) => b[1] - a[1]).map(v => `&7x${v[1]} ${v[0]} `).join('\n');
        }
        let countT = 0;
        let typesT = {};
        const count = [0, 0, 0];
        const types = [{}, {}, {}];
        getRegs().forEach(v => {
          const i = v.getIsReg() + v.getIsAReg();
          const t = types[i];
          t[v.type] = (t[v.type] || 0) + 1;
          count[i]++;
          countT++;
          typesT[v.type] = (typesT[v.type] || 0) + 1;
        });
        new Message(
          centerMessage(`&9&lChickTils &r&5v${VERSION}`) + '\n',
          new TextComponent(`Registers Defined: &3${countT}\n`)
            .setHover('show_text', format(typesT)),
          new TextComponent(`Registers Idle: &3${count[0]}\n`)
            .setHover('show_text', format(types[0])),
          new TextComponent(`Registers Disabled: &3${count[1]}\n`)
            .setHover('show_text', format(types[1])),
          new TextComponent(`Registers Active: &3${count[2]}\n`)
            .setHover('show_text', format(types[2])),
          new TextComponent('&6CLICK HERE').setClick('run_command', '/ChickTilsRunTest'),
          '&r to run performance tests'
        ).chat();
        break;
      }
      case 'simulate': {
        const s = args.join(' ');
        simulate(s);
        ChatLib.chat(s);
        break;
      }
      default:
        throw 'Unknown command: ' + cmdName;
    }
  } catch (e) {
    log(e.toString());
    if (settings.isDev) log(e.stack);
    console.log(e + '\n' + e.stack);
  }
}).setTabCompletions(tabCompletion({
  help: [],
  '?': [],
  config: {
    search: [],
    view: [],
    edit: Object.values(props).map(p => [p.name, p.type === Property.Type.Option ? p.opts.options : p.type === Property.Type.Toggle ? ['true', 'false'] : []]).reduce((a, [k, v]) => (a[k] = v, a), {})
  },
  reload: [],
  unload: [],
  update: [],
  ping: [],
  stats: [],
  simulate: []
})).setName('chicktils').setAliases('csm', 'cts');

const worldLoadOnce = register('worldLoad', () => {
  worldLoadOnce.unregister();
  new Thread(() => {
    Thread.sleep(1000);
    // TODO: check for skyblock
    settings.load();
    if (settings.autoUpdate && tryUpdate(1000) !== -1) { }
    else loadMod();

  }).start();
});

let isTesting = false;
register('command', () => {
  if (isTesting) return log('already running test!');
  isTesting = true;
  new Thread(() => {
    let renderTicks = [];
    let lastRenderTick = 0;
    let gameTicks = [];
    let lastGameTick = 0;
    const System = Java.type('java.lang.System');
    Thread.sleep(1000);
    const renderReg = register(net.minecraftforge.fml.common.gameevent.TickEvent.RenderTickEvent, evn => {
      if (evn.phase.toString() === 'START') {
        lastRenderTick = System.nanoTime();
      } else if (lastRenderTick) {
        renderTicks.push(System.nanoTime() - lastRenderTick);
        lastRenderTick = 0;
      }
    });
    const gameReg = register(net.minecraftforge.fml.common.gameevent.TickEvent.ClientTickEvent, evn => {
      if (evn.phase.toString() === 'START') {
        lastGameTick = System.nanoTime();
      } else if (lastGameTick) {
        gameTicks.push(System.nanoTime() - lastGameTick);
        lastGameTick = 0;
      }
    });
    Thread.sleep(5000);
    const loadedRenderMedian = calcMedian(renderTicks);
    const loadedGameMedian = calcMedian(gameTicks);
    const state = getRegs().map(v => v.getIsReg());
    getRegs().forEach(v => v.reg.unregister());
    renderTicks = [];
    gameTicks = [];
    Thread.sleep(5000);
    const unloadedRenderMedian = calcMedian(renderTicks);
    const unloadedGameMedian = calcMedian(gameTicks);
    renderReg.unregister();
    gameReg.unregister();
    log('cost of using ChickTils (lower better):');
    log(`Frame Time: ${cleanNumber(unloadedRenderMedian / 1e6)}ms -> ${cleanNumber(loadedRenderMedian / 1e6)}ms (${loadedRenderMedian > unloadedRenderMedian ? '+' : '-'}${cleanNumber(Math.abs(loadedRenderMedian / unloadedRenderMedian * 100 - 100))}%)`);
    log(`Tick Time: ${cleanNumber(unloadedGameMedian / 1e6)}ms -> ${cleanNumber(loadedGameMedian / 1e6)}ms (${loadedGameMedian > unloadedGameMedian ? '+' : '-'}${cleanNumber(Math.abs(loadedGameMedian / unloadedGameMedian * 100 - 100))}%)`);
    getRegs().forEach((v, i) => v.reg.setRegistered(state[i]));
    isTesting = false;
  }).start();
}).setName('ChickTilsRunTest');

(function() {
  let isTicking = false;
  let tickerThreads = [];
  const tickerTicksT = new (Java.type('java.util.concurrent.ConcurrentLinkedQueue'))();
  const tickerTicksS = new (Java.type('java.util.concurrent.ConcurrentLinkedQueue'))();
  const ActualThread = Java.type('java.lang.Thread');
  const System = Java.type('java.lang.System');
  const freezeDur = 100 * 1e6;
  let tickData = { c: 0 };
  let tickFreezes = [];
  function filterTickData(data) {
    // const filtered = Object.entries(data).filter(v => v[0] !== 'c' && v[1].t > 0).sort((a, b) => b[1].c - a[1].c);
    const filtered = Object.entries(data).filter(v => v[0] !== 'c').sort((a, b) => b[1].c - a[1].c);
    filtered.forEach(v => v[1] = Object.entries(v[1]).sort((a, b) => (b[0].length === 1 ? Number.MAX_SAFE_INTEGER : b[1]) - (a[0].length === 1 ? Number.MAX_SAFE_INTEGER : a[1])).reduce((a, v) => ((a[v[0]] = v[1]), a), {}));
    return filtered.reduce((a, v) => ((a[v[0]] = v[1]), a), { c: data.c });
  }
  register('command', () => {
    if (isTicking) return log('already running ticker');
    isTicking = true;

    tickData = { c: 0 };
    tickFreezes = [];
    const mainThread = Thread.currentThread();

    tickerThreads.push(new ActualThread(() => {
      let startT = 0;
      while (!ActualThread.interrupted()) {
        // ActualThread.sleep(0, 2e4);
        let t = System.nanoTime();
        if (!startT) startT = t;
        t -= startT;
        tickerTicksT.add(t);
        tickerTicksS.add(mainThread.getStackTrace());
      }
    }));

    tickerThreads.push(new ActualThread(() => {
      let freezeData = { c: 0 };
      let ptb = 0;

      while (!ActualThread.interrupted()) {
        // ActualThread.sleep(0, 1e5);
        ActualThread.sleep(1);

        while (!tickerTicksT.isEmpty() && !tickerTicksS.isEmpty()) {
          let t = tickerTicksT.poll();
          let stack = tickerTicksS.poll();
          let prev = stack[0].toString();
          for (let i = 1; i < stack.length; i++) {
            let dataT = tickData[prev] || (tickData[prev] = { c: 0, t: 0 });
            let dataF = freezeData[prev] || (freezeData[prev] = { c: 0, t: 0 });
            dataT[stack[i]] = (dataT[stack[i]] || 0) + 1;
            dataF[stack[i]] = (dataF[stack[i]] || 0) + 1;
            dataT.c++;
            dataF.c++;
            if (i === 1) dataT.t++;
            if (i === 1) dataF.t++;
            prev = stack[i].toString();
          }
          tickData.c++;
          freezeData.c++;

          const tb = ~~(t / freezeDur);
          if (tb !== ptb) {
            ptb = tb;
            const data = filterTickData(freezeData);
            freezeData = { c: 0 };
            Object.entries(data).forEach(([k, v]) => {
              const fp = v.c / data.c;
              const ap = tickData[k].c / tickData.c;
              if (fp - ap > 0.2 && fp / ap > 1.3) tickFreezes.push({ t: t / 1e9, fp, ap, k, vc: v.c, dc: data.c });
            });
          }
        }
      }
    }));
    tickerThreads.forEach(v => v.start());
  }).setName('ChickTilsRunTicker');

  register('command', () => {
    if (!isTicking) return log('ticker not running');
    isTicking = false;
    tickerThreads.forEach(v => v.interrupt());
    tickerThreads = [];
    new Thread(() => {
      ActualThread.sleep(100);
      tickData = filterTickData(tickData);
      // FileLib.write('chicktils', 'tickerreport.json', JSON.stringify({ total: tickData, freezes: tickFreezes.sort((a, b) => (b.fp - b.ap) - (a.fp - a.ap)) }, null, 2));
      FileLib.write('chicktils', 'tickerreport.json', JSON.stringify({ total: tickData, freezes: tickFreezes }, null, 2));
      tickerTicksT.clear();
      tickerTicksS.clear();
      log('ticker report generated');
    }).start();
  }).setName('ChickTilsStopTicker');
}());