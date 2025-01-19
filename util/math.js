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
 * @returns number
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
 */
export function ceilPow2(num, bits = 0) {
  const mask = (1 << Math.max(0, 31 - Math.clz32(num) - bits)) - 1;
  return (num + mask) & ~mask;
}