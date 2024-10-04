import settings from '../../settings';
import createAlert from '../../util/alert';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { unrun } from '../../util/threading';
import { stateIsInBoss } from '../dungeon.js';

const iceSprayAlert = createAlert('ice spray :O', 10);
let ents = [];

const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const step2Reg = reg('step', () => {
  if (ents.some(e => e.getName().includes('Ice Spray Wand'))) iceSprayAlert.show(settings.dungeonIceSprayAlertTime);
  unrun(() => ents = World.getAllEntitiesOfType(EntityArmorStand));
}).setFps(2).setOffset(500 / 3 * 2).setEnabled(new StateProp(stateIsInBoss).not().and(settings._dungeonIceSprayAlert));

export function init() {
  settings._dungeonIceSprayAlertSound.listen(v => iceSprayAlert.sound = v);
}
export function start() {
  step2Reg.register();
}
export function reset() {
  ents = [];

  step2Reg.unregister();
}