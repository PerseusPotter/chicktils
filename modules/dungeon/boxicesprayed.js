import settings from '../../settings';
import reg from '../../util/registerer';
import { cross, lerp, normalize, rotate } from '../../util/math';
import Grid from '../../util/grid';
import { fromVec3, getItemId, toVec3 } from '../../util/mc';
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
    allMobsBucket.add(e.field_70165_t, e.field_70161_v, e);
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
    allMobsBucket.add(e.field_70165_t, e.field_70161_v, e);
    return true;
  });
  allMobsBucket.unfreeze();
}).setFps(2).setOffset(0).setEnabled(settings._dungeonBoxIceSprayed);
const serverTickReg = reg('serverTick2', () => {
  frozenMobs = frozenMobs.filter(v => --v[1] > 0);
  run(() => {
    const hasIce = itemCand.some(e => getItemId(e.func_92059_d()) === 'minecraft:ice');
    itemCand = [];
    if (!hasIce) return;
    const icers = getPlayers().filter(({ items }) => items.some(v => v.id === 'ICE_SPRAY_WAND' || v.id === 'STARRED_ICE_SPRAY_WAND'));
    const wS = 1;
    const l = 8;
    const ls = l * l;
    const wE = 3.4;
    const n = 5;
    const frozenBuff = [];
    icers.forEach(({ e: p }) => {
      const ent = (p === Player ? p.getPlayer() : p.entity);
      if (!ent) return;
      const look = ent.func_70040_Z();
      const h = rotate(look.field_72450_a, 0, look.field_72449_c, Math.PI / 2, 0, 0);
      // const v = rotate(look.field_72450_a, look.field_72448_b, look.field_72449_c, 0, Math.PI / 2, 0);
      const v = cross(fromVec3(look), h);
      const vs = [];
      const ve = [];
      const hso = toVec3(normalize(h, wS / n));
      const vso = toVec3(normalize(v, wS / n));
      const heo = toVec3(normalize(h, wE / n));
      const veo = toVec3(normalize(v, wE / n));
      vs.push(ent.func_174824_e(1));
      ve.push(toVec3(normalize(fromVec3(look), l)).func_178787_e(vs[0]));
      for (let i = 0; i < n; i++) {
        vs.push(vs[i].func_178787_e(hso));
        ve.push(ve[i].func_178787_e(heo));
      }
      for (let i = 0; i < n; i++) {
        vs.push(vs[i === 0 ? 0 : vs.length - 1].func_178788_d(hso));
        ve.push(ve[i === 0 ? 0 : ve.length - 1].func_178788_d(heo));
      }
      for (let x = 0; x <= n; x++) {
        for (let y = 0; y < n; y++) {
          vs.push(vs[y === 0 ? x : vs.length - 1].func_178787_e(vso));
          ve.push(ve[y === 0 ? x : ve.length - 1].func_178787_e(veo));
        }
      }
      for (let x = 0; x <= n; x++) {
        for (let y = 0; y < n; y++) {
          vs.push(vs[y === 0 ? x : vs.length - 1].func_178788_d(vso));
          ve.push(ve[y === 0 ? x : ve.length - 1].func_178788_d(veo));
        }
      }
      for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
          vs.push(vs[y === 0 ? x + n + 1 : vs.length - 1].func_178787_e(vso));
          ve.push(ve[y === 0 ? x + n + 1 : ve.length - 1].func_178787_e(veo));
        }
      }
      for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
          vs.push(vs[y === 0 ? x + n + 1 : vs.length - 1].func_178788_d(vso));
          ve.push(ve[y === 0 ? x + n + 1 : ve.length - 1].func_178788_d(veo));
        }
      }
      const pAABB = ent.func_174813_aQ().func_72314_b(0.2, 0, 0.2);
      allMobsBucket.get(p.getX(), p.getZ()).forEach(e => {
        if (
          (ent.field_70165_t - e.field_70165_t) ** 2 +
          (ent.field_70163_u - e.field_70163_u) ** 2 +
          (ent.field_70161_v - e.field_70161_v) ** 2 > ls
        ) return;
        const aabb = e.func_174813_aQ();
        if (aabb.func_72326_a(pAABB) || vs.some((v, i) => aabb.func_72327_a(v, ve[i]))) frozenBuff.push([e, 5 * 20]);
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
export function start() {
  allMobs = [];
  allMobsBucket.clear();
  itemCand = [];
  frozenMobs = [];

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