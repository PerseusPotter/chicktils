import settings from '../../settings';
import reg from '../../util/registerer';

export let princeKilled = false;

const chatReg = reg('chat', () => {
  if (!princeKilled && settings.dungeonPrinceKilledMessage) ChatLib.command('pc Prince Killed!');
  princeKilled = true;
}).setCriteria('&r&eA Prince falls. &r&a+1 Bonus Score&r');

export function start() {
  princeKilled = false;

  chatReg.register();
}
export function reset() {
  chatReg.unregister();
}