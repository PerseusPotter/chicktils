import settings from '../settings';
import data from '../data';
import reg from '../util/registerer';
import { log } from '../util/log';
import createAlert from '../util/alert';
import { drawArrow3DPos, renderBeaconBeam, renderString, renderTracer, renderWaypoint } from '../util/draw';
import { dist, fastDistance, linReg, lineRectColl } from '../util/math';
import { execCmd } from '../util/format';
import { StateProp, StateVar } from '../util/state';
import { getBlockPos, getItemId, getLowerContainer } from '../util/mc';
import { JavaTypeOrNull } from '../util/polyfill';

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
let targetLoc = null;
let guessLoc = null;
const renderArrowOvReg = reg('renderOverlay', () => {
  const l = targetLoc || guessLoc;
  if (l) drawArrow3DPos(settings.dianaArrowToBurrowColor, l[0], l[1] + 1, l[2], false);
}).setEnabled(new StateProp(settings._preferUseTracer).not().and(settings._dianaArrowToBurrow));
const renderArrowWrldReg = reg('renderWorld', () => {
  const l = targetLoc || guessLoc;
  if (l) renderTracer(settings.dianaArrowToBurrowColor, l[0], l[1] + 1, l[2], false);
}).setEnabled(new StateProp(settings._preferUseTracer).and(settings._dianaArrowToBurrow));
const renderWrldReg = reg('renderWorld', () => {
  if (guessLoc) {
    renderWaypoint(guessLoc[0], guessLoc[1], guessLoc[2], 1, 1, settings.dianaGuessFromParticlesColor, true, true);
    renderBeaconBeam(guessLoc[0], guessLoc[1] + 1, guessLoc[2], settings.dianaGuessFromParticlesColor, settings.useScuffedBeacon, true, true);
    // renderString('GUESS', guessLoc[0], guessLoc[1] + 1.5, guessLoc[2]);
  }
}).setEnabled(settings._dianaGuessFromParticles);
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

let prevSounds = [];
let prevParticles = [];
const guessDir = [];
let lastGuessTime = 0;
let guessD = 0;
function updateGuess() {
  if (prevParticles.length === 0) return;
  let gx = prevParticles[0].getX() + guessDir[0] * guessD;
  let gz = prevParticles[0].getZ() + guessDir[1] * guessD;
  let gy = 100;
  let topBlock;
  while (gy >= 60) {
    let i = World.getBlockAt(Math.floor(gx), gy, Math.floor(gz)).type.getID();
    if (!topBlock && i !== 0) topBlock = gy;
    if (i === 2) break;
    gy--;
  }
  guessLoc = [gx + 0.5, (gy < 60 ? (topBlock || 70) : gy), gz + 0.5];
}
const soundPlayReg = reg('soundPlay', (pos, name, vol, pit, cat, evn) => {
  if (vol !== 1 || name !== 'note.harp') return;
  const t = Date.now();
  if (t - lastGuessTime > 3_000) {
    prevSounds = [];
    prevParticles = [];
  }

  let pX;
  let pY;
  let pZ;
  if (prevSounds.length === 0) {
    const lastBurrow = GriffinBurrows.INSTANCE.getLastDugParticleBurrow();
    if (lastBurrow) ({ x: pX, y: pY, z: pY } = getBlockPos(lastBurrow));

    if (pX === undefined || ((Player.getX() - pX) ** 2 + (Player.getY() - pY) ** 2 + (Player.getZ() - pZ) ** 2) > 25) {
      pX = Player.getX();
      pY = Player.getY();
      pZ = Player.getZ();
    }
  } else {
    pX = prevSounds[prevSounds.length - 1][0][0];
    pY = prevSounds[prevSounds.length - 1][0][1];
    pZ = prevSounds[prevSounds.length - 1][0][2];
  }
  if (dist(pX, pos.getX()) > (prevSounds.length ? 1 : 5) || dist(pY, pos.getY()) > (prevSounds.length ? 1.5 : 5) || dist(pZ, pos.getZ()) > (prevSounds.length ? 1 : 5)) return;

  if (prevParticles.length === 0) lastGuessTime = t;
  prevSounds.push([[pos.getX(), pos.getY(), pos.getZ()], pit]);
  if (prevSounds.length < 2) return;

  // https://github.com/Skytils/SkytilsMod/blob/d4c47a33db18187fd94cf7ecd297606500d4145e/src/main/kotlin/gg/skytils/skytilsmod/features/impl/events/GriffinBurrows.kt#L105
  const { r, b } = linReg(prevSounds.map((v, i) => [i, v[1]]));
  guessD = Math.E / b;
  updateGuess();
}).setEnabled(settings._dianaGuessFromParticles);
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const spawnPartReg = reg('spawnParticle', (part, id, evn) => {
  if (!id.equals(EnumParticleTypes.DRIP_LAVA)) return;
  const t = Date.now();
  if (t - lastGuessTime > 3_000) {
    prevSounds = [];
    prevParticles = [];
    lastGuessTime = t;
  }
  const prev = prevParticles[prevParticles.length - 1] || Player;
  if (dist(part.getX(), prev.getX()) > 2 || dist(part.getY(), prev.getY()) > 2 || dist(part.getZ(), prev.getZ()) > 2) return;

  if (prevParticles.length && prevParticles[prevParticles.length - 1].getX() - part.getX() === 0) return;
  prevParticles.push(part);
  if (prevParticles.length < 2) return;

  const { r, b } = linReg(prevParticles.slice(-5).map(v => [v.getX(), v.getZ()]));
  const m = Math.sign((prevParticles[prevParticles.length - 1].getX() - prevParticles[0].getX())) / Math.sqrt(1 + b * b);
  guessDir[0] = m;
  guessDir[1] = b * m;
  updateGuess();
}).setEnabled(settings._dianaGuessFromParticles);

const startBurrowReg = reg('chat', () => {
  if (unloadReg.isRegistered()) return;
  numNotStartBurrows = 0;
  numStartBurrows = 0;
  targetLoc = null;
  guessLoc = null;
  prevSounds = [];
  prevParticles = [];
  renderArrowOvReg.register();
  renderArrowWrldReg.register();
  renderWrldReg.register();
  tickReg.register();
  fixStReg.register();
  soundPlayReg.register();
  spawnPartReg.register();
  unloadReg.register();
}).setCriteria('&r&eYou dug out a Griffin Burrow! &r&7(1/4)&r');
const unloadReg = reg('worldUnload', () => {
  renderArrowOvReg.unregister();
  renderArrowWrldReg.unregister();
  renderWrldReg.unregister();
  tickReg.unregister();
  fixStReg.unregister();
  soundPlayReg.unregister();
  spawnPartReg.unregister();
  unloadReg.unregister();
  targetLoc = null;
  guessLoc = null;
});

const warpKey = new KeyBind('Diana Warp', data.dianaWarpKey, 'ChickTils');
warpKey.registerKeyRelease(() => {
  data.dianaWarpKey = warpKey.getKeyCode();
  const l = targetLoc || guessLoc;
  if (!l) return;
  if (data.unlockedHubWarps.filter(Boolean).length === 0) return log('open warps menu pweese (turn on paper icons, will look for heads later thx)');
  let best = null;
  let bestD = Math.hypot(Player.getX() - l[0], Player.getY() - l[1], Player.getZ() - l[2]);
  if (lineRectColl(Player.getX(), Player.getZ(), l[0], l[2], -60, 0, 90, 70)) bestD += 50;
  warps.forEach((v, i) => {
    if (!data.unlockedHubWarps[i]) return;
    let d = Math.hypot(l[0] - v.loc[0], l[1] - v.loc[1], l[2] - v.loc[2]) + v.cost;
    if (lineRectColl(v.loc[0], v.loc[1], l[0], l[2], -60, 0, 90, 70)) d += 50;
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