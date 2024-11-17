import settings, { $FONTS } from '../settings';
import { BufferedImageWrapper, drawOutlinedString, rgbaToJavaColor } from './draw';
import GlStateManager2 from './glStateManager';
import reg from './registerer';
const EventEmitter = require('./events');

/**
 * @typedef {import('./events').EventEmitterImpl<'editClose' | 'editKey' | 'editRender'> & {
 *  getLoc: () => import('../data').TextLocation;
 *  isEdit: boolean;
 *  getEditText: () => string[];
 *  customEditMsg: string;
 *  edit(): void;
 *  render(): void;
 *  setLine(str: string): CustomTextGui;
 *  setLines(strs: string[]): CustomTextGui;
 *  addLine(str: string): CustomTextGui;
 *  addLines(strs: string[]): CustomTextGui;
 *  clearLines(): CustomTextGui;
 *  getVisibleWidth(): number;
 *  getWidth(): number;
 *  getHeight(): number;
 *  getTrueLoc(): { x: number, y: number, s: number };
 * }} CustomTextGui
 */
const Font = Java.type('java.awt.Font');
let FONT_RENDER_SIZE = settings.textGuiFontRenderSize;
const MC_FONT_SIZE = 10;
let fonts;
let activeFont = $FONTS.get(settings.textGuiFont);
const MOJANGLES_FONT = Font.createFont(Font.TRUETYPE_FONT, new java.io.File('./config/ChatTriggers/modules/chicktils/assets/Mojangles.ttf'));
settings._textGuiFont.listen(function(v, o) {
  if (!$FONTS.has(v)) this.set(o);
  else {
    activeFont = v === 'Mojangles' ? null : $FONTS.get(settings.textGuiFont);
    fonts = createFonts();
    allDisplays.forEach(v => v._mark());
  }
});
settings._textGuiFontRenderSize.listen(v => {
  FONT_RENDER_SIZE = v;
  fonts = createFonts();
  allDisplays.forEach(v => v._mark());
});
function createFonts() {
  return [
    activeFont ?
      new Font(activeFont, Font.PLAIN, FONT_RENDER_SIZE) :
      MOJANGLES_FONT.deriveFont(Font.PLAIN, FONT_RENDER_SIZE),
    new Font(Font.MONOSPACED, Font.PLAIN, FONT_RENDER_SIZE),
    new Font(Font.SANS_SERIF, Font.PLAIN, FONT_RENDER_SIZE)
  ];
}
fonts = createFonts();
const BufferedImage = Java.type('java.awt.image.BufferedImage');
const RenderingHints = Java.type('java.awt.RenderingHints');
const FontHelper = Java.type('com.perseuspotter.chicktilshelper.FontHelper');
export const allDisplays = [];
{
  const cols = [
    ['0', 0x000000FF],
    ['1', 0x0000AAFF],
    ['2', 0x00AA00FF],
    ['3', 0x00AAAAFF],
    ['4', 0xAA0000FF],
    ['5', 0xAA00AAFF],
    ['6', 0xFFAA00FF],
    ['7', 0xAAAAAAFF],
    ['8', 0x555555FF],
    ['9', 0x5555FFFF],
    ['a', 0x55FF55FF],
    ['b', 0x55FFFFFF],
    ['c', 0xFF5555FF],
    ['d', 0xFF55FFFF],
    ['e', 0xFFFF55FF],
    ['f', 0xFFFFFFFF]
  ];
  var COLORS = cols.reduce((a, v) => {
    a[v[0]] = rgbaToJavaColor(v[1]);
    return a;
  }, {});
  var COLORS_SHADOW = cols.reduce((a, v) => {
    a[v[0]] = rgbaToJavaColor(((v[1] >>> 2) & 0x3F3F3F00) | 0xFF);
    return a;
  }, {});
}
/**
 * @typedef {{ s: string, a: any, b: any, o: [number, number, number][], w: number, vw: number, d: boolean }} Line
 */
/**
 * @param {() => import('../data').TextLocation} getLoc
 * @param {() => string[]} getEditText
 * @param {string?} customEditMsg
 * @returns {CustomTextGui}
 */
function createTextGui(getLoc, getEditText, customEditMsg = '') {
  /**
   * @type {CustomTextGui}
   */
  const obj = new EventEmitter();
  obj.getLoc = getLoc;
  obj.isEdit = false;
  obj.getEditText = getEditText;
  obj.customEditMsg = customEditMsg;
  obj.edit = function() {
    this.isEdit = true;
    curr = this;
    renderReg.register();
    editGui.open();
  };
  let cs = 1;
  let cb = false;
  let cc = 0;
  let dirty = true;
  /** @type {BufferedImageWrapper} */
  let img;
  let skipDraw = false;
  let rx = 0;
  let ry = 0;
  let rw = 0;
  let rh = 0;
  const updateLocCache = () => {
    const l = obj.getLoc();
    if (cb !== l.b) {
      dirty = true;
      lines.forEach(v => v.d = true);
      cb = l.b;
    }
    cs = l.s;
    if (cc !== l.c) {
      dirty = true;
      lines.forEach(v => v.d = true);
      cc = l.c;
    }
    const tl = obj.getTrueLoc();
    rx = tl.x;
    ry = tl.y;
    rw = (img?.w ?? 0) * MC_FONT_SIZE / FONT_RENDER_SIZE * cs;
    rh = (img?.h ?? 0) * MC_FONT_SIZE / FONT_RENDER_SIZE * cs;
  };
  /** @type {Line[]} */
  let lines = [];
  let lineW = 0;
  let lineVW = 0;
  let hasObf = false;
  const updateLines = () => {
    let tmpG;
    lineW = 0;
    lineVW = 0;
    hasObf = false;
    lines.forEach(v => {
      if (v.d) {
        if (!tmpG) {
          const tmpI = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
          tmpG = tmpI.createGraphics();
          tmpG.setFont(fonts[0]);
        }

        const data = FontHelper.processString(v.s, cb, tmpG, fonts[0], fonts[1], fonts[2], FONT_RENDER_SIZE);

        v.a = data.a;
        v.b = data.b;
        v.o = data.o;
        v.w = data.w;
        v.vw = data.vw;
        v.d = false;
      }

      if (v.o.length) hasObf = true;
      lineW = Math.max(lineW, v.w);
      lineVW = Math.max(lineVW, v.vw);
    });

    tmpG?.dispose();
  };
  const renderImage = () => {
    // extra spacing for hanging characters
    const bimg = new BufferedImage(lineW + (cb ? FONT_RENDER_SIZE / 10 : 0), FONT_RENDER_SIZE * (lines.length + 1) + (cb ? FONT_RENDER_SIZE / 10 : 0), BufferedImage.TYPE_INT_ARGB);
    const g = bimg.createGraphics();
    g.setFont(fonts[0]);
    const ascent = g.getFontMetrics().getAscent();
    g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

    lines.forEach((v, i) => {
      const y = i * FONT_RENDER_SIZE + ascent;
      let x = 0;
      if (cc === 1) x = lineVW - v.vw;
      else if (cc === 2) x = (lineVW - v.vw) / 2;
      if (cb && v.b) {
        g.setColor(COLORS_SHADOW.f);
        g.drawString(v.b.getIterator(), x + FONT_RENDER_SIZE / 10, y + FONT_RENDER_SIZE / 10);
      }
      g.setColor(COLORS.f);
      g.drawString(v.a.getIterator(), x, y);
    });
    g.dispose();

    return bimg;
  };
  obj.render = function() {
    if (this.isEdit) return;
    if (lines.length === 0) return;

    GlStateManager2.depthMask(false);
    GlStateManager2.enableBlend();
    GlStateManager2.tryBlendFuncSeparate(770, 1, 1, 0);
    updateLocCache();
    if (!skipDraw) img?.draw(rx, ry, rw, rh);
    skipDraw = false;
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
    if (!dirty) return;

    updateLines();
    if (img) img = img.update(renderImage());
    else img = new BufferedImageWrapper(renderImage());
    updateLocCache();

    // TODO: draw obf

    dirty = false;
  };
  obj.setLine = function(str) {
    if (lines.length !== 1 || str !== lines[0].s) {
      this.clearLines();
      this.addLine(str);
    }
    return this;
  };
  obj.setLines = function(strs) {
    if (strs.length === 0) return this.clearLines();
    if (strs.length === 1) return this.setLine(strs[0]);
    if (strs.length < lines.length) {
      lines = lines.slice(0, strs.length);
      dirty = true;
    }
    strs.forEach((v, i) => {
      if (i < lines.length && v === lines[i].s) return;
      dirty = true;
      lines[i] = { s: v, a: null, b: null, o: [], w: -1, vw: -1, d: true };
    });
    return this;
  };
  obj.addLine = function(str) {
    dirty = true;
    lines.push({ s: str, a: null, b: null, o: [], w: -1, vw: -1, d: true });
    return this;
  };
  obj.addLines = function(strs) {
    strs.forEach(this.addLine, this);
    return this;
  };
  obj.clearLines = function() {
    lines = [];
    hasObf = false;
    return this;
  };
  obj.getVisibleWidth = function() {
    return MC_FONT_SIZE / FONT_RENDER_SIZE * lineVW * this.getLoc().s;
  };
  obj.getWidth = function() {
    return MC_FONT_SIZE / FONT_RENDER_SIZE * lineW * this.getLoc().s;
  };
  obj.getHeight = function() {
    return MC_FONT_SIZE * this.getLoc().s;
  };
  obj.getTrueLoc = function() {
    const loc = this.getLoc();
    const w = this.getWidth();
    const h = lines.length * this.getHeight();
    return {
      x: loc.c === 3 ? loc.x - w / 2 : loc.a & 1 ? loc.x - w : loc.x,
      y: loc.a & 2 ? loc.y - h : loc.y,
      s: loc.s
    };
  };
  obj._mark = function() {
    dirty = true;
    lines.forEach(v => v.d = true);
  };
  obj._rmCache = function() {
    skipDraw = true;
    dirty = true;
  };

  allDisplays.push(obj);
  return obj;
}
export default createTextGui;

const editGui = new Gui();
export const editDisplay = createTextGui(() => curr.getLoc(), () => []);
/**
 * @type {CustomTextGui}
 */
let curr;
const renderReg = reg('renderOverlay', () => {
  Renderer.drawRect(0x80000000, 0, 0, 5000, 5000);

  curr.emit('editRender');
  editDisplay.setLines(curr.getEditText());
  editDisplay.render();

  const editStr = '&7[&21&7] &fReset &8| &7[&22&7] &fChange Anchor &8| &7[&23&7] &fChange Alignment &8| &7[&24&7] &fToggle Shadow\n&7[&2Scroll&7] &fResize &8| &7[&2Drag&7] &fMove' + curr.customEditMsg;
  // const w = Renderer.getStringWidth(editStr);
  // Renderer.drawRect(0xB0000000, 40, 15, w + 20, 20);
  drawOutlinedString(editStr, 50, 20);
  Renderer.drawCircle(0xFF0000FF, curr.getLoc().x, curr.getLoc().y, 5, 10);
}).setPriority(Priority.LOWEST);

let lastX = -1;
let lastY = -1;
editGui.registerClosed(() => {
  lastX = -1;
  lastY = -1;
  renderReg.unregister();
  curr.isEdit = false;
  curr.emit('editClose');
});
editGui.registerKeyTyped((c, n) => {
  const l = curr.getLoc();
  switch (n) {
    case 2:
      l.x = 50;
      l.y = 50;
      l.s = 1;
      l.a = 0;
      l.b = false;
      break;
    case 3:
      l.a = (l.a + 1) & 3;
      break;
    case 4:
      l.c = (l.c + 1) & 3;
      break;
    case 5:
      l.b = !l.b;
      break;
    default:
      curr.emit('editKey', n);
  }
});
editGui.registerMouseDragged((x, y, b) => {
  if (b !== 0) return;
  if (lastX !== -1) {
    curr.getLoc().x += (x - lastX);
    curr.getLoc().y += (y - lastY);
  }
  lastX = x;
  lastY = y;
});
editGui.registerMouseReleased(() => {
  lastX = -1;
  lastY = -1;
});
editGui.registerScrolled((x, y, d) => {
  curr.getLoc().s = Math.max(0.1, curr.getLoc().s + d / 10);
});