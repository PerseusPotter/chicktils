import { reg } from './registerer';

const EventEmitter = require('./events');

/**
 * @type {import('./events').EventEmitterImpl<'dungeonJoin' | 'dungeonStart' | 'bloodOpen' | 'bloodEnd' | 'bossEnter' | 'bossEnd' | 'dungeonEnd' | 'dungeonLeave'>}
 */
export const dungeon = new EventEmitter();
const dungeonReg = {
  dungeonJoin: reg('chat', () => dungeon.emit('dungeonJoin')).setChatCriteria('{"server":"${*}","gametype":"SKYBLOCK","mode":"dungeon","map":"Dungeon"}'),
  dungeonStart: reg('chat', () => dungeon.emit('dungeonStart')).setChatCriteria('&e[NPC] &bMort&f: &rHere, I found this map when I first entered the dungeon.&r'),
  bloodOpen: reg('chat', () => dungeon.emit('bloodOpen')).setChatCriteria('&r&cThe &r&c&lBLOOD DOOR&r&c has been opened!&r'),
  bloodEnd: reg('chat', () => dungeon.emit('bloodEnd')).setCriteria('&r&c[BOSS] The Watcher&r&f: That will be enough for now.&r'),
  bossEnter: reg('chat', (name, msg) => {
    switch (name) {
      case 'The Watcher':
        break;
      case 'Scarf':
        if (msg === `How can you move forward when you keep regretting the past?`) break;
        if (msg === `If you win, you live. If you lose, you die. If you don't fight, you can't win.`) break;
        if (msg === `If I had spent more time studying and less time watching anime, maybe mother would be here with me!`) break;
      default:
        dungeon.emit('bossEnter');
    }
  }).setChatCriteria('&r&c[BOSS] ${name}&r&f: ${msg}&r'),
  bossEnd: reg('chat', (name, msg) => {
    if (name.endsWith('Livid') && msg === `Impossible! How did you figure out which one I was?!`) dungeon.emit('bossEnd');
    switch (name) {
      case 'Bonzo':
        if (msg === `Alright, maybe I'm just weak after all..`) dungeon.emit('bossEnd');
        break;
      case 'Scarf':
        if (msg === `Whatever...`) dungeon.emit('bossEnd');
        break;
      case 'The Professor':
        if (msg === `What?! My Guardian power is unbeatable!`) dungeon.emit('bossEnd');
        break;
      case 'Thorn':
        // if (msg === `This is it... where shall I go now?`) dungeon.emit('bossEnd');
        break;
      case 'Sadan':
        if (msg === `Maybe in another life. Until then, meet my ultimate corpse.`) dungeon.emit('bossEnd');
        break;
      case 'Necron':
        if (msg === `All this, for nothing...`) dungeon.emit('bossEnd');
        break;
      case 'Wither King':
        // if (msg === `Incredible. You did what I couldn't do myself.`) dungeon.emit('bossEnd');
        break;
    }
  }).setChatCriteria('&r&c[BOSS] ${name}&r&f: ${msg}&r'),
  dungeonEnd: reg('chat', () => dungeon.emit('dungeonEnd')).setChatCriteria('&r&f                            &r&fTeam Score:').setParameter('START'),
  dungeonLeave: reg('worldUnload', () => dungeon.emit('dungeonLeave'))
};
function updateListenersD(type, isAdd) {
  if (!dungeonReg[type]) return;
  if (dungeon.listeners(type).length > 0) return;
  const f = isAdd ? 'register' : 'unregister';
  dungeonReg[type][f]();
}
dungeon.on('newListener', t => updateListenersD(t, true));
dungeon.on('removeListener', t => updateListenersD(t, false));

/**
 * @type {import('./events').EventEmitterImpl<'kuudraJoin' | 'kuudraStart' | 'supplyStart' | 'buildStart' | 'buildEnd' | 'stun' | 'dpsStart' | 'kuudraEnd' | 'kuudraLeave'>}
 */
export const kuudra = new EventEmitter();
const kuudraReg = {
  kuudraJoin: reg('chat', () => kuudra.emit('kuudraJoin')).setChatCriteria('&e[NPC] &cElle&f: &rTalk with me to begin!&r'),
  kuudraStart: reg('chat', () => kuudra.emit('kuudraStart')).setChatCriteria('&e[NPC] &cElle&f: &rOkay adventurers, I will go and fish up Kuudra!&r'),
  supplyStart: reg('chat', () => kuudra.emit('supplyStart')).setChatCriteria('&e[NPC] &cElle&f: &rNot again!&r'),
  buildStart: reg('chat', () => kuudra.emit('buildStart')).setCriteria('&e[NPC] &cElle&f: &rOMG! Great work collecting my supplies!&r'),
  buildEnd: reg('chat', () => kuudra.emit('buildEnd')).setCriteria('&e[NPC] &cElle&f: &rPhew! The Ballista is finally ready! It should be strong enough to tank Kuudra\'s blows now!&r'),
  stun: reg('chat', () => kuudra.emit('stun')).setChatCriteria('&e[NPC] &cElle&f: &rThat looks like it hurt! Quickly, while &cKuudra is distracted, shoot him with the Ballista&f!&r'),
  dpsStart: reg('chat', () => kuudra.emit('dpsStart')).setChatCriteria('&e[NPC] &cElle&f: &rPOW! SURELY THAT\'S IT! I don\'t think he has any more in him!&r'),
  kuudraEnd: reg('chat', () => kuudra.emit('kuudraEnd')).setChatCriteria('&r&f                               &r&6&lKUUDRA DOWN!&r'),
  kuudraLeave: reg('worldUnload', () => kuudra.emit('kuudraLeave'))
};
function updateListenersK(type, isAdd) {
  if (!kuudraReg[type]) return;
  if (kuudra.listeners(type).length > 0) return;
  const f = isAdd ? 'register' : 'unregister';
  kuudraReg[type][f]();
}
kuudra.on('newListener', t => updateListenersK(t, true));
kuudra.on('removeListener', t => updateListenersK(t, false));