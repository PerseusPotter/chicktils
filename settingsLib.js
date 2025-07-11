import convertToAmaterasu from './settingsAmaterasu';
import { centerMessage } from './util/format';
import { deleteMessages } from './util/helper';
import { log, logMessage } from './util/log';
import { StateVar } from './util/state';
import { run } from './util/threading';

/**
 * @template {string | number | boolean | null} V
 * @template {{ [x: string]: Property }} R
 * @extends {StateVar<V>}
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
   * @param {string} name
   * @param {number} page
   * @param {number} pageSort
   * @param {number} type
   * @param {V} defaultValue
   * @param {{ desc?: string, min?: number, max?: number, len?: number, options?: V[], shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, page, pageSort, type, defaultValue, { desc = '', min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, len = Number.POSITIVE_INFINITY, options = [], shouldShow = new StateVar(true), isNewSection = false } = {}) {
    super(defaultValue);
    if (name.includes(' ')) throw 'bad parser deal with it';
    this.name = name;
    this.desc = desc;
    this.page = page;
    this.sort = pageSort;
    this.type = type;
    /** @type {V} */
    this.value;
    // typescript </3
    this.value = defaultValue;
    /** @type {V} */
    this.defaultValue = defaultValue;
    /** @type {{ min?: number, max?: number, len?: number, options?: V[] }} */
    this.opts = { min, max, len, options };
    /** @type {StateVar<boolean>} */
    this.shouldShow = shouldShow;
    /** @type {boolean} */
    this.isNewSection = isNewSection;
    this.actionListeners = [];
  }
  set(v, force) {
    if (v === this.value) {
      if (force) this.trigger(v);
    } else super.set(v);
  }
  /** @param {V} v */
  validate(v) { }
  valueOf() {
    return this.value;
  }
  toString() {
    return this.value.toString();
  }
  parse(str) {
    const v = this._parse(str.trim());
    this.validate(v);
    return v;
  }
  /**
   * @param {string} str
   * @returns {V}
   */
  _parse(str) {
    throw 'not implemented';
  }
  /**
   * @param {(this: Property, wasFromGui: boolean) => void} cb
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

/**
 * @template {{ [x: string]: Property }} R
 * @extends Property<boolean, R>
 */
export class PropertyToggle extends Property {
  /**
   * @param {string} name
   * @param {boolean} defaultValue
   * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, defaultValue, opts) {
    super(name, 0, 0, Property.Type.Toggle, defaultValue, opts ?? {});
  }

  _parse(str) {
    const truthy = ['true', 'True', 'TRUE', 't', 'T', 'y', 'Y', '1'];
    const falsy = ['false', 'False', 'FALSE', 'f', 'F', 'n', 'N', '0'];
    if (str === 'TOGGLE') return !this.value;
    if (truthy.includes(str)) return true;
    if (falsy.includes(str)) return false;
    throw 'Invalid Boolean: ' + str;
  }
}

/**
 * @template {{ [x: string]: Property }} R
 * @extends Property<number, R>
 */
class PropertyGenericNumber extends Property {
  /**
   * @param {string} name
   * @param {number} type
   * @param {number} defaultValue
   * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, type, defaultValue, opts) {
    super(name, 0, 0, type, defaultValue, opts ?? {});
  }

  validate(v) {
    if (v < this.opts.min) throw 'value must not be below ' + this.opts.min;
    if (v > this.opts.max) throw 'value must not be above ' + this.opts.max;
  }
}

/**
 * @template {{ [x: string]: Property }} R
 * @extends PropertyGenericNumber<R>
 */
export class PropertyInteger extends PropertyGenericNumber {
  /**
   * @param {string} name
   * @param {number} defaultValue
   * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, defaultValue, opts) {
    super(name, Property.Type.Integer, defaultValue, opts);
  }

  _parse(str) {
    if (!/^-?\d+$/.test(str)) throw 'Invalid Integer: ' + str;
    return parseInt(str);
  }
}

/**
 * @template {{ [x: string]: Property }} R
 * @extends PropertyGenericNumber<R>
 */
export class PropertyNumber extends PropertyGenericNumber {
  /**
   * @param {string} name
   * @param {number} defaultValue
   * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, defaultValue, opts) {
    super(name, Property.Type.Number, defaultValue, opts);
  }

  _parse(str) {
    if (!/^-?\d*(?:\.\d+)?$/.test(str)) throw 'Invalid Number: ' + str;
    return +str;
  }
}

/**
 * @template {{ [x: string]: Property }} R
 * @extends PropertyGenericNumber<R>
 */
export class PropertyPercent extends PropertyGenericNumber {
  /**
   * @param {string} name
   * @param {number} defaultValue
   * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, defaultValue, opts) {
    super(name, Property.Type.Percent, defaultValue, opts);
  }

  valueOf() {
    return this.value / 100;
  }

  toString() {
    return this.value.toString() + '%';
  }

  _parse(str) {
    if (/^-?\d*\.\d{1,2}$/.test(str)) return str * 100;
    if (/^-?\d+%?$/.test(str)) return parseInt(str);
    throw 'Invalid Percent: ' + str;
  }
}

/**
 * @template {{ [x: string]: Property }} R
 * @extends Property<string, R>
 */
export class PropertyText extends Property {
  /**
   * @param {string} name
   * @param {string} defaultValue
   * @param {{ desc?: string, len?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, defaultValue, opts) {
    super(name, 0, 0, Property.Type.Text, defaultValue, opts ?? {});
  }

  validate(v) {
    if (v.length > this.opts.len) throw 'length of string must not exceed ' + this.opts.len;
  }

  _parse(str) {
    return str;
  }
}

/**
 * @template {{ [x: string]: Property }} R
 * @extends Property<number, R>
 */
export class PropertyColor extends Property {
  /**
   * @param {string} name
   * @param {number} defaultValue
   * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, defaultValue, opts) {
    super(name, 0, 0, Property.Type.Color, defaultValue, opts ?? {});
  }

  toString() {
    return '#' + this.value.toString(16).toUpperCase().padStart(8, '0');
  }

  _parse(str) {
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
}

/**
 * @template {string} O
 * @template {{ [x: string]: Property }} R
 * @extends Property<O, R>
 */
export class PropertyOption extends Property {
  /**
   * @param {string} name
   * @param {O} defaultValue
   * @param {{ desc?: string, options?: O[], shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, defaultValue, opts) {
    super(name, 0, 0, Property.Type.Option, defaultValue, opts ?? {});
  }

  validate(v) {
    if (this.opts.options?.length && !this.opts.options.includes(v)) throw 'not a valid option';
  }

  _parse(str) {
    return str;
  }
}

/**
 * @template {{ [x: string]: Property }} R
 * @extends Property<null, R>
 */
export class PropertyAction extends Property {
  /**
   * @param {string} name
   * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
   */
  constructor(name, opts) {
    super(name, 0, 0, Property.Type.Action, null, opts ?? {});
  }

  set(v, force) { }
  toString() {
    return '';
  }
  _parse(str) {
    return null;
  }
}

/**
 * @template {{ [x: string]: Property }} R
 * @param {string} name
 * @param {boolean} defaultValue
 * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
 * @returns {Property<boolean, R>}
 */
export function createToggleProp(name, defaultValue, opts) {
  return new PropertyToggle(name, defaultValue, opts);
}

/**
 * @template {{ [x: string]: Property }} R
 * @param {string} name
 * @param {number} defaultValue
 * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
 * @returns {Property<number, R>}
 */
export function createIntegerProp(name, defaultValue, opts) {
  return new PropertyInteger(name, defaultValue, opts);
}

/**
 * @template {{ [x: string]: Property }} R
 * @param {string} name
 * @param {number} defaultValue
 * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
 * @returns {Property<number, R>}
 */
export function createNumberProp(name, defaultValue, opts) {
  return new PropertyNumber(name, defaultValue, opts);
}

/**
 * @template {{ [x: string]: Property }} R
 * @param {string} name
 * @param {number} defaultValue
 * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
 * @returns {Property<number, R>}
 */
export function createPercentProp(name, defaultValue, opts) {
  return new PropertyPercent(name, defaultValue, opts);
}

/**
 * @template {{ [x: string]: Property }} R
 * @param {string} name
 * @param {string} defaultValue
 * @param {{ desc?: string, len?: number, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
 * @returns {Property<string, R>}
 */
export function createTextProp(name, defaultValue, opts) {
  return new PropertyText(name, defaultValue, opts);
}

/**
 * @template {{ [x: string]: Property }} R
 * @param {string} name
 * @param {number} defaultValue
 * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
 * @returns {Property<number, R>}
 */
export function createColorProp(name, defaultValue, opts) {
  return new PropertyColor(name, defaultValue, opts);
}

/**
 * @template {string} O
 * @template {{ [x: string]: Property }} R
 * @param {string} name
 * @param {string} defaultValue
 * @param {{ desc?: string, options?: O[], shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
 * @returns {Property<O, R>}
 */
export function createOptionProp(name, defaultValue, opts) {
  return new PropertyOption(name, defaultValue, opts);
}

/**
 * @template {{ [x: string]: Property }} R
 * @param {string} name
 * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: R) => StateVar<boolean>, isNewSection?: boolean }} [opts]
 * @returns {Property<null, R>}
 */
export function createActionProp(name, opts) {
  return new PropertyAction(name, opts);
}

export class Settings {
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

  setMainInstance() {
    this.isMainSettings = true;
  }

  load(isAutoLoad = false) {
    if (this.isMainSettings && isAutoLoad) return;
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
    if (this.isMainSettings) {
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
    const msgs = props.filter(v => v.shouldShow.get()).map((p, i) => {
      const m = p.getMessage(i & 1, this.module);
      if (p.isNewSection) m.addTextComponent(0, '\n');
      return m;
    });
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
      .map(v => ({ s: v.name.replace(re, '§d$1§r'), i: v.name.toLowerCase().indexOf(str), p: v }));
    // .sort((a, b) => {
    //   const i = a.i - b.i;
    //   if (i !== 0) return i;
    //   return a.p.name.toLowerCase().localeCompare(b.p.name.toLowerCase(), ['en-US']);
    // });
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
    if (p.type === Property.Type.Action) p.actionListeners.forEach(v => v(false));
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

/**
 * @template {{}} P
 */
export class Builder {
  /** @type {P} */
  props = {};
  /** @private */
  pageNames = [''];

  /** @private */
  page = 0;
  /** @private */
  sort = 0;
  /** @private */
  newSection = false;

  constructor(module, path) {
    this.module = module;
    this.path = path;
  }

  /**
   * @returns {Settings & { [x in keyof P]: P[x]['value'] } & { [x in keyof P as `_${x}`]: P[x] }}
   */
  build() {
    return new Settings(this.module, this.path, this.props, this.pageNames);
  }

  /**
   * @param {string} page
   * @returns {Builder<{ [x in keyof P]: P[x] }}
   */
  addPage(page) {
    this.page++;
    this.sort = 0;
    this.pageNames.push(page);
    return this;
  }

  addDivider() {
    this.newSection = true;
    return this;
  }

  /**
   * @private
   * @returns {Property}
   */
  createProperty(name, type, initial, opts) {
    const optsParsed = {
      desc: opts?.desc,
      min: opts?.min,
      max: opts?.max,
      len: opts?.len,
      options: opts?.options,
      shouldShow: opts && typeof opts?.shouldShow === 'function' ?
        opts.shouldShow(this.props) :
        opts?.shouldShow,
      isNewSection: this.newSection
    };
    if (type === Property.Type.Action) return createActionProp(name, optsParsed);
    return [
      createToggleProp,
      createIntegerProp,
      createNumberProp,
      createPercentProp,
      createTextProp,
      createColorProp,
      createOptionProp
    ][type](name, initial, optsParsed);
  }

  /**
   * @private
   * @param {string} key
   * @param {string} name
   * @param {number} type
   * @returns {Property}
   */
  addProperty(key, name, type, initial, opts) {
    const prop = this.createProperty(name, type, initial, opts);
    prop.page = this.page;
    prop.sort = this.sort;
    this.props[key] = prop;
    this.sort++;
    this.newSection = false;
    return prop;
  }

  /**
   * @template {string} K
   * @param {K} key
   * @param {string} name
   * @param {boolean} initial
   * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: P) => StateVar<boolean> }} [opts]
   * @returns {Builder<P & { [x in K]: PropertyToggle }}
   */
  addToggle(key, name, initial, opts) {
    this.addProperty(key, name, 0, initial, opts);
    return this;
  }

  /**
   * @template {string} K
   * @param {K} key
   * @param {string} name
   * @param {number} initial
   * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: P) => StateVar<boolean> }} [opts]
   * @returns {Builder<P & { [x in K]: PropertyInteger }}
   */
  addInteger(key, name, initial, opts) {
    this.addProperty(key, name, 1, initial, opts);
    return this;
  }

  /**
   * @template {string} K
   * @param {K} key
   * @param {string} name
   * @param {number} initial
   * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: P) => StateVar<boolean> }} [opts]
   * @returns {Builder<P & { [x in K]: PropertyNumber }}
   */
  addNumber(key, name, initial, opts) {
    this.addProperty(key, name, 2, initial, opts);
    return this;
  }

  /**
   * @template {string} K
   * @param {K} key
   * @param {string} name
   * @param {number} initial
   * @param {{ desc?: string, min?: number, max?: number, shouldShow?: StateVar<boolean> | (p: P) => StateVar<boolean> }} [opts]
   * @returns {Builder<P & { [x in K]: PropertyPercent }}
  */
  addPercent(key, name, initial, opts) {
    this.addProperty(key, name, 3, initial, opts);
    return this;
  }

  /**
   * @template {string} K
   * @param {K} key
   * @param {string} name
   * @param {string} initial
   * @param {{ desc?: string, len?: number, shouldShow?: StateVar<boolean> | (p: P) => StateVar<boolean> }} [opts]
   * @returns {Builder<P & { [x in K]: PropertyText }}
  */
  addText(key, name, initial, opts) {
    this.addProperty(key, name, 4, initial, opts);
    return this;
  }

  /**
   * @template {string} K
   * @param {K} key
   * @param {string} name
   * @param {number} initial
   * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: P) => StateVar<boolean> }} [opts]
   * @returns {Builder<P & { [x in K]: PropertyColor }}
  */
  addColor(key, name, initial, opts) {
    this.addProperty(key, name, 5, initial, opts);
    return this;
  }

  /**
   * @template {string} K
   * @template {string} O
   * @param {K} key
   * @param {string} name
   * @param {string} initial
   * @param {{ desc?: string, options?: O[], shouldShow?: StateVar<boolean> | (p: P) => StateVar<boolean> }} [opts]
   * @returns {Builder<P & { [x in K]: PropertyOption<O> }}
   */
  addOption(key, name, initial, opts) {
    this.addProperty(key, name, 6, initial, opts);
    return this;
  }

  /**
   * @template {string} K
   * @param {K} key
   * @param {string} name
   * @param {{ desc?: string, shouldShow?: StateVar<boolean> | (p: P) => StateVar<boolean> }} [opts]
   * @returns {Builder<P & { [x in K]: PropertyAction }}
   */
  addAction(key, name, opts) {
    this.addProperty(key, name, 7, null, opts);
    return this;
  }

  /**
   * @template {{ [x: string]: Property<*, P> }} R
   * @param {R} props
   * @returns {Builder<P & R>}
   */
  addBulk(props) {
    Object.entries(props).forEach(([k, v]) => {
      if (typeof v.shouldShow === 'function') v.shouldShow = v.shouldShow(this.props);
      v.page = this.page;
      v.sort = this.sort;
      this.props[k] = v;
      this.sort++;
    });
    return this;
  }
}