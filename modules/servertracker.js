import { timeToStr } from '../util/format';
import tabCompletion from '../util/tabcompletion';
import settings from '../settings';
import { log } from '../util/log';
import { reg } from '../util/registerer';

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
}).setCriteria('Sending to server ${id}...');
const unloadReg = reg('worldUnload', () => (Date.now() - lastWarp > 1000) && (currServ = ''));

let regs = [];
let lastLoc = '';
const tabComplete = tabCompletion(['home', 'island', 'hub', 'village', 'museum', 'da', 'ruins', 'castle', 'crypts', 'crypt', 'dungeon_hub', 'dungeons', 'dhub', 'barn', 'desert', 'trapper', 'park', 'howl', 'jungle', 'gold', 'deep', 'caverns', 'dwarves', 'dwarf', 'mines', 'forge', 'basecamp', 'crystals', 'crystal', 'hollows', 'ch', 'nucleus', 'spider', 'spiders', 'top', 'nest', 'arachne', 'sanctuary', 'end', 'drag', 'dragons', 'void', 'sepulture', 'isle', 'crimson', 'skull', 'kuudra', 'tomb', 'smold', 'smoldering_tomb', 'wasteland', 'dragontail', 'scarleton', 'garden', 'jerry']);
const loadReg = reg('worldLoad', () => {
  regs.forEach(v => v.unregister());
  regs = [];
  regs.push(reg('command', loc => {
    if (!loc) return ChatLib.command('warp');
    let t = Date.now() - lastWarp;
    if (lastLoc !== loc && t < settings.serverTrackerTransferCd) {
      if (settings.serverTrackerCdMessage) log(settings.serverTrackerCdMessage);
      setTimeout(() => ChatLib.command('warp ' + loc), settings.serverTrackerTransferCd - t);
    } else ChatLib.command('warp ' + loc)
    lastLoc = loc;
  }).setTabCompletions(tabComplete).setName('warp', true));
  regs.push(reg('command', () => ChatLib.command('warp island', true)).setName('is', true));
  regs.push(reg('command', () => ChatLib.command('warp hub', true)).setName('hub', true));
  regs.push(reg('command', () => ChatLib.command('warp forge', true)).setName('warpforge', true));
  regs.push(reg('command', () => ChatLib.command('warp dungeon_hub', true)).setName('dn', true));
  regs.push(reg('command', () => ChatLib.command('warp dungeon_hub', true)).setName('dh', true));
});

export function init() { }
export function load() {
  warpReg.register();
  unloadReg.register();
  loadReg.register();
  regs.forEach(v => v.register());
}
export function unload() {
  warpReg.unregister();
  unloadReg.unregister();
  loadReg.unregister();
  regs.forEach(v => v.unregister());
}