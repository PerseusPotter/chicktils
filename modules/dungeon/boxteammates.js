import { renderBoxOutline } from '../../../Apelles/index';
import settings from '../../settings';
import reg from '../../util/registerer';
import { getPlayers, registerTrackPlayers } from '../dungeon.js';

const renderReg = reg('renderWorld', () => {
  getPlayers().forEach(p => {
    if (p.e === Player) return;
    if (p.e.isDead()) return;
    const col = settings[`dungeonBoxTeammates${p['class'].slice(0, 4)}Color`] ?? settings.boxAllEntitiesColor;
    renderBoxOutline(
      col,
      p.e.getRenderX(), p.e.getRenderY(), p.e.getRenderZ(),
      0.8, 2,
      { phase: settings.dungeonBoxTeammatesEsp, lw: 3 }
    )
  });
}).setEnabled(settings._dungeonBoxTeammates);

export function init() {
  registerTrackPlayers(settings._dungeonBoxTeammates);
}
export function start() {
  renderReg.register();
}
export function reset() {
  renderReg.unregister();
}