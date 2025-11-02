import { getRenderX, getRenderY, getRenderZ, renderBeacon, renderBillboard } from '../../Apelles/index';
import data from '../data';
import settings from '../settings';
import createAlert, { alertSound } from '../util/alert';
import createTextGui from '../util/customtextgui';
import { getPartialServerTick, renderWaypoint } from '../util/draw';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import { getBlockId, getEyeHeight } from '../util/mc';
import createPointer from '../util/pointto';
import { Deque } from '../util/polyfill';
import reg, { customRegs } from '../util/registerer';
import { registerListenIsland, stateIsland } from '../util/skyblock';
import { AtomicStateVar, StateProp, StateVar } from '../util/state';

const MCBlockPos = Java.type('net.minecraft.util.BlockPos');
/** @type {Deque<[number, number, number, any]>} */
const golemPositions = new Deque([
  [-644, 4, -269],
  [-689, 4, -273],
  [-727, 4, -284],
  [-678, 4, -332],
  [-649, 4, -219],
  [-639, 4, -328]
].map(v => [v[0], v[1], v[2], new MCBlockPos(v[0], v[1], v[2])]));
const stateInEnd = new StateProp(stateIsland).equals('The End');

const stateIsSpawning = new AtomicStateVar(false);
/** @type {StateVar<[number, number, number]?} */
const stateGolemPosition = new StateVar();
const stateGolemHeight = new AtomicStateVar(0);
const stateCanHaveGolem = new StateProp(stateGolemHeight).notequals(0).and(stateInEnd);
const cmpShouldShowSpawning = (a, b) => a === 'Always' || (a === 'Spawning' && b);
const statePointTo = new StateProp(settings._golemTilsPointTo).customBinary(stateIsSpawning, cmpShouldShowSpawning);
const stateAim = new StateProp(settings._golemTilsPrefireAim).customBinary(stateIsSpawning, cmpShouldShowSpawning).and(stateCanHaveGolem);
/** @type {[number, number, number][]} */
let checked = [];
let remaining = golemPositions.slice();
let scanDelay = 0;
let spawnTime = 0;
const spawnAlert = createAlert('&cGolem Spawning!', 5, false);
stateIsSpawning.listen(v => {
  if (!v) return;
  spawnTime = customRegs.serverTick.tick;
  if (settings.golemTilsSpawnAlert) {
    spawnAlert.show(settings.golemTilsSpawnAlertTime);
    for (let i = 0; i < settings.golemTilsSpawnAlertSound; i++) {
      Client.scheduleTask(i * 5, () => {
        alertSound.stop();
        alertSound.play();
      });
    }
  }
});
const spawnTimerHud = createTextGui(() => data.golemTilsSpawnLoc, () => [colorForNumber(6.90, 20) + '6.90s']);

function reset() {
  stateGolemPosition.set(null);
  if (remaining.length !== golemPositions.length) remaining = golemPositions.slice();
  checked = [];
  stateIsSpawning.set(false);
  scanDelay = 2;
}

const golemHeights = {
  'Resting': 0,
  'Dormant': 1,
  'Agitated': 2,
  'Disturbed': 3,
  'Awakening': 4,
  'Summoned': 5
};
let lastNotifiedStage = -1;
const golemStateReg = reg('packetReceived', pack => {
  if (['ADD_PLAYER', 'UPDATE_DISPLAY_NAME'].includes(pack.func_179768_b().name())) {
    const entries = pack.func_179767_a();
    if (entries.length !== 1) return;
    const txt = entries[0]?.func_179961_d()?.func_150260_c();
    if (txt && txt.startsWith(' Protector: ')) {
      const h = golemHeights[txt.slice(12)] ?? 0;

      if (h === 5) stateIsSpawning.set(true);
      stateGolemHeight.set(h);

      if (h !== lastNotifiedStage) log(`&agolem is stage ${h}/5`);
      lastNotifiedStage = h;
    }
  }
}).setFilteredClass(net.minecraft.network.play.server.S38PacketPlayerListItem).setEnabled(stateInEnd);

const scanReg = reg('tick', () => {
  if (--scanDelay >= 0) return;
  if (remaining.length === 0) {
    log('&4no valid locations found, resetting');
    reset();
    scanDelay = 20;
    return;
  }
  const w = World.getWorld();
  const iter = remaining.iter();
  const h = stateGolemHeight.get();
  while (!iter.done()) {
    let v = iter.value();
    if (w.func_175668_a(v[3], false)) {
      let found = false;
      let id = getBlockId(w.func_180495_p(new MCBlockPos(v[0], v[1] + h, v[2])).func_177230_c());
      if (id === 144) {
        stateGolemPosition.set([v[0], v[1] + h, v[2]]);
        found = true;
        break;
      }
      if (!found) checked.push(v);
      iter.remove();
    }
    iter.next();
  }
}).setEnabled(new StateProp(stateGolemPosition).not().and(stateCanHaveGolem));
const golemSpawnReg = reg('chat', () => stateIsSpawning.set(true)).setCriteria('&r&c&lThe ground begins to shake as an End Stone Protector rises from below!&r').setEnabled(stateInEnd);
const leaveReg = reg('worldUnload', () => {
  reset();
  lastNotifiedStage = -1;
});

const renderReg = reg('renderWorld', () => {
  const pos = stateGolemPosition.get();

  if (pos) {
    renderWaypoint(pos[0], pos[1], pos[2], 1, 1, settings.golemTilsColor, settings.golemTilsEsp, false);
    renderBeacon(settings.golemTilsColor, pos[0], pos[1] + 1, pos[2], { centered: false, phase: settings.golemTilsEsp });
  } else {
    remaining.forEach(v => renderWaypoint(v[0], v[1], v[2], 1, 1, settings.golemTilsPossibleColor, settings.golemTilsEsp, false));
    checked.forEach(v => renderWaypoint(v[0], v[1], v[2], 1, 1, settings.golemTilsScannedColor, settings.golemTilsEsp, false));
  }
}).setEnabled(stateCanHaveGolem);
const pointGolemReg = createPointer(
  settings._golemTilsColor,
  () => {
    const pos = stateGolemPosition.get();
    return [pos[0] + 0.5, pos[1], pos[2] + 0.5];
  },
  {
    enabled: new StateProp(stateGolemPosition).and(statePointTo).and(stateCanHaveGolem),
    phase: settings._golemTilsEsp
  }
);
const renderTimerReg = reg('renderOverlay', () => {
  const ticks = spawnTime + 400 - customRegs.serverTick.tick;
  if (ticks < 0) return;

  const time = (ticks - getPartialServerTick()) / 20;
  spawnTimerHud.setLine(colorForNumber(time, 20) + time.toFixed(2) + 's');

  spawnTimerHud.render();
}).setEnabled(new StateProp(stateIsSpawning).and(settings._golemTilsSpawnTimer));

let prefireP = 0;
let prefireT = 0;
const ProjectileHelper = Java.type('com.perseuspotter.chicktilshelper.ProjectileHelper');
const pointCalcReg = reg('renderWorld', () => {
  const pos = stateGolemPosition.get();
  if (!pos) return;
  const aim = ProjectileHelper.solve(
    (pos[0] - 1) - getRenderX(),
    5 - (getRenderY() + getEyeHeight()),
    (pos[2] - 2) - getRenderZ(),
    0.001, -0.05, 3, 0.99, true
  );
  prefireP = aim.phi;
  prefireT = aim.theta;
  if (Number.isNaN(prefireP)) return;

  const x = getRenderX() + Math.sin(prefireP) * Math.cos(prefireT);
  const y = getRenderY() + Math.cos(prefireP) + getEyeHeight();
  const z = getRenderZ() + Math.sin(prefireP) * Math.sin(prefireT);

  renderBillboard(
    settings.golemTilsPrefireAimColor,
    x, y, z,
    0.005, 0.005,
    { phase: true }
  );
}).setEnabled(stateAim);
const pointPrefireReg = createPointer(
  settings._golemTilsPrefireAimColor,
  () => [
    getRenderX() + Math.sin(prefireP) * Math.cos(prefireT),
    getRenderY() + Math.cos(prefireP) + getEyeHeight(),
    getRenderZ() + Math.sin(prefireP) * Math.sin(prefireT)
  ],
  {
    enabled: stateAim,
    req: () => !Number.isNaN(prefireP) && stateGolemPosition.get()
  }
);

export function init() {
  registerListenIsland(settings._enablegolemtils);
  settings._moveGolemTilsSpawnTimer.onAction(v => spawnTimerHud.edit(v));
}
export function load() {
  golemStateReg.register();
  scanReg.register();
  golemSpawnReg.register();
  leaveReg.register();
  renderReg.register();
  pointGolemReg.register();
  renderTimerReg.register();
  pointCalcReg.register();
  pointPrefireReg.register();
}
export function unload() {
  reset();
  stateGolemHeight.set(0);
  lastNotifiedStage = -1;

  golemStateReg.unregister();
  scanReg.unregister();
  golemSpawnReg.unregister();
  leaveReg.unregister();
  renderReg.unregister();
  pointGolemReg.unregister();
  renderTimerReg.unregister();
  pointCalcReg.unregister();
  pointPrefireReg.unregister();
}