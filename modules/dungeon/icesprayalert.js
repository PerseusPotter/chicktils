import settings from '../../settings';
import createAlert from '../../util/alert';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { run } from '../../util/threading.js';
import { stateIsInBoss } from '../dungeon.js';

const iceSprayAlert = createAlert('ice spray :O', 10);

const step2Reg = reg('step', () => {
  run(() => {
    if (World.getAllEntities().some(e => e.getClassName() === 'EntityArmorStand' && e.getName().includes('Ice Spray Wand'))) iceSprayAlert.show(settings.dungeonIceSprayAlertTime);
  });
}, 'dungeon/icesprayalert').setFps(2).setEnabled(new StateProp(stateIsInBoss).not().and(settings._dungeonIceSprayAlert));

export function init() {
  settings._dungeonIceSprayAlertSound.onAfterChange(v => iceSprayAlert.sound = v);
}
export function start() {
  Client.scheduleTask(6, () => step2Reg.register());
}
export function reset() {
  step2Reg.unregister();
}