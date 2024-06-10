import { StateProp, StateVar } from './state';

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
  const rr = register(type, shit).unregister();
  let isReg = false;
  let isAReg = false;
  let regReq = new StateProp(true);
  let cmdName = '';
  let aliases = null;
  let ov = false;
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
        case 'setCommandName':
        case 'setName': return _setName;
        case 'setAliases': return _setAliases;
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
      if (cmdName) {
        rr.setName(cmdName, ov);
        if (aliases) rr.setAliases.apply(rr, aliases);
      } else rr.register();
      cmdName = '';
      aliases = null;
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
  const _setName = type === 'command' ? wrap(rr, prox, (n, o) => {
    cmdName = n;
    ov = o || false;
  }) : void 0;
  const _setAliases = type === 'command' ? wrap(rr, prox, ...a => aliases = a) : void 0;
  allRegs.push({ type: typeof type === 'string' ? type : type.class.getName(), reg: prox, getIsReg: () => isReg, getIsAReg: () => isAReg });
  return prox;
};
export default reg;