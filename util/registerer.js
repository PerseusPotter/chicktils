import { registerForge, unregisterForge } from './forge';

/**
 * @type {{ isRegistered: () => boolean } & typeof register}
 */
let reg;
reg = function reg(type, shit) {
  const rr = register(type, shit).unregister();
  let isReg = false;
  return new Proxy({}, {
    get(t, p, r) {
      if (p === 'register') {
        if (!isReg) {
          isReg = true;
          return rr.register.bind(rr);
        }
        return Function.prototype;
      } else if (p === 'unregister') {
        if (isReg) {
          isReg = false;
          return rr.unregister.bind(rr);
        }
        return Function.prototype;
      } else if (p === 'isRegistered') {
        return () => isReg;
      } else if (rr[p] instanceof Function) return rr[p].bind(rr);
      else return rr[p];
    }
  });
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
  return new Proxy({}, {
    get(t, p, r) {
      if (p === 'register') {
        if (reg) return Function.prototype;
        return () => ((reg = registerForge(e, prio, nshit)), r);
      } else if (p === 'unregister') {
        if (!reg) return Function.prototype;
        return () => ((reg = void unregisterForge(reg)), r);
      } else if (p === 'isRegistered') {
        return () => Boolean(reg);
      } else return void 0;
      // else if (reg[p] instanceof Function) return reg[p].bind(reg);
      // else return reg[p];
    }
  });
}