import { Deque } from './polyfill';

/**
 * @template T
 */
export default class Grid {
  size = 0;
  key = 0;
  addNeighbors = 0;
  hm = new (Java.type('java.util.HashMap'))();
  /** @type {Deque<T>[]} */
  arrs = [];
  oldHm;
  oldArrs;
  locked = false;
  _lock = new (Java.type('java.util.concurrent.locks.ReentrantLock'))();
  queue = new (Java.type('java.util.concurrent.LinkedBlockingQueue'))();
  /** @type {Deque<number>} */
  age;
  constructor({ size = 1, key = 631, addNeighbors = 0, maxSize = Number.POSITIVE_INFINITY } = {}) {
    this.size = size;
    this.key = key;
    this.addNeighbors = addNeighbors;
    this.maxSize = maxSize;
    this.age = new Deque();
  }

  _getId(x, z) {
    return (x >> this.size) * this.key + (z >> this.size);
  }
  _addWithId(id, item) {
    this._lock.lock();
    const key = this.hm.computeIfAbsent(id, k => {
      this.arrs.push(new Deque());
      return this.arrs.length - 1;
    });
    this.arrs[key].push(item);
    this.age.push(key);
    if (this.age.length > this.maxSize * (1 + 4 * this.addNeighbors)) this.arrs[this.age.shift()].shift();
    this._lock.unlock();
  }
  _getById(id, tries = 1) {
    try {
      const i = (this.locked ? this.oldHm : this.hm)?.get(id);
      if (i === null || i === undefined) return new Deque();
      return (this.locked ? this.oldArrs : this.arrs)[i];
    } catch (e) {
      if (tries === 0) throw e;
      return this._getById(id, tries - 1);
    }
  }

  /**
   * @param {number} x
   * @param {number} z
   * @param {T} item
   */
  add(x, z, item) {
    if (this._lock.isLocked()) {
      this.queue.offer([x, z, item]);
      return;
    }
    const id = this._getId(x, z);
    this._addWithId(id, item);
    if (this.addNeighbors > 0) {
      this._addWithId(id - this.key + 0, item);
      this._addWithId(id - 1, item);
      this._addWithId(id + 1, item);
      this._addWithId(id + this.key + 0, item);
    }
    if (this.addNeighbors === 2) {
      this._addWithId(id - this.key - 1, item);
      this._addWithId(id - this.key + 1, item);
      this._addWithId(id + this.key - 1, item);
      this._addWithId(id + this.key + 1, item);
    }
  }
  /**
   * @param {number} x
   * @param {number} z
   * @returns {Deque<T>}
   */
  get(x, z) {
    return this._getById(this._getId(x, z));
  }
  clear() {
    this._lock.lock();
    if (this.locked) this.hm = new (Java.type('java.util.HashMap'))();
    else this.hm.clear();
    this.arrs = [];
    this.age = new Deque();
    this._lock.unlock();
    this.queue.clear();
  }
  freeze() {
    if (this.locked) return;
    this.oldHm = this.hm;
    this.oldArrs = this.arrs;
    this.locked = true;
  }
  unfreeze() {
    if (!this.locked) return;
    this.locked = false;
    this.oldHm = null;
    this.oldArrs = null;
  }
  lock() {
    this._lock.lock();
  }
  unlock() {
    this._lock.unlock();
    let c;
    while (c = this.queue.poll()) {
      this.add(c[0], c[1], c[2]);
    }
  }
}