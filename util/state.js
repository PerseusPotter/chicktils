export class StateVar {
  constructor(val) {
    this.value = val;
    this.hooks = [];
  }
  get() {
    return this.value;
  }
  set(v) {
    if (this.value === v) return;
    this.value = v;
    this.trigger();
  }
  listen(cb) {
    this.hooks.push(cb);
  }
  trigger() {
    this.hooks.forEach(v => v());
  }
  /**
   * @param {import('../settings').Property} p
   */
  static wrapProp(p) {
    const s = new StateVar(p.valueOf());
    p.onAfterChange(v => s.set(v));
    return s;
  }
};

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
    EQUALSMULT: 9
  };
  constructor(val) {
    super();
    this.left = val.onAfterChange ? StateVar.wrapProp(val) : val instanceof StateVar ? val : new StateVar(val);
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
      case StateProp.Operator.IDENTITY: return this.left.get();
      case StateProp.Operator.NOT: return !this.left.get();
      case StateProp.Operator.AND: return this.left.get() && this.right.get();
      case StateProp.Operator.OR: return this.left.get() || this.right.get();
      case StateProp.Operator.EQUALS: return this.left.get() === this.tmp;
      case StateProp.Operator.NOTEQUALS: return this.left.get() !== this.tmp;
      case StateProp.Operator.EQUALSMULT: return this.tmp.includes(this.left.get());
    }
  }

  not() {
    this.op = StateProp.Operator.NOT;
    return this;
  }
  and(v) {
    const n = new StateProp(v);
    n.right = this;
    n.add(this);
    n.op = StateProp.Operator.AND;
    return n;
  }
  or(v) {
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
}
