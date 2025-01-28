// https://github.com/isaacs/inherits/blob/main/inherits_browser.js
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  var _inherits = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  var _inherits = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function() { }
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}
export const inherits = _inherits;

/**
 * @template T
 * @typedef {{ [K in keyof T]: T[K] extends Array<infer E> ? E : T[K] }} Unarray
 */
/**
 * @template T
 * @param {T[]} arr
 * @returns {Unarray<T>[]}
 */
export function flat(arr) {
  return arr.reduce((a, v) => {
    if (Array.isArray(v)) Array.prototype.push.apply(a, v);
    else a.push(v);
    return a;
  }, []);
}

/**
 * @template T
 * @template U
 * @param {T[]} arr
 * @param {(value: T, index: number, array: T[]) => U} callback
 * @returns {Unarray<U>[]}
 */
export function flatMap(arr, callback) {
  return flat(arr.map(callback));
}

const JavaClass = Java.type('java.lang.Class');
/**
 * @template {string} T
 * @param {T} path
 * @returns {import('../../@types/External').JavaClass<T>?}
 */
export function JavaTypeOrNull(path) {
  const pkg = Java.type(path);
  return (pkg?.['class'] instanceof JavaClass) ? pkg : null;
}

/**
 * @template {import ('../../@types/External').JavaClass<'java.lang.reflect.AccessibleObject'>} T
 * @param {T} obj
 * @returns {T}
 */
export function setAccessible(obj) {
  obj.setAccessible(true);
  return obj;
}

/**
 * @template {any[]} T
 * @param {T} arr
 * @returns {T}
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i >= 1; i--) {
    let j = ~~(Math.random() * (i + 1));
    let t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}