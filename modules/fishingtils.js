import settings from '../settings';
import { drawArrow3DPos, renderBeaconBeam, renderTracer } from '../util/draw';
import Grid from '../util/grid';
import { compareFloat } from '../util/math';
import reg from '../util/registerer';
import { StateProp, StateVar } from '../util/state';

let hotspots = [];
let newHotspots = [];
const stateNearestHotspot = new StateVar();
const stateHotspotDist = new StateVar(0);

const hotspotUpdateReg = reg('step', () => {
  try {
    const a = newHotspots;
    newHotspots = [];
    const hotspotGrid = new Grid({ size: 3, addNeighbors: 2 });
    const hotspotLocs = [];
    a.forEach(v => {
      const neighbors = hotspotGrid.get(v[0], v[2]);
      let idx = neighbors[0] ?? (
        hotspotGrid.add(v[0], v[2], hotspotLocs.length),
        hotspotLocs.push([0, 0, 0, 0]) - 1
      );
      hotspotLocs[idx][0] += v[0];
      hotspotLocs[idx][1] += v[1];
      hotspotLocs[idx][2] += v[2];
      hotspotLocs[idx][3]++;
    });
    hotspots = hotspotLocs.map(v => [v[0] / v[3], v[1] / v[3], v[2] / v[3]]);
    const [nearest, dist] = hotspots.reduce((a, v) => {
      const d = Math.hypot(Player.getX() - v[0], Player.getZ() - v[2]);
      if (d < a[1]) return [v, d];
      return a;
    }, [[NaN, NaN, NaN], Number.POSITIVE_INFINITY]);
    stateNearestHotspot.set(nearest);
    stateHotspotDist.set(dist);
  } catch (_) { }
}).setEnabled(settings._fishingTilsHotspotWaypoint).setFps(5);
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const hotspotPartReg = reg('packetReceived', pack => {
  if (pack.func_179749_a().equals(EnumParticleTypes.REDSTONE)) {
    if (pack.func_149222_k() !== 0) return;
    if (pack.func_149227_j() !== 1) return;
    if (!pack.func_179750_b()) return;
    if (pack.func_149221_g() !== 1) return;
    if (compareFloat(pack.func_149224_h(), 0.4117647409439087) !== 0) return;
    if (compareFloat(pack.func_149223_i(), 0.7058823704719543) !== 0) return;
  } else if (pack.func_179749_a().equals(EnumParticleTypes.SMOKE_NORMAL)) {
    if (pack.func_149227_j() !== 0) return;
    if (!pack.func_179750_b()) return;
    if (pack.func_149221_g() !== 0) return;
    if (pack.func_149224_h() !== 0) return;
    if (pack.func_149223_i() !== 0) return;
  } else return;

  const x = pack.func_149220_d();
  const y = pack.func_149226_e();
  const z = pack.func_149225_f();
  newHotspots.push([x, y, z]);
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(settings._fishingTilsHotspotWaypoint);

const stateInHotspotRange = new StateProp(stateHotspotDist).customBinary(settings._fishingTilsHotspotWaypointDisableRange, (d, s) => d > s).and(settings._fishingTilsHotspotWaypoint);
const hotspotRenderReg = reg('renderWorld', () => {
  hotspots.forEach(v => {
    renderBeaconBeam(
      v[0], v[1], v[2],
      settings.fishingTilsHotspotWaypointColor,
      settings.useScuffedBeacon,
      true
    );
  })
}).setEnabled(stateInHotspotRange);
const hotspotArrowOvlReg = reg('renderOverlay', () => {
  drawArrow3DPos(
    settings.fishingTilsHotspotWaypointColor,
    stateNearestHotspot.get()[0], stateNearestHotspot.get()[1], stateNearestHotspot.get()[2],
    false
  );
}).setEnabled(stateInHotspotRange.and(stateNearestHotspot).and(new StateProp(settings._preferUseTracer).not()));
const hotspotArrowWrdReg = reg('renderWorld', () => {
  renderTracer(
    settings.fishingTilsHotspotWaypointColor,
    stateNearestHotspot.get()[0], stateNearestHotspot.get()[1], stateNearestHotspot.get()[2],
    false
  );
}).setEnabled(stateInHotspotRange.and(stateNearestHotspot).and(settings._preferUseTracer));

export function init() { }
export function load() {
  hotspotUpdateReg.register();
  hotspotPartReg.register();
  hotspotRenderReg.register();
  hotspotArrowOvlReg.register();
  hotspotArrowWrdReg.register();
}
export function unload() {
  hotspotUpdateReg.unregister();
  hotspotPartReg.unregister();
  hotspotRenderReg.unregister();
  hotspotArrowOvlReg.unregister();
  hotspotArrowWrdReg.unregister();
}