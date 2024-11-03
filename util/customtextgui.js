import settings from '../settings';
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
const fontHeights = [-1, -1, -1];
let FONT_RENDER_SIZE = settings.textGuiFontRenderSize;
const MC_FONT_SIZE = 10;
let fonts;
const ALLOWED_FONTS = new Map(java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames().map(v => [v.replace(/\s/g, ''), v]));
settings._textGuiFont.listen(function(v, o) {
  if (!ALLOWED_FONTS.has(v)) this.set(o);
  else {
    fontHeights.forEach((_, i) => fontHeights[i] = -1);
    fonts = null;
    allDisplays.forEach(v => v._mark());
  }
});
settings._textGuiFontRenderSize.listen(v => {
  FONT_RENDER_SIZE = v;
  fontHeights.forEach((_, i) => fontHeights[i] = -1);
  fonts = null;
  allDisplays.forEach(v => v._mark());
});
function createFonts() {
  return [
    new Font(ALLOWED_FONTS.get(settings.textGuiFont), Font.PLAIN, FONT_RENDER_SIZE * (fontHeights[0] === -1 ? 1 : FONT_RENDER_SIZE / fontHeights[0])),
    new Font(Font.MONOSPACED, Font.PLAIN, FONT_RENDER_SIZE * (fontHeights[1] === -1 ? 1 : FONT_RENDER_SIZE / fontHeights[1])),
    new Font(Font.SANS_SERIF, Font.PLAIN, FONT_RENDER_SIZE * (fontHeights[2] === -1 ? 1 : FONT_RENDER_SIZE / fontHeights[2]))
  ];
}
function addAttribute(str, a, v, s, e) {
  if (!str) return;
  if (s >= e) return;
  str.addAttribute(a, v, s, e);
}
function setAttrFont(att, str, s, e) {
  if (Number.isNaN(s) || Number.isNaN(e)) return;
  if (s >= e) return;
  if (s >= str.length) return;
  if (!fonts) return;
  const f = fonts[0];
  let i = f.canDisplayUpTo(str.slice(s, e));
  let maxIters = 10;
  while (s < str.length && i >= 0) {
    if (--maxIters === 0) return;
    addAttribute(att, TextAttribute.FONT, f, s, i);
    let b = s = i;
    while (s < e && f.canDisplayUpTo(str[s]) !== -1) s++;
    addAttribute(att, TextAttribute.FONT, fonts[2], b, s);
    i = f.canDisplayUpTo(str.slice(s, e));
  }
  addAttribute(att, TextAttribute.FONT, f, s, e);
}
const BufferedImage = Java.type('java.awt.image.BufferedImage');
const AttributedString = Java.type('java.text.AttributedString');
const TextAttribute = Java.type('java.awt.font.TextAttribute');
const TextLayout = Java.type('java.awt.font.TextLayout');
const RenderingHints = Java.type('java.awt.RenderingHints');
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
    const tmpI = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
    const tmpG = tmpI.createGraphics();
    if (fontHeights[0] === -1) {
      const f = createFonts();
      f.forEach((v, i) => fontHeights[i] = tmpG.getFontMetrics(v).getHeight());
      fonts = createFonts();
    }
    tmpG.setFont(fonts[0]);

    lineW = 0;
    lineVW = 0;
    hasObf = false;
    lines.forEach(v => {
      if (!v.d) {
        if (v.o.length) hasObf = true;
        lineW = Math.max(lineW, v.w);
        lineVW = Math.max(lineVW, v.vw);
        return;
      }

      const l = v.s + '&r';
      let s = '';
      const o = [];
      /** @type {{ t: string, s: number, e: number }[]} */
      const atts = [];
      /** @type {{ t: string, i: number }[]} */
      let cAtts = [];
      let obfS = -1;

      for (let j = 0; j < l.length; j++) {
        let c = l[j];
        if ((c === '&' || c === '§') && j < l.length - 1) {
          let k = l[j + 1];
          if (k in COLORS) {
            cAtts = cAtts.filter(v => {
              if (!(v.t in COLORS)) return true;
              atts.push({ t: v.t, s: v.i, e: s.length });
              return false;
            });
            cAtts.push({ t: k, i: s.length });
            j++;
            continue;
          }
          if (k === 'k') {
            obfS = s.length;
            j++;
            continue;
          }
          if (k === 'l' || k === 'o' || k === 'm' || k === 'n') {
            cAtts.push({ t: k, i: s.length });
            j++;
            continue;
          }
          if (k === 'r') {
            cAtts.forEach(v => atts.push({ t: v.t, s: v.i, e: s.length }));
            cAtts = [];
            if (obfS >= 0) o.push([obfS, s.length]);
            obfS = -1;
            j++;
            continue;
          }
        }
        s += obfS >= 0 ? ' ' : c;
      }
      const a = new AttributedString(s);
      const b = cb ? new AttributedString(s) : null;
      addAttribute(a, TextAttribute.SIZE, FONT_RENDER_SIZE, 0, s.length);
      addAttribute(b, TextAttribute.SIZE, FONT_RENDER_SIZE, 0, s.length);
      let end = 0;
      for (let i = 0; i < o.length; i++) {
        setAttrFont(a, s, i === 0 ? 0 : end, o[i][0]);
        setAttrFont(b, s, i === 0 ? 0 : end, o[i][0]);
        addAttribute(a, TextAttribute.FONT, fonts[1], o[i][0], o[i][1]);
        addAttribute(b, TextAttribute.FONT, fonts[1], o[i][0], o[i][1]);
        end = o[i][1];
      }
      setAttrFont(a, s, end, s.length);
      setAttrFont(b, s, end, s.length);
      atts.forEach(({ t, s, e }) => {
        if (t in COLORS) {
          addAttribute(b, TextAttribute.FOREGROUND, COLORS_SHADOW[t], s, e);
          addAttribute(a, TextAttribute.FOREGROUND, COLORS[t], s, e);
          return;
        }
        if (t === 'l') {
          addAttribute(b, TextAttribute.WEIGHT, TextAttribute.WEIGHT_BOLD, s, e);
          addAttribute(a, TextAttribute.WEIGHT, TextAttribute.WEIGHT_BOLD, s, e);
          return;
        }
        if (t === 'o') {
          addAttribute(b, TextAttribute.POSTURE, TextAttribute.POSTURE_OBLIQUE, s, e);
          addAttribute(a, TextAttribute.POSTURE, TextAttribute.POSTURE_OBLIQUE, s, e);
          return;
        }
        if (t === 'm') {
          addAttribute(b, TextAttribute.STRIKETHROUGH, TextAttribute.STRIKETHROUGH_ON, s, e);
          addAttribute(a, TextAttribute.STRIKETHROUGH, TextAttribute.STRIKETHROUGH_ON, s, e);
          return;
        }
        if (t === 'n') {
          addAttribute(b, TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_LOW_ONE_PIXEL, s, e);
          addAttribute(a, TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_LOW_ONE_PIXEL, s, e);
          return;
        }
        throw 'unknown attribute: ' + t;
      });

      v.a = a;
      v.b = b;
      if (o.length) {
        hasObf = true;
        o.forEach(v => v.unshift(new TextLayout(a.getIterator(null, v[0], v[1]), tmpG.getFontRenderContext()).getAdvance()));
      }
      v.o = o;
      const tly = new TextLayout(a.getIterator(), tmpG.getFontRenderContext());
      v.w = tly.getAdvance();
      lineW = Math.max(lineW, v.w);
      v.vw = tly.getVisibleAdvance();
      lineVW = Math.max(lineVW, v.vw);
      v.d = false;
    });
    tmpG.dispose();
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
    img?.draw(rx, ry, rw, rh);
    GlStateManager2.depthMask(true);
    GlStateManager2.disableBlend();
    if (!dirty) return;

    img?.destroy();
    updateLines();
    img = new BufferedImageWrapper(renderImage());
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