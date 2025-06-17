import settings from '../../settings';
import reg from '../../util/registerer';
import { registerListenIsland, stateIsland } from '../../util/skyblock';
import { StateProp, StateVar } from '../../util/state';

const stateEnabled = new StateProp(stateIsland).equals('Dungeon Hub').and(settings._dungeonDHubHighlightLow);
const stateInGui = new StateVar(0);

const guiOpenReg = reg('packetReceived', pack => {
  stateInGui.set(pack.func_148902_e() === 'minecraft:chest' && pack.func_179840_c().func_150260_c() === 'Dungeon Hub Selector' ? pack.func_148901_c() : 0);
}).setFilteredClass(net.minecraft.network.play.server.S2DPacketOpenWindow).setEnabled(stateEnabled);
const windowItemsReg = reg('packetReceived', pack => {
  if (pack.func_148911_c() !== stateInGui.get()) return;

  const items = pack.func_148910_d();
  let minC = Number.POSITIVE_INFINITY;
  let minI = -1;
  for (let y = 1; y <= 4; y++) {
    for (let x = 1; x <= 7; x++) {
      let i = y * 9 + x;
      let item = items[i];
      let tag = item.func_77978_p().func_74775_l('display');
      let lore = tag.func_150295_c('Lore', 8);
      let players = lore.func_150307_f(0);
      let m = players.match(/^§7Players: (\d+)\/(\d+)$/);
      if (!m) continue;

      let min = +m[1];
      let max = +m[2];
      if (min >= max) continue;
      if (min < minC) {
        minC = min;
        minI = i;
      }
    }
  }

  if (minI >= 0) {
    items[minI].func_150996_a(net.minecraft.item.Item.func_150899_d(133));
    items[minI].func_77964_b(0);
  }
}).setFilteredClass(net.minecraft.network.play.server.S30PacketWindowItems).setEnabled(stateEnabled.and(stateInGui));
const guiCloseReg = reg('guiClosed', () => stateInGui.set(0)).setEnabled(stateEnabled.and(stateInGui));

export function init() {
  settings._dungeonDHubHighlightLow.listen(() => stateInGui.set(0));
  registerListenIsland(settings._dungeonDHubHighlightLow);

  guiOpenReg.register();
  windowItemsReg.register();
  guiCloseReg.register();
}