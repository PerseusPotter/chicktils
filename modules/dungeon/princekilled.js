import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { statePrinceKilled } from '../dungeon.js';

const stateNoPrince = new StateProp(statePrinceKilled).not();
const chatReg = reg('chat', () => {
  if (settings.dungeonPrinceKilledMessage) ChatLib.command('pc Prince Killed!');
  statePrinceKilled.set(true);
}).setCriteria('&r&eA Prince falls. &r&a+1 Bonus Score&r').setEnabled(stateNoPrince);
const partyReg = reg('chat', (ign, msg) => {
  if (msg === 'Prince Killed!') statePrinceKilled.set(true);
}).setCriteria('&r&9Party &8> ${ign}&f: &r${msg}&r').setEnabled(stateNoPrince);

export function start() {
  chatReg.register();
  partyReg.register();
}
export function reset() {
  chatReg.unregister();
  partyReg.unregister();
}