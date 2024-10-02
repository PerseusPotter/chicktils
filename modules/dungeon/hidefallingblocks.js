import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateIsInBoss } from '../dungeon.js';

const EntityFallingBlock = Java.type('net.minecraft.entity.item.EntityFallingBlock');
const entSpawnReg = reg('spawnEntity', ent => {
  if (ent instanceof EntityFallingBlock) World.getWorld().func_72900_e(ent);
}, 'dungeon/hidefallingblocks').setEnabled(new StateProp(settings._dungeonHideFallingBlocks).and(stateIsInBoss));

export function init() { }
export function start() {
  entSpawnReg.register();
}
export function reset() {
  entSpawnReg.unregister();
}