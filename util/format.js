import { base64Encode, base64EncodeInt } from './helper';
import { getItemIdI } from './mc';
import { JavaTypeOrNull, setAccessible } from './polyfill';
import { getSbId } from './skyblock';

/**
 * @param {number} t
 * @param {number} [ms = 0]
 * @returns {string}
 */
export function timeToStr(t, ms = 0) {
  t /= 1000; // t is in seconds
  if (t < 60) return t.toFixed(ms) + 's';
  if (t < 60 * 5) return `${(t / 60).toFixed(0)}m ${(t % 60).toFixed(0)}s`;
  t /= 60; // t is in minutes
  if (t < 60) return t.toFixed(0) + 'm';
  if (t < 60 * 10) return `${(t / 60).toFixed(0)}h ${(t % 60).toFixed(0)}m`;
  t /= 60; // t is in hours
  if (t < 24) return t.toFixed(0) + 'h';
  if (t < 48) return `1d ${(t - 24).toFixed(0)}h`;
  t /= 24; // t is in days
  if (t < 7) return t.toFixed(0) + 'd';
  let years = t / 365;
  t %= 365;
  let weeks = t / 7;
  t %= 7;
  years = years > 1 ? years.toFixed(0) + 'y ' : '';
  weeks = weeks > 1 ? weeks.toFixed(0) + 'w ' : '';
  let days = t > 1 ? t.toFixed(0) + 'd' : '';
  return years + weeks + days;
}

/**
 * @param {number} n
 * @param {number?} e
 * @returns {string}
 */
export function cleanNumber(n, e = 2) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(e);
}

/**
 * @param {number} n
 * @returns {string}
 */
export function commaNumber(n) {
  return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * @param {number} n
 * @param {number} max
 * @returns {string}
 */
export function colorForNumber(n, max = 1) {
  return (n > max * 0.75 ? '§2' :
    n > max * 0.5 ? '§e' :
      n > max * 0.25 ? '§6' :
        '§4');
}

const isUsingChatting = JavaTypeOrNull('org.polyfrost.chatting.Chatting') !== null;
/**
 * @param {string} msg
 */
function getCenteredTextLen(msg) {
  const scale = isUsingChatting ? 1 : Client.settings.chat.getScale();
  const msgWidth = Renderer.getStringWidth(msg) / scale;
  const margins = ChatLib.getChatWidth() - msgWidth;
  return (margins / Renderer.getStringWidth(' ') / scale) >> 1;
}

/**
 * @template {any} T
 * @param {T} msg
 * @returns {T}
 */
export function centerMessage(msg) {
  if (msg instanceof Message) return msg.addTextComponent(0, ' '.repeat(getCenteredTextLen(msg.getFormattedText())));
  if (typeof msg !== 'string') msg = msg.toString();
  return ' '.repeat(getCenteredTextLen(msg)) + msg;
}

/**
 * @param {string} name
 */
export function getPlayerName(name) {
  // rhino :trash:
  // org.mozilla.javascript.EcmaError: SyntaxError: Invalid quantifier ?
  // /(?<=\s|^)(?:(?:§|&).){0,}([A-Za-z0-9_]+?)(?:(?:§|&).){0,}\b/
  // more rhino bullshit?
  const match = name.toString().match(/(?:\s|^)(?:(?:§|&).){0,}([A-Za-z0-9_]+?)(?:(?:§|&).){0,}\b(?!.+?])/);
  if (!match) return '';
  return match[1];
}

/**
 * @param {number} amnt
 * @param {string?} name
 * @returns {string}
 */
export function formatQuantity(amnt, name = '') {
  return `${amnt > 0 ? '&a+' : amnt < 0 ? '&c-' : '&e±'} ${commaNumber(Math.abs(amnt))}x${name ? ' &r' + name : ''}`;
}

export const serialize = (function() {
  const JavaNumber = Java.type('java.lang.Number');
  const CTNativeJavaList = Java.type('org.mozilla.javascript.NativeJavaList');
  const JavaMap = Java.type('java.util.Map');

  const Vector3f = Java.type('org.lwjgl.util.vector.Vector3f');
  const UUID = Java.type('java.util.UUID');

  const MCVec3 = Java.type('net.minecraft.util.Vec3');
  const MCVec3i = Java.type('net.minecraft.util.Vec3i');
  const MCVec4b = Java.type('net.minecraft.util.Vec4b');
  const MCRotations = Java.type('net.minecraft.util.Rotations');

  const MCBlock = Java.type('net.minecraft.block.Block');
  const MCIBlockState = Java.type('net.minecraft.block.state.IBlockState');
  const MCItem = Java.type('net.minecraft.item.Item');
  const MCItemStack = Java.type('net.minecraft.item.ItemStack');
  const MCIChatComponent = Java.type('net.minecraft.util.IChatComponent');
  const MCChatStyle = Java.type('net.minecraft.util.ChatStyle');
  const MCChatStyle$color = setAccessible(MCChatStyle.class.getDeclaredField('field_150247_b'));
  const MCChatStyle$bold = setAccessible(MCChatStyle.class.getDeclaredField('field_150248_c'));
  const MCChatStyle$italic = setAccessible(MCChatStyle.class.getDeclaredField('field_150245_d'));
  const MCChatStyle$underlined = setAccessible(MCChatStyle.class.getDeclaredField('field_150246_e'));
  const MCChatStyle$strikethrough = setAccessible(MCChatStyle.class.getDeclaredField('field_150243_f'));
  const MCChatStyle$obfuscated = setAccessible(MCChatStyle.class.getDeclaredField('field_150244_g'));
  const MCChatStyle$insertion = setAccessible(MCChatStyle.class.getDeclaredField('field_179990_j'));
  const MCChatStyle$chatClickEvent = setAccessible(MCChatStyle.class.getDeclaredField('field_150251_h'));
  const MCChatStyle$chatHoverEvent = setAccessible(MCChatStyle.class.getDeclaredField('field_150252_i'));
  const MCClickEvent = Java.type('net.minecraft.event.ClickEvent');
  const MCHoverEvent = Java.type('net.minecraft.event.HoverEvent');

  const MCNBTBase = Java.type('net.minecraft.nbt.NBTBase');
  const MCNBTTagByte = Java.type('net.minecraft.nbt.NBTTagByte');
  const MCNBTTagDouble = Java.type('net.minecraft.nbt.NBTTagDouble');
  const MCNBTTagFloat = Java.type('net.minecraft.nbt.NBTTagFloat');
  const MCNBTTagInt = Java.type('net.minecraft.nbt.NBTTagInt');
  const MCNBTTagLong = Java.type('net.minecraft.nbt.NBTTagLong');
  const MCNBTTagShort = Java.type('net.minecraft.nbt.NBTTagShort');
  const MCNBTTagString = Java.type('net.minecraft.nbt.NBTTagString');
  const MCNBTTagByteArray = Java.type('net.minecraft.nbt.NBTTagByteArray');
  const MCNBTTagIntArray = Java.type('net.minecraft.nbt.NBTTagIntArray');
  const MCNBTTagCompound = Java.type('net.minecraft.nbt.NBTTagCompound');
  const MCNBTTagList = Java.type('net.minecraft.nbt.NBTTagList');
  const MCNBTTagEnd = Java.type('net.minecraft.nbt.NBTTagEnd');
  const MCNBTTagByteArray$getData = MCNBTTagByteArray.class.getDeclaredMethod('func_150292_c');
  const MCNBTTagIntArray$getData = MCNBTTagIntArray.class.getDeclaredMethod('func_150302_c');

  /**
   * @param {any} obj
   * @param {number} [depth = 3]
   * @param {object} [options = {}]
   * @param {number} [options.precision = 3]
   * @returns {string}
   */
  return function(obj, depth = 3, options = {}) {
    let t = 'object';
    const { precision = 3 } = options;
    try {
      t = typeof obj;
    } catch (e) { }
    switch (t) {
      case 'string': return `'${obj}'`;
      case 'number': return Number.isInteger(obj) || precision < 0 ? obj.toString() : obj.toFixed(precision);
      case 'bigint': return obj.toString() + 'n';
      case 'boolean': return obj.toString();
      case 'function': return `function ${'name' in obj ? obj.name : obj.class.getSimpleName()}() {}`
      case 'symbol': return '@@' + obj.description;
      case 'undefined': return 'undefined';
      case 'object':
        if (obj === null) return 'null';
        if (obj instanceof Date) return obj.toISOString();
        if (obj instanceof Error) return obj.toString();
        if (obj instanceof Set) return 'Set' + serialize(Array.from(obj.keys()), depth, options);
        if (obj instanceof Map) return 'Map' + serialize(Array.from(obj.entries()).reduce((a, [k, v]) => (a[k] = v, a), {}), depth, options);
        if (Array.isArray(obj)) {
          if (depth === 0) return `Array(${obj.length})`;
          return `[${obj.map(v => serialize(v, depth - 1, options)).join(', ')}]`;
        }

        if (obj.getClass?.()?.isEnum?.()) return `{Enum|${obj.name()}}`;
        if (obj.getClass?.()?.isArray?.()) return 'JavaArray' + serialize(Array.from(obj), depth, options);
        if (obj instanceof JavaNumber) return serialize(obj.doubleValue(), depth, options);
        if (obj instanceof CTNativeJavaList) return 'JavaList' + serialize(Array.from(obj), depth, options);
        if (obj instanceof JavaMap) return 'JavaMap' + serialize(obj.entrySet().reduce((a, v) => (a[v.getKey()] = v.getValue(), a), {}));

        if (obj instanceof Vector3f) return `Vector3f<${serialize(obj.x, depth, options)}, ${serialize(obj.y, depth, options)}, ${serialize(obj.z, depth, options)}>`;
        if (obj instanceof UUID) return `{UUID|${serialize(obj.toString(), depth, options)}}`;

        if (obj instanceof MCVec3) return `Vec3<${serialize(obj.field_72450_a, depth, options)}, ${serialize(obj.field_72448_b, depth, options)}, ${serialize(obj.field_72449_c, depth, options)}>`;
        if (obj instanceof MCVec3i) return `Vec3i(${serialize(obj.func_177958_n(), depth, options)}, ${serialize(obj.func_177956_o(), depth, options)}, ${serialize(obj.func_177952_p(), depth, options)})`;
        if (obj instanceof MCVec4b) return `Vec4b(${serialize(obj.func_176110_a(), depth, options)}, ${serialize(obj.func_176112_b(), depth, options)}, ${serialize(obj.func_176113_c(), depth, options)}, ${serialize(obj.func_176111_d(), depth, options)})`;
        if (obj instanceof MCRotations) return `Rotations[${serialize(obj.func_179415_b(), depth, options)}i + ${serialize(obj.func_179416_c(), depth, options)}j + ${serialize(obj.func_179413_d(), depth, options)}k]`;

        if (obj instanceof MCBlock) return `{Block|${serialize(obj.func_149732_F(), depth, options)}|${serialize(MCBlock.func_149682_b(obj), depth, options)}}`;
        if (obj instanceof MCIBlockState) return `{IBlockState|${serialize(obj.func_177230_c(), depth, options)}|meta=${serialize(obj.func_177230_c().func_176201_c(obj), depth, options)}}`;
        if (obj instanceof MCItem) return `{Item|${serialize(getItemIdI(obj), depth, options)}}`;
        if (obj instanceof MCItemStack) return `{ItemStack|${serialize(obj.func_77973_b(), depth, options)}|damage=${serialize(obj.func_77952_i(), depth, options)}|count=${serialize(obj.field_77994_a, depth, options)}|sbid=${serialize(getSbId(obj), depth, options)}|nbt=${serialize(obj.func_77978_p(), depth, options)}}`;
        if (obj instanceof MCIChatComponent) return `{IChatComponent|ftext=${serialize(obj.func_150254_d(), depth, options)}|text=${serialize(obj.func_150261_e(), depth, options)}|style=${serialize(obj.func_150256_b(), depth, options)}|comps=${serialize(Array.from(obj.func_150253_a()), depth, options)}}`;
        if (obj instanceof MCChatStyle) return `{ChatStyle|style=${serialize([
          MCChatStyle$color.get(obj)?.toString(),
          MCChatStyle$bold.get(obj) ? '§l' : '',
          MCChatStyle$italic.get(obj) ? '§o' : '',
          MCChatStyle$underlined.get(obj) ? '§n' : '',
          MCChatStyle$strikethrough.get(obj) ? '§m' : '',
          MCChatStyle$obfuscated.get(obj) ? '§k' : '',
        ].filter(Boolean).join(''), depth, options)}|style_=${serialize(obj.func_150218_j(), depth, options)}${['', ...[
          ['insertion', MCChatStyle$insertion.get(obj)],
          ['insertion_', obj.func_179986_j()],
          ['click', MCChatStyle$chatClickEvent.get(obj)],
          ['click_', obj.func_150235_h()],
          ['hover', MCChatStyle$chatHoverEvent.get(obj)],
          ['hover_', obj.func_150210_i()],
        ].filter(v => v[1] !== null).map(v => v[0] + '=' + serialize(v[1], depth, options))].join('|')}}`;
        if (obj instanceof MCClickEvent) return `{ClickEvent|action=${obj.func_150669_a().name()}|value=${serialize(obj.func_150668_b(), depth, options)}}`;
        if (obj instanceof MCHoverEvent) return `{HoverEvent|action=${obj.func_150701_a().name()}|value=${serialize(obj.func_150702_b(), depth, options)}}`;

        if (obj instanceof MCNBTBase) {
          if (obj instanceof MCNBTTagByte) return `{NBTTagByte|${serialize(obj.func_150290_f(), depth, options)}}`;
          if (obj instanceof MCNBTTagDouble) return `{NBTTagDouble|${serialize(obj.func_150286_g(), depth, options)}}`;
          if (obj instanceof MCNBTTagFloat) return `{NBTTagFloat|${serialize(obj.func_150288_h(), depth, options)}}`;
          if (obj instanceof MCNBTTagInt) return `{NBTTagInt|${serialize(obj.func_150287_d(), depth, options)}}`;
          if (obj instanceof MCNBTTagLong) return `{NBTTagLong|${serialize(obj.func_150291_c(), depth, options)}}`;
          if (obj instanceof MCNBTTagShort) return `{NBTTagShort|${serialize(obj.func_150289_e(), depth, options)}}`;
          if (obj instanceof MCNBTTagString) return `{NBTTagString|${serialize(obj.func_150285_a_(), depth, options)}}`;
          if (obj instanceof MCNBTTagByteArray) return `{NBTTagByteArray|${serialize(base64Encode(MCNBTTagByteArray$getData, obj, []), depth, options)}}`;
          if (obj instanceof MCNBTTagIntArray) return `{NBTTagByteArray|${serialize(base64EncodeInt(MCNBTTagIntArray$getData, obj, []), depth, options)}}`;
          if (obj instanceof MCNBTTagCompound) {
            const keys = obj.func_150296_c();
            const newObj = {};
            keys.forEach(v => newObj[v] = obj.func_74781_a(v));
            return `{NBTTagCompound|${serialize(newObj, depth, options)}}`;
          }
          if (obj instanceof MCNBTTagList) {
            const l = obj.func_74745_c();
            const arr = [];
            for (let i = 0; i < l; i++) {
              arr.push(obj.func_179238_g(i));
            }
            return `{NBTTagList|${serialize(arr, depth, options)}}`;
          }
          if (obj instanceof MCNBTTagEnd) return `{NBTTagEnd}`;
          return `{${obj.getClass().getSimpleName()}}`;
        }

        if (depth === 0) return `[object ${obj.constructor ? obj.constructor.name : 'Object'}]`;
        const ent = Object.entries(obj);
        if (ent.length === 0) return '{}';
        return '{ ' + ent.map(([k, v]) => `${k}: ${serialize(v, depth - 1, options)}`).join(', ') + ' }';
    }
  };
}());