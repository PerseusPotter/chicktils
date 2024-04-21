import settings from '../settings';
import { execCmd } from '../util/format';
import { reg } from '../util/registerer';

function sanitizeName(str) {
  return str.toUpperCase().replace(/[^A-Za-z0-9]/g, '');
}
function sanitizeId(str) {
  return str.toUpperCase();
}
let ids = [
  'JACOBS_TICKET', 'REFINED_MINERAL', 'TIGER_SHARK_TOOTH', 'NURSE_SHARK_TOOTH', 'SHARK_FIN', 'BLUE_SHARK_TOOTH', 'ENCHANTED_SULPHUR_CUBE', 'ENCHANTED_EMERALD_BLOCK', 'ECTOPLASM', 'NETHERRACK', 'WISE_FRAGMENT', 'ENCHANTED_ACACIA_LOG', 'MIMIC_FRAGMENT', 'GIANT_FRAGMENT_BOULDER', 'ENCHANTED_BIRCH_LOG', 'OBSIDIAN', 'YOUNG_FRAGMENT', 'RABBIT_HIDE', 'ENCHANTED_REDSTONE_BLOCK', 'ENCHANTED_MAGMA_CREAM', 'ENCHANTED_DIAMOND_BLOCK', 'ENCHANTED_SAND', 'ENCHANTED_BONE', 'ENCHANTED_BREAD', 'ENCHANTED_CLAY_BALL', 'STONE', 'ENCHANTED_RAW_FISH', 'MELON', 'GOLD_INGOT', 'HAY_BALE', 'PLASMA', 'GRAVEL', 'GOLEM_POPPY', 'ENCHANTED_COOKED_MUTTON', 'ENCHANTED_PRISMARINE_SHARD', 'ENCHANTED_BAKED_POTATO', 'GIANT_FRAGMENT_BIGFOOT', 'PUMPKIN', 'SPECTRE_DUST', 'EGG', 'PROTECTOR_FRAGMENT', 'ENCHANTED_RABBIT', 'ENCHANTED_WET_SPONGE', 'BLAZE_ASHES', 'ENCHANTED_STRING', 'ENDER_PEARL', 'ENCHANTED_COBBLESTONE', 'FLAMING_HEART', 'CONTROL_SWITCH', 'SAPLING:2', 'BOB_OMB', 'ENCHANTED_ENDSTONE', 'CACTUS', 'POLISHED_PUMPKIN', 'ENCHANTED_PACKED_ICE', 'ENCHANTED_COAL', 'FEATHER', 'ENCHANTED_RAW_SALMON', 'SLUDGE_JUICE', 'HALLOWED_SKULL', 'FEL_PEARL', 'ENCHANTED_HAY_BLOCK', 'CORRUPTED_FRAGMENT', 'ENCHANTED_GHAST_TEAR', 'ENCHANTED_MYCELIUM', 'WEREWOLF_SKIN', 'ENCHANTED_LAPIS_LAZULI_BLOCK', 'DUNGEON_TRAP', 'BROWN_MUSHROOM', 'ENCHANTED_COOKED_FISH', 'INK_SACK:3', 'MAGMA_CHUNK', 'DUNGEON_DECOY', 'PORK', 'ENCHANTED_CARROT', 'ENCHANTED_CLOWNFISH', 'SULPHUR_ORE', 'BUILDER_MELON', 'SCARF_FRAGMENT', 'BONE', 'ENCHANTED_COOKIE', 'RAW_CHICKEN', 'ENCHANTED_RABBIT_FOOT', 'ENCHANTED_ENDER_PEARL', 'LOG:1', 'ENCHANTED_GUNPOWDER', 'ENCHANTED_POTATO', 'POISONOUS_POTATO', 'INK_SACK:2', 'RABBIT_FOOT', 'LOG_2:1', 'MOOGMA_PELT', 'ENCHANTED_RED_SAND_CUBE', 'MAGMA_FISH_GOLD', 'SPIDER_EYE', 'ENCHANTED_COAL_BLOCK', 'ENCHANTED_POISONOUS_POTATO', 'ENCHANTED_QUARTZ', 'PRISMARINE_CRYSTALS', 'ENCHANTED_OAK_LOG', 'SPONGE', 'MUTANT_NETHER_STALK', 'MYCEL', 'TREASURITE', 'ENCHANTED_ICE', 'ENCHANTED_BONE_BLOCK', 'GREEN_GIFT', 'SNOW_BLOCK', 'ENCHANTED_GOLDEN_CARROT', 'DIAMOND', 'ENCHANTED_REDSTONE', 'UNSTABLE_FRAGMENT', 'TIGHTLY_TIED_HAY_BALE', 'LEATHER', 'WITHER_CATALYST', 'COBBLESTONE', 'GLACITE_JEWEL', 'SULPHUR', 'SORROW', 'ENCHANTED_FISH:2', 'LOG', 'SUPERLITE_MOTOR', 'SAPLING:1', 'PRISMARINE_SHARD', 'STRING', 'ENCHANTED_IRON_BLOCK', 'ENCHANTED_COCOA', 'PURPLE_CANDY', 'LUMINO_FIBER', 'STARFALL', 'CLAY', 'ENCHANTED_GOLD', 'REKINDLED_EMBER_FRAGMENT', 'ENCHANTED_PRISMARINE_CRYSTALS', 'ENCHANTED_HUGE_MUSHROOM_2', 'RAW_FISH:1', 'SUPERBOOM_TNT', 'ENCHANTED_SUGAR', 'GAZING_PEARL', 'ENCHANTED_WATER_LILY', 'RABBIT', 'CARROT_ITEM', 'SAPLING', 'WHITE_GIFT', 'ENCHANTED_OBSIDIAN', 'ENCHANTED_SPRUCE_LOG', 'DIGESTED_MUSHROOMS', 'MAGMAG', 'MUTATED_BLAZE_ASHES', 'ENCHANTED_MELON_BLOCK', 'HEALING_TISSUE', 'REDSTONE', 'ENCHANTED_SLIME_BLOCK', 'HAY_BLOCK', 'ENCHANTED_INK_SACK', 'Z', 'BUILDER_CACTUS', 'ENCHANTED_GLOWSTONE', 'ENCHANTED_RAW_CHICKEN', 'TITANIUM_ORE', 'ENCHANTED_GLOWSTONE_DUST', 'SUPER_EGG', 'RAW_FISH:2', 'ENCHANTED_MYCELIUM_CUBE', 'ENCHANTED_IRON', 'IRON_INGOT', 'CORLEONITE', 'CRYSTAL_FRAGMENT', 'ENCHANTED_ROTTEN_FLESH', 'SUPERIOR_FRAGMENT', 'RAW_FISH', 'BIOFUEL', 'BEZOS', 'ENCHANTED_SPONGE', 'JUNGLE_KEY', 'WHEAT', 'PACKED_ICE', 'CHEESE_FUEL', 'ENCHANTED_TITANIUM', 'MITHRIL_ORE', 'ENCHANTED_PORK', 'GIANT_FRAGMENT_LASER', 'ENDER_STONE', 'Y', 'HARD_STONE', 'HOLY_FRAGMENT', 'BUILDER_APPLE', 'ENCHANTED_SEEDS', 'ENCHANTED_EMERALD', 'WATER_LILY', 'SUGAR_CANE', 'SLIME_BALL', 'COMPACT_OOZE', 'NETHER_STALK', 'ENCHANTED_LEATHER', 'SPELL_POWDER', 'ENCHANTED_NETHER_STALK', 'ENCHANTED_SLIME_BALL', 'BUILDER_BROWN_MUSHROOM', 'ABSOLUTE_ENDER_PEARL', 'INK_SACK:4', 'ENCHANTED_GOLD_BLOCK', 'ENCHANTED_BROWN_MUSHROOM', 'ENCHANTED_CACTUS_GREEN', 'LOG_2', 'VOLTA', 'NETHER_STAR', 'ENCHANTED_EGG', 'YOGGIE', 'EMERALD', 'OIL_BARREL', 'APPLE', 'ENCHANTED_PUMPKIN', 'LAVA_SHELL', 'BLAZE_ROD', 'FLINT', 'ENCHANTED_PUFFERFISH', 'ENCHANTED_RAW_BEEF', 'OLD_FRAGMENT', 'INK_SACK', 'SAND:1', 'ENCHANTED_FEATHER', 'LOG:3', 'COAL', 'GREEN_CANDY', 'ENCHANTED_JUNGLE_LOG', 'SYNTHETIC_HEART', 'ENCHANTED_DIAMOND', 'ENCHANTED_BLAZE_POWDER', 'LIVID_FRAGMENT', 'ENCHANTED_SULPHUR', 'ENCHANTED_DARK_OAK_LOG', 'ENCHANTED_BLAZE_ROD', 'RAW_SOULFLOW', 'LOG:2', 'ENCHANTED_HUGE_MUSHROOM_1', 'ENCHANTED_MITHRIL', 'ENCHANTED_MUTTON', 'SAPLING:3', 'ENCHANTED_RABBIT_HIDE', 'SNOW_BALL', 'RAW_FISH:3', 'CLAY_BALL', 'ENCHANTED_LAPIS_LAZULI', 'ELECTRON_TRANSMITTER', 'GHAST_TEAR', 'KUUDRA_TEETH', 'BURNING_EYE', 'ENCHANTED_QUARTZ_BLOCK', 'BLAZE_POWDER', 'RAW_BEEF', 'ENCHANTED_WOOL', 'MAGMA_CREAM', 'STRONG_FRAGMENT', 'QUARTZ', 'ENCHANTED_RED_MUSHROOM', 'PYROCLASTIC_SCALE', 'X', 'ROTTEN_FLESH', 'THUNDER_SHARDS', 'FLAMES', 'ENCHANTED_SNOW_BLOCK', 'FTX_3070', 'ENCHANTED_MELON', 'ENCHANTED_GRILLED_PORK', 'ENCHANTED_RED_SAND', 'PUMPKIN_GUTS', 'HEAVY_PEARL', 'CORRUPTED_NETHER_STAR', 'ENCHANTED_SHARK_FIN', 'MUTTON', 'ENCHANTED_SPIDER_EYE', 'LEATHER_CLOTH', 'ENCHANTED_SUGAR_CANE', 'INFLATABLE_JERRY', 'ROBOTRON_REFLECTOR', 'POTATO_ITEM', 'ENCHANTED_FLINT', 'ENCHANTED_CACTUS', 'ENCHANTED_HARD_STONE', 'MAGMA_FISH', 'ENCHANTED_COOKED_SALMON', 'RED_MUSHROOM', 'MAGMA_FISH_SILVER', 'KADA_LEAD', 'GLOWSTONE_DUST', 'SPOOKY_SHARD', 'WITHER_SOUL', 'ENCHANTED_NETHERRACK', 'SEEDS', 'MILLENIA_OLD_BLAZE_ASHES', 'CRUDE_GABAGOOL', 'CHILI_PEPPER', 'DERELICT_ASHE', 'WHIPPED_MAGMA_CREAM', 'SOULFLOW', 'NULL_ATOM', 'NULL_SPHERE', 'TARANTULA_WEB', 'SPIDER_CATALYST', 'REVENANT_FLESH', 'UNDEAD_CATALYST', 'REVENANT_CATALYST', 'WOLF_TOOTH', 'SQUASH', 'COMPOST', 'DUNG', 'HONEY_JAR', 'PLANT_MATTER', 'CROPIE', 'GLACIAL_FRAGMENT', 'WALNUT', 'AGARIMOO_TONGUE', 'GOBLIN_EGG', 'MITE_GEL', 'RITUAL_RESIDUE', 'GLOWING_MUSHROOM', 'CHUM', 'SPIRIT_LEAP', 'BONZO_FRAGMENT', 'ARCHITECT_FIRST_DRAFT', 'KISMET_FEATHER'
];
let names = [
  'Jacob\'s Ticket', 'Refined Mineral', 'Tiger Shark Tooth', 'Nurse Shark Tooth', 'Shark Fin', 'Blue Shark Tooth', 'Enchanted Sulphur Cube', 'Enchanted Emerald Block', 'Ectoplasm', 'Netherrack', 'Wise Dragon Fragment', 'Enchanted Acacia Wood', 'Mimic Fragment', 'Jolly Pink Rock', 'Enchanted Birch Wood', 'Obsidian', 'Young Dragon Fragment', 'Rabbit Hide', 'Enchanted Redstone Block', 'Enchanted Magma Cream', 'Enchanted Diamond Block', 'Enchanted Sand', 'Enchanted Bone', 'Enchanted Bread', 'Enchanted Clay', 'Stone', 'Enchanted Raw Fish', 'Melon', 'Gold Ingot', 'Hay Bale', 'Plasma', 'Gravel', 'Ancient Rose', 'Enchanted Cooked Mutton', 'Enchanted Prismarine Shard', 'Enchanted Baked Potato', 'Bigfoot\'s Lasso', 'Pumpkin', 'Spectre Dust', 'Egg', 'Protector Dragon Fragment', 'Enchanted Raw Rabbit', 'Enchanted Wet Sponge', 'Blaze Ashes', 'Enchanted String', 'Ender Pearl', 'Enchanted Cobblestone', 'Flaming Heart', 'Control Switch', 'Birch Sapling', 'Bob-omb', 'Enchanted End Stone', 'Cactus', 'Polished Pumpkin', 'Enchanted Packed Ice', 'Enchanted Coal', 'Feather', 'Enchanted Raw Salmon', 'Sludge Juice', 'Hallowed Skull', 'Fel Pearl', 'Enchanted Hay Bale', 'Corrupted Fragment', 'Enchanted Ghast Tear', 'Enchanted Mycelium', 'Werewolf Skin', 'Enchanted Lapis Block', 'Trap', 'Brown Mushroom', 'Enchanted Cooked Fish', 'Cocoa Beans', 'Magma Chunk', 'Decoy', 'Raw Porkchop', 'Enchanted Carrot', 'Enchanted Clownfish', 'Sulphur', 'Melon', 'Scarf Fragment', 'Bone', 'Enchanted Cookie', 'Raw Chicken', 'Enchanted Rabbit Foot', 'Enchanted Ender Pearl', 'Spruce Wood', 'Enchanted Gunpowder', 'Enchanted Potato', 'Poisonous Potato', 'Cactus Green', 'Rabbit\'s Foot', 'Dark Oak Wood', 'Moogma Pelt', 'Enchanted Red Sand Cube', 'Gold Magmafish', 'Spider Eye', 'Enchanted Coal Block', 'Enchanted Poisonous Potato', 'Enchanted Quartz', 'Prismarine Crystals', 'Enchanted Oak Wood', 'Sponge', 'Mutant Nether Wart', 'Mycelium', 'Treasurite', 'Enchanted Ice', 'Enchanted Bone Block', 'Green Gift', 'Snow Block', 'Enchanted Golden Carrot', 'Diamond', 'Enchanted Redstone', 'Unstable Dragon Fragment', 'Tightly-Tied Hay Bale', 'Leather', 'Wither Catalyst', 'Cobblestone', 'Glacite Jewel', 'Gunpowder', 'Sorrow', 'Enchanted Clownfish', 'Oak Wood', 'Superlite Motor', 'Spruce Sapling', 'Prismarine Shard', 'String', 'Enchanted Iron Block', 'Enchanted Cocoa Beans', 'Purple Candy', 'Lumino Fiber', 'Starfall', 'Clay', 'Enchanted Gold', 'Rekindled Ember Fragment', 'Enchanted Prismarine Crystals', 'Enchanted Red Mushroom Block', 'Raw Salmon', 'Superboom TNT', 'Enchanted Sugar', 'Gazing Pearl', 'Enchanted Lily Pad', 'Raw Rabbit', 'Carrot', 'Oak Sapling', 'White Gift', 'Enchanted Obsidian', 'Enchanted Spruce Wood', 'Digested Mushrooms', 'Magmag', 'Mutated Blaze Ashes', 'Enchanted Melon Block', 'Healing Tissue', 'Redstone', 'Enchanted Slime Block', 'Hay Bale', 'Enchanted Ink Sac', 'Z', 'Cactus', 'Enchanted Glowstone', 'Enchanted Raw Chicken', 'Titanium', 'Enchanted Glowstone Dust', 'Super Enchanted Egg', 'Clownfish', 'Enchanted Mycelium Cube', 'Enchanted Iron', 'Iron Ingot', 'Corleonite', 'Crystal Fragment', 'Enchanted Rotten Flesh', 'Superior Dragon Fragment', 'Raw Fish', 'Biofuel', 'Bezos', 'Enchanted Sponge', 'Jungle Key', 'Wheat', 'Packed Ice', 'Tasty Cheese', 'Enchanted Titanium', 'Mithril', 'Enchanted Pork', 'L.A.S.R.\'s Eye', 'End Stone', 'Y', 'Hard Stone', 'Holy Dragon Fragment', 'Apple', 'Enchanted Seeds', 'Enchanted Emerald', 'Lily Pad', 'Sugar Cane', 'Slimeball', 'Compact Ooze', 'Nether Wart', 'Enchanted Leather', 'Spell Powder', 'Enchanted Nether Wart', 'Enchanted Slimeball', 'Brown Mushroom', 'Absolute Ender Pearl', 'Lapis Lazuli', 'Enchanted Gold Block', 'Enchanted Brown Mushroom', 'Enchanted Cactus Green', 'Acacia Wood', 'Volta', 'Nether Star', 'Enchanted Egg', 'Yoggie', 'Emerald', 'Oil Barrel', 'Apple', 'Enchanted Pumpkin', 'Lava Shell', 'Blaze Rod', 'Flint', 'Enchanted Pufferfish', 'Enchanted Raw Beef', 'Old Dragon Fragment', 'Ink Sac', 'Red Sand', 'Enchanted Feather', 'Jungle Wood', 'Coal', 'Green Candy', 'Enchanted Jungle Wood', 'Synthetic Heart', 'Enchanted Diamond', 'Enchanted Blaze Powder', 'Livid Fragment', 'Enchanted Sulphur', 'Enchanted Dark Oak Wood', 'Enchanted Blaze Rod', 'Raw Soulflow', 'Birch Wood', 'Enchanted Brown Mushroom Block', 'Enchanted Mithril', 'Enchanted Mutton', 'Jungle Sapling', 'Enchanted Rabbit Hide', 'Snowball', 'Pufferfish', 'Clay', 'Enchanted Lapis Lazuli', 'Electron Transmitter', 'Ghast Tear', 'Kuudra Teeth', 'Burning Eye', 'Enchanted Quartz Block', 'Blaze Powder', 'Raw Beef', 'Enchanted Wool', 'Magma Cream', 'Strong Dragon Fragment', 'Nether Quartz', 'Enchanted Red Mushroom', 'Pyroclastic Scale', 'X', 'Rotten Flesh', 'Thunder Shards', 'Flames', 'Enchanted Snow Block', 'FTX 3070', 'Enchanted Melon', 'Enchanted Grilled Pork', 'Enchanted Red Sand', 'Pumpkin Guts', 'Heavy Pearl', 'Nether Star', 'Enchanted Shark Fin', 'Mutton', 'Enchanted Spider Eye', 'Leather Cloth', 'Enchanted Sugar Cane', 'Inflatable Jerry', 'Robotron Reflector', 'Potato', 'Enchanted Flint', 'Enchanted Cactus', 'Enchanted Hard Stone', 'Magmafish', 'Enchanted Cooked Salmon', 'Red Mushroom', 'Silver Magmafish', 'Kada Lead', 'Glowstone Dust', 'Spooky Shard', 'Wither Soul', 'Enchanted Netherrack', 'Seeds', 'Millenia-Old Blaze Ashes', 'Crude Gabagool', 'Chili Pepper', 'Derelict Ashe', 'Whipped Magma Cream', 'Soulflow', 'Null Atom', 'Null Sphere', 'Tarantula Web', 'Spider Catalyst', 'Revenant Flesh', 'Undead Catalyst', 'Revenant Catalyst', 'Wolf Tooth', 'Squash', 'Compost', 'Dung', 'Honey Jar', 'Plant Matter', 'Cropie', 'Glacial Fragment', 'Walnut', 'Agarimoo Tongue', 'Goblin Egg', 'Mite Gel', 'Ritual Residue', 'Glowing Mushroom', 'Chum', 'Spirit Leap', 'Bonzo Fragment', 'Architect\'s First Draft', 'Kismet Feather'
].map(v => v.split(' '));
const idMap = new Array(ids.length).fill(0).map((_, i) => i);
const nameMap = new Array(ids.length).fill(0).map((_, i) => i);
idMap.sort((a, b) => ids[a].localeCompare(ids[b], ['en-US']));
nameMap.sort((a, b) => {
  let i = 0;
  while (i < names[a].length && i < names[b].length) {
    let c = names[a][i].localeCompare(ids[b][i], ['en-US']);
    if (c !== 0) return c;
    i++;
  }
  return names[a].length - names[b].length;
});
ids = idMap.reduce((a, v, i) => ((a[i] = ids[v]), a), []);
names = nameMap.reduce((a, v, i) => ((a[i] = names[v]), a), []);
const idMapRev = idMap.reduce((a, v, i) => ((a[v] = i), a), []);
const nameMapRev = nameMap.reduce((a, v, i) => ((a[v] = i), a), []);
const santNames = names.map(v => v.map(v => sanitizeName(v)));

// TODO: cache and invalidate once key typed in chat
// forge smh
// /gfs enchanted -> /gfs E<nchanted|NCHANTED_...> -> /gfs ECTOPLASM
let dumbBullshit;
let dumbBullshitTime = 0;
/**
 * @param {string[]} args
 * @returns {string[][]}
 */
function fix(args) {
  const t = Date.now();
  if (t - dumbBullshitTime < 1000) return dumbBullshit;
  const arr = [['gfs']];
  if (!args || args.length === 0) return arr;
  args = args.map(v => String(v));
  let amt = settings.betterGFSBlankAmount.toString();
  if (/^\d+$/.test(args[args.length - 1])) amt = args.pop();
  const possIds = new Set();
  if (args.length === 1) {
    const n = sanitizeId(args[0]);
    ids.forEach((v, k) => v.startsWith(n) && possIds.add(k));
    // ids.forEach((v, k) => v.includes(n) && possIds.add(k));
  }
  args = args.map(v => sanitizeName(v));
  const possNames = new Set();
  santNames.forEach((v, k) => v.length >= args.length && args.every((a, i) => v[i].startsWith(a)) && possNames.add(k));
  // santNames.forEach((v, k) => v.length >= args.length && args.every((a, i) => v[i][i === args.length - 1 ? 'startsWith' : 'includes'](a)) && possNames.add(k));
  // santNames.forEach((v, k) => v.length >= args.length && args.every((a, i) => v[i].includes(a)) && possNames.add(k));
  arr.push([]);
  function addNames() {
    if (args.length === 1) possNames.forEach(v => arr[1].push(names[v].join(' ')));
    else {
      const n = [];
      possNames.forEach(v => names[v].forEach((v, i) => {
        if (i === n.length) n.push(new Set());
        n[i].add(v);
      }));
      n.forEach((v, i) => {
        if (i + 1 === arr.length) arr.push([]);
        Array.prototype.push.apply(arr[i + 1], Array.from(v));
      });
    }
  }
  switch (settings.betterGFSIDPref) {
    case 'ID':
      possNames.forEach(v => possIds.add(idMapRev[nameMap[v]]));
      possIds.forEach(v => arr[1].push(ids[v]));
      break;
    case 'Name':
      possIds.forEach(v => possNames.add(nameMapRev[idMap[v]]));
      addNames();
      break;
    case 'Dynamic': {
      const idPrio = possIds.size > 0;
      possIds.forEach(v => possNames.add(nameMapRev[idMap[v]]));
      possNames.forEach(v => possIds.add(idMapRev[nameMap[v]]));
      if (idPrio) possIds.forEach(v => arr[1].push(ids[v]));
      addNames();
      if (!idPrio) possIds.forEach(v => arr[1].push(ids[v]));
      break;
    }
  }
  if (possNames.size === 0 && possIds.size === 0) arr[0].push('not scuffed');
  arr.push([amt]);
  dumbBullshit = arr;
  dumbBullshitTime = t;
  return arr;
}

const cmdReg = reg('command', ...args => {
  if (!args) args = [];
  const cmd = fix(args);
  if (cmd[0].length !== 1) execCmd(['gfs', ...args].join(' '));
  else execCmd(cmd.map(v => v[0]).join(' '));
}).setTabCompletions(args => fix(args)[args.length] || []);

export function init() { }
export function load() {
  // cmdReg.register();
  cmdReg.setName('gfs', true);
}
export function unload() {
  cmdReg.unregister();
}