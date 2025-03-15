import { log } from './log';

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

/** @param {string[]} str */
export function deleteMessages(str) {
  if (!hasHelper) return;
  helper.deleteMessages(str);
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
  if (!hasHelper) return;
  return helper.removeLastElement(f, o);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function removeElementSet(f, o, r) {
  if (!hasHelper) return;
  return helper.removeElementSet(f, o, r);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function removeElementMap(f, o, r) {
  if (!hasHelper) return;
  return helper.removeElementMap(f, o, r);
}

/**
 * @param {import('../../@types/External').JavaClass<'java.lang.reflect.Field'>} f
 * @returns {boolean}
 **/
export function addElementList(f, o, v) {
  if (!hasHelper) return;
  return helper.addElementList(f, o, v);
}