import reg, { customRegs } from '../util/registerer';
import settings from '../settings';
import { log } from '../util/log';
import { StateProp, StateVar } from '../util/state';
import { getBlockId } from '../util/mc';
import { unrun } from '../util/threading';
import { drawArrow3DPos, normColor } from '../util/draw';
import { renderBeacon, renderBoxFilled, renderBoxOutlineMiter, renderTracer } from '../../Apelles/index';
import { Deque, flatMap } from '../util/polyfill';

/** @type {StateVar<[number, number, number]?} */
const stateMonolithPosition = new StateVar();
const stateScanMonolith = new StateProp(stateMonolithPosition).not();

const MCBlockPos = Java.type('net.minecraft.util.BlockPos');
const offsets = flatMap(new Array(3).fill(0).map((_, i) => i - 1), v => new Array(3).fill(0).map((_, i) => [v, i - 1]));
/** @type {Deque<[number, number, number, any, boolean]>} */
const monolithPositions = new Deque(
  flatMap(
    [
      [-94, 201, -31],
      [-92, 221, -54],
      [-93, 221, -51, true],
      [-64, 206, -63],
      [-15, 236, -92],
      [-10, 162, 109],
      [0, 170, -2],
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
  if (disappearTime !== 0 && customRegs.serverTick2.tick - disappearTime < eggRespawnTime) return;
  if (remaining.length === 0) {
    log('&4no valid locations found, resetting');
    reset();
  }
  const w = World.getWorld();
  const iter = remaining.iter();
  let i = 0;
  const scanSize = Math.ceil(remaining.length / 20);
  while (!iter.done()) {
    let v = iter.value();
    if (i % scanSize === scanI && w.func_175668_a(v[3], false)) {
      if (getBlockId(w.func_180495_p(v[3]).func_177230_c()) === 122) stateMonolithPosition.set(v);
      else checked.push(v);
      iter.remove();
    }
    i++;
    iter.next();
  }

  scanI++;
  if (scanI >= scanSize) scanI = 0;
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
    disappearTime = customRegs.serverTick2.tick;
  }
}).setEnabled(stateMonolithPosition);
const hitReg = reg('hitBlock', block => {
  const egg = stateMonolithPosition.get();
  if (block.x === egg[0] && block.y === egg[1] && block.z === egg[2]) {
    reset();
    disappearTime = customRegs.serverTick2.tick;
  }
}).setEnabled(stateMonolithPosition);
const leaveReg = reg('worldUnload', () => {
  reset();
  disappearTime = -(eggRespawnTime - 20);
});

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
const renderReg = reg('renderWorld', () => {
  const egg = stateMonolithPosition.get();

  if (egg) {
    waypoint(settings.darkMonolithColor, egg[0], egg[1], egg[2], settings.darkMonolithEsp);

    if (settings.darkMonolithPointTo && settings.preferUseTracer) renderTracer(
      settings.darkMonolithColor,
      egg[0] + 0.5, egg[1], egg[2] + 0.5,
      { lw: 3, phase: settings.darkMonolithEsp }
    );
  }

  remaining.forEach(v => v[4] && waypoint(settings.darkMonolithPossibleColor, v[0], v[1], v[2], settings.darkMonolithEsp));
  checked.forEach(v => v[4] && waypoint(settings.darkMonolithScannedColor, v[0], v[1], v[2], settings.darkMonolithEsp));
});
const renderOvReg = reg('renderOverlay', () => {
  const egg = stateMonolithPosition.get();
  drawArrow3DPos(
    settings.darkMonolithColor,
    egg[0] + 0.5, egg[1], egg[2] + 0.5,
    false
  );
}).setEnabled(new StateProp(settings._preferUseTracer).not().and(stateMonolithPosition));

export function init() {
  settings._enabledarkmonolith.listen(v => v && Client.scheduleTask(() => log('seek therapy')));
}
export function load() {
  scanReg.register();
  fallingBlockReg.register();
  interactReg.register();
  hitReg.register();
  leaveReg.register();
  renderReg.register();
  renderOvReg.register();
}
export function unload() {
  reset();

  scanReg.unregister();
  fallingBlockReg.unregister();
  interactReg.unregister();
  hitReg.unregister();
  leaveReg.unregister();
  renderReg.unregister();
  renderOvReg.unregister();
}