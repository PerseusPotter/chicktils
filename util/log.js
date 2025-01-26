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

const format = (function() {
  const MCVec3 = Java.type('net.minecraft.util.Vec3');
  const MCVec3i = Java.type('net.minecraft.util.Vec3i');
  const MCBlockState = Java.type('net.minecraft.block.state.IBlockState');
  const MCBlock = Java.type('net.minecraft.block.Block');
  const Vector3f = Java.type('org.lwjgl.util.vector.Vector3f');

  return function(obj, depth = 3) {
    let t = 'object';
    try {
      t = typeof obj;
    } catch (e) { }
    switch (t) {
      case 'string': return `'${obj}'`;
      case 'number': return Number.isInteger(obj) ? obj.toString() : obj.toFixed(3);
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

        if (obj.getClass?.()?.isEnum?.()) return `Enum{${obj.toString()}}`;

        if (obj instanceof MCVec3) return `<${format(obj.field_72450_a)}, ${format(obj.field_72448_b)}, ${format(obj.field_72449_c)}>`;
        if (obj instanceof MCVec3i) return `(${format(obj.func_177958_n())}, ${format(obj.func_177956_o())}, ${format(obj.func_177952_p())})`;
        if (obj instanceof MCBlockState) return `{BlockState|${format(obj.func_177230_c())}|meta=${obj.func_177230_c().func_176201_c(obj)}}`;
        if (obj instanceof MCBlock) return `{Block|${obj.func_149732_F()}|${MCBlock.func_149682_b(obj)}}`;
        if (obj instanceof Vector3f) return `<${format(obj.x)}, ${format(obj.y)}, ${format(obj.z)}>`;

        if (depth === 0) return `[object ${obj.constructor ? obj.constructor.name : 'Object'}]`;
        const ent = Object.entries(obj);
        if (ent.length === 0) return '{}';
        return '{ ' + ent.map(([k, v]) => `${k}: ${format(v, depth - 1)}`).join(', ') + ' }';
    }
  };
}());
export function logDebug(obj, depth) {
  let str = Object.entries(obj).map(([k, v]) => k + ': ' + format(v, depth)).join('\n');
  log(str);
}

export function logState(state, name) {
  log(name, 'value:', state.get());
  state.listen(() => log(name, 'changed:', state.get()));
}