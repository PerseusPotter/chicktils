import settings from '../../settings';
import reg from '../../util/registerer';
import { dot, lerp, negate, rotate } from '../../util/math';
import Grid from '../../util/grid';
import { fromVec3, getEyeHeight, getItemId, getLastReportedX, getLastReportedY, getLastReportedZ } from '../../util/mc';
import { getPlayers, isMob, registerTrackHeldItem, registerTrackPlayers } from '../dungeon.js';
import { run, unrun } from '../../util/threading';
import { renderBoxFilled, renderBoxOutline } from '../../../Apelles/index';

let allMobs = [];
const allMobsBucket = new Grid({ size: 3, addNeighbors: 2 });
let itemCand = [];
let frozenMobs = [];
const EntityItem = Java.type('net.minecraft.entity.item.EntityItem');
const EntityOtherPlayerMP = Java.type('net.minecraft.entity.client.EntityOtherPlayerMP');
const EntityWither = Java.type('net.minecraft.entity.boss.EntityWither');

const entSpawnReg = reg('spawnEntity', e => {
  if (isMob(e)) {
    allMobs.push(e);
    allMobsBucket.add(e.field_70118_ct / 32, e.field_70116_cv / 32, e);
  } else if (e instanceof EntityItem) itemCand.push(e);
}).setEnabled(settings._dungeonBoxIceSprayed);
const step2Reg = reg('step', () => {
  allMobsBucket.lock();
  allMobsBucket.freeze();
  allMobsBucket.clear();
  allMobsBucket.unlock();
  allMobs = allMobs.filter(e => {
    if (e.field_70128_L) return false;
    if (e instanceof EntityOtherPlayerMP && e.func_110124_au().version() === 4) return false;
    if (e instanceof EntityWither && e.func_110138_aP() === 300) return false;
    allMobsBucket.add(e.field_70118_ct / 32, e.field_70116_cv / 32, e);
    return true;
  });
  allMobsBucket.unfreeze();
}).setFps(2).setOffset(0).setEnabled(settings._dungeonBoxIceSprayed);

const far = 8;
const near = 0.01;
const fov = 90 * Math.PI / 180;
const aspect = 1;
const serverTickReg = reg('serverTick', () => {
  frozenMobs = frozenMobs.filter(v => --v[1] > 0);
  run(() => {
    const hasIce = itemCand.some(e => getItemId(e.func_92059_d()) === 'minecraft:ice');
    itemCand = [];
    if (!hasIce) return;

    const icers = getPlayers().filter(({ items }) => items.some(v => v.id === 'ICE_SPRAY_WAND' || v.id === 'STARRED_ICE_SPRAY_WAND'));
    if (icers.length === 0) return;

    const frozenBuff = [];
    icers.forEach(({ e, me: ent }) => {
      if (!ent) return;

      const pos = {
        x: e === Player ? getLastReportedX() : ent.field_70118_ct / 32,
        y: (e === Player ? getLastReportedY() : ent.field_70117_cu / 32) + getEyeHeight(ent),
        z: e === Player ? getLastReportedZ() : ent.field_70116_cv / 32
      };
      const look = fromVec3(ent.func_70040_Z());
      const plane = (n, p) => [n.x, n.y, n.z, -dot(n, p)];
      const planes = [
        // left
        plane(rotate(look.x, look.y, look.z, (+fov - Math.PI) / 2, 0, 0), pos),
        // right
        plane(rotate(look.x, look.y, look.z, (-fov + Math.PI) / 2, 0, 0), pos),
        // bottom
        plane(rotate(look.x, look.y, look.z, 0, (+fov * aspect - Math.PI) / 2, 0), pos),
        // top
        plane(rotate(look.x, look.y, look.z, 0, (-fov * aspect + Math.PI) / 2, 0), pos),
        // near
        plane(look, { x: pos.x + look.x * near, y: pos.y + look.y * near, z: pos.z + look.z * near }),
        // far
        plane(negate(look), { x: pos.x + look.x * far, y: pos.y + look.y * far, z: pos.z + look.z * far })
      ];

      allMobsBucket.get(pos.x, pos.z).forEach(e => {
        const epos = {
          x: e.field_70118_ct / 32,
          y: e.field_70117_cu / 32,
          z: e.field_70116_cv / 32
        };
        const w = e.field_70130_N;
        const h = e.field_70131_O;
        if (
          (epos.x - pos.x) ** 2 +
          (epos.y - pos.y) ** 2 +
          (epos.z - pos.z) ** 2 > (far + w) ** 2
        ) return;

        const x1 = epos.x - w / 2;
        const y1 = epos.y;
        const z1 = epos.z - w / 2;
        const x2 = epos.x + w / 2;
        const y2 = epos.y + h;
        const z2 = epos.z + w / 2;
        const points = [
          [x1, y1, z1],
          [x1, y1, z2],
          [x1, y2, z1],
          [x1, y2, z2],
          [x2, y1, z1],
          [x2, y1, z2],
          [x2, y2, z1],
          [x2, y2, z2]
        ];
        if (points.some(v => planes.every(p => p[0] * v[0] + p[1] * v[1] + p[2] * v[2] + p[3] >= 0))) frozenBuff.push([e, 5 * 20]);
      });
    });
    if (frozenBuff.length) unrun(() => {
      frozenBuff.forEach(([e, t]) => {
        const i = frozenMobs.findIndex(v => v[0] === e);
        if (i >= 0) frozenMobs.splice(i, 1);
        frozenMobs.push([e, t]);
      });
    });
  });
}).setEnabled(settings._dungeonBoxIceSprayed);
const renderWorldReg = reg('renderWorld', partial => {
  frozenMobs.forEach(([e]) => {
    if (e.field_70128_L) return;
    if (e.func_110143_aJ() <= 0) return;
    const x = lerp(e.field_70169_q, e.field_70165_t, partial);
    const y = lerp(e.field_70167_r, e.field_70163_u, partial);
    const z = lerp(e.field_70166_s, e.field_70161_v, partial);
    const w = e.field_70130_N + 0.2;
    const h = e.field_70131_O + 0.2;
    renderBoxOutline(settings.dungeonBoxIceSprayedOutlineColor, x, y, z, w, h, { phase: settings.dungeonBoxIceSprayedEsp, lw: 5 });
    renderBoxFilled(settings.dungeonBoxIceSprayedFillColor, x, y, z, w, h, { phase: settings.dungeonBoxIceSprayedEsp });
  });
}).setEnabled(settings._dungeonBoxIceSprayed);

export function init() {
  registerTrackPlayers(settings._dungeonBoxIceSprayed);
  registerTrackHeldItem(settings._dungeonBoxIceSprayed);
}
export function enter() {
  allMobs = [];
  allMobsBucket.clear();
  itemCand = [];
  frozenMobs = [];
}
export function start() {
  entSpawnReg.register();
  step2Reg.register();
  serverTickReg.register();
  renderWorldReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  step2Reg.unregister();
  serverTickReg.unregister();
  renderWorldReg.unregister();
}