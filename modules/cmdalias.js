import settings from '../settings';
import { execCmd } from '../util/format';
import reg from '../util/registerer';

// rhino :clown:
// java.lang.IllegalStateException at org.mozilla.javascript.ScriptRuntime.getTopCallScope(ScriptRuntime.java:3926)
// execCmd.bind(null, ...)
const allRegs = [];

for (let i = 0; i < 9; i++) allRegs.push(reg('command', execCmd.bind({}, 'enderchest ' + (i + 1))).setName('e' + (i + 1), true).setEnabled(settings._cmdAliasStorage));
for (let i = 0; i < 18; i++) allRegs.push(reg('command', execCmd.bind({}, 'backpack ' + (i + 1))).setName('b' + (i + 1), true).setAliases('' + (i + 1)).setEnabled(settings._cmdAliasStorage));

allRegs.push(reg('command', execCmd.bind({}, 'joininstance CATACOMBS_ENTRANCE')).setName('fent', true).setEnabled(settings._cmdAliasDungeon));
['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'].forEach((v, i) => {
  allRegs.push(reg('command', execCmd.bind({}, 'joininstance CATACOMBS_FLOOR_' + v)).setName('f' + (i + 1), true).setEnabled(settings._cmdAliasDungeon));
  allRegs.push(reg('command', execCmd.bind({}, 'joininstance MASTER_CATACOMBS_FLOOR_' + v)).setName('m' + (i + 1), true).setEnabled(settings._cmdAliasDungeon));
});
['NORMAL', 'HOT', 'BURNING', 'FIERY', 'INFERNAL'].forEach((v, i) => allRegs.push(reg('command', execCmd.bind({}, 'joininstance KUUDRA_' + v)).setName('k' + (i + 1), true).setEnabled(settings._cmdAliasKuudra)));

export function init() { }
export function load() {
  allRegs.forEach(v => v.register());
}
export function unload() {
  allRegs.forEach(v => v.unregister());
}
