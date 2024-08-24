/**
 * @typedef {string[] | { [K: string]: SubCommandOption }} SubCommandOption
 */
/**
 * @param {SubCommandOption} opts
 */
export default function(opts) {
  /**
   * @param {string[]} args
   * @returns {string[]}
   */
  return function(args) {
    let c = opts;
    for (let i = 0; i < args.length; i++) {
      let a = args[i].toLowerCase();
      if (Array.isArray(c)) {
        if (i !== args.length - 1) return [];
        return c.filter(v => v.toLowerCase().startsWith(a));
      }
      if (i === args.length - 1) return Object.keys(c).filter(v => v.toLowerCase().startsWith(a));
      let k = Object.keys(c).find(v => v.toLowerCase() === a);
      if (!k) return [];
      c = c[k];
    }
  };
}