import { drawOutlinedString } from './draw';
import reg from './registerer';
const EventEmitter = require('./events');

/**
 * @type {DisplayLine[]}
 */
let dlPool = [];
function getLine() {
  if (dlPool.length === 0) return createNonShitDisplayLineFuckChatTriggers();
  return dlPool.pop();
}
function freeLines(lines) {
  dlPool = dlPool.concat(lines);
}
const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');
const MouseListener = Java.type('com.chattriggers.ctjs.minecraft.listeners.MouseListener');
const clickListenersF = MouseListener.class.getDeclaredField('clickListeners');
clickListenersF.setAccessible(true);
const draggedListenersF = MouseListener.class.getDeclaredField('draggedListeners');
draggedListenersF.setAccessible(true);
function createNonShitDisplayLineFuckChatTriggers() {
  const line = new DisplayLine('');
  if (helper) {
    helper.removeLastElement(clickListenersF, MouseListener);
    helper.removeLastElement(draggedListenersF, MouseListener);
  }
  return line;
}
const textWidthF = DisplayLine.class.getSuperclass().getDeclaredField('textWidth');
textWidthF.setAccessible(true);
/**
 *
 * @param {DisplayLine} line
 * @param {string} text
 */
function setTextOfDisplayLineFuckChatTriggers(line, text) {
  line.getText().setString(text);
  textWidthF.set(line, new (Java.type('java.lang.Float'))(Renderer.getStringWidth(text) * line.getText().getScale()));
  return line;
}

/**
 * @typedef {import('./events').EventEmitterImpl<'editClose' | 'editKey'> & {
 *  display: Display
 *  getLoc: () => import('../data').TextLocation;
 *  isEdit: boolean;
 *  getEditText: () => string[];
 *  str: string;
 *  edit(): void;
 *  render(): void;
 *  setLine(str: string): CustomTextGui;
 *  setLines(strs: string[]): CustomTextGui;
 *  addLine(str: string): CustomTextGui;
 *  addLines(strs: string[]): CustomTextGui;
 *  clearLines(): CustomTextGui;
 * }} CustomTextGui
 */
const displaysF = DisplayHandler.class.getDeclaredField('displays');
displaysF.setAccessible(true);
/**
 * @param {() => import('../data').TextLocation} getLoc
 * @param {() => string[]} getEditText
 * @param {string?} customEditMsg
 * @returns {CustomTextGui}
 */
function createTextGui(getLoc, getEditText, str = '') {
  /**
   * @type {CustomTextGui}
   */
  const obj = new EventEmitter();
  obj.display = new Display();
  const isRemoved = helper ? helper.removeLastElement(displaysF, DisplayHandler) : false;
  obj.display.setShouldRender(isRemoved);
  obj.getLoc = getLoc;
  obj.isEdit = false;
  obj.getEditText = getEditText;
  obj.str = str;
  obj.edit = function() {
    this.isEdit = true;
    curr = this;
    renderReg.register();
    editGui.open();
  };
  let cx = 0;
  let cy = 0;
  let cs = 0;
  let ca = 0;
  let cb = false;
  const updateLoc = () => {
    let x = cx;
    let y = cy;
    // if (ca & 2 && cll > 0) y -= obj.display.getLine(0).getText().getHeight();
    if (ca & 2) y -= cs * 10;
    obj.display.setRenderX(x);
    obj.display.setRenderY(y);
  };
  const updateLocCache = () => {
    const l = obj.getLoc();
    if (!l) return;
    const { x, y, s, a, b } = l;
    let update = false;
    if (x !== cx) {
      cx = x;
      update = true;
    }
    if (y !== cy) {
      cy = y;
      update = true;
    }
    if (s !== cs) {
      cs = s;
      obj.display.getLines().forEach(v => v.setScale(s));
      update = true;
    }
    if (a !== ca) {
      ca = a;
      obj.display.setAlign(a & 1 ? 'RIGHT' : 'LEFT');
      obj.display.setOrder(a & 2 ? 'UP' : 'DOWN');
      if (a === 4) obj.display.setAlign('CENTER');
      update = true;
    }
    if (b !== cb) {
      cb = b;
      obj.display.getLines().forEach(v => v.setShadow(b));
    }
    if (update) updateLoc();
  };
  Client.scheduleTask(() => updateLocCache());
  obj.render = function() {
    if (this.isEdit) return;
    updateLocCache();
    // wouldn't have to do this if DisplayHandler checks if should render and Display.render() always renders but here we are
    if (!isRemoved) this.display.setShouldRender(true);
    this.display.render();
    if (!isRemoved) this.display.setShouldRender(false);
  };
  const BLANK_STRING = Math.random().toString();
  let cstr = BLANK_STRING;
  let cll = 0;
  obj.setLine = function(str) {
    if (str !== cstr) {
      this.clearLines();
      cstr = str;
      cll = 1;
      this.display.addLine(setTextOfDisplayLineFuckChatTriggers(getLine(), cstr).setScale(cs).setShadow(cb));
    }
    return this;
  };
  obj.setLines = function(strs) {
    if (strs.length === 0) return this.clearLines();
    if (strs.length === 1) return this.setLine(strs[0]);
    if (strs.length < cll) {
      if (ca & 2) freeLines(this.display.getLines().slice(0, cll - strs.length));
      else freeLines(this.display.getLines().slice(strs.length));
      while (strs.length < cll) {
        this.display.removeLine(ca & 2 ? 0 : cll - 1);
        cll--;
      }
    }
    while (strs.length > cll) {
      this.display.addLine(ca & 2 ? 0 : cll, getLine().setScale(cs).setShadow(cb));
      cll++;
    }
    strs.forEach((v, i) => {
      const l = this.display.getLine(ca & 2 ? cll - i - 1 : i);
      if (l.getText().getString() === v) return;
      setTextOfDisplayLineFuckChatTriggers(l, v);
    });
    cstr = BLANK_STRING;
    return this;
  };
  obj.addLine = function(str) {
    const i = (ca & 2) ? 0 : cll;
    this.display.addLine(i, setTextOfDisplayLineFuckChatTriggers(getLine().setScale(cs).setShadow(cb), str));
    cll++;
    cstr = BLANK_STRING;
    return this;
  };
  obj.addLines = function(strs) {
    strs.forEach(this.addLine, this);
    return this;
  };
  obj.clearLines = function() {
    freeLines(this.display.getLines());
    this.display.clearLines();
    cll = 0;
    cstr = BLANK_STRING;
    return this;
  };

  return obj;
}
export default createTextGui;

const editGui = new Gui();
const editDisplay = createTextGui(() => curr.getLoc(), () => []);
/**
 * @type {CustomTextGui}
 */
let curr;
const renderReg = reg('renderOverlay', () => {
  Renderer.drawRect(0x80000000, 0, 0, 5000, 5000);

  editDisplay.setLines(curr.getEditText());
  editDisplay.render();

  const editStr = '&7[&21&7] &fReset &8| &7[&22&7] &fChange Anchor &8| &7[&23&7] &fToggle Shadow &8| &7[&2Scroll&7] &fResize &8| &7[&2Drag&7] &fMove' + curr.str;
  // const w = Renderer.getStringWidth(editStr);
  // Renderer.drawRect(0xB0000000, 40, 15, w + 20, 20);
  drawOutlinedString(editStr, 50, 20);
  Renderer.drawCircle(0xFF0000FF, curr.getLoc().x, curr.getLoc().y, 5, 10);
}, 'customtextgui');

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