import settings from '../settings';
import reg from '../util/registerer';
import { registerListenIsland, stateIsland } from '../util/skyblock';
import { StateProp } from '../util/state';
import { unrun } from '../util/threading';

const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const entAge = new (Java.type('java.util.WeakHashMap'))();
const stepReg = reg('step', () => {
  unrun(() => {
    World.getAllEntitiesOfType(EntityArmorStand).forEach(v => {
      if (v.getWidth() !== 0 || v.getHeight() !== 0 || v.entity.func_145818_k_()) return;

      const age = entAge.getOrDefault(v.entity, 5) - 1;
      if (age) entAge.put(v.entity, age);
      else World.getWorld().func_72900_e(v.entity);
    });
  });
}).setDelay(3).setEnabled(new StateProp(stateIsland).equals('The End'));

export function init() {
  registerListenIsland(settings._enablevoidgloomarmorstandfix);
}
export function load() {
  stepReg.register();
}
export function unload() {
  stepReg.unregister();
}