import { log } from './log';

export default class Grid {
  size = 0;
  key = 0;
  addNeighbors = false;
  hm = new (Java.type('java.util.concurrent.ConcurrentHashMap'))();
  arrs = [];
  constructor({ size = 1, key = 631, addNeighbors = false } = {}) {
    this.size = size;
    this.key = key;
    this.addNeighbors = addNeighbors;
  }

  _getId(x, z) {
    return (x >> this.size) * this.key + (z >> this.size);
  }
  _addWithId(id, item) {
    const key = this.hm.computeIfAbsent(id, k => {
      this.arrs.push([]);
      return this.arrs.length - 1;
    });
    if (!this.arrs[key]) log(key, this.arrs.length);
    this.arrs[key].push(item);
  }
  _getById(id) {
    const i = this.hm.get(id);
    if (i === null) return null;
    return this.arrs[i];
  }

  add(x, z, item) {
    const id = this._getId(x, z);
    this._addWithId(id, item);
    if (this.addNeighbors) {
      this._addWithId(id - this.key - 1, item);
      this._addWithId(id - this.key + 0, item);
      this._addWithId(id - this.key + 1, item);
      this._addWithId(id - 1, item);
      this._addWithId(id + 1, item);
      this._addWithId(id + this.key - 1, item);
      this._addWithId(id + this.key + 0, item);
      this._addWithId(id + this.key + 1, item);
    }
  }
  get(x, z) {
    return this._getById(this._getId(x, z));
  }
  clear() {
    this.hm.clear();
    this.arrs = [];
  }
}