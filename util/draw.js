import { compareFloat, getAngle, lerp, rescale, rotate, toArray } from './math';
import { getEyeHeight } from './mc';
import GlStateManager2 from './glStateManager';
import reg from './registerer';
import { setAccessible } from './polyfill';

export const tess = Java.type('net.minecraft.client.renderer.Tessellator').func_178181_a();
export const worldRen = tess.func_178180_c();
export const DefaultVertexFormats = Java.type('net.minecraft.client.renderer.vertex.DefaultVertexFormats');
export const rm = Renderer.getRenderManager();
const xa = setAccessible(rm.class.getDeclaredField('field_78725_b'));
const ya = setAccessible(rm.class.getDeclaredField('field_78726_c'));
const za = setAccessible(rm.class.getDeclaredField('field_78723_d'));
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
let lastServerTickTime = Date.now();
let cachedServerTickPartial = 0;
reg('serverTick', () => lastServerTickTime = Date.now()).register();
reg(net.minecraftforge.fml.common.gameevent.TickEvent.ClientTickEvent, () => cachedServerTickPartial = Math.min(1, (Date.now() - lastServerTickTime) / 50)).register();
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
 * @param {number} color rgba
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {boolean?} rel (true)
 * @param {number?} lw (3)
 */
export function renderTracer(color, x, y, z, rel = true, lw = 3) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  const p = Player.getPlayer();
  if (!p) return;
  if (rel) {
    x += getRenderX();
    y += getRenderY();
    z += getRenderZ();
  }
  const look = p.func_70676_i(Tessellator.partialTicks);
  renderLine(rgba, x, y, z, getRenderX() + look.field_72450_a, getRenderY() + look.field_72448_b + getEyeHeight(p), getRenderZ() + look.field_72449_c, true, lw);
}

/**
 * @param {number} minX
 * @param {number} minY
 * @param {number} minZ
 * @param {number} maxX
 * @param {number} maxY
 * @param {number} maxZ
 * @param {number} color rgba
 * @param {boolean?} esp is visible through walls (false)
 * @param {number?} lw line width (5)
 */
export function renderAABBOutline(minX, minY, minZ, maxX, maxY, maxZ, color, esp = false, lw = 5) {
  const mx = Math.min(minX, maxX);
  const my = Math.min(minY, maxY);
  const mz = Math.min(minZ, maxZ);
  const Mx = Math.max(minX, maxX);
  const My = Math.max(minY, maxY);
  const Mz = Math.max(minZ, maxZ);
  renderOutline(
    mx, my, mz,
    Mx - mx,
    My - my,
    color,
    esp,
    false,
    lw,
    false,
    Mz - mz
  );
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
 * @param {number?} wz
 */
export function renderOutline(x, y, z, w, h, color, esp = false, center = true, lw = 5, nt = false, wz = w) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  let wx = w;
  if (center) {
    x -= wx / 2;
    z -= wz / 2;
  }
  if (!nt) {
    let s;
    ({ x, y, z, s } = rescaleRender(x, y, z));
    wx *= s;
    wz *= s;
    h *= s;
    lw *= s;
  }

  GlStateManager2.disableTexture2D();
  GlStateManager2.disableLighting();
  GlStateManager2.disableAlpha();
  GL11.glLineWidth(lw);
  GlStateManager2.color(rgba[0], rgba[1], rgba[2], rgba[3]);
  if (!nt) {
    GlStateManager2.pushMatrix();
    GlStateManager2.translate(-getRenderX(), -getRenderY(), -getRenderZ());
  }
  if (rgba[3] === 1) {
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
  } else {
    GlStateManager2.depthMask(false);
    GlStateManager2.enableBlend();
    GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);
  }
  if (esp) GlStateManager2.disableDepth();

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

  if (!nt) GlStateManager2.popMatrix();
  GlStateManager2.enableTexture2D();
  GlStateManager2.enableAlpha();
  GL11.glLineWidth(1);
  if (rgba[3] !== 1) {
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
  }
  if (esp) GlStateManager2.enableDepth();
}

/**
 * @param {number} minX
 * @param {number} minY
 * @param {number} minZ
 * @param {number} maxX
 * @param {number} maxY
 * @param {number} maxZ
 * @param {number} color rgba
 * @param {boolean?} esp is visible through walls (false)
 */
export function renderAABBFilled(minX, minY, minZ, maxX, maxY, maxZ, color, esp = false) {
  const mx = Math.min(minX, maxX);
  const my = Math.min(minY, maxY);
  const mz = Math.min(minZ, maxZ);
  const Mx = Math.max(minX, maxX);
  const My = Math.max(minY, maxY);
  const Mz = Math.max(minZ, maxZ);
  renderFilledBox(
    mx, my, mz,
    Mx - mx,
    My - my,
    color,
    esp,
    false,
    false,
    Mz - mz
  );
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
 * @param {number?} wz
 */
export function renderFilledBox(x, y, z, w, h, color, esp = false, center = true, nt = false, wz = w) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  let wx = w;
  if (center) {
    x -= wx / 2;
    z -= wz / 2;
  }
  if (!nt) {
    let s;
    ({ x, y, z, s } = rescaleRender(x, y, z));
    wx *= s;
    wz *= s;
    h *= s;
  }

  GlStateManager2.disableTexture2D();
  GlStateManager2.disableLighting();
  GlStateManager2.disableAlpha();
  GlStateManager2.disableCull();
  GlStateManager2.color(rgba[0], rgba[1], rgba[2], rgba[3]);
  if (!nt) {
    GlStateManager2.pushMatrix();
    GlStateManager2.translate(-getRenderX(), -getRenderY(), -getRenderZ());
  }
  if (rgba[3] === 1) {
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
  } else {
    GlStateManager2.depthMask(false);
    GlStateManager2.enableBlend();
    GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);
  }
  if (esp) GlStateManager2.disableDepth();

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

  if (!nt) GlStateManager2.popMatrix();
  GlStateManager2.enableTexture2D();
  GlStateManager2.enableAlpha();
  GlStateManager2.enableCull();
  if (rgba[3] !== 1) {
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
  }
  if (esp) GlStateManager2.enableDepth();
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
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  rgba[3] /= 4;
  renderFilledBox(x, y, z, w, h, rgba, esp, center);
  rgba[3] *= 4;
  renderOutline(x, y, z, w, h, rgba, esp, center, lw);
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
 * @param {number} color rgba
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @param {number} esp (false)
 * @param {number?} lw (2)
 */
export function renderLine(color, x1, y1, z1, x2, y2, z2, esp = false, lw = 2) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  ({ x: x1, y: y1, z: z1 } = rescaleRender(x1, y1, z1));
  ({ x: x2, y: y2, z: z2 } = rescaleRender(x2, y2, z2));

  GlStateManager2.pushMatrix();
  GlStateManager2.translate(-getRenderX(), -getRenderY(), -getRenderZ());
  GlStateManager2.disableTexture2D();
  GlStateManager2.disableLighting();
  GlStateManager2.disableAlpha();
  GL11.glLineWidth(lw);
  GlStateManager2.color(rgba[0], rgba[1], rgba[2], rgba[3]);
  if (rgba[3] === 1) {
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
  } else {
    GlStateManager2.depthMask(false);
    GlStateManager2.enableBlend();
    GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);
  }
  if (esp) GlStateManager2.disableDepth();

  worldRen.func_181668_a(3, DefaultVertexFormats.field_181705_e);
  worldRen.func_181662_b(x1, y1, z1).func_181675_d();
  worldRen.func_181662_b(x2, y2, z2).func_181675_d();
  tess.func_78381_a();

  GlStateManager2.popMatrix();
  GlStateManager2.enableTexture2D();
  GlStateManager2.enableAlpha();
  GL11.glLineWidth(1);
  if (rgba[3] !== 1) {
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
  }
  if (esp) GlStateManager2.enableDepth();
}

/**
 * @param {number} color rgba
 * @param {(t: number) => [number, number, number]} func
 * @param {number} t0
 * @param {number} te
 * @param {number} segments
 * @param {number} esp (false)
 * @param {number?} lw (2)
 */
export function renderParaCurve(color, func, t0, te, segments, esp = false, lw = 2) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;

  GlStateManager2.pushMatrix();
  GlStateManager2.translate(-getRenderX(), -getRenderY(), -getRenderZ());
  GlStateManager2.disableTexture2D();
  GlStateManager2.disableLighting();
  GlStateManager2.disableAlpha();
  GlStateManager2.color(rgba[0], rgba[1], rgba[2], rgba[3]);
  if (rgba[3] === 1) {
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
  } else {
    GlStateManager2.depthMask(false);
    GlStateManager2.enableBlend();
    GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);
  }
  if (esp) GlStateManager2.disableDepth();

  worldRen.func_181668_a(3, DefaultVertexFormats.field_181705_e);
  const step = (te - t0) / segments;
  let plw = 1;
  for (let i = 0; i <= segments; i++) {
    let pos = func(t0 + i * step);
    let { x, y, z, s } = rescaleRender(pos[0], pos[1], pos[2]);
    let l = lw * s;
    if (compareFloat(plw, l) !== 0) {
      GL11.glLineWidth(l);
      plw = l;
    }
    worldRen.func_181662_b(x, y, z).func_181675_d();
  }
  tess.func_78381_a();

  GlStateManager2.popMatrix();
  GlStateManager2.enableTexture2D();
  GlStateManager2.enableAlpha();
  GL11.glLineWidth(1);
  if (rgba[3] !== 1) {
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
  }
  if (esp) GlStateManager2.enableDepth();
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
 * @param {boolean?} esp (true)
 * @param {boolean?} shadow (true)
 * @param {boolean?} nt (false)
 */
export function renderString(text, x, y, z, color = 0xFFFFFFFF, renderBlackBox = true, scale = 1, increase = true, esp = true, shadow = true, nt = false) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  if (!nt) {
    let s;
    ({ x, y, z, s } = rescaleRender(x, y, z));
    scale *= s;
  }

  if (increase) {
    const d = Math.hypot(x - getRenderX(), y - getRenderY(), z - getRenderZ());
    scale *= d / 150 * Math.sqrt(d / 200) + 0.02;
  }

  const lines = ChatLib.addColor(text).split('\n');

  GlStateManager2.pushMatrix();
  GlStateManager2.translate(x, y, z);
  if (!nt) GlStateManager2.translate(-getRenderX(), -getRenderY(), -getRenderZ());
  GlStateManager2.rotate(-rm.field_78735_i, 0, 1, 0);
  GlStateManager2.rotate(rm.field_78732_j * getXMult(), 1, 0, 0);
  GlStateManager2.scale(-scale, -scale, -scale);
  GlStateManager2.enableAlpha();
  GlStateManager2.enableBlend();
  GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);
  GlStateManager2.depthMask(false);
  GlStateManager2.disableLighting();
  if (esp) GlStateManager2.disableDepth();

  const widths = lines.map(v => Renderer.getStringWidth(v) / 2);
  const w = Math.max.apply(null, widths);

  if (renderBlackBox) {
    GlStateManager2.color(0, 0, 0, 0.25);
    worldRen.func_181668_a(5, DefaultVertexFormats.field_181705_e);
    worldRen.func_181662_b(-w - 1, -1, -1).func_181675_d();
    worldRen.func_181662_b(-w - 1, 8 * lines.length + 1, -1).func_181675_d();
    worldRen.func_181662_b(w + 1, -1, -1).func_181675_d();
    worldRen.func_181662_b(w + 1, 8 * lines.length + 1, -1).func_181675_d();
    tess.func_78381_a();
  }

  GlStateManager2.color(rgba[0], rgba[1], rgba[2], rgba[3]);
  GlStateManager2.enableTexture2D();

  lines.forEach((v, i) =>
    Renderer.getFontRenderer().func_175065_a(
      v,
      -widths[i],
      i * 8,
      0xFFFFFFFF | 0,
      shadow
    )
  );

  GlStateManager2.popMatrix();
  GlStateManager2.disableBlend();
  GlStateManager2.depthMask(true);
  if (esp) GlStateManager2.enableDepth();
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

const ResourceLocation = Java.type('net.minecraft.util.ResourceLocation');
const beaconBeamText = new ResourceLocation('textures/entity/beacon_beam.png');
/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} color rgba
 * @param {boolean} scuffed
 * @param {boolean?} esp is visible through walls (false)
 * @param {boolean?} center are coordinates already centered (true)
 * @param {number?} height (300)
 * @link https://github.com/NotEnoughUpdates/NotEnoughUpdates/blob/98f4f6140ab8371f1fd18846f5489318af2b2252/src/main/java/io/github/moulberry/notenoughupdates/core/util/render/RenderUtils.java#L220
 */
export function renderBeaconBeam(x, y, z, color, scuffed, esp = false, center = true, height = 300) {
  const rgba = normColor(color);
  if (rgba[3] === 0) return;
  if (!center) {
    x += 0.5;
    z += 0.5;
  }
  if (scuffed) return renderFilledBox(x, y, z, 0.4, height - y, color, esp);
  ({ x, y, z, s } = rescaleRender(x, y, z));

  GlStateManager2.pushMatrix();
  GlStateManager2.translate(-getRenderX(), -getRenderY(), -getRenderZ());

  const bottomOffset = 0;
  const topOffset = bottomOffset + height;
  if (esp) {
    GlStateManager2.disableDepth();
    GlStateManager2.depthMask(false);
  }
  Client.getMinecraft().func_110434_K().func_110577_a(beaconBeamText);
  GL11.glTexParameterf(3553, 10242, 10497);
  GL11.glTexParameterf(3553, 10243, 10497);
  GlStateManager2.disableLighting();
  GlStateManager2.enableCull();
  GlStateManager2.enableTexture2D();
  GlStateManager2.tryBlendFuncSeparate(770, 771, 1, 771);
  GlStateManager2.enableBlend();
  const time = 0.2 * (World.getWorld().func_82737_E() + Tessellator.partialTicks);
  const d1 = Math.ceil(time) - time;
  const r = rgba[0];
  const g = rgba[1];
  const b = rgba[2];
  const a = rgba[3];
  const d2 = time * -0.1875;
  const d4 = Math.cos(d2 + 2.356194490192345) * 0.2 * s;
  const d5 = Math.sin(d2 + 2.356194490192345) * 0.2 * s;
  const d6 = Math.cos(d2 + 0.7853981633974483) * 0.2 * s;
  const d7 = Math.sin(d2 + 0.7853981633974483) * 0.2 * s;
  const d8 = Math.cos(d2 + 3.9269908169872414) * 0.2 * s;
  const d9 = Math.sin(d2 + 3.9269908169872414) * 0.2 * s;
  const d10 = Math.cos(d2 + 5.497787143782138) * 0.2 * s;
  const d11 = Math.sin(d2 + 5.497787143782138) * 0.2 * s;
  const d14 = d1 - 1;
  const d15 = height * 2.5 + d14;
  worldRen.func_181668_a(7, DefaultVertexFormats.field_181709_i);
  worldRen.func_181662_b(x + d4, y + topOffset, z + d5).func_181673_a(1, d15).func_181666_a(r, g, b, 1 * a).func_181675_d();
  worldRen.func_181662_b(x + d4, y + bottomOffset, z + d5).func_181673_a(1, d14).func_181666_a(r, g, b, 1).func_181675_d();
  worldRen.func_181662_b(x + d6, y + bottomOffset, z + d7).func_181673_a(0, d14).func_181666_a(r, g, b, 1).func_181675_d();
  worldRen.func_181662_b(x + d6, y + topOffset, z + d7).func_181673_a(0, d15).func_181666_a(r, g, b, 1 * a).func_181675_d();
  worldRen.func_181662_b(x + d10, y + topOffset, z + d11).func_181673_a(1, d15).func_181666_a(r, g, b, 1 * a).func_181675_d();
  worldRen.func_181662_b(x + d10, y + bottomOffset, z + d11).func_181673_a(1, d14).func_181666_a(r, g, b, 1).func_181675_d();
  worldRen.func_181662_b(x + d8, y + bottomOffset, z + d9).func_181673_a(0, d14).func_181666_a(r, g, b, 1).func_181675_d();
  worldRen.func_181662_b(x + d8, y + topOffset, z + d9).func_181673_a(0, d15).func_181666_a(r, g, b, 1 * a).func_181675_d();
  worldRen.func_181662_b(x + d6, y + topOffset, z + d7).func_181673_a(1, d15).func_181666_a(r, g, b, 1 * a).func_181675_d();
  worldRen.func_181662_b(x + d6, y + bottomOffset, z + d7).func_181673_a(1, d14).func_181666_a(r, g, b, 1).func_181675_d();
  worldRen.func_181662_b(x + d10, y + bottomOffset, z + d11).func_181673_a(0, d14).func_181666_a(r, g, b, 1).func_181675_d();
  worldRen.func_181662_b(x + d10, y + topOffset, z + d11).func_181673_a(0, d15).func_181666_a(r, g, b, 1 * a).func_181675_d();
  worldRen.func_181662_b(x + d8, y + topOffset, z + d9).func_181673_a(1, d15).func_181666_a(r, g, b, 1 * a).func_181675_d();
  worldRen.func_181662_b(x + d8, y + bottomOffset, z + d9).func_181673_a(1, d14).func_181666_a(r, g, b, 1).func_181675_d();
  worldRen.func_181662_b(x + d4, y + bottomOffset, z + d5).func_181673_a(0, d14).func_181666_a(r, g, b, 1).func_181675_d();
  worldRen.func_181662_b(x + d4, y + topOffset, z + d5).func_181673_a(0, d15).func_181666_a(r, g, b, 1 * a).func_181675_d();
  tess.func_78381_a();
  GlStateManager2.disableCull();
  const d12 = d1 - 1;
  const d13 = height + d12;
  worldRen.func_181668_a(7, DefaultVertexFormats.field_181709_i);
  const w = 0.3 * s;
  worldRen.func_181662_b(x - w, y + topOffset, z - w).func_181673_a(1, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d();
  worldRen.func_181662_b(x - w, y + bottomOffset, z - w).func_181673_a(1, d12).func_181666_a(r, g, b, 0.25).func_181675_d();
  worldRen.func_181662_b(x + w, y + bottomOffset, z - w).func_181673_a(0, d12).func_181666_a(r, g, b, 0.25).func_181675_d();
  worldRen.func_181662_b(x + w, y + topOffset, z - w).func_181673_a(0, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d();
  worldRen.func_181662_b(x + w, y + topOffset, z + w).func_181673_a(1, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d();
  worldRen.func_181662_b(x + w, y + bottomOffset, z + w).func_181673_a(1, d12).func_181666_a(r, g, b, 0.25).func_181675_d();
  worldRen.func_181662_b(x - w, y + bottomOffset, z + w).func_181673_a(0, d12).func_181666_a(r, g, b, 0.25).func_181675_d();
  worldRen.func_181662_b(x - w, y + topOffset, z + w).func_181673_a(0, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d();
  worldRen.func_181662_b(x + w, y + topOffset, z - w).func_181673_a(1, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d();
  worldRen.func_181662_b(x + w, y + bottomOffset, z - w).func_181673_a(1, d12).func_181666_a(r, g, b, 0.25).func_181675_d();
  worldRen.func_181662_b(x + w, y + bottomOffset, z + w).func_181673_a(0, d12).func_181666_a(r, g, b, 0.25).func_181675_d();
  worldRen.func_181662_b(x + w, y + topOffset, z + w).func_181673_a(0, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d();
  worldRen.func_181662_b(x - w, y + topOffset, z + w).func_181673_a(1, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d();
  worldRen.func_181662_b(x - w, y + bottomOffset, z + w).func_181673_a(1, d12).func_181666_a(r, g, b, 0.25).func_181675_d();
  worldRen.func_181662_b(x - w, y + bottomOffset, z - w).func_181673_a(0, d12).func_181666_a(r, g, b, 0.25).func_181675_d();
  worldRen.func_181662_b(x - w, y + topOffset, z - w).func_181673_a(0, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d();
  tess.func_78381_a();
  GlStateManager2.enableTexture2D();
  if (esp) {
    GlStateManager2.enableDepth();
    GlStateManager2.depthMask(true);
  }

  GlStateManager2.popMatrix();
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
   * @param {import ('../settings').Property} prop
   */
  constructor(prop) {
    this.cache = rgbaToJavaColor(prop.valueOf());
    prop.listen(v => this.cache = rgbaToJavaColor(v));
  }
  get() {
    return this.cache;
  }
}

register('gameUnload', () => BufferedImageWrapper.ALL_IMAGES.forEach(v => v.destroy()));
const DynamicTexture = Java.type('net.minecraft.client.renderer.texture.DynamicTexture');
export class BufferedImageWrapper {
  static ALL_IMAGES = new Set();
  img = null;
  w = 0;
  h = 0;
  constructor(img) {
    this.w = img.getWidth();
    this.h = img.getHeight();
    this.img = new DynamicTexture(img);
    BufferedImageWrapper.ALL_IMAGES.add(this);
  }
  update(img) {
    const w = img.getWidth();
    const h = img.getHeight();
    if (w === this.w && h === this.h) {
      img.getRGB(0, 0, img.getWidth(), img.getHeight(), this.img.func_110565_c(), 0, img.getWidth());
      this.img.func_110564_a();
    } else {
      this.w = w;
      this.h = h;
      this.img.func_147631_c();
      this.img = new DynamicTexture(img);
    }
    return this;
  }
  destroy() {
    this.img.func_147631_c();
    BufferedImageWrapper.ALL_IMAGES.delete(this);
  }
  draw(x, y, w, h) {
    w ??= this.w;
    h ??= this.h / this.w * w;
    GlStateManager2.bindTexture(this.img.func_110552_b());
    return drawTexturedRect(x, y, 0, 0, w, h, w, h, w, h);
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