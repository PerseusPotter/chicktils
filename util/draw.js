import RenderLib from '../../RenderLib/index';
import { compareFloat, getAngle, lerp, rescale, rotate, toArray } from './math';
import RenderLib2D from '../../RenderLib2D/index';
import _drawBeaconBeam from '../../BeaconBeam/index';
import settings from '../settings';
if (!GlStateManager) {
  var GL11 = Java.type("org.lwjgl.opengl.GL11");
  var GlStateManager = Java.type("net.minecraft.client.renderer.GlStateManager");
}
const tess = Java.type('net.minecraft.client.renderer.Tessellator').func_178181_a();
const worldRen = tess.func_178180_c();

// soopy !
export function drawBoxAtBlockNotVisThruWalls(x, y, z, colorR, colorG, colorB, w = 1, h = 1, a = 1, lw = 5) {
  ({ x, y, z } = rescaleRender(x, y, z));
  GL11.glBlendFunc(770, 771);
  GL11.glEnable(GL11.GL_BLEND);
  GL11.glLineWidth(lw);
  GL11.glDisable(GL11.GL_TEXTURE_2D);
  GlStateManager.func_179094_E();

  x -= 0.005;
  y -= 0.005;
  z -= 0.005;
  w += 0.01;
  h += 0.01;

  Tessellator.begin(GL11.GL_LINE_STRIP).colorize(colorR, colorG, colorB, a);

  Tessellator.pos(x + w, y + h, z + w);
  Tessellator.pos(x + w, y + h, z);
  Tessellator.pos(x, y + h, z);
  Tessellator.pos(x, y + h, z + w);
  Tessellator.pos(x + w, y + h, z + w);
  Tessellator.pos(x + w, y, z + w);
  Tessellator.pos(x + w, y, z);
  Tessellator.pos(x, y, z);
  Tessellator.pos(x, y, z + w);
  Tessellator.pos(x, y, z);
  Tessellator.pos(x, y + h, z);
  Tessellator.pos(x, y, z);
  Tessellator.pos(x + w, y, z);
  Tessellator.pos(x + w, y + h, z);
  Tessellator.pos(x + w, y, z);
  Tessellator.pos(x + w, y, z + w);
  Tessellator.pos(x, y, z + w);
  Tessellator.pos(x, y + h, z + w);
  Tessellator.pos(x + w, y + h, z + w);

  Tessellator.draw();

  GlStateManager.func_179121_F();
  GL11.glEnable(GL11.GL_TEXTURE_2D);
  GL11.glDisable(GL11.GL_BLEND);
};
export function drawBoxAtBlock(x, y, z, colorR, colorG, colorB, w = 1, h = 1, a = 1, lw = 5) {
  ({ x, y, z } = rescaleRender(x, y, z));
  GL11.glBlendFunc(770, 771);
  GL11.glEnable(GL11.GL_BLEND);
  GL11.glLineWidth(lw);
  GL11.glDisable(GL11.GL_TEXTURE_2D);
  GL11.glDisable(GL11.GL_DEPTH_TEST);
  GL11.glDepthMask(false);
  GlStateManager["func_179094_E"]();

  Tessellator.begin(GL11.GL_LINE_STRIP).colorize(colorR, colorG, colorB, a);

  Tessellator.pos(x + w, y + h, z + w);
  Tessellator.pos(x + w, y + h, z);
  Tessellator.pos(x, y + h, z);
  Tessellator.pos(x, y + h, z + w);
  Tessellator.pos(x + w, y + h, z + w);
  Tessellator.pos(x + w, y, z + w);
  Tessellator.pos(x + w, y, z);
  Tessellator.pos(x, y, z);
  Tessellator.pos(x, y, z + w);
  Tessellator.pos(x, y, z);
  Tessellator.pos(x, y + h, z);
  Tessellator.pos(x, y, z);
  Tessellator.pos(x + w, y, z);
  Tessellator.pos(x + w, y + h, z);
  Tessellator.pos(x + w, y, z);
  Tessellator.pos(x + w, y, z + w);
  Tessellator.pos(x, y, z + w);
  Tessellator.pos(x, y + h, z + w);
  Tessellator.pos(x + w, y + h, z + w);

  Tessellator.draw();

  GlStateManager["func_179121_F"]();
  GL11.glEnable(GL11.GL_TEXTURE_2D);
  GL11.glEnable(GL11.GL_DEPTH_TEST);
  GL11.glDepthMask(true);
  GL11.glDisable(GL11.GL_BLEND);
};
// soopy, the most consistent coder. wtf is he on
export function drawFilledBox(x, y, z, w, h, red, green, blue, alpha, phase) {
  ({ x, y, z } = rescaleRender(x, y, z));
  GL11.glDisable(GL11.GL_CULL_FACE);
  if (phase) {
    GL11.glBlendFunc(770, 771);
    GL11.glEnable(GL11.GL_BLEND);
    GL11.glLineWidth(2);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GL11.glDisable(GL11.GL_DEPTH_TEST);
    GL11.glDepthMask(false);
    GlStateManager.func_179094_E();
  } else {
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GL11.glBlendFunc(770, 771);
    GL11.glEnable(GL11.GL_BLEND);
    GL11.glLineWidth(2);
    GL11.glDepthMask(false);
    GlStateManager.func_179094_E();
  }

  w /= 2;

  Tessellator.begin(GL11.GL_QUADS, false);
  Tessellator.colorize(red, green, blue, alpha);

  Tessellator.translate(x, y, z).
    pos(w, 0, w).
    pos(w, 0, -w).
    pos(-w, 0, -w).
    pos(-w, 0, w).

    pos(w, h, w).
    pos(w, h, -w).
    pos(-w, h, -w).
    pos(-w, h, w).

    pos(-w, h, w).
    pos(-w, h, -w).
    pos(-w, 0, -w).
    pos(-w, 0, w).

    pos(w, h, w).
    pos(w, h, -w).
    pos(w, 0, -w).
    pos(w, 0, w).

    pos(w, h, -w).
    pos(-w, h, -w).
    pos(-w, 0, -w).
    pos(w, 0, -w).

    pos(-w, h, w).
    pos(w, h, w).
    pos(w, 0, w).
    pos(-w, 0, w).
    draw();

  GL11.glEnable(GL11.GL_CULL_FACE);
  if (phase) {
    GlStateManager.func_179121_F();
    GL11.glEnable(GL11.GL_TEXTURE_2D);
    GL11.glEnable(GL11.GL_DEPTH_TEST);
    GL11.glDepthMask(true);
    GL11.glDisable(GL11.GL_BLEND);
  } else {
    GL11.glEnable(GL11.GL_TEXTURE_2D);
    GlStateManager.func_179121_F();
    GL11.glDepthMask(true);
    GL11.glDisable(GL11.GL_BLEND);
  }
};

/**
 * @param {{x: number, y: number, z: number, w?: number, h?: number, text?: string}[]} waypoints
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {boolean?} phase
 * @param {boolean?} isCentered
 * @returns
 */
export function renderWaypoints(waypoints, r, g, b, phase = true, isCentered = true) {
  if (waypoints.length === 0) return;

  waypoints.forEach((waypoint) => {
    const w = waypoint.w || 1;
    const h = waypoint.h || 1;
    let x = waypoint.x + (isCentered ? 0 : w / 2);
    let y = waypoint.y;
    let z = waypoint.z + (isCentered ? 0 : w / 2);
    ({ x, y, z } = rescaleRender(x, y, z));

    RenderLib.drawEspBox(x, y, z, w, h, r, g, b, 1, phase)
    RenderLib.drawInnerEspBox(x, y, z, w, h, r, g, b, 0.25, phase);
    if (waypoint.text) Tessellator.drawString(waypoint.text, x, y + 1.5, z, 0xFFFFFF, true);
  });
}

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
 * @param {number?} length
 * @param {number?} yaw degrees
 */
export function drawArrow2D(color, theta, length = 20, yaw) {
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
 * @param {number?} scale
 * @param {number?} yaw degrees
 * @param {number?} pitch degrees
 */
export function drawArrow3D(color, theta, phi, scale = 3, yaw, pitch) {
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
  // points.forEach(([x, y], i) => Renderer.drawString(i.toString(), x, y));
}
/**
 * @param {number} color rgba
 * @param {number} dx
 * @param {number} dy
 * @param {number} dz
 * @param {boolean?} rel
 * @param {number?} scale
 */
export function pointTo3D(color, dx, dy, dz, rel = true, scale) {
  if (rel) {
    if (settings.preferUseTracer) return renderTracer(color, dx + _getRenderX(), dy + _getRenderY(), dz + _getRenderZ());
    return drawArrow3D(color, Math.atan2(dz, dx), Math.acos(dy / Math.hypot(dx, dy, dz)), scale);
  }
  if (settings.preferUseTracer) return renderTracer(color, dx, dy, dz);
  return pointTo3D(color, dx - _getRenderX(), dy - _getRenderY(), dz - _getRenderZ(), true, scale);
}

export function renderTracer(color, x, y, z) {
  ({ x, y, z } = rescaleRender(x, y, z));
  // renderWorld
  // const p = Player.getPlayer();
  // if (!p) return;
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
  worldRen.func_181668_a(1, Java.type('net.minecraft.client.renderer.vertex.DefaultVertexFormats').field_181705_e);

  // renderWorld
  // worldRen.func_181662_b(dx - getRenderX(), dy - getRenderY(), dz - getRenderZ()).func_181675_d();
  // const look = p.func_70676_i(Tessellator.partialTicks);
  // worldRen.func_181662_b(look.field_72450_a, p.func_70047_e() + look.field_72448_b, look.field_72449_c).func_181675_d();

  // renderOverlay
  const point = RenderLib2D.projectPoint(x, y, z);
  if (point) {
    worldRen.func_181662_b(Renderer.screen.getWidth() / 2, Renderer.screen.getHeight() / 2, 0).func_181675_d();
    worldRen.func_181662_b(point.x, point.y, 0).func_181675_d();
  }
  // Tessellator.rotate(getPitch(), 0, 1, 0);
  // Tessellator.rotate(getYaw() * getXMult(), 1, 0, 0);
  // look.field_72450_a, look.field_72448_b, look.field_72449_c
  // worldRen.func_181662_b(Renderer.screen.getWidth() / 2 + look.field_72450_a, Renderer.screen.getHeight() / 2 + look.field_72448_b, look.field_72449_c).func_181675_d();

  tess.func_78381_a();
  GlStateManager.func_179121_F();

  GlStateManager.func_179084_k();
  GlStateManager.func_179098_w();
  GlStateManager.func_179126_j();
  GlStateManager.func_179089_o();
}

const RenderUtil = Java.type('gg.skytils.skytilsmod.utils.RenderUtil');
let _getRenderX = () => 0;
let _getRenderY = () => 0;
let _getRenderZ = () => 0;
/**
 * @type {() => number}
 */
export function getRenderX() {
  return _getRenderX();
}
/**
 * @type {() => number}
 */
export function getRenderY() {
  return _getRenderY();
}
/**
 * @type {() => number}
 */
export function getRenderZ() {
  return _getRenderZ();
}
if (RenderUtil) {
  _getRenderX = RenderUtil.INSTANCE.getRenderX.bind(RenderUtil.INSTANCE);
  _getRenderY = RenderUtil.INSTANCE.getRenderY.bind(RenderUtil.INSTANCE);
  _getRenderZ = RenderUtil.INSTANCE.getRenderZ.bind(RenderUtil.INSTANCE);
} else {
  const rm = Renderer.getRenderManager();
  const xa = rm.class.getDeclaredField('field_78725_b');
  xa.setAccessible(true);
  const ya = rm.class.getDeclaredField('field_78726_c');
  ya.setAccessible(true);
  const za = rm.class.getDeclaredField('field_78723_d');
  za.setAccessible(true);
  _getRenderX = function() { return xa.get(rm); };
  _getRenderY = function() { return ya.get(rm); };
  _getRenderZ = function() { return za.get(rm); };
}
const AABB = Java.type('net.minecraft.util.AxisAlignedBB');
/**
 * @param {import('ctjs/External').JavaClass<'net.minecraft.util.AxisAlignedBB'>} bb
 * @param {import('ctjs/External').JavaClass<'java.awt.Color'>} c
 * @param {number} f partial tick
 * @param {boolean?} esp is visible through walls (false)
 * @param {number?} lw line width (5)
 * @link https://github.com/Skytils/SkytilsMod/blob/facd8686633c5c9bb9fd239026c9a03563d228bf/src/main/kotlin/gg/skytils/skytilsmod/utils/RenderUtil.kt#L237
 */
export function drawBoxBB(bb, c, f, esp = false, lw = 5) {
  if (!esp && RenderUtil) return RenderUtil.drawOutlinedBoundingBox(bb, c, lw, f);
  const render = Client.getMinecraft().func_175606_aa();
  const realX = lerp(render.field_70165_t, render.field_70142_S, f);
  const realY = lerp(render.field_70163_u, render.field_70137_T, f);
  const realZ = lerp(render.field_70161_v, render.field_70136_U, f);
  GlStateManager.func_179094_E();
  GlStateManager.func_179137_b(-realX, -realY, -realZ);
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
  Java.type('net.minecraft.client.renderer.RenderGlobal').func_181563_a(bb, c.getRed(), c.getGreen(), c.getBlue(), c.getAlpha());
  GlStateManager.func_179137_b(realX, realY, realZ);
  GlStateManager.func_179084_k();
  GlStateManager.func_179141_d();
  GlStateManager.func_179098_w();
  GlStateManager.func_179131_c(1, 1, 1, 1);
  GlStateManager.func_179121_F();
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
 * @param {import('ctjs/External').JavaClass<'java.awt.Color'>} c
 * @param {number} f partial tick
 * @param {boolean?} esp is visible through walls (false)
 * @param {boolean?} center are coordinates already centered (true)
 * @param {number?} lw line width (5)
 */
export function drawBoxPos(x, y, z, w, h, c, f, esp = false, center = true, lw = 5) {
  x += _getRenderX();
  y += _getRenderY();
  z += _getRenderZ();
  if (!center) {
    x -= w / 2;
    z -= w / 2;
  }
  ({ x, y, z } = rescaleRender(x, y, z));
  const bb = new AABB(x, y, z, x + w, y + h, z + w);
  drawBoxBB(bb, c, f, esp, lw);
}

/**
 * @param {number} size `InventoryBasic::func_70302_i_();`
 * @param {number} xSlotPos `Slot::field_75223_e;`
 * @param {number} ySlotPos `Slot::field_75221_f;`
 * @param {number} color argb
 * @link https://github.com/bowser0000/SkyblockMod/blob/7f7ffca9cad7340ea08354b0a8a96eac4e88df88/src/main/java/me/Danker/utils/RenderUtils.java#L47
 */
export function highlightSlot(size, xSlotPos, ySlotPos, color) {
  const guiLeft = (Renderer.screen.getWidth() - 176) / 2;
  const guiTop = (Renderer.screen.getHeight() - 222) / 2;
  const x = guiLeft + xSlotPos;
  let y = guiTop + ySlotPos;
  // Move down when chest isn't 6 rows
  if (size !== 90) y += (6 - (size - 36) / 9) * 9;

  GL11.glTranslated(0, 0, 1);
  Gui.func_73734_a(x, y, x + 16, y + 16, color | 0); // integer, e.g. 4278255360 (0xFF00FF00) -> -16711936
  GL11.glTranslated(0, 0, -1);
}

/**
 * @param {number} color rgba
 * @param {number[][]} vertexes [x, y] or [x, y, depth]
 * @link https://github.com/ChatTriggers/ChatTriggers/blob/3aac68d7aa6c3276ae79000306895130c291d85b/src/main/kotlin/com/chattriggers/ctjs/minecraft/libs/renderer/Renderer.kt#L225
 */
export function drawPolygon(color, vertexes) {
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
  worldRen.func_181668_a(5, Java.type('net.minecraft.client.renderer.vertex.DefaultVertexFormats').field_181705_e);

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
 * @param {number} lw
 */
export function drawLine3D(color, x1, y1, z1, x2, y2, z2, lw = 2) {
  ({ x: x1, y: y1, z: z1 } = rescaleRender(x1, y1, z1));
  ({ x: x2, y: y2, z: z2 } = rescaleRender(x2, y2, z2));
  const render = Client.getMinecraft().func_175606_aa();
  const realX = lerp(render.field_70165_t, render.field_70142_S, Tessellator.partialTicks);
  const realY = lerp(render.field_70163_u, render.field_70137_T, Tessellator.partialTicks);
  const realZ = lerp(render.field_70161_v, render.field_70136_U, Tessellator.partialTicks);
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
  worldRen.func_181668_a(3, Java.type('net.minecraft.client.renderer.vertex.DefaultVertexFormats').field_181705_e);

  worldRen.func_181662_b(x1, y1, z1).func_181675_d();
  worldRen.func_181662_b(x2, y2, z2).func_181675_d();
  tess.func_78381_a();

  GlStateManager.func_179137_b(realX, realY, realZ);
  GlStateManager.func_179084_k();
  GlStateManager.func_179141_d();
  GlStateManager.func_179098_w();
  GlStateManager.func_179131_c(1, 1, 1, 1);
  GlStateManager.func_179121_F();
}

/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number?} color msb ARGB lsb (0xFFFFFFFF)
 * @param {boolean?} renderBlackBox (true)
 * @param {number?} scale (1)
 * @param {boolean?} increase (true)
 */
export function drawString(text, x, y, z, color = 0xFFFFFFFF, renderBlackBox = true, scale = 1, increase = true) {
  ({ x, y, z } = rescaleRender(x, y, z));
  Tessellator.drawString(text, x, y, z, color | 0, renderBlackBox, scale, increase);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} alpha
 * @param {boolean} depthCheck
 * @param {number?} height (300)
 */
export function drawBeaconBeam(x, y, z, r, g, b, alpha, depthCheck, height = 300) {
  ({ x, y, z } = rescaleRender(x, y, z));
  _drawBeaconBeam(x, y, z, r, g, b, alpha, depthCheck, height);
}

export function rgbaToARGB(c) {
  return ((c & 0xFF) << 24) | c >> 8;
}

export function rgbToJavaColor(c) {
  return new (Java.type('java.awt.Color'))(rgbaToARGB(c), true);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {{x: number, y: number, z: number}}
 */
function rescaleRender(x, y, z) {
  let d = (_getRenderX() - x) ** 2 + (_getRenderY() - y) ** 2 + (_getRenderZ() - z) ** 2;

  const rd = Client.settings.video.getRenderDistance() << 4;
  if (d >= rd * rd) {
    d = rd / Math.sqrt(d);
    return {
      x: lerp(_getRenderX(), x, d),
      y: lerp(_getRenderY(), y, d),
      z: lerp(_getRenderZ(), z, d)
    };
  }
  return { x, y, z };
}