import settings from '../settings';
import { DefaultVertexFormats, getRenderX, getRenderY, getRenderZ, tess, worldRen } from '../util/draw';
import glStateManager from '../util/glStateManager';
import reg from '../util/registerer';

const MovingObjectTypeBLOCK = Java.type('net.minecraft.util.MovingObjectPosition').MovingObjectType.BLOCK;
const MaterialAir = Java.type('net.minecraft.block.material.Material').field_151579_a;
const renderReg = reg('drawBlockHighlight', (pos, evn) => {
  cancel(evn);

  if (evn.subID !== 0) return;
  if (evn.target.field_72313_a !== MovingObjectTypeBLOCK) return;

  const w = World.getWorld();
  const blockPos = evn.target.func_178782_a();
  const block = w.func_180495_p(blockPos).func_177230_c();

  if (block.func_149688_o() === MaterialAir) return;
  if (!w.func_175723_af().func_177746_a(blockPos)) return;

  block.func_180654_a(w, blockPos);
  const aabb = block.func_180646_a(w, blockPos).func_72314_b(0.002, 0.002, 0.002).func_72317_d(-getRenderX(), -getRenderY(), -getRenderZ());

  glStateManager.enableBlend();
  glStateManager.tryBlendFuncSeparate(770, 771, 1, 0);
  GL11.glLineWidth(settings.blockHighlightWireWidth);
  glStateManager.disableTexture2D();
  glStateManager.depthMask(false);

  const x = aabb.field_72340_a;
  const y = aabb.field_72338_b;
  const z = aabb.field_72339_c;
  const wx = aabb.field_72336_d - aabb.field_72340_a;
  const h = aabb.field_72337_e - aabb.field_72338_b;
  const wz = aabb.field_72334_f - aabb.field_72339_c;

  let r = ((settings.blockHighlightFillColor >> 24) & 0xFF) / 255;
  let g = ((settings.blockHighlightFillColor >> 16) & 0xFF) / 255;
  let b = ((settings.blockHighlightFillColor >> 8) & 0xFF) / 255;
  let a = ((settings.blockHighlightFillColor >> 0) & 0xFF) / 255;

  if (a > 0) {
    glStateManager.color(r, g, b, a);

    worldRen.func_181668_a(5, DefaultVertexFormats.field_181705_e);
    worldRen.func_181662_b(x, y, z).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z).func_181675_d();
    worldRen.func_181662_b(x, y, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z + wz).func_181675_d();
    worldRen.func_181662_b(x, y + h, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y + h, z + wz).func_181675_d();
    worldRen.func_181662_b(x, y + h, z).func_181675_d();
    worldRen.func_181662_b(x + wx, y + h, z).func_181675_d();
    worldRen.func_181662_b(x, y, z).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z).func_181675_d();
    tess.func_78381_a();
    worldRen.func_181668_a(7, DefaultVertexFormats.field_181705_e);
    worldRen.func_181662_b(x, y, z).func_181675_d();
    worldRen.func_181662_b(x, y, z + wz).func_181675_d();
    worldRen.func_181662_b(x, y + h, z + wz).func_181675_d();
    worldRen.func_181662_b(x, y + h, z).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y + h, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y + h, z).func_181675_d();
    tess.func_78381_a();
  }

  r = ((settings.blockHighlightWireColor >> 24) & 0xFF) / 255;
  g = ((settings.blockHighlightWireColor >> 16) & 0xFF) / 255;
  b = ((settings.blockHighlightWireColor >> 8) & 0xFF) / 255;
  a = ((settings.blockHighlightWireColor >> 0) & 0xFF) / 255;

  if (a > 0) {
    glStateManager.color(r, g, b, a);
    GL11.glEnable(GL11.GL_LINE_SMOOTH);

    worldRen.func_181668_a(2, DefaultVertexFormats.field_181705_e);
    worldRen.func_181662_b(x, y, z).func_181675_d();
    worldRen.func_181662_b(x, y, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z).func_181675_d();
    tess.func_78381_a();
    worldRen.func_181668_a(2, DefaultVertexFormats.field_181705_e);
    worldRen.func_181662_b(x, y + h, z).func_181675_d();
    worldRen.func_181662_b(x, y + h, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y + h, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y + h, z).func_181675_d();
    tess.func_78381_a();
    worldRen.func_181668_a(1, DefaultVertexFormats.field_181705_e);
    worldRen.func_181662_b(x, y, z).func_181675_d();
    worldRen.func_181662_b(x, y + h, z).func_181675_d();
    worldRen.func_181662_b(x, y, z + wz).func_181675_d();
    worldRen.func_181662_b(x, y + h, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y + h, z + wz).func_181675_d();
    worldRen.func_181662_b(x + wx, y, z).func_181675_d();
    worldRen.func_181662_b(x + wx, y + h, z).func_181675_d();
    tess.func_78381_a();

    GL11.glDisable(GL11.GL_LINE_SMOOTH);
  }

  glStateManager.depthMask(true);
  glStateManager.enableTexture2D();
  glStateManager.disableBlend();
});

export function init() { }
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}