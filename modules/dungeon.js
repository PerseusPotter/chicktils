import reg from '../util/registerer';
import { getPlayerName } from '../util/format';
import { StateProp, StateVar } from '../util/state';

function reset() {
  dungeonLeaveReg.unregister();
  bossMessageReg.unregister();
  entSpawnReg.unregister();
  getPlayersStep2Reg.unregister();

  modules.forEach(v => v.reset());
}
function start() {
  players = [];
  stateIsInBoss.set(false);
  if (!Scoreboard.getLines(false).some(v => {
    const m = v.getName().match(/^ §7⏣ §cThe Catac..§combs §7\(([MF][1-7]|E)\)$/);
    if (m) stateFloor.set(m[1]);
    return Boolean(m);
  })) stateFloor.set('');

  dungeonLeaveReg.register();
  bossMessageReg.register();
  entSpawnReg.register();
  getPlayersStep2Reg.register();

  modules.forEach(v => v.start());
}

/**
 * @type {{ ign: string, class: 'Archer' | 'Bers' | 'Healer' | 'Mage' | 'Tank', e: EntityLivingBase | null, me: import('../../@types/External').JavaClass<'net.minecraft.entity.Entity'> | null }[]}
 */
let players = [];
let modules = [];
const bossCbs = [];

export const stateIsInBoss = new StateVar(false);
let stateTrackPlayers = new StateProp(false);
export function registerTrackPlayers(cond) {
  stateTrackPlayers = stateTrackPlayers.or(cond);
}
export function getPlayers() {
  return players;
}
export const stateFloor = new StateVar('');
export function listenBossMessages(cb) {
  bossCbs.push(cb);
}
const EntityWither = Java.type('net.minecraft.entity.boss.EntityWither');
const EntityGiantZombie = Java.type('net.minecraft.entity.monster.EntityGiantZombie');
const EntityIronGolem = Java.type('net.minecraft.entity.monster.EntityIronGolem');
const EntityDragon = Java.type('net.minecraft.entity.boss.EntityDragon');
const EntityZombie = Java.type('net.minecraft.entity.monster.EntityZombie');
const EntitySkeleton = Java.type('net.minecraft.entity.monster.EntitySkeleton');
const EntityOtherPlayerMP = Java.type('net.minecraft.client.entity.EntityOtherPlayerMP');
const EntityEnderman = Java.type('net.minecraft.entity.monster.EntityEnderman');
export function isMob(ent) {
  return isDungeonMob(ent) ||
    ent instanceof EntityWither ||
    ent instanceof EntityGiantZombie ||
    ent instanceof EntityIronGolem ||
    ent instanceof EntityDragon;
}
export function isDungeonMob(ent) {
  return ent instanceof EntityZombie ||
    ent instanceof EntitySkeleton ||
    ent instanceof EntityOtherPlayerMP ||
    ent instanceof EntityEnderman;
}
export function roundRoomCoords(c) {
  return ((c + 8) & 0b11111111111111111111111111100000) - 8;
}

const entSpawnReg = reg('spawnEntity', e => {
  if (e instanceof EntityOtherPlayerMP && e.func_110124_au().version() === 4) {
    const n = e.func_70005_c_();
    const p = players.find(v => v.ign === n);
    if (p) {
      p.e = new EntityLivingBase(e);
      p.me = e;
    }
  }
});
const getPlayersStep2Reg = reg('step', () => {
  const tab = TabList.getNames();
  let expectEmpty = false;
  for (let i = 1; i < tab.length; i++) {
    let s = tab[i];
    if (expectEmpty) {
      if (s !== '§r') break;
      expectEmpty = false;
      continue;
    }
    if (s === '§r' || /^§r§7and \d+ other players\.\.\.§r$/.test(s)) break;
    if (s.startsWith('§r Revive Stones:')) {
      expectEmpty = true;
      continue;
    }
    if (s.startsWith('§r Ultimate:') || s.startsWith('§r         §r§a§lPlayers')) continue;
    let m = s.match(/§r§f\(§r§d(\w+) \w+?§r§f\)§r$/);
    if (!m) break; // "EMPTY"
    players.push({ ign: getPlayerName(s), class: m[1], e: null });
  }
  if (players.length) {
    World.getAllPlayers().forEach(v => {
      const player = players.find(p => p.ign === v.getName());
      if (player) {
        player.e = v;
        player.me = v.entity;
      }
    });
    const player = players.find(p => p.ign === Player.getName());
    if (player) {
      player.e = Player;
      player.me = Player.getPlayer();
    }
    getPlayersStep2Reg.unregister();
  }
}).setFps(2);

// const dungeonJoinReq = reg('chat', () => dungeon.emit('dungeonJoin'))setChatCriteria('{"server":"${*}","gametype":"SKYBLOCK","mode":"dungeon","map":"Dungeon"}');
const dungeonStartReg = reg('chat', () => start()).setChatCriteria('&e[NPC] &bMort&f: &rHere, I found this map when I first entered the dungeon.&r');
const dungeonLeaveReg = reg('worldUnload', () => reset());
const bossMessageReg = reg('chat', (name, msg) => {
  bossCbs.forEach(v => v(name, msg));
  if (name === 'The Watcher') return;
  if (name === 'Scarf') {
    if (msg === `How can you move forward when you keep regretting the past?`) return;
    if (msg === `If you win, you live. If you lose, you die. If you don't fight, you can't win.`) return;
    if (msg === `If I had spent more time studying and less time watching anime, maybe mother would be here with me!`) return;
  }
  stateIsInBoss.set(true);
}).setCriteria(/^&r&(?:c|4)\[BOSS\] (.+?)&r&(?:f|c): (?:&.)*(.+?)&r$/);
// const dungeonEndReg = reg('chat', () => dungeon.emit('dungeonEnd')).setChatCriteria('&r&f                            &r&fTeam Score:').setParameter('START');

export function init() {
  modules = [
    require('./dungeon/autoarchitect'),
    require('./dungeon/autorefillpearls'),
    require('./dungeon/boxicesprayed'),
    require('./dungeon/boxmobs'),
    require('./dungeon/boxteammates'),
    require('./dungeon/boxwithers'),
    require('./dungeon/camp'),
    require('./dungeon/dev4helper'),
    require('./dungeon/dev4highlight'),
    require('./dungeon/dragonhelper'),
    require('./dungeon/goldordpsalert'),
    require('./dungeon/hecatomb'),
    require('./dungeon/hidefallingblocks'),
    require('./dungeon/hidehealerpowerups'),
    require('./dungeon/hidewitherking'),
    require('./dungeon/lbpullprogress'),
    require('./dungeon/lividfinder'),
    require('./dungeon/icesprayalert'),
    require('./dungeon/m7lbwaypoints'),
    require('./dungeon/map'),
    require('./dungeon/necrondrag'),
    require('./dungeon/playsoundkey'),
    require('./dungeon/silverfishhastetimer'),
    require('./dungeon/spiritbear'),
    require('./dungeon/stairstonkhelper'),
    require('./dungeon/terminalbreakdown'),
    require('./dungeon/terminalshelper')
  ];
  modules.forEach(v => v.init());

  entSpawnReg.setEnabled(stateTrackPlayers);
  getPlayersStep2Reg.setEnabled(stateTrackPlayers);
}
export function load() {
  dungeonStartReg.register();
}
export function unload() {
  dungeonStartReg.unregister();
  reset();
}
