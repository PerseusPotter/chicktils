// vigilance refused to work

import convertToAmaterasu from './settingsAmaterasu';
import { centerMessage } from './util/format';
import { deleteMessages } from './util/helper';
import { log, logMessage } from './util/log';
import { StateVar } from './util/state';
import { run } from './util/threading';

// if reloading modules without cache it resets settings :(
let isMainSettings = false;
export function setIsMain() {
  isMainSettings = true;
};
/**
 * @template {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7} T
 * @template {string | number | boolean | null} V
 * @template {string} O
 * @extends {StateVar<T extends 0 ? boolean : T extends 4 ? string : T extends 6 ? O : T extends 7 ? null : number>}
 */
export class Property extends StateVar {
  /**
   * @type {{ Toggle: 0, Integer: 1, Number: 2, Percent: 3, Text: 4, Color: 5, Option: 6, Action: 7 }}
   */
  static Type = {
    Toggle: 0,
    Integer: 1,
    Number: 2,
    Percent: 3,
    Text: 4,
    Color: 5,
    Option: 6,
    Action: 7
  };
  /**
   *
   * @param {string} name
   * @param {number} page
   * @param {number} pageSort
   * @param {T} type
   * @param {V} defaultValue
   * @param {{ desc: string, min: number, max: number, len: number, options: O[] }} opts
   */
  constructor(name, page, pageSort, type, defaultValue, { desc = '', min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, len = Number.POSITIVE_INFINITY, options = [] } = {}) {
    super(defaultValue);
    if (name.includes(' ')) throw 'bad parser deal with it';
    this.name = name;
    this.desc = desc;
    this.page = page;
    this.sort = pageSort;
    this.type = type;
    /**
     * @type {T extends 0 ? boolean : T extends 4 ? string : T extends 6 ? O : T extends 7 ? null : number}
     */
    this.value;
    // typescript </3
    this.value = defaultValue;
    /**
     * @type {V}
     */
    this.defaultValue = defaultValue;
    /**
     * @type {{ min?: number, max?: number, len?: number, options?: O[] }}
     */
    this.opts = { min, max, len, options };
    this.actionListeners = [];
  }
  set(v, force) {
    if (this.type === Property.Type.Action) return;
    if (v === this.value) {
      if (force) this.trigger(v);
    } else super.set(v);
  }
  validate(v) {
    switch (this.type) {
      case Property.Type.Toggle: break;
      case Property.Type.Integer:
      case Property.Type.Number:
      case Property.Type.Percent:
        if (v < this.opts.min) throw 'value must not be below ' + this.opts.min;
        if (v > this.opts.max) throw 'value must not be above ' + this.opts.max;
        break;
      case Property.Type.Text:
        if (v.length > this.opts.len) throw 'length of string must not exceed ' + this.opts.len;
        break;
      case Property.Type.Option: break;
      case Property.Type.Color: break;
      case Property.Type.Action: break;
    }
  }
  valueOf() {
    if (this.type === Property.Type.Percent) return this.value / 100;
    return this.value;
  }
  toString() {
    switch (this.type) {
      case Property.Type.Toggle:
      case Property.Type.Integer:
      case Property.Type.Number:
      case Property.Type.Text:
      case Property.Type.Option:
        return this.value.toString();
      case Property.Type.Percent: return this.value.toString() + '%';
      case Property.Type.Color: return '#' + this.value.toString(16).toUpperCase().padStart(8, '0');
      case Property.Type.Action: return '';
    }
  }
  parse(str) {
    const v = this._parse(str);
    this.validate(v);
    return v;
  }
  _parse(str) {
    str = str.trim();
    const truthy = ['true', 'True', 'TRUE', 't', 'T', 'y', 'Y', '1'];
    const falsy = ['false', 'False', 'FALSE', 'f', 'F', 'n', 'N', '0'];
    const colors = {
      black: 0x000000FF,
      silver: 0xC0C0C0FF,
      gray: 0x808080FF,
      white: 0xFFFFFFFF,
      maroon: 0x800000FF,
      red: 0xFF0000FF,
      purple: 0x800080FF,
      fuchsia: 0xFF00FFFF,
      green: 0x008000FF,
      lime: 0x00FF00FF,
      olive: 0x808000FF,
      yellow: 0xFFFF00FF,
      navy: 0x000080FF,
      blue: 0x0000FFFF,
      teal: 0x008080FF,
      aqua: 0x00FFFFFF,
      aliceblue: 0xF0F8FFFF,
      antiquewhite: 0xFAEBD7FF,
      aqua: 0x00FFFFFF,
      aquamarine: 0x7FFFD4FF,
      azure: 0xF0FFFFFF,
      beige: 0xF5F5DCFF,
      bisque: 0xFFE4C4FF,
      black: 0x000000FF,
      blanchedalmond: 0xFFEBCDFF,
      blue: 0x0000FFFF,
      blueviolet: 0x8A2BE2FF,
      brown: 0xA52A2AFF,
      burlywood: 0xDEB887FF,
      cadetblue: 0x5F9EA0FF,
      chartreuse: 0x7FFF00FF,
      chocolate: 0xD2691EFF,
      coral: 0xFF7F50FF,
      cornflowerblue: 0x6495EDFF,
      cornsilk: 0xFFF8DCFF,
      crimson: 0xDC143CFF,
      cyan: 0x00FFFFFF,
      darkblue: 0x00008BFF,
      darkcyan: 0x008B8BFF,
      darkgoldenrod: 0xB8860BFF,
      darkgray: 0xA9A9A9FF,
      darkgreen: 0x006400FF,
      darkgrey: 0xA9A9A9FF,
      darkkhaki: 0xBDB76BFF,
      darkmagenta: 0x8B008BFF,
      darkolivegreen: 0x556B2FFF,
      darkorange: 0xFF8C00FF,
      darkorchid: 0x9932CCFF,
      darkred: 0x8B0000FF,
      darksalmon: 0xE9967AFF,
      darkseagreen: 0x8FBC8FFF,
      darkslateblue: 0x483D8BFF,
      darkslategray: 0x2F4F4FFF,
      darkslategrey: 0x2F4F4FFF,
      darkturquoise: 0x00CED1FF,
      darkviolet: 0x9400D3FF,
      deeppink: 0xFF1493FF,
      deepskyblue: 0x00BFFFFF,
      dimgray: 0x696969FF,
      dimgrey: 0x696969FF,
      dodgerblue: 0x1E90FFFF,
      firebrick: 0xB22222FF,
      floralwhite: 0xFFFAF0FF,
      forestgreen: 0x228B22FF,
      fuchsia: 0xFF00FFFF,
      gainsboro: 0xDCDCDCFF,
      ghostwhite: 0xF8F8FFFF,
      gold: 0xFFD700FF,
      goldenrod: 0xDAA520FF,
      gray: 0x808080FF,
      green: 0x008000FF,
      greenyellow: 0xADFF2FFF,
      grey: 0x808080FF,
      honeydew: 0xF0FFF0FF,
      hotpink: 0xFF69B4FF,
      indianred: 0xCD5C5CFF,
      indigo: 0x4B0082FF,
      ivory: 0xFFFFF0FF,
      khaki: 0xF0E68CFF,
      lavender: 0xE6E6FAFF,
      lavenderblush: 0xFFF0F5FF,
      lawngreen: 0x7CFC00FF,
      lemonchiffon: 0xFFFACDFF,
      lightblue: 0xADD8E6FF,
      lightcoral: 0xF08080FF,
      lightcyan: 0xE0FFFFFF,
      lightgoldenrodyellow: 0xFAFAD2FF,
      lightgray: 0xD3D3D3FF,
      lightgreen: 0x90EE90FF,
      lightgrey: 0xD3D3D3FF,
      lightpink: 0xFFB6C1FF,
      lightsalmon: 0xFFA07AFF,
      lightseagreen: 0x20B2AAFF,
      lightskyblue: 0x87CEFAFF,
      lightslategray: 0x778899FF,
      lightslategrey: 0x778899FF,
      lightsteelblue: 0xB0C4DEFF,
      lightyellow: 0xFFFFE0FF,
      lime: 0x00FF00FF,
      limegreen: 0x32CD32FF,
      linen: 0xFAF0E6FF,
      magenta: 0xFF00FFFF,
      maroon: 0x800000FF,
      mediumaquamarine: 0x66CDAAFF,
      mediumblue: 0x0000CDFF,
      mediumorchid: 0xBA55D3FF,
      mediumpurple: 0x9370DBFF,
      mediumseagreen: 0x3CB371FF,
      mediumslateblue: 0x7B68EEFF,
      mediumspringgreen: 0x00FA9AFF,
      mediumturquoise: 0x48D1CCFF,
      mediumvioletred: 0xC71585FF,
      midnightblue: 0x191970FF,
      mintcream: 0xF5FFFAFF,
      mistyrose: 0xFFE4E1FF,
      moccasin: 0xFFE4B5FF,
      navajowhite: 0xFFDEADFF,
      navy: 0x000080FF,
      oldlace: 0xFDF5E6FF,
      olive: 0x808000FF,
      olivedrab: 0x6B8E23FF,
      orange: 0xFFA500FF,
      orangered: 0xFF4500FF,
      orchid: 0xDA70D6FF,
      palegoldenrod: 0xEEE8AAFF,
      palegreen: 0x98FB98FF,
      paleturquoise: 0xAFEEEEFF,
      palevioletred: 0xDB7093FF,
      papayawhip: 0xFFEFD5FF,
      peachpuff: 0xFFDAB9FF,
      peru: 0xCD853FFF,
      pink: 0xFFC0CBFF,
      plum: 0xDDA0DDFF,
      powderblue: 0xB0E0E6FF,
      purple: 0x800080FF,
      red: 0xFF0000FF,
      rosybrown: 0xBC8F8FFF,
      royalblue: 0x4169E1FF,
      saddlebrown: 0x8B4513FF,
      salmon: 0xFA8072FF,
      sandybrown: 0xF4A460FF,
      seagreen: 0x2E8B57FF,
      seashell: 0xFFF5EEFF,
      sienna: 0xA0522DFF,
      silver: 0xC0C0C0FF,
      skyblue: 0x87CEEBFF,
      slateblue: 0x6A5ACDFF,
      slategray: 0x708090FF,
      slategrey: 0x708090FF,
      snow: 0xFFFAFAFF,
      springgreen: 0x00FF7FFF,
      steelblue: 0x4682B4FF,
      tan: 0xD2B48CFF,
      teal: 0x008080FF,
      thistle: 0xD8BFD8FF,
      tomato: 0xFF6347FF,
      turquoise: 0x40E0D0FF,
      violet: 0xEE82EEFF,
      wheat: 0xF5DEB3FF,
      white: 0xFFFFFFFF,
      whitesmoke: 0xF5F5F5FF,
      yellow: 0xFFFF00FF,
      yellowgreen: 0x9ACD32FF
    };
    switch (this.type) {
      case Property.Type.Toggle:
        if (str === 'TOGGLE') return !this.value;
        if (truthy.includes(str)) return true;
        if (falsy.includes(str)) return false;
        throw 'Invalid Boolean: ' + str;
      case Property.Type.Integer:
        if (!/^-?\d+$/.test(str)) throw 'Invalid Integer: ' + str;
        return parseInt(str);
      case Property.Type.Number:
        if (!/^-?\d*(?:\.\d+)?$/.test(str)) throw 'Invalid Number: ' + str;
        return +str;
      case Property.Type.Percent:
        if (/^-?\d*\.\d{1,2}$/.test(str)) return str * 100;
        if (/^-?\d+%?$/.test(str)) return parseInt(str);
        throw 'Invalid Percent: ' + str;
      case Property.Type.Text: return str;
      case Property.Type.Option:
        if (!this.opts.options.includes(str)) throw 'Invalid Option: ' + str;
        return str;
      case Property.Type.Color: {
        if (str.toLowerCase() in colors) return colors[str.toLowerCase()];
        if (/^#?(?:[0-9A-F]{6}|[0-9A-F]{8})$/i.test(str)) return parseInt(str.slice(str.length & 1).padEnd(8, 'F'), 16);
        const m = str.match(/rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d{1,3})\s*)?\)/i);
        if (m) {
          let [_, r, g, b, a] = m;
          if (!a) a = 255;
          r = +r;
          g = +g;
          b = +b;
          if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 255) throw 'Invalid RGB: ' + str;
          return (r << 24) | (g << 16) | (b << 8) | (a << 0);
        }
        throw 'Invalid Color: ' + str;
      }
      case Property.Type.Action: return this.value;
    }
  }
  /**
   * @param {(this: Property) => void} cb
   */
  onAction(cb) {
    this.actionListeners.push(cb);
  }

  getMessage(parity, module, name = this.name) {
    const c = parity ? ['&7', '&6', '&5', '&4', '&3', '&2', '&8'] : ['&f', '&e', '&d', '&c', '&b', '&a', '&7'];
    const comps = [this.desc ? new TextComponent(`${c[0]}${name}`).setHover('show_text', this.desc) : `${c[0]}${name}`];
    if (this.type === Property.Type.Action) comps.unshift(new TextComponent(`${c[6]}[  ${c[2]}RUN${c[6]}   ]&r `).setClick('run_command', `/${module} config_ edit ${this.name}`));
    else {
      comps.unshift(
        new TextComponent(`${c[6]}[ ${c[3]}RESET${c[6]} ]&r `).setClick('run_command', `/${module} config_ edit ${this.name}`),
        new TextComponent(`${c[6]}[  ${c[5]}EDIT${c[6]}  ]&r `).setClick('run_command', `/${module} config_edit ${this.name} ${this.toString()}`)
      );
      comps.push(`${c[6]}:${c[1]} ${this.toString()}`);
    }
    if (this.type === Property.Type.Toggle) comps[1] = new TextComponent(`${c[6]}[${c[4]}TOGGLE${c[6]}]&r `).setClick('run_command', `/${module} config_ edit ${this.name} TOGGLE`);
    return new Message(...comps);
  }
}

class Settings {
  constructor(module, path, props, pageNames) {
    this.module = module;
    this.path = path;
    let p = Object.entries(props).filter(v => v[1] instanceof Property);
    this.propIds = p.map(v => v[0]);
    /**
     * @type {Property[]}
     */
    this.props = p.map(v => {
      this[v[0]] = v[1].valueOf();
      this['_' + v[0]] = v[1];
      v[1].listen(() => this[v[0]] = v[1].valueOf());
      return v[1];
    });
    this.pageNames = pageNames;
    this.minPage = Math.min.apply(null, this.props.map(v => v.page));
    this.maxPage = Math.max.apply(null, this.props.map(v => v.page));

    // this.load();
    Client.scheduleTask(20, () => this.load(true));
  }

  load(isAutoLoad = false) {
    if (isMainSettings && isAutoLoad) return;
    const obj = JSON.parse(FileLib.read(this.module, this.path) || '{}');
    Object.entries(obj).forEach(([k, v]) => {
      k = '_' + k;
      if (!this[k] || !(this[k] instanceof Property)) return;
      try {
        this[k].set(this[k].parse(v), true);
      } catch (e) {
        log(`error parsing value for setting ${this[k].name}, reverting to default`);
        log(e);
      }
    });
    if (isMainSettings) {
      register('gameUnload', () => this.save());
      run(() => {
        this.amaterasu = convertToAmaterasu(this);
        this.amaterasu
          .setSize(70, 80)
          .setPos(15, 10)
          .apply();
      });
    }
  }

  save() {
    FileLib.write(this.module, this.path,
      JSON.stringify(
        this.props
          .map(v => v.type === Property.Type.Action ? undefined : v.toString())
          .reduce(
            (a, v, i) => (
              (a[this.propIds[i]] = v),
              a
            ),
            {}
          )
      )
    );
  }

  lastDisplay = { type: 'none', args: [], time: 0 };
  prevMsgs = [];
  /**
   * @param {number} page
   */
  display(page) {
    const props = this.props.filter(v => v.page === page);
    props.sort((a, b) => a.sort - b.sort);
    const msgs = props.map((p, i) => p.getMessage(i & 1, this.module));
    const pageNav = new Message(page === this.minPage ? '   ' : new TextComponent('&a<- ').setClick('run_command', `/${this.module} config_ view ${page - 1}`), `&fPage &6${page} &fof &6${this.maxPage}`, page === this.maxPage ? '   ' : new TextComponent('&a ->').setClick('run_command', `/${this.module} config_ view ${page + 1}`));
    centerMessage(pageNav);
    // msgs.unshift(pageNav.clone());
    msgs.unshift(new Message(centerMessage(`&d&l${this.module} &b&l${this.pageNames[page]} &d&lSettings`)));
    msgs.push(pageNav);
    // this.prevMsgs.forEach(v => ChatLib.deleteChat(v));
    deleteMessages(this.prevMsgs.map(v => v.getFormattedText()));
    msgs.forEach(v => v.chat());
    this.prevMsgs = msgs;
    this.lastDisplay = {
      type: 'display',
      args: [page],
      time: Date.now()
    };
  }

  /**
   * @param {string} str
   */
  displaySearch(str) {
    str = str.toLowerCase();
    const re = new RegExp(`(${str.replace(/[^A-Z]/gi, '')})`, 'gi');
    const props = this.props
      .filter(v => v.name.toLowerCase().includes(str))
      .map(v => ({ s: v.name.replace(re, '§d$1§r'), i: v.name.toLowerCase().indexOf(str), p: v }))
      .sort((a, b) => {
        const i = a.i - b.i;
        if (i !== 0) return i;
        return a.p.name.toLowerCase().localeCompare(b.p.name.toLowerCase(), ['en-US']);
      });
    const msgs = props.map(({ s, p }, i) => p.getMessage(i & 1, this.module, s));
    msgs.unshift(new Message(centerMessage(`&d&l${this.module} &b&l"${str}" &d&lSettings`)));
    // this.prevMsgs.forEach(v => ChatLib.deleteChat(v));
    deleteMessages(this.prevMsgs.map(v => v.getFormattedText()));
    msgs.forEach(v => v.chat());
    this.prevMsgs = msgs;
    this.lastDisplay = {
      type: 'displaySearch',
      args: [str],
      time: Date.now()
    };
  }

  /**
   * @param {string} prop
   * @param {string} val
   */
  update(prop, val) {
    const p = this.props.find(v => v.name.toLowerCase() === prop.toLowerCase());
    if (!p) throw 'Invalid Property: ' + prop;
    if (p.type === Property.Type.Action) p.actionListeners.forEach(v => v());
    else {
      const old = p.toString();
      if (val) p.set(p.parse(val));
      else p.set(p.defaultValue);
      this.save();
      logMessage(new Message(
        `Set ${p.name} to ${p.toString()} `,
        new TextComponent('&7[REVERT]').setClick('run_command', `/${this.module} config_ edit ${p.name} ${old}`)
      ));
      this.refresh();
    }
  }

  triggerAll() {
    this.props.forEach(v => v.trigger(v.value));
  }

  refresh() {
    const d = Date.now();
    if (d - this.lastDisplay.time > 60_000) return;
    this.lastDisplay.time = d;
    switch (this.lastDisplay.type) {
      case 'display': return this.display(this.lastDisplay.args[0]);
      case 'displaySearch': return this.displaySearch(this.lastDisplay.args[0]);
    }
  }
}

let page = 0;
let sort = 0;
export const $FONTS = new Map(java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames().map(v => [v.replace(/\s/g, ''), v]));
$FONTS.set('Mojangles', 'Mojangles');
export const props = {
  // 1
  enableGlobal: new Property('Enable', ++page, sort = 0, Property.Type.Toggle, true, { desc: 'toggles mod globally (scuffed, it doesnt really work)' }),
  autoUpdate: new Property('CheckForUpdates', page, ++sort, Property.Type.Toggle, true, { desc: 'check for updates when loaded' }),
  isDev: new Property('IsDev', page, ++sort, Property.Type.Toggle, false, { desc: 'negatively impacts loading performance and may spam your chat' }),
  pingRefreshDelay: new Property('PingRefreshDelay', page, ++sort, Property.Type.Number, 10, { desc: 'how often (in seconds) to refresh ping. set to 0 to disable ping. requires skytils' }),
  preferUseTracer: new Property('PreferUseTracer', page, ++sort, Property.Type.Toggle, false, { desc: 'when available, prefer to use a tracer rather than an arrow' }),
  textGuiFont: new Property('TextGuiFont', page, ++sort, Property.Type.Option, 'Mojangles', { desc: 'font used for text guis', options: Array.from($FONTS.keys()) }),

  // 2
  enablekuudra: new Property('EnableKuudra', ++page, sort = 0, Property.Type.Toggle, true),

  kuudraRenderPearlTarget: new Property('KuudraRenderPearlTarget', page, ++sort, Property.Type.Toggle, true, { desc: 'render location to aim at for sky pearls\n(but not hardcoded + actually accurate + with timer)' }),
  kuudraPearlTargetColor: new Property('KuudraPearlTargetColor', page, ++sort, Property.Type.Color, 0xFFFF00FF),

  kuudraRenderEmptySupplySpot: new Property('KuudraRenderEmptySupplySpot', page, ++sort, Property.Type.Toggle, true, { desc: 'render available supply dropoff location' }),
  kuudraEmptySupplySpotColor: new Property('KuudraEmptySupplySpotColor', page, ++sort, Property.Type.Color, 0xFF0000FF),

  kuudraBoxSupplies: new Property('KuudraBoxSupplies', page, ++sort, Property.Type.Toggle, true),
  kuudraBoxSuppliesColor: new Property('KuudraBoxSuppliesColor', page, ++sort, Property.Type.Color, 0x00FF00FF),
  kuudraBoxSuppliesGiantColor: new Property('KuudraBoxSuppliesGiantColor', page, ++sort, Property.Type.Color, 0),
  kuudraBoxSuppliesEsp: new Property('KuudraBoxSuppliesEsp', page, ++sort, Property.Type.Toggle, true),

  kuudraBoxChunks: new Property('KuudraBoxChunks', page, ++sort, Property.Type.Toggle, true),
  kuudraBoxChunksColor: new Property('KuudraBoxChunksColor', page, ++sort, Property.Type.Color, 0xFF00FFFF),
  kuudraBoxChunksEsp: new Property('KuudraBoxChunksEsp', page, ++sort, Property.Type.Toggle, true),

  kuudraShowCannonAim: new Property('KuudraShowCannonAim', page, ++sort, Property.Type.Toggle, true, { desc: 'render location to aim at for cannon, (useful for when client desyncs)' }),
  kuudraCannonAimColor: new Property('KuudraCannonAimColor', page, ++sort, Property.Type.Color, 0xFFFF00FF),

  kuudraCustomBossBar: new Property('KuudraCustomBossBar', page, ++sort, Property.Type.Toggle, true, { desc: 'rescale kuudra health bar in t5 to go 100% -> 0% twice' }),

  kuudraBoxKuudra: new Property('KuudraBoxKuudra', page, ++sort, Property.Type.Toggle, true, { desc: 'draws box around kuudra' }),
  kuudraBoxKuudraColor: new Property('KuudraBoxKuudraColor', page, ++sort, Property.Type.Color, 0xFF0000FF),
  kuudraBoxKuudraEsp: new Property('KuudraBoxKuudraEsp', page, ++sort, Property.Type.Toggle, true),

  kuudraDrawArrowToKuudra: new Property('KuudraDrawArrowToKuudra', page, ++sort, Property.Type.Toggle, true, { desc: 'draw arrow pointing to kuudra in p5' }),
  kuudraArrowToKuudraColor: new Property('KuudraArrowToKuudraColor', page, ++sort, Property.Type.Color, 0x00FFFFFF),

  kuudraDrawHpGui: new Property('KuudraDrawHpOnScreen', page, ++sort, Property.Type.Toggle, true, { desc: 'draw hp of kuudra onto hud' }),
  moveKuudraHp: new Property('MoveKuudraHp', page, ++sort, Property.Type.Action),
  kuudraDrawHpDec: new Property('KuudraDrawHpDecimals', page, ++sort, Property.Type.Integer, 3, { desc: 'number of decimals/sigfigs in the hp', min: 0, max: 3 }),

  kuudraAutoRefillPearls: new Property('KuudraAutoRefillPearls', page, ++sort, Property.Type.Toggle, true, { desc: 'automatically run /gfs at start of each run to replenish used pearls' }),
  kuudraAutoRefillPearlsAmount: new Property('KuudraAutoRefillPearlsAmount', page, ++sort, Property.Type.Integer, 16, { desc: 'amount of pearls you want to start run with', min: 0, max: 560 }),

  // 3
  enabledungeon: new Property('EnableDungeon', ++page, sort = 0, Property.Type.Toggle, true),

  dungeonBoxMobs: new Property('DungeonBoxMobs', page, ++sort, Property.Type.Toggle, true, { desc: 'draws boxes around starred mobs\nonly mobs with both nametag and corresponding entity (no ghost nametags!)' }),
  dungeonBoxMobEsp: new Property('DungeonBoxMobEsp', page, ++sort, Property.Type.Toggle, false),
  dungeonBoxMobColor: new Property('DungeonBoxMobColor', page, ++sort, Property.Type.Color, 0x00FFFFFF, { desc: 'color for basic mobs' }),
  dungeonBoxKeyColor: new Property('DungeonBoxKeyColor', page, ++sort, Property.Type.Color, 0x00FF00FF, { desc: 'color for wither/blood keys' }),
  dungeonBoxSAColor: new Property('DungeonBoxSAColor', page, ++sort, Property.Type.Color, 0xFF0000FF, { desc: 'color for SAs' }),
  dungeonBoxSMColor: new Property('DungeonBoxSkeleMasterColor', page, ++sort, Property.Type.Color, 0xFF8000FF, { desc: 'color for skele masters' }),
  dungeonBoxFelColor: new Property('DungeonBoxFelColor', page, ++sort, Property.Type.Color, 0x00FF80FF, { desc: 'color for fels' }),
  dungeonBoxChonkColor: new Property('DungeonBoxChonkersColor', page, ++sort, Property.Type.Color, 0xFF0080FF, { desc: 'color for withermancers, commanders, lords, and super archers' }),
  dungeonBoxMiniColor: new Property('DungeonBoxMiniColor', page, ++sort, Property.Type.Color, 0xB400B4FF, { desc: 'color for LAs,  FAs, and AAs' }),
  dungeonBoxMobDisableInBoss: new Property('DungeonBoxMobDisableInBoss', page, ++sort, Property.Type.Toggle, false),

  dungeonBoxWither: new Property('DungeonBoxWither', page, ++sort, Property.Type.Toggle, false, { desc: 'independent from box mobs' }),
  dungeonBoxWitherEsp: new Property('DungeonBoxWitherEsp', page, ++sort, Property.Type.Toggle, true),
  dungeonBoxWitherColor: new Property('DungeonBoxWitherColor', page, ++sort, Property.Type.Color, 0x515A0BFF),

  dungeonBoxLivid: new Property('DungeonBoxLivid', page, ++sort, Property.Type.Toggle, false, { desc: 'independent from box mobs' }),
  dungeonBoxLividEsp: new Property('DungeonBoxLividEsp', page, ++sort, Property.Type.Toggle, true),
  dungeonBoxLividColor: new Property('DungeonBoxLividColor', page, ++sort, Property.Type.Color, 0xFF0000FF),
  dungeonBoxLividDrawArrow: new Property('DungeonBoxLividDrawArrow', page, ++sort, Property.Type.Toggle, true),

  dungeonBoxIceSprayed: new Property('DungeonBoxIceSprayedMobs', page, ++sort, Property.Type.Toggle, false, { desc: 'independent from box mobs' }),
  dungeonBoxIceSprayedEsp: new Property('DungeonBoxIceSprayedEsp', page, ++sort, Property.Type.Toggle, false),
  dungeonBoxIceSprayedOutlineColor: new Property('DungeonBoxIceSprayedOutlineColor', page, ++sort, Property.Type.Color, 0XADD8E6FF),
  dungeonBoxIceSprayedFillColor: new Property('DungeonBoxIceSprayedFillColor', page, ++sort, Property.Type.Color, 0XADBCE650),

  dungeonBoxTeammates: new Property('DungeonBoxTeammates', page, ++sort, Property.Type.Toggle, true),
  dungeonBoxTeammatesEsp: new Property('DungeonBoxTeammatesEsp', page, ++sort, Property.Type.Toggle, true),
  dungeonBoxTeammatesMageColor: new Property('DungeonBoxTeammatesMageColor', page, ++sort, Property.Type.Color, 0x1793C4FF),
  dungeonBoxTeammatesArchColor: new Property('DungeonBoxTeammatesArchColor', page, ++sort, Property.Type.Color, 0xE80F0FFF),
  dungeonBoxTeammatesBersColor: new Property('DungeonBoxTeammatesBersColor', page, ++sort, Property.Type.Color, 0xF77C1BFF),
  dungeonBoxTeammatesTankColor: new Property('DungeonBoxTeammatesTankColor', page, ++sort, Property.Type.Color, 0xFF00FFFF),
  dungeonBoxTeammatesHealColor: new Property('DungeonBoxTeammatesHealColor', page, ++sort, Property.Type.Color, 0x47D147FF),

  dungeonCamp: new Property('DungeonEnableCamp', page, ++sort, Property.Type.Toggle, true, { desc: 'blood camp helper' }),
  dungeonCampTimer: new Property('DungeonCampShowTimer', page, ++sort, Property.Type.Toggle, false, { desc: 'render timer underneath boxes' }),
  dungeonCampWireColor: new Property('DungeonCampWireColor', page, ++sort, Property.Type.Color, 0x00FF00FF, { desc: 'color of wireframe' }),
  dungeonCampBoxColor: new Property('DungeonCampBoxColor', page, ++sort, Property.Type.Color, 0x00FFFFFF, { desc: 'color of shaded box' }),
  dungeonCampBoxEsp: new Property('DungeonCampBoxEsp', page, ++sort, Property.Type.Toggle, false),
  dungeonCampSmoothTime: new Property('DungeonCampSmoothTime', page, ++sort, Property.Type.Integer, 500, { desc: 'amount of time in ms spent lerping between different guesses\n(and how often to make guesses)', min: 1 }),
  dungeonCampSkipTimer: new Property('DungeonCampDialogueSkipTimer', page, ++sort, Property.Type.Toggle, false, { desc: 'timer until when to kill first 4 blood mobs' }),
  moveDungeonCampSkipTimer: new Property('MoveDungeonCampSkipTimer', page, ++sort, Property.Type.Action),

  dungeonHecatombAlert: new Property('DungeonHecatombAlert', page, ++sort, Property.Type.Toggle, false, { desc: 'alert before end of run to swap to hecatomb (does not work for f4/m4/m7)' }),
  dungeonHecatombAlertTime: new Property('DungeonHecatombAlertTime', page, ++sort, Property.Type.Integer, 5000, { desc: 'in ms', min: 0 }),
  dungeonHecatombAlertSound: new Property('DungeonHecatombAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),

  dungeonMap: new Property('DungeonMap', page, ++sort, Property.Type.Toggle, false, { desc: 'does not work yet' }),
  moveDungeonMap: new Property('MoveDungeonMap', page, ++sort, Property.Type.Action),
  dungeonMapHideBoss: new Property('DungeonMapHideInBoss', page, ++sort, Property.Type.Toggle, false),
  dungeonMapRenderHead: new Property('DungeonMapRenderPlayerHeads', page, ++sort, Property.Type.Toggle, false, { desc: 'render heads instead of arrows on map' }),
  dungeonMapRenderName: new Property('DungeonMapRenderPlayerNames', page, ++sort, Property.Type.Option, 'Holding Leap', { desc: 'render names of players above their marker', options: ['Always', 'Never', 'Holding Leap'] }),
  dungeonMapRenderClass: new Property('DungeonMapRenderPlayerClass', page, ++sort, Property.Type.Option, 'Always', { desc: 'render class of players above their marker', options: ['Always', 'Never', 'Holding Leap'] }),
  dungeonMapBoxDoors: new Property('DungeonMapBoxDoors', page, ++sort, Property.Type.Option, 'Blood Doors', { desc: 'boxes wither/blood doors', options: ['Always', 'Never', 'Blood Doors'] }),
  dungeonMapBoxDoorOutlineColor: new Property('DungeonMapBoxDoorOutlineColor', page, ++sort, Property.Type.Color, 0x00FF00FF),
  dungeonMapBoxDoorFillColor: new Property('DungeonMapBoxDoorFillColor', page, ++sort, Property.Type.Color, 0x00FF0050),
  dungeonMapBoxLockedDoorOutlineColor: new Property('DungeonMapBoxLockedDoorOutlineColor', page, ++sort, Property.Type.Color, 0xFF0000FF),
  dungeonMapBoxLockedDoorFillColor: new Property('DungeonMapBoxLockedDoorFillColor', page, ++sort, Property.Type.Color, 0xFF000050),

  dungeonShowSecrets: new Property('DungeonShowSecrets', page, ++sort, Property.Type.Option, 'None', { desc: 'does not work yet, requires map to be on', options: ['None', 'Wire', 'Waypoint'] }),

  dungeonHideHealerPowerups: new Property('DungeonHideHealerPowerups', page, ++sort, Property.Type.Toggle, true, { desc: 'hide healer power orbs (and particles!)' }),

  dungeonAutoArchitect: new Property('DungeonAutoGFSArchitect', page, ++sort, Property.Type.Toggle, false, { desc: 'auto gfs on puzzle fail, and a friendly reminder' }),

  dungeonNecronDragTimer: new Property('DungeonNecronDragTimer', page, ++sort, Property.Type.Option, 'None', { desc: 'timer when necron does some dragging\n(timer will automatically pop up when instamidding!)', options: ['OnScreen', 'InstaMid', 'Both', 'None'] }),
  moveNecronDragTimer: new Property('MoveNecronDragTimer', page, ++sort, Property.Type.Action),
  dungeonNecronDragDuration: new Property('DungeonNecronDragDuration', page, ++sort, Property.Type.Integer, 120, { desc: 'in ticks, 120 = move/leap, 163 = immunity', min: 0 }),

  dungeonDev4Helper: new Property('DungeonClearViewDev4', page, ++sort, Property.Type.Option, 'Both', { desc: 'clearer vision while doing 4th dev', options: ['None', 'Titles', 'Particles', 'Both'] }),

  dungeonDev4HighlightBlock: new Property('DungeonDev4HighlightBlock', page, ++sort, Property.Type.Toggle, true, { desc: 'highlights emerald block green, bypasses chunk updates' }),
  dungeonDev4HighlightBlockColor: new Property('DungeonDev4HighlightBlockColor', page, ++sort, Property.Type.Color, 0x50C878FF),
  dungeonDev4HighlightBlockEsp: new Property('DungeonDev4HighlightBlockEsp', page, ++sort, Property.Type.Toggle, false),

  dungeonStairStonkHelper: new Property('DungeonStairStonkHelper', page, ++sort, Property.Type.Toggle, false, { desc: 'stair stonker stuff' }),
  dungeonStairStonkHelperColor: new Property('DungeonStairStonkHelperColor', page, ++sort, Property.Type.Color, 0xFF0000FF, { desc: 'draw line to align yourself to dig down a stair\nsame as soopy but does not cut fps in half' }),
  dungeonStairStonkHelperHighlightColor: new Property('DungeonStairStonkHelperHighlightColor', page, ++sort, Property.Type.Color, 0x7DF9FF80, { desc: 'highlight stairs this color if they need to be ghosted to stonk' }),

  dungeonAutoRefillPearls: new Property('DungeonAutoRefillPearls', page, ++sort, Property.Type.Toggle, false, { desc: 'automatically run /gfs to replenish used pearls' }),
  dungeonAutoRefillPearlsAmount: new Property('DungeonAutoRefillPearlsAmount', page, ++sort, Property.Type.Integer, 16, { desc: 'amount of pearls you want to have at a time', min: 0, max: 560 }),
  dungeonAutoRefillPearlsThreshold: new Property('DungeonAutoRefillPearlsThreshold', page, ++sort, Property.Type.Integer, 0, { desc: 'automatically replenish pearls mid run when below this amount\n0 to disable', min: 0, max: 560 }),
  dungeonAutoRefillPearlsGhostPickFix: new Property('DungeonAutoRefillPearlsGhostPickFix', page, ++sort, Property.Type.Toggle, false, { desc: 'dont replenish when ghost pick\n(turn on if you ghost using pearls)' }),

  dungeonM7LBWaypoints: new Property('DungeonDragonLBWaypoints', page, ++sort, Property.Type.Toggle, false),

  dungeonGoldorDpsStartAlert: new Property('DungeonGoldorDpsStartAlert', page, ++sort, Property.Type.Toggle, false),
  dungeonGoldorDpsStartAlertTime: new Property('DungeonGoldorDpsStartAlertTime', page, ++sort, Property.Type.Integer, 500, { desc: 'in ms', min: 0 }),
  dungeonGoldorDpsStartAlertSound: new Property('DungeonGoldorDpsStartAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),

  dungeonTerminalBreakdown: new Property('DungeonTerminalBreakdown', page, ++sort, Property.Type.Toggle, false, { desc: 'displays terminals done by each person' }),

  dungeonPlaySoundKey: new Property('DungeonPlaySoundOnKey', page, ++sort, Property.Type.Toggle, false, { desc: 'play dulkir secret sound on pickup key' }),
  dungeonPlaySoundBat: new Property('DungeonPlaySoundOnBatDeath', page, ++sort, Property.Type.Toggle, false, { desc: 'play dulkir secret sound on bat death' }),

  dungeonIceSprayAlert: new Property('DungeonRareMobDropAlert', page, ++sort, Property.Type.Toggle, true, { desc: 'alert on ice spray/sm cp' }),
  dungeonIceSprayAlertTime: new Property('DungeonRareMobDropAlertTime', page, ++sort, Property.Type.Integer, 2000, { desc: 'in ms', min: 0 }),
  dungeonIceSprayAlertSound: new Property('DungeonRareMobDropAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),

  dungeonTerminalsHelper: new Property('DungeonTerminalsHelper', page, ++sort, Property.Type.Toggle, false),
  dungeonTerminalsGuiSize: new Property('DungeonTerminalsGuiSize', page, ++sort, Property.Type.Option, 'Unchanged', { desc: 'change gui size while in terminals', options: ['Unchanged', 'Small', 'Normal', 'Large', '4x', '5x', 'Auto'] }),
  dungeonTerminalsHideInv: new Property('DungeonTerminalsHideInventory', page, ++sort, Property.Type.Toggle, false, { desc: 'hide inventory in terminals\nplease do not use, it will 1) break all solvers, 2) look shit, 3) probably breaks other things like locking slots' }),
  dungeonTerminalsHideInvScuffed: new Property('DungeonTerminalsHideInventoryScuffed', page, ++sort, Property.Type.Toggle, false, { desc: 'hide inventory in terminals, but scuffed (basically centers around the chest instead of hiding)' }),

  dungeonSpiritBearHelper: new Property('DungeonSpiritBearHelper', page, ++sort, Property.Type.Toggle, false, { desc: 'predict spirit bear spawn location' }),
  dungeonSpiritBearTimer: new Property('DungeonSpiritBearShowTimer', page, ++sort, Property.Type.Toggle, false, { desc: 'render timer above box' }),
  dungeonSpiritBearWireColor: new Property('DungeonSpiritBearWireColor', page, ++sort, Property.Type.Color, 0x00FF00FF, { desc: 'color of wireframe' }),
  dungeonSpiritBearBoxColor: new Property('DungeonSpiritBearBoxColor', page, ++sort, Property.Type.Color, 0x00FFFFFF, { desc: 'color of shaded box' }),
  dungeonSpiritBearBoxEsp: new Property('DungeonSpiritBearBoxEsp', page, ++sort, Property.Type.Toggle, false),
  dungeonSpiritBearSmoothTime: new Property('DungeonSpiritBearSmoothTime', page, ++sort, Property.Type.Integer, 500, { desc: 'amount of time in ms spent lerping between different guesses\n(and how often to make guesses)', min: 1 }),
  dungeonSpiritBearTimerHud: new Property('DungeonSpiritBearTimerHud', page, ++sort, Property.Type.Toggle, true, { desc: 'show spirit bear timer on hud' }),
  moveSpiritBearTimerHud: new Property('MoveSpiritBearTimerHud', page, ++sort, Property.Type.Action),

  dungeonSilverfishHasteTimer: new Property('DungeonSilverfishHasteTimer', page, ++sort, Property.Type.Toggle, false, { desc: 'render how much longer haste from silverfish will last' }),
  moveSilverfishHasteTimer: new Property('MoveSilverfishHasteTimer', page, ++sort, Property.Type.Action),

  dungeonHideFallingBlocks: new Property('DungeonHideFallingBlocks', page, ++sort, Property.Type.Toggle, true, { desc: 'dont render falling blocks in boss' }),

  dungeonHideWitherKing: new Property('DungeonHideWitherKing', page, ++sort, Property.Type.Toggle, true, { desc: 'dont render wither king tentacles' }),

  dungeonDragonHelper: new Property('DungeonDragonHelper', page, ++sort, Property.Type.Toggle, false),
  dungeonDragonHelperTimer2D: new Property('DungeonDragonHelperTimerHUD', page, ++sort, Property.Type.Toggle, false, { desc: 'render timer until dragon spawn on hud' }),
  moveDragonHelperTimer: new Property('MoveDragonHelperTimer', page, ++sort, Property.Type.Action),
  dungeonDragonHelperTimer3D: new Property('DungeonDragonHelperTimerWorld', page, ++sort, Property.Type.Toggle, false, { desc: 'render timer until dragon spawn under its chin' }),
  dungeonDragonHelperAlert: new Property('DungeonDragonHelperAlert', page, ++sort, Property.Type.Option, 'None', { desc: 'show alert when dragon is spawning', options: ['None', 'All', 'Split'] }),
  dungeonDragonHelperAlertTime: new Property('DungeonDragonHelperAlertTime', page, ++sort, Property.Type.Integer, 1000, { desc: 'in ms', min: 0 }),
  dungeonDragonHelperAlertSound: new Property('DungeonDragonHelperAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),
  dungeonDragonHelperSplit: new Property('DungeonDragonHelperSplit', page, ++sort, Property.Type.Toggle, true, { desc: 'do you split' }),
  dungeonDragonHelperPrioS: new Property('DungeonDragonHelperPrioSplit', page, ++sort, Property.Type.Text, 'ogrbp', { desc: 'priority to use when splitting\nbers team -> ogrbp <- arch team' }),
  dungeonDragonHelperPrioNS: new Property('DungeonDragonHelperPrioNoSplit', page, ++sort, Property.Type.Text, 'robpg', { desc: 'priority to use when NOT splitting' }),
  dungeonDragonHelperBersTeam: new Property('DungeonDragonHelperBersTeam', page, ++sort, Property.Type.Text, 'bmh', { desc: 'classes that go w/ bers team\nb m h | a t' }),
  dungeonDragonHelperTrackHits: new Property('DungeonDragonHelperTrackHits', page, ++sort, Property.Type.Option, 'Full', { desc: 'tracks number of arrow hits during drag dps\nnote: will count all arrow hits (will count any hits on husks)\nBurst: count initial "burst" of hits at start of spawn\n(i.e. first 1s if a/b, otherwise time until 5 lbs)\nFull: hits during entire duration dragon is alive\nBoth: full + burst stats', options: ['None', 'Burst', 'Full', 'Both'] }),
  dungeonDragonHelperTrackHitsTimeUnit: new Property('DungeonDragonHelperTrackHitsTimeUnit', page, ++sort, Property.Type.Option, 'Both', { desc: 'note: seconds is still measured in ticks, not real time', options: ['Ticks', 'Seconds', 'Both'] }),

  dungeonLBPullProgress: new Property('DungeonLBPullProgress', page, ++sort, Property.Type.Toggle, false, { desc: 'play sounds indicating bow pull progress (accounting for lag)' }),
  dungeonLBPullProgressVolume: new Property('DungeonLBPullProgressVolume', page, ++sort, Property.Type.Number, 1, { min: 0, max: 5 }),
  dungeonLBPullProgressThreshold: new Property('DungeonLBPullProgressThreshold', page, ++sort, Property.Type.Integer, 8, { desc: 'how many ticks to swap to different sound\n0: always, 21: never', min: 0, max: 21 }),

  dungeonSimonSays: new Property('DungeonSimonSays', page, ++sort, Property.Type.Toggle, false),
  dungeonSimonSaysColor1: new Property('DungeonSimonSaysColor', page, ++sort, Property.Type.Color, 0x00FF00A0, { desc: 'color of the button to press ' }),
  dungeonSimonSaysColor2: new Property('DungeonSimonSaysColorNext', page, ++sort, Property.Type.Color, 0xFFFF00A0, { desc: 'color of the next button to press' }),
  dungeonSimonSaysColor3: new Property('DungeonSimonSaysColorOther', page, ++sort, Property.Type.Color, 0xFF0000A0, { desc: 'color of the other buttons' }),
  dungeonSimonSaysBlock: new Property('DungeonSimonSaysBlockClicks', page, ++sort, Property.Type.Option, 'ExceptWhenCrouching', { desc: 'block incorrect clicks', options: ['Never', 'Always', 'WhenCrouching', 'ExceptWhenCrouching'] }),

  dungeonArrowAlign: new Property('DungeonArrowAlign', page, ++sort, Property.Type.Toggle, false),
  dungeonArrowAlignBlock: new Property('DungeonArrowAlignBlockClicks', page, ++sort, Property.Type.Option, 'ExceptWhenCrouching', { desc: 'block incorrect clicks', options: ['Never', 'Always', 'WhenCrouching', 'ExceptWhenCrouching'] }),
  dungeonArrowAlignLeavePD: new Property('DungeonArrowAlignLeaveOnePD', page, ++sort, Property.Type.Toggle, true, { desc: 'leave 1 frame at 1 click away during pd' }),

  dungeonGoldorFrenzyTimer: new Property('DungeonGoldorFrenzyTimer', page, ++sort, Property.Type.Toggle, false, { desc: 'show timer until next goldor frenzy tick' }),
  moveGoldorFrenzyTimer: new Property('MoveGoldorFrenzyTimer', page, ++sort, Property.Type.Action),

  dungeonBlockOverlaySize: new Property('DungeonBlockOverlaySize', page, ++sort, Property.Type.Number, 1, { desc: 'size of overlay when inside an opaque block\nin range [0, 1], 0 = none, 1 = default', min: 0, max: 1 }),

  dungeonHideHealerFairy: new Property('DungeonHideHealerFairy', page, ++sort, Property.Type.Option, 'Own', { options: ['Never', 'Own', 'Always'] }),

  dungeonDHubHighlightLow: new Property('DungeonDHubSelectorHighlight', page, ++sort, Property.Type.Toggle, true, { desc: 'green for low players :)' }),

  dungeonTerracottaRespawn: new Property('DungeonTerracottaRespawnTimer', page, ++sort, Property.Type.Toggle, false),
  dungeonTerracottaRespawnType: new Property('DungeonTerracottaRespawnTimerType', page, ++sort, Property.Type.Option, 'Timer', { options: ['Timer', 'Box', 'Both'] }),
  dungeonTerracottaRespawnOutlineColor: new Property('DungeonTerracottaRespawnOutlineColor', page, ++sort, Property.Type.Color, 0x91553DFF),
  dungeonTerracottaRespawnFillColor: new Property('DungeonTerracottaRespawnFillColor', page, ++sort, Property.Type.Color, 0xA27157A0),
  dungeonTerracottaRespawnGui: new Property('DungeonTerracottaRespawnGui', page, ++sort, Property.Type.Toggle, false, { desc: 'render the timer for the first terracotta on hud' }),
  moveDungeonTerracottaRespawnGui: new Property('MoveDungeonTerracottaRespawnGui', page, ++sort, Property.Type.Action),

  // 4
  enablestatgui: new Property('EnableStatGUI', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'render stats from tab onto hud' }),
  loc0: new Property('EnablePrivateIslandGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc0: new Property('MovePrivateIslandGUI', page, ++sort, Property.Type.Action),
  loc1: new Property('EnableHubGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc1: new Property('MoveHubGUI', page, ++sort, Property.Type.Action),
  loc2: new Property('EnableDungeonHubGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc2: new Property('MoveDungeonHubGUI', page, ++sort, Property.Type.Action),
  loc3: new Property('EnableTheFarmingIslandsGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc3: new Property('MoveTheFarmingIslandsGUI', page, ++sort, Property.Type.Action),
  loc4: new Property('EnableGardenGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc4: new Property('MoveGardenGUI', page, ++sort, Property.Type.Action),
  loc5: new Property('EnableTheParkGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc5: new Property('MoveTheParkGUI', page, ++sort, Property.Type.Action),
  loc6: new Property('EnableGoldMineGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc6: new Property('MoveGoldMineGUI', page, ++sort, Property.Type.Action),
  loc7: new Property('EnableDeepCavernsGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc7: new Property('MoveDeepCavernsGUI', page, ++sort, Property.Type.Action),
  loc8: new Property('EnableDwarvenMinesGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc8: new Property('MoveDwarvenMinesGUI', page, ++sort, Property.Type.Action),
  loc9: new Property('EnableCrystalHollowsGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc9: new Property('MoveCrystalHollowsGUI', page, ++sort, Property.Type.Action),
  loc10: new Property('EnableSpidersDenGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc10: new Property('MoveSpidersDenGUI', page, ++sort, Property.Type.Action),
  loc11: new Property('EnableTheEndGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc11: new Property('MoveTheEndGUI', page, ++sort, Property.Type.Action),
  loc12: new Property('EnableCrimsonIsleGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc12: new Property('MoveCrimsonIsleGUI', page, ++sort, Property.Type.Action),
  loc13: new Property('EnableKuudraGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc13: new Property('MoveKuudraGUI', page, ++sort, Property.Type.Action),
  loc14: new Property('EnableTheRiftGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc14: new Property('MoveTheRiftGUI', page, ++sort, Property.Type.Action),
  loc15: new Property('EnableJerrysWorkshopGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc15: new Property('MoveJerrysWorkshopGUI', page, ++sort, Property.Type.Action),
  loc16: new Property('EnableCatacombsGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc16: new Property('MoveCatacombsGUI', page, ++sort, Property.Type.Action),
  loc17: new Property('EnableBackwaterBayouGUI', page, ++sort, Property.Type.Toggle, true),
  moveLoc17: new Property('MoveBackwaterBayouGUI', page, ++sort, Property.Type.Action),

  // 5
  enableservertracker: new Property('EnableServerTracker', ++page, sort = 0, Property.Type.Toggle, true, { desc: 'tracks servers you\'ve been to, also /warp tab complete' }),
  serverTrackerTransferCd: new Property('ServerTrackerTransferCd', page, ++sort, Property.Type.Integer, 3000, { desc: 'delays warps by this long if spammed too quickly', min: 0 }),
  serverTrackerCdMessage: new Property('ServerTrackerCdMessage', page, ++sort, Property.Type.Text, 'waiting for cd (u.U)｡｡｡ zzZ'),

  // 6
  enablerattils: new Property('EnableRatTils', ++page, sort = 0, Property.Type.Toggle, true, { desc: 'boxes cheese and other stuff' }),
  ratTilsBoxColor: new Property('RatTilsBoxColor', page, ++sort, Property.Type.Color, 0x00FF80FF),
  ratTilsBoxEsp: new Property('RatTilsBoxEsp', page, ++sort, Property.Type.Toggle, true),
  ratTilsAlertTime: new Property('RatTilsAlertTime', page, ++sort, Property.Type.Integer, 2000, { desc: 'in ms', min: 0 }),
  ratTilsAlertSound: new Property('RatTilsAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),
  ratTilsChannel: new Property('RatTilsChannel', page, ++sort, Property.Type.Text, 'pc'),
  ratTilsMessage: new Property('RatTilsMessage', page, ++sort, Property.Type.Text, 'i.imgur.com/8da4IiM.png', { desc: 'empty to disable' }),
  ratTilsMuteSound: new Property('RatTilsMuteSound', page, ++sort, Property.Type.Toggle, true, { desc: 'mute rat squeaking sounds' }),

  // 7
  enablepowderalert: new Property('EnablePowderAlert', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'alerts when powder chest spawns' }),
  powderBoxColor: new Property('PowderBoxColor', page, ++sort, Property.Type.Color, 0x00FFFFA0),
  powderBoxColor2: new Property('PowderBoxColorDead', page, ++sort, Property.Type.Color, 0xFF0000FF, { desc: '2nd color of gradient  between 1st and 2nd based on when chest will despawn' }),
  powderBoxEsp: new Property('PowderBoxEsp', page, ++sort, Property.Type.Toggle, true),
  powderAlertTime: new Property('PowderAlertTime', page, ++sort, Property.Type.Integer, 1000, { desc: 'in ms', min: 0 }),
  powderAlertSound: new Property('PowderAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),
  powderScanRange: new Property('PowderScanRange', page, ++sort, Property.Type.Integer, 10, { min: 0 }),
  powderBlockRewards: new Property('PowderHideMessage', page, ++sort, Property.Type.Toggle, true, { desc: 'hides chest rewards message' }),
  powderShowPowder: new Property('PowderHideMessageShowPowder', page, ++sort, Property.Type.Toggle, true, { desc: 'keep the powder gain message' }),

  // 8
  enablecrystalalert: new Property('EnableCrystalAlert', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'alerts when end crystals spawn' }),
  crystalBoxColor: new Property('CrystalBoxColor', page, ++sort, Property.Type.Color, 0x00FF00FF),
  crystalBoxEsp: new Property('CrystalBoxEsp', page, ++sort, Property.Type.Toggle, true),
  crystalAlertTime: new Property('CrystalAlertTime', page, ++sort, Property.Type.Integer, 1000, { desc: 'in ms', min: 0 }),
  crystalAlertSound: new Property('CrystalAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),

  // 9
  enablecmdalias: new Property('EnableCommandAliases', ++page, sort = 0, Property.Type.Toggle, true),
  cmdAliasStorage: new Property('EnableStorageShortcut', page, ++sort, Property.Type.Toggle, true, { desc: 'e.g. /b1, /e2, and /3 for /backpack 1, /enderchest 2, /backpack 3 respectively' }),
  cmdAliasDungeon: new Property('EnableDungeonShortcut', page, ++sort, Property.Type.Toggle, true, { desc: 'e.g. /f1, /m1, /fe' }),
  cmdAliasKuudra: new Property('EnableKuudraShortcut', page, ++sort, Property.Type.Toggle, true, { desc: 'e.g. /k1' }),

  // 10
  enablequiver: new Property('EnableQuiverDisplay', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'arrow display on hud, only works when holding bow' }),
  moveQuiver: new Property('MoveQuiverDisplay', page, ++sort, Property.Type.Action),
  quiverSize: new Property('QuiverMaxSize', page, ++sort, Property.Type.Option, 'Giant', { desc: 'size of quiver (based on feather collection)', options: ['Medium', 'Large', 'Giant'] }),
  quiverShowRefill: new Property('QuiverShowRefillCost', page, ++sort, Property.Type.Toggle, false, { desc: 'show refill cost' }),
  quiverRefillCost: new Property('QuiverRefillCostType', page, ++sort, Property.Type.Option, 'Instant', { desc: 'method of refilling\nInstant: whatever is fastest\nIndividual: spam left click at jax (cheaper, also ur a loser)\nJax: same as instant but jax flint arrows expensiver\nOphelia: same as instant', options: ['Instant', 'Individual', 'Jax', 'Ophelia'] }),
  quiverShowRefillThresh: new Property('QuiverRefillCostDisplayThreshold', page, ++sort, Property.Type.Percent, 25, { desc: 'only show refill cost when below this amount full', min: 0, max: 100 }),

  // 11
  enablerabbit: new Property('EnableRabbitTils', ++page, sort = 0, Property.Type.Toggle, false),
  rabbitShowBestUpgrade: new Property('RabbitTilsShowBestUpgrade', page, ++sort, Property.Type.Toggle, true, { desc: 'highlight most cost effective rabbit upgrade' }),
  rabbitCondenseChat: new Property('RabbitTilsCondenseChat', page, ++sort, Property.Type.Toggle, true, { desc: 'has been promoted lookin mf' }),

  // 12
  enablechattils: new Property('EnableChatTils', ++page, sort = 0, Property.Type.Toggle, false),

  chatTilsWaypoint: new Property('ChatTilsFindWaypoints', page, ++sort, Property.Type.Toggle, true, { desc: 'look for waypoints in all the chats' }),
  chatTilsWaypointColor: new Property('ChatTilsWaypointColor', page, ++sort, Property.Type.Color, 0xC80000FF),
  chatTilsWaypointType: new Property('ChatTilsWaypointType', page, ++sort, Property.Type.Option, 'Box', { desc: 'type of waypoint', options: ['Box', 'Wireframe', 'None'] }),
  chatTilsWaypointBeacon: new Property('ChatTilsWaypointShowBeacon', page, ++sort, Property.Type.Toggle, true, { desc: 'render beacon to waypoint' }),
  chatTilsWaypointName: new Property('ChatTilsWaypointShowName', page, ++sort, Property.Type.Toggle, false, { desc: 'show name of player who sent waypoint' }),
  chatTilsWaypointDuration: new Property('ChatTilsWaypointDuration', page, ++sort, Property.Type.Integer, 60, { desc: 'time in seconds, 0 = forever', min: 0 }),
  chatTilsWaypointShowOwn: new Property('ChatTilsWaypointShowOwn', page, ++sort, Property.Type.Toggle, true, { desc: 'show your own waypoints' }),
  chatTilsWaypointPersist: new Property('ChatTilsWaypointPersist', page, ++sort, Property.Type.Toggle, false, { desc: 'whether to persist on swapping servers' }),

  chatTilsHideBonzo: new Property('ChatTilsHideAzureBonzo', page, ++sort, Property.Type.Option, 'False', { desc: '"Bonzo Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'] }),
  chatTilsHidePhoenix: new Property('ChatTilsHideAzurePhoenix', page, ++sort, Property.Type.Option, 'False', { desc: '"Phoenix Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'] }),
  chatTilsHideSpirit: new Property('ChatTilsHideAzureSpirit', page, ++sort, Property.Type.Option, 'False', { desc: '"Spirit Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'] }),
  chatTilsHideLeap: new Property('ChatTilsHidePartyChatLeaps', page, ++sort, Property.Type.Option, 'False', { desc: '"Leaped/Leaping to plinkingndriving" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'] }),
  chatTilsHideMelody: new Property('ChatTilsHidePartyChatMelody', page, ++sort, Property.Type.Option, 'False', { desc: '"melody (1/4)/25%" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'] }),
  chatTilsCompactMelody: new Property('ChatTilsCompactPartyChatMelody', page, ++sort, Property.Type.Toggle, true, { desc: 'only keep most recent melody message from a player' }),

  chatTilsClickAnywhereFollow: new Property('ChatTilsClickAnywhereFollow', page, ++sort, Property.Type.Toggle, false, { desc: 'click anywhere after opening chat to follow party member\n(mostly for diana/assfang/jumpy dt cube)' }),
  chatTilsClickAnywhereFollowOnlyLead: new Property('ChatTilsClickAnywhereFollowOnlyLead', page, ++sort, Property.Type.Toggle, true, { desc: 'only follow leader' }),

  chatTilsImageArt: new Property('ChatTilsImageArt', page, ++sort, Property.Type.Toggle, false, { desc: 'generate ascii art from image\nusage: /printimage [image url]\n/printimage (will print image from clipboard)\n/printimage https://i.imgur.com/things.jpeg (will print image from url)' }),
  chatTilsImageArtParty: new Property('ChatTilsImageArtPartyChat', page, ++sort, Property.Type.Toggle, true, { desc: 'always send in party chat' }),
  chatTilsImageArtAutoPrint: new Property('ChatTilsImageArtAutoPrint', page, ++sort, Property.Type.Toggle, false, { desc: 'auto print all lines of the image' }),
  chatTilsImageArtWidth: new Property('ChatTilsImageArtPartyWidth', page, ++sort, Property.Type.Integer, 40, { desc: 'width of the generated image (in characters)\nheight automatically scaled', min: 1, max: 128 }),
  chatTilsImageArtEncoding: new Property('ChatTilsImageArtEncoding', page, ++sort, Property.Type.Option, 'Braille', { desc: 'encoding used', options: ['Braille', 'ASCII'] }),
  chatTilsImageArtUseGaussian: new Property('ChatTilsImageArtSmooth', page, ++sort, Property.Type.Toggle, false, { desc: 'apply a gaussian blur to image before processing (best results when sobel is used)' }),
  chatTilsImageArtSharpen: new Property('ChatTilsImageArtSharpen', page, ++sort, Property.Type.Toggle, true, { desc: 'sharpen source image' }),
  chatTilsImageArtDither: new Property('ChatTilsImageArtDither', page, ++sort, Property.Type.Toggle, true, { desc: 'apply dithering' }),
  chatTilsImageArtInvert: new Property('ChatTilsImageArtInvert', page, ++sort, Property.Type.Toggle, true, { desc: 'invert colors' }),
  chatTilsImageArtAlgorithm: new Property('ChatTilsImageArtAlgorithm', page, ++sort, Property.Type.Option, 'Grayscale', { desc: 'transform algorithm used', options: ['Grayscale', 'Sobel'] }),

  chatTilsEssential: new Property('ChatTilsBetterEssential', page, ++sort, Property.Type.Toggle, false, { desc: 'show Essential messages in mc chat\n/we, /te, /re, and /fe for corresponding Essential actions' }),
  chatTilsEssentialPing: new Property('ChatTilsEssentialPing', page, ++sort, Property.Type.Toggle, true, { desc: 'send chat pings on recieve message' }),
  chatTilsEssentialNotif: new Property('ChatTilsEssentialNotification', page, ++sort, Property.Type.Toggle, false, { desc: 'send Essential notification on recieve message' }),
  chatTilsEssentialOverrideCommands: new Property('ChatTilsBetterEssentialOverrideCommands', page, ++sort, Property.Type.Toggle, false, { desc: 'override the /w, /t, /r, and /f commands to be Essential ones' }),
  chatTilsEssentialForwardPartyDms: new Property('ChatTilsEssentialForwardPartyDms', page, ++sort, Property.Type.Toggle, false, { desc: 'when leader in a party, any essential dms from party members will be forwarded to party chat' }),
  chatTilsEssentialRedirectPartyChat: new Property('ChatTilsEssentialRedirectPartyChat', page, ++sort, Property.Type.Toggle, false, { desc: 'redirect /pc to message leader on essentials\nalso enables /chat p and /chat party' }),

  // 13
  enablediana: new Property('EnableDiana', ++page, sort = 0, Property.Type.Toggle, false),
  dianaArrowToBurrow: new Property('DianaArrowToBurrow', page, ++sort, Property.Type.Toggle, true, { desc: 'draw an arrow pointing to nearest burrow' }),
  dianaArrowToBurrowColor: new Property('DianaArrowToBurrowColor', page, ++sort, Property.Type.Color, 0x9FE2BF),
  dianaScanBurrows: new Property('DianaScanBurrows', page, ++sort, Property.Type.Toggle, true, { desc: 'look for burrows by particles' }),
  dianaBurrowStartColor: new Property('DianaBurrowStartColor', page, ++sort, Property.Type.Color, 0xBBEEEEFF),
  dianaBurrowMobColor: new Property('DianaBurrowMobColor', page, ++sort, Property.Type.Color, 0x2A1D32FF),
  dianaBurrowTreasureColor: new Property('DianaBurrowTreasureColor', page, ++sort, Property.Type.Color, 0xFED02AFF),
  dianaBurrowPrevGuessColor: new Property('DianaBurrowPrevGuessColor', page, ++sort, Property.Type.Color, 0x707020FF),
  dianaAlertFoundBurrow: new Property('DianaAlertFoundBurrow', page, ++sort, Property.Type.Toggle, true, { desc: 'alert when burrow is found' }),
  dianaAlertFoundBurrowNoStart: new Property('DianaAlertFoundBurrowNoStart', page, ++sort, Property.Type.Toggle, false, { desc: 'do not alert when found burrow is a start burrow' }),
  dianaAlertFoundBurrowTime: new Property('DianaAlertFoundBurrowTime', page, ++sort, Property.Type.Integer, 500, { desc: 'in ms' }),
  dianaAlertFoundBurrowSound: new Property('DianaAlertFoundBurrowSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),
  dianaGuessFromParticles: new Property('DianaGuessFromParticles', page, ++sort, Property.Type.Toggle, false, { desc: '/togglesound must be on' }),
  dianaGuessRememberPrevious: new Property('DianaRememberPreviousGuesses', page, ++sort, Property.Type.Toggle, true, { desc: 'guesses only removed when nearby burrow is found i.e. DianaScanBurrows must be on\nor use /ctsremoveclosestdiana' }),
  dianaGuessFromParticlesPathColor: new Property('DianaGuessFromParticlesPathColor', page, ++sort, Property.Type.Color, 0x00FFFFFF, { desc: 'color of path of particles' }),
  dianaGuessFromParticlesRenderName: new Property('DianaGuessFromParticlesRenderName', page, ++sort, Property.Type.Toggle, false),
  dianaGuessFromParticlesAverageColor: new Property('DianaGuessFromParticlesAverageColor', page, ++sort, Property.Type.Color, 0xB000B5FF, { desc: 'color of geometric median of all guesses' }),
  dianaGuessFromParticlesSplineColor: new Property('DianaGuessFromParticlesSplineColor', page, ++sort, Property.Type.Color, 0x138686FF, { desc: 'color of guess from spline estimation' }),
  dianaGuessFromParticlesMLATColor: new Property('DianaGuessFromParticlesMLATColor', page, ++sort, Property.Type.Color, 0xB31919FF, { desc: 'color of guess from multilateration' }),
  dianaGuessFromParticlesBezierColor: new Property('DianaGuessFromParticlesBezierColor', page, ++sort, Property.Type.Color, 0xFF8000FF, { desc: 'color of guess from bezier + control point' }),

  // 14
  enableabsorption: new Property('EnableCustomAbsorption', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'custom absorption renderer to more accurately portray total hp' }),
  absorptionMaxHearts: new Property('AbsorptionMaxHearts', page, ++sort, Property.Type.Integer, 40, { desc: 'caps hearts for things like mastiff', min: 0 }),

  enableserverscrutinizer: new Property('EnableServerScrutinizer', page, ++sort, Property.Type.Toggle, false, { desc: 'scrutinizes the server\'s tps and things' }),

  serverScrutinizerTPSDisplay: new Property('ServerScrutinizerTPSDisplay', page, ++sort, Property.Type.Toggle, true, { desc: 'tracks tps' }),
  serverScrutinizerTPSDisplayCap20: new Property('ServerScrutinizerCapTPS', page, ++sort, Property.Type.Toggle, true, { desc: 'caps all tps at 20' }),
  serverScrutinizerTPSDisplayCurr: new Property('ServerScrutinizerDisplayCurrentTPS', page, ++sort, Property.Type.Toggle, false, { desc: 'show current tps' }),
  serverScrutinizerTPSDisplayAvg: new Property('ServerScrutinizerDisplayAverageTPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show average tps' }),
  serverScrutinizerTPSDisplayMin: new Property('ServerScrutinizerDisplayMinimumTPS', page, ++sort, Property.Type.Toggle, false, { desc: 'show minimum tps' }),
  serverScrutinizerTPSDisplayMax: new Property('ServerScrutinizerDisplayMaximumTPS', page, ++sort, Property.Type.Toggle, false, { desc: 'show maximum tps' }),
  serverScrutinizerTPSMaxAge: new Property('ServerScrutinizerTPSMaxAge', page, ++sort, Property.Type.Integer, 5000, { desc: 'max age of ticks', min: 1000 }),
  moveTPSDisplay: new Property('MoveTPSDisplay', page, ++sort, Property.Type.Action),

  serverScrutinizerLastTickDisplay: new Property('ServerScrutinizerLastPacketDisplay', page, ++sort, Property.Type.Toggle, true, { desc: 'tracks last packet sent time (lag spike)' }),
  serverScrutinizerLastTickThreshold: new Property('ServerScrutinizerLastPacketThreshold', page, ++sort, Property.Type.Integer, 200, { desc: 'only show when server has not responded for this amount of time\nin ms' }),
  moveLastTickDisplay: new Property('MoveLastTickDisplay', page, ++sort, Property.Type.Action),

  serverScrutinizerFPSDisplay: new Property('ServerScrutinizerFPSDisplay', page, ++sort, Property.Type.Toggle, false, { desc: 'tracks FPS' }),
  serverScrutinizerFPSDisplayCurr: new Property('ServerScrutinizerDisplayCurrentFPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show current fps' }),
  serverScrutinizerFPSDisplayAvg: new Property('ServerScrutinizerDisplayAverageFPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show average fps' }),
  serverScrutinizerFPSDisplayMin: new Property('ServerScrutinizerDisplayMinimumFPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show minimum fps' }),
  serverScrutinizerFPSDisplayMax: new Property('ServerScrutinizerDisplayMaximumFPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show maximum fps' }),
  serverScrutinizerFPSMaxAge: new Property('ServerScrutinizerFPSMaxAge', page, ++sort, Property.Type.Integer, 5000, { desc: 'max age of ticks', min: 1000 }),
  moveFPSDisplay: new Property('MoveFPSDisplay', page, ++sort, Property.Type.Action),

  serverScrutinizerPingDisplay: new Property('ServerScrutinizerPingDisplay', page, ++sort, Property.Type.Toggle, false, { desc: 'tracks ping' }),
  serverScrutinizerPingDisplayCurr: new Property('ServerScrutinizerDisplayCurrentPing', page, ++sort, Property.Type.Toggle, true, { desc: 'show current ping' }),
  serverScrutinizerPingDisplayAvg: new Property('ServerScrutinizerDisplayAveragePing', page, ++sort, Property.Type.Toggle, true, { desc: 'show average ping' }),
  movePingDisplay: new Property('MovePingDisplay', page, ++sort, Property.Type.Action),

  serverScrutinizerPPSDisplay: new Property('ServerScrutinizerPPSDisplay', page, ++sort, Property.Type.Toggle, false, { desc: 'tracks PPS (packets [send] per second)' }),
  serverScrutinizerPPSDisplayCurr: new Property('ServerScrutinizerDisplayCurrentPPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show current pps' }),
  serverScrutinizerPPSDisplayAvg: new Property('ServerScrutinizerDisplayAveragePPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show average pps' }),
  serverScrutinizerPPSDisplayMin: new Property('ServerScrutinizerDisplayMinimumPPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show minimum pps' }),
  serverScrutinizerPPSDisplayMax: new Property('ServerScrutinizerDisplayMaximumPPS', page, ++sort, Property.Type.Toggle, true, { desc: 'show maximum pps' }),
  serverScrutinizerPPSMaxAge: new Property('ServerScrutinizerPPSMaxAge', page, ++sort, Property.Type.Integer, 5000, { desc: 'max age of ticks', min: 1000 }),
  movePPSDisplay: new Property('MovePPSDisplay', page, ++sort, Property.Type.Action),

  enablespotify: new Property('EnableSpotifyDisplay', page, ++sort, Property.Type.Toggle, false, { desc: 'shows current song playing on spotify, only works on windows + app version' }),
  moveSpotifyDisplay: new Property('MoveSpotifyDisplay', page, ++sort, Property.Type.Action),
  spotifyHideNotOpen: new Property('SpotifyHideIfNotOpened', page, ++sort, Property.Type.Toggle, true, { desc: 'hide if spotify is not opened' }),
  spotifyMaxSongLength: new Property('SpotifyMaxSongLength', page, ++sort, Property.Type.Integer, 100, { desc: 'in pixels, 0 for uncapped length', min: 0 }),

  enablesacks: new Property('EnableSackTils', page, ++sort, Property.Type.Toggle, false, { desc: 'does things with the sacks message\nto turn on settings -> personal -> chat feedback -> sack notifs' }),
  sacksDisableMessage: new Property('SackTilsDisableMessage', page, ++sort, Property.Type.Toggle, true, { desc: 'hide the message' }),
  sacksDisplay: new Property('SackTilsDisplay', page, ++sort, Property.Type.Toggle, true, { desc: 'gui showing change in items' }),
  moveSacksDisplay: new Property('MoveSacktilsDisplay', page, ++sort, Property.Type.Action),
  sacksDisplayTimeout: new Property('SackTilsDisplayTimeout', page, ++sort, Property.Type.Number, 5000, { desc: 'how long to show changes for in ms' }),
  sacksDisplayCombineQuantities: new Property('SackTilsDisplayCombineQuantities', page, ++sort, Property.Type.Toggle, false, { desc: 'combine +16 Ender Pearl and -3 Ender Pearl into +13 Ender Pearl' }),
  sacksDisplayTrackAggregateQuantities: new Property('SackTilsDisplayTrackAggregateQuantities', page, ++sort, Property.Type.Toggle, false, { desc: 'remember previous transactions (reset on restart/reload or manually)' }),
  sacksDisplayResetAggregate: new Property('SackTilsDisplayResetAggregate', page, ++sort, Property.Type.Action),
  sacksDisplayItemWhitelist: new Property('SackTilsDisplayItemWhitelist', page, ++sort, Property.Type.Text, '', { desc: 'case insensitive comma separated values\ndo not use quotes, they will not be parsed\nall formatting codes and non alphanumeric characters will be stripped\nwill first attempt to match by id, then strict name, then a check without spaces\nall the following will match the item "Jack o\' Lantern"\nJACK_O_LANTERN,Jack o\' Lantern,jack o lantern,jackolantern\nthe following will NOT match:\njack lantern,ack o lanter,poisonous potato' }),
  sacksDisplayItemBlacklist: new Property('SackTilsDisplayItemBlacklist', page, ++sort, Property.Type.Text, '', { desc: 'case insensitive comma separated values\ndo not use quotes, they will not be parsed\nall formatting codes and non alphanumeric characters will be stripped\nwill first attempt to match by id, then strict name, then a check without spaces\nall the following will match the item "Jack o\' Lantern"\nJACK_O_LANTERN,Jack o\' Lantern,jack o lantern,jackolantern\nthe following will NOT match:\njack lantern,ack o lanter,poisonous potato' }),

  enabledeployable: new Property('EnableDeployableTils', page, ++sort, Property.Type.Toggle, false),
  deployableHUD: new Property('DeployableHUD', page, ++sort, Property.Type.Option, 'Compact', { desc: 'show current deployable\nwhat is bubblegum?', options: ['Compact', 'Full', 'None'] }),
  moveDeployableHUD: new Property('MoveDeployableHUD', page, ++sort, Property.Type.Action),
  deployableAssumeJalapeno: new Property('DeployableAssumeJalapeno', page, ++sort, Property.Type.Toggle, true, { desc: 'assume flares have jalapeno applied\n(cannot detect programmatically because fuck hypixel)' }),
  deployableHUDColorTimer: new Property('DeployableHUDColorTime', page, ++sort, Property.Type.Toggle, true, { desc: 'color the timer based on time remaining' }),
  deployableParticlesOwn: new Property('DeployableParticlesOwn', page, ++sort, Property.Type.Option, 'Default', { options: ['Default', 'None', 'Custom'], desc: 'only applies to own deployables' }),
  deployableParticlesOther: new Property('DeployableParticlesOther', page, ++sort, Property.Type.Option, 'Default', { options: ['Default', 'None', 'Custom'] }),

  enableferoestimate: new Property('EnableFeroEstimate', page, ++sort, Property.Type.Toggle, false),
  moveFeroEstimate: new Property('MoveFeroEstimate', page, ++sort, Property.Type.Action),
  feroEstimateUpdateDelay: new Property('FeroEstimateUpdateDelay', page, ++sort, Property.Type.Integer, 500, { desc: 'delay in ms to update guess', min: 0 }),

  enablecrosshair: new Property('EnableCustomCrosshair', page, ++sort, Property.Type.Toggle, false),
  crosshairType: new Property('CustomCrosshairType', page, ++sort, Property.Type.Option, '+', { options: ['+', 'X', '/\\', 'O', '.'] }),
  crosshairColor: new Property('CustomCrosshairColor', page, ++sort, Property.Type.Color, 0xFFFFFFFF),
  crosshairInvert: new Property('CustomCrosshairInvertColor', page, ++sort, Property.Type.Toggle, false),
  crosshairWidth: new Property('CustomCrosshairWidth', page, ++sort, Property.Type.Number, 10, { min: 0 }),
  crosshairBreadth: new Property('CustomCrosshairBreadth', page, ++sort, Property.Type.Number, 1, { min: 0 }),
  crosshairRenderInGui: new Property('CustomCrosshairRenderInGuis', page, ++sort, Property.Type.Toggle, false),

  // 15
  enableavarice: new Property('EnableAvariceAddons', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'things for avarice' }),

  avariceShowCoinCounter: new Property('AvariceShowCoinCounter', page, ++sort, Property.Type.Toggle, true, { desc: 'show avarice coins in a hud' }),
  moveAvariceCoinCounter: new Property('MoveAvariceCoinCounter', page, ++sort, Property.Type.Action),

  avariceArachne: new Property('AvariceBigSpooderHelper', page, ++sort, Property.Type.Toggle, true, { desc: 'big spooder go die, i hate nons' }),
  avariceArachneHideBroodNames: new Property('AvariceHideSmallSpooderNames', page, ++sort, Property.Type.Toggle, true, { desc: 'make small spooder names go bye' }),
  avariceArachneBoxBigSpooder: new Property('AvariceBoxBigSpooder', page, ++sort, Property.Type.Toggle, true),
  avariceArachneBoxBigSpooderColor: new Property('AvariceBoxBigSpooderColor', page, ++sort, Property.Type.Color, 0xEB38BBFF),
  avariceArachneBoxBigSpooderEsp: new Property('AvariceBoxBigSpooderEsp', page, ++sort, Property.Type.Toggle, false),
  avariceArachneBoxBigSpooderDrawArrow: new Property('AvariceBoxBigSpooderDrawArrow', page, ++sort, Property.Type.Toggle, true),
  avariceArachneBoxSmallSpooders: new Property('AvariceBoxSmallSpooders', page, ++sort, Property.Type.Toggle, true),
  avariceArachneBoxSmallSpoodersColor: new Property('AvariceBoxSmallSpoodersColor', page, ++sort, Property.Type.Color, 0x26ED5EFF),
  avariceArachneBoxSmallSpoodersEsp: new Property('AvariceBoxSmallSpoodersEsp', page, ++sort, Property.Type.Toggle, false),

  avariceTaraTrader: new Property('AvariceTaraTrader', page, ++sort, Property.Type.Toggle, false, { desc: 'block hits on tara if slayer quest not started\nlag go brr\nnote: doesnt block custom hits (i.e. >3 block range)' }),

  // 16
  enablegreatspook: new Property('EnableGreatSpook', ++page, sort = 0, Property.Type.Toggle, false),
  greatSpookPrimalTimer: new Property('GreatSpookPrimalTimer', page, ++sort, Property.Type.Toggle, true, { desc: 'timer until primal fear can spawn' }),
  moveGreatSpookPrimalTimer: new Property('MoveGreatSpookPrimalTimer', page, ++sort, Property.Type.Action),
  greatSpookPrimalTimerHideReady: new Property('GreatSpookPrimalTimerHideReady', page, ++sort, Property.Type.Toggle, false, { desc: 'when cd is ready hide timer rather than show "READY"' }),
  greatSpookPrimalCd: new Property('GreatSpookPrimalCd', page, ++sort, Property.Type.Integer, 75, { desc: 'cd between spawns, in seconds\ncheck at hub -> tyashoi alchemist' }),
  greatSpookPrimalAlert: new Property('GreatSpookPrimalAlert', page, ++sort, Property.Type.Toggle, true, { desc: 'show alert when primal is ready' }),
  greatSpookPrimalAlertTime: new Property('GreatSpookPrimalAlertTime', page, ++sort, Property.Type.Integer, 2000, { desc: 'in ms', min: 0 }),
  greatSpookPrimalAlertSound: new Property('GreatSpookPrimalAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),

  // 17
  enablefishingtils: new Property('EnableFishingTils', ++page, sort = 0, Property.Type.Toggle, true),
  fishingTilsHotspotWaypoint: new Property('FishingTilsHotspotWaypoint', page, ++sort, Property.Type.Toggle, false),
  fishingTilsHotspotWaypointColor: new Property('FishingTilsHotspotWaypointColor', page, ++sort, Property.Type.Color, 0xFA771EFF),
  fishingTilsHotspotWaypointDisableRange: new Property('FishingTilsHotspotWaypointDisableRange', page, ++sort, Property.Type.Integer, 10, { desc: 'disable when this many blocks (not including height) from hotspot', min: 0 }),
  fishingTilsHotspotWaypointArrow: new Property('FishingTilsHotspotWaypointArrow', page, ++sort, Property.Type.Toggle, true),
  fishingTilsUpdateSBAList: new Property('FishingTilsUpdateSBAList', page, ++sort, Property.Type.Toggle, true, { desc: 'update the sba sea creature list\nrequires game restart to fully disable (why though)' }),

  // 18
  enablenecromancy: new Property('EnableNecromancy', ++page, sort = 0, Property.Type.Toggle, false),
  necromancyTrackSouls: new Property('NecromancyTrackSouls', page, ++sort, Property.Type.Toggle, true, { desc: 'track info about souls that get dropped' }),
  necromancySoulWhitelist: new Property('NecromancySoulWhitelist', page, ++sort, Property.Type.Text, '', { desc: 'comma separated names, will search inclusively, case sensitive' }),
  necromancySoulBlacklist: new Property('NecromancySoulBlacklist', page, ++sort, Property.Type.Text, '', { desc: 'comma separated names, will search inclusively, case sensitive' }),
  necromancyAlwaysTrackBoss: new Property('NecromancyAlwaysTrackBoss', page, ++sort, Property.Type.Toggle, true, { desc: 'always track powerful (dark) souls, regardless of white/blacklist' }),
  necromancySoulEsp: new Property('NecromancySoulEsp', page, ++sort, Property.Type.Toggle, false, { desc: 'esp on soul rendering' }),
  necromancyShowMobName: new Property('NecromancyShowMobName', page, ++sort, Property.Type.Toggle, true, { desc: 'render name of mob above soul' }),
  necromancyBoxSoul: new Property('NecromancyBoxSoul', page, ++sort, Property.Type.Toggle, true),
  necromancySoulColorNew: new Property('NecromancySoulColorNew', page, ++sort, Property.Type.Color, 0x00FFFFA0, { desc: 'color of newly dropped soul' }),
  necromancySoulColorOld: new Property('NecromancySoulColorOld', page, ++sort, Property.Type.Color, 0xFF0000FF, { desc: 'color of soul about to despawn' }),

  enabledojo: new Property('EnableDojo', ++page, sort = 0, Property.Type.Toggle, false),
  dojoMastery: new Property('DojoMaster', page, ++sort, Property.Type.Toggle, true),
  dojoMasteryPointToLowest: new Property('DojoMasteryPointToLowest', page, ++sort, Property.Type.Toggle, true),
  dojoMasteryPointToLowestColor: new Property('DojoMasteryPointToLowestColor', page, ++sort, Property.Type.Color, 0x55FF55FF),
  dojoMasteryShowLowestTime: new Property('DojoMasteryShowLowestTime', page, ++sort, Property.Type.Toggle, true, { desc: 'render lowest time below crosshair' }),
  dojoMasteryPointToNext: new Property('DojoMasteryPointToNext', page, ++sort, Property.Type.Toggle, true),
  dojoMasteryPointToNextColor: new Property('DojoMasteryPointToNextColor', page, ++sort, Property.Type.Color, 0x5555FFFF),
  dojoMasteryPointToNextTimer: new Property('DojoMasteryPointToNextTimer', page, ++sort, Property.Type.Toggle, true, { desc: 'show timer for the next block' }),
  dojoMasteryHideTitles: new Property('DojoMasteryHideTitles', page, ++sort, Property.Type.Toggle, true),

  // 20
  enableboxallentities: new Property('EnableBoxAllEntities', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'mostly for debugging' }),
  boxAllEntitiesInvis: new Property('BoxAllEntitiesInvisible', page, ++sort, Property.Type.Toggle, false, { desc: 'box invisible entities' }),
  boxAllEntitiesColor: new Property('BoxAllEntitiesColor', page, ++sort, Property.Type.Color, 0xFF0000FF),
  boxAllEntitiesEsp: new Property('BoxAllEntitiesEsp', page, ++sort, Property.Type.Toggle, true),
  boxAllEntitiesName: new Property('BoxAllEntitiesName', page, ++sort, Property.Type.Toggle, false, { desc: 'show nametag' }),
  boxAllEntitiesClassName: new Property('BoxAllEntitiesClassName', page, ++sort, Property.Type.Toggle, false, { desc: 'show class name' }),
  boxAllEntitiesWhitelist: new Property('BoxAllEntitiesWhitelist', page, ++sort, Property.Type.Text, '', { desc: 'comma separated class names' }),
  boxAllEntitiesBlacklist: new Property('BoxAllEntitiesBlacklist', page, ++sort, Property.Type.Text, '', { desc: 'comma separated class names' }),
  boxAllEntitiesEntityId: new Property('BoxAllEntitiesEntityId', page, ++sort, Property.Type.Toggle, false, { desc: 'show entity id' }),

  enablelogdamage: new Property('EnableLogDamage', page, ++sort, Property.Type.Toggle, false, { desc: 'log damage numbers in chat' }),
  logDamageRange: new Property('LogDamageRange', page, ++sort, Property.Type.Number, 5, { desc: 'ignore damage numbers outside this range\nin blocks', min: 0 }),
  logDamageThreshold: new Property('LogDamageThreshold', page, ++sort, Property.Type.Integer, 0, { desc: 'only log damage when above this amount\n0 to disable', min: 0 }),
  logDamageNormal: new Property('LogDamageNormal', page, ++sort, Property.Type.Toggle, true, { desc: 'non crit' }),
  logDamageCrit: new Property('LogDamageCrit', page, ++sort, Property.Type.Toggle, true, { desc: 'crit' }),
  logDamageWither: new Property('LogDamageWither', page, ++sort, Property.Type.Toggle, true, { desc: 'withering effect' }),
  logDamageVenomous: new Property('LogDamageVenomous', page, ++sort, Property.Type.Toggle, true, { desc: 'venomous/toxic poison' }),
  logDamageSuffocation: new Property('LogDamageSuffocation', page, ++sort, Property.Type.Toggle, true, { desc: 'suffocation/drowning' }),
  logDamageFire: new Property('LogDamageFire', page, ++sort, Property.Type.Toggle, true, { desc: 'fire/fa/flame' }),
  logDamageLightning: new Property('LogDamageLightning', page, ++sort, Property.Type.Toggle, true, { desc: 'thunderlord/thunderbolt' }),
  logDamagePet: new Property('LogDamagePet', page, ++sort, Property.Type.Toggle, true, { desc: 'pet e.g. snowman' }),
  logDamageOverload: new Property('LogDamageOverload', page, ++sort, Property.Type.Toggle, true, { desc: 'overload' }),
  logDamageExtremeFocus: new Property('LogDamageExtremeFocus', page, ++sort, Property.Type.Toggle, true, { desc: 'extreme focus (endstone sword)' }),
  logDamageOctodexterity: new Property('LogDamageOctodexterity', page, ++sort, Property.Type.Toggle, true, { desc: 'octodexterity (tara full set)' }),
  logDamageWitherSkull: new Property('LogDamageWitherSkull', page, ++sort, Property.Type.Toggle, true, { desc: 'withermancer/withers' }),
  logDamageLove: new Property('LogDamageLove', page, ++sort, Property.Type.Toggle, true, { desc: 'ring of love etc. proc' }),
  logDamageCurse: new Property('LogDamageCurse', page, ++sort, Property.Type.Toggle, true, { desc: 'gaia construct lightning' }),
  logDamageCombo: new Property('LogDamageCombo', page, ++sort, Property.Type.Toggle, true, { desc: 'blaze dagger repeat' }),

  // 21
  enableexcavatorsolver: new Property('EnableExcavatorSolver', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'find fossils' }),
  excavatorSolverOnlyShowBest: new Property('ExcavatorSolverOnlyHighlightBest', page, ++sort, Property.Type.Toggle, true, { desc: 'only highlight the best move' }),
  excavatorSolverShowRoute: new Property('ExcavatorSolverHighlightStartPath', page, ++sort, Property.Type.Toggle, false, { desc: 'highlight best starting path (turn off if citrine gemstones)' }),
  excavatorSolverDirtTooltip: new Property('ExcavatorSolverDirtTooltip', page, ++sort, Property.Type.Option, 'Custom', { options: ['Default', 'Hide', 'Custom'] }),
  excavatorSolverDustTooltip: new Property('ExcavatorSolverDustTooltip', page, ++sort, Property.Type.Option, 'Custom', { options: ['Default', 'Hide', 'Custom'] }),
  excavatorSolverAutoClose: new Property('ExcavatorSolverAutoClose', page, ++sort, Property.Type.Toggle, false, { desc: 'automatically close excavator when all clicks used' }),

  enablebettergfs: new Property('EnableBetterGFS', page, ++sort, Property.Type.Toggle, false, { desc: 'autocomplete for gfs, and shorthand\ne.g. /gfs w c 1 -> /gfs WITHER_CATALYST 1' }),
  betterGFSBlankAmount: new Property('BetterGFSUnspecifiedAmount', page, ++sort, Property.Type.Integer, 1, { desc: 'amount to default to when not provided\ne.g. /gfs w c -> /gfs WITHER_CATALYST <insert amount>', min: 1, max: 2240 }),
  betterGFSIDPref: new Property('BetterGFSIdPreference', page, ++sort, Property.Type.Option, 'ID', { desc: 'which format to prefer (name vs id)\nName: replace with qualified name, ID: coerce to ID\nDynamic: use whatever format was given (in theory) it is broken af so it is disabled :)', options: ['ID', 'Name'] }),

  enablecpv: new Property('EnableChickTilsPV', page, ++sort, Property.Type.Toggle, true, { desc: '/cpv, neu /pv wrapper but with different api\n(almost 100% success rate!)' }),
  cpvReplaceNeu: new Property('ChickTilsPVReplaceNEU', page, ++sort, Property.Type.Toggle, false, { desc: 'replace /pv command (may require restart when disabling)' }),
  cpvAutoCompleteTabList: new Property('ChickTilsPVAutoCompleteTabList', page, ++sort, Property.Type.Toggle, true, { desc: 'autocomplete /pv with names from tab list' }),
  cpvAutoCompleteParty: new Property('ChickTilsPVAutoCompleteParty', page, ++sort, Property.Type.Toggle, true, { desc: 'autcomplete /pv with party members' }),

  enableclipboard: new Property('EnableClipboardThing', page, ++sort, Property.Type.Toggle, true, { desc: '/clipboard\nset, get, list, and remove\n/cbs and /cbg and /cbl and /cbr\n/clipboard set <name> | /cbg <name> | /clipboard list | /cbr <name>' }),

  enablevision: new Property('DisableBlindness', page, ++sort, Property.Type.Toggle, true, { desc: 'disable blindness' }),

  enablecake: new Property('EnableCakeHelper', page, ++sort, Property.Type.Toggle, true, { desc: 'i like eat cake.' }),

  enableunfocus: new Property('PreventRenderingWhenUnfocused', page, ++sort, Property.Type.Toggle, false, { desc: 'similar to patcher\'s unfocused fps\nbut instead of capping fps, it completely stops rendering' }),

  enableassfangcheese: new Property('EnableAssfangCheeseHealth', page, ++sort, Property.Type.Toggle, false, { desc: 'show real assfang health' }),
  moveAssfangCheese: new Property('MoveAssfangCheeseHealth', page, ++sort, Property.Type.Action),

  enableblockhighlight: new Property('EnableBlockHighlight', page, ++sort, Property.Type.Toggle, false),
  blockHighlightWireColor: new Property('BlockHighlightWireColor', page, ++sort, Property.Type.Color, 0x00000066),
  blockHighlightFillColor: new Property('BlockHighlightFillColor', page, ++sort, Property.Type.Color, 0x00000000),
  blockHighlightWireWidth: new Property('BlockHighlightWireWidth', page, ++sort, Property.Type.Number, 2, { min: 0 }),
  blockHighlightCheckEther: new Property('BlockHighlightCheckEther', page, ++sort, Property.Type.Toggle, true),
  blockHighlightEtherWireColor: new Property('BlockHighlightEtherWireColor', page, ++sort, Property.Type.Color, 0x2EDD17A0),
  blockHighlightEtherFillColor: new Property('BlockHighlightEtherFillColor', page, ++sort, Property.Type.Color, 0x60DE5560),
  blockHighlightEtherWireWidth: new Property('BlockHighlightEtherWireWidth', page, ++sort, Property.Type.Number, 3, { min: 0 }),
  blockHighlightCantEtherWireColor: new Property('BlockHighlightCantEtherWireColor', page, ++sort, Property.Type.Color, 0xCA2207A0),
  blockHighlightCantEtherFillColor: new Property('BlockHighlightCantEtherFillColor', page, ++sort, Property.Type.Color, 0xBA2B1E60),
  blockHighlightCantEtherWireWidth: new Property('BlockHighlightCantEtherWireWidth', page, ++sort, Property.Type.Number, 3, { min: 0 }),
  blockHighlightCantEtherShowReason: new Property('BlockHighlightCantEtherShowReason', page, ++sort, Property.Type.Toggle, true),
  blockHighlightBoxEntity: new Property('BlockHighlightBoxEntity', page, ++sort, Property.Type.Toggle, false, { desc: 'box the entity you are looking at' }),

  enablehidedivanparticles: new Property('HideDivanCoatingParticles', page, ++sort, Property.Type.Toggle, true),

  enablesbaenchant: new Property('UpdateSBAEnchantList', page, ++sort, Property.Type.Toggle, true, { desc: 'need to rs game to unload properly (why would you?)' }),

  enablepearlpath: new Property('EnablePearlPath', page, ++sort, Property.Type.Toggle, false),
  pearlPathEsp: new Property('PearlPathEsp', page, ++sort, Property.Type.Toggle, false),
  pearlPathPathColor: new Property('PearlPathColor', page, ++sort, Property.Type.Color, 0xFF0000FF, { desc: 'color of path of pearl' }),
  pearlPathDestColorOutline: new Property('PearlPathDestinationColorOutline', page, ++sort, Property.Type.Color, 0x0000FFFF, { desc: 'outline color of player hitbox on teleport' }),
  pearlPathDestColorFill: new Property('PearlPathDestinationColorFill', page, ++sort, Property.Type.Color, 0x00000000, { desc: 'fill color of player hitbox on teleport' }),
  pearlPathCollideEntity: new Property('PearlPathCollideWithEntities', page, ++sort, Property.Type.Toggle, false, { desc: 'whether to check for collisions with entities' }),
  pearlPathCollidedEntityColor: new Property('PearlPathCollidedEntityColor', page, ++sort, Property.Type.Color, 0x00FF00FF, { desc: 'color to box entity that was collided with' }),
  pearlPathCheeto: new Property('PearlPathCheeto', page, ++sort, Property.Type.Toggle, false, { desc: 'shame shame shame\ndoesn\'t disable when looking at a block' })
};
const pageNames = [
  '',
  'General',
  'Kuudra',
  'Dungeon',
  'Stat GUI',
  'Server Tracker',
  'RatTils',
  'Powder Chest',
  'Crystal Alert',
  'Command Aliases',
  'Quiver Display',
  'Rabbit',
  'ChatTils',
  'Diana',
  'HUD',
  'Avarice Addons',
  'Great Spook',
  'FishingTils',
  'Necromancy',
  'Dojo',
  'Testing',
  'Misc.'
];
/**
 * @type {Settings & { [x in keyof typeof props]: typeof props[x]['value'] } & { [x in keyof typeof props as `_${x}`]: typeof props[x] }}
 */
const settings = new Settings('ChickTils', 'settings.json', props, pageNames);

export default settings;