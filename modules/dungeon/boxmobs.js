import settings from '../../settings';
import { drawBoxPos, rgbaToJavaColor } from '../../util/draw';
import reg from '../../util/registerer';
import { compareFloat, dist } from '../../util/math';
import Grid from '../../util/grid';
import { StateProp } from '../../util/state';
import { isDungeonMob, stateIsInBoss } from '../dungeon.js';

const stateBoxMob = new StateProp(settings._dungeonBoxMobs).and(new StateProp(settings._dungeonBoxMobDisableInBoss).not().or(new StateProp(stateIsInBoss).not()));
const boxMobs = new (Java.type('java.util.WeakHashMap'))();
let mobCand = [];
let nameCand = [];
const mobCandBucket = new Grid();

function getBoxMobType(n) {
  if (n.includes('Fels', 6)) return 1;

  if (n.includes('Withermancer', 6)) return 2;
  // if (n.includes('Zombie Lord', 6)) return 2;
  // if (n.includes('Skeleton Lord', 6)) return 2;
  if (n.includes('Lord', 6)) return 2;
  if (n.includes('Zombie Commander', 6)) return 2;
  if (n.includes('Super Archer')) return 2;

  // if (n.includes('Lost Adventurer', 6)) return 3;
  // if (n.includes('Frozen Adventurer', 6)) return 3;
  if (n.includes('Adventurer', 6)) return 3;
  if (n.includes('Angry Archaeologist', 6)) return 3;

  return 4;
}
function matchesMobType(n, e) {
  const c = e.getClass().getSimpleName();
  if (n.includes('Zombie Commander', 6)) return c === 'EntityOtherPlayerMP';
  if (n.includes('Zombie', 6)) return c === 'EntityZombie';
  if (n.includes('Skele', 6)) return c === 'EntitySkeleton';
  if (n.includes('Fels', 6)) return c === 'EntityEnderman';
  if (n.includes('Withermancer', 6)) return c === 'EntitySkeleton' && e.func_82202_m() === 1;
  if (n.includes('Crypt Lurker', 6)) return c === 'EntityZombie';
  if (n.includes('Super Archer', 6)) return c === 'EntitySkeleton';
  if (n.includes('Sniper', 6)) return c === 'EntitySkeleton';
  return c === 'EntityOtherPlayerMP';
}

const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  const c = e.getClass().getSimpleName();
  if (c === 'EntityArmorStand') {
    if (settings.dungeonBoxMobs && !stateIsInBoss.get()) nameCand.push(e);
  } else if (isDungeonMob(c)) {
    mobCand.push(e);
    mobCandBucket.add(e.field_70165_t, e.field_70161_v, e);
  }
}).setEnabled(stateBoxMob);
const step2Reg = reg('step', () => {
  mobCandBucket.clear();
  mobCand = mobCand.filter(e => {
    if (e.field_70128_L) return false;
    const n = e.func_70005_c_();
    if (n === 'Shadow Assassin') {
      boxMobs.put(e, { yO: 0, h: 2, c: rgbaToJavaColor(settings.dungeonBoxSAColor) });
      return false;
    }
    mobCandBucket.add(e.field_70165_t, e.field_70161_v, e);
    return true;
  });
}).setFps(2).setEnabled(stateBoxMob);
const tickReg = reg('tick', () => {
  new Thread(() => {
    nameCand = nameCand.filter(e => {
      if (e.field_70128_L) return;
      const n = e.func_70005_c_();
      if (n === '§c§cBlood Key' || n === '§6§8Wither Key') {
        boxMobs.put(e, { yO: -1, h: 1, c: rgbaToJavaColor(settings.dungeonBoxKeyColor) });
        return;
      }
      if (!n.startsWith('§6✯ ')) return;
      const x = e.field_70165_t;
      const y = e.field_70163_u;
      const z = e.field_70161_v;

      let ents = mobCandBucket.get(e.field_70165_t, e.field_70161_v);
      if (!ents) return true;
      ents = ents.filter(v => compareFloat(v.field_70165_t, x, 1) === 0 && compareFloat(v.field_70161_v, z, 1) === 0 && v.field_70163_u < y && y - v.field_70163_u < 5).filter(v => matchesMobType(n, v));
      if (ents.length === 0) return true;
      const ent = ents.reduce((a, v) => dist(a.field_70165_t, x) + dist(a.field_70161_v, z) > dist(v.field_70165_t, x) - dist(v.field_70161_v, z) ? v : a, ents[0]);

      let h = 2;
      const t = getBoxMobType(n);
      let c = settings.dungeonBoxMobColor;
      if (t === 1) {
        h = 3;
        c = settings.dungeonBoxFelColor;
      } else if (t === 2) {
        c = settings.dungeonBoxChonkColor;
        if (n.includes('Withermancer', 6)) h = 3;
      } else if (t === 3) {
        c = settings.dungeonBoxMiniColor;
      }
      boxMobs.put(ent, { yO: 0, h, c: rgbaToJavaColor(c) });
    });
  }).start();
}).setEnabled(stateBoxMob);
const renderEntPostReg = reg('postRenderEntity', (e, pos, partial) => {
  const data = boxMobs.get(e.entity);
  if (data) drawBoxPos(pos.getX(), pos.getY() - data.yO, pos.getZ(), 1, data.h, data.c, partial, settings.dungeonBoxMobEsp, false);
}).setEnabled(stateBoxMob);

export function init() { }
export function start() {
  mobCand = [];
  nameCand = [];
  mobCandBucket.clear();

  entSpawnReg.register();
  Client.scheduleTask(3, step2Reg.register());
  tickReg.register();
  renderEntPostReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  step2Reg.unregister();
  tickReg.unregister();
  renderEntPostReg.unregister();
}