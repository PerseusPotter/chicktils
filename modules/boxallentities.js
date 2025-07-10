import { getRenderX, getRenderY, getRenderZ, renderBillboardString, renderBoxOutline } from '../../Apelles/index';
import settings from '../settings';
import { rm } from '../util/draw';
import { setAccessible } from '../util/polyfill';
import reg from '../util/registerer';
import { StateProp } from '../util/state';

const canRenderNameF = setAccessible(Java.type('net.minecraft.client.renderer.entity.Render').class.getDeclaredMethod('func_177070_b', net.minecraft.entity.Entity.class));
const whitelist = new Set();
const blacklist = new Set();
function renderEntity(e, x, y, z, w, h, nt) {
  const c = e.getClassName();
  if (whitelist.size && !whitelist.has(c)) return;
  if (blacklist.size && blacklist.has(c)) return;
  renderBoxOutline(
    settings.boxAllEntitiesColor,
    x + (nt ? getRenderX() : 0), y + (nt ? getRenderY() : 0), z + (nt ? getRenderZ() : 0),
    Math.max(w, 0.1), Math.max(h, 0.1),
    { phase: settings.boxAllEntitiesEsp, lw: 3 }
  );
  if (settings.boxAllEntitiesName) {
    const rc = rm.func_78713_a(e.entity);
    if (!canRenderNameF.invoke(rc, e.entity)) renderBillboardString(
      0xFFFFFFFF,
      e.getName(),
      x + (nt ? getRenderX() : 0), y + (nt ? getRenderY() : 0) + h + 0.5, z + (nt ? getRenderZ() : 0),
      { scale: 1.5, phase: settings.boxAllEntitiesEsp }
    );
  }
  if (settings.boxAllEntitiesClassName) renderBillboardString(
    0xFFFFFFFF,
    e.getClassName(),
    x + (nt ? getRenderX() : 0), y + (nt ? getRenderY() : 0) + h + 0.2, z + (nt ? getRenderZ() : 0),
    { phase: settings.boxAllEntitiesEsp }
  );
  if (settings.boxAllEntitiesEntityId) renderBillboardString(
    0xFFFFFFFF,
    e.entity.func_145782_y(),
    x + (nt ? getRenderX() : 0), y + (nt ? getRenderY() : 0) + h - 0.1, z + (nt ? getRenderZ() : 0),
    { phase: settings.boxAllEntitiesEsp }
  );
}

const renderReg1 = reg('postRenderEntity', (ent, pos, part) => renderEntity(
  ent,
  pos.getX(), pos.getY(), pos.getZ(),
  ent.getWidth(), ent.getHeight(),
  true
)).setEnabled(new StateProp(settings._boxAllEntitiesInvis).not());
let ents = [];
const tickReg = reg('tick', () => ents = World.getAllEntities()).setEnabled(settings._boxAllEntitiesInvis);
const renderReg2 = reg('renderWorld', () => {
  ents.forEach(e => renderEntity(
    e,
    e.getRenderX(), e.getRenderY(), e.getRenderZ(),
    e.getWidth(), e.getHeight(),
    false
  ));
}).setEnabled(settings._boxAllEntitiesInvis);

export function init() {
  settings._boxAllEntitiesInvis.listen(() => ents = []);
  settings._boxAllEntitiesWhitelist.listen(v => {
    whitelist.clear();
    if (!v) return;
    v.split(',').forEach(c => whitelist.add(c));
  });
  settings._boxAllEntitiesBlacklist.listen(v => {
    blacklist.clear();
    if (!v) return;
    v.split(',').forEach(c => blacklist.add(c));
  });
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