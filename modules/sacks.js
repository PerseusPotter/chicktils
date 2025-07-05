import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { formatQuantity } from '../util/format';
import { log } from '../util/log';
import { Deque, getOrPut } from '../util/polyfill';
import reg from '../util/registerer';
import { ITEMS_ID_MAP, ITEMS_NAME_MAP, stripName } from '../util/sackitems';
import { unrun } from '../util/threading';
import { FrameTimer } from '../util/timers';

class Difference {
  pos = 0;
  neg = 0;
  /**
   * @param {number} num
   */
  put(num) {
    if (num > 0) this.pos += num;
    else this.neg += num;
  }
  sum() {
    return this.pos + this.neg;
  }
  /**
   * @param {Difference} diff
   */
  combine(diff) {
    this.pos += diff.pos;
    this.neg += diff.neg;
  }
}

/**
 * @param {Map<string, Difference>} items
 * @returns {Map<string, Difference>}
 */
function parseLog(itemLog, items) {
  // -1 = 'This message can be disabled in the settings.'
  for (let i = 0; i < itemLog.length - 1; i += 4) {
    // '  +23 ' | '  -23 '
    let amnt = itemLog[i + 0].func_150261_e().slice(2, -1);
    amnt = parseInt(amnt.replace(/,/g, ''));
    // 'Blaze Rod'
    let name = itemLog[i + 1].func_150261_e();
    if (name === ' other items.') break; // ran out of space :(, no other items, and no sack (i + 2)
    // ' (Combat Sack, Nether Sack)'
    // let sack = itemLog[i + 2].func_150261_e();
    // '\n'
    // let newl = itemLog[i + 3].func_150261_e();

    getOrPut(items, name, () => new Difference()).put(amnt);
  }

  return items;
}
const getHoverText = (evn, offset = 0) => evn.message.func_150253_a()[offset].func_150256_b().func_150210_i().func_150702_b().func_150253_a();

const sackSingleMsgReg = reg('chat', (time, evn) => {
  if (settings.sacksDisableMessage) cancel(evn);

  updateItemGui(
    parseLog(
      getHoverText(evn, 0),
      new Map()
    ),
    parseInt(time)
  );
}).setCriteria(/^&6\[Sacks\] &r(?:&a\+|&c-)[\d,]+&r&e items?&r&e\.&r&8 \(Last (\d+)s\.\)&r$/);
const sackBothMsgReg = reg('chat', (time, evn) => {
  if (settings.sacksDisableMessage) cancel(evn);

  updateItemGui(
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

const itemGui = createTextGui(() => data.sackTilsItemDisplay, () => ['&a+ 6,942x &rPoisonous Potato', '&c- 1x &r§5Architect\'s First Draft']);
const itemTimeoutTimer = new FrameTimer(10);
const itemRenderReg = reg('renderOverlay', () => {
  if (itemTimeoutTimer.shouldRender()) {
    const t = Date.now();
    const iter = itemUpdateTime.iter(itemUpdateTime.length - 1);
    while (iter.index() >= 0) {
      let v = iter.value();
      if (t - v[1] > settings.sacksDisplayTimeout) {
        itemGui.removeLine(iter.index());
        iter.remove();
      }
      iter.prev();
    }
  }
  itemGui.render();
}).setEnabled(settings._sacksDisplay);

/** @type {Map<string, Difference>} */
const itemAggregate = new Map();
/** @type {Deque<[string, number]>} */
const itemUpdateTime = new Deque();
/** @type {string[]} */
let itemWhitelist = [];
/** @type {string[]} */
let itemBlacklist = [];
const warnedItems = new Map();
/**
 * @param {Map<string, Difference>} items
 * @param {number} time
 */
function updateItemGui(items, time) {
  if (!settings.sacksDisplay) return;
  /** @type {[string, Difference][]} */
  const itemsA = Array.from(items.entries()).map(([n, d]) => {
    /** @type {string} */
    const id = ITEMS_NAME_MAP.get(stripName(n))?.id ?? getOrPut(
      warnedItems, n,
      () => {
        const i = stripName(n.replace(/\s+/g, '_')).toUpperCase();
        log(`&4Unknown item &7"&r${n}&7"&4. Will try to use the item id &7"&r${i}&7"&4. Please report this, this warning will not be sent for this item for the remainder of the session.`);
        return i;
      }
    );
    if (itemWhitelist.length) {
      if (!itemWhitelist.some(v => matchesName(id, n, v))) return;
    }
    if (itemBlacklist.length) {
      if (itemBlacklist.some(v => matchesName(id, n, v))) return;
    }
    return [id, d];
  }).filter(v => v && ITEMS_ID_MAP.has(v[0]));
  if (settings.sacksDisplayTrackAggregateQuantities) itemsA.forEach(e => {
    const [k, v] = e;
    const o = getOrPut(itemAggregate, k, () => new Difference());
    o.combine(v);
    e[1] = o;
  });

  unrun(() => {
    const t = Date.now();
    const updateLine = (id, str) => {
      let iter = itemUpdateTime.iterFind(v => v[0] === id);
      if (iter.done()) {
        itemUpdateTime.push([id, t]);
        iter = itemUpdateTime.iter(itemUpdateTime.length - 1);

        itemGui.addLine(str);
      } else itemGui.replaceLine(str, iter.index());

      iter.value()[1] = t;
    };
    itemsA.forEach(([k, d]) => {
      const n = ITEMS_ID_MAP.get(k).nameF;
      if (settings.sacksDisplayCombineQuantities) updateLine(k, formatQuantity(d.sum(), n));
      else {
        if (d.pos > 0) updateLine('+' + k, formatQuantity(d.pos, n));
        if (d.neg < 0) updateLine('-' + k, formatQuantity(d.neg, n));
      }
    });
  });
}
/**
 * @param {string} id
 * @param {string} name
 * @param {string} test
 * @returns {boolean}
 */
function matchesName(id, name, test) {
  if (id.toLowerCase() === test) return true;
  name = stripName(name);
  if (name === test) return;
  return name.replace(/\s+/g, '') === test.replace(/\s+/g, '');
}

export function init() {
  settings._moveSacksDisplay.onAction(v => itemGui.edit(v));
  settings._sacksDisplayResetAggregate.onAction(() => {
    itemAggregate.clear();
    log('&aCleared sack data');
  });
  settings._sacksDisplayTrackAggregateQuantities.listen(() => itemAggregate.clear());
  settings._sacksDisplayItemWhitelist.listen(v => itemWhitelist = v ? v.split(',').map(v => stripName(v)) : []);
  settings._sacksDisplayItemBlacklist.listen(v => itemBlacklist = v ? v.split(',').map(v => stripName(v)) : []);
}
export function load() {
  sackSingleMsgReg.register();
  sackBothMsgReg.register();
  itemRenderReg.register();
}
export function unload() {
  itemAggregate.clear();
  itemUpdateTime.clear();

  sackSingleMsgReg.unregister();
  sackBothMsgReg.unregister();
  itemRenderReg.unregister();
}