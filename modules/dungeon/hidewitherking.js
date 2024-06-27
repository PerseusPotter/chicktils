import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  if (e.getClass().getSimpleName() !== 'EntityArmorStand') return;
  if (e.field_70163_u < 10 || e.field_70163_u > 25 || e.field_70161_v > 45) return;
  evn.setCanceled(true);
}, 'dungeon/hidewitherking').setEnabled(new StateProp(stateFloor).equals('M7').and(stateIsInBoss).and(settings._dungeonHideWitherKing));

export function init() { }
export function start() {
  entSpawnReg.register();
}
export function reset() {
  entSpawnReg.unregister();
}