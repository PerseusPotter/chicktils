import { inherits } from './polyfill';
import { StateProp, StateVar } from './state';
import { run, wrap as wrapFunc } from './threading';

function wrap(orig, wrap, prop) {
  return function(...args) {
    prop.apply(orig, args[0] === undefined && args.length === 1 ? [] : args);
    return wrap;
  }
}

/**
 * @type {{ type: string, getIsReg: () => boolean, getIsAReg: () => boolean, reg: any }[]}
 */
const allRegs = [];

export function getRegs() {
  return allRegs;
}

const trackPerformance = false;
/**
 * @typedef {{ cum: number, num: number, min: number, max: number }} PerfomanceData
 */
/**
 * @typedef {Record<string, PerfomanceData>} PerformanceDataBundled
 */
/**
 * @type {PerformanceDataBundled}
 */
let performanceDataTick = {};
/**
 * @type {PerformanceDataBundled}
 */
let performanceDataRend = {};
/**
 * @type {{ tick: PerformanceDataBundled, rend: PerformanceDataBundled }[]}
 */
const performanceDataHist = [];
if (trackPerformance) {
  let rc = 0;
  let gc = 0;
  const renderReg = register(net.minecraftforge.fml.common.gameevent.TickEvent.RenderTickEvent, evn => {
    if (evn.phase.toString() === 'START') return;
    if (rc >= gc) performanceDataHist.push({ rend: performanceDataRend });
    else performanceDataHist[rc].rend = performanceDataRend;
    rc++;
    performanceDataRend = {};
  });
  const gameReg = register(net.minecraftforge.fml.common.gameevent.TickEvent.ClientTickEvent, evn => {
    if (evn.phase.toString() === 'START') return;
    if (gc >= rc) performanceDataHist.push({ tick: performanceDataTick });
    else performanceDataHist[gc].tick = performanceDataTick;
    gc++;
    performanceDataTick = {};
  });
  register('command', () => {
    FileLib.write('chicktils', 'performancedata.json', JSON.stringify(performanceDataHist));
  }).setName('chicktilsdumpperformancedataregister');
}

const customRegs = {};
const createRegister = function(type, shit) {
  if (type in customRegs) return new (customRegs[type])(shit);
  return register(type, shit).unregister();
};

/**
 * isRegistered() => boolean;
 *
 * setRegistered(v: boolean) => this;
 *
 * setEnabled(val: StateVar | import('../settings').Property) => this;
 *
 * update() => this;
 *
 * forceTrigger(...args: any[]) => any;
 *
 * @type {typeof register & ((triggerType: 'spawnEntity', callback: (entity: import('../../@types/External').JavaClass<'net.minecraft.entity.Entity'>) => void) => import('../../@types/IRegister').Trigger) & ((triggerType: 'serverTick', callback: () => void) => import('../../@types/IRegister').Trigger)}
 */
let reg;
reg = function reg(type, shit, modN) {
  if (!modN) throw 'no module name';
  if (trackPerformance) {
    const key = `${modN}-${type}`;
    const System = Java.type('java.lang.System');
    const oshit = shit;
    const isRend = typeof type === 'string' && (type.toLowerCase().includes('render') || type === 'step');
    shit = function() {
      const start = System.nanoTime();
      oshit.apply(null, arguments);
      const time = System.nanoTime() - start;
      const data = isRend ? performanceDataRend : performanceDataTick;
      if (!(key in data)) data[key] = { cum: time, num: 1, max: time, min: time };
      else {
        const inst = data[key];
        inst.cum += time;
        inst.num++;
        if (time > inst.max) inst.max = time;
        if (time < inst.min) inst.min = time;
      }
    };
  }
  const rr = createRegister(type, shit);
  let isReg = false;
  let isAReg = false;
  let regReq = new StateProp(true);
  const props = new Map();
  const prox = new Proxy({}, {
    get(t, p, r) {
      switch (p) {
        case 'register': return _register;
        case 'unregister': return _unregister;
        case 'isRegistered': return _isRegistered;
        case 'setRegistered': return _setRegistered;
        case 'setEnabled': return _setEnabled;
        case 'update': return _update;
        case 'forceTrigger': return shit;
      }
      if (!rr[p]) return void 0;
      let w;
      return props.get(p) || (
        (w = wrap(rr, prox, rr[p])),
        props.set(p, w),
        w
      );
    }
  });
  const _register = wrap(rr, prox, () => {
    if (!isAReg && regReq.get()) {
      isAReg = true;
      rr.register();
    }
    isReg = true;
  });
  const _unregister = wrap(rr, prox, () => {
    if (isAReg) rr.unregister();
    isReg = false;
    isAReg = false;
  });
  const _isRegistered = () => isReg;
  const _setRegistered = wrap(rr, prox, v => {
    if (v) _register();
    else _unregister();
  });
  const _setEnabled = wrap(rr, prox, val => {
    regReq = val;
    regReq.listen(_update);
    _update();
  });
  const _update = wrap({}, prox, () => {
    if (!isReg) return;
    if (regReq.get()) {
      if (!isAReg) rr.register();
      isAReg = true;
    } else {
      if (isAReg) rr.unregister();
      isAReg = false;
    }
  });
  allRegs.push({ type: typeof type === 'string' ? type : type.class.getName(), reg: prox, getIsReg: () => isReg, getIsAReg: () => isAReg });
  return prox;
};

{
  function ChickTilsRegister(cb) {
    this.cb = cb;
    this.id = '' + Date.now() + Math.random();
  }
  ChickTilsRegister.prototype.getList = function getList() {
    throw 'override getList';
  };
  ChickTilsRegister.prototype.update = function update() { };
  ChickTilsRegister.prototype.register = function register() {
    this.getList().set(this.id, this);
    this.update();
    return this;
  };
  ChickTilsRegister.prototype.unregister = function unregister() {
    this.getList().delete(this.id);
    this.update();
    return this;
  };
  ChickTilsRegister.prototype.setPriority = function setPriority() {
    return this;
  };
  ChickTilsRegister.prototype.trigger = function trigger() { };

  const listenList = (function() {
    const lists = [];
    const gameUnloadReg = register('gameUnload', () => lists.forEach(v => v.forEach(v => v.unregister())));
    return function(list) {
      lists.push(list);
    };
  }());

  const ClientCommandHandler = Java.type('net.minecraftforge.client.ClientCommandHandler').instance;
  const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');
  const commandMapF = ClientCommandHandler.getClass().getSuperclass().getDeclaredField('field_71562_a');
  commandMapF.setAccessible(true);
  const commandSetF = ClientCommandHandler.getClass().getSuperclass().getDeclaredField('field_71561_b');
  commandSetF.setAccessible(true);
  // :(
  // [gg.skytils.skytilsmod.features.impl.handlers.NamespacedCommands:registerCommandHelper:81]: WARNING! Command aaa has 0; owners: []
  function ChickTilsCommand(cb) {
    ChickTilsRegister.call(this, wrap(cb));
    this.id = '';
    this.tabCb = null;
    this.tabArr = new ArrayList();
    this.aliases = new ArrayList();
    this.override = false;
    this.jcmd;
    this._init = false;
    this.jcmd = new JavaAdapter(Java.type('net.minecraft.command.CommandBase'), {
      // getCommandName
      func_71517_b: () => this.id,
      // getCommandUsage
      func_71518_a: () => ('/' + this.id).toString(),
      // getCommandAliases
      func_71514_a: () => this.aliases,
      // processCommand
      func_71515_b: (sender, args) => void this.cb.apply(this, args),
      // addTabCompletionOptions
      func_180525_a: (sender, args, pos) => this.tabCb ? new ArrayList(this.tabCb(args)) : this.tabArr,
      // getRequiredPermissionLevel
      func_82362_a: () => 0
    });
  }
  inherits(ChickTilsCommand, ChickTilsRegister);
  ChickTilsCommand.list = new Map();
  listenList(ChickTilsCommand.list);
  ChickTilsCommand.prototype.getList = function getList() {
    return ChickTilsCommand.list;
  };
  ChickTilsCommand.prototype._instantiate = function _instantiate() {
    if (this._init) return false;
    this._init = true;
    if (!this.override && ClientCommandHandler.func_71555_a()[this.id]) return false;
    ClientCommandHandler.func_71560_a(this.jcmd);
    return true;
  };
  ChickTilsCommand.prototype._uninstantiate = function _uninstantiate() {
    if (!this._init) return false;
    this._init = false;
    if (this.getList().get(this.id) !== this) return false;
    helper.removeElementMap(commandMapF, ClientCommandHandler, this.id);
    helper.removeElementSet(commandSetF, ClientCommandHandler, this.jcmd);
    return true;
  };
  ChickTilsCommand.prototype._reinstantiate = function _reinstantiate() {
    if (!this._init) return;
    this._uninstantiate();
    this._instantiate();
  };
  ChickTilsCommand.prototype.register = function register() {
    if (this._instantiate()) ChickTilsRegister.prototype.register.call(this);
    return this;
  };
  ChickTilsCommand.prototype.unregister = function unregister() {
    if (this._uninstantiate()) ChickTilsRegister.prototype.unregister.call(this);
    return this;
  };
  ChickTilsCommand.prototype.setTabCompletions = function setTabCompletions(...args) {
    if (!args) args = [];
    else if (args.length === 1 && typeof args[0] === 'function') this.tabCb = wrap(args[0]);
    else args.forEach(v => this.tabArr.add(v.toString()));
    return this;
  };
  ChickTilsCommand.prototype.setAliases = function setAliases(...args) {
    args.forEach(v => this.aliases.add(v.toString()));
    this._reinstantiate();
    return this;
  };
  ChickTilsCommand.prototype.setCommandName = function setCommandName(name, override = false) {
    this.id = name.toString();
    this.override = override;
    this._reinstantiate();
    return this;
  };
  ChickTilsCommand.prototype.setName = function setName(name, override) {
    return this.setCommandName(name, override);
  };
  ChickTilsCommand.prototype.compareTo = function compareTo() { };

  function ChickTilsSpawnEntity(cb) {
    ChickTilsRegister.call(this, cb);
  }
  inherits(ChickTilsSpawnEntity, ChickTilsRegister);
  ChickTilsSpawnEntity.list = new Map();
  listenList(ChickTilsSpawnEntity.list);
  ChickTilsSpawnEntity.prototype.getList = function getList() {
    return ChickTilsSpawnEntity.list;
  };
  ChickTilsSpawnEntity.newMobs = [];
  ChickTilsSpawnEntity.tickReg = reg('tick', () => {
    if (ChickTilsSpawnEntity.newMobs.length === 0) return;
    run(() => {
      ChickTilsSpawnEntity.newMobs.forEach(v => ChickTilsSpawnEntity.list.forEach(c => c.cb(v)));
      ChickTilsSpawnEntity.newMobs = [];
    });
  }, 'ChickTilsSpawnEntity');
  ChickTilsSpawnEntity.spawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => ChickTilsSpawnEntity.newMobs.push(evn.entity), 'ChickTilsSpawnEntity');
  ChickTilsSpawnEntity.prototype.update = function update() {
    if (ChickTilsSpawnEntity.list.size) {
      ChickTilsSpawnEntity.tickReg.register();
      ChickTilsSpawnEntity.spawnReg.register();
    } else {
      ChickTilsSpawnEntity.tickReg.unregister();
      ChickTilsSpawnEntity.spawnReg.unregister();
    }
  };

  const Threading = Java.type('gg.essential.api.utils.Multithreading');
  const MILLISECONDS = Java.type('java.util.concurrent.TimeUnit').MILLISECONDS;
  function ChickTilsStep(cb) {
    ChickTilsRegister.call(this, wrapFunc(cb));
    this.offset = 0;
    this.delay = 0;
    this.future = null;
  }
  inherits(ChickTilsStep, ChickTilsRegister);
  ChickTilsStep.list = new Map();
  listenList(ChickTilsStep.list);
  ChickTilsStep.prototype.getList = function getList() {
    return ChickTilsStep.list;
  };
  ChickTilsStep.prototype.register = function register() {
    if (this.delay === 0) throw 'set delay before registering';
    if (this.future) return this;
    this.future = Threading.getScheduledPool().scheduleAtFixedRate(this.cb, this.offset, this.delay, MILLISECONDS);
    return ChickTilsRegister.prototype.register.call(this);
  };
  ChickTilsStep.prototype.unregister = function unregister() {
    if (this.future) {
      this.future.cancel(false);
      ChickTilsRegister.prototype.unregister.call(this);
    }
    this.future = null;
    return this;
  };
  ChickTilsStep.prototype.setFps = function setFps(fps) {
    this.delay = Math.ceil(1000 / fps);
    if (this.future) {
      this.unregister();
      this.register();
    }
    return this;
  };
  ChickTilsStep.prototype.setDelay = function setDelay(delay) {
    this.delay = ~~(delay * 1000);
    if (this.future) {
      this.unregister();
      this.register();
    }
    return this;
  };
  ChickTilsStep.prototype.setOffset = function setOffset(offset) {
    this.offset = ~~offset;
    return this;
  };
  function ChickTilsServerTick(cb) {
    ChickTilsRegister.call(this, cb);
  }
  inherits(ChickTilsServerTick, ChickTilsRegister);
  ChickTilsServerTick.list = new Map();
  listenList(ChickTilsServerTick.list);
  ChickTilsServerTick.prototype.getList = function getList() {
    return ChickTilsServerTick.list;
  };
  ChickTilsServerTick.tickReg = reg('packetReceived', pack => {
    if (pack.func_148890_d() > 0) return;
    ChickTilsServerTick.list.forEach(v => v.cb());
  }, 'ChickTilsServerTick').setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction'));
  ChickTilsServerTick.prototype.update = function update() {
    if (ChickTilsServerTick.list.size) {
      ChickTilsServerTick.tickReg.register();
    } else {
      ChickTilsServerTick.tickReg.unregister();
    }
  };

  customRegs['command'] = ChickTilsCommand;
  customRegs['spawnEntity'] = ChickTilsSpawnEntity;
  customRegs['step'] = ChickTilsStep;
  customRegs['serverTick'] = ChickTilsServerTick;
}

export default reg;