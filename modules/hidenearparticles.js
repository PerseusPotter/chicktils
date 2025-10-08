import settings from '../settings';
import { getEyeHeight } from '../util/mc';
import reg from '../util/registerer';

const particleReg = reg('spawnParticle', (part, id, evn) => {
  const p = Player.getPlayer();
  if (!p) return;

  const dx = Player.getX() - part.getX();
  const dy = Player.getY() + getEyeHeight(p) - part.getY();
  const dz = Player.getZ() - part.getZ();
  if (dx ** 2 + dy ** 2 + dz ** 2 > settings.hideNearParticlesDistance ** 2) return;

  cancel(evn);
});

export function init() { }
export function load() {
  particleReg.register();
}
export function unload() {
  particleReg.unregister();
}