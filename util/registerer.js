import { StateProp, StateVar } from './state';
import { run } from './threading';

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

const createRegister = (function() {
  class ChickTilsRegister {
    static list = [];
    cb = Function.prototype;
    constructor(cb) {
      this.cb = cb;
    }
    register() {
      list.push(this);
      this.update();
    }
    unregister() {
      const i = list.indexOf(this);
      if (i >= 0) {
        list.splice(i, 1);
        this.update();
      }
    }
    setPriority() { }
    trigger() { }

    static register() { }
    static unregister() { }
    static update() {
      if (this.list.length) this.register();
      else this.unregister();
    }
  }
  // doesn't add to com.chattriggers.ctjs.commands.Command.activeCommands so unload all commands on game unload (ct reload)
  const cmds = {};
  register('gameUnload', () => Object.values(cmds).forEach(v => v.unregister()));
  const ClientCommandHandler = Java.type('net.minecraftforge.client.ClientCommandHandler').instance;
  const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');
  const commandMapF = ClientCommandHandler.getClass().getSuperclass().getDeclaredField('field_71562_a');
  commandMapF.setAccessible(true);
  const commandSetF = ClientCommandHandler.getClass().getSuperclass().getDeclaredField('field_71561_b');
  commandSetF.setAccessible(true);
  // :(
  // [gg.skytils.skytilsmod.features.impl.handlers.NamespacedCommands:registerCommandHelper:81]: WARNING! Command aaa has 0; owners: []
  class ChickTilsCommand extends ChickTilsRegister {
    name = '';
    tabCb = null;
    tabArr = new ArrayList();
    aliases = new ArrayList();
    override = false;
    jcmd;
    _init = false;
    constructor(cb) {
      super(cb);
      this.jcmd = new JavaAdapter(Java.type('net.minecraft.command.CommandBase'), {
        // getCommandName
        func_71517_b: () => this.name,
        // getCommandUsage
        func_71518_a: () => ('/' + this.name).toString(),
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

    _instantiate() {
      if (this._init) return;
      this._init = true;
      if (!this.override && ClientCommandHandler.func_71555_a()[this.name]) return;
      ClientCommandHandler.func_71560_a(this.jcmd);
      cmds[this.name] = this;
    }
    _uninstantiate() {
      if (!this._init) return;
      this._init = false;
      if (cmds[this.name] !== this) return;
      helper.removeElementMap(commandMapF, ClientCommandHandler, this.name);
      helper.removeElementSet(commandSetF, ClientCommandHandler, this.jcmd);
    }
    _reinstantiate() {
      if (!this._init) return;
      this._uninstantiate();
      this._instantiate();
    }

    trigger(args) {
      this.cb(args);
    }
    register() {
      this._instantiate();
      return this;
    }
    unregister() {
      this._uninstantiate();
      return this;
    }
    setTabCompletions(...args) {
      if (!args) args = [];
      else if (args.length === 1 && typeof args[0] === 'function') this.tabCb = args[0];
      else args.forEach(v => this.tabArr.add(v.toString()));
      return this;
    }
    setAliases(...args) {
      args.forEach(v => this.aliases.add(v.toString()));
      this._reinstantiate();
      return this;
    }
    setCommandName(name, override = false) {
      this.name = name.toString();
      this.override = override;
      this._reinstantiate();
      return this;
    }
    setName(name, override) {
      return this.setCommandName(name, override);
    }

    compareTo() { }
  }
  class ChickTilsSpawnEntity extends ChickTilsRegister {
    constructor(cb) {
      super(cb);
    }

    static newMobs = [];
    static tickReg = reg('tick', () => {
      if (this.newMobs.length === 0) return;
      run(() => {
        this.newMobs.forEach(v => this.list.forEach(c => c(v)));
        this.newMobs = [];
      });
    });
    static spawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => this.newMobs.push(evn.entity));
    static register() {
      this.tickReg.register();
      this.spawnReg.register();
    }
    static unregister() {
      this.tickReg.unregister();
      this.spawnReg.unregister();
    }
  }
  return function(type, shit) {
    if (type === 'command') return new ChickTilsCommand(shit);
    if (type === 'spawnEntity') return new ChickTilsSpawnEntity(shit);
    return register(type, shit).unregister();
  };
}());

/**
 * isRegistered() => boolean;
 * setRegistered(v: boolean) => this;
 * setEnabled(val: StateVar | import('../settings').Property) => this;
 * update() => this;
 * forceTrigger(...args: any[]) => any;
 * @type {typeof register}
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
    if (!(val instanceof StateVar)) val = StateVar.wrapProp(val);
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
export default reg;