import { getEyeHeight, getLastReportedX, getLastReportedY, getLastReportedZ } from './mc';

const ProjectileHelper = Java.type('com.perseuspotter.chicktilshelper.ProjectileHelper');

/**
 * @param {number} ticksRemaining
 * @param {[number, number, number][]} path
 * @param {number} prevBestTarget
 * @param {number} err
 * @param {number} g
 * @param {number} v
 * @param {number} d
 * @param {boolean} h
 * @param {number} [x]
 * @param {number} [y]
 * @param {number} [z]
 * @returns {{ bestTarget: number, bestT: number, bestP: number, bestD: number }}
 */
export default function aim(ticksRemaining, path, prevBestTarget, err, g, v, d, h, x = 0, y = 0, z = 0) {
  const visited = new Set([prevBestTarget]);
  const p = Player.getPlayer();
  x += getLastReportedX();
  y += getLastReportedY() + getEyeHeight(p);
  z += getLastReportedZ();
  let { theta, phi, ticks } = ProjectileHelper.solve(
    path[prevBestTarget][0] - x,
    path[prevBestTarget][1] - y,
    path[prevBestTarget][2] - z,
    err, g, v, d, h
  );
  // assumes this relationship is roughly monotonic
  let bestI = prevBestTarget;
  let bestT = theta;
  let bestP = phi;
  let bestO = Math.abs(ticks - ticksRemaining - prevBestTarget);
  let bestD = ticks;
  if (Number.isNaN(bestO)) bestO = Number.POSITIVE_INFINITY;
  let dir = 1;
  let swapped = false;
  let i = prevBestTarget;
  while (true) {
    let next = i + dir;
    let shouldSwap = false;
    if (next >= 0 && next < path.length && visited.add(next)) {
      ({ theta, phi, ticks } = ProjectileHelper.solve(
        path[next][0] - x,
        path[next][1] - y,
        path[next][2] - z,
        err, g, v, d, h
      ));
      let o = Math.abs(ticks - ticksRemaining - next);
      if (o < bestO) {
        bestI = next;
        bestO = o;
        bestT = theta;
        bestP = phi;
        bestD = ticks;
        i = next;
      } else shouldSwap = true;
    } else shouldSwap = true;
    if (shouldSwap) {
      if (swapped) break;
      swapped = true;
      dir = -dir;
    }
  }

  return { bestTarget: Number.isFinite(bestO) ? bestI : 0, bestT, bestP, bestD };
}