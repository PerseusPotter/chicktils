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
  let cx = -0.696942;
  let cy = -0.696942;
  let cs = -0.696942;
  let ca = -0.696942;
  const updateLocCache = () => {
    const l = obj.getLoc();
    if (!l) return;
    const { x, y, s, a } = l;
    if (x !== cx) {
      cx = x;
      obj.display.setRenderX(x);
    }
    if (y !== cy) {
      cy = y;
      obj.display.setRenderY(y);
    }
    if (s !== cs) {
      cs = s;
      obj.display.getLines().forEach(v => v.setScale(s));
    }
    if (a !== ca) {
      ca = a;
      obj.display.setAlign((a & 1) === 0 ? 'LEFT' : 'RIGHT');
      obj.display.setOrder((a & 2) === 0 ? 'DOWN' : 'UP');
      if (a === 4) obj.display.setAlign('CENTER');
    }
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
  let cstr = 'googoogAA gaa';
  let cll = 0;
  obj.setLine = function(str) {
    if (str !== cstr) {
      this.clearLines();
      cstr = str;
      cll = 1;
      this.display.addLine(getLine().setText(cstr).setScale(cs));
    }
    return this;
  };
  obj.setLines = function(strs) {
    this.clearLines();
    this.addLines(strs);
    return this;
  };
  obj.addLine = function(str) {
    const i = (ca & 2) ? 0 : cll;
    this.display.addLine(i, getLine().setText(str).setScale(cs));
    cll++;
    cstr = 'googoogAA gaa';
    return this;
  };
  obj.addLines = function(strs) {
    strs.forEach(this.addLine, this);
    return this;
  };
  obj.clearLines = function() {
    freeLines(obj.display.getLines());
    this.display.clearLines();
    cll = 0;
    cstr = 'googoogAA gaa';
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

  Renderer.drawStringWithShadow('&7[&21&7] &fReset &8| &7[&22&7] &fChange Anchor &8| &7[&2Scroll&7] &fResize &8| &7[&2Middle Drag&7] &fMove' + curr.str, 50, 20);
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
      break;
    case 3:
      l.a = (l.a + 1) & 3;
      break;
    default:
      curr.emit('editKey', n);
  }
});
editGui.registerMouseDragged((x, y, b) => {
  if (b !== 2) return;
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