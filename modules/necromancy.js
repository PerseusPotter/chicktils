import settings from '../settings';
import { Gradient, renderString, renderWaypoint } from '../util/draw';
import Grid from '../util/grid';
import { dist, distAngle } from '../util/math';
import { Deque } from '../util/polyfill';
import reg, { customRegs } from '../util/registerer';
import { unrun } from '../util/threading';

/** @type {Grid<{ name: string, x: number, y: number, z: number, yaw: number }} */
const deadMobs = new Grid({ size: 1, key: 2017, addNeighbors: 2, maxSize: 10 });
/** @type {Map<number, { x: number, y: number, z: number, yaw: number }>} */
const recentSpawnIds = new Map();
const recentSpawnEvicting = new Deque();
/** @type {Map<number, { name: string, t: number }>} */
const droppedSouls = new Map();

const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const mobDieReg = reg('entityDeath', ent => {
  let name = ent.getName();
  for (let i = ent.entity.func_145782_y() + 1, k = 0; k < 3; i++, k++) {
    let tag = World.getWorld().func_73045_a(i);
    if (tag instanceof EntityArmorStand) {
      name = tag.func_70005_c_();
      break;
    }
  }
  const x = ent.entity.field_70118_ct / 32;
  const y = ent.entity.field_70117_cu / 32;
  const z = ent.entity.field_70116_cv / 32;
  deadMobs.add(x, z, { name, x, y, z, yaw: ent.getYaw() });
}).setEnabled(settings._necromancyTrackSouls);
const armorStandSpawnReg = reg('packetReceived', pack => {
  if (pack.func_148993_l() !== 78) return;
  const id = pack.func_149001_c();
  recentSpawnIds.set(id, {
    x: pack.func_148997_d() / 32,
    y: pack.func_148998_e() / 32,
    z: pack.func_148994_f() / 32,
    yaw: pack.func_149006_k() * 360 / 256
  });
  recentSpawnEvicting.push(id);
  if (recentSpawnEvicting.length > 10) recentSpawnIds.delete(recentSpawnEvicting.shift());
}).setFilteredClass(net.minecraft.network.play.server.S0EPacketSpawnObject).setEnabled(settings._necromancyTrackSouls);
const soulSpawnReg = reg('packetReceived', pack => {
  const id = pack.func_149389_d();
  if (!recentSpawnIds.has(id)) return;
  if (pack.func_149388_e() !== 4) return;
  if (pack.func_149390_c()?.func_77978_p()?.func_74775_l('SkullOwner')?.func_74775_l('Properties')?.func_150295_c('textures', 10)?.func_150305_b(0)?.func_74779_i('Value') !== 'ewogICJ0aW1lc3RhbXAiIDogMTYwMTQ3OTI2NjczMywKICAicHJvZmlsZUlkIiA6ICJmMzA1ZjA5NDI0NTg0ZjU4YmEyYjY0ZjAyZDcyNDYyYyIsCiAgInByb2ZpbGVOYW1lIiA6ICJqcm9ja2EzMyIsCiAgInNpZ25hdHVyZVJlcXVpcmVkIiA6IHRydWUsCiAgInRleHR1cmVzIiA6IHsKICAgICJTS0lOIiA6IHsKICAgICAgInVybCIgOiAiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS81YWY0MDM1ZWMwZGMxNjkxNzc4ZDVlOTU4NDAxNzAyMjdlYjllM2UyOTQzYmVhODUzOTI5Y2U5MjNjNTk4OWFkIgogICAgfQogIH0KfQ==') return;

  const skull = recentSpawnIds.get(id);
  Client.scheduleTask(2, () => {
    const [d, mob] = deadMobs.get(skull.x, skull.z).reduce((a, v) => {
      const d =
        dist(v.x, skull.x) +
        dist(v.y, skull.y + 1.4375) +
        dist(v.z, skull.z) +
        distAngle(v.yaw, skull.yaw) / 8;
      return d < a[0] ? [d, v] : a;
    }, [Number.POSITIVE_INFINITY, null]);
    if (!mob) return;

    const i = mob.name.search(/§r §\w\d/);
    droppedSouls.set(id, {
      name: mob.name.slice(0, i >= 0 ? i : mob.name.length),
      t: customRegs.serverTick2.tick
    });
  });
}).setFilteredClass(net.minecraft.network.play.server.S04PacketEntityEquipment).setEnabled(settings._necromancyTrackSouls);
const MAX_SOUL_LIFE = 20 * 30;
const soulGradient = new Gradient(settings._necromancySoulColorNew, settings._necromancySoulColorOld);
const soulRenderReg = reg('postRenderEntity', (ent, pos) => {
  const data = droppedSouls.get(ent.entity.func_145782_y());
  if (!data) return;
  const t = customRegs.serverTick2.tick;
  if (settings.necromancyShowMobName) renderString(
    data.name,
    pos.getX(), pos.getY() + 1.4375 + 0.9, pos.getZ(),
    0xFFFFFFFF, false,
    0.02, false,
    settings.necromancySoulEsp, true, true
  );
  if (settings.necromancyBoxSoul) renderWaypoint(
    pos.getX(), pos.getY() + 1.4375, pos.getZ(),
    0.7, 0.7,
    soulGradient.get((t - data.t) / MAX_SOUL_LIFE),
    settings.necromancySoulEsp, true,
    3, true
  );
}).setEnabled(settings._necromancyTrackSouls);
const worldUnloadReg = reg('worldUnload', () => {
  deadMobs.clear();
  recentSpawnIds.clear();
  recentSpawnEvicting.clear();
  droppedSouls.clear();
}).setEnabled(settings._necromancyTrackSouls);

export function init() { }
export function load() {
  mobDieReg.register();
  armorStandSpawnReg.register();
  soulSpawnReg.register();
  soulRenderReg.register();
  worldUnloadReg.register();
}
export function unload() {
  worldUnloadReg.forceTrigger();

  mobDieReg.unregister();
  armorStandSpawnReg.unregister();
  soulSpawnReg.unregister();
  soulRenderReg.unregister();
  worldUnloadReg.unregister();
}