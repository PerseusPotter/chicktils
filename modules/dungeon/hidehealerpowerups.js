import settings from '../../settings';
import reg from '../../util/registerer';
import { dist } from '../../util/math';
import Grid from '../../util/grid';
import { unrun } from '../../util/threading';

const orbIds = [
  'DUNGEON_BLUE_SUPPORT_ORB',
  'DUNGEON_RED_SUPPORT_ORB',
  'DUNGEON_GREEN_SUPPORT_ORB'
];
const orbNames = [
  '§c§lABILITY DAMAGE',
  '§c§lDAMAGE',
  '§a§lDEFENSE'
];
const hiddenPowerups = new (Java.type('java.util.WeakHashMap'))();
const hiddenPowerupsBucket = new Grid({ size: 0, addNeighbors: 1 });

const orbSpawnReg = reg('packetReceived', pack => {
  if (pack.func_149388_e() !== 4) return;

  const tag = pack.func_149390_c()?.func_77978_p();
  if (!tag) return;
  // const tex = tag.func_74775_l('SkullOwner')?.func_74775_l('Properties')?.func_150295_c('textures', 10)?.func_150305_b(0)?.func_74779_i('Value');
  const item = tag.func_74775_l('ExtraAttributes')?.func_74779_i('id');
  if (!orbIds.includes(item)) return;

  unrun(() => {
    const e = World.getWorld().func_73045_a(pack.func_149389_d());
    if (!e) return;
    hiddenPowerups.put(e, 0);
    hiddenPowerupsBucket.add(e.field_70165_t, e.field_70161_v, e);
  });
}).setFilteredClass(net.minecraft.network.play.server.S04PacketEntityEquipment).setEnabled(settings._dungeonHideHealerPowerups);
const orbNameReg = reg('packetReceived', pack => {
  const name = pack.func_149376_c()?.find(v => v.func_75672_a() === 2)?.func_75669_b();
  if (!name || !orbNames.some(v => name.startsWith(v))) return;
  unrun(() => {
    const e = World.getWorld().func_73045_a(pack.func_149375_d());
    if (!e) return;
    hiddenPowerups.put(e, 0);
  });
}).setFilteredClass(net.minecraft.network.play.server.S1CPacketEntityMetadata).setEnabled(settings._dungeonHideHealerPowerups);

const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const particleReg = reg('spawnParticle', (part, id, evn) => {
  if (!id.equals(EnumParticleTypes.REDSTONE)) return;
  const b = part.underlyingEntity.func_70535_g();
  if (b === 0 || b > 10) return;
  if (hiddenPowerupsBucket.get(part.getX(), part.getZ()).some(e => dist(e.field_70165_t, part.getX()) < 2 && dist(e.field_70161_v, part.getZ()) < 2 && dist(e.field_70163_u + 2, part.getY() < 5))) cancel(evn);
}).triggerIfCanceled(false).setEnabled(settings._dungeonHideHealerPowerups);
const renderEntReg = reg('renderEntity', (e, pos, partial, evn) => {
  if (hiddenPowerups.containsKey(e.entity)) cancel(evn);
}).setEnabled(settings._dungeonHideHealerPowerups);

export function init() { }
export function start() {
  hiddenPowerupsBucket.clear();

  orbSpawnReg.register();
  orbNameReg.register();
  particleReg.register();
  renderEntReg.register();
}
export function reset() {
  orbSpawnReg.unregister();
  orbNameReg.unregister();
  particleReg.unregister();
  renderEntReg.unregister();
}