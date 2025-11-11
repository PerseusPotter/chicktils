import settings from '../settings';
import data from '../data';
import reg, { customRegs, execCmd } from '../util/registerer';
import { log } from '../util/log';
import createAlert from '../util/alert';
import { binomial, compareFloat, convergeHalfInterval, dist, lineRectColl, ndRegression, rescale, toPolynomial } from '../util/math';
import { getBlockPos, getItemId, getLastReportedX, getLastReportedY, getLastReportedZ, getLowerContainer, getServerSneakState } from '../util/mc';
import { unrun } from '../util/threading';
import { renderBeacon, renderBillboardString, renderBoxOutline, renderLine } from '../../Apelles/index';
import { Deque, shuffle, toArrayList } from '../util/polyfill';
import { getSbId } from '../util/skyblock';
import createPointer from '../util/pointto';
import { AtomicStateVar } from '../util/state';

const warps = [
  {
    name: 'hub',
    loc: [-2.5, 70, -69.5],
    pos: 13,
    cost: 10
  },
  {
    name: 'castle',
    loc: [-250, 130, 45],
    pos: 20,
    cost: 10
  },
  {
    name: 'da',
    loc: [91.5, 75, 173.5],
    pos: 21,
    cost: 40
  },
  // crypt
  {
    name: 'museum',
    loc: [-75.5, 76, 80.5],
    pos: 23,
    cost: 10
  },
  {
    name: 'wizard_tower',
    loc: [42.5, 122, 69],
    pos: 24,
    cost: 30
  }
];

function getTickCount() {
  return customRegs.serverTick.tick;
}

const burrowFoundAlert = createAlert('Burrow Found');
/** @type {[number, number, number]?} */
let targetLoc = null;
/** @type {[number, number, number, number, number][]} */
let prevGuesses = [];
/** @type {[number, number, number, number, 'Start' | 'Mob' | 'Treasure'][]} */
let burrows = [];
/** @type {[number, number, number, number][]} */
let recentDugBurrows = [];
let foundGuessBurrow = false;

const removeClosestReg = reg('command', (maxDist = Number.POSITIVE_INFINITY) => {
  unrun(() => {
    const closestGuess = prevGuesses.reduce((a, v, i) => {
      const d = (Player.getX() - v[0]) ** 2 + (Player.getY() - v[1]) ** 2 + (Player.getZ() - v[2]) ** 2;
      return d < a[0] ? [d, i] : a;
    }, [Number.POSITIVE_INFINITY, -1]);
    if (closestGuess[1] >= 0 && closestGuess[0] < maxDist) prevGuesses.splice(closestGuess[1], 1);
  });
}).setName('ctsremoveclosestdiana').setEnabled(settings._dianaGuessFromParticles);
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const burrowSpawnReg = reg('packetReceived', pack => {
  if (compareFloat(pack.func_149227_j(), 0.01) !== 0) return;
  if (compareFloat(pack.func_149224_h(), 0.1) !== 0) return;

  let type;
  if (pack.func_179749_a().equals(EnumParticleTypes.CRIT_MAGIC)) {
    if (
      pack.func_149222_k() === 4 &&
      pack.func_149221_g() === 0.5 &&
      pack.func_149223_i() === 0.5
    ) type = 'Start';
  }
  else if (pack.func_179749_a().equals(EnumParticleTypes.CRIT)) {
    if (
      pack.func_149222_k() === 3 &&
      pack.func_149221_g() === 0.5 &&
      pack.func_149223_i() === 0.5
    ) type = 'Mob';
  }
  else if (pack.func_179749_a().equals(EnumParticleTypes.DRIP_LAVA)) {
    if (
      pack.func_149222_k() === 2 &&
      compareFloat(pack.func_149221_g(), 0.35) === 0 &&
      compareFloat(pack.func_149223_i(), 0.35) === 0
    ) type = 'Treasure';
  }

  if (!type) return;

  const x = Math.floor(pack.func_149220_d()) + 0.5;
  const y = Math.floor(pack.func_149226_e()) - 1;
  const z = Math.floor(pack.func_149225_f()) + 0.5;

  unrun(() => {
    if (guessPos) {
      const d = (x - guessPos[0]) ** 2 + (z - guessPos[2]) ** 2;
      if (d < 400) foundGuessBurrow = true;
    }

    if (burrows.some(v => v[0] === x && v[1] === y && v[2] === z)) return;
    if (recentDugBurrows.some(v => v[0] === x && v[1] === y && v[2] === z && getTickCount() - v[3] < 20)) return;
    if (settings.dianaAlertFoundBurrow && (!settings.dianaAlertFoundBurrowNoStart || type !== 'Start') && !recentDugBurrows.some(v => v[0] === x && v[1] === y && v[2] === z)) burrowFoundAlert.show(settings.dianaAlertFoundBurrowTime);
    burrows.push([
      x, y, z,
      getTickCount(),
      type
    ]);

    prevGuesses = prevGuesses.filter(v => (x - v[0]) ** 2 + (z - v[2]) ** 2 > 100);
  });
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(settings._dianaScanBurrows);
const burrowDigReg = reg('packetSent', pack => {
  let bp;
  if (pack.func_149574_g) bp = pack.func_179724_a();
  else if (pack.func_180762_c && pack.func_180762_c() === net.minecraft.network.play.client.C07PacketPlayerDigging.Action.START_DESTROY_BLOCK) bp = pack.func_179715_a();
  if (!bp) return;

  const { x, y, z } = getBlockPos(bp);
  if (x === -1 && y === -1 && z === -1) return

  unrun(() => {
    const burrowI = burrows.findIndex(v => v[0] === x + 0.5 && v[1] === y && v[2] === z + 0.5);
    if (burrowI >= 0) burrows.splice(burrowI, 1);
    recentDugBurrows.push([x + 0.5, y, z + 0.5, getTickCount()]);
    if (recentDugBurrows.length > 10) recentDugBurrows.shift();
  });
}).setFilteredClasses([net.minecraft.network.play.client.C07PacketPlayerDigging, net.minecraft.network.play.client.C08PacketPlayerBlockPlacement]).setEnabled(settings._dianaScanBurrows);
const renderTargetsReg = reg('renderWorld', () => {
  burrows.forEach(v => {
    renderBoxOutline(
      settings[`dianaBurrow${v[4]}Color`] ?? 0,
      v[0], v[1], v[2],
      1, 1,
      { phase: true }
    );
    if (v !== targetLoc) renderBeacon(
      settings[`dianaBurrow${v[4]}Color`] ?? 0,
      v[0], v[1] + 1, v[2],
      { phase: true }
    );
    renderBillboardString(
      0xFFFFFFFF,
      '&5&l' + v[4],
      v[0], v[1] + 1.5, v[2],
      { increase: true, phase: true }
    );
  });
  prevGuesses.forEach(v => {
    renderBoxOutline(
      settings.dianaBurrowPrevGuessColor,
      v[0], v[1], v[2],
      1, 1,
      { phase: true }
    );
    if (v !== targetLoc) renderBeacon(
      settings.dianaBurrowPrevGuessColor,
      v[0], v[1] + 1, v[2],
      { phase: true }
    );
  });
  if (targetLoc) renderBeacon(
    settings.dianaArrowToBurrowColor,
    targetLoc[0], targetLoc[1] + 1, targetLoc[2],
    { phase: true }
  );
});

/** @typedef {{ t: number, x: number, y: number, z: number }} ParticlePos */
/** @type {Deque<[number, number, number]>} */
const spadeUsePositions = new Deque();
/** @type {Deque<ParticlePos>} */
const unclaimedParticles = new Deque();
/** @type {Deque<ParticlePos>} */
const possibleStartingParticles = new Deque();
/** @type {ParticlePos[]} */
let knownParticleChain = [];
const MIN_CHAIN_LENGTH = 6;
// const MIN_CHAIN_PEARSON_SQ = 0.9;
const MAX_CHAIN_DISTANCE_ERROR = 0.5;
const RANSAC_ITERS_PER = 10;

/** @type {[number, number, number]?} */
let guessPos = null;
/** @type {import('../util/state').StateVar<[(t: number) => number, (t: number) => number, (t: number) => number]?>} */
const splinePoly = new AtomicStateVar(null);
let splinePolyPos = toArrayList([]);
function resetGuess() {
  splinePoly.set(null);
  knownParticleChain = [];
  unrun(() => {
    if (settings.dianaGuessRememberPrevious && !foundGuessBurrow && guessPos) {
      const v = guessPos;
      if (Math.hypot(Player.getX() - v[0], Player.getY() - v[1], Player.getZ() - v[2]) > 10) {
        if (
          (
            v[2] < -30 ?
              v[0] > -230 :
              v[0] > -300
          ) &&
          v[0] < 210 &&
          v[2] > -240 &&
          v[2] < 210 &&
          v[1] > 50 &&
          v[1] < 120
        ) prevGuesses.push([v[0], v[1], v[2], getTickCount(), 20]);
      }
    }
    guessPos = [];
    foundGuessBurrow = false;
  });
}
function fullReset() {
  resetGuess();
  spadeUsePositions.clear();
  unclaimedParticles.clear();
  possibleStartingParticles.clear();
}

function updateGuesses() {
  if (knownParticleChain.length < MIN_CHAIN_LENGTH) return;
  // from https://github.com/hannibal002/SkyHanni/blob/08e5cf831e3e22401d1de830ee522aadcff6634d/src/main/java/at/hannibal2/skyhanni/utils/PolynomialFitter.kt
  const splineX = ndRegression(3, knownParticleChain.map((v, i) => [i, v.x]));
  const splineY = ndRegression(3, knownParticleChain.map((v, i) => [i, v.y]));
  const splineZ = ndRegression(3, knownParticleChain.map((v, i) => [i, v.z]));
  const _splinePoly = [
    toPolynomial(splineX),
    toPolynomial(splineY),
    toPolynomial(splineZ)
  ];
  splinePoly.set(_splinePoly);
  const dx0 = splineX[1];
  const dy0 = splineY[1];
  const dz0 = splineZ[1];
  const xz = Math.hypot(dx0, dz0);

  const weight = Math.sqrt(-24 * Math.sin(
    convergeHalfInterval(
      x => Math.atan2(Math.sin(x) - 0.75, Math.cos(x)),
      -Math.atan2(dy0, xz),
      -Math.PI / 2,
      Math.PI / 2,
      true
    )
  ) + 25);
  const weightT = 3 * weight / Math.hypot(dx0, dy0, dz0);
  const distance = weightT * 1.9;

  /*
  const a1 = splineX[3];
  const a2 = splineY[3];
  const a3 = splineZ[3];
  const b1 = splineX[2];
  const b2 = splineY[2];
  const b3 = splineZ[2];
  const c1 = splineX[1];
  const c2 = splineY[1];
  const c3 = splineZ[1];
  const splineIntPoly = toPolynomial([
    -distance * distance,
    0,
    c1 * c1 + c2 * c2 + c3 * c3,
    2 * (b1 * c1 + b2 * c2 + b3 * c3),
    2 * (a1 * c1 + a2 * c2 + a3 * c3) + (b1 * b1 + b2 * b2 + b3 * b3),
    2 * (a1 * b1 + a2 * b2 + a3 * b3),
    a1 * a1 + a2 * a2 + a3 * a3
  ]);
  const splineIntTime = newtonRaphson(splineIntPoly, weightT);
  */
  /*
  let t = 0;
  while (t < weightT + 2) {
    if (
      (_splinePoly[0](t) - splineX[0]) ** 2 +
      (_splinePoly[1](t) - splineY[0]) ** 2 +
      (_splinePoly[2](t) - splineZ[0]) ** 2 >
      distance * distance
    ) break;
    t++;
  }
  const splineIntTime = convergeHalfInterval(
    t => distance - Math.hypot(_splinePoly[0](t) - splineX[0], _splinePoly[1](t) - splineY[0], _splinePoly[2](t) - splineZ[0]),
    0,
    t - 1, t,
    false
  );
  const guess = _splinePoly.map(v => v(splineIntTime));
  */
  guess = _splinePoly.map(v => v(weightT));
  guess[1]--;

  const _splinePolyPos = new ArrayList();
  for (let i = 0; i <= 100; i++) {
    let t = rescale(i, 0, 100, 0, weightT);
    _splinePolyPos.add(toArrayList(_splinePoly.map(v => v(t))));
  }
  unrun(() => {
    splinePolyPos = _splinePolyPos;
    guessPos = guess;
  });
}

function ransac() {
  const t = getTickCount();
  possibleStartingParticles.removeIf(v => v.t < t - 80);
  unclaimedParticles.removeIf(v => v.t < t - 80);
  const L1 = possibleStartingParticles.length;
  const L2 = unclaimedParticles.length;
  const L = L1 + L2;
  if (L < MIN_CHAIN_LENGTH) return;
  if (L1 === 0) return;

  const comb = binomial(L, MIN_CHAIN_LENGTH);
  const rand = new Array(L - 1).fill(0).map((_, i) => i);
  let start = 0;
  const getPart = i => {
    if (i >= start) i++;
    return i < L1 ? possibleStartingParticles.at(i) : unclaimedParticles.at(i - L1);
  };

  // let bestR = 0;
  let bestD = Number.POSITIVE_INFINITY;
  let best = [];

  for (let i = Math.min(comb, RANSAC_ITERS_PER) - 1; i >= 0; i--) {
    shuffle(rand, MIN_CHAIN_LENGTH - 1);
    let possInliersI = rand.slice(0, MIN_CHAIN_LENGTH - 1);
    start = ~~(Math.random() * L1);
    let possInliers = possInliersI.map(v => getPart(v));
    possInliers.unshift(possibleStartingParticles.at(start));
    let minT = possInliers.reduce((a, v) => a < v.t ? a : v.t, Number.POSITIVE_INFINITY);
    let poly = [
      toPolynomial(ndRegression(3, possInliers.map(v => [v.t - minT, v.x]))),
      toPolynomial(ndRegression(3, possInliers.map(v => [v.t - minT, v.y]))),
      toPolynomial(ndRegression(3, possInliers.map(v => [v.t - minT, v.z])))
    ];

    /** @type {ParticlePos[]} */
    let inliers = [];
    let addIf = v => {
      const px = poly[0](v.t - minT);
      const py = poly[1](v.t - minT);
      const pz = poly[2](v.t - minT);
      if (
        (v.x - px) ** 2 +
        (v.y - py) ** 2 +
        (v.z - pz) ** 2
        < 9
      ) inliers.push(v);
    };
    possibleStartingParticles.forEach(addIf);
    unclaimedParticles.forEach(addIf);

    minT = inliers.reduce((a, v) => a < v.t ? a : v.t, Number.POSITIVE_INFINITY);
    // let r = Math.min(
    //   pearsonCoeff(inliers.map(v => v.t - minT), inliers.map(v => v.x)) ** 2,
    //   pearsonCoeff(inliers.map(v => v.t - minT), inliers.map(v => v.y)) ** 2,
    //   pearsonCoeff(inliers.map(v => v.t - minT), inliers.map(v => v.z)) ** 2,
    // );
    // if (r > bestR) {
    //   bestR = r;
    //   best = inliers;
    // }
    poly = [
      toPolynomial(ndRegression(3, possInliers.map(v => [v.t - minT, v.x]))),
      toPolynomial(ndRegression(3, possInliers.map(v => [v.t - minT, v.y]))),
      toPolynomial(ndRegression(3, possInliers.map(v => [v.t - minT, v.z])))
    ];
    let d =
      inliers.reduce((a, v) => a + dist(poly[0](v.t - minT), v.x), 0) +
      inliers.reduce((a, v) => a + dist(poly[1](v.t - minT), v.y), 0) +
      inliers.reduce((a, v) => a + dist(poly[2](v.t - minT), v.z), 0);
    if (d < bestD) {
      bestD = d;
      best = inliers;
    }
  }

  if (bestD < MAX_CHAIN_DISTANCE_ERROR && best.length >= MIN_CHAIN_LENGTH) {
    let s = new Set();
    best.forEach(v => s.add(v.t));
    possibleStartingParticles.removeIf(v => s.has(v.t));
    unclaimedParticles.removeIf(v => s.has(v.t));
    resetGuess();
    knownParticleChain = best.sort((a, b) => a.t - b.t);
    updateGuesses();
  }
}

const spawnPartReg = reg('packetReceived', pack => {
  if (!(
    pack.func_179749_a().equals(EnumParticleTypes.DRIP_LAVA) &&
    pack.func_149222_k() === 2 &&
    pack.func_149227_j() === -0.5 &&
    pack.func_179750_b() &&
    pack.func_149221_g() === 0 &&
    pack.func_149224_h() === 0 &&
    pack.func_149223_i() === 0
  )) return;

  const x = pack.func_149220_d();
  const y = pack.func_149226_e();
  const z = pack.func_149225_f();
  const t = getTickCount();
  const obj = { t, x, y, z };
  let isKnown = false;
  if (knownParticleChain.length && t < knownParticleChain[knownParticleChain.length - 1].t + 5) {
    const spline = splinePoly.get();
    if (spline) {
      const predicted = spline.map(v => v(knownParticleChain.length));
      if ((predicted[0] - x) ** 2 + (predicted[1] - y) ** 2 + (predicted[2] - z) ** 2 < 9) {
        knownParticleChain.push(obj);
        isKnown = true;
        updateGuesses();
      }
    }
  }

  if (!isKnown) {
    if (spadeUsePositions.some(v =>
      (v[0] - x) ** 2 +
      (v[1] - y) ** 2 +
      (v[2] - z) ** 2
      < 4
    )) possibleStartingParticles.push(obj);
    else unclaimedParticles.push(obj);

    ransac();
  }
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(settings._dianaGuessFromParticles);

const spadeUseReg = reg('packetSent', pack => {
  if (pack.func_149568_f() !== 255) return;
  const stack = pack.func_149574_g();
  if (!stack) return;
  const id = getSbId(stack);

  if (id === 'ANCESTRAL_SPADE' || id === 'ARCHAIC_SPADE' || id === 'DEIFIC_SPADE') spadeUsePositions.push([
    getLastReportedX(),
    getLastReportedY() + (getServerSneakState() ? 1.54 : 1.62),
    getLastReportedZ()
  ]);
}).setFilteredClass(net.minecraft.network.play.client.C08PacketPlayerBlockPlacement).setEnabled(settings._dianaGuessFromParticles);

const renderGuessReg = reg('renderWorld', () => {
  if (splinePolyPos.size()) renderLine(
    settings.dianaGuessFromParticlesPathColor,
    splinePolyPos,
    { phase: true }
  );
  if (guessPos && guessPos[0]) renderBoxOutline(
    settings.dianaGuessFromParticlesAverageColor,
    guessPos[0], guessPos[1], guessPos[2],
    1, 1,
    { phase: true }
  );
}).setEnabled(settings._dianaGuessFromParticles);

const tickReg = reg('tick', () => {
  let closest = foundGuessBurrow ? null : guessPos;
  let closestD = closest ? (Player.getX() - closest[0]) ** 2 + (Player.getY() - closest[1]) ** 2 + (Player.getZ() - closest[2]) ** 2 : Number.POSITIVE_INFINITY;
  if (Number.isNaN(closestD)) {
    closest = null;
    closestD = Number.POSITIVE_INFINITY;
  }

  const t = getTickCount();

  let i = 0;
  burrows.forEach(v => {
    if (t - v[3] > 5 * 60 * 20) return i++;
    const d = (Player.getX() - v[0]) ** 2 + (Player.getY() - v[1]) ** 2 + (Player.getZ() - v[2]) ** 2;
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
  });
  if (i > 0) burrows = burrows.slice(i);

  const heldId = getSbId(Player.getHeldItem());
  const isHoldingSpade = heldId === 'ANCESTRAL_SPADE' || heldId == 'ARCHAIC_SPADE' || heldId === 'DEIFIC_SPADE';
  prevGuesses = prevGuesses.filter(v => {
    if (t - v[3] > 5 * 60 * 20) return false;
    const d = (Player.getX() - v[0]) ** 2 + (Player.getY() - v[1]) ** 2 + (Player.getZ() - v[2]) ** 2;
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
    if (isHoldingSpade && (Player.getX() - v[0]) ** 2 + (Player.getZ() - v[2]) ** 2 <= 100) return --v[4] > 0;
    return true;
  });

  targetLoc = closest;
});
const arrowPointReg = createPointer(
  settings._dianaArrowToBurrowColor,
  () => [targetLoc[0], targetLoc[1] + 1, targetLoc[2]],
  {
    enabled: settings._dianaArrowToBurrow,
    req: () => targetLoc
  }
);

const startBurrowReg = reg('chat', () => {
  if (unloadReg.isRegistered()) return;

  removeClosestReg.register();
  burrowSpawnReg.register();
  burrowDigReg.register();
  burrowResetReg.register();
  renderTargetsReg.register();
  spawnPartReg.register();
  spadeUseReg.register();
  renderGuessReg.register();
  tickReg.register();
  arrowPointReg.register();
  unloadReg.register();
}).setCriteria(/&r&eYou dug out a Griffin Burrow! &r&7\(\d+\/\d+\)&r/);
const unloadReg = reg('worldUnload', () => {
  removeClosestReg.unregister();
  burrowSpawnReg.unregister();
  burrowDigReg.unregister();
  burrowResetReg.unregister();
  renderTargetsReg.unregister();
  spawnPartReg.unregister();
  spadeUseReg.unregister();
  renderGuessReg.unregister();
  tickReg.unregister();
  arrowPointReg.unregister();
  unloadReg.unregister();

  targetLoc = null;
  fullReset();
});
const burrowResetReg = reg('chat', () => {
  fullReset();
  unrun(() => {
    targetLoc = null;
    burrows = [];
    prevGuesses = [];
  });
}).setCriteria('&r&6Poof! &r&eYou have cleared your griffin burrows!&r');

const warpOpenReg = reg('guiOpened', evn => {
  const gui = evn.gui;
  if (gui.getClass().getSimpleName() !== 'GuiChest') return;
  // net.minecraft.client.player.inventory.ContainerLocalMenu
  const inv = getLowerContainer(gui);
  const name = inv.func_70005_c_();
  if (name !== 'Hub Warps') return;
  Client.scheduleTask(() => {
    data.unlockedHubWarps = warps.map(v => {
      const item = inv.func_70301_a(v.pos);
      return item && getItemId(item) === 'minecraft:paper';
    });
  });
});

const warpKey = new KeyBind('Diana Warp', data.dianaWarpKey, 'ChickTils');
warpKey.registerKeyRelease(() => {
  if (!unloadReg.isRegistered()) return;
  data.dianaWarpKey = warpKey.getKeyCode();
  if (data.unlockedHubWarps.filter(Boolean).length === 0) return log('open warps menu pweese (turn on paper icons, will look for heads later thx)');

  const p = targetLoc;
  if (!p) return;

  let best = null;
  let bestD = Math.hypot(Player.getX() - p[0], Player.getY() - p[1], Player.getZ() - p[2]);
  warps.forEach((v, i) => {
    if (!data.unlockedHubWarps[i]) return;
    let d = Math.hypot(p[0] - v.loc[0], p[1] - v.loc[1], p[2] - v.loc[2]) + v.cost;
    if (lineRectColl(v.loc[0], v.loc[2], p[0], p[2], -60, 0, 90, 70)) d += 50;
    if (d < bestD) {
      bestD = d;
      best = v.name;
    }
  });
  if (best) execCmd('warp ' + best);
});

export function init() {
  settings._dianaAlertFoundBurrowSound.listen(v => burrowFoundAlert.sound = v);
}
export function load() {
  startBurrowReg.register();
  warpOpenReg.register();
}
export function unload() {
  startBurrowReg.unregister();
  warpOpenReg.unregister();
  unloadReg.unregister();
  unloadReg.forceTrigger();
}