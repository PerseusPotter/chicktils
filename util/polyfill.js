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

export class DSU {
  /**
   * @param {number} n
   */
  constructor(n) {
    this.parent = new Array(n).fill(0).map((_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  /**
   * @param {number} x
   * @returns {number}
   */
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  union(x, y) {
    let rootX = this.find(x);
    let rootY = this.find(y);

    if (rootX !== rootY) {
      if (this.rank[rootX] > this.rank[rootY]) this.parent[rootY] = rootX;
      else if (this.rank[rootX] < this.rank[rootY]) this.parent[rootX] = rootY;
      else {
        this.parent[rootY] = rootX;
        this.rank[rootX]++;
      }
    }
  }
}

/**
 * @template K
 * @template R
 * @param {Map<K, R>} m
 * @param {K} k
 * @param {() => R} d
 * @returns {R}
 */
export function getOrPut(m, k, d) {
  let v;
  return m.get(k) ?? (
    (v = d()),
    m.set(k, v),
    v
  );
}

/**
 * @template T
 */
class DQNode {
  /** @type {DQNode?} */
  l = null;
  /** @type {DQNode?} */
  r = null;
  /** @type {T} */
  v = null;

  constructor(v) {
    this.v = v;
  }

  remove() {
    if (this.l) this.l.r = this.r;
    if (this.r) this.r.l = this.l;
  }
  /**
   * @param {DQNode} node
   */
  insert(node) {
    if (this.r) this.r.l = node;
    node.l = this;
    node.r = this.r;
    this.r = node;
  }
}

/**
 * @template T
 */
export class Deque {
  /**
   * @private
   * @type {DQNode<T>?}
   */
  $head = null;
  /**
   * @private
   * @type {DQNode<T>?}
   */
  $tail = null;
  /** @private */
  $length = 0;

  /**
   * @param {T[]?} initial
   */
  constructor(initial) {
    this.$head = null;
    this.$tail = null;
    this.$length = 0;
    if (initial) {
      for (let i = 0; i < initial.length; i++) this.add(initial[i]);
    }
  }

  get length() {
    return this.$length;
  }
  set length(v) {
    if (!Number.isInteger(v)) return;
    v = Math.max(v, 0);

    if (v > this.$length) for (let i = v - this.$length; i > 0; i--) this.add(undefined);
    else for (let i = this.$length - v; i > 0; i--) this.pop();
  }

  clear() {
    this.$head = null;
    this.$tail = null;
    this.$length = 0;
  }

  /**
   * @private
   * @param {number} i
   * @returns {DQNode<T>?}
   */
  $get(i) {
    if (i < 0) i += this.$length;
    if (!Number.isInteger(i) || i < 0 || i >= this.$length) return undefined;

    if (i < this.$length >> 1) {
      let c = this.$head;
      while (--i >= 0) c = c.r;
      return c;
    }
    let c = this.$tail;
    while (++i < this.$length) c = c.l;
    return c;
  }

  /**
   * @private
   * @param {DQNode<T>} n
   * @returns {boolean}
   */
  $create(n) {
    if (this.$head) return false;
    this.$head = n;
    this.$tail = n;
    this.$length = 1;
    return true;
  }

  /**
   * @private
   * @param {DQNode<T>} n
   * @returns {DQNode<T>}
   */
  $remove(n) {
    n.remove();
    if (n === this.$head) this.$head = n.r;
    if (n === this.$tail) this.$tail = n.l;
    this.$length--;
    return n;
  }

  /**
   * @param {T} v
   */
  add(v) {
    const n = new DQNode(v);
    if (this.$create(n)) return;
    this.$tail.insert(n);
    this.$tail = n;
    this.$length++;
  }

  /**
   * @param {T} v
   */
  addFirst(v) {
    const n = new DQNode(v);
    if (this.$create(n)) return;
    this.$head.l = n;
    n.r = this.$head;
    this.$head = n;
    this.$length++;
  }

  /**
   * @param {T} v
   */
  addLast(v) {
    this.add(v);
  }

  /**
   * @param {T} v
   * @returns {boolean}
   */
  contains(v) {
    return this.includes(v);
  }

  /**
   * @returns {T?}
   */
  element() {
    return this.$head?.v;
  }

  /**
   * @returns {T?}
   */
  getFirst() {
    return this.element();
  }

  /**
   * @returns {T?}
   */
  getLast() {
    return this.$tail?.v;
  }

  /**
   * @param {T} v
   */
  offer(v) {
    this.add(v);
  }

  /**
   * @param {T} v
   */
  offerFirst(v) {
    this.addFirst(v);
  }

  /**
   * @param {T} v
   */
  offerLast(v) {
    this.addLast(v);
  }

  /**
   * @returns {T?}
   */
  peek() {
    return this.getFirst();
  }

  /**
   * @returns {T?}
   */
  peekFirst() {
    return this.getFirst();
  }

  /**
   * @returns {T?}
   */
  peekLast() {
    return this.getLast();
  }

  /**
   * @returns {T?}
   */
  poll() {
    return this.shift();
  }

  /**
   * @returns {T?}
   */
  pollFirst() {
    return this.shift();
  }

  /**
   * @returns {T?}
   */
  pollLast() {
    return this.pop();
  }

  /**
   * @overload
   * @returns {T?}
   *
   * @overload
   * @param {T} o
   * @returns {boolean}
   */
  remove(o) {
    if (arguments.length === 0) return this.shift();
    let c = this.$head;
    while (c) {
      if (c.v === o) {
        this.$remove(c);
        return true;
      }
      c = c.r;
    }
    return false;
  }

  /**
   * @returns {T?}
   */
  removeFirst() {
    if (!this.$head) return;
    return this.$remove(this.$head).v;
  }

  /**
   * @param {T} o
   * @returns {boolean}
   */
  removeFirstOccurrence(o) {
    return this.remove(o);
  }

  /**
   * @returns {T?}
   */
  removeLast() {
    if (!this.$tail) return;
    return this.$remove(this.$tail).v;
  }

  /**
   * @param {T} o
   * @returns {boolean}
   */
  removeLastOccurrence(o) {
    let c = this.$tail;
    while (c) {
      if (c.v === o) {
        this.$remove(c);
        return true;
      }
      c = c.l;
    }
    return false;
  }

  /**
   * @returns {number}
   */
  size() {
    return this.$length;
  }

  /**
   * @overload
   * @param {number} i
   * @returns {T?}
   *
   * @template {T} V
   * @overload
   * @param {number} i
   * @param {V} v
   * @returns {V}
   */
  at(i, v) {
    if (arguments.length <= 1) return this.$get(i ?? 0)?.v;
    this.$get(i).v = v;
    return v;
  }

  /**
   * DOES NOT RETURN A CLONE
   * @template K
   * @param {K[] | Deque<K>} arr
   * @returns {Deque<K | T>}
   */
  concat(arr) {
    if (arr instanceof Deque) {
      if (this.$tail) {
        this.$tail.r = arr.$head;
        arr.$head.l = this.$tail;
        this.$tail = arr.$tail;
      } else {
        this.$head = arr.$head;
        this.$tail = arr.$tail;
      }
      this.$length += arr.$length;
    } else for (let i = 0; i < arr.length; i++) this.add(arr[i]);
    return this;
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {boolean}
   */
  every(func, that = this) {
    let c = this.$head;
    let i = 0;
    while (c) {
      if (!func.call(that, c.v, i, this)) return false;
      c = c.r;
      i++;
    }
    return true;
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {Deque<T>}
   */
  filter(func, that = this) {
    const dq = new Deque();
    let c = this.$head;
    let i = 0;
    while (c) {
      if (func.call(that, c.v, i, this)) dq.add(c.v);
      c = c.r;
      i++;
    }
    return dq;
  }

  /**
   * @private
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {{ node: DQNode<T>, index: number }?}
   */
  _internalFind(func, that) {
    let c = this.$head;
    let i = 0;
    while (c) {
      if (func.call(that, c.v, i, this)) return { node: c, index: i };
      c = c.r;
      i++;
    }
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {T?}
   */
  find(func, that = this) {
    return this._internalFind(func, that)?.node;
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {number}
   */
  findIndex(func, that = this) {
    return this._internalFind(func, that)?.index ?? -1;
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {T?}
   */
  findLast(func, that = this) {
    let c = this.$tail;
    let i = this.$length - 1;
    while (c) {
      if (func.call(that, c.v, i, this)) return c.v;
      c = c.l;
      i--;
    }
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {number}
   */
  findLastIndex(func, that = this) {
    let c = this.$tail;
    let i = this.$length - 1;
    while (c) {
      if (func.call(that, c.v, i, this)) return i;
      c = c.l;
      i--;
    }
    return -1;
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => void} func
   */
  forEach(func, that = this) {
    let c = this.$head;
    let i = 0;
    while (c) {
      func.call(that, c.v, i, this);
      c = c.r;
      i++;
    }
  }

  /**
   * @param {T} v
   * @param {number?} i
   * @returns {boolean}
   */
  includes(v, i = 0) {
    return this.findIndex((_v, _i) => _v === v && _i >= i) >= 0;
  }

  /**
   * @param {T} v
   * @param {number?} i
   * @returns {number}
   */
  indexOf(v, i = 0) {
    return this.findIndex((_v, _i) => _v === v && _i >= i);
  }

  /**
   * @param {T} v
   * @param {number?} i
   * @returns {number}
   */
  lastIndexOf(v, i = 0) {
    return this.findLastIndex((_v, _i) => _v === v && _i >= i);
  }

  /**
   * @param {string?} sep
   * @returns {string}
   */
  join(sep) {
    let sb = new java.lang.StringBuilder();
    let b = false;
    this.forEach(v => {
      if (b) sb.append(sep);
      sb.append(v.toString());
      b = true;
    });
    return sb.toString();
  }

  /**
   * @template R
   * @param {(v: T, i: number, a: Deque<T>) => R} func
   * @returns {Deque<R>}
   */
  map(func, that = this) {
    const dq = new Deque();
    let c = this.$head;
    let i = 0;
    while (c) {
      dq.add(func.call(that, c.v, i, this));
      c = c.r;
      i++;
    }
    return dq;
  }

  /**
   * @template R
   * @param {(v: T, i: number, a: Deque<T>) => R} func
   * @returns {Deque<R>}
   */
  mapFilter(func, that = this) {
    const dq = new Deque();
    let c = this.$head;
    let i = 0;
    while (c) {
      v = func.call(that, c.v, i, this);
      if (v) dq.add(v);
      c = c.r;
      i++;
    }
    return dq;
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {boolean}
   */
  some(func, that = this) {
    let c = this.$head;
    let i = 0;
    while (c) {
      if (func.call(that, c.v, i, this)) return true;
      c = c.r;
      i++;
    }
    return false;
  }

  /**
   * @template [U=T]
   * @param {(a: U, v: T, i: number, a: Deque<T>) => U} func
   * @param {U} [initial]
   * @returns {U}
   */
  reduce(func, initial) {
    let v = initial;
    let c = this.$head;
    let i = 0;
    if (arguments.length === 1) {
      v = c.v;
      c = c.r;
      i++;
    }
    while (c) {
      if (v === undefined && i === 0) v = c.v;
      else v = func.call(this, v, c.v, i, this);
      c = c.r;
      i++;
    }
    return v;
  }

  /**
   * @template [U=T]
   * @param {(a: U, v: T, i: number, a: Deque<T>) => U} func
   * @param {U} [initial]
   * @returns {U}
   */
  reduceRight(func, initial) {
    let v = initial;
    let c = this.$tail;
    let i = this.$length - 1;
    if (arguments.length === 1) {
      v = c.v;
      c = c.l;
      i--;
    }
    while (c) {
      if (v === undefined && i === this.$length - 1) v = c.v;
      else v = func.call(this, v, c.v, i, this);
      c = c.l;
      i--;
    }
    return v;
  }

  reverse() {
    let p;
    let c = this.$head;
    this.$tail = this.$head;
    while (c) {
      this.$head = c;
      c.l = c.r;
      c.r = p;
      p = c;
      c = c.l;
    }
    return this;
  }

  /**
   * @returns {T?}
   */
  pop() {
    return this.removeLast();
  }

  /**
   * @param {...T} elems
   * @returns {number}
   */
  push(...elems) {
    for (let i = 0; i < elems.length; i++) this.add(elems[i]);
    return this.$length;
  }

  /**
   * @returns {T?}
   */
  shift() {
    return this.removeFirst();
  }

  /**
   * @param {...T} elems
   * @returns {number}
   */
  unshift(...elems) {
    for (let i = elems.length - 1; i >= 0; i--) this.addFirst(elems[i]);
    return this.$length;
  }

  /**
   * @param {number} i
   * @param {number} n
   * @param  {...T} a
   * @returns {T[]}
   */
  splice(i, n, ...a) {
    const p = this.$get(i);
    if (!p) return [];
    const r = [];
    let c = p;
    while (c && --n >= 0) {
      r.push(c.v);
      this.$remove(c);
      c = c.r;
    }
    if (i === 0) this.unshift.apply(this, a);
    else {
      let n;
      for (let i = a.length - 1; i >= 0; i--) p.l.insert(n = new DQNode(v));
      this.$length += a.length;
      if (p.l === this.$tail) this.$tail = n;
    }
    return r;
  }

  /**
   * @param {number?} s
   * @param {number?} e
   * @returns {Deque<T>}
   */
  slice(s = 0, e = this.$length) {
    if (s < 0) s += this.$length;
    if (!Number.isInteger(s) || s < 0) s = 0;
    if (s >= this.$length) return new Deque();
    if (e < 0) e += this.$length;
    if (!Number.isInteger(e) || e < 0) e = this.$length;

    const dq = new Deque();

    if (s <= this.$length - e) {
      let c = this.$get(s);
      let i = s;
      while (c) {
        dq.add(c.v);
        c = c.r;
        i++;
        if (i >= e) break;
      }
    } else {
      let c = this.$get(e - 1);
      let i = e - 1;
      while (c) {
        dq.addFirst(c.v);
        c = c.l;
        i--;
        if (i < s) break;
      }
    }

    return dq;
  }

  /**
   * @returns {T[]}
   */
  toArray() {
    return this.reduce((a, v) => (a.push(v), a), []);
  }

  /**
   * @returns {Iterable<T>}
   */
  values() {
    let f = false;
    let c = this.$head;
    return {
      next() {
        const v = c?.v;
        c = c?.r;
        f |= !c;
        return {
          value: v,
          done: f
        };
      },
      return() {
        c = undefined;
        f = true;
      },
      throw() {
        c = undefined;
        f = true;
      }
    };
  }

  /**
   * @template T
   * @typedef Iterator
   * @property {() => T} value
   * @property {() => number} index
   * @property {(v: T) => void} set
   * @property {() => boolean} done
   * @property {() => Iterator<T>} next
   * @property {() => Iterator<T>} prev
   * @property {() => void} remove
   */

  /**
   * @private
   * @param {DQNode<T>} c
   * @param {number} i
   * @returns {Iterator<T>}
   */
  _interalIter(c, i) {
    const that = this;
    const o = {
      value() { return c.v; },
      index() { return i; },
      set(v) { c.v = v; },
      done() { return !c; },
      next() {
        c = c.r;
        i++;
        return o;
      },
      prev() {
        c = c.l;
        i--;
        return o;
      },
      remove() {
        that.$remove(c);
      }
    };
    return o;
  }

  /**
   * @param {number?} i
   * @returns {Iterator<T>}
   */
  iter(i = 0) {
    return this._interalIter(this.$get(i), i);
  }

  /**
   * @param {(v: T, i: number, a: Deque<T>) => boolean} func
   * @returns {Iterator<T>}
   */
  iterFind(func, that = this) {
    const pos = this._internalFind(func, that);
    if (pos) return this._interalIter(pos.node, pos.index);
    return this._interalIter(null, this.length);
  }

  [Symbol.iterator]() {
    return this.values();
  }
}

/**
 * @template T
 * @param {T[]} arr
 * @returns ArrayList<T>
 */
export function toArrayList(arr) {
  const list = new ArrayList();
  arr.forEach(v => list.add(v));
  return list;
}

/**
 * @template E
 */
export class HeapSet {
  /** @param {(a: E, b: E) => number} compFunc */
  constructor(compFunc) {
    /** @type {(a: E, b: E) => number} */
    this.compFunc = compFunc;
    /** @type {E[]} */
    this.arr = [];
    /** @type {Map<E, number>} */
    this.locs = new Map();
  }

  /** @returns {E | undefined} */
  root() {
    return this.arr[0];
  }

  size() {
    return this.arr.length;
  }

  clear() {
    this.arr = [];
    this.locs.clear();
  }

  /**
   * @private
   * @param {number} pI
   * @param {number} cI
   * @returns {boolean}
   */
  _shouldSwap(pI, cI) {
    if (pI < 0 || pI >= this.arr.length) return false;
    if (cI < 0 || cI >= this.arr.length) return false;

    return this.compFunc(this.arr[pI], this.arr[cI]) > 0;
  }

  /**
   * @private
   * @param {number} i
   * @param {number} j
   */
  _swap(i, j) {
    const tmp = this.arr[i];
    this.arr[i] = this.arr[j];
    this.arr[j] = tmp;
  }

  /**
   * @private
   * @param {number} pI
   * @returns {number}
   */
  _getChild(pI) {
    const lcI = (pI << 1) + 1;
    const rcI = (pI << 1) + 2;

    if (lcI >= this.arr.length) return -1;
    if (rcI >= this.arr.length) return lcI;

    return this.compFunc(this.arr[lcI], this.arr[rcI]) > 0 ? rcI : lcI;
  }

  /**
   * @private
   * @param {number} i
   */
  _bubbleUp(i) {
    const v = this.arr[i];

    let cI = i;
    let pI = (cI - 1) >> 1;

    while (this._shouldSwap(pI, cI)) {
      this._swap(pI, cI);
      this.locs.set(this.arr[cI], cI);
      cI = pI;
      pI = (cI - 1) >> 1;
    }

    this.locs.set(v, cI);
  }

  /**
   * @private
   * @param {number} i
   */
  _siftDown(i) {
    const v = this.arr[i];

    let pI = i;
    let cI = this._getChild(pI);

    while (this._shouldSwap(pI, cI)) {
      this._swap(pI, cI);
      this.locs.set(this.arr[pI], pI);
      pI = cI;
      cI = this._getChild(pI);
    }

    this.locs.set(v, pI);
  }

  /** @param {E} value */
  push(value) {
    this.arr.push(value);
    this._bubbleUp(this.arr.length - 1);
  }

  /** @returns {E | undefined} */
  pop() {
    if (this.arr.length === 0) return;

    const root = this.arr[0];
    this.locs.delete(root);
    this.arr[0] = this.arr[this.arr.length - 1];
    this.arr.pop();
    this._siftDown(0);

    return root;
  }

  /**
   * @param {E} e
   * @returns {boolean}
   */
  contains(e) {
    return this.locs.has(e);
  }

  /**
   * @param {E} e
   * @returns {boolean}
   */
  remove(e) {
    const i = this.locs.get(e);
    if (i === undefined) return false;

    this.locs.delete(e);
    this.arr[i] = this.arr[this.arr.length - 1];
    this.arr.pop();

    const pI = (i - 1) >> 1;
    if (pI >= 0) {
      if (this.compFunc(this.arr[pI], e) > 0) this._bubbleUp(i);
      else this._siftDown(i);
    }

    return true;
  }
}