import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { registerTrackPlayers, statePlayerClass } from '../dungeon.js';

const mobs = new (Java.type('java.util.WeakHashMap'))();

const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
function isFairy(ent) {
  if (!(ent instanceof EntityArmorStand)) return false;
  const i = ent.func_71124_b(0);
  if (!i) return false;
  const nbt = i.func_77978_p();
  if (!nbt) return false;
  return nbt.func_74775_l('SkullOwner')?.func_74779_i('Id') === '93c42dbb-15e2-3d18-8a89-770e440e97d2';
}

const renderReg = reg('renderEntity', (ent, pos, pt, evn) => {
  const e = ent.entity;
  let v = mobs.get(e);
  if (v === true) cancel(evn);
  else if (v !== false) {
    v = isFairy(e);
    mobs.put(e, v);
    if (v) cancel(evn);
  }
}).setEnabled(new StateProp(settings._dungeonHideHealerFairy).equals('Always').or(new StateProp(settings._dungeonHideHealerFairy).equals('Own').and(new StateProp(statePlayerClass).equals('Healer'))));

export function init() {
  registerTrackPlayers(new StateProp(settings._dungeonHideHealerFairy).equals('Own'));
}
export function start() {
  renderReg.register();
}
export function reset() {
  renderReg.unregister();
}