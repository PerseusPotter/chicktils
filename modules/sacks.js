import settings from '../settings';
import reg from '../util/registerer';

function parseLog(itemLog, items) {
  // -1 = 'This message can be disabled in the settings.'
  for (let i = 0; i < itemLog.length - 1; i += 4) {
    // '  +23 ' | '  -23 '
    let amnt = itemLog[i + 0].func_150261_e().slice(2, -1);
    amnt = parseInt(amnt.replace(/,/g, ''));
    // 'Blaze Rod'
    let name = itemLog[i + 1].func_150261_e();
    // ' (Combat Sack, Nether Sack)'
    // let sack = itemLog[i + 2].func_150261_e();
    // '\n'
    // let newl = itemLog[i + 3].func_150261_e();

    items.set(name, amnt + (items.get(name) ?? 0));
  }

  return items;
}

const getHoverText = (evn, offset = 0) => evn.message.func_150253_a()[offset].func_150256_b().func_150210_i().func_150702_b().func_150253_a();

const sackSingleMsgReg = reg('chat', (time, evn) => {
  if (settings.sacksDisableMessage) cancel(evn);

  processNewItems(
    parseLog(
      getHoverText(evn, 0),
      new Map()
    ),
    parseInt(time)
  );
}).setCriteria(/^&6\[Sacks\] &r(?:&a\+|&c-)[\d,]+&r&e items?&r&e\.&r&8 \(Last (\d+)s\.\)&r$/);
const sackBothMsgReg = reg('chat', (time, evn) => {
  if (settings.sacksDisableMessage) cancel(evn);

  processNewItems(
    parseLog(
      getHoverText(evn, 0),
      parseLog(
        getHoverText(evn, 3),
        new Map()
      )
    ),
    parseInt(time)
  );
}).setCriteria(/^&6\[Sacks\] &r&a\+[\d,]+&r&e items?&r&e, &r&c-[\d,]+&r&e items?&r&e\.&r&8 \(Last (\d+)s\.\)&r$/);

/**
 * @param {Map<string, number>} items
 * @param {number} time
 */
function processNewItems(items, time) {

}

export function init() { }
export function load() {
  sackSingleMsgReg.register();
  sackBothMsgReg.register();
}
export function unload() {
  sackSingleMsgReg.unregister();
  sackBothMsgReg.unregister();
}