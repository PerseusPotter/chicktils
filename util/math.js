// https://github.com/protobi/lambertw

const GSL_DBL_EPSILON = 2.2204460492503131e-16;
const one_over_E = 1 / Math.E;

function halley_iteration(x, w_initial, max_iters) {
  var w = w_initial, i;

  var result = {};

  for (i = 0; i < max_iters; i++) {
    var tol;
    var e = Math.exp(w);
    var p = w + 1.0;
    var t = w * e - x;

    if (w > 0) {
      t = (t / p) / e;
      /* Newton iteration */
    } else {
      t /= e * p - 0.5 * (p + 1.0) * t / p;
      /* Halley iteration */
    }

    w -= t;

    tol = GSL_DBL_EPSILON * Math.max(Math.abs(w), 1.0 / (Math.abs(p) * e));

    if (Math.abs(t) < tol) {
      return {
        val: w,
        err: 2.0 * tol,
        iters: i,
        success: true
      }
    }
  }
  /* should never get here */

  return {
    val: w,
    err: Math.abs(w),
    iters: i,
    success: false
  }
}


/* series which appears for q near zero;
 * only the argument is different for the different branches
 */
function series_eval(r) {
  const c = [
    -1.0,
    2.331643981597124203363536062168,
    -1.812187885639363490240191647568,
    1.936631114492359755363277457668,
    -2.353551201881614516821543561516,
    3.066858901050631912893148922704,
    -4.175335600258177138854984177460,
    5.858023729874774148815053846119,
    -8.401032217523977370984161688514,
    12.250753501314460424,
    -18.100697012472442755,
    27.029044799010561650];

  const t_8 = c[8] + r * (c[9] + r * (c[10] + r * c[11]));
  const t_5 = c[5] + r * (c[6] + r * (c[7] + r * t_8));
  const t_1 = c[1] + r * (c[2] + r * (c[3] + r * (c[4] + r * t_5)));
  return c[0] + r * t_1;
}

/*-*-*-*-*-*-*-*-*-*-*-* Functions with Error Codes *-*-*-*-*-*-*-*-*-*-*-*/

function gsl_sf_lambert_W0_e(x) {
  const one_over_E = 1.0 / Math.E;
  const q = x + one_over_E;

  var result = {};

  if (x == 0.0) {
    result.val = 0.0;
    result.err = 0.0;
    result.success = true;
    return result;
  }
  else if (q < 0.0) {
    /* Strictly speaking this is an error. But because of the
     * arithmetic operation connecting x and q, I am a little
     * lenient in case of some epsilon overshoot. The following
     * answer is quite accurate in that case. Anyway, we have
     * to return GSL_EDOM.
     */
    result.val = -1.0;
    result.err = Math.sqrt(-q);
    result.success = false; // GSL_EDOM
    return result;
  }
  else if (q == 0.0) {
    result.val = -1.0;
    result.err = GSL_DBL_EPSILON;
    /* cannot error is zero, maybe q == 0 by "accident" */
    result.success = true;
    return result;
  }
  else if (q < 1.0e-03) {
    /* series near -1/E in sqrt(q) */
    const r = Math.sqrt(q);
    result.val = series_eval(r);
    result.err = 2.0 * GSL_DBL_EPSILON * Math.abs(result.val);
    result.success = true;
    return result;
  }
  else {
    const MAX_ITERS = 100;
    var w;

    if (x < 1.0) {
      /* obtain initial approximation from series near x=0;
       * no need for extra care, since the Halley iteration
       * converges nicely on this branch
       */
      const p = Math.sqrt(2.0 * Math.E * q);
      w = -1.0 + p * (1.0 + p * (-1.0 / 3.0 + p * 11.0 / 72.0));
    }
    else {
      /* obtain initial approximation from rough asymptotic */
      w = Math.log(x);
      if (x > 3.0) w -= Math.log(w);
    }

    return halley_iteration(x, w, MAX_ITERS, result);
  }
}

export function gsl_sf_lambert_W0(x) {
  return gsl_sf_lambert_W0_e(x).val;
}

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
 * @param {{ x: number, y: number, z: number }} pos
 * @returns {{ x: number, y: number, z: number }}
 */
export function normalize({ x, y, z }) {
  const d = Math.hypot(x, y, z) || 1;
  return { x: x / d, y: y / d, z: z / d };
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
 * @returns {{ r: number, b: number }}
 */
export function linReg(arr) {
  const xMean = arr.reduce((a, v) => a + v[0], 0) / arr.length;
  const yMean = arr.reduce((a, v) => a + v[1], 0) / arr.length;
  const xStd = Math.sqrt(arr.reduce((a, v) => a + (v[0] - xMean) ** 2, 0)); // should be / (n - 1)
  const yStd = Math.sqrt(arr.reduce((a, v) => a + (v[1] - yMean) ** 2, 0)); // should be / (n - 1)
  const r = arr.reduce((a, v) => a + (v[0] - xMean) * (v[1] - yMean), 0) / (xStd * yStd);
  if (Number.isNaN(r)) return { r: 0, b: 0 };
  const b = r * yStd / xStd;
  return { r, b };
}