import settings from '../settings';
import { execCmd } from '../util/format';
import reg from '../util/registerer';

function sanitizeName(str) {
  return str.toUpperCase().replace(/[^A-Za-z0-9]/g, '');
}
function sanitizeId(str) {
  return str.toUpperCase();
}
let ids = [
  "BLOBFISH_BRONZE", "FLYFISH_BRONZE", "GOLDEN_FISH_BRONZE", "GUSHER_BRONZE", "KARATE_FISH_BRONZE", "LAVAHORSE_BRONZE", "MANA_RAY_BRONZE", "MOLDIN_BRONZE", "SKELETON_FISH_BRONZE", "SLUGFISH_BRONZE", "SOUL_FISH_BRONZE", "STEAMING_HOT_FLOUNDER_BRONZE", "SULPHUR_SKITTER_BRONZE", "VANILLE_BRONZE", "VOLCANIC_STONEFISH_BRONZE", "BLOBFISH_SILVER", "FLYFISH_SILVER", "GOLDEN_FISH_SILVER", "GUSHER_SILVER", "KARATE_FISH_SILVER", "LAVAHORSE_SILVER", "MANA_RAY_SILVER", "MOLDIN_SILVER", "SKELETON_FISH_SILVER", "SLUGFISH_SILVER", "SOUL_FISH_SILVER", "STEAMING_HOT_FLOUNDER_SILVER", "SULPHUR_SKITTER_SILVER", "VANILLE_SILVER", "VOLCANIC_STONEFISH_SILVER", "OBFUSCATED_FISH_1_BRONZE", "OBFUSCATED_FISH_2_BRONZE", "OBFUSCATED_FISH_3_BRONZE", "OBFUSCATED_FISH_1_SILVER", "OBFUSCATED_FISH_2_SILVER", "OBFUSCATED_FISH_3_SILVER", "ROUGH_JADE_GEM", "ROUGH_AMBER_GEM", "ROUGH_TOPAZ_GEM", "ROUGH_SAPPHIRE_GEM", "ROUGH_AMETHYST_GEM", "ROUGH_JASPER_GEM", "ROUGH_RUBY_GEM", "ROUGH_OPAL_GEM", "ROUGH_ONYX_GEM", "ROUGH_AQUAMARINE_GEM", "ROUGH_CITRINE_GEM", "ROUGH_PERIDOT_GEM", "FLAWED_JADE_GEM", "FLAWED_AMBER_GEM", "FLAWED_TOPAZ_GEM", "FLAWED_SAPPHIRE_GEM", "FLAWED_AMETHYST_GEM", "FLAWED_JASPER_GEM", "FLAWED_RUBY_GEM", "FLAWED_OPAL_GEM", "FLAWED_ONYX_GEM", "FLAWED_AQUAMARINE_GEM", "FLAWED_CITRINE_GEM", "FLAWED_PERIDOT_GEM", "FINE_JADE_GEM", "FINE_AMBER_GEM", "FINE_TOPAZ_GEM", "FINE_SAPPHIRE_GEM", "FINE_AMETHYST_GEM", "FINE_JASPER_GEM", "FINE_RUBY_GEM", "FINE_OPAL_GEM", "FINE_ONYX_GEM", "FINE_AQUAMARINE_GEM", "FINE_CITRINE_GEM", "FINE_PERIDOT_GEM", "ASCENSION_ROPE", "BOB_OMB", "CONTROL_SWITCH", "CORLEONITE", "ELECTRON_TRANSMITTER", "FTX_3070", "JUNGLE_KEY", "OIL_BARREL", "ROBOTRON_REFLECTOR", "SLUDGE_JUICE", "SUPERLITE_MOTOR", "SYNTHETIC_HEART", "WISHING_COMPASS", "YOGGIE", "GOLEM_POPPY", "ARCHITECT_FIRST_DRAFT", "GIANT_FRAGMENT_BIGFOOT", "BONZO_FRAGMENT", "DUNGEON_DECOY", "DUNGEON_CHEST_KEY", "FEL_PEARL", "HEALING_TISSUE", "INFLATABLE_JERRY", "GIANT_FRAGMENT_BOULDER", "KISMET_FEATHER", "GIANT_FRAGMENT_LASER", "LIVID_FRAGMENT", "MIMIC_FRAGMENT", "SCARF_FRAGMENT", "SPIRIT_LEAP", "SUPERBOOM_TNT", "THORN_FRAGMENT", "DUNGEON_TRAP", "WITHER_CATALYST", "BIOFUEL", "GLACITE_JEWEL", "GOBLIN_EGG", "OIL_BARREL", "PLASMA", "SORROW", "VOLTA", "GOBLIN_EGG_BLUE", "GOBLIN_EGG_GREEN", "GOBLIN_EGG_RED", "GOBLIN_EGG_YELLOW", "RED_ROSE:2", "RED_ROSE:3", "RED_ROSE:1", "YELLOW_FLOWER", "ENCHANTED_DANDELION", "ENCHANTED_POPPY", "ENDSTONE_ROSE", "DOUBLE_PLANT:1", "RED_ROSE:5", "RED_ROSE:8", "DOUBLE_PLANT:5", "RED_ROSE:7", "RED_ROSE", "RED_ROSE:4", "DOUBLE_PLANT:4", "DOUBLE_PLANT", "RED_ROSE:6", "COMPOST", "CROPIE", "DUNG", "HONEY_JAR", "JACOBS_TICKET", "PLANT_MATTER", "SQUASH", "CHEESE_FUEL", "BROWN_MUSHROOM", "CACTUS", "INK_SACK:2", "CARROT_ITEM", "INK_SACK:3", "COMPOST", "CROPIE", "GOLDEN_CARROT", "HAY_BALE", "MELON", "NETHER_STALK", "POISONOUS_POTATO", "POTATO_ITEM", "PUMPKIN", "RED_MUSHROOM", "SEEDS", "SQUASH", "SUGAR_CANE", "WHEAT", "BLAZE_ROD", "BONE", "CHILI_PEPPER", "ENDER_PEARL", "GHAST_TEAR", "SULPHUR", "MAGMA_CREAM", "ROTTEN_FLESH", "SLIME_BALL", "SPIDER_EYE", "STRING", "CRYSTAL_FRAGMENT", "HOLY_FRAGMENT", "MITE_GEL", "OLD_FRAGMENT", "PROTECTOR_FRAGMENT", "RITUAL_RESIDUE", "STRONG_FRAGMENT", "SUPERIOR_FRAGMENT", "UNSTABLE_FRAGMENT", "WISE_FRAGMENT", "YOUNG_FRAGMENT", "ENCHANTED_BROWN_MUSHROOM", "ENCHANTED_HUGE_MUSHROOM_1", "ENCHANTED_CACTUS_GREEN", "ENCHANTED_CACTUS", "ENCHANTED_CARROT", "ENCHANTED_GOLDEN_CARROT", "ENCHANTED_COCOA", "ENCHANTED_COOKIE", "ENCHANTED_MELON", "ENCHANTED_MELON_BLOCK", "ENCHANTED_NETHER_STALK", "MUTANT_NETHER_STALK", "ENCHANTED_POTATO", "ENCHANTED_BAKED_POTATO", "ENCHANTED_POISONOUS_POTATO", "ENCHANTED_PUMPKIN", "POLISHED_PUMPKIN", "ENCHANTED_RED_MUSHROOM", "ENCHANTED_HUGE_MUSHROOM_2", "ENCHANTED_SEEDS", "BOX_OF_SEEDS", "ENCHANTED_SUGAR", "ENCHANTED_SUGAR_CANE", "ENCHANTED_BREAD", "ENCHANTED_HAY_BLOCK", "TIGHTLY_TIED_HAY_BALE", "ENCHANTED_BLAZE_POWDER", "ENCHANTED_BLAZE_ROD", "ENCHANTED_BONE", "ENCHANTED_BONE_BLOCK", "STUFFED_CHILI_PEPPER", "ENCHANTED_ENDER_PEARL", "ENCHANTED_EYE_OF_ENDER", "ABSOLUTE_ENDER_PEARL", "ENCHANTED_GHAST_TEAR", "ENCHANTED_GUNPOWDER", "ENCHANTED_MAGMA_CREAM", "WHIPPED_MAGMA_CREAM", "ENCHANTED_ROTTEN_FLESH", "ENCHANTED_SLIME_BALL", "ENCHANTED_SLIME_BLOCK", "ENCHANTED_SPIDER_EYE", "ENCHANTED_STRING", "ENCHANTED_CLAY_BALL", "ENCHANTED_CLOWNFISH", "ENCHANTED_COOKED_FISH", "ENCHANTED_COOKED_SALMON", "ENCHANTED_INK_SACK", "ENCHANTED_WATER_LILY", "ENCHANTED_PRISMARINE_CRYSTALS", "ENCHANTED_PRISMARINE_SHARD", "ENCHANTED_PUFFERFISH", "ENCHANTED_RAW_FISH", "ENCHANTED_RAW_SALMON", "ENCHANTED_SHARK_FIN", "ENCHANTED_SPONGE", "ENCHANTED_WET_SPONGE", "ENCHANTED_ACACIA_LOG", "ENCHANTED_BIRCH_LOG", "ENCHANTED_DARK_OAK_LOG", "ENCHANTED_JUNGLE_LOG", "ENCHANTED_OAK_LOG", "ENCHANTED_SPRUCE_LOG", "ENCHANTED_FEATHER", "ENCHANTED_LEATHER", "ENCHANTED_PORK", "ENCHANTED_RAW_CHICKEN", "ENCHANTED_EGG", "ENCHANTED_MUTTON", "ENCHANTED_RABBIT", "ENCHANTED_RAW_BEEF", "ENCHANTED_RABBIT_HIDE", "ENCHANTED_RABBIT_FOOT", "ENCHANTED_COAL", "ENCHANTED_COAL_BLOCK", "ENCHANTED_COBBLESTONE", "ENCHANTED_DIAMOND", "ENCHANTED_DIAMOND_BLOCK", "ENCHANTED_EMERALD", "ENCHANTED_EMERALD_BLOCK", "ENCHANTED_ENDSTONE", "ENCHANTED_FLINT", "ENCHANTED_GLACITE", "ENCHANTED_GLOWSTONE_DUST", "ENCHANTED_GLOWSTONE", "ENCHANTED_GOLD", "ENCHANTED_GOLD_BLOCK", "ENCHANTED_COAL", "ENCHANTED_COAL_BLOCK", "ENCHANTED_HARD_STONE", "CONCENTRATED_STONE", "ENCHANTED_IRON", "ENCHANTED_IRON_BLOCK", "ENCHANTED_LAPIS_LAZULI", "ENCHANTED_LAPIS_LAZULI_BLOCK", "ENCHANTED_MITHRIL", "ENCHANTED_MYCELIUM", "ENCHANTED_MYCELIUM_CUBE", "ENCHANTED_QUARTZ", "ENCHANTED_QUARTZ_BLOCK", "ENCHANTED_NETHERRACK", "ENCHANTED_OBSIDIAN", "ENCHANTED_RED_SAND", "ENCHANTED_RED_SAND_CUBE", "ENCHANTED_REDSTONE", "ENCHANTED_REDSTONE_BLOCK", "ENCHANTED_SAND", "ENCHANTED_SULPHUR", "ENCHANTED_SULPHUR_CUBE", "ENCHANTED_TITANIUM", "ENCHANTED_TUNGSTEN", "ENCHANTED_UMBER", "AGARIMOO_TONGUE", "BLUE_SHARK_TOOTH", "CHUM", "CLAY", "RAW_FISH:2", "GLOWING_MUSHROOM", "INK_SACK", "WATER_LILY", "NURSE_SHARK_TOOTH", "PRISMARINE_CRYSTALS", "PRISMARINE_SHARD", "RAW_FISH:3", "RAW_FISH", "RAW_FISH:1", "SHARK_FIN", "SPONGE", "TIGER_SHARK_TOOTH", "SAPLING:4", "LOG_2", "BUILDER_APPLE", "SAPLING:2", "LOG:2", "SAPLING:5", "LOG_2:1", "SAPLING:3", "LOG:3", "SAPLING", "LOG", "SAPLING:1", "LOG:1", "EGG", "FEATHER", "LEATHER", "MUTTON", "RABBIT_HIDE", "RABBIT_FOOT", "RAW_BEEF", "RAW_CHICKEN", "PORK", "RABBIT", "WOOL", "BLAZE_POWDER", "COAL", "CUP_OF_BLOOD", "FLAMING_HEART", "MAGMA_FISH_GOLD", "HORN_OF_TAURUS", "LAVA_SHELL", "LUMP_OF_MAGMA", "MAGMA_CREAM", "MAGMA_FISH", "MOOGMA_PELT", "NETHERRACK", "ORB_OF_ENERGY", "PYROCLASTIC_SCALE", "MAGMA_FISH_SILVER", "THUNDER_SHARDS", "COAL", "COBBLESTONE", "DIAMOND", "EMERALD", "ENDER_STONE", "FLINT", "GLACITE", "GLOWSTONE_DUST", "GOLD_INGOT", "GRAVEL", "HARD_STONE", "IRON_INGOT", "INK_SACK:4", "MITHRIL_ORE", "MYCEL", "QUARTZ", "NETHERRACK", "OBSIDIAN", "OIL_BARREL", "PLASMA", "SAND:1", "REDSTONE", "REFINED_MINERAL", "SAND", "STARFALL", "STONE", "TITANIUM_ORE", "TREASURITE", "TUNGSTEN", "UMBER", "VOLTA", "BEZOS", "BLAZE_ASHES", "BLAZE_ROD", "BURNING_EYE", "COMPACT_OOZE", "CORRUPTED_FRAGMENT", "DIGESTED_MUSHROOMS", "FLAMES", "GAZING_PEARL", "GHAST_TEAR", "GLOWSTONE_DUST", "HALLOWED_SKULL", "HEAVY_PEARL", "KADA_LEAD", "KUUDRA_TEETH", "LEATHER_CLOTH", "LUMINO_FIBER", "MAGMA_CHUNK", "MAGMA_CREAM", "MAGMAG", "MILLENIA_OLD_BLAZE_ASHES", "MUTATED_BLAZE_ASHES", "MYCEL", "QUARTZ", "NETHER_STAR", "NETHER_STALK", "NETHERRACK", "SAND:1", "REKINDLED_EMBER_FRAGMENT", "SPECTRE_DUST", "SPELL_POWDER", "SULPHUR_ORE", "TENTACLE_MEAT", "WITHER_SOUL", "X", "Y", "Z", "CRUDE_GABAGOOL", "DERELICT_ASHE", "NULL_ATOM", "NULL_SPHERE", "RAW_SOULFLOW", "REVENANT_CATALYST", "REVENANT_FLESH", "SOULFLOW", "SPIDER_CATALYST", "TARANTULA_WEB", "UNDEAD_CATALYST", "WOLF_TOOTH", "DARK_CANDY", "ECTOPLASM", "GREEN_CANDY", "PUMPKIN_GUTS", "PURPLE_CANDY", "SPOOKY_SHARD", "WEREWOLF_SKIN", "ENCHANTED_ICE", "ENCHANTED_PACKED_ICE", "ENCHANTED_SNOW_BLOCK", "GLACIAL_FRAGMENT", "GREEN_GIFT", "BLUE_ICE_HUNK", "ICE_HUNK", "ICE", "PACKED_ICE", "SNOW_BLOCK", "SNOW_BALL", "WALNUT", "WHITE_GIFT", "WINTER_FRAGMENT", "RED_GIFT", "VOLCANIC_ROCK"
];
let names = [
  "Blobfish BRONZE", "Flyfish BRONZE", "Golden Fish BRONZE", "Gusher BRONZE", "Karate Fish BRONZE", "Lavahorse BRONZE", "Mana Ray BRONZE", "Moldin BRONZE", "Skeleton Fish BRONZE", "Slugfish BRONZE", "Soul Fish BRONZE", "Steaming-Hot Flounder BRONZE", "Sulphur Skitter BRONZE", "Vanille BRONZE", "Volcanic Stonefish BRONZE", "Blobfish SILVER", "Flyfish SILVER", "Golden Fish SILVER", "Gusher SILVER", "Karate Fish SILVER", "Lavahorse SILVER", "Mana Ray SILVER", "Moldin SILVER", "Skeleton Fish SILVER", "Slugfish SILVER", "Soul Fish SILVER", "Steaming-Hot Flounder SILVER", "Sulphur Skitter SILVER", "Vanille SILVER", "Volcanic Stonefish SILVER", "", "", "", "", "", "", "Rough Jade Gemstone", "Rough Amber Gemstone", "Rough Topaz Gemstone", "Rough Sapphire Gemstone", "Rough Amethyst Gemstone", "Rough Jasper Gemstone", "Rough Ruby Gemstone", "Rough Opal Gemstone", "Rough Onyx Gemstone", "Rough Aquamarine Gemstone", "Rough Citrine Gemstone", "Rough Peridot Gemstone", "Flawed Jade Gemstone", "Flawed Amber Gemstone", "Flawed Topaz Gemstone", "Flawed Sapphire Gemstone", "Flawed Amethyst Gemstone", "Flawed Jasper Gemstone", "Flawed Ruby Gemstone", "Flawed Opal Gemstone", "Flawed Onyx Gemstone", "Flawed Aquamarine Gemstone", "Flawed Citrine Gemstone", "Flawed Peridot Gemstone", "Fine Jade Gemstone", "Fine Amber Gemstone", "Fine Topaz Gemstone", "Fine Sapphire Gemstone", "Fine Amethyst Gemstone", "Fine Jasper Gemstone", "Fine Ruby Gemstone", "Fine Opal Gemstone", "Fine Onyx Gemstone", "Fine Aquamarine Gemstone", "Fine Citrine Gemstone", "Fine Peridot Gemstone", "Ascension Rope", "Bob-omb", "Control Switch", "Corleonite", "Electron Transmitter", "FTX 3070", "Jungle Key", "Oil Barrel", "Robotron Reflector", "Sludge Juice", "Superlite Motor", "Synthetic Heart", "Wishing Compass", "Yoggie", "Ancient Rose", "Architect's First Draft", "Bigfoot's Lasso", "Bonzo Fragment", "Decoy", "Dungeon Chest Key", "Fel Pearl", "Healing Tissue", "Inflatable Jerry", "Jolly Pink Rock", "Kismet Feather", "L.A.S.R.'s Eye", "Livid Fragment", "Mimic Fragment", "Scarf Fragment", "Spirit Leap", "Superboom TNT", "Thorn Fragment", "Trap", "Wither Catalyst", "Biofuel", "Glacite Jewel", "Goblin Egg", "Oil Barrel", "Plasma", "Sorrow", "Volta", "Blue Goblin Egg", "Green Goblin Egg", "Red Goblin Egg", "Yellow Goblin Egg", "Allium", "Azure Bluet", "Blue Orchid", "Dandelion", "Enchanted Dandelion", "Enchanted Poppy", "Endstone Rose", "Lilac", "Orange Tulip", "Oxeye Daisy", "Peony", "Pink Tulip", "Poppy", "Red Tulip", "Rose Bush", "Sunflower", "White Tulip", "Compost", "Cropie", "Dung", "Honey Jar", "Jacob's Ticket", "Plant Matter", "Squash", "Tasty Cheese", "Brown Mushroom", "Cactus", "Cactus Green", "Carrot", "Cocoa Beans", "Compost", "Cropie", "Golden Carrot", "Hay Bale", "Melon", "Nether Wart", "Poisonous Potato", "Potato", "Pumpkin", "Red Mushroom", "Seeds", "Squash", "Sugar Cane", "Wheat", "Blaze Rod", "Bone", "Chili Pepper", "Ender Pearl", "Ghast Tear", "Gunpowder", "Magma Cream", "Rotten Flesh", "Slimeball", "Spider Eye", "String", "Crystal Fragment", "Holy Dragon Fragment", "Mite Gel", "Old Dragon Fragment", "Protector Dragon Fragment", "Ritual Residue", "Strong Dragon Fragment", "Superior Dragon Fragment", "Unstable Dragon Fragment", "Wise Dragon Fragment", "Young Dragon Fragment", "Enchanted Brown Mushroom", "Enchanted Brown Mushroom Block", "Enchanted Cactus Green", "Enchanted Cactus", "Enchanted Carrot", "Enchanted Golden Carrot", "Enchanted Cocoa Beans", "Enchanted Cookie", "Enchanted Melon", "Enchanted Melon Block", "Enchanted Nether Wart", "Mutant Nether Wart", "Enchanted Potato", "Enchanted Baked Potato", "Enchanted Poisonous Potato", "Enchanted Pumpkin", "Polished Pumpkin", "Enchanted Red Mushroom", "Enchanted Red Mushroom Block", "Enchanted Seeds", "Box of Seeds", "Enchanted Sugar", "Enchanted Sugar Cane", "Enchanted Bread", "Enchanted Hay Bale", "Tightly-Tied Hay Bale", "Enchanted Blaze Powder", "Enchanted Blaze Rod", "Enchanted Bone", "Enchanted Bone Block", "Stuffed Chili Pepper", "Enchanted Ender Pearl", "Enchanted Eye of Ender", "Absolute Ender Pearl", "Enchanted Ghast Tear", "Enchanted Gunpowder", "Enchanted Magma Cream", "Whipped Magma Cream", "Enchanted Rotten Flesh", "Enchanted Slimeball", "Enchanted Slime Block", "Enchanted Spider Eye", "Enchanted String", "Enchanted Clay", "Enchanted Clownfish", "Enchanted Cooked Fish", "Enchanted Cooked Salmon", "Enchanted Ink Sac", "Enchanted Lily Pad", "Enchanted Prismarine Crystals", "Enchanted Prismarine Shard", "Enchanted Pufferfish", "Enchanted Raw Fish", "Enchanted Raw Salmon", "Enchanted Shark Fin", "Enchanted Sponge", "Enchanted Wet Sponge", "Enchanted Acacia Wood", "Enchanted Birch Wood", "Enchanted Dark Oak Wood", "Enchanted Jungle Wood", "Enchanted Oak Wood", "Enchanted Spruce Wood", "Enchanted Feather", "Enchanted Leather", "Enchanted Pork", "Enchanted Raw Chicken", "Enchanted Egg", "Enchanted Mutton", "Enchanted Raw Rabbit", "Enchanted Raw Beef", "Enchanted Rabbit Hide", "Enchanted Rabbit Foot", "Enchanted Coal", "Enchanted Coal Block", "Enchanted Cobblestone", "Enchanted Diamond", "Enchanted Diamond Block", "Enchanted Emerald", "Enchanted Emerald Block", "Enchanted End Stone", "Enchanted Flint", "Enchanted Glacite", "Enchanted Glowstone Dust", "Enchanted Glowstone", "Enchanted Gold", "Enchanted Gold Block", "Enchanted Coal", "Enchanted Coal Block", "Enchanted Hard Stone", "Concentrated Stone", "Enchanted Iron", "Enchanted Iron Block", "Enchanted Lapis Lazuli", "Enchanted Lapis Block", "Enchanted Mithril", "Enchanted Mycelium", "Enchanted Mycelium Cube", "Enchanted Quartz", "Enchanted Quartz Block", "Enchanted Netherrack", "Enchanted Obsidian", "Enchanted Red Sand", "Enchanted Red Sand Cube", "Enchanted Redstone", "Enchanted Redstone Block", "Enchanted Sand", "Enchanted Sulphur", "Enchanted Sulphur Cube", "Enchanted Titanium", "Enchanted Tungsten", "Enchanted Umber", "Agarimoo Tongue", "Blue Shark Tooth", "Chum", "Clay", "Clownfish", "Glowing Mushroom", "Ink Sac", "Lily Pad", "Nurse Shark Tooth", "Prismarine Crystals", "Prismarine Shard", "Pufferfish", "Raw Fish", "Raw Salmon", "Shark Fin", "Sponge", "Tiger Shark Tooth", "Acacia Sapling", "Acacia Wood", "Apple", "Birch Sapling", "Birch Wood", "Dark Oak Sapling", "Dark Oak Wood", "Jungle Sapling", "Jungle Wood", "Oak Sapling", "Oak Wood", "Spruce Sapling", "Spruce Wood", "Egg", "Feather", "Leather", "Mutton", "Rabbit Hide", "Rabbit's Foot", "Raw Beef", "Raw Chicken", "Raw Porkchop", "Raw Rabbit", "White Wool", "Blaze Powder", "Coal", "Cup of Blood", "Flaming Heart", "Gold Magmafish", "Horn of Taurus", "Lava Shell", "Lump of Magma", "Magma Cream", "Magmafish", "Moogma Pelt", "Netherrack", "Orb of Energy", "Pyroclastic Scale", "Silver Magmafish", "Thunder Shards", "Coal", "Cobblestone", "Diamond", "Emerald", "End Stone", "Flint", "Glacite", "Glowstone Dust", "Gold Ingot", "Gravel", "Hard Stone", "Iron Ingot", "Lapis Lazuli", "Mithril", "Mycelium", "Nether Quartz", "Netherrack", "Obsidian", "Oil Barrel", "Plasma", "Red Sand", "Redstone", "Refined Mineral", "Sand", "Starfall", "Stone", "Titanium", "Treasurite", "Tungsten", "Umber", "Volta", "Bezos", "Blaze Ashes", "Blaze Rod", "Burning Eye", "Compact Ooze", "Corrupted Fragment", "Digested Mushrooms", "Flames", "Gazing Pearl", "Ghast Tear", "Glowstone Dust", "Hallowed Skull", "Heavy Pearl", "Kada Lead", "Kuudra Teeth", "Leather Cloth", "Lumino Fiber", "Magma Chunk", "Magma Cream", "Magmag", "Millenia-Old Blaze Ashes", "Mutated Blaze Ashes", "Mycelium", "Nether Quartz", "Nether Star", "Nether Wart", "Netherrack", "Red Sand", "Rekindled Ember Fragment", "Spectre Dust", "Spell Powder", "Sulphur", "Tentacle Meat", "Wither Soul", "X", "Y", "Z", "Crude Gabagool", "Derelict Ashe", "Null Atom", "Null Sphere", "Raw Soulflow", "Revenant Catalyst", "Revenant Flesh", "Soulflow", "Spider Catalyst", "Tarantula Web", "Undead Catalyst", "Wolf Tooth", "Dark Candy", "Ectoplasm", "Green Candy", "Pumpkin Guts", "Purple Candy", "Spooky Shard", "Werewolf Skin", "Enchanted Ice", "Enchanted Packed Ice", "Enchanted Snow Block", "Glacial Fragment", "Green Gift", "Hunk of Blue Ice", "Hunk of Ice", "Ice", "Packed Ice", "Snow Block", "Snowball", "Walnut", "White Gift", "Winter Fragment", "Red Gift", "Volcanic Rock"
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
 * @param {boolean} multiple
 * @returns {string[][]}
 */
function fix(args, multiple = true) {
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
      if (multiple) {
        const n = [];
        possNames.forEach(v => names[v].forEach((v, i) => {
          if (i === n.length) n.push(new Set());
          n[i].add(v);
        }));
        n.forEach((v, i) => {
          if (i + 1 === arr.length) arr.push([]);
          Array.prototype.push.apply(arr[i + 1], Array.from(v));
        });
      } else if (possNames.length > 0) names[possNames[0]].forEach((v, i) => arr[i + 1].push(v));
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
  const cmd = fix(args, false);
  if (cmd[0].length !== 1) execCmd(['gfs', ...args].join(' '));
  else execCmd(cmd.map(v => v[0]).join(' '));
}).setTabCompletions(args => fix(args)[args.length] || []).setName('gfs', true);

export function init() { }
export function load() {
  cmdReg.register();
}
export function unload() {
  cmdReg.unregister();
}