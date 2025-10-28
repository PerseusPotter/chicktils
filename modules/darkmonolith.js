import reg, { customRegs } from '../util/registerer';
import settings from '../settings';
import { log } from '../util/log';
import { StateProp, StateVar } from '../util/state';
import { getBlockId } from '../util/mc';
import { unrun } from '../util/threading';
import { normColor } from '../util/draw';
import { renderBeacon, renderBoxFilled, renderBoxOutlineMiter } from '../../Apelles/index';
import { Deque, flatMap } from '../util/polyfill';
import data from '../data';
import { commaNumber } from '../util/format';
import createTextGui from '../util/customtextgui';
import createPointer from '../util/pointto';
import { registerListenIsland, stateIsland } from '../util/skyblock';

/** @type {StateVar<[number, number, number]?} */
const stateMonolithPosition = new StateVar();
const stateInMines = new StateProp(stateIsland).equals('Dwarven Mines');
const stateHasMonolith = new StateProp(stateInMines).and(stateMonolithPosition);
const stateScanMonolith = new StateProp(stateMonolithPosition).not().and(stateInMines);
const stateTrackDrops = new StateProp(stateInMines).and(settings._darkMonolithTrackDrops);

const MCBlockPos = Java.type('net.minecraft.util.BlockPos');
const offsets = flatMap(new Array(3).fill(0).map((_, i) => i - 1), v => new Array(3).fill(0).map((_, i) => [v, i - 1]));
/** @type {Deque<[number, number, number, any, boolean]>} */
const monolithPositions = new Deque(
  flatMap(
    [
      [-94, 201, -31],
      [-92, 221, -54],
      [-93, 221, -51, true],
      [-64, 206, -64],
      [-15, 236, -92],
      [-10, 162, 109],
      [0, 170, -2],
      [0, 170, 0, true],
      [1, 183, 24],
      [49, 202, -162],
      [56, 214, -25],
      [61, 204, 181],
      [77, 160, 163],
      [91, 187, 131],
      [128, 187, 58],
      [150, 196, 190]
    ],
    p => offsets
      .map((o, i) => [p[0] + o[0], p[1], p[2] + o[1], !p[3] && i === 4])
      .map(v => [v[0], v[1], v[2], new MCBlockPos(v[0], v[1], v[2]), v[3]])
  )
);
let remaining = monolithPositions.slice();
let checked = [];
let disappearTime = 0;
function reset() {
  stateMonolithPosition.set(null);
  if (remaining.length !== monolithPositions.length) remaining = monolithPositions.slice();
  checked = [];
  disappearTime = 0;
}

let scanI = 0;
// wiki says it's 10s, i think it's 3 minutes and so does a guy on the forums 4 years go
const eggRespawnTime = 200 + 20;
const scanReg = reg('tick', () => {
  if (disappearTime !== 0 && customRegs.serverTick.tick - disappearTime < eggRespawnTime) return;
  if (remaining.length === 0) {
    log('&4no valid locations found, resetting');
    reset();
  }
  const w = World.getWorld();
  const iter = remaining.iter();
  let i = 0;
  while (!iter.done()) {
    let v = iter.value();
    if (i % settings.darkMonolithScanDelay === scanI && w.func_175668_a(v[3], false)) {
      if (getBlockId(w.func_180495_p(v[3]).func_177230_c()) === 122) stateMonolithPosition.set(v);
      else checked.push(v);
      iter.remove();
    }
    i++;
    iter.next();
  }

  scanI++;
  if (scanI >= settings.darkMonolithScanDelay) scanI = 0;
}).setEnabled(stateScanMonolith);
const fallingBlockReg = reg('packetReceived', pack => {
  if (pack.func_148993_l() !== 70) return;
  if ((pack.func_149009_m() & 4095) !== 122) return;
  const x = Math.floor(pack.func_148997_d() / 32);
  const z = Math.floor(pack.func_148994_f() / 32);
  unrun(() => {
    stateMonolithPosition.set(monolithPositions.find(v => x === v[0] && z === v[2]));
  });
}).setFilteredClass(net.minecraft.network.play.server.S0EPacketSpawnObject).setEnabled(stateScanMonolith);
const PlayerInteractAction = Java.type('com.chattriggers.ctjs.minecraft.listeners.ClientListener').PlayerInteractAction;

const interactReg = reg('playerInteract', (action, pos) => {
  if (!action.equals(PlayerInteractAction.RIGHT_CLICK_BLOCK)) return;
  const egg = stateMonolithPosition.get();
  if (pos.x === egg[0] && pos.y === egg[1] && pos.z === egg[2]) {
    reset();
    disappearTime = customRegs.serverTick.tick;
  }
}).setEnabled(stateHasMonolith);
const hitReg = reg('hitBlock', block => {
  const egg = stateMonolithPosition.get();
  if (block.x === egg[0] && block.y === egg[1] && block.z === egg[2]) {
    reset();
    disappearTime = customRegs.serverTick.tick;
  }
}).setEnabled(stateHasMonolith);
const leaveReg = reg('worldUnload', () => {
  reset();
  disappearTime = -(eggRespawnTime - 20);
}).setEnabled(stateInMines);

function waypoint(col, x, y, z, p) {
  const rgba = normColor(col);
  renderBoxOutlineMiter(
    rgba,
    x, y, z,
    1, 1, 0.2,
    { centered: false, phase: p }
  );
  renderBoxFilled(
    [rgba[0], rgba[1], rgba[2], rgba[3] / 4],
    x, y, z,
    1, 1,
    { centered: false, phase: p }
  );
  renderBeacon(
    col,
    x, y, z,
    { centered: false, phase: p }
  );
}
const pointReg = createPointer(
  settings._darkMonolithColor,
  () => [egg[0] + 0.5, egg[1], egg[2] + 0.5],
  {
    phase: settings._darkMonolithEsp,
    enabled: new StateProp(stateHasMonolith).and(settings._darkMonolithPointTo)
  }
);
const renderReg = reg('renderWorld', () => {
  const egg = stateMonolithPosition.get();

  if (egg) waypoint(settings.darkMonolithColor, egg[0], egg[1], egg[2], settings.darkMonolithEsp);

  remaining.forEach(v => v[4] && waypoint(settings.darkMonolithPossibleColor, v[0], v[1], v[2], settings.darkMonolithEsp));
  checked.forEach(v => v[4] && waypoint(settings.darkMonolithScannedColor, v[0], v[1], v[2], settings.darkMonolithEsp));
}).setEnabled(stateInMines);

const trackerGui = createTextGui(() => data.monolithTracker, () => formatDrops());

const drop1Reg = reg('chat', () => { data.monolithPowder += 100; data.monolithCount++; }).setCriteria('&r&5&lMONOLITH! &r&aYou found a mysterious &r&5Dark Monolith &r&aand were rewarded &r&2100 ᠅ Mithril Powder&r&a!&r').setEnabled(stateTrackDrops);
const drop2Reg = reg('chat', () => { data.monolithCoins += 50_000; data.monolithCount++; }).setCriteria('&r&5&lMONOLITH! &r&aYou found a mysterious &r&5Dark Monolith &r&aand were rewarded &r&650,000 Coins&r&a!&r').setEnabled(stateTrackDrops);
const drop3Reg = reg('chat', () => { data.monolithPowder += 1_000; data.monolithCoins += 2_500; data.monolithCount++; }).setCriteria('&r&5&lMONOLITH! &r&aYou found a mysterious &r&5Dark Monolith &r&aand were rewarded &r&62,500 Coins &r&aand &r&21,000 ᠅ Mithril Powder&r&a!&r').setEnabled(stateTrackDrops);
const drop4Reg = reg('chat', () => { data.monolithPowder += 3_000; data.monolithCount++; }).setCriteria('&r&5&lMONOLITH! &r&aYou found a mysterious &r&5Dark Monolith &r&aand were rewarded &r&23,000 ᠅ Mithril Powder&r&a!&r').setEnabled(stateTrackDrops);
const drop5Reg = reg('chat', () => { data.monolithFish++; data.monolithCount++; }).setCriteria('&r&5&lMONOLITH! &r&aYou found a mysterious &r&5Dark Monolith &r&aand were rewarded &r&cRock the Fish&r&a!&r').setEnabled(stateTrackDrops);
function formatDrops() {
  return [
    `&6${commaNumber(data.monolithCoins)} Coins`,
    `&2${commaNumber(data.monolithPowder)} Powder`,
    `&c${commaNumber(data.monolithFish)} 🪨🐟`,
    `&3Monolith x${commaNumber(data.monolithCount)}`
  ];
}
const renderTrackerReg = reg('renderOverlay', () => {
  trackerGui.setLines(formatDrops());
  trackerGui.render();
}).setEnabled(settings._darkMonolithTrackDrops);

export function init() {
  settings._enabledarkmonolith.listen(v => v && Client.scheduleTask(() => log('seek therapy')));
  registerListenIsland(settings._enabledarkmonolith);
  settings._moveDarkMonolithDropsTracker.onAction(v => trackerGui.edit(v));
  settings._resetDarkMonolithDropsTracker.onAction(() => {
    data.monolithCoins = 0;
    data.monolithPowder = 0;
    data.monolithFish = 0;
    data.monolithCount = 0;
  });
}
export function load() {
  scanReg.register();
  fallingBlockReg.register();
  interactReg.register();
  hitReg.register();
  leaveReg.register();
  renderReg.register();
  pointReg.register();
  drop1Reg.register();
  drop2Reg.register();
  drop3Reg.register();
  drop4Reg.register();
  drop5Reg.register();
  renderTrackerReg.register();
}
export function unload() {
  reset();

  scanReg.unregister();
  fallingBlockReg.unregister();
  interactReg.unregister();
  hitReg.unregister();
  leaveReg.unregister();
  renderReg.unregister();
  pointReg.unregister();
  drop1Reg.unregister();
  drop2Reg.unregister();
  drop3Reg.unregister();
  drop4Reg.unregister();
  drop5Reg.unregister();
  renderTrackerReg.unregister();
}