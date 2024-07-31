import { drawString } from './draw';
import glStateManager from './glStateManager';
import { compareFloat } from './math';

export default class Marquee {
  text = '';
  pos = 0;
  frozenTime = 0;
  maxLen = 0;
  textWidth = 0;
  lastRender = 0;
  scrollSpeed = 0.1;
  isEnd = false;
  freezeTime = 1500;

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
    this.textWidth = Renderer.getStringWidth(text);
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
    glStateManager.pushMatrix();
    glStateManager.translate(x, y, 0);
    glStateManager.scale(scale, scale, 1);
    if (this.maxLen === 0) drawString(this.text, 0, 0, shadow);
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

        const maxPos = Math.max(this.textWidth - this.maxLen / scale, 0);
        a = Math.min(dt, (maxPos - this.pos) / this.scrollSpeed);
        dt -= a;
        this.pos += a * this.scrollSpeed;

        const oIsEnd = this.isEnd;
        this.isEnd = compareFloat(this.pos, maxPos) >= 0;
        if (this.isEnd && !oIsEnd) this.frozenTime = this.freezeTime;
      }

      drawString(this.text, -this.pos, 0, shadow);

      GL11.glDisable(GL11.GL_SCISSOR_TEST);
    }
    glStateManager.popMatrix();
  }
}