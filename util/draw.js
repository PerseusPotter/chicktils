import { compareFloat, getAngle, lerp, rescale, rotate, toArray } from './math';
import { getEyeHeight } from './mc';
import GlStateManager2 from './glStateManager';
import reg from './registerer';
import { DefaultVertexFormats, getRenderX, getRenderY, getRenderZ, renderBoxFilled, renderBoxOutlineMiter } from '../../Apelles/index';

export const tess = Java.type('net.minecraft.client.renderer.Tessellator').func_178181_a();
export const worldRen = tess.func_178180_c();
export const rm = Renderer.getRenderManager();
function getXMult() {
  return Client.settings.getSettings().field_74320_O === 2 ? -1 : 1;
}
/** @returns {number} */
export function getYaw() {
  const p = Player.getPlayer();
  if (!p) return 0;
  return p.field_70126_B + (p.field_70177_z - p.field_70126_B) * Tessellator.partialTicks;
}
/** @returns {number} */
export function getPitch() {
  const p = Player.getPlayer();
  if (!p) return 0;
  return p.field_70127_C + (p.field_70125_A - p.field_70127_C) * Tessellator.partialTicks;
}
let lastServerTickTime = Date.now();
let lastServerTickLength = 50;
let cachedServerTickPartial = 0;
reg('serverTick', () => {
  const d = Date.now();
  lastServerTickLength = d - lastServerTickTime;
  lastServerTickTime = d;
}).register();
reg(net.minecraftforge.fml.common.gameevent.TickEvent.ClientTickEvent, () => {
  cachedServerTickPartial = Math.min(1, (Date.now() - lastServerTickTime) / lastServerTickLength);
}).register();
export function getPartialServerTick() {
  return cachedServerTickPartial;
}

/**
 * in radians
 * @param {number} color rgba
 * @param {number} theta radians
 * @param {number?} length (20)
 * @param {number?} yaw degrees
 */
export function drawArrow2D(color, theta, length = 20, yaw) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  color = packColor(rgba);
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
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  color = packColor(rgba);
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
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 * @param {number} h
 * @param {number} color rgba
 * @param {boolean?} esp is visible through walls (false)
 * @param {boolean?} center are coordinates already centered (true)
 * @param {number?} lw line width (5)
 * @param {number?} wz
 */
export function renderWaypoint(x, y, z, w, h, color, esp = false, center = true, lw = 5, wz = w) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  renderBoxFilled([rgba[0], rgba[1], rgba[2], rgba[3] / 4], x, y, z, w, h, { centered: center, wz, lw, phase: esp });
  // renderBoxOutline(rgba, x, y, z, w, h, { centered: center, wz, lw, phase: esp });
  renderBoxOutlineMiter(rgba, x, y, z, w, h, lw / 5, { centered: center, wz, phase: esp, increase: true });
}

/**
 * @param {number} color rgba
 * @param {number[][]} vertexes [x, y] or [x, y, depth]
 * @link https://github.com/ChatTriggers/ChatTriggers/blob/3aac68d7aa6c3276ae79000306895130c291d85b/src/main/kotlin/com/chattriggers/ctjs/minecraft/libs/renderer/Renderer.kt#L225
 */
export function drawPolygon(color, vertexes) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;

  GlStateManager2.disableTexture2D();
  GlStateManager2.disableDepth();
  GlStateManager2.enableBlend();
  GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);
  GlStateManager2.disableCull();
  GlStateManager2.color(rgba[0], rgba[1], rgba[2], rgba[3]);

  worldRen.func_181668_a(5, DefaultVertexFormats.field_181705_e);
  vertexes.forEach(v => worldRen.func_181662_b(v[0], v[1], v[2] || 0).func_181675_d());
  tess.func_78381_a();

  GlStateManager2.enableTexture2D();
  GlStateManager2.enableDepth();
  GlStateManager2.disableBlend();
  GlStateManager2.enableCull();
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
  const bt = '&0' + text.removeFormatting().split('\n').join('\n&0');
  drawString(bt, x + 1, y + 0);
  drawString(bt, x - 1, y + 0);
  drawString(bt, x + 0, y + 1);
  drawString(bt, x + 0, y - 1);
  drawString(text, x, y);
}

/**
 * @param {number} x center
 * @param {number} y center
 * @param {number} r
 * @param {number} a1 start (radians)
 * @param {number} a2 end (radians)
 * @param {number} segments
 */
export function _drawArc(x, y, r, a1, a2, segments) {
  if (a2 < a1) return _drawArc(x, y, r, a2, a1, segments);
  const ia = a2 - a1;
  const da = ia / segments;
  worldRen.func_181668_a(3, DefaultVertexFormats.field_181705_e);
  worldRen.func_181662_b(x + Math.cos(a1) * r, y - Math.sin(a1) * r, 0).func_181675_d();
  for (let i = 1; i <= segments; i++) {
    let aa = a1 + da * i;
    worldRen.func_181662_b(x + Math.cos(aa) * r, y - Math.sin(aa) * r, 0).func_181675_d();
  }
  tess.func_78381_a();
}

/**
 * @param {number} color rgba
 * @param {number} x center
 * @param {number} y center
 * @param {number} r
 * @param {number} a1 start (radians)
 * @param {number} a2 end (radians)
 * @param {number} segments
 * @param {number?} lw (2)
 */
export function drawArc(color, x, y, r, a1, a2, segments, lw = 2) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;

  GL11.glLineWidth(lw);
  GL11.glEnable(GL11.GL_LINE_SMOOTH);
  GlStateManager2.disableLighting();
  GlStateManager2.disableTexture2D();
  GlStateManager2.disableDepth();
  GlStateManager2.disableCull();
  GlStateManager2.enableBlend();
  GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);

  GlStateManager2.color(rgba[0], rgba[1], rgba[2], rgba[3]);
  _drawArc(x, y, r, a1, a2, segments);

  GlStateManager2.enableTexture2D();
  GlStateManager2.enableDepth();
  GlStateManager2.enableCull();
  GlStateManager2.disableBlend();
  GL11.glLineWidth(1);
  GL11.glDisable(GL11.GL_LINE_SMOOTH);
}

/**
 * @param {number} color rgba
 * @param {number} x top left
 * @param {number} y top left
 * @param {number} w
 * @param {number} h
 * @param {number?} r (5)
 * @param {number?} lw (2)
 */
export function drawRoundRect(color, x, y, w, h, r = 5, lw = 2) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  r = Math.min(w / 2, h / 2, r);

  GL11.glLineWidth(lw);
  GlStateManager2.disableLighting();
  GlStateManager2.disableTexture2D();
  GlStateManager2.disableDepth();
  GlStateManager2.disableCull();
  GlStateManager2.enableBlend();
  GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);
  GlStateManager2.color(rgba[0], rgba[1], rgba[2], rgba[3]);

  worldRen.func_181668_a(1, DefaultVertexFormats.field_181705_e);
  worldRen.func_181662_b(x + r, y, 0).func_181675_d();
  worldRen.func_181662_b(x + w - r, y, 0).func_181675_d();
  worldRen.func_181662_b(x, y + r, 0).func_181675_d();
  worldRen.func_181662_b(x, y + h - r, 0).func_181675_d();
  worldRen.func_181662_b(x + r, y + h, 0).func_181675_d();
  worldRen.func_181662_b(x + w - r, y + h, 0).func_181675_d();
  worldRen.func_181662_b(x + w, y + r, 0).func_181675_d();
  worldRen.func_181662_b(x + w, y + h - r, 0).func_181675_d();
  tess.func_78381_a();

  _drawArc(x + r, y + r, r, Math.PI / 2, Math.PI, 10);
  _drawArc(x + w - r, y + r, r, 0, Math.PI / 2, 10);
  _drawArc(x + r, y + h - r, r, Math.PI, Math.PI * 3 / 2, 10);
  _drawArc(x + w - r, y + h - r, r, Math.PI * 3 / 2, 2 * Math.PI, 10);

  GlStateManager2.enableTexture2D();
  GlStateManager2.enableDepth();
  GlStateManager2.enableCull();
  GlStateManager2.disableBlend();
  GL11.glLineWidth(1);
}

/**
 * @param {number} c rgba
 * @returns argb
 */
export function rgbaToARGB(c) {
  return ((c & 0xFF) << 24) | c >> 8;
}

let _rescaleRender$eyeHeight = getEyeHeight();
let _rescaleRender$rd = Client.settings.video.getRenderDistance() << 4;
register('tick', () => {
  _rescaleRender$eyeHeight = getEyeHeight();
  _rescaleRender$rd = Client.settings.video.getRenderDistance() << 4;
});
/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {{x: number, y: number, z: number, s: number}}
 */
function rescaleRender(x, y, z) {
  const rx = getRenderX();
  const ry = getRenderY() + _rescaleRender$eyeHeight;
  const rz = getRenderZ();
  let d = (rx - x) ** 2 + (ry - y) ** 2 + (rz - z) ** 2;

  if (d >= _rescaleRender$rd * _rescaleRender$rd) {
    d = _rescaleRender$rd / Math.sqrt(d);
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
   * @param {import ('../settingsLib').Property} prop
   */
  constructor(prop) {
    this.cache = rgbaToJavaColor(prop.valueOf());
    prop.listen(v => this.cache = rgbaToJavaColor(v));
  }
  get() {
    return this.cache;
  }
}

register('gameUnload', () => BufferedImageWrapper.ALL_IMAGES.forEach(v => v._internalDestroy()));
export class BufferedImageWrapper {
  static ALL_IMAGES = new Set();
  img = null;
  w = 0;
  h = 0;
  static mode = -1;
  textureId = -1;
  pboId = -1;
  constructor(img) {
    if (BufferedImageWrapper.mode === -1) {
      const cap = Java.type('org.lwjgl.opengl.GLContext').getCapabilities();
      BufferedImageWrapper.mode = cap.OpenGL21 ? 1 : 0;
    }
    this._create(img);
    BufferedImageWrapper.ALL_IMAGES.add(this);
  }
  _create(img) {
    this.w = img.getWidth();
    this.h = img.getHeight();
    this.textureId = GL11.glGenTextures();
    GlStateManager2.bindTexture(this.textureId);
    GL11['glTexImage2D(int,int,int,int,int,int,int,int,java.nio.ByteBuffer)'](GL11.GL_TEXTURE_2D, 0, GL11.GL_RGBA, this.w, this.h, 0, GL11.GL_RGBA, GL11.GL_UNSIGNED_BYTE, null);
    GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MIN_FILTER, GL11.GL_NEAREST);
    GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MAG_FILTER, GL11.GL_NEAREST);
    GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_S, GL12.GL_CLAMP_TO_EDGE);
    GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_T, GL12.GL_CLAMP_TO_EDGE);
    GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL12.GL_TEXTURE_MAX_LEVEL, 0);
    GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL12.GL_TEXTURE_MIN_LOD, 0);
    GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL12.GL_TEXTURE_MAX_LOD, 0);
    GL11.glTexParameterf(GL11.GL_TEXTURE_2D, GL14.GL_TEXTURE_LOD_BIAS, 0);
    GL11.glPixelStorei(GL11.GL_UNPACK_ALIGNMENT, 1);
    if (BufferedImageWrapper.mode === 1) {
      this.pboId = GL15.glGenBuffers();
      GL15.glBindBuffer(GL21.GL_PIXEL_UNPACK_BUFFER, this.pboId);
      GL15.glBufferData(GL21.GL_PIXEL_UNPACK_BUFFER, this.w * this.h * 4, GL15.GL_STREAM_DRAW);
      GL15.glBindBuffer(GL21.GL_PIXEL_UNPACK_BUFFER, 0);
    }
    this.update(img);
  }
  update(img) {
    const w = img.getWidth();
    const h = img.getHeight();
    if (w === this.w && h === this.h) {
      const pixels = img.getRaster().getDataBuffer().getData();
      if (BufferedImageWrapper.mode === 1) {
        GL15.glBindBuffer(GL21.GL_PIXEL_UNPACK_BUFFER, this.pboId);

        const buf = GL15.glMapBuffer(GL21.GL_PIXEL_UNPACK_BUFFER, GL15.GL_WRITE_ONLY, null);
        if (buf !== null) {
          buf.put(pixels);
          buf.flip();
          GL15.glUnmapBuffer(GL21.GL_PIXEL_UNPACK_BUFFER);
        }

        GlStateManager2.bindTexture(this.textureId);
        GL11.glTexSubImage2D(GL11.GL_TEXTURE_2D, 0, 0, 0, this.w, this.h, GL11.GL_RGBA, GL11.GL_UNSIGNED_BYTE, 0);

        GL15.glBindBuffer(GL21.GL_PIXEL_UNPACK_BUFFER, 0);
      } else {
        const buf = org.lwjgl.BufferUtils.createByteBuffer(pixels.length);
        buf.put(pixels);
        buf.flip();

        GlStateManager2.bindTexture(this.textureId);
        GL11.glTexSubImage2D(GL11.GL_TEXTURE_2D, 0, 0, 0, this.w, this.h, GL11.GL_RGBA, GL11.GL_UNSIGNED_BYTE, buf);
      }
    } else {
      this._internalDestroy();
      this._create(img);
    }
    return this;
  }
  _internalDestroy() {
    if (this.textureId === -1) return;
    GlStateManager2.deleteTexture(this.textureId);
    GL15.glDeleteBuffers(this.pboId);
    this.textureId = this.pboId = -1;
  }
  destroy() {
    this._internalDestroy();
    BufferedImageWrapper.ALL_IMAGES.delete(this);
  }
  draw(x, y, w, h) {
    w ??= this.w;
    h ??= this.h / this.w * w;
    GlStateManager2.bindTexture(this.textureId);

    worldRen.func_181668_a(7, DefaultVertexFormats.field_181707_g);
    worldRen.func_181662_b(x, y + h, 0).func_181673_a(0, 1).func_181675_d();
    worldRen.func_181662_b(x + w, y + h, 0).func_181673_a(1, 1).func_181675_d();
    worldRen.func_181662_b(x + w, y, 0).func_181673_a(1, 0).func_181675_d();
    worldRen.func_181662_b(x, y, 0).func_181673_a(0, 0).func_181675_d();
    tess.func_78381_a();
  }
}

/**
 * @overload
 * @param {number} color RGBA
 * @returns {[number, number, number, number]} [0, 1] RGBA
 *
 * @overload
 * @param {{ r: number, g: number, b: number, a: number }} color
 * @returns {[number, number, number, number]} [0, 1] RGBA
 *
 * @overload
 * @param {[number, number, number, number]} color RGBA
 * @returns {[number, number, number, number]} [0, 1] RGBA
 */
export function normColor(color) {
  if (typeof color === 'number') return [
    (color >>> 24) / 255,
    ((color >> 16) & 0xFF) / 255,
    ((color >> 8) & 0xFF) / 255,
    (color & 0xFF) / 255
  ];
  if (Array.isArray(color)) return color;
  return [
    color.r,
    color.g,
    color.b,
    color.a
  ];
}
/**
 * @param {[number, number, number, number]} color RGBA
 * @returns {number} RGBA
 */
export function packColor(color) {
  return (
    ((color[0] * 255) << 24) |
    ((color[1] * 255) << 16) |
    ((color[2] * 255) << 8) |
    (color[3] * 255)
  ) >>> 0;
}

/**
 * D65 reference, sRGB working space
 * @param {number} r [0, 1] in linear RGB
 * @param {number} g [0, 1] in linear RGB
 * @param {number} b [0, 1] in linear RGB
 * @returns {[number, number, number]} [X, Y, Z] all [0, 1]
 */
export function rgbToXyz(r, g, b) {
  return [
    0.412390799265960 * r + 0.357584339383878 * g + 0.180480788401834 * b,
    0.212639005871510 * r + 0.715168678767756 * g + 0.072192315360734 * b,
    0.019330818715592 * r + 0.119194779794626 * g + 0.950532152249661 * b
  ];
}

/**
 * D65 reference, sRGB working space
 * @param {number} X [0, 1]
 * @param {number} Y [0, 1]
 * @param {number} Z [0, 1]
 * @returns {[number, number, number]} [r, g, b] all [0, 1]
 */
export function xyzToRgb(X, Y, Z) {
  return [
    +3.2404542 * X + -1.5371385 * Y + -0.4985314 * Z,
    -0.9692660 * X + +1.8760108 * Y + +0.0415560 * Z,
    +0.0556434 * X + -0.2040259 * Y + +1.0572252 * Z
  ];
}

/**
 * D65 reference, Y=1 white
 * @param {number} X [0, 1]
 * @param {number} Y [0, 1]
 * @param {number} Z [0, 1]
 * @returns {[number, number, number]} [L, a, b] [[0, 1], [-0.4, 0.4], [-0.4, 0.4]]
 */
export function xyzToOklab(X, Y, Z) {
  const l = Math.cbrt(+0.8189330101 * X + +0.3618667424 * Y + -0.1288597137 * Z);
  const m = Math.cbrt(+0.0329845436 * X + +0.9293118715 * Y + +0.0361456387 * Z);
  const s = Math.cbrt(+0.0482003018 * X + +0.2643662691 * Y + +0.6338517070 * Z);
  return [
    +0.2104542553 * l + +0.7936177850 * m + -0.0040720468 * s,
    +1.9779984951 * l + -2.4285922050 * m + +0.4505937099 * s,
    +0.0259040371 * l + +0.7827717662 * m + -0.8086757660 * s
  ];
}

/**
 * D65 reference, Y=1 white
 * @param {number} L [0, 1]
 * @param {number} a [-0.4, 0.4]
 * @param {number} b [-0.4, 0.4]
 * @returns {[number, number, number]} [X, Y, Z] all [0, 1]
 */
export function oklabToXyz(L, a, b) {
  const l = (L + +0.3963377921737678 * a + +0.2158037580607587 * b) ** 3;
  const m = (L + -0.1055613423236563 * a + -0.0638541747717058 * b) ** 3;
  const s = (L + -0.0894841820949657 * a + -1.2914855378640917 * b) ** 3;
  return [
    +1.2270138511035211 * l + -0.5577999806518222 * m + +0.2812561489664678 * s,
    -0.0405801784232805 * l + +1.1122568696168375 * m + -0.0716766786656012 * s,
    -0.0763812845057069 * l + -0.4214819784180126 * m + +1.5861632204407947 * s
  ];
}

/**
 * @param {number} r [0, 1]
 * @param {number} g [0, 1]
 * @param {number} b [0, 1]
 * @returns {[number, number, number]} [L, a, b] [[0, 1], [-0.4, 0.4], [-0.4, 0.4]]
 */
export function rgbToOklab(r, g, b) {
  const XYZ = rgbToXyz(r, g, b);
  return xyzToOklab(XYZ[0], XYZ[1], XYZ[2]);
}

/**
 * @param {number} L [0, 1]
 * @param {number} a [-0.4, 0.4]
 * @param {number} b [-0.4, 0.4]
 * @returns {[number, number, number]} [r, g, b] all [0, 1]
 */
export function oklabToRgb(L, a, b) {
  const XYZ = oklabToXyz(L, a, b);
  return xyzToRgb(XYZ[0], XYZ[1], XYZ[2]);
}

export class Gradient {
  c1 = [0, 0, 0];
  c2 = [0, 0, 0];
  a1 = 0;
  a2 = 0;

  /**
   * @param {import('./state').StateVar<number>} c1
   * @param {import('./state').StateVar<number>} c2
   */
  constructor(c1, c2) {
    c1.listen(this._updateC1);
    c2.listen(this._updateC2);
    this._updateC1(c1.get());
    this._updateC2(c2.get());
  }

  /**
   * @param {number} m
   * @return {[number, number, number, number]}
   */
  get(m) {
    const c = oklabToRgb(
      lerp(this.c1[0], this.c2[0], m),
      lerp(this.c1[1], this.c2[1], m),
      lerp(this.c1[2], this.c2[2], m)
    );
    return [c[0], c[1], c[2], lerp(this.a1, this.a2, m)];
  }

  _updateC1(col) {
    const c = normColor(col);
    this.c1 = rgbToOklab(...c);
    this.a1 = c[3];
  }
  _updateC2(col) {
    const c = normColor(col);
    this.c2 = rgbToOklab(...c);
    this.a2 = c[3];
  }
}