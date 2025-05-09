import { DefaultVertexFormats } from '../../Apelles/index';
import settings from '../settings';
import { _drawArc, tess, worldRen } from '../util/draw';
import glStateManager from '../util/glStateManager';
import reg from '../util/registerer';

const renderReg = reg('renderCrosshair', evn => {
  cancel(evn);

  if (!settings.crosshairRenderInGui && Client.currentGui.get()) return;

  glStateManager.enableBlend();
  glStateManager.enableAlpha();
  glStateManager.disableTexture2D();
  GL11.glLineWidth(settings.crosshairBreadth);
  GL11.glEnable(GL11.GL_LINE_SMOOTH);

  if (settings.crosshairInvert) {
    glStateManager.tryBlendFuncSeparate(775, 0, 1, 0);
    glStateManager.color(1, 1, 1, 1);
  } else {
    const r = ((settings.crosshairColor >> 24) & 0xFF) / 255;
    const g = ((settings.crosshairColor >> 16) & 0xFF) / 255;
    const b = ((settings.crosshairColor >> 8) & 0xFF) / 255;
    const a = ((settings.crosshairColor >> 0) & 0xFF) / 255;
    glStateManager.color(r, g, b, a);
    glStateManager.tryBlendFuncSeparate(770, 771, 1, 0);
  }

  const w = settings.crosshairWidth;
  glStateManager.pushMatrix();
  glStateManager.translate(Renderer.screen.getWidth() / 2, Renderer.screen.getHeight() / 2, 0);
  switch (settings.crosshairType) {
    case '+':
      worldRen.func_181668_a(1, DefaultVertexFormats.field_181705_e);
      worldRen.func_181662_b(-w, 0, 0).func_181675_d();
      worldRen.func_181662_b(w, 0, 0).func_181675_d();
      worldRen.func_181662_b(0, -w, 0).func_181675_d();
      worldRen.func_181662_b(0, w, 0).func_181675_d();
      tess.func_78381_a();
      break;
    case 'X':
      worldRen.func_181668_a(1, DefaultVertexFormats.field_181705_e);
      worldRen.func_181662_b(-w, -w, 0).func_181675_d();
      worldRen.func_181662_b(w, w, 0).func_181675_d();
      worldRen.func_181662_b(-w, w, 0).func_181675_d();
      worldRen.func_181662_b(w, -w, 0).func_181675_d();
      tess.func_78381_a();
      break;
    case '/\\':
      worldRen.func_181668_a(3, DefaultVertexFormats.field_181705_e);
      worldRen.func_181662_b(-w, w, 0).func_181675_d();
      worldRen.func_181662_b(0, 0, 0).func_181675_d();
      worldRen.func_181662_b(w, w, 0).func_181675_d();
      tess.func_78381_a();
      break;
    case 'O':
      _drawArc(0, 0, w, 0, 2 * Math.PI, 20);
      break;
    case '.': {
      worldRen.func_181668_a(6, DefaultVertexFormats.field_181705_e);
      worldRen.func_181662_b(0, 0, 0).func_181675_d();
      const segments = 20;
      const da = 2 * Math.PI / segments;
      for (let i = 0; i <= segments; i++) {
        let a = da * i;
        worldRen.func_181662_b(Math.cos(a) * w, -Math.sin(a) * w, 0).func_181675_d();
      }
      tess.func_78381_a();
      break;
    }
  }

  glStateManager.popMatrix();
  glStateManager.disableBlend();
  glStateManager.enableTexture2D();
  GL11.glLineWidth(1);
  GL11.glDisable(GL11.GL_LINE_SMOOTH);
});

export function init() { }
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}