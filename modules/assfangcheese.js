import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { colorForNumber, commaNumber } from '../util/format';
import { getMaxHp } from '../util/mc';
import reg from '../util/registerer';
import { StateVar } from '../util/state';
import { unrun } from '../util/threading';

const healthHud = createTextGui(() => data.assfangCheeseLoc, () => ['&250,000,000']);
const stateAssfangEntity = new StateVar();
let ents = [];
const findAssfangReg = reg('step', () => {
  unrun(() => ents = World.getAllEntities());
  const e = ents.find(v => v.getName() === 'Dinnerbone' && getMaxHp(v.entity) === 5E7);
  if (e) stateAssfangEntity.set(new EntityLivingBase(e.entity));
  else stateAssfangEntity.set();
}).setDelay(1);
const renderHealthHud = reg('renderOverlay', () => {
  const ent = stateAssfangEntity.get();
  if (ent.isDead()) {
    stateAssfangEntity.set();
    findAssfangReg.forceTrigger();
    return;
  }
  const hp = ent.getHP();
  healthHud.setLine(colorForNumber(hp, 5E7) + commaNumber(hp));
  healthHud.render();
}).setEnabled(stateAssfangEntity);

export function init() {
  settings._moveAssfangCheese.onAction(v => healthHud.edit(v));
}
export function load() {
  findAssfangReg.register();
  renderHealthHud.register();
}
export function unload() {
  stateAssfangEntity.set(null);
  ents = [];

  findAssfangReg.unregister();
  renderHealthHud.unregister();
}