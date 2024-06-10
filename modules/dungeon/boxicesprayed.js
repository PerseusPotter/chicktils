import settings from '../../settings';
import { drawBoxAtBlockNotVisThruWalls, drawBoxAtBlock, drawFilledBox } from '../../util/draw';
import reg from '../../util/registerer';
import { cross, lerp, normalize, rotate } from '../../util/math';
import Grid from '../../util/grid';
import { fromVec3, getItemId, toVec3 } from '../../util/mc';
import { getSbId } from '../../util/skyblock';
import { getPlayers, isMob, registerTrackPlayers } from '../dungeon.js';
import { run } from '../../util/threading.js';

let allMobs = [];
let newAllMobs = [];
const allMobsBucket = new Grid({ size: 3, addNeighbors: 2 });
let itemCand = [];
const frozenMobs = new (Java.type('java.util.HashMap'))();

const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  const c = e.getClass().getSimpleName();
  if (isMob(c)) newAllMobs.push(e);
  else if (c === 'EntityItem') itemCand.push(e);
}, 'dungeon/boxicesprayed').setEnabled(settings._dungeonBoxIceSprayed);
const step2Reg = reg('step', () => {
  run(() => {
    allMobsBucket.clear();
    allMobs = allMobs.filter(e => {
      if (e.field_70128_L) return false;
      const c = e.getClass().getSimpleName();
      if (c === 'EntityOtherPlayerMP') {
        if (e.func_110124_au().version() === 4) return false;
      } else if (c === 'EntityWither') {
        if (e.func_110138_aP() === 300) return false;
      }
      allMobsBucket.add(e.field_70165_t, e.field_70161_v, e);
      return true;
    });
  });
}, 'dungeon/boxicesprayed').setFps(2).setEnabled(settings._dungeonBoxIceSprayed);
const tickReg = reg('tick', () => {
  run(() => {
    newAllMobs.forEach(e => {
      allMobs.push(e);
      allMobsBucket.add(e.field_70165_t, e.field_70161_v, e);
    });
    newAllMobs = [];

    const hasIce = itemCand.some(e => getItemId(e.func_92059_d()) === 'minecraft:ice');
    itemCand = [];
    if (hasIce) {
      const icers = getPlayers().filter(({ e }) => {
        if (!e) return;
        const heldItem = e === Player ? e.getHeldItem() : e.getItemInSlot(0);
        return heldItem && getSbId(heldItem) === 'ICE_SPRAY_WAND';
      });
      const wS = 1;
      const l = 8;
      const ls = l * l;
      const wE = 3.4;
      const n = 5;
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
          if (aabb.func_72326_a(pAABB) || vs.some((v, i) => aabb.func_72327_a(v, ve[i]))) frozenMobs.put(e, 5 * 20);
        });
      });
    }
  });
}, 'dungeon/boxicesprayed').setEnabled(settings._dungeonBoxIceSprayed);
const serverTickReg = reg('packetReceived', () => {
  // const it = frozenMobs.entrySet().iterator();
  // while (it.hasNext()) {
  //   let pair = it.next();
  //   let v = pair.getValue() - 1;
  //   if (v === 0) it.remove();
  //   else it.setValue(v);
  // }
  frozenMobs.entrySet().forEach(p => {
    const v = p.getValue() - 1;
    if (v === 0) frozenMobs.remove(p.getKey());
    else frozenMobs.replace(p.getKey(), v);
  });
}, 'dungeon/boxicesprayed').setFilteredClass(Java.type('net.minecraft.network.play.server.S32PacketConfirmTransaction')).setEnabled(settings._dungeonBoxIceSprayed);
const renderWorldReg = reg('renderWorld', () => {
  const or = ((settings.dungeonBoxIceSprayedOutlineColor >> 24) & 0xFF) / 256;
  const og = ((settings.dungeonBoxIceSprayedOutlineColor >> 16) & 0xFF) / 256;
  const ob = ((settings.dungeonBoxIceSprayedOutlineColor >> 8) & 0xFF) / 256;
  const oa = ((settings.dungeonBoxIceSprayedOutlineColor >> 0) & 0xFF) / 256;
  const fr = ((settings.dungeonBoxIceSprayedFillColor >> 24) & 0xFF) / 256;
  const fg = ((settings.dungeonBoxIceSprayedFillColor >> 16) & 0xFF) / 256;
  const fb = ((settings.dungeonBoxIceSprayedFillColor >> 8) & 0xFF) / 256;
  const fa = ((settings.dungeonBoxIceSprayedFillColor >> 0) & 0xFF) / 256;
  frozenMobs.keySet().forEach(e => {
    if (e.field_70128_L) return;
    const x = lerp(e.field_70169_q, e.field_70165_t, partial);
    const y = lerp(e.field_70167_r, e.field_70163_u, partial);
    const z = lerp(e.field_70166_s, e.field_70161_v, partial);
    const w = e.field_70130_N + 0.2;
    const h = e.field_70131_O + 0.2;
    if (settings.dungeonBoxIceSprayedEsp) drawBoxAtBlock(x - w / 2, y, z - w / 2, or, og, ob, w, h, oa, 5);
    else drawBoxAtBlockNotVisThruWalls(x - w / 2, y, z - w / 2, or, og, ob, w, h, oa, 5);

    drawFilledBox(x, y, z, w, h, fr, fg, fb, fa, settings.dungeonBoxIceSprayedEsp);
  });
}, 'dungeon/boxicesprayed').setEnabled(settings._dungeonBoxIceSprayed);

export function init() {
  registerTrackPlayers(settings._dungeonBoxIceSprayed);
}
export function start() {
  allMobs = [];
  newAllMobs = [];
  allMobsBucket.clear();
  itemCand = [];
  frozenMobs.clear();

  entSpawnReg.register();
  Client.scheduleTask(0, () => step2Reg.register());
  tickReg.register();
  serverTickReg.register();
  renderWorldReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  step2Reg.unregister();
  tickReg.unregister();
  serverTickReg.unregister();
  renderWorldReg.unregister();
}