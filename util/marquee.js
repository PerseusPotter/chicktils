import createTextGui from './customtextgui';

export default class Marquee {
  text = '';
  maxLen = 0;
  scrollSpeed = 20;
  freezeTime = 1500;
  alternate = false;
  startTime = 0;
  px = 0;
  py = 0;
  ps = 1;
  pb = false;
  textGui = createTextGui(() => ({ x: this.px, y: this.py, s: this.ps, a: 0, b: this.pb, c: 0 }), () => []);

  /**
   * @param {string} text
   */
  constructor(text) {
    this.setText(text);
  }

  reset() {
    this.startTime = Date.now();
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
    if (maxLen === this.maxLen) return;
    this.maxLen = maxLen;
    this.reset();
  }
  /**
   * @param {number} scrollSpeed
   */
  setScrollSpeed(scrollSpeed) {
    if (scrollSpeed === this.scrollSpeed) return;
    this.scrollSpeed = scrollSpeed;
    this.reset();
  }
  /**
   * @param {number} freezeTime
   */
  setFreezeTime(freezeTime) {
    if (freezeTime === this.freezeTime) return;
    this.freezeTime = freezeTime;
    this.reset();
  }
  /**
   * @param {number} alternate
   */
  setAlternate(alternate) {
    if (alternate === this.alternate) return;
    this.alternate = alternate;
    this.reset();
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
        (Renderer.screen.getHeight() - y - 15 * scale) * ss,
        this.maxLen * ss,
        20 * scale * ss
      );

      const scrollLength = Math.max(this.textGui.getVisibleWidth() - this.maxLen, 0);
      const scrollTime = scrollLength * 1000 / this.scrollSpeed;
      const cycleTime = this.freezeTime + scrollTime + this.freezeTime + (this.alternate ? scrollTime : 0);

      const time = Date.now() - this.startTime;
      const cycleOffset = time % cycleTime;

      const pos = cycleOffset < this.freezeTime ? 0 :
        cycleOffset < this.freezeTime + scrollTime ? (cycleOffset - this.freezeTime) / scrollTime :
          cycleOffset < this.freezeTime + scrollTime + this.freezeTime ? 1 :
            1 - (cycleOffset - this.freezeTime - scrollTime - this.freezeTime) / scrollTime;

      this.px -= scrollLength * pos;
      this.textGui.render();

      GL11.glDisable(GL11.GL_SCISSOR_TEST);
    }
  }
}