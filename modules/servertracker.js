import { timeToStr } from '../util/format';
import tabCompletion from '../util/tabcompletion';
import settings from '../settings';
import { log } from '../util/log';
import reg from '../util/registerer';

const servers = {};
let lastWarp = 0;
let currServ = '';
const warpReg = reg('chat', id => {
  const t = Date.now();
  if (currServ) servers[currServ] = t;
  if (id in servers) {
    const timeDif = t - servers[id];
    const timeStr = timeToStr(timeDif);
    log(timeStr, 'since last visited');
  } else log('new server');
  lastWarp = t;
  currServ = id;
}, 'servertracker').setCriteria('Sending to server ${id}...');
const unloadReg = reg('worldUnload', () => (Date.now() - lastWarp > 1000) && (currServ = ''), 'servertracker');

let lastLoc = '';
const warpLocs = {
  'home': 1,
  'island': 1,
  'hub': 2,
  'village': 2,
  'museum': 2,
  'da': 2,
  'castle': 2,
  'crypts': 2,
  'crypt': 2,
  'dungeon_hub': 3,
  'dungeons': 3,
  'dhub': 3,
  'barn': 4,
  'desert': 4,
  'trapper': 4,
  'park': 5,
  'howl': 5,
  'jungle': 5,
  'gold': 6,
  'deep': 7,
  'dwarves': 8,
  'mines': 8,
  'forge': 8,
  'basecamp': 8,
  'crystals': 9,
  'hollows': 9,
  'ch': 9,
  'nucleus': 9,
  'spider': 10,
  'spiders': 10,
  'top': 10,
  'nest': 10,
  'arachne': 10,
  'end': 11,
  'drag': 11,
  'dragons': 11,
  'void': 11,
  'sepulture': 11,
  'nether': 12,
  'isle': 12,
  'crimson': 12,
  'skull': 12,
  'kuudra': 12,
  'smold': 12,
  'smoldering_tomb': 12,
  'wasteland': 12,
  'dragontail': 12,
  'scarleton': 12,
  'garden': 13,
  'jerry': 14
};
const tabComplete = tabCompletion(Object.keys(warpLocs));
const regs = [
  reg('command', loc => {
    if (!loc) return ChatLib.command('warp');
    let t = Date.now() - lastWarp;
    // if (warpLocs[lastLoc] !== warpLocs[loc] && t < settings.serverTrackerTransferCd) {
    if (t < settings.serverTrackerTransferCd) {
      // yes warping in same server has cd (just no cd message appears)
      if (settings.serverTrackerCdMessage) log(settings.serverTrackerCdMessage);
      setTimeout(() => ChatLib.command('warp ' + loc), settings.serverTrackerTransferCd - t);
    } else ChatLib.command('warp ' + loc);
    lastLoc = loc;
  }, 'servertracker').setTabCompletions(tabComplete).setName('warp', true),
  reg('command', () => ChatLib.command('warp island', true), 'servertracker').setName('is', true),
  reg('command', () => ChatLib.command('warp hub', true), 'servertracker').setName('hub', true),
  reg('command', () => ChatLib.command('warp forge', true), 'servertracker').setName('warpforge', true),
  reg('command', () => ChatLib.command('warp dungeon_hub', true), 'servertracker').setName('dn', true),
  reg('command', () => ChatLib.command('warp dungeon_hub', true), 'servertracker').setName('dh', true)
];

export function init() { }
export function load() {
  warpReg.register();
  unloadReg.register();
  regs.forEach(v => v.register());
}
export function unload() {
  warpReg.unregister();
  unloadReg.unregister();
  regs.forEach(v => v.unregister());
}