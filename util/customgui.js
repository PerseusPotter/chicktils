import reg from './registerer';

const EventEmitter = require('./events');

const editGui = new Gui();
/**
 * @type {CustomGui}
 */
let curr;
const renderReg = reg('renderOverlay', () => {
  Renderer.drawRect(0x80000000, 0, 0, 5000, 5000);

  curr.renderEdit();

  Renderer.drawStringWithShadow('&7[&21&7] &fReset &8| &7[&2Scroll&7] &fResize &8| &7[&2Drag&7] &fMove' + curr.str, 50, 20);
  const x1 = curr.getX1() + 1;
  const x2 = curr.getX2() - 1;
  const y1 = curr.getY1() + 1;
  const y2 = curr.getY2() - 1;
  Renderer.drawLine(0xFFFF0000, x1, y1, x2, y1, 2);
  Renderer.drawLine(0xFFFF0000, x2, y1, x2, y2, 2);
  Renderer.drawLine(0xFFFF0000, x2, y2, x1, y2, 2);
  Renderer.drawLine(0xFFFF0000, x1, y2, x1, y1, 2);
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

/**
 * @typedef {import('./events').EventEmitterImpl<'editClose' | 'editKey'> & {
 *  getLoc: () => import('../data').Location;
 *  isEdit: boolean;
 *  str: string;
 *  render: (this: CustomGui) => void;
 *  renderEdit: (this: CustomGui) => void;
 *  edit: () => void;
 *  x: (x: number) => number;
 *  y: (y: number) => number;
 *  scale: (n: number) => number;
 *  getBaseW: () => number;
 *  getBaseH: () => number;
 *  getW: () => number;
 *  getH: () => number;
 *  getX1: () => number;
 *  getY1: () => number;
 *  getX2: () => number;
 *  getY2: () => number;
 *  getScale: () => number;
 * }} CustomGui
 */
/**
 * @param {() => import('../data').Location} getLoc
 * @param {() => number} getW
 * @param {() => number} getH
 * @param {(this: CustomGui) => void} render
 * @param {?(this: CustomGui) => void} renderEdit
 * @param {string?} str
 * @returns {CustomGui}
 */
export default function createGui(getLoc, getW, getH, render, renderEdit, str = '') {
  /**
   * @type {CustomGui}
   */
  const obj = new EventEmitter();
  obj.getLoc = getLoc;
  obj.isEdit = false;
  obj.str = str;
  obj.getBaseW = getW;
  obj.getBaseH = getH;
  obj.edit = function() {
    this.isEdit = true;
    curr = this;
    renderReg.register();
    editGui.open();
  };
  obj.render = function() {
    if (this.isEdit) return;
    render.call(this);
  };
  if (!renderEdit) renderEdit = Function.prototype;
  obj.renderEdit = function() {
    if (!this.isEdit) return;
    renderEdit.call(this);
  };
  obj.x = function x(x) {
    const l = this.getLoc();
    return l.x + x * this.getBaseW() * l.s;
  };
  obj.y = function y(y) {
    const l = this.getLoc();
    return l.y + y * this.getBaseH() * l.s;
  };
  obj.scale = function scale(n) {
    return n * this.getLoc().s;
  };
  obj.getW = function() {
    return this.getBaseW() * this.getLoc().s;
  };
  obj.getH = function() {
    return this.getBaseH() * this.getLoc().s;
  };
  obj.getX1 = function() {
    const l = this.getLoc();
    return l.x;
  };
  obj.getY1 = function() {
    const l = this.getLoc();
    return l.y;
  };
  obj.getX2 = function() {
    const l = this.getLoc();
    return l.x + this.getBaseW() * l.s;
  };
  obj.getY2 = function() {
    const l = this.getLoc();
    return l.y + this.getBaseH() * l.s;
  };
  obj.getScale = function() {
    const l = this.getLoc();
    return l.s;
  };

  return obj;
}