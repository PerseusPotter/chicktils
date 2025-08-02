import settings from '../settings';
import data from '../data';
import createTextGui from '../util/customtextgui';
import reg from '../util/registerer';
import { _setTimeout } from '../util/timers';
import { unrun } from '../util/threading';
import { registerListenIsland, stateIsland } from '../util/skyblock';

/** @type {(typeof stateIsland extends import('../util/state').StateVar<infer U> ? U : never)[]} */
const locs = [
  'Private Island',
  'Hub',
  'Dungeon Hub',
  'The Farming Islands',
  'Garden',
  'The Park',
  'Gold Mine',
  'Deep Caverns',
  'Dwarven Mines',
  'Crystal Hollows',
  'Spider\'s Den',
  'The End',
  'Crimson Isle',
  'Kuudra',
  'The Rift',
  'Jerry\'s Workshop',
  'Catacombs',
  'Backwater Bayou'
];

let currLoc = -1;
let editLoc = -1;
const display = createTextGui(() => display.isEdit ? data.statLocs[editLoc] : data.statLocs[currLoc], () => [' §r Speed: §r§f✦400§r', ' §r Strength: §r§c❁9999§r', ' §r Crit Chance: §r§9☣100§r', ' §r Crit Damage: §r§9☠9999§r', ' §r Attack Speed: §r§e⚔100§r'], '\n&7[&25&7] &fApply to All Locations');
function editLocation(index, fromGui) {
  editLoc = index;
  display.on('editKey', n => {
    if (n !== 6) return;
    data.statLocs = locs.map(() => Object.assign({}, data.statLocs[editLoc]));
  });

  display.edit(fromGui);
}

stateIsland.listen(loc => {
  if (!settings.enablestatgui) return;

  currLoc = locs.indexOf(loc);
  if (currLoc >= 0 && settings['loc' + currLoc]) {
    updateReg.register();
    renderReg.register();
  } else unloadListeners();
});

function unloadListeners() {
  // currLoc = -1;
  updateReg.unregister();
  renderReg.unregister();
}
const unloadReg = reg('worldUnload', unloadListeners);

const renderReg = reg('renderOverlay', () => display.render());
const updateReg = reg('step', () => {
  // extremely rare concurrent mod, could run in main thread but not worth :)
  try {
    const lines = TabList.getNames();
    // locs[16] === 'Catacombs'
    const startI = (currLoc === 16 ? lines.findIndex(v => v.startsWith('§r§e§lSkills:')) : lines.indexOf('§r§e§lStats:§r'));
    if (startI < 0) return unrun(() => display.setLine('&cUnable to find stats'));
    let endI = lines.findIndex((v, i) => i > startI && (v === '§r' || !v.startsWith('§r ')));
    if (endI < 0) endI = lines.length;

    unrun(() => display.setLines(lines.slice(startI + 1, endI)));
  } catch (_) { }
}).setFps(2);

export function init() {
  locs.forEach((_, i) => {
    registerListenIsland(settings['_loc'] + i);
    settings['_moveLoc' + i].onAction(v => editLocation(i, v));
  });
}
export function load() {
  unloadReg.register();
}
export function unload() {
  unloadReg.unregister();
  unloadListeners();
}