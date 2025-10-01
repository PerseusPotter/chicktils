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
  if (DUMP_TO_FILE) return log(msg.getFormattedText());
  msg.addTextComponent(0, prefix);
  msg.chat();
}

/**
 * @param {any} obj
 * @param {number?} depth (3)
 * @param {{ precision?: number }?} options ({ precision: 3 })
 */
export function logDebug(obj, depth, options) {
  let str = Object.entries(obj).map(([k, v]) => k + ': ' + require('./format').serialize(v, depth, options)).join('\n');
  log(str);
}

export function logState(state, name) {
  log(name, 'value:', state.get());
  state.listen(() => log(name, 'changed:', state.get()));
}