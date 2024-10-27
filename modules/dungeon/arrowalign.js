import settings from '../../settings';
import { renderString } from '../../util/draw';
import reg from '../../util/registerer';
import { compareFloat } from '../../util/math';
import { StateProp, StateVar } from '../../util/state';
import { listenBossMessages, stateFloor, stateIsInBoss } from '../dungeon.js';
import { getItemId } from '../../util/mc';

const stateArrowAlign = new StateProp(stateFloor).equalsmult('F7', 'M7').and(stateIsInBoss).and(settings._dungeonArrowAlign);
const stateAtAA = new StateVar(false);
const stateDoArrowAlign = stateArrowAlign.and(stateAtAA);
const stateSolution = new StateVar();
const stateIsPD = new StateVar(true);

const clicks = new Map();
function getFrameId(y, z) {
  const dy = y - 120;
  const dz = z - 75;
  if (dy < 0 || dy > 4) return;
  if (dz < 0 || dz > 4) return;
  return ((dy << 3) | dz) + 1;
}
function getFramePos(id) {
  return [((id - 1) >> 3) + 120, ((id - 1) & 7) + 75];
}
// snagged from bloom
const solutions = [
  [9 | (1 << 4), 7, 1, 1, 9, 9, 9, 9, 9, 7, 9, 3, 9, 7, 9, 9, 9, 7, 9, 3, 9, 7, 9, 9, 9, 7, 9, 3, 9, 7, 9, 9, 9, 9, 9, 3, 1, 1],
  [9 | (2 << 4), 9, 1, 1, 1, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1, 1, 1, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1, 1, 1, 9],
  [9 | (1 << 4), 5, 5, 7, 1, 1, 9, 9, 9, 3, 9, 7, 9, 3, 9, 9, 9, 3, 9, 9, 9, 3, 9, 9, 9, 3, 9, 9, 9, 3, 9, 9, 9, 9, 9, 9, 9, 9],
  [9 | (2 << 4), 9, 9, 7, 1, 9, 9, 9, 9, 9, 1, 1, 9, 9, 9, 9, 9, 9, 9, 7, 1, 9, 9, 9, 9, 9, 1, 1, 9, 9, 9, 9, 9, 9, 9, 3, 1, 9],
  [9 | (2 << 4), 9, 9, 9, 9, 9, 9, 9, 9, 9, 7, 9, 7, 9, 9, 9, 9, 7, 1, 9, 5, 7, 9, 9, 9, 7, 9, 9, 9, 7, 9, 9, 9, 5, 5, 9, 1, 1],
  [9 | (1 << 4), 7, 1, 1, 9, 9, 9, 9, 9, 7, 9, 3, 9, 9, 9, 9, 9, 9, 9, 3, 9, 9, 9, 9, 9, 9, 9, 3, 9, 7, 9, 9, 9, 9, 9, 3, 1, 1],
  [9 | (1 << 4), 5, 5, 7, 9, 9, 9, 9, 9, 3, 9, 7, 9, 7, 9, 9, 9, 3, 9, 9, 9, 7, 9, 9, 9, 3, 9, 9, 9, 7, 9, 9, 9, 3, 1, 1, 1, 1],
  [9 | (1 << 4), 7, 1, 1, 9, 9, 9, 9, 9, 7, 9, 3, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 7, 9, 3, 9, 9, 9, 9, 9, 5, 5, 3],
  [9 | (2 << 4), 9, 1, 9, 7, 9, 9, 9, 9, 9, 3, 9, 7, 9, 9, 9, 9, 9, 3, 9, 7, 9, 9, 9, 9, 9, 3, 9, 7, 9, 9, 9, 9, 9, 3, 1, 1, 9]
];

const tickReg = reg('tick', () => stateAtAA.set(
  compareFloat(Player.getY(), 121, 1.1) === 0 &&
  compareFloat(Player.getX(), 0, 5) === 0 &&
  compareFloat(Player.getZ(), 77, 5) === 0
)).setEnabled(stateArrowAlign);
const EntityItemFrame = net.minecraft.entity.item.EntityItemFrame;
const calcReg = reg('tick', () => {
  const frames = new Array(38).fill(9);
  World.getAllEntitiesOfType(EntityItemFrame).forEach(e => {
    const x = Math.floor(e.getX());
    const y = Math.floor(e.getY());
    const z = Math.floor(e.getZ());
    if (x !== -2) return;
    const id = getFrameId(y, z);
    if (!id) return;
    const item = e.entity.func_82335_i();
    if (!item || getItemId(item) !== 'minecraft:arrow') return;
    frames[id] = e.entity.func_82333_j();
  });
  const sol = solutions.find(a => a.every((v, i) => !((v >= 9) ^ (frames[i] === 9))));
  if (sol) {
    stateSolution.set(sol);
    sol.forEach((v, i) => {
      const d = (v - frames[i] + 8) & 7;
      if (d > 0) clicks.set(i, d);
    });
  }
}).setEnabled(stateDoArrowAlign.and(new StateProp(stateSolution).not()));
const MCAction = net.minecraft.network.play.client.C02PacketUseEntity.Action;
const playerInteractReg = reg('packetSent', (pack, evn) => {
  if (!pack.func_149565_c().equals(MCAction.INTERACT)) return;
  const ent = pack.func_149564_a(World.getWorld());
  if (!ent || !(ent instanceof EntityItemFrame)) return;
  const x = Math.floor(ent.field_70165_t);
  const y = Math.floor(ent.field_70163_u);
  const z = Math.floor(ent.field_70161_v);
  if (x !== -2) return;
  const id = getFrameId(y, z);
  if (!id) return;

  const c = clicks.get(id) ?? 0;
  if (c > (settings.dungeonArrowAlignLeavePD && stateIsPD.get() && id === (stateSolution.get()[0] >> 4))) {
    if (c > 1) clicks.set(id, c - 1);
    else clicks.delete(id);
    return;
  }
  const isSneaking = Player.isSneaking();
  if (
    settings.dungeonArrowAlignBlock === 'Always' ||
    settings.dungeonArrowAlignBlock === 'WhenCrouching' && isSneaking ||
    settings.dungeonArrowAlignBlock === 'ExceptWhenCrouching' && !isSneaking
  ) return cancel(evn);
  clicks.set(id, (c + 7) & 7);
}).setFilteredClass(net.minecraft.network.play.client.C02PacketUseEntity).setEnabled(stateDoArrowAlign.and(stateSolution));
const renderWorldReg = reg('renderWorld', () => {
  clicks.forEach((v, k) => {
    const [y, z] = getFramePos(k);
    renderString(v.toString(), -2, y + 0.6, z + 0.5, 0xFFFFFFFF, false, 0.03, false);
  });
}).setEnabled(stateDoArrowAlign.and(stateSolution));

export function init() {
  listenBossMessages(v => stateIsPD.set(stateIsPD.get() && v !== 'Goldor'));
}
export function start() {
  stateAtAA.set(false);
  stateSolution.set(null);
  clicks.clear();
  stateIsPD.set(true);

  tickReg.register();
  calcReg.register();
  playerInteractReg.register();
  renderWorldReg.register();
}
export function reset() {
  tickReg.unregister();
  calcReg.unregister();
  playerInteractReg.unregister();
  renderWorldReg.unregister();
}