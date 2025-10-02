import { log } from './log';
import { unrun } from './threading';

const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');
const hasHelper = helper.MODID === 'chicktilshelper';
if (!hasHelper) log('&4helper mod not found, some features may not work');

/** @param {import('../../@types/External').JavaClass<'net.minecraftforge.event.entity.player.ItemTooltipEvent'>} evn */
export function clearTooltip(evn) {
  if (!hasHelper) return;
  helper.clearTooltip(evn);
}

/**
 * @param {import('../../@types/External').JavaClass<'net.minecraftforge.event.entity.player.ItemTooltipEvent'>} evn
 * @param {string} str
 * */
export function addTooltip(evn, str) {
  if (!hasHelper) return;
  helper.addTooltip(evn, str);
}

/**
 * @param {number} start
 * @param {number} end
 */
export function deleteChatIds(start, end) {
  if (!hasHelper) return;
  unrun(() => helper.deleteChatIds(start, end));
}

/**
 * @param {number} target
 */
export function deleteChatId(target) {
  if (!hasHelper) return;
  unrun(() => helper.deleteChatId(target));
}

/** @param {import('../../@types/External').JavaClass<'java.net.URLConnection'>} url */
export function removeCertCheck(url) {
  if (!hasHelper) return;
  helper.removeCertCheck(url);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function removeLastElement(f, o) {
  if (!hasHelper) return false;
  return helper.removeLastElement(f, o);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function removeElementSet(f, o, r) {
  if (!hasHelper) return false;
  return helper.removeElementSet(f, o, r);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function removeElementMap(f, o, r) {
  if (!hasHelper) return false;
  return helper.removeElementMap(f, o, r);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function addElementList(f, o, v) {
  if (!hasHelper) return false;
  return helper.addElementList(f, o, v);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Method'>} m
 * @param {any} o
 * @param {any[]} args
 * @returns {string}
 */
export function base64Encode(m, o, args) {
  if (!hasHelper) return '';
  return helper.base64Encode(m, o, args);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Method'>} m
 * @param {any} o
 * @param {any[]} args
 * @returns {string}
 */
export function base64EncodeInt(m, o, args) {
  if (!hasHelper) return '';
  return helper.base64EncodeInt(m, o, args);
}