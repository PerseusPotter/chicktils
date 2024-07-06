import { compareFloat, getAngle, lerp, rescale, rotate, toArray } from './math';
import _drawBeaconBeam from '../../BeaconBeam/index';
import { getEyeHeight } from './mc';

const tess = Java.type('net.minecraft.client.renderer.Tessellator').func_178181_a();
const worldRen = tess.func_178180_c();
const DefaultVertexFormats = Java.type('net.minecraft.client.renderer.vertex.DefaultVertexFormats');
const rm = Renderer.getRenderManager();
const xa = rm.class.getDeclaredField('field_78725_b'); xa.setAccessible(true);
const ya = rm.class.getDeclaredField('field_78726_c'); ya.setAccessible(true);
const za = rm.class.getDeclaredField('field_78723_d'); za.setAccessible(true);
/**
 * @type {() => number}
 */
export function getRenderX() { return xa.get(rm); };
/**
 * @type {() => number}
 */
export function getRenderY() { return ya.get(rm); };
/**
 * @type {() => number}
 */
export function getRenderZ() { return za.get(rm); };
function getXMult() {
  return Client.settings.getSettings().field_74320_O === 2 ? -1 : 1;
}
function getYaw() {
  const p = Player.getPlayer();
  if (!p) return 0;
  return p.field_70126_B + (p.field_70177_z - p.field_70126_B) * Tessellator.partialTicks;
}
function getPitch() {
  const p = Player.getPlayer();
  if (!p) return 0;
  return p.field_70127_C + (p.field_70125_A - p.field_70127_C) * Tessellator.partialTicks;
}

/**
 * in radians
 * @param {number} color rgba
 * @param {number} theta radians
 * @param {number?} length (20)
 * @param {number?} yaw degrees
 */
export function drawArrow2D(color, theta, length = 20, yaw) {
  if ((color & 0xFF) === 0) return;
  if (yaw === undefined) yaw = getYaw();
  const dt = theta - yaw / 180 * Math.PI - Math.PI/* + (getXMult() === 1 ? -Math.PI : 0)*/;
  const x1 = Renderer.screen.getWidth() / 2;
  const y1 = Renderer.screen.getHeight() / 2 + length + 10;

  const x2 = x1 + Math.cos(dt) * length;
  const y2 = y1 + Math.sin(dt) * length;
  const c = rgbaToARGB(color);
  Renderer.drawLine(c, x1, y1, x2, y2, 1);
  Renderer.drawLine(c, x2, y2, x2 + Math.cos(dt + Math.PI * 7 / 8) * length / 3, y2 + Math.sin(dt + Math.PI * 7 / 8) * length / 3, 1);
  Renderer.drawLine(c, x2, y2, x2 + Math.cos(dt - Math.PI * 7 / 8) * length / 3, y2 + Math.sin(dt - Math.PI * 7 / 8) * length / 3, 1);
}

/**
 * @param {number} color rgba
 * @param {number} theta radians
 * @param {number} phi radians
 * @param {number?} scale (3)
 * @param {number?} yaw degrees
 * @param {number?} pitch degrees
 */
export function drawArrow3D(color, theta, phi, scale = 3, yaw, pitch) {
  if ((color & 0xFF) === 0) return;
  if (yaw === undefined) yaw = getYaw();
  if (pitch === undefined) pitch = getPitch();
  const dt = theta - yaw / 180 * Math.PI - Math.PI / 2 + (getXMult() === 1 ? 0 : Math.PI);
  const dp = Math.PI - (phi - pitch / 180 * Math.PI);
  let points = [
    [+1, 0, +1],
    [-1, 0, +1],
    [+1, 0, -1],
    [-1, 0, -1],

    [+1, 4, +1],
    [-1, 4, +1],
    [+1, 4, -1],
    [-1, 4, -1],

    [+2, 4, +1],
    [-2, 4, +1],
    [+2, 4, -1],
    [-2, 4, -1],

    [+0, 6, +1],
    [+0, 6, -1]
  ].map(([x, y, z]) => toArray(rotate(x, y, z, dt, dp, 0)));
  /*
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],

    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],

    [4, 6],
    [5, 7],

    [4, 8],
    [5, 9],
    [6, 10],
    [7, 11],

    [8, 10],
    [9, 11],

    [8, 12],
    [9, 12],
    [10, 13],
    [11, 13],
    [12, 13]
  ].map(([p1, p2]) => [Math.max(points[p1][0], points[p2][0]), p1, p2]).sort((a, b) => compareFloat(b[0], a[0]));
  */
  points = points.map(([x, y, z]) => [z * scale + Renderer.screen.getWidth() / 2, y * scale + Renderer.screen.getHeight() / 2 + scale + 10, x]);
  const polys = [
    [0, 1, 2, 3],

    [0, 2, 4, 6],
    [1, 3, 5, 7],
    [0, 1, 4, 5],
    [2, 3, 6, 7],

    [8, 9, 12],
    [10, 11, 13],

    [4, 6, 8, 10],
    [5, 7, 9, 11],

    [8, 10, 12, 13],
    [9, 11, 12, 13]
  ].map(v => v.map(v => points[v]));
  const norms = [
    [0, -1, 0],

    [1, 0, 0],
    [-1, 0, 0],
    [0, 0, 1],
    [0, 0, -1],

    [0, 0, 1],
    [0, 0, -1],

    [0, -1, 0],
    [0, -1, 0],

    [1, 1, 0],
    [-1, 1, 0]
  ].map(([x, y, z]) => toArray(rotate(x, y, z, dt, dp, 0)));
  polys.forEach((v, i) => {
    // rhino :clown:
    // java.lang.ClassCastException
    // ...norms[i]
    const n = norms[i];
    const a = getAngle(...n, -1, 0, 0, false) / Math.PI;
    v.a = 1 - a;
    v.w = Math.min.apply(null, v.map(v => v[2]));
  });
  polys.sort((a, b) => compareFloat(b.w, a.w) || compareFloat(a.a, b.a));
  polys.forEach(v => {
    drawPolygon(applyTint(color, rescale(v.a * v.a * v.a, 0, 1, 0.2, 1)), v);
  });
  // const c2 = (color >> 8) | ((color & 0xFF) << 24);
  // edges.forEach(([w, i, j]) => Renderer.drawLine(c2, points[i][0], points[i][1], points[j][0], points[j][1], 1));
  // points.forEach(([x, y]) => Renderer.drawCircle(c2, x, y, 2, 10));
  // points.forEach(([x, y], i) => Renderer.renderString(i.toString(), x, y));
}

/**
 * @param {number} color rgba
 * @param {number} dx
 * @param {number} dy
 * @param {number} dz
 * @param {boolean?} rel (true)
 * @param {number?} scale (3)
 */
export function drawArrow3DPos(color, dx, dy, dz, rel = true, scale = 3) {
  if (rel) return drawArrow3D(color, Math.atan2(dz, dx), Math.acos(dy / Math.hypot(dx, dy, dz)), scale);
  return drawArrow3DPos(color, dx - getRenderX(), dy - getRenderY(), dz - getRenderZ(), true, scale);
}

/**
 * @param {number} color rgba
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {boolean?} rel (true)
 * @param {number?} lw (3)
 */
export function renderTracer(color, x, y, z, rel = true, lw = 3) {
  if ((color & 0xFF) === 0) return;
  const p = Player.getPlayer();
  if (!p) return;
  if (rel) {
    x += getRenderX();
    y += getRenderY();
    z += getRenderZ();
  }
  const look = p.func_70676_i(Tessellator.partialTicks);
  renderLine3D(color, x, y, z, look.field_72450_a, look.field_72448_b + getEyeHeight(p), look.field_72449_c, lw);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 * @param {number} h
 * @param {number} color rgba
 * @param {boolean?} esp is visible through walls (false)
 * @param {boolean?} center are coordinates already centered (true)
 * @param {number?} lw line width (5)
 * @param {boolean?} nt use if renderentity.pos (false)
 */
export function renderOutline(x, y, z, w, h, color, esp = false, center = true, lw = 5, nt = false) {
  if ((color & 0xFF) === 0) return;
  if (center) {
    x -= w / 2;
    z -= w / 2;
  }
  if (!nt) {
    let s;
    ({ x, y, z, s } = rescaleRender(x, y, z));
    w *= s;
    h *= s;
  }

  const render = Client.getMinecraft().func_175606_aa();
  const realX = lerp(render.field_70142_S, render.field_70165_t, Tessellator.partialTicks);
  const realY = lerp(render.field_70137_T, render.field_70163_u, Tessellator.partialTicks);
  const realZ = lerp(render.field_70136_U, render.field_70161_v, Tessellator.partialTicks);
  GlStateManager.func_179094_E();
  if (!nt) GlStateManager.func_179137_b(-realX, -realY, -realZ);
  GlStateManager.func_179090_x();
  GlStateManager.func_179147_l();
  GlStateManager.func_179140_f();
  GlStateManager.func_179118_c();
  GlStateManager.func_179120_a(770, 771, 1, 0);
  GL11.glLineWidth(lw);
  if (esp) {
    GL11.glDisable(GL11.GL_DEPTH_TEST);
    GL11.glDepthMask(false);
  }

  const r = ((color >> 24) & 0xFF) / 256;
  const g = ((color >> 16) & 0xFF) / 256;
  const b = ((color >> 8) & 0xFF) / 256;
  const a = ((color >> 0) & 0xFF) / 256;
  GlStateManager.func_179131_c(r, g, b, a);

  worldRen.func_181668_a(2, DefaultVertexFormats.field_181705_e);
  worldRen.func_181662_b(x, y, z).func_181675_d();
  worldRen.func_181662_b(x, y, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y, z).func_181675_d();
  tess.func_78381_a();
  worldRen.func_181668_a(2, DefaultVertexFormats.field_181705_e);
  worldRen.func_181662_b(x, y + h, z).func_181675_d();
  worldRen.func_181662_b(x, y + h, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, z).func_181675_d();
  tess.func_78381_a();
  worldRen.func_181668_a(1, DefaultVertexFormats.field_181705_e);
  worldRen.func_181662_b(x, y, z).func_181675_d();
  worldRen.func_181662_b(x, y + h, z).func_181675_d();
  worldRen.func_181662_b(x, y, z + w).func_181675_d();
  worldRen.func_181662_b(x, y + h, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y, z).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, z).func_181675_d();
  tess.func_78381_a();

  if (!nt) GlStateManager.func_179137_b(realX, realY, realZ);
  GlStateManager.func_179084_k();
  GlStateManager.func_179141_d();
  GlStateManager.func_179098_w();
  GlStateManager.func_179131_c(1, 1, 1, 1);
  GlStateManager.func_179121_F();
  GL11.glLineWidth(2);
  if (esp) {
    GL11.glEnable(GL11.GL_DEPTH_TEST);
    GL11.glDepthMask(true);
  }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 * @param {number} h
 * @param {number} color rgba
 * @param {boolean?} esp is visible through walls (false)
 * @param {boolean?} center are coordinates already centered (true)
 * @param {boolean?} nt use if renderentity.pos (false)
 */
export function renderFilledBox(x, y, z, w, h, color, esp = false, center = true, nt = false) {
  if ((color & 0xFF) === 0) return;
  if (center) {
    x -= w / 2;
    z -= w / 2;
  }
  let s;
  ({ x, y, z, s } = rescaleRender(x, y, z));
  w *= s;
  h *= s;

  const render = Client.getMinecraft().func_175606_aa();
  const realX = lerp(render.field_70142_S, render.field_70165_t, Tessellator.partialTicks);
  const realY = lerp(render.field_70137_T, render.field_70163_u, Tessellator.partialTicks);
  const realZ = lerp(render.field_70136_U, render.field_70161_v, Tessellator.partialTicks);

  GL11.glDisable(GL11.GL_CULL_FACE);
  GlStateManager.func_179094_E();
  if (!nt) GlStateManager.func_179137_b(-realX, -realY, -realZ);
  GlStateManager.func_179090_x();
  GlStateManager.func_179147_l();
  GlStateManager.func_179140_f();
  GlStateManager.func_179118_c();
  GlStateManager.func_179120_a(770, 771, 1, 0);
  if (esp) {
    GL11.glDisable(GL11.GL_DEPTH_TEST);
    GL11.glDepthMask(false);
  }

  const r = ((color >> 24) & 0xFF) / 256;
  const g = ((color >> 16) & 0xFF) / 256;
  const b = ((color >> 8) & 0xFF) / 256;
  const a = ((color >> 0) & 0xFF) / 256;
  GlStateManager.func_179131_c(r, g, b, a);

  worldRen.func_181668_a(5, DefaultVertexFormats.field_181705_e);
  worldRen.func_181662_b(x, y, z).func_181675_d();
  worldRen.func_181662_b(x + w, y, z).func_181675_d();
  worldRen.func_181662_b(x, y, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y, z + w).func_181675_d();
  worldRen.func_181662_b(x, y + h, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, z + w).func_181675_d();
  worldRen.func_181662_b(x, y + h, z).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, z).func_181675_d();
  worldRen.func_181662_b(x, y, z).func_181675_d();
  worldRen.func_181662_b(x + w, y, z).func_181675_d();
  tess.func_78381_a();
  worldRen.func_181668_a(7, DefaultVertexFormats.field_181705_e);
  worldRen.func_181662_b(x, y, z).func_181675_d();
  worldRen.func_181662_b(x, y, z + w).func_181675_d();
  worldRen.func_181662_b(x, y + h, z + w).func_181675_d();
  worldRen.func_181662_b(x, y + h, z).func_181675_d();
  worldRen.func_181662_b(x + w, y, z).func_181675_d();
  worldRen.func_181662_b(x + w, y, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, z + w).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, z).func_181675_d();
  tess.func_78381_a();

  if (!nt) GlStateManager.func_179137_b(realX, realY, realZ);
  GlStateManager.func_179084_k();
  GlStateManager.func_179141_d();
  GlStateManager.func_179098_w();
  GlStateManager.func_179131_c(1, 1, 1, 1);
  GlStateManager.func_179121_F();
  GL11.glEnable(GL11.GL_CULL_FACE);
  if (esp) {
    GL11.glEnable(GL11.GL_DEPTH_TEST);
    GL11.glDepthMask(true);
  }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 * @param {number} h
 * @param {number} color rgba
 * @param {boolean?} esp is visible through walls (false)
 * @param {boolean?} center are coordinates already centered (true)
 * @param {number?} lw line width (5)
 */
export function renderWaypoint(x, y, z, w, h, color, esp = false, center = true, lw = 5) {
  if ((color & 0xFF) === 0) return;
  const c = (color & ~0xFF) | ((color & 0xFF) >> 2);
  renderFilledBox(x, y, z, w, h, c, esp, center, lw);
  renderOutline(x, y, z, w, h, color, esp, center, lw);
}

/**
 * @param {number} color rgba
 * @param {number[][]} vertexes [x, y] or [x, y, depth]
 * @link https://github.com/ChatTriggers/ChatTriggers/blob/3aac68d7aa6c3276ae79000306895130c291d85b/src/main/kotlin/com/chattriggers/ctjs/minecraft/libs/renderer/Renderer.kt#L225
 */
export function drawPolygon(color, vertexes) {
  if ((color & 0xFF) === 0) return;
  GlStateManager.func_179147_l();
  GlStateManager.func_179090_x();
  GlStateManager.func_179120_a(770, 771, 1, 0);
  GlStateManager.func_179097_i();
  GlStateManager.func_179129_p();

  GlStateManager.func_179094_E();

  const r = ((color >> 24) & 0xFF) / 256;
  const g = ((color >> 16) & 0xFF) / 256;
  const b = ((color >> 8) & 0xFF) / 256;
  const a = ((color >> 0) & 0xFF) / 256;
  GlStateManager.func_179131_c(r, g, b, a);
  worldRen.func_181668_a(5, DefaultVertexFormats.field_181705_e);

  vertexes.forEach(v => worldRen.func_181662_b(v[0], v[1], v[2] || 0).func_181675_d());
  tess.func_78381_a();
  GlStateManager.func_179121_F();

  GlStateManager.func_179084_k();
  GlStateManager.func_179098_w();
  GlStateManager.func_179126_j();
  GlStateManager.func_179089_o();
}

/**
 * @param {number} c rgba
 * @param {number} a [0, 1]
 * @returns {number} rgba
 */
function applyTint(c, a) {
  // (((( moment, i have 0 trust in bitwise associativity
  return 0 |
    ((((c >> 24) & 0xFF) * a) << 24) |
    ((((c >> 16) & 0xFF) * a) << 16) |
    ((((c >> 8) & 0xFF) * a) << 8) |
    (c & 0xFF);
}

/**
 * @param {number} color rgba
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @param {number?} lw (2)
 */
export function renderLine3D(color, x1, y1, z1, x2, y2, z2, lw = 2) {
  if ((color & 0xFF) === 0) return;
  ({ x: x1, y: y1, z: z1 } = rescaleRender(x1, y1, z1));
  ({ x: x2, y: y2, z: z2 } = rescaleRender(x2, y2, z2));
  const render = Client.getMinecraft().func_175606_aa();
  const realX = lerp(render.field_70142_S, render.field_70165_t, Tessellator.partialTicks);
  const realY = lerp(render.field_70137_T, render.field_70163_u, Tessellator.partialTicks);
  const realZ = lerp(render.field_70136_U, render.field_70161_v, Tessellator.partialTicks);
  GlStateManager.func_179094_E();
  GlStateManager.func_179137_b(-realX, -realY, -realZ);
  GlStateManager.func_179090_x();
  GlStateManager.func_179147_l();
  GlStateManager.func_179140_f();
  GlStateManager.func_179118_c();
  GlStateManager.func_179120_a(770, 771, 1, 0);
  GL11.glLineWidth(lw);

  const r = ((color >> 24) & 0xFF) / 256;
  const g = ((color >> 16) & 0xFF) / 256;
  const b = ((color >> 8) & 0xFF) / 256;
  const a = ((color >> 0) & 0xFF) / 256;
  GlStateManager.func_179131_c(r, g, b, a);
  worldRen.func_181668_a(3, DefaultVertexFormats.field_181705_e);

  worldRen.func_181662_b(x1, y1, z1).func_181675_d();
  worldRen.func_181662_b(x2, y2, z2).func_181675_d();
  tess.func_78381_a();

  GlStateManager.func_179137_b(realX, realY, realZ);
  GlStateManager.func_179084_k();
  GlStateManager.func_179141_d();
  GlStateManager.func_179098_w();
  GlStateManager.func_179131_c(1, 1, 1, 1);
  GlStateManager.func_179121_F();
  GL11.glLineWidth(2);
}

/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number?} color rgba (0xFFFFFFFF)
 * @param {boolean?} renderBlackBox (true)
 * @param {number?} scale (1)
 * @param {boolean?} increase (true)
 */
export function renderString(text, x, y, z, color = 0xFFFFFFFF, renderBlackBox = true, scale = 1, increase = true) {
  if ((color & 0xFF) === 0) return;
  let s;
  ({ x, y, z, s } = rescaleRender(x, y, z));
  scale *= s;
  Tessellator.drawString(text, x, y, z, rgbaToARGB(color), renderBlackBox, scale, increase);
}

/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {boolean?} shadow (false)
 */
export function drawString(text, x, y, shadow = false) {
  text = ChatLib.addColor(text);
  const fr = Renderer.getFontRenderer();
  text.split('\n').forEach(v => {
    fr.func_175065_a(v, x, y, 0xFFFFFFFF | 0, shadow);
    y += fr.field_78288_b;
  });
}

/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 */
export function drawOutlinedString(text, x, y) {
  const bt = '&0' + text;
  drawString(bt, x + 1, y + 0);
  drawString(bt, x - 1, y + 0);
  drawString(bt, x + 0, y + 1);
  drawString(bt, x + 0, y - 1);
  drawString(text, x, y);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} u
 * @param {number} v
 * @param {number} w
 * @param {number} h
 * @param {number} tw
 * @param {number} th
 * @param {number?} uw
 * @param {number?} vh
 * @param {number?} z
 */
export function drawTexturedRect(x, y, u, v, w, h, tw, th, uw, vh) {
  if (!uw) uw = w;
  if (!vh) vh = h;
  const f = 1 / tw;
  const g = 1 / th;
  u *= f;
  v *= g;
  uw *= f;
  vh *= g;
  worldRen.func_181668_a(7, DefaultVertexFormats.field_181707_g);
  worldRen.func_181662_b(x, y + h, 0).func_181673_a(u, v + vh).func_181675_d();
  worldRen.func_181662_b(x + w, y + h, 0).func_181673_a(u + uw, v + vh).func_181675_d();
  worldRen.func_181662_b(x + w, y, 0).func_181673_a(u + uw, v).func_181675_d();
  worldRen.func_181662_b(x, y, 0).func_181673_a(u, v).func_181675_d();
  tess.func_78381_a();
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} color rgba
 * @param {boolean?} esp is visible through walls (false)
 * @param {boolean?} center are coordinates already centered (true)
 * @param {number?} height (300)
 */
export function renderBeaconBeam(x, y, z, color, esp = false, center = true, height = 300) {
  if ((color & 0xFF) === 0) return;
  if (center) {
    x -= 0.5;
    z -= 0.5;
  }
  ({ x, y, z } = rescaleRender(x, y, z));
  _drawBeaconBeam(x, y, z,
    ((color >> 24) & 0xFF) / 256,
    ((color >> 16) & 0xFF) / 256,
    ((color >> 8) & 0xFF) / 256,
    ((color >> 0) & 0xFF) / 256,
    !esp, height
  );
}

/**
 * @param {number} c rgba
 * @returns argb
 */
export function rgbaToARGB(c) {
  return ((c & 0xFF) << 24) | c >> 8;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {{x: number, y: number, z: number, s: number}}
 */
function rescaleRender(x, y, z) {
  const rx = getRenderX();
  const ry = getRenderY() + getEyeHeight();
  const rz = getRenderZ();
  let d = (rx - x) ** 2 + (ry - y) ** 2 + (rz - z) ** 2;

  const rd = Client.settings.video.getRenderDistance() << 4;
  if (d >= rd * rd) {
    d = rd / Math.sqrt(d);
    return {
      x: lerp(rx, x, d),
      y: lerp(ry, y, d),
      z: lerp(rz, z, d),
      s: d
    };
  }
  return { x, y, z, s: 1 };
}

const JColor = Java.type('java.awt.Color');
export function rgbaToJavaColor(c) {
  return new JColor(rgbaToARGB(c), true);
}

export class JavaColorWrapper {
  cache;
  /**
   * @param {import ('../settings').Property} prop
   */
  constructor(prop) {
    this.cache = rgbaToJavaColor(prop.valueOf());
    prop.onAfterChange(v => this.cache = rgbaToJavaColor(v));
  }
  get() {
    return this.cache;
  }
}