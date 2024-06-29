import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  if (!(e instanceof EntityArmorStand)) return;
  if (e.field_70163_u < 9 || e.field_70163_u > 25 || e.field_70161_v > 45) return;
  evn.setCanceled(true);
}, 'dungeon/hidewitherking').setEnabled(new StateProp(stateFloor).equals('M7').and(stateIsInBoss).and(settings._dungeonHideWitherKing));
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const partSpawnReg = reg('spawnParticle', (p, i, evn) => {
  if (p.getY() >= 9 && p.getY() <= 25 && p.getZ() <= 45 && i === EnumParticleTypes.SPELL_WITCH) cancel(evn);
}, 'dungeon/hidewitherking').setEnabled(new StateProp(stateFloor).equals('M7').and(stateIsInBoss).and(settings._dungeonHideWitherKing));

export function init() { }
export function start() {
  entSpawnReg.register();
  partSpawnReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  partSpawnReg.unregister();
}