import settings from '../../settings';
import data from '../../data';
import { renderString, getPartialServerTick } from '../../util/draw';
import createAlert from '../../util/alert';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import { getAveragePing } from '../../util/ping';
import createTextGui from '../../util/customtextgui';
import { log } from '../../util/log';
import { StateProp, StateVar } from '../../util/state';
import { getPlayers, registerTrackPlayers, stateFloor, stateIsInBoss } from '../dungeon.js';

const stateDragonHelper = new StateProp(stateFloor).equals('M7').and(stateIsInBoss).and(settings._dungeonDragonHelper);
const stateInP5 = new StateVar(false);
const stateDragonHelperActive = stateDragonHelper.and(stateInP5);

const spawnedDrags = new Map();
const spawnAlert = createAlert('', 5, settings.dungeonDragonHelperAlertSound);
let dragonCount = 0;
const timerHud = createTextGui(() => data.dragonHelperTimer, () => ['&24269']);
const DRAGONS = {
  r: {
    color: '&c',
    pos: [32, 20, 59],
    name: 'POWER'
  },
  o: {
    color: '&6',
    pos: [80, 20, 56],
    name: 'FLAME'
  },
  b: {
    color: '&b',
    pos: [79, 20, 94],
    name: 'ICE'
  },
  p: {
    color: '&d',
    pos: [56, 20, 128],
    name: 'SOUL'
  },
  g: {
    color: '&a',
    pos: [32, 20, 94],
    name: 'APEX'
  }
};

const tickReg = reg('tick', () => stateInP5.set(Player.getY() < 30)).setEnabled(stateDragonHelper);
function getSplitDrag(d1, d2, bersTeam, prio, role) {
  const i1 = prio.indexOf(d1);
  const i2 = prio.indexOf(d2);
  if (bersTeam.includes(role)) return i1 < i2 ? d1 : d2;
  return i1 > i2 ? d1 : d2;
}
function addDragon(c) {
  if (spawnedDrags.has(c)) return;
  spawnedDrags.set(c, 100);

  let dragD = DRAGONS[c];
  if (++dragonCount === 2) {
    if (settings.dungeonDragonHelperAlert === 'None') return;
    const drags = Array.from(spawnedDrags.keys());
    const role = getPlayers()[0]?.['class'];
    if (!role) return log('&4failed to parse class');
    const drag = getSplitDrag(
      drags[0], drags[1],
      settings.dungeonDragonHelperSplit ? settings.dungeonDragonHelperBersTeam : 'bmhat',
      settings.dungeonDragonHelperSplit ? settings.dungeonDragonHelperPrioS : settings.dungeonDragonHelperPrioNS,
      role[0].toLowerCase()
    );
    dragD = DRAGONS[drag];
  } else if (settings.dungeonDragonHelperAlert !== 'All') return;

  spawnAlert.text = `&l${dragD.color}${dragD.name}`;
  spawnAlert.show(settings.dungeonDragonHelperAlertTime);
}
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const partSpawnReg = reg('packetReceived', pack => {
  if (
    pack.func_149222_k() !== 20 ||
    pack.func_149226_e() !== 19 ||
    !pack.func_179749_a().equals(EnumParticleTypes.FLAME) ||
    pack.func_149221_g() !== 2 ||
    pack.func_149224_h() !== 3 ||
    pack.func_149223_i() !== 2 ||
    pack.func_149227_j() !== 0 ||
    !pack.func_179750_b()
  ) return;

  const x = Math.trunc(pack.func_149220_d());
  const z = Math.trunc(pack.func_149225_f());
  if (x >= 27 && x <= 32) {
    if (z === 59) addDragon('r');
    else if (z === 94) addDragon('g');
  } else if (x >= 79 && x <= 85) {
    if (z === 94) addDragon('b');
    else if (z === 56) addDragon('o');
  } else if (x === 56) addDragon('p');
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(stateDragonHelperActive);
const serverTickReg = reg('serverTick2', () => {
  spawnedDrags.forEach((v, k) => {
    if (v > -60) spawnedDrags.set(k, v - 1);
    else spawnedDrags.delete(k);
  });
}).setEnabled(stateDragonHelperActive);
const renderWorldReg = reg('renderWorld', () => {
  spawnedDrags.forEach((v, k) => {
    if (v < 0) return;
    const drag = DRAGONS[k];
    const t = (v - getPartialServerTick() - getAveragePing() / 50) * 50;
    renderString(`${colorForNumber(t, 5000)}${t.toFixed(0)}`, drag.pos[0], drag.pos[1], drag.pos[2], 0xFFFFFFFF, false, 0.2, false);
  });
}).setEnabled(stateDragonHelperActive.and(settings._dungeonDragonHelperTimer3D));
const renderOverlayReg = reg('renderOverlay', () => {
  const ticks = spawnedDrags.values().next().value;
  if (!ticks || ticks < 0) return;

  const t = (ticks - getPartialServerTick() - getAveragePing() / 50) * 50;
  timerHud.setLine(colorForNumber(t, 5000) + t.toFixed(0));
  timerHud.render();
}).setEnabled(stateDragonHelperActive.and(settings._dungeonDragonHelperTimer2D));

export function init() {
  registerTrackPlayers(stateDragonHelper);

  settings._dungeonDragonHelperAlertSound.listen(v => spawnAlert.sound = v);
  settings._moveDragonHelperTimer.onAction(() => timerHud.edit());
  function checkPrio(v, o) {
    if (v.length === 5 && v.split('').sort().join('') === 'bgopr') return;
    log('&4invalid prio, it should only contain each of the characters "bgopr" exactly once (case sensitive)');
    this.set(o);
  }
  settings._dungeonDragonHelperPrioS.listen(checkPrio);
  settings._dungeonDragonHelperPrioNS.listen(checkPrio);
  settings._dungeonDragonHelperBersTeam.listen(function(v, o) {
    if (!/[^bmhat]/.test(v)) return;
    log('&4invalid team, it should only contain the characters "bmhat" (case sensitive)');
    this.set(o);
  });
}
export function start() {
  stateInP5.set(false);
  spawnedDrags.clear();
  dragonCount = 0;

  tickReg.register();
  partSpawnReg.register();
  serverTickReg.register();
  renderWorldReg.register();
  renderOverlayReg.register();
}
export function reset() {
  tickReg.unregister();
  partSpawnReg.unregister();
  serverTickReg.unregister();
  renderWorldReg.unregister();
  renderOverlayReg.unregister();
}