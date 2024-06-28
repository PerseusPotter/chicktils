import { log } from './util/log';
import settings, { Property, props, setIsMain as setIsMainS } from './settings';
import { setIsMain as setIsMainD } from './data';
import { load, unload, postInit } from './loader';
import tabCompletion from './util/tabcompletion';
import { centerMessage, cleanNumber } from './util/format';
import getPing from './util/ping';
import { getRegs } from './util/registerer';
import { calcMedian } from './util/math';
setIsMainS();
setIsMainD();
const VERSION = '0.4.13';

function loadMod() {
  log('&7Loading ChickTils...');
  load();
  settings.refresh();
  postInit();
  log('&7ChickTils Loaded!');
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
          ' &3/chicktils help &l-> &bshows this help menu &7(Alias &f/chicktils ?&7)',
          ' &3/chicktils ping &l-> &bcurrent ping (not refreshed maybe)',
          ' &3/chicktils reload &l-> &breloads modules',
          ' &3/chicktils unload &l-> &bunloads modules',
          ' &3/chicktils config view [<page>] &l-> &bopens the settings',
          ' &3/chicktils config edit <name> [<value>] &l-> &bopens the settings',
          ' &3/chicktils config search <search term> &l-> &bsearches the settings',
          ' &3/chicktils stats &l-> &bshows stats'
        ].forEach(v => ChatLib.chat(v));
        break;
      case 'ping':
        log(getPing());
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
  log('helper mod not found, some features may not work');
}

const worldLoadOnce = register('worldLoad', () => {
  new Thread(() => {
    Thread.sleep(1000);
    // TODO: check for skyblock
    settings.load();
    loadMod();

    worldLoadOnce.unregister();
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