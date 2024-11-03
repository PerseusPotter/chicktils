import createTextGui from './customtextgui';
import { compareFloat } from './math';

export default class Marquee {
  text = '';
  pos = 0;
  frozenTime = 0;
  maxLen = 0;
  lastRender = 0;
  scrollSpeed = 0.1;
  isEnd = false;
  freezeTime = 1500;
  px = 0;
  py = 0;
  ps = 1;
  pb = false;
  textGui = createTextGui(() => ({ x: this.px, y: this.py, s: this.ps, a: 0, b: this.pb, c: 0 }), () => []);

  /**
   * @param {string} text
   * @param {number?} scrollSpeed (0.1) pixels per ms
   */
  constructor(text, scrollSpeed) {
    this.setText(text);
    if (scrollSpeed) this.scrollSpeed = scrollSpeed;
  }
  reset() {
    this.pos = 0;
    this.frozenTime = this.freezeTime;
    this.isEnd = false;
  }
  /**
   * @param {string} text
   */
  setText(text) {
    if (text === this.text) return;
    this.text = text;
    this.textGui.setLine(text);
    this.reset();
  }
  /**
   * @param {number} maxLen
   */
  setMaxLen(maxLen) {
    this.maxLen = maxLen;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {boolean} shadow
   */
  render(x, y, scale, shadow) {
    this.px = x;
    this.py = y;
    this.ps = scale;
    this.pb = shadow;
    if (this.maxLen === 0) this.textGui.render();
    else {
      GL11.glEnable(GL11.GL_SCISSOR_TEST);
      const ss = Renderer.screen.getScale();
      GL11.glScissor(
        x * ss,
        (Renderer.screen.getHeight() - y - 10 * scale) * ss,
        this.maxLen * ss,
        10 * scale * ss
      );

      const d = Date.now();
      let dt = d - this.lastRender;
      this.lastRender = d;
      if (dt > this.freezeTime * 2) this.reset();
      else {
        let a = Math.min(dt, this.frozenTime);
        dt -= a;
        this.frozenTime -= a;
        if (this.frozenTime === 0 && this.isEnd) {
          this.reset();
          a = Math.min(dt, this.frozenTime);
          dt -= a;
          this.frozenTime -= a;
        }

        const maxPos = Math.max(this.textGui.getVisibleWidth() - this.maxLen, 0);
        a = Math.min(dt, (maxPos - this.pos) / this.scrollSpeed);
        dt -= a;
        this.pos += a * this.scrollSpeed;

        const oIsEnd = this.isEnd;
        this.isEnd = compareFloat(this.pos, maxPos) >= 0;
        if (this.isEnd && !oIsEnd) this.frozenTime = this.freezeTime;
      }

      this.px -= this.pos;
      this.textGui.render();

      GL11.glDisable(GL11.GL_SCISSOR_TEST);
    }
  }
}