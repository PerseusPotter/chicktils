import settings from '../../settings';
import reg from '../../util/registerer';
import { dist } from '../../util/math';
import Grid from '../../util/grid';

const orbNames = [
  '§c§lABILITY DAMAGE',
  '§c§lDAMAGE',
  '§a§lDEFENSE'
];
const orbIds = [
  'DUNGEON_BLUE_SUPPORT_ORB',
  'DUNGEON_RED_SUPPORT_ORB',
  'DUNGEON_GREEN_SUPPORT_ORB'
];
let powerupCand = [];
const hiddenPowerups = new (Java.type('java.util.HashSet'))();
const hiddenPowerupsBucket = new Grid({ addNeighbors: 1 });

const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  if (e.getClass().getSimpleName() === 'EntityArmorStand') powerupCand.push([Date.now(), e]);
}).setEnabled(settings._dungeonHideHealerPowerups);
const tickReg = reg('tick', () => {
  const t = Date.now();
  powerupCand = powerupCand.filter(v => {
    const e = v[1];
    const n = e.func_70005_c_();
    if (n === 'Armor Stand') {
      let i = e.func_71124_b(4);
      let b = i && i.func_77978_p();
      if (b) {
        const d = b.func_74775_l('ExtraAttributes').func_74779_i('id');
        if (orbIds.some(v => d === v)) {
          hiddenPowerups.add(e);
          hiddenPowerupsBucket.add(e.field_70165_t, e.field_70161_v, e);
          return false;
        }
      }
      i = e.func_71124_b(0);
      b = i && i.func_77978_p();
      if (b && b.func_74775_l('SkullOwner').func_74775_l('Properties').func_150295_c('textures', 10).func_150305_b(0).func_74775_l('Value').func_74775_l('textures').func_74775_l('SKIN').func_74779_i('url') === 'http://textures.minecraft.net/texture/96c3e31cfc66733275c42fcfb5d9a44342d643b55cd14c9c77d273a2352') {
        hiddenPowerups.add(e);
        hiddenPowerupsBucket.add(e.field_70165_t, e.field_70161_v, e);
      }
      return t - v[0] < 500;
    } else if (orbNames.some(v => n.startsWith(v))) {
      hiddenPowerups.add(e);
      hiddenPowerupsBucket.add(e.field_70165_t, e.field_70161_v, e);
    }
    return false;
  });
}).setEnabled(settings._dungeonHideHealerPowerups);
const particleReg = reg('spawnParticle', (part, id, evn) => {
  if (id.toString() !== 'REDSTONE') return;
  try {
    // chattriggers :clown:
    // org.mozilla.javascript.WrappedException: Wrapped java.lang.IllegalArgumentException: Color parameter outside of expected range: Green Blue
    const b = part.getColor().getBlue();
    if (b === 0 || b > 10) return;
    if (hiddenPowerupsBucket.get(part.getX(), part.getZ()).some(e => dist(e.field_70165_t, part.getX()) < 1 && dist(e.field_70161_v, part.getZ()) < 1 && dist(e.field_70163_u, part.getY() < 2))) cancel(evn);
  } catch (e) { }
}).triggerIfCanceled(false).setEnabled(settings._dungeonHideHealerPowerups);
const renderEntReg = reg('renderEntity', (e, pos, partial, evn) => {
  if (hiddenPowerups.contains(e.entity)) cancel(evn);
}).setEnabled(settings._dungeonHideHealerPowerups);

export function init() { }
export function start() {
  powerupCand = [];
  hiddenPowerups.clear();
  hiddenPowerupsBucket.clear();

  entSpawnReg.register();
  tickReg.register();
  particleReg.register();
  renderEntReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  tickReg.unregister();
  particleReg.unregister();
  renderEntReg.unregister();
}