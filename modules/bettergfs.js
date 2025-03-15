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
  "WHEAT", "HAY_BLOCK", "SEEDS", "CARROT_ITEM", "POTATO_ITEM", "PUMPKIN", "MELON", "INK_SACK-3", "SUGAR_CANE", "CACTUS", "INK_SACK-2", "BROWN_MUSHROOM", "RED_MUSHROOM", "NETHER_STALK", "CROPIE", "SQUASH", "COMPOST", "POISONOUS_POTATO", "GOLDEN_CARROT", "JACK_O_LANTERN", "ENCHANTED_WHEAT", "ENCHANTED_HAY_BALE", "ENCHANTED_SEEDS", "BOX_OF_SEEDS", "ENCHANTED_CARROT", "ENCHANTED_GOLDEN_CARROT", "ENCHANTED_POTATO", "ENCHANTED_BAKED_POTATO", "ENCHANTED_PUMPKIN", "POLISHED_PUMPKIN", "ENCHANTED_MELON", "ENCHANTED_MELON_BLOCK", "ENCHANTED_COCOA", "ENCHANTED_COOKIE", "ENCHANTED_SUGAR", "ENCHANTED_SUGAR_CANE", "ENCHANTED_CACTUS_GREEN", "ENCHANTED_CACTUS", "ENCHANTED_HUGE_MUSHROOM_1", "ENCHANTED_BROWN_MUSHROOM", "ENCHANTED_HUGE_MUSHROOM_2", "ENCHANTED_RED_MUSHROOM", "ENCHANTED_NETHER_STALK", "MUTANT_NETHER_STALK", "ENCHANTED_BREAD", "ENCHANTED_POISONOUS_POTATO", "RAW_CHICKEN", "FEATHER", "EGG", "RAW_BEEF", "LEATHER", "PORK", "MUTTON", "WOOL", "RABBIT", "RABBIT_HIDE", "RABBIT_FOOT", "ENCHANTED_RAW_CHICKEN", "ENCHANTED_FEATHER", "ENCHANTED_EGG", "SUPER_EGG", "ENCHANTED_RAW_BEEF", "ENCHANTED_LEATHER", "ENCHANTED_PORK", "ENCHANTED_GRILLED_PORK", "ENCHANTED_MUTTON", "ENCHANTED_WOOL", "ENCHANTED_COOKED_MUTTON", "ENCHANTED_RABBIT", "ENCHANTED_RABBIT_HIDE", "ENCHANTED_RABBIT_FOOT", "COBBLESTONE", "STONE", "COAL", "IRON_INGOT", "GOLD_INGOT", "INK_SACK-4", "REDSTONE", "EMERALD", "DIAMOND", "ENDER_STONE", "OBSIDIAN", "GRAVEL", "FLINT", "SAND", "SAND-1", "NETHERRACK", "GLOWSTONE_DUST", "QUARTZ", "MYCEL", "MITHRIL_ORE", "TITANIUM_ORE", "HARD_STONE", "STARFALL", "TREASURITE", "OIL_BARREL", "VOLTA", "PLASMA", "REFINED_MINERAL", "GLACITE", "UMBER", "TUNGSTEN", "GLOSSY_GEMSTONE", "SNOW_BLOCK", "ICE", "ENCHANTED_COBBLESTONE", "ENCHANTED_COAL", "ENCHANTED_COAL_BLOCK", "ENCHANTED_IRON", "ENCHANTED_IRON_BLOCK", "ENCHANTED_GOLD", "ENCHANTED_GOLD_BLOCK", "ENCHANTED_LAPIS_LAZULI", "ENCHANTED_LAPIS_LAZULI_BLOCK", "ENCHANTED_REDSTONE", "ENCHANTED_REDSTONE_BLOCK", "ENCHANTED_EMERALD", "ENCHANTED_EMERALD_BLOCK", "ENCHANTED_DIAMOND", "ENCHANTED_DIAMOND_BLOCK", "ENCHANTED_ENDSTONE", "ENCHANTED_OBSIDIAN", "ENCHANTED_FLINT", "ENCHANTED_SAND", "ENCHANTED_RED_SAND", "ENCHANTED_RED_SAND_CUBE", "ENCHANTED_NETHERRACK", "ENCHANTED_GLOWSTONE_DUST", "ENCHANTED_GLOWSTONE", "ENCHANTED_QUARTZ", "ENCHANTED_QUARTZ_BLOCK", "ENCHANTED_MYCELIUM", "ENCHANTED_MYCELIUM_CUBE", "ENCHANTED_MITHRIL", "ENCHANTED_TITANIUM", "ENCHANTED_HARD_STONE", "CONCENTRATED_STONE", "ENCHANTED_SULPHUR", "ENCHANTED_SULPHUR_CUBE", "ENCHANTED_GLACITE", "ENCHANTED_UMBER", "ENCHANTED_TUNGSTEN", "ENCHANTED_SNOW_BLOCK", "ENCHANTED_ICE", "ENCHANTED_PACKED_ICE", "ROTTEN_FLESH", "BONE", "STRING", "SPIDER_EYE", "SLIME_BALL", "SULPHUR", "ENDER_PEARL", "MAGMA_CREAM", "BLAZE_ROD", "GHAST_TEAR", "CHILI_PEPPER", "ENCHANTED_ROTTEN_FLESH", "ENCHANTED_BONE", "ENCHANTED_BONE_BLOCK", "ENCHANTED_STRING", "ENCHANTED_SPIDER_EYE", "ENCHANTED_SLIME_BALL", "ENCHANTED_SLIME_BLOCK", "ENCHANTED_GUNPOWDER", "ENCHANTED_ENDER_PEARL", "ENCHANTED_EYE_OF_ENDER", "ABSOLUTE_ENDER_PEARL", "ENCHANTED_MAGMA_CREAM", "WHIPPED_MAGMA_CREAM", "ENCHANTED_BLAZE_POWDER", "ENCHANTED_BLAZE_ROD", "ENCHANTED_GHAST_TEAR", "STUFFED_CHILI_PEPPER", "CRYSTAL_FRAGMENT", "OLD_FRAGMENT", "PROTECTOR_FRAGMENT", "HOLY_FRAGMENT", "UNSTABLE_FRAGMENT", "YOUNG_FRAGMENT", "WISE_FRAGMENT", "STRONG_FRAGMENT", "SUPERIOR_FRAGMENT", "MITE_GEL", "RITUAL_RESIDUE", "LOG", "LOG-2", "LOG-1", "LOG_2-1", "LOG_2", "LOG-3", "APPLE", "SAPLING", "SAPLING-2", "SAPLING-1", "SAPLING-5", "SAPLING-4", "SAPLING-3", "ENCHANTED_OAK_LOG", "ENCHANTED_BIRCH_LOG", "ENCHANTED_SPRUCE_LOG", "ENCHANTED_DARK_OAK_LOG", "ENCHANTED_ACACIA_LOG", "ENCHANTED_JUNGLE_LOG", "RAW_FISH", "RAW_FISH-1", "RAW_FISH-3", "RAW_FISH-2", "INK_SACK", "PRISMARINE_CRYSTALS", "PRISMARINE_SHARD", "WATER_LILY", "SPONGE", "CLAY_BALL", "SHARK_FIN", "BLUE_SHARK_TOOTH", "NURSE_SHARK_TOOTH", "TIGER_SHARK_TOOTH", "CHUM", "GLOWING_MUSHROOM", "AGARIMOO_TONGUE", "WORM_MEMBRANE", "ENCHANTED_RAW_FISH", "ENCHANTED_COOKED_FISH", "ENCHANTED_RAW_SALMON", "ENCHANTED_COOKED_SALMON", "ENCHANTED_PUFFERFISH", "ENCHANTED_CLOWNFISH", "ENCHANTED_INK_SACK", "ENCHANTED_PRISMARINE_CRYSTALS", "ENCHANTED_PRISMARINE_SHARD", "ENCHANTED_WATER_LILY", "ENCHANTED_SPONGE", "ENCHANTED_WET_SPONGE", "ENCHANTED_CLAY_BALL", "ENCHANTED_SHARK_FIN", "MAGMA_FISH", "MAGMA_CREAM", "LAVA_SHELL", "MAGMA_FISH_SILVER", "ORB_OF_ENERGY", "COAL", "CUP_OF_BLOOD", "HORN_OF_TAURUS", "FLAMING_HEART", "THUNDER_SHARDS", "NETHERRACK", "BLAZE_POWDER", "MAGMA_FISH_GOLD", "MOOGMA_PELT", "PYROCLASTIC_SCALE", "LUMP_OF_MAGMA", "CORRUPTED_NETHER_STAR", "GLOWSTONE_DUST", "DIGESTED_MUSHROOMS", "MUTATED_BLAZE_ASHES", "BURNING_EYE", "BLAZE_ASHES", "LEATHER_CLOTH", "MILLENIA_OLD_BLAZE_ASHES", "MYCEL", "X", "Y", "Z", "BEZOS", "MAGMA_CHUNK", "QUARTZ", "HEAVY_PEARL", "FLAMES", "SAND-1", "KADA_LEAD", "HALLOWED_SKULL", "SPECTRE_DUST", "MAGMA_CREAM", "GHAST_TEAR", "COMPACT_OOZE", "SPELL_POWDER", "GAZING_PEARL", "CORRUPTED_FRAGMENT", "KUUDRA_TEETH", "WITHER_SOUL", "REKINDLED_EMBER_FRAGMENT", "SULPHUR_ORE", "NETHERRACK", "NETHER_STALK", "MAGMAG", "LUMINO_FIBER", "TENTACLE_MEAT", "FTX_3070", "SLUDGE_JUICE", "CORLEONITE", "BOB_OMB", "OIL_BARREL", "SUPERLITE_MOTOR", "CONTROL_SWITCH", "ELECTRON_TRANSMITTER", "ROBOTRON_REFLECTOR", "YOGGIE", "SYNTHETIC_HEART", "JUNGLE_KEY", "WISHING_COMPASS", "ASCENSION_ROPE", "DUNGEON_DECOY", "WITHER_CATALYST", "GIANT_FRAGMENT_BIGFOOT", "BONZO_FRAGMENT", "GOLEM_POPPY", "DUNGEON_TRAP", "HEALING_TISSUE", "SPIRIT_LEAP", "FEL_PEARL", "LIVID_FRAGMENT", "INFLATABLE_JERRY", "SCARF_FRAGMENT", "SUPERBOOM_TNT", "MIMIC_FRAGMENT", "GIANT_FRAGMENT_BOULDER", "GIANT_FRAGMENT_LASER", "DUNGEON_CHEST_KEY", "KISMET_FEATHER", "THORN_FRAGMENT", "ARCHITECT_FIRST_DRAFT", "GOBLIN_EGG", "GOBLIN_EGG_GREEN", "GOBLIN_EGG_YELLOW", "GOBLIN_EGG_RED", "GOBLIN_EGG_BLUE", "GLACITE_JEWEL", "VOLTA", "PLASMA", "SORROW", "BIOFUEL", "OIL_BARREL", "UMBER_KEY", "TUNGSTEN_KEY", "REVENANT_FLESH", "UNDEAD_CATALYST", "REVENANT_CATALYST", "TARANTULA_WEB", "SPIDER_CATALYST", "WOLF_TOOTH", "NULL_SPHERE", "NULL_ATOM", "RAW_SOULFLOW", "SOULFLOW", "DERELICT_ASHE", "CRUDE_GABAGOOL", "BLAZE_ROD_DISTILLATE", "CRUDE_GABAGOOL_DISTILLATE", "GLOWSTONE_DUST_DISTILLATE", "MAGMA_CREAM_DISTILLATE", "NETHER_STALK_DISTILLATE", "GREEN_CANDY", "PURPLE_CANDY", "PUMPKIN_GUTS", "SPOOKY_SHARD", "ECTOPLASM", "WEREWOLF_SKIN", "DARK_CANDY", "ICE", "PACKED_ICE", "ENCHANTED_ICE", "ENCHANTED_PACKED_ICE", "WALNUT", "GLACIAL_FRAGMENT", "WHITE_GIFT", "GREEN_GIFT", "RED_GIFT", "SNOW_BALL", "SNOW_BLOCK", "ENCHANTED_SNOW_BLOCK", "ICE_HUNK", "BLUE_ICE_HUNK", "VOLCANIC_ROCK", "WINTER_FRAGMENT", "PARTY_GIFT", "SULPHUR_SKITTER_BRONZE", "OBFUSCATED_FISH_1_BRONZE", "OBFUSCATED_FISH_2_BRONZE", "OBFUSCATED_FISH_3_BRONZE", "STEAMING_HOT_FLOUNDER_BRONZE", "GUSHER_BRONZE", "BLOBFISH_BRONZE", "SLUGFISH_BRONZE", "FLYFISH_BRONZE", "LAVA_HORSE_BRONZE", "MANA_RAY_BRONZE", "VOLCANIC_STONEFISH_BRONZE", "VANILLE_BRONZE", "SKELETON_FISH_BRONZE", "MOLDFIN_BRONZE", "KARATE_FISH_BRONZE", "SOUL_FISH_BRONZE", "GOLDEN_FISH_BRONZE", "SULPHUR_SKITTER_SILVER", "OBFUSCATED_FISH_1_SILVER", "OBFUSCATED_FISH_2_SILVER", "OBFUSCATED_FISH_3_SILVER", "STEAMING_HOT_FLOUNDER_SILVER", "GUSHER_SILVER", "BLOBFISH_SILVER", "SLUGFISH_SILVER", "FLYFISH_SILVER", "LAVA_HORSE_SILVER", "MANA_RAY_SILVER", "VOLCANIC_STONEFISH_SILVER", "VANILLE_SILVER", "SKELETON_FISH_SILVER", "MOLDFIN_SILVER", "KARATE_FISH_SILVER", "SOUL_FISH_SILVER", "GOLDEN_FISH_SILVER", "CROPIE", "SQUASH", "COMPOST", "HONEY_JAR", "DUNG", "CHEESE_FUEL", "PLANT_MATTER", "JACOBS_TICKET", "FINE_FLOUR", "DOUBLE_PLANT", "DOUBLE_PLANT-1", "DOUBLE_PLANT-4", "DOUBLE_PLANT-5", "RED_ROSE", "RED_ROSE-1", "RED_ROSE-2", "RED_ROSE-3", "RED_ROSE-4", "RED_ROSE-5", "RED_ROSE-6", "RED_ROSE-7", "RED_ROSE-8", "ENDSTONE_ROSE", "ENCHANTED_POPPY", "ENCHANTED_DANDELION", "YELLOW_FLOWER", "ROUGH_AMBER_GEM", "FLAWED_AMBER_GEM", "FINE_AMBER_GEM", "ROUGH_JADE_GEM", "FLAWED_JADE_GEM", "FINE_JADE_GEM", "ROUGH_TOPAZ_GEM", "FLAWED_TOPAZ_GEM", "FINE_TOPAZ_GEM", "ROUGH_SAPPHIRE_GEM", "FLAWED_SAPPHIRE_GEM", "FINE_SAPPHIRE_GEM", "ROUGH_AMETHYST_GEM", "FLAWED_AMETHYST_GEM", "FINE_AMETHYST_GEM", "ROUGH_JASPER_GEM", "FLAWED_JASPER_GEM", "FINE_JASPER_GEM", "ROUGH_RUBY_GEM", "FLAWED_RUBY_GEM", "FINE_RUBY_GEM", "ROUGH_OPAL_GEM", "FLAWED_OPAL_GEM", "FINE_OPAL_GEM", "ROUGH_ONYX_GEM", "FLAWED_ONYX_GEM", "FINE_ONYX_GEM", "ROUGH_AQUAMARINE_GEM", "FLAWED_AQUAMARINE_GEM", "FINE_AQUAMARINE_GEM", "ROUGH_CITRINE_GEM", "FLAWED_CITRINE_GEM", "FINE_CITRINE_GEM", "ROUGH_PERIDOT_GEM", "FLAWED_PERIDOT_GEM", "FINE_PERIDOT_GEM", "ANCIENT_CLAW", "BLUE_SHARK_TOOTH", "CARNIVAL_TICKET", "DARK_CANDY", "ECTOPLASM", "ENCHANTED_SHARK_FIN", "GLACIAL_FRAGMENT", "GLOSSY_GEMSTONE", "GREEN_CANDY", "GRIFFIN_FEATHER", "BLUE_ICE_HUNK", "ICE_HUNK", "NURSE_SHARK_TOOTH", "PARTY_GIFT", "PUMPKIN_GUTS", "PURPLE_CANDY", "REFINED_MINERAL", "SHARK_FIN", "SPOOKY_SHARD", "TIGER_SHARK_TOOTH", "WEREWOLF_SKIN", "WHITE_GIFT", "GREEN_GIFT", "RED_GIFT", "WALNUT", "SNOW_BALL", "VOLCANIC_ROCK", "WINTER_FRAGMENT", "FISHY_TREAT"
];
let names = [
  "Wheat", "Hay Bale", "Seeds", "Carrot", "Potato", "Pumpkin", "Melon", null, "Sugar Cane", "Cactus", null, "Brown Mushroom", "Red Mushroom", "Nether Wart", "Cropie", "Squash", "Compost", "Poisonous Potato", "Golden Carrot", "Jack o' Lantern", "Enchanted Wheat", "Enchanted Hay Bale", "Enchanted Seeds", "Box of Seeds", "Enchanted Carrot", "Enchanted Golden Carrot", "Enchanted Potato", "Enchanted Baked Potato", "Enchanted Pumpkin", "Polished Pumpkin", "Enchanted Melon", "Enchanted Melon Block", "Enchanted Cocoa Beans", "Enchanted Cookie", "Enchanted Sugar", "Enchanted Sugar Cane", "Enchanted Cactus Green", "Enchanted Cactus", "Enchanted Brown Mushroom Block", "Enchanted Brown Mushroom", "Enchanted Red Mushroom Block", "Enchanted Red Mushroom", "Enchanted Nether Wart", "Mutant Nether Wart", "Enchanted Bread", "Enchanted Poisonous Potato", "Raw Chicken", "Feather", "Egg", "Raw Beef", "Leather", "Raw Porkchop", "Mutton", "White Wool", "Raw Rabbit", "Rabbit Hide", "Rabbit's Foot", "Enchanted Raw Chicken", "Enchanted Feather", "Enchanted Egg", "Super Enchanted Egg", "Enchanted Raw Beef", "Enchanted Leather", "Enchanted Pork", "Enchanted Grilled Pork", "Enchanted Mutton", "Enchanted Wool", "Enchanted Cooked Mutton", "Enchanted Raw Rabbit", "Enchanted Rabbit Hide", "Enchanted Rabbit Foot", "Cobblestone", "Stone", "Coal", "Iron Ingot", "Gold Ingot", null, "Redstone", "Emerald", "Diamond", "End Stone", "Obsidian", "Gravel", "Flint", "Sand", null, "Netherrack", "Glowstone Dust", "Nether Quartz", "Mycelium", "Mithril", "Titanium", "Hard Stone", "Starfall", "Treasurite", "Oil Barrel", "Volta", "Plasma", "Refined Mineral", "Glacite", "Umber", "Tungsten", "Glossy Gemstone", "Snow Block", "Ice", "Enchanted Cobblestone", "Enchanted Coal", "Enchanted Coal Block", "Enchanted Iron", "Enchanted Iron Block", "Enchanted Gold", "Enchanted Gold Block", "Enchanted Lapis Lazuli", "Enchanted Lapis Block", "Enchanted Redstone", "Enchanted Redstone Block", "Enchanted Emerald", "Enchanted Emerald Block", "Enchanted Diamond", "Enchanted Diamond Block", "Enchanted End Stone", "Enchanted Obsidian", "Enchanted Flint", "Enchanted Sand", "Enchanted Red Sand", "Enchanted Red Sand Cube", "Enchanted Netherrack", "Enchanted Glowstone Dust", "Enchanted Glowstone", "Enchanted Quartz", "Enchanted Quartz Block", "Enchanted Mycelium", "Enchanted Mycelium Cube", "Enchanted Mithril", "Enchanted Titanium", "Enchanted Hard Stone", "Concentrated Stone", "Enchanted Sulphur", "Enchanted Sulphur Cube", "Enchanted Glacite", "Enchanted Umber", "Enchanted Tungsten", "Enchanted Snow Block", "Enchanted Ice", "Enchanted Packed Ice", "Rotten Flesh", "Bone", "String", "Spider Eye", "Slimeball", "Gunpowder", "Ender Pearl", "Magma Cream", "Blaze Rod", "Ghast Tear", "Chili Pepper", "Enchanted Rotten Flesh", "Enchanted Bone", "Enchanted Bone Block", "Enchanted String", "Enchanted Spider Eye", "Enchanted Slimeball", "Enchanted Slime Block", "Enchanted Gunpowder", "Enchanted Ender Pearl", "Enchanted Eye of Ender", "Absolute Ender Pearl", "Enchanted Magma Cream", "Whipped Magma Cream", "Enchanted Blaze Powder", "Enchanted Blaze Rod", "Enchanted Ghast Tear", "Stuffed Chili Pepper", "Crystal Fragment", "Old Dragon Fragment", "Protector Dragon Fragment", "Holy Dragon Fragment", "Unstable Dragon Fragment", "Young Dragon Fragment", "Wise Dragon Fragment", "Strong Dragon Fragment", "Superior Dragon Fragment", "Mite Gel", "Ritual Residue", "Oak Wood", null, null, null, "Acacia Wood", null, "Apple", "Oak Sapling", null, null, null, null, null, "Enchanted Oak Wood", "Enchanted Birch Wood", "Enchanted Spruce Wood", "Enchanted Dark Oak Wood", "Enchanted Acacia Wood", "Enchanted Jungle Wood", "Raw Fish", null, null, null, "Ink Sac", "Prismarine Crystals", "Prismarine Shard", "Lily Pad", "Sponge", "Clay", "Shark Fin", "Blue Shark Tooth", "Nurse Shark Tooth", "Tiger Shark Tooth", "Chum", "Glowing Mushroom", "Agarimoo Tongue", "Worm Membrane", "Enchanted Raw Fish", "Enchanted Cooked Fish", "Enchanted Raw Salmon", "Enchanted Cooked Salmon", "Enchanted Pufferfish", "Enchanted Clownfish", "Enchanted Ink Sac", "Enchanted Prismarine Crystals", "Enchanted Prismarine Shard", "Enchanted Lily Pad", "Enchanted Sponge", "Enchanted Wet Sponge", "Enchanted Clay", "Enchanted Shark Fin", "Magmafish", "Magma Cream", "Lava Shell", "Silver Magmafish", "Orb of Energy", "Coal", "Cup of Blood", "Horn of Taurus", "Flaming Heart", "Thunder Shards", "Netherrack", "Blaze Powder", "Gold Magmafish", "Moogma Pelt", "Pyroclastic Scale", "Lump of Magma", "Nether Star", "Glowstone Dust", "Digested Mushrooms", "Mutated Blaze Ashes", "Burning Eye", "Blaze Ashes", "Leather Cloth", "Millennia-Old Blaze Ashes", "Mycelium", "X", "Y", "Z", "Bezos", "Magma Chunk", "Nether Quartz", "Heavy Pearl", "Flames", null, "Kada Lead", "Hallowed Skull", "Spectre Dust", "Magma Cream", "Ghast Tear", "Compact Ooze", "Spell Powder", "Gazing Pearl", "Corrupted Fragment", "Kuudra Teeth", "Wither Soul", "Rekindled Ember Fragment", "Sulphur", "Netherrack", "Nether Wart", "Magmag", "Lumino Fiber", "Tentacle Meat", "FTX 3070", "Sludge Juice", "Corleonite", "Bob-omb", "Oil Barrel", "Superlite Motor", "Control Switch", "Electron Transmitter", "Robotron Reflector", "Yoggie", "Synthetic Heart", "Jungle Key", "Wishing Compass", "Ascension Rope", "Decoy", "Wither Catalyst", "Bigfoot's Lasso", "Bonzo Fragment", "Ancient Rose", "Trap", "Healing Tissue", "Spirit Leap", "Fel Pearl", "Livid Fragment", "Inflatable Jerry", "Scarf Fragment", "Superboom TNT", "Mimic Fragment", "Jolly Pink Rock", "L.A.S.R.'s Eye", "Dungeon Chest Key", "Kismet Feather", "Thorn Fragment", "Architect's First Draft", "Goblin Egg", "§aGreen Goblin Egg", "§eYellow Goblin Egg", "§cRed Goblin Egg", "§3Blue Goblin Egg", "Glacite Jewel", "Volta", "Plasma", "Sorrow", "Biofuel", "Oil Barrel", "Umber Key", "Tungsten Key", "Revenant Flesh", "Undead Catalyst", "Revenant Catalyst", "Tarantula Web", "Spider Catalyst", "Wolf Tooth", "Null Sphere", "Null Atom", "Raw Soulflow", "Soulflow", "Derelict Ashe", "Crude Gabagool", "Blaze Rod Distillate", "Gabagool Distillate", "Glowstone Distillate", "Magma Cream Distillate", "Nether Wart Distillate", "Green Candy", "Purple Candy", "Pumpkin Guts", "Spooky Shard", "Ectoplasm", "Werewolf Skin", "Dark Candy", "Ice", "Packed Ice", "Enchanted Ice", "Enchanted Packed Ice", "Walnut", "Glacial Fragment", "White Gift", "Green Gift", "§cRed Gift", "Snowball", "Snow Block", "Enchanted Snow Block", "Hunk of Ice", "Hunk of Blue Ice", "%%red%%Volcanic Rock", "Winter Fragment", "Party Gift", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "Cropie", "Squash", "Compost", "Honey Jar", "Dung", "Tasty Cheese", "Plant Matter", "Jacob's Ticket", "Fine Flour", "Sunflower", null, null, null, "Poppy", null, null, null, null, null, null, null, null, "Endstone Rose", "Enchanted Poppy", "Enchanted Dandelion", "Dandelion", "Rough Amber Gemstone", "Flawed Amber Gemstone", "Fine Amber Gemstone", "Rough Jade Gemstone", "Flawed Jade Gemstone", "Fine Jade Gemstone", "Rough Topaz Gemstone", "Flawed Topaz Gemstone", "Fine Topaz Gemstone", "Rough Sapphire Gemstone", "Flawed Sapphire Gemstone", "Fine Sapphire Gemstone", "Rough Amethyst Gemstone", "Flawed Amethyst Gemstone", "Fine Amethyst Gemstone", "Rough Jasper Gemstone", "Flawed Jasper Gemstone", "Fine Jasper Gemstone", "Rough Ruby Gemstone", "Flawed Ruby Gemstone", "Fine Ruby Gemstone", "Rough Opal Gemstone", "Flawed Opal Gemstone", "Fine Opal Gemstone", "Rough Onyx Gemstone", "Flawed Onyx Gemstone", "Fine Onyx Gemstone", "Rough Aquamarine Gemstone", "Flawed Aquamarine Gemstone", "Fine Aquamarine Gemstone", "Rough Citrine Gemstone", "Flawed Citrine Gemstone", "Fine Citrine Gemstone", "Rough Peridot Gemstone", "Flawed Peridot Gemstone", "Fine Peridot Gemstone", "Ancient Claw", "Blue Shark Tooth", "Carnival Ticket", "Dark Candy", "Ectoplasm", "Enchanted Shark Fin", "Glacial Fragment", "Glossy Gemstone", "Green Candy", "Griffin Feather", "Hunk of Blue Ice", "Hunk of Ice", "Nurse Shark Tooth", "Party Gift", "Pumpkin Guts", "Purple Candy", "Refined Mineral", "Shark Fin", "Spooky Shard", "Tiger Shark Tooth", "Werewolf Skin", "White Gift", "Green Gift", "§cRed Gift", "Walnut", "Snowball", "%%red%%Volcanic Rock", "Winter Fragment", "Fishy Treat"
].map(v => v.split(' ').map(v => sanitizeName(v)));
const idMap = new Array(ids.length).fill(0).map((_, i) => i);
const nameMap = new Array(ids.length).fill(0).map((_, i) => i);
idMap.sort((a, b) => ids[a].localeCompare(ids[b], ['en-US']));
nameMap.sort((a, b) => {
  if (names[a].length !== names[b].length) return names[a].length - names[b].length;
  let i = 0;
  while (i < names[a].length) {
    let c = names[a][i].localeCompare(ids[b][i], ['en-US']);
    if (c !== 0) return c;
    i++;
  }
});
ids = idMap.reduce((a, v, i) => ((a[i] = ids[v]), a), []);
names = nameMap.reduce((a, v, i) => ((a[i] = names[v]), a), []);
const idMapRev = idMap.reduce((a, v, i) => ((a[v] = i), a), []);
const nameMapRev = nameMap.reduce((a, v, i) => ((a[v] = i), a), []);

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
  if (/^\d+k?$/.test(args[args.length - 1])) amt = args.pop();
  const possIds = new Set();
  if (args.length === 1) {
    const n = sanitizeId(args[0]);
    ids.forEach((v, k) => v.startsWith(n) && possIds.add(k));
    // ids.forEach((v, k) => v.includes(n) && possIds.add(k));
  }
  args = args.map(v => sanitizeName(v));
  const possNames = new Set();
  names.forEach((v, k) => v.length >= args.length && args.every((a, i) => v[i].startsWith(a)) && possNames.add(k));
  // names.forEach((v, k) => v.length >= args.length && args.every((a, i) => v[i][i === args.length - 1 ? 'startsWith' : 'includes'](a)) && possNames.add(k));
  // names.forEach((v, k) => v.length >= args.length && args.every((a, i) => v[i].includes(a)) && possNames.add(k));
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
  function trimMult() {
    if (multiple) return;
    if (possIds.size) {
      const f = possIds.values().next().value;
      possIds.clear();
      possIds.add(f);
    }
    if (possNames.size) {
      const f = possNames.values().next().value;
      possNames.clear();
      possNames.add(f);
    }
  }
  switch (settings.betterGFSIDPref) {
    case 'ID':
      possNames.forEach(v => possIds.add(idMapRev[nameMap[v]]));
      trimMult();
      possIds.forEach(v => arr[1].push(ids[v]));
      break;
    case 'Name':
      possIds.forEach(v => possNames.add(nameMapRev[idMap[v]]));
      trimMult();
      addNames();
      break;
    case 'Dynamic': {
      const idPrio = possIds.size > 0;
      possIds.forEach(v => possNames.add(nameMapRev[idMap[v]]));
      possNames.forEach(v => possIds.add(idMapRev[nameMap[v]]));
      trimMult();
      if (idPrio) possIds.forEach(v => arr[1].push(ids[v]));
      if (!idPrio || multiple) addNames();
      if (!idPrio && (multiple || possNames.size === 0)) possIds.forEach(v => arr[1].push(ids[v]));
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