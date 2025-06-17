import settings from '../../settings';
import reg from '../../util/registerer';
import { getPlayerName } from '../../util/format';
import { log } from '../../util/log';
import { StateProp } from '../../util/state';
import { getPlayers, registerTrackPlayers, stateFloor, stateIsInBoss } from '../dungeon.js';
import { getOrPut } from '../../util/polyfill';

const teamTerms = new Map();

const stateTermBreakdown = new StateProp(stateFloor).equalsmult('F7', 'M7').and(settings._dungeonTerminalBreakdown).and(stateIsInBoss);

const termCompleteReg = reg('chat', (name, type) => {
  getOrPut(teamTerms, getPlayerName(name), () => ({
    terminal: 0,
    lever: 0,
    device: 0
  }))[type]++;
}).setCriteria(/^&r(.+?)&a (?:completed|activated) a (.+?)! \(&r&c\d&r&a\/(?:7|8)\)&r$/).setEnabled(stateTermBreakdown);
const terminalsEndReg = reg('chat', () => {
  getPlayers().forEach(v => !teamTerms.has(v.ign) && teamTerms.set(v.ign, {
    terminal: 0,
    lever: 0,
    device: 0
  }));
  log('Terminals Breakdown:');
  Array.from(teamTerms.entries()).sort((a, b) => b[1].terminal - a[1].terminal).forEach(([ign, data]) => log(`&b${ign}&r: Terminal x&a${data.terminal}&r | Lever x&a${data.lever}&r | Device x&a${data.device}`));
}).setCriteria('&r&aThe Core entrance is opening!&r').setEnabled(stateTermBreakdown);

export function init() {
  registerTrackPlayers(stateTermBreakdown);
}
export function enter() {
  teamTerms.clear();
}
export function start() {
  termCompleteReg.register();
  terminalsEndReg.register();
}
export function reset() {
  termCompleteReg.unregister();
  terminalsEndReg.unregister();
}