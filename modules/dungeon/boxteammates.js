import settings from '../../settings';
import { renderOutline } from '../../util/draw';
import reg from '../../util/registerer';
import { getPlayers, registerTrackPlayers } from '../dungeon.js';

const postRenderReg = reg('postRenderEntity', (ent, pos) => {
  const p = getPlayers().find(v => v.me === ent.entity);
  if (!p) return;
  const c = settings[`dungeonBoxTeammates${p.class.slice(0, 4)}Color`] ?? settings.boxAllEntitiesColor;
  renderOutline(pos.getX(), pos.getY(), pos.getZ(), 0.8, 2, c, settings.dungeonBoxTeammatesEsp, true, undefined, true);
}).setFilteredClass(net.minecraft.client.entity.EntityOtherPlayerMP).setEnabled(settings._dungeonBoxTeammates);

export function init() {
  registerTrackPlayers(settings._dungeonBoxTeammates);
}
export function start() {
  postRenderReg.register();
}
export function reset() {
  postRenderReg.unregister();
}