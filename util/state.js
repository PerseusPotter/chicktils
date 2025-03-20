/**
 * @template T
 */
export class StateVar {
  /**
   * @param {T} val
   */
  constructor(val) {
    this.value = val;
    this.hooks = [];
  }
  /**
   * @returns {T}
   */
  get() {
    return this.value;
  }
  /**
   * @param {T} v
   */
  set(v) {
    if (this.value === v) return;
    const o = this.value;
    this.value = v;
    this.trigger(o);
  }
  /**
   * @param {(this: this, newValue: T, oldValue: T) => void} cb
   */
  listen(cb) {
    this.hooks.push(cb);
  }
  trigger(o) {
    this.hooks.forEach(v => v.call(this, this.value, o));
  }
  static coerce(v) {
    return v instanceof StateVar ? v : new StateVar(v);
  }
}

/**
 * @template {1|3|2|4|5|7|9|11|6} [O = 1]
 * @template L
 * @template R
 * @template [T = L]
 * @extends {StateVar<T>}
 */
export class StateProp extends StateVar {
  /** @type {StateVar<L>?} */
  left;
  /** @type {StateVar<R>?} */
  right;
  tmp;
  /** @type {O extends 5 ? L : O extends 7 ? L : O extends 9 ? any[] : O extends 11 ? (a: L) => boolean : O extends 6 ? (a: L, b: R) => boolean : null} */
  op;
  static Operator = {
    IDENTITY: 1,
    NOT: 3,
    AND: 2,
    OR: 4,
    EQUALS: 5,
    NOTEQUALS: 7,
    EQUALSMULT: 9,
    CUSTOMUNARY: 11,
    CUSTOMBINARY: 6
  };
  /**
   * @param {StateVar<L> | L} val
   */
  constructor(val) {
    super();
    this.left = val instanceof StateVar ? val : new StateVar(val);
    this._add(this.left);
    this.op = StateProp.Operator.IDENTITY;
    this.dirt = true;
  }
  _add(p) {
    p.listen(() => this._dirty().get());
  }
  _dirty() {
    this.dirt = true;
    return this;
  }
  get() {
    if (this.dirt) {
      this.dirt = false;
      this.set(this._evaluate());
    }
    return super.get();
  }
  _evaluate() {
    switch (this.op) {
      case StateProp.Operator.IDENTITY: return this.left.get();
      case StateProp.Operator.NOT: return !this.left.get();
      case StateProp.Operator.AND: return this.left.get() && this.right.get();
      case StateProp.Operator.OR: return this.left.get() || this.right.get();
      case StateProp.Operator.EQUALS: return this.left.get() === this.tmp;
      case StateProp.Operator.NOTEQUALS: return this.left.get() !== this.tmp;
      case StateProp.Operator.EQUALSMULT: return this.tmp.includes(this.left.get());
      case StateProp.Operator.CUSTOMUNARY: return this.tmp(this.left.get());
      case StateProp.Operator.CUSTOMBINARY: return this.tmp(this.left.get(), this.right.get());
      default: throw 'unknown operator: ' + this.op;
    }
  }

  /**
   * @returns {StateProp<3, O extends 1 ? L : T, R, boolean>}
   */
  not() {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).not();
    this.op = StateProp.Operator.NOT;
    return this;
  }
  /**
   * @template r
   * @param {StateVar<r> | r} v
   * @returns {StateProp<2, O extends 1 ? L : T, r, boolean>}
   */
  and(v) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).and(v);
    v = StateVar.coerce(v);
    this.right = v;
    this._add(v);
    this.op = StateProp.Operator.AND;
    return this;
  }
  /**
   * @template r
   * @param {StateVar<r> | r} v
   * @returns {StateProp<4, O extends 1 ? L : T, r, boolean>}
   */
  or(v) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).or(v);
    const n = new StateProp(v);
    this.right = v;
    this._add(v);
    this.op = StateProp.Operator.OR;
    return this;
  }
  /**
   * @param {O extends 1 ? L : T} t
   * @returns {StateProp<5, O extends 1 ? L : T, any, boolean>}
   */
  equals(t) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).equals();
    this.op = StateProp.Operator.EQUALS;
    this.tmp = t;
    return this;
  }
  /**
   * @param {O extends 1 ? L : T} t
   * @returns {StateProp<7, O extends 1 ? L : T, any, boolean>}
   */
  notequals(t) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).notequals();
    this.op = StateProp.Operator.NOTEQUALS;
    this.tmp = t;
    return this;
  }
  /**
   * @param {...any} t
   * @returns {StateProp<9, O extends 1 ? L : T, any, boolean>}
   */
  equalsmult(...t) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).equalsmult();
    this.op = StateProp.Operator.EQUALSMULT;
    this.tmp = t;
    return this;
  }
  /**
   * @template t
   * @param {(a: O extends 1 ? L : T) => t} cb
   * @returns {StateProp<11, O extends 1 ? L : T, any, t>}
   */
  customUnary(cb) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).customUnary(cb);
    this.op = StateProp.Operator.CUSTOMUNARY;
    this.tmp = cb;
    return this;
  }
  /**
   * @template r
   * @template t
   * @param {StateVar<r> | r} v
   * @param {(a: O extends 1 ? L : T, b: r) => t} cb
   * @returns {StateProp<6, O extends 1 ? L : T, r, t>}
   */
  customBinary(v, cb) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).customBinary(v, cb);
    v = StateVar.coerce(v);
    this.right = v;
    this._add(v);
    this.op = StateProp.Operator.CUSTOMBINARY;
    this.tmp = cb;
    return this;
  }
}