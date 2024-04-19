import settings from '../settings';
import { drawBoxPos } from '../util/draw';
import { reg } from '../util/registerer';

let c;
function updateColor() {
  c = new (Java.type('java.awt.Color'))(((settings.boxAllEntitiesColor & 0xFF) << 24) | settings.boxAllEntitiesColor >> 8, true);
};
updateColor();
const renderReg = reg('renderEntity', (ent, pos, part) => {
  drawBoxPos(pos.getX(), pos.getY(), pos.getZ(), ent.getWidth(), ent.getHeight(), c, part, settings.boxAllEntitiesEsp, false);
});

export function init() {
  updateColor();
  settings._boxAllEntitiesColor.onAfterChange(() => updateColor());
}
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}