import { log } from './log';
import { JavaTypeOrNull } from './polyfill';
import { unrun } from './threading';

const helper = JavaTypeOrNull('com.perseuspotter.chicktilshelper.ChickTilsHelper');
if (!helper) log('&4helper mod not found, some features may not work. to fix please redownload from the github (https://github.com/PerseusPotter/chicktils/blob/master/chicktilshelper/build/libs/chicktilshelper-1.0.jar) and replace in /ct files -> modules -> chicktils -> chicktilshelper -> build -> libs. if attempting to delete the old jar results in "file in use", please close mc, and force close any launcher instances using task manager (or system monitor) and try again');

/** @param {import('../../@types/External').JavaClass<'net.minecraftforge.event.entity.player.ItemTooltipEvent'>} evn */
export function clearTooltip(evn) {
  if (!helper) return;
  helper.clearTooltip(evn);
}

/**
 * @param {import('../../@types/External').JavaClass<'net.minecraftforge.event.entity.player.ItemTooltipEvent'>} evn
 * @param {string} str
 * */
export function addTooltip(evn, str) {
  if (!helper) return;
  helper.addTooltip(evn, str);
}

/**
 * @param {number} start
 * @param {number} end
 */
export function deleteChatIds(start, end) {
  if (!helper) return;
  unrun(() => helper.deleteChatIds(start, end));
}

/**
 * @param {number} target
 */
export function deleteChatId(target) {
  if (!helper) return;
  unrun(() => helper.deleteChatId(target));
}

/** @param {import('../../@types/External').JavaClass<'java.net.URLConnection'>} url */
export function removeCertCheck(url) {
  if (!helper) return;
  helper.removeCertCheck(url);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function removeLastElement(f, o) {
  if (!helper) return false;
  return helper.removeLastElement(f, o);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function removeElementSet(f, o, r) {
  if (!helper) return false;
  return helper.removeElementSet(f, o, r);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function removeElementMap(f, o, r) {
  if (!helper) return false;
  return helper.removeElementMap(f, o, r);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function addElementList(f, o, v) {
  if (!helper) return false;
  return helper.addElementList(f, o, v);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Method'>} m
 * @param {any} o
 * @param {any[]} args
 * @returns {string}
 */
export function base64Encode(m, o, args) {
  if (!helper) return '';
  return helper.base64Encode(m, o, args);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Method'>} m
 * @param {any} o
 * @param {any[]} args
 * @returns {string}
 */
export function base64EncodeInt(m, o, args) {
  if (!helper) return '';
  return helper.base64EncodeInt(m, o, args);
}