import { listenPostInit } from '../loader';
import { getBlockPos } from './mc';
import reg from './registerer';
import { StateProp, StateVar } from './state';

/**
 * @author Koenbezeg
 * @link https://discord.com/channels/119493402902528000/1109135083228643460/1244377006359969843
 */
export const getSbDate = (function() {
  const sbReleaseUnix = 1560275700000;
  const sbYear = 446400000;
  const sbMonth = 37200000;
  const sbDay = 1200000;
  const sbHour = 50000;
  const sbMinute = 8333;
  return function() {
    let timeSinceLaunch = Date.now() - sbReleaseUnix;
    //skyblock started on year 1 month 1 day 1 so add 1 to those
    const year = Math.floor(timeSinceLaunch / sbYear) + 1;
    timeSinceLaunch %= sbYear;

    const month = Math.floor(timeSinceLaunch / sbMonth) + 1;
    timeSinceLaunch %= sbMonth;

    const day = Math.floor(timeSinceLaunch / sbDay) + 1;
    timeSinceLaunch %= sbDay;

    const hour = Math.floor(timeSinceLaunch / sbHour);
    timeSinceLaunch %= sbHour;

    // minutes increases in steps of 10
    const minute = Math.floor(timeSinceLaunch / sbMinute) * 10;

    return { year, month, day, hour, minute };
  };
}());

/**
 * @param {Item | import ('../../@types/External').JavaClass<'net.minecraft.item.ItemStack'>} item
 * @returns {string}
 */
export function getSbId(item) {
  if (!item) return '';
  return (item.itemStack ? item.itemStack : item).func_77978_p()?.func_74775_l('ExtraAttributes')?.func_74779_i('id') ?? '';
}

/**
 * @param {string} sbId
 * @returns {number}
 */
export function countItems(sbId) {
  const inv = Player.getInventory();
  if (!inv) return 0;
  return inv.getItems().reduce((a, v) => a + (getSbId(v) === sbId ? v.getStackSize() : 0), 0);
}

const spawnLocations = {
  'Private Island': [7, 100, 7],
  'Hub': [-3, 70, -70],
  'Dungeon Hub': [-31, 121, 0],
  'The Farming Islands': [113, 71, -208],
  'The Park': [-279, 82, -14],
  'Gold Mine': [-5, 74, -279],
  'Deep Caverns': [4, 157, 80],
  'Dwarven Mines': [-49, 200, -122],
  'Crystal Hollows': [213, 113, 417],
  'Spider\'s Den': [-203, 83, -233],
  'The End': [-503, 101, -275],
  'Crimson Isle': [-361, 80, -431],
  'Garden': [-6, 71, 17],
  'The Rift': [-45, 122, 69],
  'Backwater Bayou': [-13, 74, -11],
  'Dark Auction': [91, 75, 180],
  'Catacombs': [0, 100, 0],
  'Mineshaft': [-182, 100, -192],
  'Kuudra': [-101, 100, -186],
  'Jerry\'s Workshop': [-5, 76, 100]
};
/** @type {StateVar<'' | keyof typeof spawnLocations>} */
export const stateIsland = new StateVar('');
let stateListenIsland = new StateVar(false);
/** @param {StateVar<boolean>} state */
export function registerListenIsland(state) {
  stateListenIsland = new StateProp(stateListenIsland).or(state);
  playerSpawnReg.setEnabled(stateListenIsland);
}

const posKey = (x, y, z) => `${x},${y},${z}`;
const locationMap = new Map(Object.entries(spawnLocations).map(([k, [x, y, z]]) => [posKey(x, y, z), k]));
function updateSpawnPoint(bp) {
  if (!bp) return;
  const spawn = getBlockPos(bp);
  const key = posKey(spawn.x, spawn.y, spawn.z);
  stateIsland.set(locationMap.get(key) ?? '');
}
listenPostInit(() => Client.scheduleTask(() => {
  if (World.isLoaded()) updateSpawnPoint(Player.getPlayer().func_180470_cg());
}));
const playerSpawnReg = reg('packetReceived', pack => updateSpawnPoint(pack.func_179800_a())).setFilteredClass(net.minecraft.network.play.server.S05PacketSpawnPosition).setEnabled(stateListenIsland).register();