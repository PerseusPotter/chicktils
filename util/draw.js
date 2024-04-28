import RenderLib from '../../RenderLib/index';
import { log } from './log';
if (!GlStateManager) {
  var GL11 = Java.type("org.lwjgl.opengl.GL11");
  var GlStateManager = Java.type("net.minecraft.client.renderer.GlStateManager");
}

// soopy !
export function drawBoxAtBlockNotVisThruWalls(x, y, z, colorR, colorG, colorB, w = 1, h = 1, a = 1, lw = 5) {
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
 * @param {{x: number, y: number, z: number, w: number, h: number}[]} waypoints
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {boolean?} phase
 * @param {boolean?} isCentered
 * @returns
 */
export function renderWaypoints(waypoints, r, g, b, phase = true, isCentered = true) {
  if (waypoints.length === 0) return;
  let x = 0;
  let y = 0;
  let z = 0;
  let w = 0;
  let h = 0;
  let distance = 0;

  waypoints.forEach((waypoint) => {
    w = waypoint.w || 1;
    h = waypoint.h || 1;
    x = waypoint.x + (isCentered ? 0 : w / 2);
    y = waypoint.y;
    z = waypoint.z + (isCentered ? 0 : w / 2);

    distance = (Player.getX() - x) ** 2 + (Player.getY() - y) ** 2 + (Player.getZ() - z) ** 2;

    if (distance >= 40000) {
      distance = 200 / Math.sqrt(distance);
      x = Player.getX() + (x - Player.getX()) * distance;
      y = Player.getY() + (y - Player.getY()) * distance;
      z = Player.getZ() + (z - Player.getZ()) * distance;
    }

    RenderLib.drawEspBox(x, y, z, w, h, r, g, b, 1, phase)
    RenderLib.drawInnerEspBox(x, y, z, w, h, r, g, b, 0.25, phase);
    if (waypoint.text) Tessellator.drawString(waypoint.text, x, y + 1.5, z, 0xFFFFFF, true);
  });
}

/**
 * in radians
 * @param {number} color
 * @param {number} theta
 * @param {number?} length
 * @param {number?} yaw
 */
export function renderArrowTo(color, theta, length = 20, yaw) {
  if (yaw === undefined) yaw = Player.getYaw();
  const dt = theta - yaw / 180 * Math.PI - Math.PI;
  const x1 = Renderer.screen.getWidth() / 2;
  const y1 = Renderer.screen.getHeight() / 2 + length + 10;

  const x2 = x1 + Math.cos(dt) * length;
  const y2 = y1 + Math.sin(dt) * length;
  const c = (color >> 8) | ((color & 0xFF) << 24);
  Renderer.drawLine(c, x1, y1, x2, y2, 1);
  Renderer.drawLine(c, x2, y2, x2 + Math.cos(dt + Math.PI * 7 / 8) * length / 3, y2 + Math.sin(dt + Math.PI * 7 / 8) * length / 3, 1);
  Renderer.drawLine(c, x2, y2, x2 + Math.cos(dt - Math.PI * 7 / 8) * length / 3, y2 + Math.sin(dt - Math.PI * 7 / 8) * length / 3, 1);
}

const RenderUtil = Java.type('gg.skytils.skytilsmod.utils.RenderUtil');
let interpolate;
let getRenderX;
let getRenderY;
let getRenderZ;
if (RenderUtil) {
  interpolate = RenderUtil.INSTANCE.interpolate.bind(RenderUtil.INSTANCE);
  getRenderX = RenderUtil.INSTANCE.getRenderX.bind(RenderUtil.INSTANCE);
  getRenderY = RenderUtil.INSTANCE.getRenderY.bind(RenderUtil.INSTANCE);
  getRenderZ = RenderUtil.INSTANCE.getRenderZ.bind(RenderUtil.INSTANCE);
} else {
  interpolate = function(currentValue, lastValue, multiplier) {
    return lastValue + (currentValue - lastValue) * multiplier;
  };
  if (!Client.getMinecraft()) log('fuck');
  else {
    const rm = Client.getMinecraft().func_175598_ae();
    const xa = rm.class.getDeclaredField('field_78725_b');
    xa.setAccessible(true);
    const ya = rm.class.getDeclaredField('field_78726_c');
    ya.setAccessible(true);
    const za = rm.class.getDeclaredField('field_78723_d');
    za.setAccessible(true);
    getRenderX = function() { return xa.get(rm); };
    getRenderY = function() { return ya.get(rm); };
    getRenderZ = function() { return za.get(rm); };
  }
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
  const realX = interpolate(render.field_70165_t, render.field_70142_S, f);
  const realY = interpolate(render.field_70163_u, render.field_70137_T, f);
  const realZ = interpolate(render.field_70161_v, render.field_70136_U, f);
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
  x += getRenderX();
  y += getRenderY();
  z += getRenderZ();
  if (!center) {
    x -= w / 2;
    z -= w / 2;
  }
  const bb = new AABB(x, y, z, x + w, y + h, z + w);
  drawBoxBB(bb, c, f, esp, lw);
}

/**
 * https://github.com/bowser0000/SkyblockMod/blob/7f7ffca9cad7340ea08354b0a8a96eac4e88df88/src/main/java/me/Danker/utils/RenderUtils.java#L47
 * @param {number} size `InventoryBasic::func_70302_i_();`
 * @param {number} xSlotPos `Slot::field_75223_e;`
 * @param {number} ySlotPos `Slot::field_75221_f;`
 * @param {number} color argb
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