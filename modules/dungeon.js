import reg from '../util/registerer';
import { getPlayerName } from '../util/format';
import { StateProp, StateVar } from '../util/state';
import { getSbId } from '../util/skyblock';
import { Deque, JavaTypeOrNull, setAccessible } from '../util/polyfill';
import { unrun } from '../util/threading';

function reset() {
  dungeonLeaveReg.unregister();
  bossMessageReg.unregister();
  entSpawnReg.unregister();
  getPlayersStep2Reg.unregister();
  playerItemReg.unregister();

  modules.forEach(v => v.reset());
}
function start() {
  players = [];
  stateIsInBoss.set(false);
  statePlayerClass.set('Unknown');
  if (!Scoreboard.getLines(false).some(v => {
    const m = v.getName().match(/^ §7⏣ §cThe Catac..§combs §7\(([MF][1-7]|E)\)$/);
    if (m) stateFloor.set(m[1]);
    return Boolean(m);
  })) stateFloor.set('');

  dungeonLeaveReg.register();
  bossMessageReg.register();
  entSpawnReg.register();
  getPlayersStep2Reg.register();
  playerItemReg.register();

  modules.forEach(v => v.start());
}

/**
 * @type {{ ign: string, class: 'Archer' | 'Berserk' | 'Healer' | 'Mage' | 'Tank', e: EntityLivingBase | null, me: import('../../@types/External').JavaClass<'net.minecraft.entity.Entity'> | null, items: Deque<{ id: string, t: number}> }[]}
 */
let players = [];
let modules = [];
const bossCbs = [];

export const stateIsInBoss = new StateVar(false);
export const statePlayerClass = new StateVar('Unknown');
export const stateBossName = new StateVar('');
let stateTrackPlayers = new StateProp(false);
export function registerTrackPlayers(cond) {
  stateTrackPlayers = stateTrackPlayers.or(cond);
}
let stateTrackHeldItem = new StateProp(false);
export function registerTrackHeldItem(cond) {
  stateTrackHeldItem = stateTrackHeldItem.or(cond);
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
  return ((c + 9) & 0b11111111111111111111111111100000) - 9;
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
    players.push({ ign: getPlayerName(s), class: m[1], e: null, me: null, items: new Deque([{ id: '', t: 0 }]) });
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
      statePlayerClass.set(player.class);
    }
    getPlayersStep2Reg.unregister();
  }
}).setFps(2);
const playerItemReg = reg('serverTick2', t => {
  unrun(() => {
    players.forEach(v => {
      const e = v.e;
      const id = getSbId(e ? e === Player ? e.getHeldItem() : e.getItemInSlot(0) : null);

      const p = v.items.getFirst();
      if (p.id === id) p.t = t;
      else v.items.unshift({ id, t: t });
      if (t - v.items.getLast().t > 20) v.items.pop();
    });
  });
});

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
  stateBossName.set(name);
}).setCriteria(/^&r&(?:c|4)\[BOSS\] (.+?)&r&(?:f|c): (?:&.)*(.+?)&r$/);
// const dungeonEndReg = reg('chat', () => dungeon.emit('dungeonEnd')).setChatCriteria('&r&f                            &r&fTeam Score:').setParameter('START');

export function init() {
  modules = [
    require('./dungeon/arrowalign'),
    require('./dungeon/autoarchitect'),
    require('./dungeon/autorefillpearls'),
    require('./dungeon/blockoverlay'),
    require('./dungeon/boxicesprayed'),
    require('./dungeon/boxmobs'),
    require('./dungeon/boxteammates'),
    require('./dungeon/boxwithers'),
    require('./dungeon/camp'),
    require('./dungeon/dev4helper'),
    require('./dungeon/dev4highlight'),
    require('./dungeon/dhubselector'),
    require('./dungeon/dragonhelper'),
    require('./dungeon/goldordpsalert'),
    require('./dungeon/goldorfrenzytimer'),
    require('./dungeon/hecatomb'),
    require('./dungeon/hidefallingblocks'),
    require('./dungeon/hidehealerfairy'),
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
    require('./dungeon/simonsays'),
    require('./dungeon/spiritbear'),
    require('./dungeon/stairstonkhelper'),
    require('./dungeon/stormlaser'),
    require('./dungeon/terminalbreakdown'),
    require('./dungeon/terminalshelper'),
    require('./dungeon/terracottarespawn')
  ];
  modules.forEach(v => v.init());

  entSpawnReg.setEnabled(stateTrackPlayers);
  getPlayersStep2Reg.setEnabled(stateTrackPlayers);
  playerItemReg.setEnabled(stateTrackHeldItem);

  {
    const SecretSounds = JavaTypeOrNull('dulkirmod.features.dungeons.SecretSounds');
    if (SecretSounds) {
      const f = setAccessible(SecretSounds.class.getDeclaredField('drops'));
      const old = f.get(SecretSounds);
      if (old.length === 12) {
        const list = new java.util.ArrayList();
        old.forEach(v => list.add(v));
        list.add('Healing VIII Splash Potion');
        list.add('Healing 8 Splash Potion');
        list.add('Health VIII Splash Potion');
        list.add('Health 8 Splash Potion');
        list.add('Architect\'s First Draft');
        f.set(SecretSounds, list);
      }
    }
  }
}
export function load() {
  dungeonStartReg.register();
}
export function unload() {
  dungeonStartReg.unregister();
  reset();
}
