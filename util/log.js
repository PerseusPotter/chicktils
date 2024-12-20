const prefix = '&7[&2ChickTils&7]&f ';
const DUMP_TO_FILE = false;

export const log = (function() {
  if (DUMP_TO_FILE) {
    var Logger = java.util.logging.Logger.getLogger('ChicktilsLogger');
    const FileHandler = new java.util.logging.FileHandler('./config/ChatTriggers/modules/chicktils/log-%u.log');
    Logger.addHandler(FileHandler);
    FileHandler.setFormatter(new JavaAdapter(java.util.logging.Formatter, {
      format(record) {
        return record.getMessage().replace(/[^\x00-\x7F]/g, c => '\\x' + c.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
      }
    }));
  }
  return function(...args) {
    if (DUMP_TO_FILE) Logger.info(args.join(' '));
    else ChatLib.chat(prefix + args.join(' '));
  }
}());

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
    case 'function': return `function ${'name' in obj ? obj.name : obj.class.getSimpleName()}() {}`
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
      if (obj instanceof Java.type('net.minecraft.util.Vec3')) return `<${format(obj.field_72450_a)}, ${format(obj.field_72448_b)}, ${format(obj.field_72449_c)}>`;
      if (depth === 0) return `[object ${obj.constructor ? obj.constructor.name : 'Object'}]`;
      const ent = Object.entries(obj);
      if (ent.length === 0) return '{}';
      return '{ ' + ent.map(([k, v]) => `${k}: ${format(v, depth - 1)}`).join(', ') + ' }';
  }
}
export function logDebug(obj, depth) {
  let str = Object.entries(obj).map(([k, v]) => k + ': ' + format(v, depth)).join('\n');
  log(str);
}

export function logState(state, name) {
  log(name, 'value:', state.get());
  state.listen(() => log(name, 'changed:', state.get()));
}