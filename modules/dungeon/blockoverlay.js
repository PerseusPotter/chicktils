import settings from '../../settings';
import { worldRen, tess } from '../../util/draw';
import reg from '../../util/registerer';
import { rescale } from '../../util/math';
import { StateProp } from '../../util/state';
import glStateManager from '../../util/glStateManager';
import { DefaultVertexFormats } from '../../../Apelles/index';

let canUseStencil = false;
const TextureMap = Java.type('net.minecraft.client.renderer.texture.TextureMap');
const floatBuf = org.lwjgl.BufferUtils.createFloatBuffer(16);
const matrix = new (Java.type('org.lwjgl.util.vector.Matrix4f'))();
const overlayReg = reg(net.minecraftforge.client.event.RenderBlockOverlayEvent, evn => {
  cancel(evn);

  if (settings.dungeonBlockOverlaySize === 0) return;

  const s = 1 - settings.dungeonBlockOverlaySize;
  const atlas = Client.getMinecraft().func_175602_ab().func_175023_a().func_178122_a(evn.blockForOverlay);
  Client.getMinecraft().func_110434_K().func_110577_a(TextureMap.field_110575_b);
  glStateManager.color(0.1, 0.1, 0.1, 0.5);
  const minU = atlas.func_94209_e();
  const maxU = atlas.func_94212_f();
  const minV = atlas.func_94206_g();
  const maxV = atlas.func_94210_h();

  glStateManager.pushMatrix();
  GL11.glGetFloat(GL11.GL_PROJECTION_MATRIX, floatBuf);
  matrix.load(floatBuf);
  matrix.invert();
  floatBuf.clear();
  matrix.store(floatBuf);

  glStateManager.loadIdentity();
  floatBuf.flip();
  GL11.glMultMatrix(floatBuf);

  if (canUseStencil) {
    GL11.glEnable(GL11.GL_STENCIL_TEST);
    GL11.glClearStencil(0);
    GL11.glStencilMask(0xFF);
    glStateManager.clear(GL11.GL_STENCIL_BUFFER_BIT);
    glStateManager.colorMask(false, false, false, false);
    GL11.glStencilFunc(GL11.GL_ALWAYS, 1, 0xFF);
    GL11.glStencilOp(GL11.GL_REPLACE, GL11.GL_REPLACE, GL11.GL_REPLACE);

    worldRen.func_181668_a(7, DefaultVertexFormats.field_181705_e);
    worldRen.func_181662_b(-s, -s, -0.5).func_181675_d();
    worldRen.func_181662_b(s, -s, -0.5).func_181675_d();
    worldRen.func_181662_b(s, s, -0.5).func_181675_d();
    worldRen.func_181662_b(-s, s, -0.5).func_181675_d();
    tess.func_78381_a();

    GL11.glStencilFunc(GL11.GL_NOTEQUAL, 1, 0xFF);
    GL11.glStencilOp(GL11.GL_KEEP, GL11.GL_KEEP, GL11.GL_KEEP);
    glStateManager.colorMask(true, true, true, true);

    worldRen.func_181668_a(7, DefaultVertexFormats.field_181707_g);
    worldRen.func_181662_b(-1, -1, -0.5).func_181673_a(maxU, maxV).func_181675_d();
    worldRen.func_181662_b(1, -1, -0.5).func_181673_a(minU, maxV).func_181675_d();
    worldRen.func_181662_b(1, 1, -0.5).func_181673_a(minU, minV).func_181675_d();
    worldRen.func_181662_b(-1, 1, -0.5).func_181673_a(maxU, minV).func_181675_d();
    tess.func_78381_a();

    GL11.glDisable(GL11.GL_STENCIL_TEST);
  } else {
    const u = x => rescale(x, -1, 1, minU, maxU);
    const v = x => rescale(x, -1, 1, minV, maxV);
    const p = (x, y) => worldRen.func_181662_b(x, y, -0.5).func_181673_a(u(x), v(y)).func_181675_d();
    worldRen.func_181668_a(7, DefaultVertexFormats.field_181707_g);
    p(-1, -1);
    p(1, -1);
    p(1, -s);
    p(-1, -s);

    p(-1, -s);
    p(-s, -s);
    p(-s, s);
    p(-1, s);

    p(s, -s);
    p(1, -s);
    p(1, s);
    p(s, s);

    p(-1, s);
    p(1, s);
    p(1, 1);
    p(-1, 1);
    tess.func_78381_a();
  }

  glStateManager.color(1, 1, 1, 1);
  glStateManager.popMatrix();
}).setEnabled(new StateProp(settings._dungeonBlockOverlaySize).notequals(1));

export function init() {
  settings._dungeonBlockOverlaySize.listen(v => {
    if (v === 0 || v === 1) return;
    const fb = Client.getMinecraft().func_147110_a();
    canUseStencil = fb.isStencilEnabled();
    // canUseStencil = fb.isStencilEnabled() || fb.enableStencil();
  });
}
export function start() {
  overlayReg.register();
}
export function reset() {
  overlayReg.unregister();
}