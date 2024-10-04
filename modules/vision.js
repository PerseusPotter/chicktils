import reg from '../util/registerer';

const potionReg = reg('packetReceived', (pack, evn) => {
  if (pack.func_149426_d() !== Player.getPlayer().func_145782_y()) return;
  if (pack.func_149427_e() !== 15) return;
  cancel(evn);
}).setFilteredClass(net.minecraft.network.play.server.S1DPacketEntityEffect);

export function init() { }
export function load() {
  potionReg.register();
}
export function unload() {
  potionReg.unregister();
}