import settings from '../../settings';
import { renderOutline } from '../../util/draw';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateIsInBoss } from '../dungeon.js';
import { unrun } from '../../util/threading';
import { setAccessible } from '../../util/polyfill';

const stateBoxMob = new StateProp(settings._dungeonBoxMobs).and(new StateProp(settings._dungeonBoxMobDisableInBoss).not().or(new StateProp(stateIsInBoss).not()));
const boxMobs = new Map();
const nameCand = new Set();
const mobCand = new Set();

const boxColors = [
  'dungeonBoxKeyColor',
  'dungeonBoxSAColor',
  'dungeonBoxFelColor',
  'dungeonBoxSMColor',
  'dungeonBoxChonkColor',
  'dungeonBoxChonkColor',
  'dungeonBoxMiniColor',
  'dungeonBoxMobColor'
];
function getBoxMobType(n) {
  if (n.includes('Shadow Assassin', 6)) return 1;

  if (n.includes('Fels', 6)) return 2;

  if (n.includes('Skeleton Master')) return 3;

  if (n.includes('Withermancer', 6)) return 4;

  // if (n.includes('Zombie Lord', 6)) return 5;
  // if (n.includes('Skeleton Lord', 6)) return 5;
  if (n.includes('Lord', 6)) return 5;
  if (n.includes('Zombie Commander', 6)) return 5;
  if (n.includes('Super Archer')) return 5;

  // if (n.includes('Lost Adventurer', 6)) return 6;
  // if (n.includes('Frozen Adventurer', 6)) return 6;
  if (n.includes('Adventurer', 6)) return 6;
  if (n.includes('Angry Archaeologist', 6)) return 6;
  if (n.includes('King Midas', 6)) return 6;

  return 7;
}

function onMobName(name, id) {
  let v;
  if (name === 'Shadow Assassin') v = { yO: 0, h: 2, c: 1 };
  if (name === 'Lost Adventurer') v = { yO: 0, h: 2, c: 6 };
  if (name === 'Diamond Guy') v = { yO: 0, h: 2, c: 6 };
  if (name === 'King Midas') v = { yO: 0, h: 2, c: 6 };
  if (v) unrun(() => boxMobs.set(id, v));
}
function onNameChange(name, id) {
  let v;
  if (name === '§c§cBlood Key' || name === '§6§8Wither Key') v = { yO: -1, h: 1, c: 0 };
  else if (name.startsWith('§6✯ ')) {
    const c = getBoxMobType(name);
    const h = c === 2 || c === 4 ? 3 : 2;
    id -= name.includes('Withermancer', 6) ? 3 : 1;
    v = { yO: 0, h, c };
  }
  if (v) unrun(() => boxMobs.set(id, v));
}

const playerInfoMapF = setAccessible(Java.type('net.minecraft.client.network.NetHandlerPlayClient').class.getDeclaredField('field_147310_i'));
const entSpawnReg = reg('packetReceived', pack => {
  if (pack.func_148943_d) {
    mobCand.add(pack.func_148943_d());
    const name = playerInfoMapF.get(Player.getPlayer().field_71174_a).get(pack.func_179819_c())?.func_178845_a()?.getName();
    if (name) onMobName(name, pack.func_148943_d());
  } else if (!stateIsInBoss.get() && (pack?.func_149025_e() === 30 || pack?.func_148993_l() === 78)) {
    const id = pack?.func_149024_d() || pack?.func_149001_c();
    nameCand.add(id);
    const name = pack?.func_149027_c()?.find(v => v.func_75672_a() === 2)?.func_75669_b();
    if (name) onNameChange(name, id);
  }
}).setFilteredClasses([net.minecraft.network.play.server.S0CPacketSpawnPlayer, net.minecraft.network.play.server.S0FPacketSpawnMob, net.minecraft.network.play.server.S0EPacketSpawnObject]).setEnabled(stateBoxMob);
const nameChangeReg = reg('packetReceived', pack => {
  const id = pack.func_149375_d();

  const isName = nameCand.has(id);
  const isMob = !isName && mobCand.has(id);
  if (!isName && !isMob) return;

  const name = pack.func_149376_c()?.find(v => v.func_75672_a() === 2)?.func_75669_b();
  if (!name) return;

  if (isMob) onMobName(name, id);
  if (isName) onNameChange(name, id);
}).setFilteredClass(net.minecraft.network.play.server.S1CPacketEntityMetadata).setEnabled(stateBoxMob);
const renderEntPostReg = reg('postRenderEntity', (e, pos) => {
  const data = boxMobs.get(e.entity.func_145782_y());
  if (data) renderOutline(pos.getX(), pos.getY() - data.yO, pos.getZ(), 1, data.h, settings[boxColors[data.c]], settings.dungeonBoxMobEsp, true, undefined, true);
}).setEnabled(stateBoxMob);

export function init() { }
export function start() {
  boxMobs.clear();
  nameCand.clear();
  mobCand.clear();

  entSpawnReg.register();
  nameChangeReg.register();
  renderEntPostReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  nameChangeReg.unregister();
  renderEntPostReg.unregister();
}