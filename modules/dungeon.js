import reg from '../util/registerer';
import { getPlayerName } from '../util/format';
import { StateProp, StateVar } from '../util/state';

function reset() {
  dungeonLeaveReg.unregister();
  bossMessageReg.unregister();
  entSpawnReg.unregister();
  getPlayersTickReg.unregister();

  modules.forEach(v => v.reset());
}
function start() {
  players = [];
  stateIsInBoss.set(false);

  dungeonLeaveReg.register();
  bossMessageReg.register();
  entSpawnReg.register();
  getPlayersTickReg.register();

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
export function listenBossMessages(cb) {
  bossCbs.push(cb);
}
export function isMob(name) {
  return isDungeonMob(name) ||
    name === 'EntityWither' ||
    name === 'EntityGiantZombie' ||
    name === 'EntityIronGolem' ||
    name === 'EntityDragon';
}
export function isDungeonMob(name) {
  return name === 'EntityZombie' ||
    name === 'EntitySkeleton' ||
    name === 'EntityOtherPlayerMP' ||
    name === 'EntityEnderman';
}
export function roundRoomCoords(c) {
  return ((c + 9) & 0b11111111111111111111111111100000) - 9;
}

const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  const e = evn.entity;
  if (e.getClass().getSimpleName() === 'EntityOtherPlayerMP' && e.func_110124_au().version() === 4) {
    const p = players.find(v => v.ign === e.func_70005_c_());
    if (p) p.e = new EntityLivingBase(e);
  }
}, 'dungeon');
const getPlayersTickReg = reg('tick', () => {
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
    World.getAllEntities().forEach(v => {
      if (v.getClassName() !== 'EntityOtherPlayerMP') return;
      const player = players.find(p => p.ign === v.getName());
      if (player) player.e = new EntityLivingBase(v.entity);
    });
    const player = players.find(p => p.ign === Player.getName());
    if (player) player.e = Player;
    getPlayersTickReg.unregister();
  }
}, 'dungeon');

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
    require('./dungeon/hidehealerpowerups'),
    require('./dungeon/icesprayalert'),
    require('./dungeon/m7lbwaypoints'),
    require('./dungeon/map'),
    require('./dungeon/necrondrag'),
    require('./dungeon/playsoundkey'),
    require('./dungeon/spiritbear'),
    require('./dungeon/stairstonkhelper'),
    require('./dungeon/terminalbreakdown'),
    require('./dungeon/terminalsguisize')
  ];
  modules.forEach(v => v.init());

  entSpawnReg.setEnabled(stateTrackPlayers);
  getPlayersTickReg.setEnabled(stateTrackPlayers);
}
export function load() {
  dungeonStartReg.register();
}
export function unload() {
  dungeonStartReg.unregister();
  reset();
}
