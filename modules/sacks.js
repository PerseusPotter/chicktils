import settings from '../settings';
import reg from '../util/registerer';

const sackMsgReg = reg('chat', (time, evn) => {
  if (settings.sacksDisableMessage) cancel(evn);
  time = parseInt(time);

  const itemLog = evn.message.func_150253_a()[0].func_150256_b().func_150210_i().func_150702_b().func_150253_a();
  const items = new Map();
  // -1 = 'This message can be disabled in the settings.'
  for (let i = 0; i < itemLog.length - 1; i += 4) {
    // '  +23 '
    let amnt = itemLog[i + 0].func_150261_e().slice(3, -1);
    amnt = parseInt(amnt);
    // 'Blaze Rod'
    let name = itemLog[i + 1].func_150261_e();
    // ' (Combat Sack, Nether Sack)'
    // let sack = itemLog[i + 2].func_150261_e();
    // '\n'
    // let newl = itemLog[i + 3].func_150261_e();

    items.set(name, amnt);
  }
}).setCriteria('&6[Sacks] &r&a+${*}&r&e item${*}&r&e.&r&8 (Last ${time}s.)&r');
const sackDeleteMsgReg = reg('chat', evn => cancel(evn)).setCriteria('&6[Sacks] &r&c-${*}&r&e item${*}&r&e.&r&8 (Last ${*}s.)&r').setEnabled(settings._sacksDisableMessage);

export function init() { }
export function load() {
  sackMsgReg.register();
  sackDeleteMsgReg.register();
}
export function unload() {
  sackMsgReg.unregister();
  sackDeleteMsgReg.unregister();
}