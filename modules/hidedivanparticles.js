import { compareFloat, dist } from '../util/math';
import reg from '../util/registerer';

const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const partSpawnReg = reg('packetReceived', (pack, evn) => {
  if (!pack.func_179749_a().equals(EnumParticleTypes.REDSTONE)) return;
  if (pack.func_149222_k() !== 0) return;
  if (pack.func_149227_j() !== 1) return;
  if (
    dist(pack.func_149220_d(), Player.getX()) > 1 ||
    dist(pack.func_149225_f(), Player.getZ()) > 1 ||
    dist(pack.func_149226_e(), Player.getY() + 1) > 3
  ) return;

  const r = pack.func_149221_g();
  const g = pack.func_149224_h();
  const b = pack.func_149223_i();
  if (r !== 1) return;
  if (
    (b === 1 && g === 1) ||
    (b === 0 && compareFloat(g, 0.6) === 0)
  ) cancel(evn);
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles);

export function init() { }
export function load() {
  partSpawnReg.register();
}
export function unload() {
  partSpawnReg.unregister();
}