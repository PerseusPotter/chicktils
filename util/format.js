import { log } from './log';

/**
 * @param {number} t
 * @returns {string}
 */
export function timeToStr(t) {
  t /= 1000; // t is in seconds
  if (t < 60) return t.toFixed(0) + 's';
  if (t < 60 * 5) return `${(t / 60).toFixed(0)}m ${(t % 60).toFixed(0)}s`;
  t /= 60; // t is in minutes
  if (t < 60) return t.toFixed(0) + 'm';
  if (t < 60 * 5) return `${(t / 60).toFixed(0)}h ${(t % 60).toFixed(0)}m`;
  t /= 60; // t is in hours
  if (t < 24) return t.toFixed(0) + 'h';
  if (t < 48) return `1d ${(t - 24).toFixed(0)}h`;
  t /= 24; // t is in days
  if (t < 7) return t.toFixed(0) + 'd';
  let years = t / 365;
  t %= 365;
  let weeks = t / 7;
  t %= 7;
  years = years > 1 ? years.toFixed(0) + 'y ' : '';
  weeks = weeks > 1 ? weeks.toFixed(0) + 'w ' : '';
  let days = t > 1 ? t.toFixed(0) + 'd' : '';
  return years + weeks + days;
}

export function cleanNumber(n, e = 2) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(e);
}

/**
 * @param {number} n
 * @param {number} max
 * @returns {string}
 */
export function colorForNumber(n, max = 1) {
  return (n > max * 0.75 ? '§2' :
    n > max * 0.5 ? '§e' :
      n > max * 0.25 ? '§6' :
        '§4');
}

/**
 * @param {string} msg
 */
function getCenteredTextLen(msg) {
  const msgWidth = Renderer.getStringWidth(msg) * Client.settings.chat.getScale();
  const margins = ChatLib.getChatWidth() - msgWidth;
  return (margins / Renderer.getStringWidth(' ') / Client.settings.chat.getScale()) >> 1;
}

/**
 * @template {any} T
 * @param {T} msg
 * @returns {T}
 */
export function centerMessage(msg) {
  if (msg instanceof Message) return msg.addTextComponent(0, ' '.repeat(getCenteredTextLen(msg.getFormattedText())));
  if (typeof msg !== 'string') msg = msg.toString();
  return ' '.repeat(getCenteredTextLen(msg)) + msg;
}


/**
 * @param {string} cmd
 */
export function execCmd(cmd) {
  log('&2Executing command: &7/' + cmd);
  ChatLib.command(cmd);
}

/**
 * @param {string} name
 */
export function getPlayerName(name) {
  // rhino :trash:
  // org.mozilla.javascript.EcmaError: SyntaxError: Invalid quantifier ?
  // /(?<=\s|^)(?:(?:§|&).){0,}([A-Za-z0-9_]+?)(?:(?:§|&).){0,}\b/
  // more rhino bullshit?
  const match = name.toString().match(/(?:\s|^)(?:(?:§|&).){0,}([A-Za-z0-9_]+?)(?:(?:§|&).){0,}\b(?!.+?])/);
  if (!match) return '';
  return match[1];
}