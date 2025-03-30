import { shuffle } from './polyfill';

/**
 * @param {number} dx
 * @param {number} dy
 * @param {number} dz
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} nx
 * @param {number} ny
 * @param {number} nz
 * @param {number} px
 * @param {number} py
 * @param {number} pz
 * @returns {{ x: number, y: number, z: number }}
 */
export function intersectPL(dx, dy, dz, x, y, z, nx, ny, nz, px, py, pz) {
  const a = dx * nx + dy * ny + dz * nz;
  const b = (px - x) * nx + (py - y) * ny + (pz - z) * nz;
  if (a === 0) {
    if (b === 0) return { x, y, z };
    return { x: NaN, y: NaN, z: NaN };
  }
  const d = b / a;
  return { x: x + dx * d, y: y + dy * d, z: z + dz * d };
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @param {number} x3
 * @param {number} y3
 * @param {number} z3
 * @returns {{ x: number, y: number, z: number }}
 */
export function getNormal(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
  const x4 = x1 - x2;
  const y4 = y1 - y2;
  const z4 = z1 - z2;
  const x5 = x1 - x3;
  const y5 = y1 - y3;
  const z5 = z1 - z3;
  return { x: y4 * z5 - z4 * y5, y: z4 * x5 - x4 * z5, z: x4 * y5 - y4 * x5 };
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @param {boolean?} smallest
 * @returns {number} radians
 */
export function getAngle(x1, y1, z1, x2, y2, z2, smallest = true) {
  const dp = x1 * x2 + y1 * y2 + z1 * z2;
  const a = Math.acos(dp / (Math.hypot(x1, y1, z1) * Math.hypot(x2, y2, z2)));
  if (!smallest) return a;
  if (dp >= 0) return a;
  return Math.PI - a;
}

/**
 * @param {number} n1
 * @param {number} n2
 */
export function dist(n1, n2) {
  return n1 < n2 ? n2 - n1 : n1 - n2;
}

/**
 * in degrees
 * @param {number} a1
 * @param {number} a2
 * @returns {number}
 */
export function distAngle(a1, a2) {
  const d = dist(a1, a2);
  return Math.min(d, 360 - d);
}

/**
 * @param {number} f1
 * @param {number} f2
 * @param {number?} e
 * @returns {number}
 */
export function compareFloat(f1, f2, e = 1e-6) {
  const d = f1 - f2;
  if (Math.abs(d) < e) return 0;
  return Math.sign(d);
}

/**
 * @param {number} n
 * @param {number} oldMin
 * @param {number} oldMax
 * @param {number} newMin
 * @param {number} newMax
 * @returns {number}
 */
export function rescale(n, oldMin, oldMax, newMin, newMax) {
  return (n - oldMin) / (oldMax - oldMin) * (newMax - newMin) + newMin;
}

/**
 * @param {number} oldValue
 * @param {number} newValue
 * @param {number} mult
 * @returns {number}
 */
export function lerp(oldValue, newValue, mult) {
  return oldValue + (newValue - oldValue) * mult;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} t
 * @param {number} p
 * @param {number} r
 * @returns {{ x: number, y: number, z: number }}
 */
export function rotate(x, y, z, t, p, r) {
  const ct = Math.cos(t);
  const st = Math.sin(t);
  const cp = Math.cos(p);
  const sp = Math.sin(p);
  const cr = Math.cos(r);
  const sr = Math.sin(r);
  return {
    x:
      x * ct * cp +
      z * (ct * sp * sr - st * cr) +
      y * (ct * sp * cr + st * sr),
    z:
      x * st * cp +
      z * (st * sp * sr + ct * cr) +
      y * (st * sp * cr - ct * sr),
    y:
      x * -sp +
      z * cp * sr +
      y * cp * cr
  };
}

/**
 *
 * @param {{ x: number, y: number, z: number }} pos1
 * @param {{ x: number, y: number, z: number }} pos2
 * @returns {{ x: number, y: number, z: number }}
 */
export function cross(pos1, pos2) {
  return {
    x: pos1.y * pos2.z - pos1.z * pos2.y,
    y: pos1.z * pos2.x - pos1.x * pos2.z,
    z: pos1.x * pos2.y - pos1.y * pos2.x
  };
}

// why is rhino so shit
// normalize({ x, y, z }, newLength = 1)
// normalize({ ... });
// newLength = [object Object]
/**
 * @param {{ x: number, y: number, z: number }} pos
 * @param {number?} newLength (1)
 * @returns {{ x: number, y: number, z: number }}
 */
export function normalize(pos, newLength = 1) {
  const { x, y, z } = pos;
  const d = newLength / (Math.hypot(x, y, z) || 1);
  return { x: x * d, y: y * d, z: z * d };
}

/**
 * @param {{ x: number, y: number, z: number }} pos
 * @returns {[number, number, number]}
 */
export function toArray(pos) {
  return [pos.x, pos.y, pos.z];
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} rx
 * @param {number} ry
 * @param {number} rw
 * @param {number} rh
 * @returns {boolean}
 */
export function lineRectColl(x1, y1, x2, y2, rx, ry, rw, rh) {
  return lineLineColl(x1, y1, x2, y2, rx, ry, rx, ry + rh) ||
    lineLineColl(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
    lineLineColl(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
    lineLineColl(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} x3
 * @param {number} y3
 * @param {number} x4
 * @param {number} y4
 * @returns {boolean}
 */
export function lineLineColl(x1, y1, x2, y2, x3, y3, x4, y4) {
  const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}

/**
 * @param {number[][]} arr
 * @returns {{ r: number, b: number, a: number }}
 */
export function linReg(arr) {
  const xMean = arr.reduce((a, v) => a + v[0], 0) / arr.length;
  const yMean = arr.reduce((a, v) => a + v[1], 0) / arr.length;
  const xStd = Math.sqrt(arr.reduce((a, v) => a + (v[0] - xMean) ** 2, 0)); // should be / (n - 1)
  const yStd = Math.sqrt(arr.reduce((a, v) => a + (v[1] - yMean) ** 2, 0)); // should be / (n - 1)
  const r = arr.reduce((a, v) => a + (v[0] - xMean) * (v[1] - yMean), 0) / (xStd * yStd);
  if (Number.isNaN(r)) return { r: 0, b: 0, a: 0 };
  const b = r * yStd / xStd;
  const a = yMean - b * xMean;
  return { r, b, a };
}

/**
 * @param {number} d
 * @param {number[][]} arr
 * @returns {number[]} coeff, [0] = x_0
 */
export function ndRegression(d, arr) {
  const X = arr.map(v => new Array(d + 1).fill(0).map((_, i) => v[0] ** i));
  const Y = arr.map(v => [v[1]]);

  const X_T = transposeMatrix(X);
  const X_T_X = multMatrix(X_T, X);
  const X_T_Y = multMatrix(X_T, Y);
  return solveMatrix(X_T_X, X_T_Y).map(v => v[0]);
}

/**
 * @param {number[]} arr
 * @returns {number}
 */
export function calcMedian(arr) {
  arr.sort((a, b) => a - b);
  return (arr[(arr.length - 1) >> 1] + arr[arr.length >> 1]) / 2;
}

/**
 *
 * @param {number} dx
 * @param {number} dy
 * @returns {number}
 * @link https://www.flipcode.com/archives/Fast_Approximate_Distance_Functions.shtml
 */
export function fastDistance(dx, dy) {
  if (dx < 0) dx = -dx;
  if (dy < 0) dy = -dy;

  let min, max;
  if (dx < dy) {
    min = dx;
    max = dy;
  } else {
    min = dy;
    max = dx;
  }

  let approx = (max * 1007) + (min * 441);
  if (max < (min << 4)) approx -= (max * 40);

  return ((approx + 512) >> 10);
}

/**
 * index of highest number <= val
 * @param {number[]} arr sorted ascending
 * @param {number} val
 * @returns {number} [-1, arr.length)
 */
export function binarySearch(arr, val) {
  let l = 0;
  let r = arr.length;
  let m = 0;
  while (l < r) {
    m = (l + r) >> 1;
    if (arr[m] <= val) l = m + 1;
    else r = m;
  }
  return l - 1;
}

/**
 * @param {number} num
 * @param {number?} bits (0)
 * @returns {number}
 */
export function ceilPow2(num, bits = 0) {
  const mask = (1 << Math.max(0, 31 - Math.clz32(num) - bits)) - 1;
  return (num + mask) & ~mask;
}

/**
 * @param {number[]} coeff [0] = x_0
 * @returns {(x: number) => number}
 */
export function toPolynomial(coeff) {
  return x => {
    let v = 0;
    let m = 1;
    for (let i = 0; i < coeff.length; i++) {
      v += coeff[i] * m;
      m *= x;
    }
    return v;
  };
}

/**
 * @param {number} x
 * @param {number} mean
 * @param {number} variance
 * @returns {number}
 */
export function pdf(x, mean = 0, variance = 1) {
  return Math.exp(-0.5 * ((x - mean) ** 2) / (variance * variance)) / (variance * Math.sqrt(2 * Math.PI));
}

// https://stackoverflow.com/a/14873282
/**
 * @param {number} x
 * @param {number} mean
 * @param {number} variance
 * @returns {number}
 */
export function cdf(x, mean = 0, variance = 1) {
  return 0.5 * (1 + erf((x - mean) / (Math.sqrt(2 * variance))));
}

/**
 * @param {number} x
 * @returns {number}
 */
export function erf(x) {
  // save the sign of x
  const sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y; // erf(-x) = -erf(x);
}

/**
 * @param {number[]} arr
 * @returns {number}
 */
export function calcMAD(arr) {
  const mean = arr.reduce((a, v) => a + v, 0) / arr.length;
  return arr.reduce((a, v) => a + Math.abs(v - mean), 0) / arr.length;
}

/**
 * A x X = B
 * @template {number[][]} T
 * @param {number[][]} A n x n
 * @param {T} B n x k
 * @returns {T & { determinantM: number, determinantI: number }} X (n x k)
 */
export function solveMatrix(A, B) {
  const n = A.length;
  const k = B[0].length;
  let d = 1;
  const swapRow = (r1, r2) => {
    d *= -1;
    let t = A[r1];
    A[r1] = A[r2];
    A[r2] = t;
    t = B[r1];
    B[r1] = B[r2];
    B[r2] = t;
  };
  const addRow = (s, d, m) => {
    for (let i = 0; i < n; i++) {
      A[d][i] += A[s][i] * m;
    }
    for (let i = 0; i < k; i++) {
      B[d][i] += B[s][i] * m;
    }
  };
  const multRow = (s, m) => {
    d *= m;
    for (let i = 0; i < n; i++) {
      A[s][i] *= m;
    }
    for (let i = 0; i < k; i++) {
      B[s][i] *= m;
    }
  };
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (A[maxRow][i] < A[j][i]) maxRow = j;
    }
    if (maxRow !== i) swapRow(maxRow, i);
    multRow(i, 1 / A[i][i]);
    for (let j = 0; j < n; j++) {
      if (i !== j) addRow(i, j, -A[j][i]);
    }
  }

  B.determinantM = 1 / d;
  B.determinantI = d;
  return B;
}

/**
 * disclaimer: bad
 * @template {number[][]} T
 * @param {T} M n x n
 * @returns {ReturnType<typeof solveMatrix<T>>} n x n
 */
export function invertMatrix(M) {
  const l = M.length;
  const I = new Array(l).fill(0).map((_, i) => {
    const a = new Array(l).fill(0);
    a[i] = 1;
    return a;
  });

  return solveMatrix(M, I);
}

/**
 * @param {number[][]} M
 * @returns {number[][]}
 */
export function transposeMatrix(M) {
  const R = [];
  for (let i = 0; i < M.length; i++) {
    for (let j = 0; j < M[i].length; j++) {
      R[j] ??= [];
      R[j][i] = M[i][j];
    }
  }
  return R;
}

/**
 * @param {number[][]} A
 * @param {number[][]} B
 * @returns {number[][]}
 */
export function multMatrix(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) throw `${rowsA}x${colsA} vs ${rowsB}x${colsB}`;

  const result = new Array(rowsA).fill(0).map(() => new Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

/**
 * @param {number} n
 * @param {number[][]} bounds c x 2
 * @returns {number[][]} n x c
 */
export function sampleLHS(n, bounds) {
  const samples = bounds.map(([min, max]) => {
    const interval = (max - min) / n;
    const values = [];
    for (let i = 0; i < n; i++) values.push(min + interval * (i + Math.random()));
    return shuffle(values);
  });

  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(samples.map(v => v[i]));
  }

  return result;
}

/**
 * @template {number[]} T
 * @param {(params: T) => number} func
 * @param {T} params
 * @param {number} epsilon
 * @returns {T}
 */
export function computeGradient(func, params, epsilon) {
  const init = func(params);
  return params.map((_, i) => {
    params[i] += epsilon;
    const g = (func(params) - init) / epsilon;
    params[i] -= epsilon;
    return g;
  });
}

/**
 * @template {number[]} T
 * @param {(params: T) => number} func
 * @param {T} params
 * @param {number[][]} bounds [min, max][]
 * @param {number?} iter (100)
 * @param {number?} epsilon (1e-5)
 * @returns {T}
 */
export function gradientDescent(func, params, bounds, iter = 100, epsilon = 1e-5) {
  for (let c = 1; c <= iter; c++) {
    computeGradient(func, params, epsilon).forEach((v, i) => params[i] = Math.max(bounds[i][0], Math.min(bounds[i][1], params[i] + v / c)));
  }
  return params;
}

/**
 * @template {number[]} T
 * @param {(params: T) => number} func
 * @param {number[][]} bounds [min, max][]
 * @param {number?} restarts (10)
 * @param {number?} iter (100)
 * @param {number?} epsilon (1e-5)
 * @returns {T}
 */
export function gradientDescentRestarts(func, bounds, restarts = 10, iter = 100, epsilon = 1e-5) {
  let maxV = Number.NEGATIVE_INFINITY;
  let maxA = [];
  const spreadParams = sampleLHS(restarts, bounds);
  for (let i = 0; i < restarts; i++) {
    let p = spreadParams[i];
    gradientDescent(func, p, bounds, iter, epsilon);
    let v = func(p);
    if (v > maxV) {
      maxV = v;
      maxA = p;
    }
  }
  return maxA;
}

/**
 * @param {number} d
 * @param {number} l
 * @param {number} a
 * @returns {number}
 */
export function rbfKernel(d, l, a) {
  return a * Math.exp(-0.5 * d / l);
}

/**
 * @template {number[]} T
 */
export class GaussianProcess {
  /**
   * @param {[number, number]} lengthScaleOptions [min, max]
   * @param {[number, number]} amplitudeOptions [min, max]
   * @param {number} noiseVariance
   */
  constructor(lengthScaleOptions, amplitudeOptions, noiseVariance) {
    /** @type {[number, number]} */
    this.lengthScaleOptions = lengthScaleOptions;
    /** @type {[number, number]} */
    this.amplitudeOptions = amplitudeOptions;
    /** @type {number} */
    this.noiseVariance = noiseVariance;
  }

  _computePartialK(X1, X2) {
    const K = [];

    for (let i = 0; i < X1.length; i++) {
      K[i] = [];
      for (let j = 0; j < X2.length; j++) {
        K[i][j] = X1[i].reduce((a, v, i) => a + (v - X2[j][i]) ** 2, 0);
      }
    }

    return K;
  }

  /**
   * @param {number[][]} KP
   * @param {number} l
   * @param {number} a
   * @param {number} sY
   * @returns {number[][]}
   */
  _computeK(KP, l, a, sY) {
    return KP.map((r, i) => r.map((v, j) => rbfKernel(v, l, a) + (i === j ? sY : 0)));
  }

  /**
   * @param {number[][]} KP
   * @param {T[]} X
   * @param {number[]} y
   * @param {number} l
   * @param {number} a
   * @returns {number}
   */
  _computeNLML(KP, X, y, l, a) {
    const K = this._computeK(KP, l, a, this.noiseVariance);
    const M = solveMatrix(K, y.map(v => [v]));

    return -0.5 * (
      y.reduce((a, v, i) => a + v * M[i][0], 0) +
      Math.log(M.determinantM) +
      X.length * Math.log(2 * Math.PI)
    );
  }

  /**
   * @param {T[]} X
   * @param {number[]} y
   */
  fit(X, y) {
    const KP = this._computePartialK(X, X);
    const params = gradientDescentRestarts(
      ([l, a]) => this._computeNLML(KP, X, y, l, a),
      [this.lengthScaleOptions, this.amplitudeOptions]
    );
    this.lengthScale = params[0];
    this.amplitude = params[1];

    this.XTrain = X;
    this.yTrain = y;
    const K = this._computeK(KP, this.lengthScale, this.amplitude, this.noiseVariance);
    this.Kinv = invertMatrix(K);
  }

  /**
   * @param {T[]} X
   * @param {boolean?} includeCov {true}
   * @returns {{ mu: number[], cov?: number[] }}
   */
  predict(X, includeCov = true) {
    const KsT = this._computeK(this._computePartialK(X, this.XTrain), this.lengthScale, this.amplitude, 0);
    const mu = multMatrix(multMatrix(KsT, this.Kinv), this.yTrain.map(v => [v])).map(v => v[0]);
    if (!includeCov) return { mu };
    const Ks = transposeMatrix(KsT);
    const Kss = this._computeK(this._computePartialK(X, X), this.lengthScale, this.amplitude, 1e-8);
    const M = multMatrix(multMatrix(KsT, this.Kinv), Ks);
    // covariance matrix
    // const cov = Kss.map((v, i) => v.map((v, j) => v - M[i][j]));
    return {
      mu: mu,
      // std dev
      cov: Kss.map((v, i) => Math.sqrt(v[i] - M[i][i]))
    };
  }
}

/**
 * @template {number[]} T
 */
export class BayesianOptimizer {
  /**
   * @param {(params: T) => number} func
   * @param {GaussianProcess<T>} gp
   * @param {number} xi
   */
  constructor(func, gp, xi) {
    /** @type {(params: T) => number} */
    this.func = func;
    /** @type {GaussianProcess<T>} */
    this.gp = gp;
    /** @type {number} */
    this.xi = xi;
    /** @type {T[]} */
    this.X = [];
    /** @type {number[]} */
    this.y = [];
    /** @type {T} */
    this.maxX = [];
    /** @type {number} */
    this.maxY = Number.NEGATIVE_INFINITY;
    this._y1;
    this._y2;
  }

  _rescale(v) {
    return rescale(v, this._y1, this._y2, -2, 2);
  }

  _normFunc() {
    return this._rescale(this.func.apply(null, arguments));
  }

  /**
   * @param {T} x
   */
  addPoint(x) {
    this.X.push(x);
    const v = this.func(x);
    if (v > this.maxY) {
      this.maxX = x;
      this.maxY = v;
    }
    this.y.push(v);
    const y = this.y.reduce((a, v) => a + v, 0) / this.y.length;
    const MAD = calcMAD(this.y);
    this._y1 = y - MAD * 1.5;
    this._y2 = y + MAD * 1.5;
  }

  /**
   * @param {T} XS
   * @param {number} maxMu
   * @returns {number}
   */
  _computeEI(XS, maxMu) {
    const { mu, cov } = this.gp.predict([XS]);
    const num = mu[0] - maxMu - this.xi;
    const Z = num / cov[0];
    return (num * cdf(Z) + cov[0] * pdf(Z)) || 0;
  }

  /**
   * @param {T} XS
   * @param {number} bestMu
   * @returns {number}
   */
  _computePOI(XS, bestMu) {
    const { mu, cov } = this.gp.predict([XS]);
    return cdf((bestMu - mu[0]) / cov[0]);
  }

  /**
   * @param {number[][]} bounds [min, max][]
   * @param {number?} restarts
   * @param {number?} iter
   * @returns {T}
   */
  _proposeLocation(bounds, restarts, iter) {
    const { mu: muS } = this.gp.predict(this.X, false);
    const maxMu = Math.max.apply(null, muS);
    return gradientDescentRestarts(
      newX => this._computeEI(newX, maxMu),
      // newX => this._computePOI(newX, this._rescale(this.maxY)),
      bounds,
      restarts,
      iter
    );
  }

  /**
   * @param {number[][]} bounds [min, max][]
   * @param {number} iter
   * @param {number} initCount (5)
   * @param {number?} restarts
   * @param {number?} subIter
   */
  optimize(bounds, iter, initCount = 5, restarts, subIter) {
    if (initCount > 0) sampleLHS(initCount, bounds).forEach(x => this.addPoint(x));
    for (let i = 0; i < iter; i++) {
      this.gp.fit(this.X, this.y.map(v => this._rescale(v)));
      let next = this._proposeLocation(bounds, restarts, subIter);
      this.addPoint(next);
    }
    this.gp.fit(this.X, this.y.map(v => this._rescale(v)));
  }
}

/**
 * minimizes g(x) = |func(x)|^2
 * @template {number[]} T
 * @param {(params: T) => number} func
 * @param {T} guess
 * @param {number} epsilon
 * @returns {T}
 */
export function gaussNewtonIteration(func, guess, epsilon) {
  const g = computeGradient(func, guess, epsilon);
  const J = [g];
  const JT = g.map(v => [v]);
  const Jp = solveMatrix(multMatrix(JT, J), JT);
  const f = func(guess);
  return guess.map((v, i) => v - Jp[i][0] * f);
}

/**
 * minimizes g(x) = |func(x)|^2
 * @template {number[]} T
 * @param {(params: T) => number} func
 * @param {number[][]} bounds [min, max][]
 * @param {number} restarts
 * @param {number} maxIter
 * @param {number} epsilon
 * @param {number} gradientEpsilon
 * @returns {T}
 */
export function gaussNewtonRestarts(func, bounds, restarts, maxIter, epsilon, gradientEpsilon) {
  const guesses = sampleLHS(restarts, bounds);
  let minV = Number.POSITIVE_INFINITY;
  let minG = [];
  for (let i = 0; i < restarts; i++) {
    let g = guesses[i];
    let v = Math.abs(func(g));
    for (let j = 0; j < maxIter; j++) {
      if (v < epsilon) return g;
      g = gaussNewtonIteration(func, g, gradientEpsilon);
      v = Math.abs(func(g));
    }
    if (v < minV) {
      minV = v;
      minG = g;
    }
  }
  return minG;
}

/**
 * @param {(x: number) => number} func
 * @param {number} guess
 * @param {number?} iters
 * @param {number?} epsilon
 * @returns {number}
 */
export function newtonRaphson(func, guess, iters = 100, epsilon = 1e-7) {
  let y = func(guess);
  while (Math.abs(y) > epsilon && --iters > 0) {
    guess -= y * 2 * epsilon / (func(guess + epsilon) - func(guess - epsilon));
    y = func(guess);
  }
  return guess;
}

/**
 * only works on monotonic functions
 * @param {(x: number) => number} func
 * @param {number} target
 * @param {number} min
 * @param {number} max
 * @param {boolean} increasing
 * @param {number?} iters
 * @param {number?} epsilon
 */
export function convergeHalfInterval(func, target, min, max, increasing, iters = 100, epsilon = 1e-8) {
  let val;
  let guess;
  do {
    guess = (min + max) / 2;
    val = func(guess);
    if (increasing === (val < target)) min = guess;
    else max = guess;
  } while (dist(target, val) > epsilon && --iters > 0);
  return guess;
}

/**
 * @template {number[]} T
 * @param {T[]} points
 * @param {number?} epsilon
 * @param {number?} iters
 * @param {?(a: T, b: T) => number} distance
 * @returns {T}
 */
export function geoMedian(points, iters = 100, epsilon = 1e-5, distance = (a, b) => Math.hypot.apply(null, a.map((v, i) => v - b[i]))) {
  let guess = points.reduce((a, v) => (v.forEach((n, i) => a[i] += n), a), new Array(points[0].length).fill(0)).map(v => v / points.length);

  let diff = 0;
  do {
    let newGuess = new Array(points[0].length).fill(0);
    let denom = 0;
    points.forEach(v => {
      const d = distance(v, guess);
      if (d === 0) return;

      const f = 1 / d;
      v.forEach((v, i) => newGuess[i] += v * f);
      denom += f;
    });

    newGuess = newGuess.map(v => v / denom);
    diff = distance(newGuess, guess);
    guess = newGuess;
  } while (--iters > 0 && diff > epsilon);

  return guess;
}