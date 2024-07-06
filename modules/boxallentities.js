import settings from '../settings';
import { renderOutline } from '../util/draw';
import reg from '../util/registerer';

const renderReg = reg('postRenderEntity', (ent, pos, part) => {
  renderOutline(pos.getX(), pos.getY(), pos.getZ(), ent.getWidth(), ent.getHeight(), settings.boxAllEntitiesColor, settings.boxAllEntitiesEsp, true, undefined, true);
}, 'boxallentities');

export function init() { }
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}