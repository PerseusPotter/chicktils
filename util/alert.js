import { _setTimeout, _clearTimeout } from './timers';
import createTextGui from './customtextgui';
import reg from './registerer';
import { StateProp, StateVar } from './state';

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
const activeAlert = new StateVar(null);
const renderReg = reg('renderOverlay', () => activeAlert.get()?._display?.render()).setEnabled(new StateProp(activeAlert).notequals(null));

const createAlert = (function() {
  let alertSound;
  const proto = {
    text: '',
    _timeout: undefined,
    _display: undefined,
    show(time) {
      this.hide();
      activeAlert.set(this);
      renderReg.register();
      if (time) {
        if (this._timeout !== undefined) _clearTimeout(this._timeout);
        this._timeout = _setTimeout(() => this.hide(), time, this);
      }
      try {
        if (this.sound) {
          if (!alertSound) alertSound = new Sound({ source: 'orb.ogg', priority: true, attenuation: 0, pitch: 0.5, volume: 1 });
          alertSound.play();
        }
      } catch (e) { }
    },
    hide() {
      this._display?._rmCache();
      if (activeAlert.get() === this) activeAlert.set(null);
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
    obj._display = createTextGui(() => ({ a: 0, c: 3, s: scale, x: Renderer.screen.getWidth() / 2, y: Renderer.screen.getHeight() / 2 - 30, b: true }));
    obj._display.setLine('&c' + txt);
    obj.sound = sound;
    Object.defineProperty(obj, 'text', {
      get() {
        return txt;
      },
      set(v) {
        txt = v;
        obj._display.setLine('&c' + v);
      }
    });
    return obj;
  };
}());
export default createAlert;