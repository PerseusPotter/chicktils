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
}

export class StateProp extends StateVar {
  left;
  right;
  tmp;
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
  constructor(val) {
    super();
    this.left = val instanceof StateVar ? val : new StateVar(val);
    this.add(this.left);
    this.op = StateProp.Operator.IDENTITY;
    this.dirt = true;
  }
  add(p) {
    p.listen(() => this.dirty().get());
  }
  dirty() {
    this.dirt = true;
    return this;
  }
  get() {
    if (this.dirt) {
      this.dirt = false;
      this.set(this.evaluate());
    }
    return super.get();
  }
  evaluate() {
    switch (this.op) {
      case StateProp.Operator.IDENTITY: return Boolean(this.left.get());
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
   * @returns {this}
   */
  not() {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).not();
    this.op = StateProp.Operator.NOT;
    return this;
  }
  /**
   * @returns {this}
   */
  and(v) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).and(v);
    const n = new StateProp(v);
    n.right = this;
    n.add(this);
    n.op = StateProp.Operator.AND;
    return n;
  }
  /**
   * @returns {this}
   */
  or(v) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).or(v);
    const n = new StateProp(v);
    n.right = this;
    n.add(this);
    n.op = StateProp.Operator.OR;
    return n;
  }

  equals(t) {
    this.op = StateProp.Operator.EQUALS;
    this.tmp = t;
    return this;
  }
  notequals(t) {
    this.op = StateProp.Operator.NOTEQUALS;
    this.tmp = t;
    return this;
  }
  equalsmult(...t) {
    this.op = StateProp.Operator.EQUALSMULT;
    this.tmp = t;
    return this;
  }

  customUnary(cb) {
    this.op = StateProp.Operator.CUSTOMUNARY;
    this.tmp = cb;
    return this;
  }
  /**
   * @returns {this}
   */
  customBinary(v, cb) {
    if (this.op !== StateProp.Operator.IDENTITY) return new StateProp(this).customBinary(v, cb);
    const n = new StateProp(v);
    n.right = this;
    n.add(this);
    n.op = StateProp.Operator.CUSTOMBINARY;
    n.tmp = cb;
    return n;
  }
}
