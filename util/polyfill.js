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