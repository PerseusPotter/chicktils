import settings from '../settings';
import { drawOutline } from '../util/draw';
import reg from '../util/registerer';

const renderReg = reg('renderEntity', (ent, pos, part) => {
  drawOutline(pos.getX(), pos.getY(), pos.getZ(), ent.getWidth(), ent.getHeight(), settings.boxAllEntitiesColor, settings.boxAllEntitiesEsp, false);
}, 'boxallentities');

export function init() { }
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}