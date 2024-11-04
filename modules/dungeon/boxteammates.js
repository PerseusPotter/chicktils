import settings from '../../settings';
import { renderOutline } from '../../util/draw';
import reg from '../../util/registerer';
import { getPlayers, registerTrackPlayers } from '../dungeon.js';

const teammates = new (Java.type('java.util.WeakHashMap'))();

const tickReg = reg('tick', () => getPlayers().forEach(v => v.me && teammates.put(v.me, v.class))).setEnabled(settings._dungeonBoxTeammates);
const postRenderReg = reg('postRenderEntity', (ent, pos) => {
  const c = teammates.get(ent.entity);
  if (!c) return;
  const col = settings[`dungeonBoxTeammates${c.slice(0, 4)}Color`] ?? settings.boxAllEntitiesColor;
  renderOutline(pos.getX(), pos.getY(), pos.getZ(), 0.8, 2, col, settings.dungeonBoxTeammatesEsp, true, undefined, true);
}).setFilteredClass(net.minecraft.client.entity.EntityOtherPlayerMP).setEnabled(settings._dungeonBoxTeammates);

export function init() {
  registerTrackPlayers(settings._dungeonBoxTeammates);
}
export function start() {
  teammates.clear();

  tickReg.register();
  postRenderReg.register();
}
export function reset() {
  tickReg.unregister();
  postRenderReg.unregister();
}