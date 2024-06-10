import settings from '../settings';
import { JavaColorWrapper, drawBoxPos, rgbaToJavaColor } from '../util/draw';
import reg from '../util/registerer';

let c = new JavaColorWrapper(settings._boxAllEntitiesColor);
const renderReg = reg('renderEntity', (ent, pos, part) => {
  drawBoxPos(pos.getX(), pos.getY(), pos.getZ(), ent.getWidth(), ent.getHeight(), c.get(), part, settings.boxAllEntitiesEsp, false);
}, 'boxallentities');

export function init() { }
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}