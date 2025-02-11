import { timeToStr } from '../util/format';
import tabCompletion from '../util/tabcompletion';
import settings from '../settings';
import { log } from '../util/log';
import reg from '../util/registerer';
import { _setTimeout } from '../util/timers';

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
}).setCriteria('&7Sending to server ${id}...&r');
const unloadReg = reg('worldUnload', () => (Date.now() - lastWarp > 1000) && (currServ = ''));

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
  'wizard': 2,
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
  'gt': 8,
  'tunnel': 8,
  'tunnels': 8,
  'crystals': 9,
  'hollows': 9,
  'ch': 9,
  'nucleus': 9,
  'nuc': 9,
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
  'jerry': 14,
  'rift': 15
};
const tabComplete = tabCompletion(Object.keys(warpLocs));
const regs = [
  reg('command', loc => {
    if (!loc) return ChatLib.command('warp');
    let t = Date.now() - lastWarp;
    // yes warping in same server has cd (just no cd message appears)
    // if (warpLocs[lastLoc] !== warpLocs[loc] && t < settings.serverTrackerTransferCd) {
    if (t < settings.serverTrackerTransferCd) {
      if (settings.serverTrackerCdMessage) log(settings.serverTrackerCdMessage);
      _setTimeout(() => ChatLib.command('warp ' + loc), settings.serverTrackerTransferCd - t);
    } else ChatLib.command('warp ' + loc);
    lastLoc = loc;
  }).setTabCompletions(tabComplete).setName('warp', true),
  reg('command', () => ChatLib.command('warp island', true)).setName('is', true),
  reg('command', () => ChatLib.command('warp hub', true)).setName('hub', true),
  reg('command', () => ChatLib.command('warp forge', true)).setName('warpforge', true),
  reg('command', () => ChatLib.command('warp dungeon_hub', true)).setName('dn', true),
  reg('command', () => ChatLib.command('warp dungeon_hub', true)).setName('dh', true)
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