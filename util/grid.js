export default class Grid {
  size = 0;
  key = 0;
  addNeighbors = 0;
  hm = new (Java.type('java.util.HashMap'))();
  arrs = [];
  oldHm;
  oldArrs;
  locked = false;
  _lock = new (Java.type('java.util.concurrent.locks.ReentrantLock'))();
  queue = [];
  constructor({ size = 1, key = 631, addNeighbors = 0 } = {}) {
    this.size = size;
    this.key = key;
    this.addNeighbors = addNeighbors;
  }

  _getId(x, z) {
    return (x >> this.size) * this.key + (z >> this.size);
  }
  _addWithId(id, item) {
    this._lock.lock();
    const key = this.hm.computeIfAbsent(id, k => {
      this.arrs.push([]);
      return this.arrs.length - 1;
    });
    this.arrs[key].push(item);
    this._lock.unlock();
  }
  _getById(id, tries = 1) {
    try {
      const i = (this.locked ? this.oldHm : this.hm)?.get(id);
      if (i === null || i === undefined) return [];
      return (this.locked ? this.oldArrs : this.arrs)[i];
    } catch (e) {
      if (tries === 0) throw e;
      return this._getById(id, tries - 1);
    }
  }

  add(x, z, item) {
    if (this._lock.isLocked()) {
      this.queue.push([x, z, item]);
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
  get(x, z) {
    return this._getById(this._getId(x, z));
  }
  clear() {
    if (this.locked) this.hm = new (Java.type('java.util.HashMap'))();
    else this.hm.clear();
    this.arrs = [];
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
    if (this.queue.length > 0) {
      this.queue.forEach(v => this.add(v[0], v[1], v[2]));
      this.queue = [];
    }
  }
}