import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { statePrinceKilled } from '../dungeon.js';

const chatReg = reg('chat', () => {
  if (settings.dungeonPrinceKilledMessage) ChatLib.command('pc Prince Killed!');
  statePrinceKilled.set(true);
}).setCriteria('&r&eA Prince falls. &r&a+1 Bonus Score&r').setEnabled(new StateProp(statePrinceKilled).not());

export function start() {
  chatReg.register();
}
export function reset() {
  chatReg.unregister();
}