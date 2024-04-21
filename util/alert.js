import { _setTimeout, _clearTimeout } from './timers';

const createAlert = (function() {
  const alertSound = new Sound({ source: 'orb.ogg', priority: true, attenuation: 0, pitch: 0.5, volume: 1 });
  const proto = {
    text: '',
    _timeout: undefined,
    _display: undefined,
    show(time) {
      this._display.setRenderLoc(Renderer.screen.getWidth() / 2, Renderer.screen.getHeight() / 2 - 30);
      this._display.show();
      if (time) {
        if (this._timeout !== undefined) _clearTimeout(this._timeout);
        this._timeout = _setTimeout(() => this.hide(), time, this);
      }
      if (this.sound) alertSound.play();
    },
    hide() {
      this._display.hide();
      if (this._timeout !== undefined) this._timeout = void (_clearTimeout(this._timeout));
    }
  };
  /**
   * @param {string?} txt
   * @param {number?} scale
   * @param {boolean?} sound
   * @returns {{
   *  _display: Display;
   *  sound: boolean;
   *  text: string;
   *  _timeout: number?;
   *  show: (time?: number) => void;
   *  hide: () => void;
   * }}
   */
  return function(txt = 'alert', scale = 5, sound = true) {
    let obj = Object.create(proto);
    obj._display = new Display();
    obj._display.setAlign('CENTER');
    obj._display.setTextColor(Renderer.RED);
    obj._display.addLine(new DisplayLine(txt).setScale(scale));
    obj._display.setRenderLoc(Renderer.screen.getWidth() / 2, Renderer.screen.getHeight() / 2 - 30);
    obj._display.hide();
    obj.sound = sound;
    Object.defineProperty(obj, 'text', {
      get() {
        return obj._display.getLine(0).getText();
      },
      set(v) {
        obj._display.getLine(0).setText(v).setScale(scale);
      }
    });
    return obj;
  };
}());
export default createAlert;