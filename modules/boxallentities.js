import { getRenderX, getRenderY, getRenderZ, renderBillboardString, renderBoxOutline } from '../../Apelles/index';
import settings from '../settings';
import { rm } from '../util/draw';
import { setAccessible } from '../util/polyfill';
import reg from '../util/registerer';
import { StateProp } from '../util/state';

const canRenderNameF = setAccessible(Java.type('net.minecraft.client.renderer.entity.Render').class.getDeclaredMethod('func_177070_b', net.minecraft.entity.Entity.class));
const whitelist = new Set();
const blacklist = new Set();
function renderEntity(e, c, x, y, z, w, h, nt, isTE) {
  if (whitelist.size && !whitelist.has(c)) return;
  if (blacklist.size && blacklist.has(c)) return;
  renderBoxOutline(
    settings.boxAllEntitiesColor,
    x + (nt ? getRenderX() : 0), y + (nt ? getRenderY() : 0), z + (nt ? getRenderZ() : 0),
    Math.max(w, 0.1), Math.max(h, 0.1),
    { phase: settings.boxAllEntitiesEsp, lw: 3 }
  );
  if (settings.boxAllEntitiesName && !isTE) {
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
    c,
    x + (nt ? getRenderX() : 0), y + (nt ? getRenderY() : 0) + h + 0.2, z + (nt ? getRenderZ() : 0),
    { phase: settings.boxAllEntitiesEsp }
  );
  if (settings.boxAllEntitiesEntityId && !isTE) renderBillboardString(
    0xFFFFFFFF,
    e.entity.func_145782_y(),
    x + (nt ? getRenderX() : 0), y + (nt ? getRenderY() : 0) + h - 0.1, z + (nt ? getRenderZ() : 0),
    { phase: settings.boxAllEntitiesEsp }
  );
}

const renderReg1a = reg('postRenderEntity', (ent, pos, part) => renderEntity(
  ent,
  ent.getClassName(),
  pos.getX(), pos.getY(), pos.getZ(),
  ent.getWidth(), ent.getHeight(),
  true, false
)).setEnabled(new StateProp(settings._boxAllEntitiesInvis).not());
const renderReg1b = reg('postRenderTileEntity', (ent, pos, part) => renderEntity(
  ent,
  ent.getTileEntity().getClass().getSimpleName(),
  pos.getX() + 0.5, pos.getY(), pos.getZ() + 0.5,
  1, 1,
  true, true
)).setEnabled(new StateProp(settings._boxAllEntitiesInvis).not().and(settings._boxAllEntitiesTileEntities));
/** @type {Entity[]} */
let ents1 = [];
/** @type {TileEntity[]} */
let ents2 = [];
const tickReg = reg('tick', () => {
  ents1 = World.getAllEntities();
  if (settings.boxAllEntitiesTileEntities) ents2 = World.getAllTileEntities();
}).setEnabled(settings._boxAllEntitiesInvis);
const renderReg2 = reg('renderWorld', () => {
  ents1.forEach(e => renderEntity(
    e,
    e.getClassName(),
    e.getRenderX(), e.getRenderY(), e.getRenderZ(),
    e.getWidth(), e.getHeight(),
    false, false
  ));
  if (settings.boxAllEntitiesTileEntities) ents2.forEach(e => renderEntity(
    e,
    e.getTileEntity().getClass().getSimpleName(),
    e.getX() + 0.5, e.getY(), e.getZ() + 0.5,
    1, 1,
    false, true
  ));
}).setEnabled(settings._boxAllEntitiesInvis);

export function init() {
  settings._boxAllEntitiesInvis.listen(() => ents1 = []);
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
  renderReg1a.register();
  renderReg1b.register();
  tickReg.register();
  renderReg2.register();
}
export function unload() {
  ents1 = [];
  ents2 = [];

  renderReg1a.unregister();
  renderReg1b.unregister();
  tickReg.unregister();
  renderReg2.unregister();
}