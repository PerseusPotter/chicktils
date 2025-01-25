import { removeElementMap, removeElementSet } from './helper';
import { inherits, setAccessible } from './polyfill';
import { StateProp, StateVar } from './state';
import { run, wrap as wrapFunc } from './threading';

function wrap(orig, wrap, prop) {
  return function(...args) {
    prop.apply(orig, args[0] === undefined && args.length === 1 ? [] : args);
    return wrap;
  };
}

const PROFILER = false;
if (PROFILER) {
  var $rendData = new Map();
  var $tickData = new Map();
  var $mainThread;
  Client.scheduleTask(() => $mainThread = Thread.currentThread());
  const writer = new java.io.BufferedWriter(new java.io.FileWriter('./config/ChatTriggers/modules/chicktils/ticktimes.log', false));
  register('gameUnload', () => writer.close());
  register(net.minecraftforge.fml.common.gameevent.TickEvent.RenderTickEvent, evn => {
    if (evn.phase.toString() !== 'END') return;
    writer.write('RENDER TICK START\n');
    const time = dumpData($rendData);
    writer.write(`RENDER TICK END ${time}\n`);
    $rendData.clear();
  });
  register(net.minecraftforge.fml.common.gameevent.TickEvent.ClientTickEvent, evn => {
    if (evn.phase.toString() !== 'END') return;
    writer.write('CLIENT TICK START\n');
    const time = dumpData($tickData);
    writer.write(`CLIENT TICK END ${time}\n`);
    $tickData.clear();
  });
  function dumpData(map) {
    let totalTime = 0;
    map.forEach((v, k) => {
      if (v.length === 1) {
        writer.write(`${k}> ${v[0]}\n`);
        totalTime += v[0];
      } else {
        writer.write(`${k}> [${v.join(', ')}]\n`);
        let min = v[0];
        let max = v[0];
        let sum = v[0];
        for (let i = 1; i < v.length; i++) {
          let k = v[i];
          if (k < min) min = k;
          if (k > max) max = k;
          sum += k;
        }
        totalTime += sum;
        writer.write(`sum ${sum} | min ${min} | max ${max}\n`);
      }
    });
    return totalTime;
  }
}

/**
 * @type {{ type: string, getIsReg: () => boolean, getIsAReg: () => boolean, reg: any }[]}
 */
const allRegs = [];

export function getRegs() {
  return allRegs;
}

const customRegs = {};
/**
 * @type {typeof register & ((triggerType: 'spawnEntity', callback: (entity: import('../../@types/External').JavaClass<'net.minecraft.entity.Entity'>) => void) => import('../../@types/IRegister').Trigger) & ((triggerType: 'serverTick', callback: (tick: number) => void) => import('../../@types/IRegister').Trigger) & ((triggerType: 'serverTick2', callback: (tick: number) => void) => import('../../@types/IRegister').Trigger)}
 */
const createRegister = function(type, shit) {
  if (PROFILER) {
    const stack = Thread.currentThread().getStackTrace();
    let fileName = '<unknown>';
    let lineNum = 0;
    for (let i = stack.length - 1; i >= 0; i--) {
      let fn = stack[i].getFileName();
      if (!fn) continue;
      if (fn.endsWith('/chicktils/util/registerer.js')) {
        let fn1 = stack[i + 1].getFileName();
        let fn2 = stack[i + 2].getFileName();
        if (fn1 === 'OptRuntime.java') {
          fileName = fn2.split('modules/chicktils/').pop();
          lineNum = stack[i + 2].getLineNumber();
        } else if (fn1 === 'Require.java') {
          fileName = 'util/registerer.js';
          lineNum = stack[i - 2].getLineNumber();
        }
        else console.error('error parsing stack: ' + fn1);
        break;
      }
    }
    const typeName = typeof type === 'string' ? type : type.class.getSimpleName();
    const id = `${fileName}:${lineNum}|${typeName}`;
    const data = typeName.toLowerCase().includes('render') ? $rendData : $tickData;
    const orig = shit;
    const nanoTime = java.lang.System.nanoTime;
    shit = function(...args) {
      const start = nanoTime();
      orig.apply(this, args[0] === undefined && args.length === 1 ? [] : args);
      const end = nanoTime();
      if (Thread.currentThread() !== $mainThread) return;
      let arr = data.get(id);
      if (!arr) {
        arr = [];
        data.set(id, arr);
      }
      arr.push(end - start);
    };
  }
  if (type in customRegs) return new (customRegs[type])(shit);
  return register(type, shit).unregister();
};

/**
 * @template C
 * @typedef {{
 *  isRegistered() => boolean;
 *  setRegistered(v: boolean) => C;
 *  setEnabled(v: StateVar) => C;
 *  update(): C;
 *  forceTrigger(...args: any[]) => any;
 * }} O
 */
/**
 * chaining only works 1 deep but is enough most of the time </3 typescript
 * `F extends { ${new Array(78).fill(0).map((_, i) => `(...args: infer P${i}) => infer R${i};`).join(' ')} } ? { ${new Array(78).fill(0).map((_, i) => `(...args: P${i}) => R${i} & O<R${i} & O<{}>>;`).join(' ')} } : never`
 * @template F
 * @typedef {F extends { (...args: infer P0) => infer R0; (...args: infer P1) => infer R1; (...args: infer P2) => infer R2; (...args: infer P3) => infer R3; (...args: infer P4) => infer R4; (...args: infer P5) => infer R5; (...args: infer P6) => infer R6; (...args: infer P7) => infer R7; (...args: infer P8) => infer R8; (...args: infer P9) => infer R9; (...args: infer P10) => infer R10; (...args: infer P11) => infer R11; (...args: infer P12) => infer R12; (...args: infer P13) => infer R13; (...args: infer P14) => infer R14; (...args: infer P15) => infer R15; (...args: infer P16) => infer R16; (...args: infer P17) => infer R17; (...args: infer P18) => infer R18; (...args: infer P19) => infer R19; (...args: infer P20) => infer R20; (...args: infer P21) => infer R21; (...args: infer P22) => infer R22; (...args: infer P23) => infer R23; (...args: infer P24) => infer R24; (...args: infer P25) => infer R25; (...args: infer P26) => infer R26; (...args: infer P27) => infer R27; (...args: infer P28) => infer R28; (...args: infer P29) => infer R29; (...args: infer P30) => infer R30; (...args: infer P31) => infer R31; (...args: infer P32) => infer R32; (...args: infer P33) => infer R33; (...args: infer P34) => infer R34; (...args: infer P35) => infer R35; (...args: infer P36) => infer R36; (...args: infer P37) => infer R37; (...args: infer P38) => infer R38; (...args: infer P39) => infer R39; (...args: infer P40) => infer R40; (...args: infer P41) => infer R41; (...args: infer P42) => infer R42; (...args: infer P43) => infer R43; (...args: infer P44) => infer R44; (...args: infer P45) => infer R45; (...args: infer P46) => infer R46; (...args: infer P47) => infer R47; (...args: infer P48) => infer R48; (...args: infer P49) => infer R49; (...args: infer P50) => infer R50; (...args: infer P51) => infer R51; (...args: infer P52) => infer R52; (...args: infer P53) => infer R53; (...args: infer P54) => infer R54; (...args: infer P55) => infer R55; (...args: infer P56) => infer R56; (...args: infer P57) => infer R57; (...args: infer P58) => infer R58; (...args: infer P59) => infer R59; (...args: infer P60) => infer R60; (...args: infer P61) => infer R61; (...args: infer P62) => infer R62; (...args: infer P63) => infer R63; (...args: infer P64) => infer R64; (...args: infer P65) => infer R65; (...args: infer P66) => infer R66; (...args: infer P67) => infer R67; (...args: infer P68) => infer R68; (...args: infer P69) => infer R69; (...args: infer P70) => infer R70; (...args: infer P71) => infer R71; (...args: infer P72) => infer R72; (...args: infer P73) => infer R73; (...args: infer P74) => infer R74; (...args: infer P75) => infer R75; (...args: infer P76) => infer R76; (...args: infer P77) => infer R77; } ? { (...args: P0) => R0 & O<R0 & O<{}>>; (...args: P1) => R1 & O<R1 & O<{}>>; (...args: P2) => R2 & O<R2 & O<{}>>; (...args: P3) => R3 & O<R3 & O<{}>>; (...args: P4) => R4 & O<R4 & O<{}>>; (...args: P5) => R5 & O<R5 & O<{}>>; (...args: P6) => R6 & O<R6 & O<{}>>; (...args: P7) => R7 & O<R7 & O<{}>>; (...args: P8) => R8 & O<R8 & O<{}>>; (...args: P9) => R9 & O<R9 & O<{}>>; (...args: P10) => R10 & O<R10 & O<{}>>; (...args: P11) => R11 & O<R11 & O<{}>>; (...args: P12) => R12 & O<R12 & O<{}>>; (...args: P13) => R13 & O<R13 & O<{}>>; (...args: P14) => R14 & O<R14 & O<{}>>; (...args: P15) => R15 & O<R15 & O<{}>>; (...args: P16) => R16 & O<R16 & O<{}>>; (...args: P17) => R17 & O<R17 & O<{}>>; (...args: P18) => R18 & O<R18 & O<{}>>; (...args: P19) => R19 & O<R19 & O<{}>>; (...args: P20) => R20 & O<R20 & O<{}>>; (...args: P21) => R21 & O<R21 & O<{}>>; (...args: P22) => R22 & O<R22 & O<{}>>; (...args: P23) => R23 & O<R23 & O<{}>>; (...args: P24) => R24 & O<R24 & O<{}>>; (...args: P25) => R25 & O<R25 & O<{}>>; (...args: P26) => R26 & O<R26 & O<{}>>; (...args: P27) => R27 & O<R27 & O<{}>>; (...args: P28) => R28 & O<R28 & O<{}>>; (...args: P29) => R29 & O<R29 & O<{}>>; (...args: P30) => R30 & O<R30 & O<{}>>; (...args: P31) => R31 & O<R31 & O<{}>>; (...args: P32) => R32 & O<R32 & O<{}>>; (...args: P33) => R33 & O<R33 & O<{}>>; (...args: P34) => R34 & O<R34 & O<{}>>; (...args: P35) => R35 & O<R35 & O<{}>>; (...args: P36) => R36 & O<R36 & O<{}>>; (...args: P37) => R37 & O<R37 & O<{}>>; (...args: P38) => R38 & O<R38 & O<{}>>; (...args: P39) => R39 & O<R39 & O<{}>>; (...args: P40) => R40 & O<R40 & O<{}>>; (...args: P41) => R41 & O<R41 & O<{}>>; (...args: P42) => R42 & O<R42 & O<{}>>; (...args: P43) => R43 & O<R43 & O<{}>>; (...args: P44) => R44 & O<R44 & O<{}>>; (...args: P45) => R45 & O<R45 & O<{}>>; (...args: P46) => R46 & O<R46 & O<{}>>; (...args: P47) => R47 & O<R47 & O<{}>>; (...args: P48) => R48 & O<R48 & O<{}>>; (...args: P49) => R49 & O<R49 & O<{}>>; (...args: P50) => R50 & O<R50 & O<{}>>; (...args: P51) => R51 & O<R51 & O<{}>>; (...args: P52) => R52 & O<R52 & O<{}>>; (...args: P53) => R53 & O<R53 & O<{}>>; (...args: P54) => R54 & O<R54 & O<{}>>; (...args: P55) => R55 & O<R55 & O<{}>>; (...args: P56) => R56 & O<R56 & O<{}>>; (...args: P57) => R57 & O<R57 & O<{}>>; (...args: P58) => R58 & O<R58 & O<{}>>; (...args: P59) => R59 & O<R59 & O<{}>>; (...args: P60) => R60 & O<R60 & O<{}>>; (...args: P61) => R61 & O<R61 & O<{}>>; (...args: P62) => R62 & O<R62 & O<{}>>; (...args: P63) => R63 & O<R63 & O<{}>>; (...args: P64) => R64 & O<R64 & O<{}>>; (...args: P65) => R65 & O<R65 & O<{}>>; (...args: P66) => R66 & O<R66 & O<{}>>; (...args: P67) => R67 & O<R67 & O<{}>>; (...args: P68) => R68 & O<R68 & O<{}>>; (...args: P69) => R69 & O<R69 & O<{}>>; (...args: P70) => R70 & O<R70 & O<{}>>; (...args: P71) => R71 & O<R71 & O<{}>>; (...args: P72) => R72 & O<R72 & O<{}>>; (...args: P73) => R73 & O<R73 & O<{}>>; (...args: P74) => R74 & O<R74 & O<{}>>; (...args: P75) => R75 & O<R75 & O<{}>>; (...args: P76) => R76 & O<R76 & O<{}>>; (...args: P77) => R77 & O<R77 & O<{}>>; } : never} ModifyReturnType
 */

/**
 * @type {ModifyReturnType<typeof createRegister>}
 */
let reg;
reg = function reg(type, shit) {
  let isReg = false;
  let isAReg = false;
  let regReq = new StateVar(true);
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
  const rr = createRegister(type, wrap(prox, prox, shit));
  const _register = wrap(rr, prox, () => {
    if (isReg) return;
    if (!isAReg && regReq.get()) {
      isAReg = true;
      rr.register();
    }
    isReg = true;
  });
  const _unregister = wrap(rr, prox, () => {
    if (!isReg) return;
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
  const _update = wrap(rr, prox, () => {
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
    this.cb = wrapFunc(cb);
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
  const commandMapF = setAccessible(ClientCommandHandler.getClass().getSuperclass().getDeclaredField('field_71562_a'));
  const commandSetF = setAccessible(ClientCommandHandler.getClass().getSuperclass().getDeclaredField('field_71561_b'));
  // :(
  // [gg.skytils.skytilsmod.features.impl.handlers.NamespacedCommands:registerCommandHelper:81]: WARNING! Command aaa has 0; owners: []
  function ChickTilsCommand(cb) {
    ChickTilsRegister.call(this, cb);
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
    removeElementMap(commandMapF, ClientCommandHandler, this.id);
    removeElementSet(commandSetF, ClientCommandHandler, this.jcmd);
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
    else if (args.length === 1 && typeof args[0] === 'function') this.tabCb = wrapFunc(args[0]);
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
  ChickTilsSpawnEntity.spawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => ChickTilsSpawnEntity.newMobs.push(evn.entity));
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
    ChickTilsRegister.call(this, cb);
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
  ChickTilsServerTick.tick = 0;
  ChickTilsServerTick.tickReg = reg('packetReceived', pack => {
    if (pack.func_148890_d() > 0) return;
    ChickTilsServerTick.list.forEach(v => v.cb(ChickTilsServerTick.tick));
    ChickTilsServerTick.tick++;
  }).setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction'));
  ChickTilsServerTick.prototype.update = function update() {
    if (ChickTilsServerTick.list.size) {
      ChickTilsServerTick.tickReg.register();
    } else {
      ChickTilsServerTick.tickReg.unregister();
    }
  };

  function ChickTilsServerTick2(cb) {
    ChickTilsRegister.call(this, cb);
  }
  inherits(ChickTilsServerTick2, ChickTilsRegister);
  ChickTilsServerTick2.list = new Map();
  listenList(ChickTilsServerTick2.list);
  ChickTilsServerTick2.prototype.getList = function getList() {
    return ChickTilsServerTick2.list;
  };
  ChickTilsServerTick2.tick = 0;
  const cTickEnabled = new StateVar(true);
  ChickTilsServerTick2.cTickReg = reg('tick', () => {
    ChickTilsServerTick2.list.forEach(v => v.cb(ChickTilsServerTick2.tick));
    ChickTilsServerTick2.tick++;
  }).setEnabled(cTickEnabled);
  ChickTilsServerTick2.worldReg = reg('worldLoad', () => cTickEnabled.set(true));
  ChickTilsServerTick2.prototype.update = function update() {
    if (ChickTilsServerTick2.list.size) {
      cTickEnabled.set(true);
      ChickTilsServerTick2.cTickReg.register();
      ChickTilsServerTick2.sTickReg.register();
      ChickTilsServerTick2.worldReg.register();
    } else {
      ChickTilsServerTick2.cTickReg.unregister();
      ChickTilsServerTick2.sTickReg.unregister();
      ChickTilsServerTick2.worldReg.unregister();
    }
  };

  const _chatParams = new Map([
    ['<c>', 'CONTAINS'],
    ['<contains>', 'CONTAINS'],
    ['c', 'CONTAINS'],
    ['contains', 'CONTAINS'],
    ['<s>', 'START'],
    ['<start>', 'START'],
    ['s', 'START'],
    ['start', 'START'],
    ['<e>', 'END'],
    ['<end>', 'END'],
    ['e', 'END'],
    ['end', 'END']
  ]);
  // enforces color codes mwahahaha
  function ChickTilsChat(cb) {
    ChickTilsRegister.call(this, cb);
    this.caseInsens = false;
    this.mode = 0;
    /** @type {RegExp} */
    this.regex = null;
    this.params = new Set();
    this.doTrigIfCanceled = true;
    this.rawCrit = null;
  }
  inherits(ChickTilsChat, ChickTilsRegister);
  ChickTilsChat.list = new Map();
  listenList(ChickTilsChat.list);
  ChickTilsChat.prototype.getList = function getList() {
    return ChickTilsChat.list;
  };
  ChickTilsChat.processMessage = function processMessage(str, list, type, message) {
    let doCancel = false;
    const fakeEvn = {
      type,
      message,
      str,
      isCancelable() { return true; },
      setCanceled(v) { doCancel = v; }
    };
    list.forEach(v => {
      if (doCancel && !v.doTrigIfCanceled) return;
      let args = [fakeEvn];
      if (v.mode === 1) {
        if (v.params.size === 0) {
          if (v.rawCrit !== str) return;
        } else {
          const i = str.indexOf(v.rawCrit);
          if (i < 0) return;
          if (v.params.has('START') && i > 0) return;
          if (v.params.has('END') && i < str.length - v.rawCrit.length) return;
          // if (v.params.has('CONTAINS')) {}
        }
      } else if (v.mode === 2) {
        v.regex.lastIndex = 0;
        const m = v.regex.exec(str);
        if (!m) return;
        if ((v.params.size === 0 || v.params.has('START')) && m.index > 0) return;
        if ((v.params.size === 0 || v.params.has('END')) && m.index < str.length - m[0].length) return;
        // if (v.params.has('CONTAINS')) {}
        args = m.slice(1).concat(args);
      }
      v.cb.apply(v, args);
    });
    return doCancel;
  };
  ChickTilsChat.packReg = reg('packetReceived', (pack, evn) => {
    const type = pack.func_179841_c();
    /** @type {Map<string, ChickTilsChat>} */
    const list = type === 2 ? ChickTilsActionBar.list : ChickTilsChat.list;
    if (list.size === 0) return;
    const str = ChatLib.replaceFormatting(pack.func_148915_c().func_150254_d());
    if (ChickTilsChat.processMessage(str, list, type, pack.func_148915_c())) cancel(evn);
  }).setFilteredClass(Java.type('net.minecraft.network.play.server.S02PacketChat'));
  ChickTilsChat.prototype.update = function update() {
    if (ChickTilsChat.list.size || ChickTilsActionBar.list.size) {
      ChickTilsChat.packReg.register();
    } else {
      ChickTilsChat.packReg.unregister();
    }
  };
  ChickTilsChat.prototype.triggerIfCanceled = function triggerIfCanceled(bool) {
    this.doTrigIfCanceled = bool;
  };
  ChickTilsChat.prototype.addParameter = function addParameter(param) {
    this.addParameters(param);
  };
  ChickTilsChat.prototype.addParameters = function addParameters(...params) {
    params.forEach(v => {
      const p = _chatParams.get(v.toLowerCase());
      if (p) this.params.add(p);
    });
    if (this.mode === 2) this._updateCriteria();
  };
  ChickTilsChat.prototype.setParameter = function setParameter(param) {
    this.setParameters(param);
  };
  ChickTilsChat.prototype.setParameters = function setParameters(...params) {
    this.params.clear();
    this.addParameters(...params);
  };
  ChickTilsChat.prototype.setExact = function setExact() {
    this.params.clear();
    if (this.mode === 2) this._updateCriteria();
  };
  ChickTilsChat.prototype.setStart = function setStart() {
    this.setParameter('start');
  };
  ChickTilsChat.prototype.setEnd = function setEnd() {
    this.setParameter('end');
  };
  ChickTilsChat.prototype.setContains = function setContains() {
    this.setParameter('contains');
  };
  ChickTilsChat.prototype.setCaseInsensitive = function setCaseInsensitive() {
    this.caseInsens = true;
    this._updateCriteria();
  };
  ChickTilsChat.prototype.setCriteria = function setCriteria(crit) {
    this.setChatCriteria(crit);
  };
  ChickTilsChat.prototype.setChatCriteria = function setChatCriteria(crit) {
    this.rawCrit = crit;
    this._updateCriteria();
  };
  ChickTilsChat.prototype._updateCriteria = function _updateCriteria() {
    this.mode = 0;
    if (typeof this.rawCrit === 'string') {
      if (!this.caseInsens && !/\${(?:\*|\w+)}/.test(this.rawCrit)) this.mode = 1;
      else {
        this.mode = 2;
        // https://stackoverflow.com/a/3561711
        this.regex = new RegExp(
          this.rawCrit
            .replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
            .replace(/\\\$\\{\\\*?\\}/g, '(?:.+)')
            .replace(/\\\$\\{\w+\\}/g, '(.+)'),
          this.caseInsens ? 'i' : ''
        );
      }
    } else if (this.rawCrit?.exec) {
      this.mode = 2;
      this.regex = new RegExp(this.rawCrit.source, (this.params.has('START') ? 'y' : 'g') + (this.caseInsens || this.rawCrit.ignoreCase ? 'i' : '') + this.rawCrit.flags.replace(/[^msuv]/g, ''));
    } else throw 'Expected String or Regexp Object';
  };

  function ChickTilsActionBar(cb) {
    ChickTilsChat.call(this, cb);
  }
  inherits(ChickTilsActionBar, ChickTilsChat);
  ChickTilsActionBar.list = new Map();
  listenList(ChickTilsActionBar.list);
  ChickTilsActionBar.prototype.getList = function getList() {
    return ChickTilsActionBar.list;
  };

  function ChickTilsWorldLoad(cb) {
    ChickTilsRegister.call(this, cb);
  }
  inherits(ChickTilsWorldLoad, ChickTilsRegister);
  ChickTilsWorldLoad.list = new Map();
  listenList(ChickTilsWorldLoad.list);
  ChickTilsWorldLoad.prototype.getList = function getList() {
    return ChickTilsWorldLoad.list;
  };
  const stateWorldLoaded = new StateVar(false);
  ChickTilsWorldLoad.worldLoadReg = reg('worldLoad', () => {
    ChickTilsWorldLoad.list.forEach(v => v.cb());
    stateWorldLoaded.set(true);
  }).setEnabled(new StateProp(stateWorldLoaded).not());
  ChickTilsWorldLoad.prototype.update = function update() {
    if (ChickTilsWorldLoad.list.size || ChickTilsWorldUnload.list.size) {
      ChickTilsWorldLoad.worldLoadReg.register();
      ChickTilsWorldUnload.worldUnloadReg.register();
    } else {
      ChickTilsWorldLoad.worldLoadReg.unregister();
      ChickTilsWorldUnload.worldUnloadReg.unregister();
    }
  };
  function ChickTilsWorldUnload(cb) {
    ChickTilsRegister.call(this, cb);
  }
  inherits(ChickTilsWorldUnload, ChickTilsRegister);
  ChickTilsWorldUnload.list = new Map();
  listenList(ChickTilsWorldUnload.list);
  ChickTilsWorldUnload.prototype.getList = function getList() {
    return ChickTilsWorldUnload.list;
  };
  ChickTilsWorldUnload.worldUnloadReg = reg('worldUnload', () => {
    ChickTilsWorldUnload.list.forEach(v => v.cb());
    stateWorldLoaded.set(false);
  }).setEnabled(stateWorldLoaded);
  ChickTilsWorldUnload.prototype.update = ChickTilsWorldLoad.prototype.update;

  customRegs['command'] = ChickTilsCommand;
  customRegs['spawnEntity'] = ChickTilsSpawnEntity;
  customRegs['step'] = ChickTilsStep;
  customRegs['serverTick'] = ChickTilsServerTick;
  customRegs['serverTick2'] = ChickTilsServerTick2;
  customRegs['chat'] = ChickTilsChat;
  customRegs['actionBar'] = ChickTilsActionBar;
  customRegs['worldLoad'] = ChickTilsWorldLoad;
  customRegs['worldUnload'] = ChickTilsWorldUnload;

  ChickTilsServerTick2.sTickReg = reg('serverTick', () => {
    cTickEnabled.set(false);
    ChickTilsServerTick2.list.forEach(v => v.cb(ChickTilsServerTick2.tick));
    ChickTilsServerTick2.tick++;
  });
  ChickTilsSpawnEntity.tickReg = reg('serverTick2', () => {
    if (ChickTilsSpawnEntity.newMobs.length === 0) return;
    run(() => {
      ChickTilsSpawnEntity.newMobs.forEach(v => ChickTilsSpawnEntity.list.forEach(c => c.cb(v)));
      ChickTilsSpawnEntity.newMobs = [];
    });
  });
}

export default reg;

export function simulate(msg) {
  customRegs.chat.processMessage(msg, customRegs.chat.list, 1, new TextComponent(msg).chatComponentText);
}