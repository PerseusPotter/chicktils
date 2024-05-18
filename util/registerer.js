import { registerForge, unregisterForge } from './forge';

function wrap(orig, wrap, prop) {
  return function(...args) {
    prop.apply(orig, args[0] === undefined ? args.slice(1) : args);
    return wrap;
  }
}

/**
 * isRegistered: () => boolean;
 * forceTrigger(...args: any[]) => any;
 * @type {typeof register}
 */
let reg;
reg = function reg(type, shit) {
  const rr = register(type, shit).unregister();
  let isReg = false;
  const props = new Map();
  const prox = new Proxy({}, {
    get(t, p, r) {
      if (p === 'register') {
        if (!isReg) {
          isReg = true;
          return re;
        }
        return noop;
      } else if (p === 'unregister') {
        if (isReg) {
          isReg = false;
          return un;
        }
        return noop
      } else if (p === 'isRegistered') {
        return isR;
      } else if (p === 'forceTrigger') {
        return shit;
      } else if (rr[p] instanceof Function) {
        let w;
        return props.get(p) || (
          (w = wrap(rr, prox, rr[p])),
          props.set(p, w),
          w
        );
      }
    }
  });
  const re = wrap(rr, prox, rr.register);
  const un = wrap(rr, prox, rr.unregister);
  const isR = () => isReg;
  const noop = wrap(rr, prox, Function.prototype);
  return prox;
}
export { reg };

/**
 * @template {import('../../@types/External').JavaClass<'net.minecraftforge.fml.common.eventhandler.Event'>} C
 * @param {C} e
 * @param {import('../../@types/External').JavaEnumC<'HIGH' | 'HIGHEST' | 'LOW' | 'LOWEST' | 'NORMAL', 'net.minecraftforge.fml.common.eventhandler.EventPriority'>} prio
 * @param {(evn: C) => void} nshit
 * @returns {{ register: () => ReturnType<typeof regForge>, unregister: () => ReturnType<typeof regForge>, isRegistered: () => boolean }}
 */
export function regForge(e, prio, nshit) {
  let reg;
  const prox = new Proxy({}, {
    get(t, p, r) {
      if (p === 'register') {
        return reg ? noop : re;
      } else if (p === 'unregister') {
        return reg ? un : noop;
      } else if (p === 'isRegistered') {
        return isR;
      } else return void 0;
      // else if (reg[p] instanceof Function) return reg[p].bind(reg);
      // else return reg[p];
    }
  });
  const re = wrap({}, prox, () => reg = registerForge(e, prio, nshit));
  const un = wrap({}, prox, () => reg = void unregisterForge(reg));
  const isR = () => Boolean(reg);
  const noop = wrap({}, prox, Function.prototype);
  return prox;
}