import { _setTimeout, _clearTimeout } from './timers';
import createTextGui from './customtextgui';
import { reg } from './registerer';

/**
 * @typedef {{
   *  _display: import('./customtextgui').CustomTextGui;
*  sound: boolean;
*  text: string;
*  _timeout: number?;
*  show: (time?: number) => void;
*  hide: () => void;
* }} Alert
 */
/**
 * @type {Alert[]}
 */
const activeAlerts = [];
const renderReg = reg('renderOverlay', () => activeAlerts.forEach(v => v._display.render()));

const createAlert = (function() {
  const alertSound = new Sound({ source: 'orb.ogg', priority: true, attenuation: 0, pitch: 0.5, volume: 1 });
  const proto = {
    text: '',
    _timeout: undefined,
    _display: undefined,
    show(time) {
      activeAlerts.push(this);
      renderReg.register();
      if (time) {
        if (this._timeout !== undefined) _clearTimeout(this._timeout);
        this._timeout = _setTimeout(() => this.hide(), time, this);
      }
      if (this.sound) alertSound.play();
    },
    hide() {
      const i = activeAlerts.indexOf(this);
      if (i >= 0) activeAlerts.splice(i, 1);
      if (activeAlerts.length === 0) renderReg.unregister();
      if (this._timeout !== undefined) this._timeout = void (_clearTimeout(this._timeout));
    }
  };
  /**
   * @param {string?} txt
   * @param {number?} scale
   * @param {boolean?} sound
   * @returns {Alert}
   */
  return function(txt = 'alert', scale = 5, sound = true) {
    /**
     * @type {Alert}
     */
    let obj = Object.create(proto);
    obj._display = createTextGui(() => ({ a: 4, s: scale, x: Renderer.screen.getWidth() / 2, y: Renderer.screen.getHeight() / 2 - 30 }));
    obj._display.display.setTextColor(Renderer.RED);
    obj._display.setLine(txt);
    obj.sound = sound;
    Object.defineProperty(obj, 'text', {
      get() {
        return obj._display.display.getLine(0).getText();
      },
      set(v) {
        obj._display.setLine(v);
      }
    });
    return obj;
  };
}());
export default createAlert;