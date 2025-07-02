import settings from '../../settings';
import reg from '../../util/registerer';

const mobs = new (Java.type('java.util.WeakHashMap'))();

const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
function isSkull(ent) {
  if (!(ent instanceof EntityArmorStand)) return false;
  const i = ent.func_71124_b(4);
  if (!i) return false;
  const nbt = i.func_77978_p();
  if (!nbt) return false;
  return nbt.func_74775_l('SkullOwner')?.func_74779_i('Id') === '2134ab1c-7c78-30e1-8513-a6346c2344fd';
}

const renderReg = reg('renderEntity', (ent, pos, pt, evn) => {
  const e = ent.entity;
  let v = mobs.get(e);
  if (v === true) cancel(evn);
  else if (v !== false) {
    v = isSkull(e);
    mobs.put(e, v);
    if (v) cancel(evn);
  }
}).setEnabled(settings._dungeonHideSoulweaverSkulls);

export function enter() {
  renderReg.register();
}
export function reset() {
  renderReg.unregister();
}