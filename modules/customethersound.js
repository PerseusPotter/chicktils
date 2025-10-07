import settings from '../settings';
import { setAccessible } from '../util/polyfill';
import reg from '../util/registerer';

const S29PacketSoundEffect$pitch = setAccessible(net.minecraft.network.play.server.S29PacketSoundEffect.class.getDeclaredField('field_149214_f'));

const etherReg = reg('packetReceived', (pack, evn) => {
  if (pack.func_149212_c() !== 'mob.enderdragon.hit') return;
  if (pack.func_149208_g() !== 1) return;
  const pitch = S29PacketSoundEffect$pitch.get(pack);
  if (pitch !== 34) return;

  Client.scheduleTask(() => World.getWorld()?.func_72980_b(
    pack.func_149207_d(), pack.func_149211_e(), pack.func_149210_f(),
    settings.customEtherSoundName,
    settings.customEtherSoundVolume, settings.customEtherSoundPitch,
    false
  ));
  cancel(evn);
}).setFilteredClass(net.minecraft.network.play.server.S29PacketSoundEffect);

export function init() { }
export function load() {
  etherReg.register();
}
export function unload() {
  etherReg.unregister();
}