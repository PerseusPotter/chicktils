import settings from '../settings';
import { renderOutline } from '../util/draw';
import reg from '../util/registerer';
import { StateProp } from '../util/state';

const renderReg1 = reg('postRenderEntity', (ent, pos, part) => {
  renderOutline(pos.getX(), pos.getY(), pos.getZ(), Math.max(ent.getWidth(), 0.1), Math.max(ent.getHeight(), 0.1), settings.boxAllEntitiesColor, settings.boxAllEntitiesEsp, true, undefined, true);
}, 'boxallentities').setEnabled(new StateProp(settings._boxAllEntitiesInvis).not());
let ents = [];
const tickReg = reg('tick', () => ents = World.getAllEntities(), 'boxallentities').setEnabled(settings._boxAllEntitiesInvis);
const renderReg2 = reg('renderWorld', () => {
  ents.forEach(e => renderOutline(
    e.getRenderX(), e.getRenderY(), e.getRenderZ(),
    Math.max(e.getWidth(), 0.1), Math.max(e.getHeight(), 0.1),
    settings.boxAllEntitiesColor, settings.boxAllEntitiesEsp
  ));
}, 'boxallentities').setEnabled(settings._boxAllEntitiesInvis);

export function init() {
  settings._boxAllEntitiesInvis.listen(() => ents = []);
}
export function load() {
  renderReg1.register();
  tickReg.register();
  renderReg2.register();
}
export function unload() {
  ents = [];

  renderReg1.unregister();
  tickReg.unregister();
  renderReg2.unregister();
}