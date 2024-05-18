const prefix = '&7[&2ChickTils&7]&f ';

export function log(...args) {
  ChatLib.chat(prefix + args.join(' '));
}
/**
 * @param {Message} msg
 */
export function logMessage(msg) {
  msg.addTextComponent(0, prefix);
  msg.chat();
}

function format(obj, depth = 3) {
  let t = 'object';
  try {
    t = typeof obj;
  } catch (e) { }
  switch (t) {
    case 'string': return `'${obj}'`;
    case 'number': return Number.isInteger(obj) ? obj.toString() : obj.toFixed(2);
    case 'bigint': return obj.toString() + 'n';
    case 'boolean': return obj.toString();
    case 'function': return `function ${obj.name}() {}`
    case 'symbol': return '@@' + obj.description;
    case 'undefined': return 'undefined';
    case 'object':
      if (obj === null) return 'null';
      if (obj instanceof Date) return obj.toISOString();
      if (obj instanceof Error) return obj.toString();
      if (obj instanceof Set) return 'Set' + format(Array.from(obj.keys()), depth);
      if (obj instanceof Map) return 'Map' + format(Array.from(obj.entries()).reduce((a, [k, v]) => (a[k] = v, a), {}), depth);
      if (Array.isArray(obj)) {
        if (depth === 0) return `Array(${obj.length})`;
        return `[${obj.map(v => format(v, depth - 1)).join(', ')}]`;
      }
      if (depth === 0) return `[object ${obj.constructor ? obj.constructor.name : 'Object'}]`;
      const ent = Object.entries(obj);
      if (ent.length === 0) return '{}';
      return '{ ' + ent.map(([k, v]) => `${k}: ${format(v, depth - 1)}`).join(', ') + ' }';
  }

}
export function logDebug(obj) {
  log(Object.entries(obj).map(([k, v]) => k + ': ' + format(v)).join('\n'));
}