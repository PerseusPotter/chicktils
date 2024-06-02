import { log } from './log';
import { StateProp, StateVar } from './state';

function wrap(orig, wrap, prop) {
  return function(...args) {
    prop.apply(orig, args[0] === undefined && args.length === 1 ? [] : args);
    return wrap;
  }
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
reg = function reg(type, shit) {
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
  return prox;
};
export default reg;