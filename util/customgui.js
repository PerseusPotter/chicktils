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
  const { x, y, s } = curr.getLoc();

  Renderer.drawStringWithShadow('&7[&21&7] &fReset &8| &7[&2Scroll&7] &fResize &8| &7[&2Drag&7] &fMove' + curr.str, 50, 20);
  const x1 = x + 1;
  const x2 = x + 100 * s - 1;
  const y1 = y + 1;
  const y2 = y + 100 * s - 1;
  Renderer.drawLine(0xFFFF0000, x1, y1, x2, y1, 2);
  Renderer.drawLine(0xFFFF0000, x2, y1, x2, y2, 2);
  Renderer.drawLine(0xFFFF0000, x2, y2, x1, y2, 2);
  Renderer.drawLine(0xFFFF0000, x1, y2, x1, y1, 2);
}, 'customgui');

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
 *  getX: (x: number) => number;
 *  getY: (y: number) => number;
 *  scale: (n: number) => number;
 *  getW: () => number;
 *  getH: () => number;
 *  getX2: () => number;
 *  getY2: () => number;
 * }} CustomGui
 */
/**
 * @param {() => import('../data').Location} getLoc
 * @param {(this: CustomGui) => void} render
 * @param {?(this: CustomGui) => void} renderEdit
 * @param {string?} str
 * @returns {CustomGui}
 */
export default function createGui(getLoc, render, renderEdit, str = '') {
  /**
   * @type {CustomGui}
   */
  const obj = new EventEmitter();
  obj.getLoc = getLoc;
  obj.isEdit = false;
  obj.str = str;
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
  obj.getX = function getX(x) {
    const l = this.getLoc();
    return l.x + x * l.s;
  };
  obj.getY = function getY(y) {
    const l = this.getLoc();
    return l.y + y * l.s;
  };
  obj.scale = function scale(n) {
    return n * this.getLoc().s;
  };
  obj.getW = function() {
    return 100 * this.getLoc().s;
  };
  obj.getH = function() {
    return 100 * this.getLoc().s;
  };
  obj.getX2 = function() {
    const l = this.getLoc();
    return l.x + 100 * l.s;
  };
  obj.getY2 = function() {
    const l = this.getLoc();
    return l.y + 100 * l.s;
  };

  return obj;
}