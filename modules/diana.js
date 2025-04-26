import settings from '../settings';
import data from '../data';
import reg, { customRegs } from '../util/registerer';
import { log } from '../util/log';
import createAlert from '../util/alert';
import { drawArrow3DPos, renderString } from '../util/draw';
import { compareFloat, convergeHalfInterval, dist, geoMedian, gradientDescent, linReg, lineRectColl, ndRegression, newtonRaphson, rescale, toPolynomial } from '../util/math';
import { execCmd } from '../util/format';
import { StateProp } from '../util/state';
import { getBlockPos, getItemId, getLowerContainer } from '../util/mc';
import { unrun } from '../util/threading';
import { renderBeacon, renderBoxOutline, renderLine, renderTracer } from '../../Apelles/index';

const warps = [
  {
    name: 'hub',
    loc: [-2.5, 70, -69.5],
    pos: 13,
    cost: 0
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
    cost: 50
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
  return customRegs.serverTick2.tick;
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
  if (burrows.some(v => v[0] === x && v[1] === y && v[2] === z)) return;
  if (recentDugBurrows.some(v => v[0] === x && v[1] === y && v[2] === z && getTickCount() - v[3] < 20)) return;

  unrun(() => {
    if (settings.dianaAlertFoundBurrow && (!settings.dianaAlertFoundBurrowNoStart || type !== 'Start') && !recentDugBurrows.some(v => v[0] === x && v[1] === y && v[2] === z)) burrowFoundAlert.show(settings.dianaAlertFoundBurrowTime);
    burrows.push([
      x, y, z,
      getTickCount(),
      type
    ]);

    prevGuesses = prevGuesses.filter(v => (x - v[0]) ** 2 + (z - v[2]) ** 2 > 400);

    if (guessPos.has('Average')) {
      const p = guessPos.get('Average');
      const d = (x - p[0]) ** 2 + (z - p[2]) ** 2;
      if (d < 400) foundGuessBurrow = true;
      if (d < 100) resetGuess();
    }
  });
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(settings._dianaScanBurrows);
const burrowDigReg = reg('packetSent', pack => {
  let bp;
  if (pack.func_149574_g) bp = pack.func_179724_a();
  else if (pack.func_180762_c && pack.func_180762_c() === net.minecraft.network.play.client.C07PacketPlayerDigging.Action.START_DESTROY_BLOCK) bp = pack.func_179715_a();
  if (!bp) return;

  const { x, y, z } = getBlockPos(bp);
  if (x === -1 && y === -1 && z === -1) return;

  prevStand = null;
  unrun(() => {
    const burrowI = burrows.findIndex(v => v[0] === x + 0.5 && v[1] === y && v[2] === z + 0.5);
    if (burrowI >= 0) {
      burrows.splice(burrowI, 1);
      recentDugBurrows.push([x + 0.5, y, z + 0.5, getTickCount()]);
      if (recentDugBurrows.length > 5) recentDugBurrows.shift();
    }
  });
}).setFilteredClasses([net.minecraft.network.play.client.C07PacketPlayerDigging, net.minecraft.network.play.client.C08PacketPlayerBlockPlacement]).setEnabled(settings._dianaScanBurrows);
const burrowResetReg = reg('chat', () => {
  unrun(() => {
    resetGuess();
    burrows = [];
    prevGuesses = [];
  });
}).setCriteria('&r&6Poof! &r&eYou have cleared your griffin burrows!&r');
const renderTargetsReg = reg('renderWorld', () => {
  burrows.forEach(v => {
    renderBoxOutline(
      settings[`dianaBurrow${v[4]}Color`] ?? 0,
      v[0], v[1], v[2],
      1, 1,
      { phase: true }
    );
    renderString(
      '&5&l' + v[4],
      v[0], v[1] + 1.5, v[2],
      0xFFFFFFFF,
      true, 1, true, true, true
    );
  });
  prevGuesses.forEach(v => {
    renderBoxOutline(
      settings.dianaBurrowPrevGuessColor,
      v[0], v[1], v[2],
      1, 1,
      { phase: true }
    );
  });
  if (targetLoc) renderBeacon(
    settings.dianaArrowToBurrowColor,
    targetLoc[0], targetLoc[1] + 1, targetLoc[2],
    { phase: true }
  );
});

let spadeUseTime = 0;
/** @type {{ t: number, p: number }[]} */
let prevSounds = [];
/** @type {{ t: number, x: number, y: number, z: number }[]} */
let prevParticles = [];
/** @type {Map<'Average' | 'Spline' | 'MLAT' | 'Arrow' | 'Bezier', [number, number, number]?>} */
let guessPos = new Map();
/** @type {[(t: number) => number, (t: number) => number, (t: number) => number]?} */
let splinePoly;
let splinePolyPos = [];
/** @type {[[number, number], [number, number], number]?} */
let arrowVec;
/** @type {string[]} */
let recentStands = [];
/** @type {string?} */
let prevStand;
let prevGuessL = 0;
const RESET_THRESH = 58;
function resetGuess() {
  spadeUseTime = getTickCount();
  prevSounds = [];
  prevParticles = [];

  prevGuessL = 0;
  unrun(() => {
    if (settings.dianaGuessRememberPrevious && !foundGuessBurrow && guessPos.has('Average')) {
      const v = guessPos.get('Average');
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
      ) prevGuesses.push([v[0], v[1], v[2], getTickCount(), 40]);
    }
    guessPos.clear();
    splinePoly = null;
    foundGuessBurrow = false;
  });
}
function updateGuesses() {
  const l = Math.min(prevParticles.length, prevSounds.length);
  if (l === prevGuessL) return;
  prevGuessL = l;

  /** @type {typeof guessPos} */
  const guesses = new Map();
  const particles = prevParticles.slice(0, l);
  const pitches = prevSounds.slice(0, l);

  const splineCoeff = [
    ndRegression(2, particles.map((v, i) => [i, v.x])),
    ndRegression(2, particles.map((v, i) => [i, v.y])),
    ndRegression(2, particles.map((v, i) => [i, v.z]))
  ];
  splinePoly = [
    toPolynomial(splineCoeff[0]),
    toPolynomial(splineCoeff[1]),
    toPolynomial(splineCoeff[2])
  ];

  // from https://github.com/hannibal002/SkyHanni/blob/08e5cf831e3e22401d1de830ee522aadcff6634d/src/main/java/at/hannibal2/skyhanni/utils/PolynomialFitter.kt
  const spline3X = ndRegression(3, particles.map((v, i) => [i, v.x]));
  const spline3Y = ndRegression(3, particles.map((v, i) => [i, v.y]));
  const spline3Z = ndRegression(3, particles.map((v, i) => [i, v.z]));
  const dx0 = spline3X[1];
  const dy0 = spline3Y[1];
  const dz0 = spline3Z[1];
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

  const { b: pitchB, a: pitchA } = linReg(pitches.map((v, i) => [i, v.p]));
  // const distance =
  //   settings.dianaGuessDistanceEstimator === 'Slope' ?
  //     Math.E / pitchB :
  //     2836.3513351166325 * pitchA + -1395.7763277125964;
  // const dist3 = 2924.6641104450428 * pitches[0].p + -1442.1515587278568;

  const createSplineIntersectPoly = (function() {
    const a1 = splineCoeff[0][2];
    const a2 = splineCoeff[1][2];
    const a3 = splineCoeff[2][2];
    const b1 = splineCoeff[0][1];
    const b2 = splineCoeff[1][1];
    const b3 = splineCoeff[2][1];
    return function(dist) {
      return toPolynomial([
        -dist * dist,
        0,
        b1 * b1 + b2 * b2 + b3 * b3,
        2 * (a1 * b1 + a2 * b2 + a3 * b3),
        a1 * a1 + a2 * a2 + a3 * a3
      ]);
    };
  }());
  const splineIntPoly = createSplineIntersectPoly(distance);
  const splineIntTime = newtonRaphson(splineIntPoly, 1);
  // const splineIntTime = gradientDescentRestarts(([t]) => -dist(distance, Math.hypot(splinePoly[0](t) - splineCoeff[0][0], splinePoly[1](t) - splineCoeff[1][0], splinePoly[2](t) - splineCoeff[2][0])), [[0, 500]])[0];
  guesses.set('Spline', splinePoly.map(v => v(splineIntTime)));

  {
    const poly = createPitchDistPoly(distance);
    // doesn't work well with large errors + ill fitted
    // const A = particles.map(v => [1, -2 * v.x, -2 * v.y, -2 * v.z]);
    // const b = new Array(l).fill(0).map((_, i) => [poly(pitchA + i * pitchB) ** 2 - particles[i].x ** 2 - particles[i].y ** 2 - particles[i].z ** 2]);
    // const p =
    //   multMatrix(
    //     multMatrix(
    //       invertMatrix(
    //         multMatrix(
    //           transposeMatrix(A),
    //           A
    //         )
    //       ),
    //       transposeMatrix(A)
    //     ),
    //     pitchB
    //   );
    guesses.set('MLAT', gradientDescent(
      ([x, y, z]) => -particles.reduce((a, v, i) => a + dist(Math.hypot(v.x - x, v.y - y, v.z - z), poly(pitchA + i * pitchB)), 0),
      guesses.get('Spline').slice(),
      [[-500, 500], [-500, 500], [-500, 500]]
    ));
  }

  if (arrowVec && prevStand) {
    // const AVERAGE_BURROW_Y = 75;
    const BURROW_Y = guesses.get('Spline')[1];
    const xl = arrowVec[0][0];
    const zl = arrowVec[0][1];
    const xc = particles[0].x;
    const yc = particles[0].y;
    const zc = particles[0].z;
    const cx = xl - xc;
    const cz = zl - zc;
    const dx = arrowVec[1][0];
    const dz = arrowVec[1][1];
    const A = dx * dx + dz * dz;
    const B = 2 * (cx * dx + cz * dz);
    const D2 = distance * distance - (yc - BURROW_Y) ** 2;
    const C = cx * cx + cz * cz - D2;
    const t = (-B + Math.sign(A) * Math.sqrt(B * B - 4 * A * C)) / 2 / A;
    guesses.set('Arrow', [xl + t * dx, BURROW_Y, zl + t * dz]);
  }

  {
    guesses.set('Bezier', [
      toPolynomial(spline3X)(weightT) + 0.5,
      toPolynomial(spline3Y)(weightT),
      toPolynomial(spline3Z)(weightT) + 0.5
    ]);
  }

  guesses.set('Average', geoMedian(Array.from(guesses.values())));

  const _splinePolyPos = [];
  for (let i = 0; i <= 60; i++) {
    let t = rescale(i, 0, 60, 0, 20);
    _splinePolyPos.push(splinePoly.map(v => v(t)));
  }
  for (let i = 0; i <= 40; i++) {
    let t = rescale(i, 0, 40, 20, 500);
    _splinePolyPos.push(splinePoly.map(v => v(t)));
  }
  unrun(() => {
    splinePolyPos = _splinePolyPos;
    guessPos = guesses;
  });
}
function createPitchDistPoly(dist) {
  return toPolynomial([
    0.34672856180294437 * dist + 16.075158197019384,
    2.49969541740811 * dist + -46.744667774875325,
    -2.7801642926160226 * dist + 35.819136056204,
    0.721661786664227 * dist + -8.207684155501738,
  ]);
}

const soundPlayReg = reg('packetReceived', pack => {
  if (pack.func_149212_c() !== 'note.harp') return;
  if (pack.func_149208_g() !== 1) return;
  const pitch = pack.func_149209_h();

  const t = getTickCount();
  if (prevSounds.length) {
    if (t - spadeUseTime === prevSounds[prevSounds.length - 1].t) return;
    const estA = prevSounds[0].p;
    const estB = Math.E / (2836.3513351166325 * estA + -1395.7763277125964);
    if (dist((pitch - estA) / (prevSounds.length + 1), estB) / estB > 1) {
      if (t - spadeUseTime > RESET_THRESH) resetGuess();
      else return;
    }
  }

  prevSounds.push({
    t: t - spadeUseTime,
    p: pitch
  });
  updateGuesses();
}).setFilteredClass(net.minecraft.network.play.server.S29PacketSoundEffect).setEnabled(settings._dianaGuessFromParticles);
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
  if (prevParticles.length) {
    if (t - spadeUseTime === prevParticles[prevParticles.length - 1].t) return;
    if (prevParticles.length > 2 && splinePoly) {
      const estPX = splinePoly[0](prevParticles.length);
      const estPY = splinePoly[1](prevParticles.length);
      const estPZ = splinePoly[2](prevParticles.length);
      if ((estPX - x) ** 2 + (estPY - y) ** 2 + (estPZ - z) ** 2 > 16) {
        if (t - spadeUseTime >= RESET_THRESH) resetGuess();
        else return;
      }
    } else {
      const pp = prevParticles[prevParticles.length - 1];
      if ((pp.x - x) ** 2 + (pp.y - y) ** 2 + (pp.z - z) ** 2 > 25) {
        if (t - spadeUseTime >= RESET_THRESH) resetGuess();
        else return;
      }
    }
  }

  prevParticles.push({
    t: t - spadeUseTime,
    x,
    y,
    z
  });
  updateGuesses();
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(settings._dianaGuessFromParticles);
const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const armorStandReg = reg('packetReceived', (pack, doDupe) => {
  if (pack.func_149388_e() !== 0) return;
  const ent = World.getWorld().func_73045_a(pack.func_149389_d());
  if (!ent) {
    if (doDupe) Client.scheduleTask(2, () => armorStandReg.forceTrigger(pack, Number.isInteger(doDupe) ? doDupe - 1 : 10));
    return;
  }
  if (!(ent instanceof EntityArmorStand)) return;
  if (getItemId(pack.func_149390_c()) !== 'minecraft:arrow') return;

  const yaw = ent.field_70177_z * Math.PI / 180;
  const x = ent.field_70165_t - Math.sin(yaw + Math.PI / 2) * 0.9;
  const y = ent.field_70163_u;
  const z = ent.field_70161_v + Math.cos(yaw + Math.PI / 2) * 0.9;

  if (!recentDugBurrows.some(v =>
    Math.floor(x) === Math.floor(v[0]) &&
    Math.floor(y) === v[1] &&
    Math.floor(z) === Math.floor(v[2])
  )) return;

  const id = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
  if (recentStands.includes(id)) return;
  recentStands.push(id);
  if (recentStands.length > 5) recentStands.shift();

  arrowVec = [
    [x, z],
    [
      -Math.sin(yaw),
      +Math.cos(yaw)
    ],
    y
  ];
  prevStand = id;
}).setFilteredClass(net.minecraft.network.play.server.S04PacketEntityEquipment).setEnabled(settings._dianaGuessFromParticles);

const renderGuessReg = reg('renderWorld', () => {
  if (splinePolyPos.length) renderLine(
    settings.dianaGuessFromParticlesPathColor,
    splinePolyPos,
    { phase: true }
  );
  guessPos.forEach((v, k) => {
    if (!v) return;
    renderBoxOutline(
      settings[`dianaGuessFromParticles${k}Color`] ?? 0,
      v[0], v[1], v[2],
      1, 1,
      { phase: true }
    );
    if (settings.dianaGuessFromParticlesRenderName) renderString(
      k,
      v[0], v[1] + 1.5, v[2],
      settings[`dianaGuessFromParticles${k}Color`] ?? 0,
      true, 1, true, true, true
    );
  });
  if (arrowVec) renderLine(
    settings.dianaGuessFromParticlesArrowColor,
    [
      [
        arrowVec[0][0],
        arrowVec[2],
        arrowVec[0][1],
      ],
      [
        arrowVec[0][0] + arrowVec[1][0] * 500,
        arrowVec[2],
        arrowVec[0][1] + arrowVec[1][1] * 500,
      ]
    ],
    { phase: true, lw: 3 }
  );
}).setEnabled(settings._dianaGuessFromParticles);

const tickReg = reg('tick', () => {
  let closest = foundGuessBurrow ? null : guessPos.get('Average');
  let closestD = closest ? (Player.getX() - closest[0]) ** 2 + (Player.getY() - closest[1]) ** 2 + (Player.getZ() - closest[2]) ** 2 : Number.POSITIVE_INFINITY;

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

  prevGuesses = prevGuesses.filter(v => {
    if (t - v[3] > 5 * 60 * 20) return false;
    const d = (Player.getX() - v[0]) ** 2 + (Player.getY() - v[1]) ** 2 + (Player.getZ() - v[2]) ** 2;
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
    if (d <= 100) return --v[4] > 0;
    return true;
  });

  targetLoc = closest;
});
const renderArrowOvReg = reg('renderOverlay', () => {
  if (targetLoc) drawArrow3DPos(settings.dianaArrowToBurrowColor, targetLoc[0], targetLoc[1] + 1, targetLoc[2], false);
}).setEnabled(new StateProp(settings._preferUseTracer).not().and(settings._dianaArrowToBurrow));
const renderArrowWrldReg = reg('renderWorld', () => {
  if (targetLoc) renderTracer(settings.dianaArrowToBurrowColor, targetLoc[0], targetLoc[1] + 1, targetLoc[2], { lw: 3, phase: true });
}).setEnabled(new StateProp(settings._preferUseTracer).and(settings._dianaArrowToBurrow));

const startBurrowReg = reg('chat', () => {
  if (unloadReg.isRegistered()) return;

  removeClosestReg.register();
  burrowSpawnReg.register();
  burrowDigReg.register();
  burrowResetReg.register();
  renderTargetsReg.register();
  soundPlayReg.register();
  spawnPartReg.register();
  armorStandReg.register();
  renderGuessReg.register();
  tickReg.register();
  renderArrowOvReg.register();
  renderArrowWrldReg.register();
  unloadReg.register();
}).setCriteria('&r&eYou dug out a Griffin Burrow! &r&7(1/4)&r');
const unloadReg = reg('worldUnload', () => {
  removeClosestReg.unregister();
  burrowSpawnReg.unregister();
  burrowDigReg.unregister();
  burrowResetReg.unregister();
  renderTargetsReg.unregister();
  soundPlayReg.unregister();
  spawnPartReg.unregister();
  armorStandReg.unregister();
  renderGuessReg.unregister();
  tickReg.unregister();
  renderArrowOvReg.unregister();
  renderArrowWrldReg.unregister();
  unloadReg.unregister();

  targetLoc = null;
  resetGuess();
  prevGuesses = [];
  burrows = [];
});

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