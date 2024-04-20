import settings from '../settings';
import { log } from '../util/log';
import { reg } from '../util/registerer';

function execCmd(cmd) {
  return function() {
    log('&2Executing command: &7/' + cmd);
    ChatLib.command(cmd);
  }
}

const storage = new Array(9).fill(0).map((_, i) =>
  reg('command', execCmd('enderchest ' + (i + 1))).setName('e' + (i + 1), true).unregister()
).concat(new Array(18).fill(0).map((_, i) =>
  reg('command', execCmd('backpack ' + (i + 1))).setName('b' + (i + 1), true).setAliases('' + (i + 1)).unregister()
));
const names = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
const kuudraNames = ['NORMAL', 'HOT', 'BURNING', 'FIERY', 'INFERNAL'];
const dungeon = new Array(7).fill(0).map((_, i) =>
  reg('command', execCmd('joininstance CATACOMBS_FLOOR_' + names[i])).setName('f' + (i + 1), true).unregister()
).concat(new Array(7).fill(0).map((_, i) =>
  reg('command', execCmd('joininstance MASTER_CATACOMBS_FLOOR_' + names[i])).setName('m' + (i + 1), true).unregister()
));
dungeon.unshift(reg('command', execCmd('joininstance CATACOMBS_ENTRANCE')).setName('fe', true).unregister());
const kuudra = new Array(5).fill(0).map((_, i) =>
  reg('command', execCmd('joininstance KUUDRA_' + kuudraNames[i])).setName('k' + (i + 1), true).unregister()
);

function updater(list) {
  return function(v) {
    if (v) list.forEach(v => v.register());
    else list.forEach(v => v.unregister());
  }
}
export function init() {
  settings._cmdAliasStorage.onAfterChange(updater(storage));
  settings._cmdAliasDungeon.onAfterChange(updater(dungeon));
  settings._cmdAliasKuudra.onAfterChange(updater(kuudra));
}
export function load() {
  if (settings.cmdAliasStorage) updater(storage, true);
  if (settings.cmdAliasDungeon) updater(dungeon, true);
  if (settings.cmdAliasKuudra) updater(kuudra, true);
}
export function unload() {
  updater(storage, false);
  updater(dungeon, false);
  updater(kuudra, false);
}
