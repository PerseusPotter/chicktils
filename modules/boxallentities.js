import settings from '../settings';
import { drawBoxPos, rgbToJavaColor } from '../util/draw';
import reg from '../util/registerer';

let c;
function updateColor() {
  c = rgbToJavaColor(settings.boxAllEntitiesColor);
};
updateColor();
const renderReg = reg('renderEntity', (ent, pos, part) => {
  drawBoxPos(pos.getX(), pos.getY(), pos.getZ(), ent.getWidth(), ent.getHeight(), c, part, settings.boxAllEntitiesEsp, false);
});

export function init() {
  settings._boxAllEntitiesColor.onAfterChange(() => updateColor());
}
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}