// vigilance refused to work

import { centerMessage } from './util/format';
import { log } from './util/log';

// if reloading modules without cache it resets settings :(
let isMainSettings = false;
export function setIsMain() {
  isMainSettings = true;
};
export class Property {
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
   * @param {number} type
   * @param {any} defaultValue
   * @param {{ desc: string, min: number, max: number, len: number, options: string[] }} opts
   */
  constructor(name, page, pageSort, type, defaultValue, { desc = '', min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, len = Number.POSITIVE_INFINITY, options = [] } = {}) {
    if (name.includes(' ')) throw 'bad parser deal with it';
    this.name = name;
    this.desc = desc;
    this.page = page;
    this.sort = pageSort;
    this.type = type;
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.opts = { min, max, len, options };
    this.listeners0 = [];
    this.listeners1 = [];
    this.actionListeners = [];
  }
  set(v, force) {
    if (this.type === Property.Type.Action) return;
    if (!force && v === this.value) return;
    this.validate(v);
    this.listeners0.forEach(cb => cb(v, old));
    const old = this.value;
    this.value = v;
    this.listeners1.forEach(cb => cb(v, old));
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
        if (v.length > this.opts.len) throw 'length of string must exceed ' + this.opts.len;
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
   * @param {(this: Property, newValue: string | number | boolean, oldValue: string | number | boolean) => void} cb
   */
  onBeforeChange(cb) {
    this.listeners0.push(cb);
  }
  /**
   * @param {(this: Property, newValue: string | number | boolean, oldValue: string | number | boolean) => void} cb
   */
  onAfterChange(cb) {
    this.listeners1.push(cb);
  }
  /**
   * @param {(this: Property) => void} cb
   */
  onAction(cb) {
    this.actionListeners.push(cb);
  }

  getMessage(module, name = this.name) {
    const comps = [this.desc ? new TextComponent(` &f${name}`).setHover('show_text', this.desc) : ` &f${name}`];
    if (this.type === Property.Type.Action) comps.unshift(new TextComponent('&7[&eRUN&7]&r').setClick('run_command', `/${module} config edit ${this.name}`));
    else {
      comps.unshift(
        new TextComponent('&7[&4RESET&7]&r').setClick('run_command', `/${module} config edit ${this.name}`),
        new TextComponent('&7[&aEDIT&7]&r').setClick('suggest_command', `/${module} config edit ${this.name} ${this.toString()}`)
      );
      comps.push(`&7:&6 ${this.toString()}`);
    }
    if (this.type === Property.Type.Toggle) comps[1] = new TextComponent('&7[&bTOGGLE&7]&r').setClick('run_command', `/${module} config edit ${this.name} TOGGLE`);
    return new Message(...comps);
  }
}

const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');
function deleteMessages(msgs) {
  if (!helper) return;
  helper.deleteMessages(msgs.map(v => v.getFormattedText()));
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
      v[1].onAfterChange(() => this[v[0]] = v[1].valueOf());
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
    if (isMainSettings) register('gameUnload', () => this.save());
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

  refresh() {
    this.props.forEach(p => {
      p.listeners0.forEach(v => v(p.value, p.value));
      p.listeners1.forEach(v => v(p.value, p.value));
    });
  }

  prevMsgs = [];
  /**
   * @param {number} page
   */
  display(page) {
    const props = this.props.filter(v => v.page === page);
    props.sort((a, b) => a.sort - b.sort);
    const msgs = props.map(p => p.getMessage(this.module));
    const pageNav = new Message(page === this.minPage ? '   ' : new TextComponent('&a<- ').setClick('run_command', `/${this.module} config view ${page - 1}`), `&fPage &6${page} &fof &6${this.maxPage}`, page === this.maxPage ? '   ' : new TextComponent('&a ->').setClick('run_command', `/${this.module} config view ${page + 1}`));
    centerMessage(pageNav);
    // msgs.unshift(pageNav.clone());
    msgs.unshift(new Message(centerMessage(`&d&l${this.module} &b&l${this.pageNames[page]} &d&lSettings`)));
    msgs.push(pageNav);
    // this.prevMsgs.forEach(v => ChatLib.deleteChat(v));
    deleteMessages(this.prevMsgs);
    msgs.forEach(v => v.chat());
    this.prevMsgs = msgs;
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
    const msgs = props.map(({ s, p }) => p.getMessage(this.module, s));
    msgs.unshift(new Message(centerMessage(`&d&l${this.module} &b&l"${str}" &d&lSettings`)));
    // this.prevMsgs.forEach(v => ChatLib.deleteChat(v));
    deleteMessages(this.prevMsgs);
    msgs.forEach(v => v.chat());
    this.prevMsgs = msgs;
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
      if (val) p.set(p.parse(val));
      else p.set(p.defaultValue);
      this.save();
      log(`Set ${p.name} to ${p.toString()}`);
    }
  }
}

let page = 0;
let sort = 0;
export const props = {
  // 1
  enableGlobal: new Property('Enable', ++page, sort = 0, Property.Type.Toggle, true, { desc: 'toggles mod globally' }),
  autoUpdate: new Property('CheckForUpdates', page, ++sort, Property.Type.Toggle, true, { desc: 'check for updates when loaded' }),
  isDev: new Property('IsDev', page, ++sort, Property.Type.Toggle, false, { desc: 'negatively impacts loading performance and may spam your chat' }),
  pingRefreshDelay: new Property('PingRefreshDelay', page, ++sort, Property.Type.Number, 10, { desc: 'how often (in seconds) to refresh ping. set to 0 to disable ping. requires skytils' }),
  preferUseTracer: new Property('PreferUseTracer', page, ++sort, Property.Type.Toggle, false, { desc: 'when available, prefer to use a tracer rather than an arrow (is jittery, looks bad, and sometimes doesnt show because renderlib2d reasons)' }),

  // 2
  enablekuudra: new Property('EnableKuudra', ++page, sort = 0, Property.Type.Toggle, true),

  kuudraRenderPearlTarget: new Property('KuudraRenderPearlTarget', page, ++sort, Property.Type.Toggle, true, { desc: 'render location to aim at for sky pearls\n(but not hardcoded + actually accurate + with timer)' }),
  kuudraPearlTargetColor: new Property('KuudraPearlTargetColor', page, ++sort, Property.Type.Color, 0xFFFF00FF),

  kuudraRenderEmptySupplySpot: new Property('KuudraRenderEmptySupplySpot', page, ++sort, Property.Type.Toggle, true, { desc: 'render available supply dropoff location' }),
  kuudraEmptySupplySpotColor: new Property('KuudraEmptySupplySpotColor', page, ++sort, Property.Type.Color, 0xFF0000FF),

  kuudraBoxSupplies: new Property('KuudraBoxSupplies', page, ++sort, Property.Type.Toggle, true),
  kuudraBoxSuppliesColor: new Property('KuudraBoxSuppliesColor', page, ++sort, Property.Type.Color, 0x00FF00FF),
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
  dungeonBoxFelColor: new Property('DungeonBoxFelColor', page, ++sort, Property.Type.Color, 0x00FF80FF, { desc: 'color for fels' }),
  dungeonBoxChonkColor: new Property('DungeonBoxChonkersColor', page, ++sort, Property.Type.Color, 0xFF0080FF, { desc: 'color for withermancers, commanders, lords, and super archers' }),
  dungeonBoxMiniColor: new Property('DungeonBoxMiniColor', page, ++sort, Property.Type.Color, 0xB400B4FF, { desc: 'color for LAs,  FAs, and AAs' }),
  dungeonBoxMobDisableInBoss: new Property('DungeonBoxMobDisableInBoss', page, ++sort, Property.Type.Toggle, false),

  dungeonBoxWither: new Property('DungeonBoxWither', page, ++sort, Property.Type.Toggle, true, { desc: 'independent from box mobs' }),
  dungeonBoxWitherEsp: new Property('DungeonBoxWitherEsp', page, ++sort, Property.Type.Toggle, true),
  dungeonBoxWitherColor: new Property('DungeonBoxWitherColor', page, ++sort, Property.Type.Color, 0x515A0BFF),

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
  dungeonCampSkipTimer: new Property('DungeonCampDialogueSkipTimer', page, ++sort, Property.Type.Toggle, false, { desc: 'timer until last of first 4 blood mobs spawn' }),
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

  dungeonShowSecrets: new Property('DungeonShowSecrets', page, ++sort, Property.Type.Option, 'None', { desc: 'does not work yet', options: ['None', 'Wire', 'Waypoint'] }),

  dungeonHideHealerPowerups: new Property('DungeonHideHealerPowerups', page, ++sort, Property.Type.Toggle, true, { desc: 'hide healer power orbs (and particles!)' }),

  dungeonAutoArchitect: new Property('DungeonAutoGFSArchitect', page, ++sort, Property.Type.Toggle, true, { desc: 'auto gfs on puzzle fail, and a friendly reminder' }),

  dungeonNecronDragTimer: new Property('DungeonNecronDragTimer', page, ++sort, Property.Type.Option, 'None', { desc: 'timer when necron does some dragging\n(timer will automatically pop up when instamidding!)', options: ['OnScreen', 'InstaMid', 'Both', 'None'] }),
  moveNecronDragTimer: new Property('MoveNecronDragTimer', page, ++sort, Property.Type.Action),

  dungeonDev4Helper: new Property('DungeonClearViewDev4', page, ++sort, Property.Type.Option, 'Both', { desc: 'clearer vision while doing 4th dev', options: ['None', 'Titles', 'Particles', 'Both'] }),

  dungeonStairStonkHelper: new Property('DungeonStairStonkHelper', page, ++sort, Property.Type.Toggle, false, { desc: 'same as soopy but does not cut fps in half' }),
  dungeonStairStonkHelperColor: new Property('DungeonStairStonkHelperColor', page, ++sort, Property.Type.Color, 0xFF0000FF),

  dungeonAutoRefillPearls: new Property('DungeonAutoRefillPearls', page, ++sort, Property.Type.Toggle, true, { desc: 'automatically run /gfs at start of each run to replenish used pearls' }),
  dungeonAutoRefillPearlsAmount: new Property('DungeonAutoRefillPearlsAmount', page, ++sort, Property.Type.Integer, 16, { desc: 'amount of pearls you want to start run with', min: 0, max: 560 }),

  dungeonM7LBWaypoints: new Property('DungeonDragonLBWaypoints', page, ++sort, Property.Type.Toggle, false),

  dungeonGoldorDpsStartAlert: new Property('DungeonGoldorDpsStartAlert', page, ++sort, Property.Type.Toggle, false),
  dungeonGoldorDpsStartAlertTime: new Property('DungeonGoldorDpsStartAlertTime', page, ++sort, Property.Type.Integer, 500, { desc: 'in ms', min: 0 }),
  dungeonGoldorDpsStartAlertSound: new Property('DungeonGoldorDpsStartAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),

  dungeonTerminalBreakdown: new Property('DungeonTerminalBreakdown', page, ++sort, Property.Type.Toggle, false, { desc: 'displays terminals done by each person' }),

  dungeonPlaySoundKey: new Property('DungeonPlaySoundOnKey', page, ++sort, Property.Type.Toggle, false, { desc: 'play dulkir secret sound on pickup key, requires dulkir' }),

  dungeonIceSprayAlert: new Property('DungeonIceSprayAlert', page, ++sort, Property.Type.Toggle, true, { desc: 'alert on ice spray drop' }),
  dungeonIceSprayAlertTime: new Property('DungeonIceSprayAlertTime', page, ++sort, Property.Type.Integer, 2000, { desc: 'in ms', min: 0 }),
  dungeonIceSprayAlertSound: new Property('DungeonIceSprayAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),

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
  ratTilsMessage: new Property('RatTilsMessage', page, ++sort, Property.Type.Text, 'i.imgur.com/8da4IiM.png', { desc: 'empty to disable' }),
  ratTilsMuteSound: new Property('RatTilsMuteSound', page, ++sort, Property.Type.Toggle, true, { desc: 'mute rat squeaking sounds' }),

  // 7
  enablepowderalert: new Property('EnablePowderAlert', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'alerts when powder chest spawns' }),
  powderBoxColor: new Property('PowderBoxColor', page, ++sort, Property.Type.Color, 0x00FF00FF),
  powderBoxEsp: new Property('PowderBoxEsp', page, ++sort, Property.Type.Toggle, true),
  powderAlertTime: new Property('PowderAlertTime', page, ++sort, Property.Type.Integer, 1000, { desc: 'in ms', min: 0 }),
  powderAlertSound: new Property('PowderAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),
  powderScanRange: new Property('PowderScanRange', page, ++sort, Property.Type.Integer, 10, { min: 0 }),

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
  rabbitSniffer: new Property('RabbitTilsSniffEggs', page, ++sort, Property.Type.Toggle, false),
  rabbitBoxColor: new Property('RabbitTilsBoxColor', page, ++sort, Property.Type.Color, 0x00FF80FF),
  rabbitBoxEsp: new Property('RabbitTilsBoxEsp', page, ++sort, Property.Type.Toggle, true),
  rabbitAlertEggSpawn: new Property('RabbitTilsAlertEggSpawn', page, ++sort, Property.Type.Toggle, true),
  rabbitAlertEggFound: new Property('RabbitTilsAlertEggFound', page, ++sort, Property.Type.Toggle, true),
  rabbitAlertTime: new Property('RabbitTilsAlertTime', page, ++sort, Property.Type.Integer, 2000, { desc: 'in ms', min: 0 }),
  rabbitAlertSound: new Property('RabbitTilsAlertSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),
  rabbitAlertOnlyDinner: new Property('RabbitTilsOnlyAlertDinner', page, ++sort, Property.Type.Toggle, false, { desc: 'only ping on dinner eggs for peak afk' }),
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
  chatTilsHideLeap: new Property('ChatTilsHidePartyChatLeaps', page, ++sort, Property.Type.Option, 'False', { desc: '"Leaped/Leaping to plinkingndriving" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'] }),
  chatTilsHideMelody: new Property('ChatTilsHidePartyChatMelody', page, ++sort, Property.Type.Option, 'False', { desc: '"melody (1/4)/25%" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'] }),
  chatTilsCompactMelody: new Property('ChatTilsCompactPartyChatMelody', page, ++sort, Property.Type.Toggle, true, { desc: 'only keep most recent melody message from a player' }),

  chatTilsClickAnywhereFollow: new Property('ChatTilsClickAnywhereFollow', page, ++sort, Property.Type.Toggle, false, { desc: 'click anywhere after opening chat to follow party member\n(mostly for diana/assfang/jumpy dt cube)' }),
  chatTilsClickAnywhereFollowOnlyLead: new Property('ChatTilsClickAnywhereFollowOnlyLead', page, ++sort, Property.Type.Toggle, true, { desc: 'only follow leader' }),

  // 13
  enablediana: new Property('EnableDiana', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'requires skytils to work (not the meow solver)' }),
  dianaArrowToBurrow: new Property('DianaArrowToBurrow', page, ++sort, Property.Type.Toggle, true, { desc: 'draw an arrow pointing to nearest burrow' }),
  dianaArrowToBurrowColor: new Property('DianaArrowToBurrowColor', page, ++sort, Property.Type.Color, 0x9FE2BF),
  dianaPreferFinish: new Property('DianaPreferFinishCurrentChain', page, ++sort, Property.Type.Toggle, true, { desc: 'whether you prefer to do one chain at a time\nor do 5-6 at a time' }),
  dianaAlertFoundBurrow: new Property('DianaAlertFoundBurrow', page, ++sort, Property.Type.Toggle, true, { desc: 'alert when burrow is found' }),
  dianaAlertFoundBurrowNoStart: new Property('DianaAlertFoundBurrowNoStart', page, ++sort, Property.Type.Toggle, false, { desc: 'do not alert when found burrow is a start burrow' }),
  dianaAlertFoundBurrowTime: new Property('DianaAlertFoundBurrowTime', page, ++sort, Property.Type.Integer, 500, { desc: 'in ms' }),
  dianaAlertFoundBurrowSound: new Property('DianaAlertFoundBurrowSound', page, ++sort, Property.Type.Toggle, true, { desc: 'play sound with the alert' }),
  dianaFixSkytils: new Property('DianaFixSkytils', page, ++sort, Property.Type.Toggle, false, { desc: 'only keep 1 guess waypoint at a time\nalternatively use /ctsmanualfixstdiana to remove oldest guess' }),
  dianaGuessFromParticles: new Property('DianaGuessFromParticles', page, ++sort, Property.Type.Toggle, false, { desc: '/togglesound must be on, from soopy (but not fps tax)\ndoes not require skytils but a lot more consistent with it' }),
  dianaGuessFromParticlesColor: new Property('DianaGuessFromParticlesColor', page, ++sort, Property.Type.Color, 0x00FFFFFF),

  // 14
  enableabsorption: new Property('EnableCustomAbsorption', ++page, sort = 0, Property.Type.Toggle, false, { desc: 'custom absorption renderer to more accurately portray total hp' }),
  absorptionMaxHearts: new Property('AbsorptionMaxHearts', page, ++sort, Property.Type.Integer, 40, { desc: 'caps hearts for things like mastiff', min: 0 }),

  enableboxallentities: new Property('EnableBoxAllEntities', page, ++sort, Property.Type.Toggle, false, { desc: 'mostly for debugging' }),
  boxAllEntitiesColor: new Property('BoxAllEntitiesColor', page, ++sort, Property.Type.Color, 0xFF0000FF),
  boxAllEntitiesEsp: new Property('BoxAllEntitiesEsp', page, ++sort, Property.Type.Toggle, true),

  enableexcavatorsolver: new Property('EnableExcavatorSolver', page, ++sort, Property.Type.Toggle, false, { desc: 'find fossils' }),
  excavatorSolverOnlyShowBest: new Property('ExcavatorSolverOnlyHighlightBest', page, ++sort, Property.Type.Toggle, true, { desc: 'only highlight the best move' }),
  excavatorSolverShowRoute: new Property('ExcavatorSolverHighlightStartPath', page, ++sort, Property.Type.Toggle, false, { desc: 'highlight best starting path (turn off if citrine gemstones)' }),
  excavatorSolverDirtTooltip: new Property('ExcavatorSolverDirtTooltip', page, ++sort, Property.Type.Option, 'Custom', { options: ['Default', 'Hide', 'Custom'] }),
  excavatorSolverDustTooltip: new Property('ExcavatorSolverDustTooltip', page, ++sort, Property.Type.Option, 'Custom', { options: ['Default', 'Hide', 'Custom'] }),
  excavatorSolverAutoClose: new Property('ExcavatorSolverAutoClose', page, ++sort, Property.Type.Toggle, false, { desc: 'automatically close excavator when all clicks used' }),

  enablebettergfs: new Property('EnableBetterGFS', page, ++sort, Property.Type.Toggle, false, { desc: 'autocomplete for gfs, and shorthand\ne.g. /gfs w c 1 -> /gfs WITHER_CATALYST 1' }),
  betterGFSBlankAmount: new Property('BetterGFSUnspecifiedAmount', page, ++sort, Property.Type.Integer, 1, { desc: 'amount to default to when not provided\ne.g. /gfs w c -> /gfs WITHER_CATALYST <insert amount>', min: 1, max: 2240 }),
  betterGFSIDPref: new Property('BetterGFSIdPreference', page, ++sort, Property.Type.Option, 'Dynamic', { desc: 'which format to prefer (name vs id)\nName: replace with qualified name, ID: coerce to ID\nDynamic: use whatever format was given (in theory)', options: ['Dynamic', 'ID', 'Name'] }),

  enablecpv: new Property('EnableChickTilsPV', page, ++sort, Property.Type.Toggle, true, { desc: '/cpv, neu /pv wrapper but with different api\n(almost 100% success rate!)' }),
  cpvReplaceNeu: new Property('ChickTilsPVReplaceNEU', page, ++sort, Property.Type.Toggle, false, { desc: 'replace /pv command (may require restart when disabling)' }),
  cpvAutoCompleteTabList: new Property('ChickTilsAutoCompleteTabList', page, ++sort, Property.Type.Toggle, true, { desc: 'autocomplete /pv with names from tab list' }),
  cpvAutoCompleteParty: new Property('ChickTilsAutoCompleteParty', page, ++sort, Property.Type.Toggle, true, { desc: 'autcomplete /pv with party members' })
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
  'Misc.'
];
/**
 * PROPERTY TYPES ARE INCORRECT
 *
 * `settings[name]` is a primitive
 *
 * use `settings['_' + name]` to access the `Property`
 *
 * @type {Settings & Record<keyof typeof props, string | number | boolean> & { [K: string]: Property }}
 */
const inst = new Settings('ChickTils', 'settings.json', props, pageNames);

export default inst;