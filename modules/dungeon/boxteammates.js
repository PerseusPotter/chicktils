import settings from '../../settings';
import { drawBoxAtBlockNotVisThruWalls, drawBoxAtBlock } from '../../util/draw';
import reg from '../../util/registerer';
import { getPlayers, registerTrackPlayers } from '../dungeon.js';

const renderWorldReg = reg('renderWorld', () => {
  getPlayers().forEach(v => {
    if (!v.e) return;
    if (v.e === Player) {
      if (!settings.dungeonBoxTeammatesBoxSelf) return;
      if (Client.settings.getSettings().field_74320_O === 0) return;
    } else if (v.e.isDead()) return;
    const x = v.e.getRenderX();
    const y = v.e.getRenderY();
    const z = v.e.getRenderZ();
    const c = settings[`dungeonBoxTeammates${v.class.slice(0, 4)}Color`] ?? settings.boxAllEntitiesColor;
    const r = ((c >> 24) & 0xFF) / 256;
    const g = ((c >> 16) & 0xFF) / 256;
    const b = ((c >> 8) & 0xFF) / 256;
    const a = ((c >> 0) & 0xFF) / 256;
    if (settings.dungeonBoxTeammatesEsp) drawBoxAtBlock(x - 0.4, y, z - 0.4, r, g, b, 0.8, 2, a, 5);
    else drawBoxAtBlockNotVisThruWalls(x - 0.4, y, z - 0.4, r, g, b, 0.8, 2, a, 5);
  });
}, 'dungeon/boxteammates').setEnabled(settings._dungeonBoxTeammates);
export function init() {
  registerTrackPlayers(settings._dungeonBoxTeammates);
}
export function start() {
  renderWorldReg.register();
}
export function reset() {
  renderWorldReg.unregister();
}