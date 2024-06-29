import reg from '../util/registerer';
import { getPlayerName } from '../util/format';
import { StateProp, StateVar } from '../util/state';
import { run } from '../util/threading';

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
  const floor = Scoreboard.getLines(false)[4].getName().match(/^ §7⏣ §cThe Catac..§combs §7\(([MF][1-7]|E)\)$/);
  stateFloor.set(floor ? floor[1] : '');

  dungeonLeaveReg.register();
  bossMessageReg.register();
  entSpawnReg.register();
  getPlayersStep2Reg.register();

  modules.forEach(v => v.start());
}

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

const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  if (e instanceof EntityOtherPlayerMP && e.func_110124_au().version() === 4) {
    const p = players.find(v => v.ign === e.func_70005_c_());
    if (p) p.e = new EntityLivingBase(e);
  }
}, 'dungeon');
const getPlayersStep2Reg = reg('step', () => {
  run(() => {
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
      World.getAllEntitiesOfType(EntityOtherPlayerMP).forEach(v => {
        const player = players.find(p => p.ign === v.getName());
        if (player) player.e = new EntityLivingBase(v.entity);
      });
      const player = players.find(p => p.ign === Player.getName());
      if (player) player.e = Player;
      getPlayersStep2Reg.unregister();
    }
  });
}, 'dungeon').setFps(2);

// const dungeonJoinReq = reg('chat', () => dungeon.emit('dungeonJoin'), 'dungeon').setChatCriteria('{"server":"${*}","gametype":"SKYBLOCK","mode":"dungeon","map":"Dungeon"}');
const dungeonStartReg = reg('chat', () => start(), 'dungeon').setChatCriteria('&e[NPC] &bMort&f: &rHere, I found this map when I first entered the dungeon.&r');
const dungeonLeaveReg = reg('worldUnload', () => reset(), 'dungeon');
const bossMessageReg = reg('chat', (name, msg) => {
  bossCbs.forEach(v => v(name, msg));
  if (name === 'The Watcher') return;
  if (name === 'Scarf') {
    if (msg === `How can you move forward when you keep regretting the past?`) return;
    if (msg === `If you win, you live. If you lose, you die. If you don't fight, you can't win.`) return;
    if (msg === `If I had spent more time studying and less time watching anime, maybe mother would be here with me!`) return;
  }
  stateIsInBoss.set(true);
}, 'dungeon').setCriteria(/^&r&(?:c|4)\[BOSS\] (.+?)&r&(?:f|c): (?:&.)*(.+?)&r$/);
// const dungeonEndReg = reg('chat', () => dungeon.emit('dungeonEnd'), 'dungeon').setChatCriteria('&r&f                            &r&fTeam Score:').setParameter('START');

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
    require('./dungeon/goldordpsalert'),
    require('./dungeon/hecatomb'),
    require('./dungeon/hidefallingblocks'),
    require('./dungeon/hidehealerpowerups'),
    require('./dungeon/hidewitherking'),
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
