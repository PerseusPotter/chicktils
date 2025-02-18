import settings from '../settings';
import data from '../data';
import reg, { customRegs } from '../util/registerer';
import { log } from '../util/log';
import createAlert from '../util/alert';
import { drawArrow3DPos, renderBeaconBeam, renderParaCurve, renderString, renderTracer, renderWaypoint } from '../util/draw';
import { dist, fastDistance, geoMedian, gradientDescent, gradientDescentRestarts, linReg, lineRectColl, ndRegression, toPolynomial } from '../util/math';
import { execCmd } from '../util/format';
import { StateProp, StateVar } from '../util/state';
import { getItemId, getLowerContainer } from '../util/mc';
import { JavaTypeOrNull } from '../util/polyfill';
import { unrun } from '../util/threading';

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

const burrowFoundAlert = createAlert('Burrow Found');
let numNotStartBurrows = 0;
let numStartBurrows = 0;
/** @type {[number, number, number]?} */
let targetLoc = null;
const renderArrowOvReg = reg('renderOverlay', () => {
  if (targetLoc) drawArrow3DPos(settings.dianaArrowToBurrowColor, targetLoc[0], targetLoc[1] + 1, targetLoc[2], false);
}).setEnabled(new StateProp(settings._preferUseTracer).not().and(settings._dianaArrowToBurrow));
const renderArrowWrldReg = reg('renderWorld', () => {
  if (targetLoc) renderTracer(settings.dianaArrowToBurrowColor, targetLoc[0], targetLoc[1] + 1, targetLoc[2], false);
}).setEnabled(new StateProp(settings._preferUseTracer).and(settings._dianaArrowToBurrow));

const GriffinBurrows = JavaTypeOrNull('gg.skytils.skytilsmod.features.impl.events.GriffinBurrows');
// 0 repetition, clean code
const tickReg = reg('tick', () => {
  if (settings.dianaFixSkytils) {
    const guess = GriffinBurrows.BurrowEstimation.INSTANCE.getGuesses();
    if (settings.dianaPreferFinish) {
      if (guess.size() > 1) {
        let latest;
        let latestK;
        guess.forEach((k, v) => {
          if (!latest || v.compareTo(latest) > 0) {
            latest = v;
            latestK = k;
          }
        });
        guess.clear();
        guess.put(latestK, latest);
      }
    } else {
      let remove = [];
      guess.forEach(k => {
        if (
          (
            k.getZ() < -30 ?
              k.getX() < -230 :
              k.getX() < -300
          ) ||
          k.getX() > 210 ||
          k.getZ() < -240 ||
          k.getZ() > 210
        ) remove.push(k);
      });
      remove.forEach(v => guess.remove(v));
    }
  }

  let burrowCount = 0;
  let burrowSCount = 0;
  let closest;
  let closestD;
  GriffinBurrows.INSTANCE.getParticleBurrows().forEach((k, v) => {
    const t = v.getType();
    if (t === 0) return burrowSCount++;
    burrowCount++;
    if (!settings.dianaPreferFinish) return;
    const d = Math.hypot(Player.getX() - v.getX(), Player.getY() - v.getY(), Player.getZ() - v.getZ());
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
  });
  if (burrowCount > numNotStartBurrows) burrowFoundAlert.show(settings.dianaAlertFoundBurrowTime);
  else if (!settings.dianaAlertFoundBurrowNoStart && burrowSCount > numStartBurrows) burrowFoundAlert.show(settings.dianaAlertFoundBurrowTime);
  numNotStartBurrows = burrowCount;
  numStartBurrows = burrowSCount;
  if (closest) return targetLoc = [closest.getX() + 0.5, closest.getY(), closest.getZ() + 0.5];

  if (!settings.dianaPreferFinish) GriffinBurrows.INSTANCE.getParticleBurrows().forEach((k, v) => {
    const d = Math.hypot(Player.getX() - v.getX(), Player.getY() - v.getY(), Player.getZ() - v.getZ());
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
  });
  GriffinBurrows.BurrowEstimation.INSTANCE.getGuesses().forEach((k, v) => {
    const d = Math.hypot(Player.getX() - k.getX(), Player.getY() - k.getY(), Player.getZ() - k.getZ());
    if (!closest || d < closestD) {
      closest = k;
      closestD = d;
    }
  });
  if (closest) return targetLoc = [closest.getX() + 0.5, closest.getY(), closest.getZ() + 0.5];
  if (!settings.dianaPreferFinish) return targetLoc = null;
  GriffinBurrows.INSTANCE.getParticleBurrows().forEach((k, v) => {
    const d = Math.hypot(Player.getX() - v.getX(), Player.getY() - v.getY(), Player.getZ() - v.getZ());
    if (!closest || d < closestD) {
      closest = v;
      closestD = d;
    }
  });
  if (closest) targetLoc = [closest.getX() + 0.5, closest.getY(), closest.getZ() + 0.5];
  else targetLoc = null;
}).setEnabled(new StateVar(Boolean(GriffinBurrows)));

let spadeUseTime = 0;
/** @type {{ t: number, p: number }[]} */
let prevSounds = [];
/** @type {{ t: number, x: number, y: number, z: number }[]} */
let prevParticles = [];
/** @type {Map<'Average' | 'SplineDist1' | 'SplineDist2' | 'MLATDist1' | 'MLATDist2', [number, number, number]?>} */
let guessPos = new Map();
/** @type {[(t: number) => number, (t: number) => number, (t: number) => number]?} */
let splinePoly;
let prevGuessL = 0;
function getTickCount() {
  return customRegs.serverTick2.tick;
}
function resetGuess() {
  spadeUseTime = getTickCount();
  prevSounds = [];
  prevParticles = [];

  prevGuessL = 0;
  unrun(() => {
    guessPos.clear();
    splinePoly = null;
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
  const _splinePoly = [
    toPolynomial(splineCoeff[0]),
    toPolynomial(splineCoeff[1]),
    toPolynomial(splineCoeff[2])
  ];
  const { b: pitchB, a: pitchA } = linReg(pitches.map((v, i) => [i, v.p]));
  const dist1 = 2836.3513351166325 * pitchA + -1395.7763277125964;
  const dist2 = Math.E / pitchB;

  // newton-raphson dies for some reason, idk worked with node but tbh cba
  // const createSplineIntersectPoly = (function() {
  //   const a1 = splineCoeff[0][2];
  //   const a2 = splineCoeff[1][2];
  //   const a3 = splineCoeff[2][2];
  //   const b1 = splineCoeff[0][1];
  //   const b2 = splineCoeff[1][1];
  //   const b3 = splineCoeff[2][1];
  //   const c1 = splineCoeff[0][0];
  //   const c2 = splineCoeff[1][0];
  //   const c3 = splineCoeff[2][0];
  //   return function(dist) {
  //     return toPolynomial([
  //       c1 * c1 + c2 * c2 + c3 * c3 - dist * dist,
  //       2 * (b1 * c1 + b2 * c2 + b3 * c3),
  //       2 * (a1 * c1 + a2 * c2 + a3 * c3) + b1 * b1 + b2 * b2 + b3 * b3,
  //       2 * (a1 * b1 + a2 * b2 + a3 * b3),
  //       a1 * a1 + a2 * a2 + a3 * a3
  //     ]);
  //   };
  // }());
  // const splineIntPoly1 = createSplineIntersectPoly(dist1);
  // const splineIntPoly2 = createSplineIntersectPoly(dist2);
  // const splineIntTime1 = newtonRaphson(splineIntPoly1, 20);
  // const splineIntTime2 = newtonRaphson(splineIntPoly2, 20);
  const splineIntTime1 = gradientDescentRestarts(([t]) => -dist(dist1, Math.hypot(_splinePoly[0](t) - splineCoeff[0][0], _splinePoly[1](t) - splineCoeff[1][0], _splinePoly[2](t) - splineCoeff[2][0])), [[0, 500]])[0];
  const splineIntTime2 = gradientDescentRestarts(([t]) => -dist(dist2, Math.hypot(_splinePoly[0](t) - splineCoeff[0][0], _splinePoly[1](t) - splineCoeff[1][0], _splinePoly[2](t) - splineCoeff[2][0])), [[0, 500]])[0];
  guesses.set('SplineDist1', _splinePoly.map(v => v(splineIntTime1)));
  guesses.set('SplineDist2', _splinePoly.map(v => v(splineIntTime2)));

  {
    const poly = createPitchDistPoly(dist1);
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
    guesses.set('MLATDist1', gradientDescent(
      ([x, y, z]) => -particles.reduce((a, v, i) => a + dist(Math.hypot(v.x - x, v.y - y, v.z - z), poly(pitchA + i * pitchB)), 0),
      guesses.get('SplineDist1').slice(),
      [[-500, 500], [-500, 500], [-500, 500]]
    ));
  }
  {
    const poly = createPitchDistPoly(dist2);
    guesses.set('MLATDist2', gradientDescent(
      ([x, y, z]) => -particles.reduce((a, v, i) => a + dist(Math.hypot(v.x - x, v.y - y, v.z - z), poly(pitchA + i * pitchB)), 0),
      guesses.get('SplineDist2').slice(),
      [[-500, 500], [-500, 500], [-500, 500]]
    ));
  }

  guesses.set('Average', geoMedian(Array.from(guesses.values())));

  unrun(() => {
    splinePoly = _splinePoly;
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
  if (
    t - spadeUseTime >= 70 ||
    (
      prevSounds.length &&
      prevSounds[prevSounds.length - 1].p > pitch
    )
  ) resetGuess();
  prevSounds.push({
    t: t - spadeUseTime,
    p: pitch
  });
  updateGuesses();
}).setFilteredClass(net.minecraft.network.play.server.S29PacketSoundEffect).setEnabled(settings._dianaGuessFromParticles);
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
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

  prevParticles.push({
    t: getTickCount() - spadeUseTime,
    x: pack.func_149220_d(),
    y: pack.func_149226_e(),
    z: pack.func_149225_f()
  });
  updateGuesses();
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(settings._dianaGuessFromParticles);

const renderWrldReg = reg('renderWorld', () => {
  if (splinePoly) {
    renderParaCurve(
      settings.dianaGuessFromParticlesPathColor,
      t => splinePoly.map(v => v(t)),
      0, 20,
      60,
      true
    );
    renderParaCurve(
      settings.dianaGuessFromParticlesPathColor,
      t => splinePoly.map(v => v(t)),
      20, 500,
      40,
      true
    );
  }
  guessPos.forEach((v, k) => {
    if (!v) return;
    renderWaypoint(
      v[0], v[1], v[2],
      1, 1,
      settings[`dianaGuessFromParticles${k}Color`] ?? 0,
      true, true
    );
    renderBeaconBeam(
      v[0], v[1] + 1, v[2],
      settings[`dianaGuessFromParticles${k}Color`] ?? 0,
      settings.useScuffedBeacon,
      true, true
    );
    renderString(
      k,
      v[0], v[1] + 1, v[2],
      0xFFFFFFFF,
      true, 1, true, true, true
    );
  });
}).setEnabled(settings._dianaGuessFromParticles);

const startBurrowReg = reg('chat', () => {
  if (unloadReg.isRegistered()) return;

  renderArrowOvReg.register();
  renderArrowWrldReg.register();
  tickReg.register();
  fixStReg.register();
  soundPlayReg.register();
  spawnPartReg.register();
  renderWrldReg.register();
  unloadReg.register();
}).setCriteria('&r&eYou dug out a Griffin Burrow! &r&7(1/4)&r');
const unloadReg = reg('worldUnload', () => {
  renderArrowOvReg.unregister();
  renderArrowWrldReg.unregister();
  tickReg.unregister();
  fixStReg.unregister();
  soundPlayReg.unregister();
  spawnPartReg.unregister();
  renderWrldReg.unregister();
  unloadReg.unregister();

  numNotStartBurrows = 0;
  numStartBurrows = 0;
  targetLoc = null;
  prevSounds = [];
  prevParticles = [];
});

const warpKey = new KeyBind('Diana Warp', data.dianaWarpKey, 'ChickTils');
warpKey.registerKeyRelease(() => {
  data.dianaWarpKey = warpKey.getKeyCode();
  if (!targetLoc) return;
  if (data.unlockedHubWarps.filter(Boolean).length === 0) return log('open warps menu pweese (turn on paper icons, will look for heads later thx)');
  let best = null;
  let bestD = Math.hypot(Player.getX() - targetLoc[0], Player.getY() - targetLoc[1], Player.getZ() - targetLoc[2]);
  if (lineRectColl(Player.getX(), Player.getZ(), targetLoc[0], targetLoc[2], -60, 0, 90, 70)) bestD += 50;
  warps.forEach((v, i) => {
    if (!data.unlockedHubWarps[i]) return;
    let d = Math.hypot(targetLoc[0] - v.loc[0], targetLoc[1] - v.loc[1], targetLoc[2] - v.loc[2]) + v.cost;
    if (lineRectColl(v.loc[0], v.loc[1], targetLoc[0], targetLoc[2], -60, 0, 90, 70)) d += 50;
    if (d < bestD) {
      bestD = d;
      best = v.name;
    }
  });
  if (best) execCmd('warp ' + best);
});

const fixStReg = reg('command', () => {
  const guess = GriffinBurrows.BurrowEstimation.INSTANCE.getGuesses();
  if (guess.size() > 0) {
    let nearest;
    let nd = 0;
    guess.forEach(k => {
      const d = fastDistance(Player.getX() - k.getX(), Player.getZ() - k.getZ());
      if (!nearest || d < nd) {
        nd = d;
        nearest = k;
      }
    });
    guess.remove(nearest);
  }
}).setName('ctsmanualfixstdiana').setEnabled(new StateVar(Boolean(GriffinBurrows)));

export function init() {
  settings._dianaAlertFoundBurrowSound.listen(v => burrowFoundAlert.sound = v);
}
export function load() {
  warpOpenReg.register();
  startBurrowReg.register();
}
export function unload() {
  warpOpenReg.unregister();
  startBurrowReg.unregister();
  unloadReg.unregister();
  unloadReg.forceTrigger();
}