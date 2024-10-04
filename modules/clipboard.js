import reg from '../util/registerer';
import data from '../data';
import { get, set } from '../util/clipboard';
import { log } from '../util/log';
import tabcompletion from '../util/tabcompletion';

const tabCompName = ([name]) => Object.keys(data.clipboardData).filter(v => v.toLowerCase().startsWith(name.toLowerCase()));

const cbs = reg('command', ...args => {
  if (!args || !args.length) return log('&4where params');
  const name = args[0];
  if (!name) return log('&4where name');
  data.clipboardData[name] = get();
  log(`&aset ${name}`);
}).setName('cbs').setTabCompletions(tabCompName);
const cbg = reg('command', ...args => {
  if (!args || !args.length) return log('&4where params');
  const name = args[0];
  if (!name) return log('&4where name');
  if (!(name in data.clipboardData)) return log('&4name not found');
  set(data.clipboardData[name]);
  log(`&acopied ${name} to clipboard`);
}).setName('cbg').setTabCompletions(tabCompName);
const cbl = reg('command', () => log('available things:', Object.keys(data.clipboardData).join(', '))).setName('cbl');
const cbr = reg('command', ...args => {
  if (!args || !args.length) return log('&4where params');
  const name = args[0];
  if (!name) return log('&4where name');
  if (!(name in data.clipboardData)) return log('&4name not found');
  delete data.clipboardData[name];
  log(`&aremoved ${name}`);
}).setName('cbr').setTabCompletions(tabCompName);

// incomplete tab completes bc lazy
const cb = reg('command', ...args => {
  if (!args || !args.length) return log('&4where params');
  if (args[0] === 'set') cbs.forceTrigger(args[1]);
  else if (args[0] === 'get') cbg.forceTrigger(args[1]);
  else if (args[0] === 'list') cbl.forceTrigger();
  else if (args[0] === 'remove') cbr.forceTrigger();
  else log('&4?? use get/set/list/remove');
}).setName('clipboard').setTabCompletions(tabcompletion({ get: [], set: [], list: [], remove: [] }));

export function init() { }
export function load() {
  cb.register();
  cbs.register();
  cbg.register();
  cbl.register();
  cbr.register();
}
export function unload() {
  cb.unregister();
  cbs.unregister();
  cbl.unregister();
  cbr.unregister();
}
