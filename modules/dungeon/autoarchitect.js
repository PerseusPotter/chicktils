import settings from '../../settings';
import createAlert from '../../util/alert';
import reg from '../../util/registerer';
import { execCmd } from '../../util/format';
import { StateProp } from '../../util/state';
import { stateIsInBoss } from '../dungeon.js';

const shitterAlert = createAlert('Shitter', 10);

const stateArchitect = new StateProp(stateIsInBoss).not().and(settings._dungeonAutoArchitect);

function onPuzzleFail(name) {
  let i = name.indexOf(' ');
  if (i < 0) i = name.length;
  if (name.slice(1, i) !== Player.getName()) return;
  // You can't use this command while in combat! (blaze)
  // Client.scheduleTask(20, () => execCmd('gfs ARCHITECT_FIRST_DRAFT 1'));
  execCmd('gfs ARCHITECT_FIRST_DRAFT 1');
  shitterAlert.show(5_000);
  architectUseReg.register();
}
const puzzleFailReg = reg('chat', onPuzzleFail, 'dungeon/autoarchitect').setCriteria('&r&c&lPUZZLE FAIL! &r&${name} ${*}').setEnabled(stateArchitect);
const quizFailReg = reg('chat', onPuzzleFail, 'dungeon/autoarchitect').setCriteria('&r&4[STATUE] Oruo the Omniscient&r&f: &r&${name} &r&cchose the wrong answer! I shall never forget this moment of misrememberance.&r').setEnabled(stateArchitect);
const architectUseReg = reg('chat', () => {
  shitterAlert.hide();
  architectUseReg.unregister();
}, 'dungeon/autoarchitect').setCriteria('&r&aYou used the &r&5Architect\'s First Draft${*}').setEnabled(stateArchitect);

export function init() { }
export function start() {
  puzzleFailReg.register();
  quizFailReg.register();
}
export function reset() {
  shitterAlert.hide();

  puzzleFailReg.unregister();
  quizFailReg.unregister();
  architectUseReg.unregister();
}