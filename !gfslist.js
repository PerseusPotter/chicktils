const https = require('https');
const url = 'https://api.hypixel.net/v2/resources/skyblock/items';

const names = [];
const ids = [];
function add(n, i) {
  names.push(n);
  ids.push(i);
}

const cringeShit = {
  'Brown Mushroom': ['Enchanted Brown Mushroom', 'Enchanted Brown Mushroom Block'],
  'Cactus': ['Enchanted Cactus Green', 'Enchanted Cactus'],
  'Carrot': ['Enchanted Carrot', 'Enchanted Golden Carrot'],
  'Cocoa Beans': ['Enchanted Cocoa Beans', 'Enchanted Cookie'],
  'Melon': ['Enchanted Melon', 'Enchanted Melon Block'],
  'Nether Wart': ['Enchanted Nether Wart', 'Mutant Nether Wart'],
  'Potato': ['Enchanted Potato', 'Enchanted Baked Potato', 'Enchanted Poisonous Potato'],
  'Pumpkin': ['Enchanted Pumpkin', 'Polished Pumpkin'],
  'Red Mushroom': ['Enchanted Red Mushroom', 'Enchanted Red Mushroom Block'],
  'Seeds': ['Enchanted Seeds', 'Box of Seeds'],
  'Sugar Cane': ['Enchanted Sugar', 'Enchanted Sugar Cane'],
  'Wheat': ['Enchanted Bread', 'Enchanted Hay Bale', 'Tightly-Tied Hay Bale'],

  'Coal': ['Enchanted Coal', 'Enchanted Coal Block'],
  'Diamond': ['Enchanted Diamond', 'Enchanted Diamond Block'],
  'Emerald': ['Enchanted Emerald', 'Enchanted Emerald Block'],
  'Glowstone Dust': ['Enchanted Glowstone Dust', 'Enchanted Glowstone'],
  'Gold Ingot': ['Enchanted Gold', 'Enchanted Gold Block'],
  'Gravel': ['Enchanted Coal', 'Enchanted Coal Block'],
  'Hard Stone': ['Enchanted Hard Stone', 'Concentrated Stone'],
  'Iron Ingot': ['Enchanted Iron', 'Enchanted Iron Block'],
  'Lapis Lazuli': ['Enchanted Lapis Lazuli', 'Enchanted Lapis Block'],
  'Mycelium': ['Enchanted Mycelium', 'Enchanted Mycelium Cube'],
  'Nether Quartz': ['Enchanted Quartz', 'Enchanted Quartz Block'],
  'Red Sand': ['Enchanted Red Sand', 'Enchanted Red Sand Cube'],
  'Redstone': ['Enchanted Redstone', 'Enchanted Redstone Block'],
  'Sulphur': ['Enchanted Sulphur', 'Enchanted Sulphur Cube'],

  'Blaze Rod': ['Enchanted Blaze Powder', 'Enchanted Blaze Rod'],
  'Bone': ['Enchanted Bone', 'Enchanted Bone Block'],
  'Chili Pepper': ['Stuffed Chili Pepper'],
  'Ender Pearl': ['Enchanted Ender Pearl', 'Enchanted Eye of Ender', 'Absolute Ender Pearl'],
  'Magma Cream': ['Enchanted Magma Cream', 'Whipped Magma Cream'],
  'Slimeball': ['Enchanted Slimeball', 'Enchanted Slime Block']
};

https.get(url, res => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('close', () => {
    const items = JSON.parse(Buffer.concat(chunks)).items;

    function addName(n) {
      console.log(n);
      const i = items.find(v => v.name.replace(/§./g, '').replace(/%%.+?%%/g, '') === n).id;
      add(n, i);
    }

    lore.forEach(sack => {
      const isEnchanted = sack.tag.ExtraAttributes.id.includes('ENCHANTED');
      sack.tag.display.Lore.join(' ').replace(/§./g, '').replace(/\\u0027/g, '\'').match(/(?:Items:|materials:)(.+?)Capacity:/)[1].split(',').map(v => {
        let n = v.trim();
        if (isEnchanted) {
          if (n in cringeShit) return cringeShit[n].forEach(n => addName(n));
          if (!n.startsWith('Enchanted')) n = 'Enchanted ' + n;
        }
        addName(n);
      });
    });

    console.log(JSON.stringify(names));
    console.log();
    console.log(JSON.stringify(ids));
  })
}).end();

// TROPHY FISH
const trophyFish = ['Blobfish', 'Flyfish', 'Golden Fish', 'Gusher', 'Karate Fish', 'Lavahorse', 'Mana Ray', 'Moldin', 'Skeleton Fish', 'Slugfish', 'Soul Fish', 'Steaming-Hot Flounder', 'Sulphur Skitter', 'Vanille', 'Volcanic Stonefish'];
trophyFish.forEach(v => add(v + ' BRONZE', v.toUpperCase().replace(/[^A-Za-z]/g, '_') + '_BRONZE'));
trophyFish.forEach(v => add(v + ' SILVER', v.toUpperCase().replace(/[^A-Za-z]/g, '_') + '_SILVER'));
for (let i = 1; i <= 3; i++) add('', `OBFUSCATED_FISH_${i}_BRONZE`);
for (let i = 1; i <= 3; i++) add('', `OBFUSCATED_FISH_${i}_SILVER`);

// GEMSTONES
const gemRarities = ['Rough', 'Flawed', 'Fine'];
const gemstones = ['Jade', 'Amber', 'Topaz', 'Sapphire', 'Amethyst', 'Jasper', 'Ruby', 'Opal', 'Onyx', 'Aquamarine', 'Citrine', 'Peridot'];
gemRarities.forEach(r => gemstones.forEach(g => add(`${r} ${g} Gemstone`, `${r.toUpperCase()}_${g.toUpperCase()}_GEM`)));

// RUNES
// This command doesn't support Runes!

const lore = [
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "6a880c91-b870-3957-bd19-06816978565d",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1680190990501,
                "profileId": "2c076e34547c49e6930c43d1606fb25d",
                "profileName": "lResu",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/a6b46beeb5f6e0006163eda4a50703a40e6591080b0e67779312adcfec46152"
                  }
                },
                "timeInUTC": "2023-03-30 15:43:10 GMT",
                "timeInLocalZone (UTC-04:00)": "2023-03-30 11:43:10 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aAscension Rope§7, §aBob-omb§7, §aControl Switch§7,",
          "§7§aCorleonite§7, §aElectron Transmitter§7, §aFTX 3070§7, §aJungle Key§7,",
          "§7§aOil Barrel§7, §aRobotron Reflector§7, §aSludge Juice§7, §aSuperlite",
          "§aMotor§7, §aSynthetic Heart§7, §aWishing Compass§7, §aYoggie",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Crystal Hollows Sack"
      },
      "ExtraAttributes": {
        "id": "CRYSTAL_HOLLOWS_SACK",
        "uuid": "8cef2352-670b-459c-b5e7-c52b556648c4",
        "timestamp": 1682978220000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "74dacf03-2bd5-3f50-a933-0a2ce640cdd9",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1597810903754,
                "profileId": "f61571f265764ab9be187226c112aa0a",
                "profileName": "Felix_Mangensen",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/fb96c585ccd35f073da38d165cb9bb18ff136f1a184eee3f44725354640ebbd4"
                  }
                },
                "timeInUTC": "2020-08-19 04:21:43 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-08-19 00:21:43 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aAncient Rose§7, §aArchitect\u0027s First Draft§7, §aBigfoot\u0027s",
          "§aLasso§7, §aBonzo Fragment§7, §aDecoy§7, §aDungeon Chest Key§7, §aFel",
          "§aPearl§7, §aHealing Tissue§7, §aInflatable Jerry§7, §aJolly Pink Rock§7,",
          "§7§aKismet Feather§7, §aL.A.S.R.\u0027s Eye§7, §aLivid Fragment§7, §aMimic",
          "§aFragment§7, §aScarf Fragment§7, §aSpirit Leap§7, §aSuperboom TNT§7,",
          "§7§aThorn Fragment§7, §aTrap§7, §aWither Catalyst",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Dungeon Sack"
      },
      "ExtraAttributes": {
        "originTag": "SHOP_PURCHASE",
        "id": "LARGE_DUNGEON_SACK",
        "uuid": "f7bf3539-9991-4ea2-8737-7e485751c8df",
        "timestamp": 1602006180000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "01b88dc3-fd60-33e0-be6a-86bf61ea0e48",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1680190759379,
                "profileId": "4b2e0c589bf54e959c5fbe389245343e",
                "profileName": "_Neotron_",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/daf9711d231e3abfb6fb744711f0d86e6041ee077dae16ddc703a7b4ea165d58"
                  }
                },
                "timeInUTC": "2023-03-30 15:39:19 GMT",
                "timeInLocalZone (UTC-04:00)": "2023-03-30 11:39:19 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aBiofuel§7, §aGlacite Jewel§7, §aGoblin Egg§7, §aOil Barrel§7,",
          "§7§aPlasma§7, §aSorrow§7, §aVolta§7, §a§3Blue Goblin Egg§7, §a§aGreen Goblin Egg§7,",
          "§7§a§cRed Goblin Egg§7, §a§eYellow Goblin Egg",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Dwarven Sack"
      },
      "ExtraAttributes": {
        "id": "DWARVEN_MINES_SACK",
        "uuid": "db48a8c0-258f-4a97-9db3-3f2086c9cf3a",
        "timestamp": 1682978220000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "e570b55c-8478-347c-bcf0-53eb2c4c4319",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1680190940453,
                "profileId": "1bf8f0bd4df74685840656476de46cf3",
                "profileName": "Cruzada22",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/afc3b5db9bd99cd12161ed2ea4623795f28e793c6dab67cd3e803ccfaaad7cfd"
                  }
                },
                "timeInUTC": "2023-03-30 15:42:20 GMT",
                "timeInLocalZone (UTC-04:00)": "2023-03-30 11:42:20 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aAllium§7, §aAzure Bluet§7, §aBlue Orchid§7, §aDandelion§7,",
          "§7§aEnchanted Dandelion§7, §aEnchanted Poppy§7, §aEndstone Rose§7,",
          "§7§aLilac§7, §aOrange Tulip§7, §aOxeye Daisy§7, §aPeony§7, §aPink Tulip§7, §aPoppy§7,",
          "§7§aRed Tulip§7, §aRose Bush§7, §aSunflower§7, §aWhite Tulip",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Flower Sack"
      },
      "ExtraAttributes": {
        "id": "FLOWER_SACK",
        "uuid": "f683a383-fd86-4c6e-abbd-b68f271efc3c",
        "timestamp": 1682978220000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "3368091d-b9f3-3295-911d-f3448f9c0267",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1699368767988,
                "profileId": "bd3a5dfcfdf8447395bd2bfe04f4c032",
                "profileName": "preckrasno",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/184712ecbf1c6ce9de1230bfa05831aa3c5d0ee9d1ba59deef7a31cafd7d8ef3",
                    "metadata": {
                      "model": "slim"
                    }
                  }
                },
                "timeInUTC": "2023-11-07 14:52:47 GMT",
                "timeInLocalZone (UTC-05:00)": "2023-11-07 09:52:47 GMT-5"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aCompost§7, §aCropie§7, §aDung§7, §aHoney Jar§7, §aJacob\u0027s Ticket§7,",
          "§7§aPlant Matter§7, §aSquash§7, §aTasty Cheese",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Garden Sack"
      },
      "ExtraAttributes": {
        "id": "GARDEN_SACK",
        "uuid": "cabe850a-3d83-4b0b-8b13-1031b5ad8d4d",
        "timestamp": 1715904306493
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "c004afdb-b7a1-3bb6-a766-8a772b28ef2c",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1591102535012,
                "profileId": "41d3abc2d749400c9090d5434d03831b",
                "profileName": "Megakloon",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/ef835b8941fe319931749b87fe8e84c5d1f4a271b5fbce5e700a60004d881f79"
                  }
                },
                "timeInUTC": "2020-06-02 12:55:35 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-06-02 08:55:35 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aBrown Mushroom§7, §aCactus§7, §aCactus Green§7, §aCarrot§7,",
          "§7§aCocoa Beans§7, §aCompost§7, §aCropie§7, §aGolden Carrot§7, §aHay Bale§7,",
          "§7§aMelon§7, §aNether Wart§7, §aPoisonous Potato§7, §aPotato§7, §aPumpkin§7,",
          "§7§aRed Mushroom§7, §aSeeds§7, §aSquash§7, §aSugar Cane§7, §aWheat",
          "",
          "§7Capacity: §e141,120 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is triple-stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Agronomy Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 3,
        "originTag": "LARGE_AGRONOMY_SACK",
        "id": "LARGE_AGRONOMY_SACK",
        "uuid": "ac1acf95-541f-44d9-a456-f0c1cb4570b5",
        "timestamp": 1604806800000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "1c248d69-e045-32a3-afde-768ef311c9db",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1591103356041,
                "profileId": "41d3abc2d749400c9090d5434d03831b",
                "profileName": "Megakloon",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/1c13c4774c82c07071e6d1408717b1e3eac56186042a5803fc174452e32a254a"
                  }
                },
                "timeInUTC": "2020-06-02 13:09:16 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-06-02 09:09:16 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aBlaze Rod§7, §aBone§7, §aChili Pepper§7, §aEnder Pearl§7, §aGhast",
          "§aTear§7, §aGunpowder§7, §aMagma Cream§7, §aRotten Flesh§7, §aSlimeball§7,",
          "§7§aSpider Eye§7, §aString",
          "",
          "§7Capacity: §e141,120 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is triple-stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Combat Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 3,
        "originTag": "LARGE_COMBAT_SACK",
        "id": "LARGE_COMBAT_SACK",
        "uuid": "179e1b4e-2562-475c-8204-d69636099f3e",
        "timestamp": 1625880600000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "e47cacab-fa93-3ef9-b0d7-e8a75d52394e",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1680190855765,
                "profileId": "e3711e6ca4ff4708b69f8b4fec3af7a1",
                "profileName": "MrBurst",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/f7c0cd9394abb03ff96f28736406fa40c945b4d735a11facf5f9912c11495324"
                  }
                },
                "timeInUTC": "2023-03-30 15:40:55 GMT",
                "timeInLocalZone (UTC-04:00)": "2023-03-30 11:40:55 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aCrystal Fragment§7, §aHoly Dragon Fragment§7, §aMite Gel§7,",
          "§7§aOld Dragon Fragment§7, §aProtector Dragon Fragment§7, §aRitual",
          "§aResidue§7, §aStrong Dragon Fragment§7, §aSuperior Dragon",
          "§aFragment§7, §aUnstable Dragon Fragment§7, §aWise Dragon",
          "§aFragment§7, §aYoung Dragon Fragment",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Large Dragon Sack"
      },
      "ExtraAttributes": {
        "id": "LARGE_DRAGON_SACK",
        "uuid": "1dbccaf8-648b-4baf-9c9d-4db9b4b7b9d2",
        "timestamp": 1682978460000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "e21de3f9-5482-3730-9e3a-67a6a888f3c2",
        "Properties": {
          "textures": [
            {
              "Value": {
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/184d2ff1e177357574f9f71e19397fff3a210a94e78c0d2a4360cc5df1eb807b"
                  }
                }
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7This sack can contain all enchanted versions",
          "§7of these materials:",
          "§7§aBrown Mushroom§7, §aCactus§7, §aCarrot§7, §aCocoa Beans§7,",
          "§7§aMelon§7, §aNether Wart§7, §aPotato§7, §aPumpkin§7, §aRed",
          "§aMushroom§7, §aSeeds§7, §aSugar Cane§7, §aWheat",
          "",
          "§7Capacity: §e100,800 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is double-stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Enchanted Agronomy Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 2,
        "originTag": "CRAFTING_GRID_COLLECT",
        "id": "LARGE_ENCHANTED_AGRONOMY_SACK",
        "uuid": "a02c1cf1-599c-4c80-8d30-aea8ff89bd9d",
        "timestamp": 1622202780000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "a0aa7485-1e9c-38be-aa0a-e8b5aeb91a84",
        "Properties": {
          "textures": [
            {
              "Value": {
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/c2a3420697256517d5361b3463019647c0689725b3489f9dd24a22ddd40bd41f"
                  }
                }
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7This sack can contain all enchanted versions",
          "§7of these materials:",
          "§7§aBlaze Rod§7, §aBone§7, §aChili Pepper§7, §aEnder Pearl§7,",
          "§7§aGhast Tear§7, §aGunpowder§7, §aMagma Cream§7, §aRotten",
          "§aFlesh§7, §aSlimeball§7, §aSpider Eye§7, §aString",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Large Enchanted Combat Sack"
      },
      "ExtraAttributes": {
        "originTag": "QUICK_CRAFTING",
        "id": "LARGE_ENCHANTED_COMBAT_SACK",
        "uuid": "053e0d41-8133-49ab-a414-6844cc8a985d",
        "timestamp": 1622159040000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "80e3fbe4-bcbc-3cea-a7f6-882b3277b571",
        "Properties": {
          "textures": [
            {
              "Value": {
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/ee2469de7f75d2e0a8b3b0c734a2b470782b604d1feb0172b4a72a77cb5bbda2"
                  }
                }
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aEnchanted Clay§7, §aEnchanted Clownfish§7, §aEnchanted",
          "§aCooked Fish§7, §aEnchanted Cooked Salmon§7, §aEnchanted Ink",
          "§aSac§7, §aEnchanted Lily Pad§7, §aEnchanted Prismarine Crystals§7,",
          "§7§aEnchanted Prismarine Shard§7, §aEnchanted Pufferfish§7,",
          "§7§aEnchanted Raw Fish§7, §aEnchanted Raw Salmon§7, §aEnchanted",
          "§aShark Fin§7, §aEnchanted Sponge§7, §aEnchanted Wet Sponge",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Large Enchanted Fishing Sack"
      },
      "ExtraAttributes": {
        "originTag": "CRAFTING_GRID_COLLECT",
        "id": "LARGE_ENCHANTED_FISHING_SACK",
        "uuid": "b6ecc7c7-4e35-404e-9ada-ea7b90a6aa7d",
        "timestamp": 1643228760000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "5d2e0430-2be3-3ec3-b081-4da4fafed1cd",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1637184904749,
                "profileId": "b7479bae29c44b23ba56283378f0e3c6",
                "profileName": "Syleex",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/35326464c6a79362730d79fe4611b911353c1b3c5144177773591357f1cd5ca1",
                    "metadata": {
                      "model": "slim"
                    }
                  }
                },
                "timeInUTC": "2021-11-17 21:35:04 GMT",
                "timeInLocalZone (UTC-05:00)": "2021-11-17 16:35:04 GMT-5"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aEnchanted Acacia Wood§7, §aEnchanted Birch Wood§7,",
          "§7§aEnchanted Dark Oak Wood§7, §aEnchanted Jungle Wood§7,",
          "§7§aEnchanted Oak Wood§7, §aEnchanted Spruce Wood",
          "",
          "§7Capacity: §e60,480 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Enchanted Foraging Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 1,
        "id": "LARGE_ENCHANTED_FORAGING_SACK",
        "uuid": "b3e4f81a-858b-4150-8af1-b1e953b63d04",
        "timestamp": 1667352960000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "5a035266-5608-34e0-8126-2dfbaf68ea24",
        "Properties": {
          "textures": [
            {
              "Value": {
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/746a6063263ba7208a2a06cef73234791c92d5f67080a365508b02483eefaf9a"
                  }
                }
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into",
          "§7your sacks.",
          "",
          "§7§7Items: §aEnchanted Feather§7,",
          "§7§aEnchanted Leather§7, §aEnchanted",
          "§aPork§7, §aEnchanted Raw Chicken§7,",
          "§7§aEnchanted Egg§7, §aEnchanted",
          "§aMutton§7, §aEnchanted Raw",
          "§aRabbit§7, §aEnchanted Raw Beef§7,",
          "§7§aEnchanted Rabbit Hide§7,",
          "§7§aEnchanted Rabbit Foot",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Large Enchanted Husbandry Sack"
      },
      "ExtraAttributes": {
        "originTag": "CRAFTING_GRID_COLLECT",
        "id": "LARGE_ENCHANTED_HUSBANDRY_SACK",
        "uuid": "c9f7da2f-7840-4049-b59e-246604efbaf1",
        "timestamp": 1622202660000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "3abecf46-c477-3ad5-82e7-04a2dfb23a93",
        "Properties": {
          "textures": [
            {
              "Value": {
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/eedc69fefad184ee8c9186928da982addfd783bed98d95083408bf419e0cccd0"
                  }
                }
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7This sack can contain all enchanted versions",
          "§7of these materials:",
          "§7§aCoal§7, §aCobblestone§7, §aDiamond§7, §aEmerald§7, §aEnd Stone§7,",
          "§7§aFlint§7, §aGlacite§7, §aGlowstone Dust§7, §aGold Ingot§7,",
          "§7§aGravel§7, §aHard Stone§7, §aIron Ingot§7, §aLapis Lazuli§7,",
          "§7§aMithril§7, §aMycelium§7, §aNether Quartz§7, §aNetherrack§7,",
          "§7§aObsidian§7, §aRed Sand§7, §aRedstone§7, §aSand§7, §aSulphur§7,",
          "§7§aTitanium§7, §aTungsten§7, §aUmber",
          "",
          "§7Capacity: §e141,120 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is triple-stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Enchanted Mining Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 3,
        "originTag": "QUICK_CRAFTING",
        "id": "LARGE_ENCHANTED_MINING_SACK",
        "uuid": "df7d8c68-ed6d-4d09-9c5e-6b661f63bf0e",
        "timestamp": 1629325560000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "1953e48a-4f32-3234-8eea-10290b814f2f",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1591107533061,
                "profileId": "41d3abc2d749400c9090d5434d03831b",
                "profileName": "Megakloon",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/f8f68669351a6fc7156ecfe3300ba94efe0766e24bed8785cf64a9f95435134b"
                  }
                },
                "timeInUTC": "2020-06-02 14:18:53 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-06-02 10:18:53 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aAgarimoo Tongue§7, §aBlue Shark Tooth§7, §aChum§7, §aClay§7,",
          "§7§aClownfish§7, §aGlowing Mushroom§7, §aInk Sac§7, §aLily Pad§7, §aNurse",
          "§aShark Tooth§7, §aPrismarine Crystals§7, §aPrismarine Shard§7,",
          "§7§aPufferfish§7, §aRaw Fish§7, §aRaw Salmon§7, §aShark Fin§7, §aSponge§7,",
          "§7§aTiger Shark Tooth",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Large Fishing Sack"
      },
      "ExtraAttributes": {
        "originTag": "LARGE_FISHING_SACK",
        "id": "LARGE_FISHING_SACK",
        "uuid": "fcedfae5-f10f-4285-b3d1-333e7c963ddd",
        "timestamp": 1606257300000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "13b0fdef-4f7b-37e7-91a8-9153fdd06cf9",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1591102740397,
                "profileId": "41d3abc2d749400c9090d5434d03831b",
                "profileName": "Megakloon",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/2c6e24df498ba4a589c259d9fc0d3db348f93cdf26a5fe461571c1da706efaf3"
                  }
                },
                "timeInUTC": "2020-06-02 12:59:00 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-06-02 08:59:00 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aAcacia Sapling§7, §aAcacia Wood§7, §aApple§7, §aBirch Sapling§7,",
          "§7§aBirch Wood§7, §aDark Oak Sapling§7, §aDark Oak Wood§7, §aJungle",
          "§aSapling§7, §aJungle Wood§7, §aOak Sapling§7, §aOak Wood§7, §aSpruce",
          "§aSapling§7, §aSpruce Wood",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Large Foraging Sack"
      },
      "ExtraAttributes": {
        "originTag": "LARGE_FORAGING_SACK",
        "id": "LARGE_FORAGING_SACK",
        "uuid": "fa7248f0-8b70-4fe5-8123-369d62f4587c",
        "timestamp": 1581182040000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "bc816fc7-332f-32b6-babc-a94b3baee1c3",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1591102124788,
                "profileId": "41d3abc2d749400c9090d5434d03831b",
                "profileName": "Megakloon",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/c73087f1e654b1682733584a44097587fb942e1f343aae8307bd7dac84e843ab"
                  }
                },
                "timeInUTC": "2020-06-02 12:48:44 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-06-02 08:48:44 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aEgg§7, §aFeather§7, §aLeather§7, §aMutton§7, §aRabbit Hide§7,",
          "§7§aRabbit\u0027s Foot§7, §aRaw Beef§7, §aRaw Chicken§7, §aRaw Porkchop§7, §aRaw",
          "§aRabbit§7, §aWhite Wool",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Large Husbandry Sack"
      },
      "ExtraAttributes": {
        "id": "LARGE_HUSBANDRY_SACK",
        "uuid": "cd9b02c2-2c34-4572-ae35-9e9f4ece702d",
        "timestamp": 1655153520000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "daf5fe98-2814-3f3e-9a68-37b691f2d51e",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1643608760747,
                "profileId": "f5d0b1ae416e4a1981214fdd31e7305b",
                "profileName": "CatchTheWave10",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/da2a951592cc26cf5b6d9f66ae034916f9d2e97216d43b3fa11c979afd7df1ad",
                    "metadata": {
                      "model": "slim"
                    }
                  }
                },
                "timeInUTC": "2022-01-31 05:59:20 GMT",
                "timeInLocalZone (UTC-05:00)": "2022-01-31 00:59:20 GMT-5"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aBlaze Powder§7, §aCoal§7, §aCup of Blood§7, §aFlaming Heart§7,",
          "§7§aGold Magmafish§7, §aHorn of Taurus§7, §aLava Shell§7, §aLump of",
          "§aMagma§7, §aMagma Cream§7, §aMagmafish§7, §aMoogma Pelt§7,",
          "§7§aNetherrack§7, §aOrb of Energy§7, §aPyroclastic Scale§7, §aSilver",
          "§aMagmafish§7, §aThunder Shards",
          "",
          "§7Capacity: §e60,480 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Lava Fishing Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 1,
        "id": "LARGE_LAVA_FISHING_SACK",
        "uuid": "779362d5-1407-4c49-969b-ff5d0c9b700c",
        "timestamp": 1653663720000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "c1b895a1-70b6-3930-9de5-5361995735d1",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1591102945589,
                "profileId": "41d3abc2d749400c9090d5434d03831b",
                "profileName": "Megakloon",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/915fcebbbe02fdb72acd2095d9edfcea095e604b3682db88963b5b83b2939b67"
                  }
                },
                "timeInUTC": "2020-06-02 13:02:25 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-06-02 09:02:25 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aCoal§7, §aCobblestone§7, §aDiamond§7, §aEmerald§7, §aEnd Stone§7,",
          "§7§aFlint§7, §aGlacite§7, §aGlowstone Dust§7, §aGold Ingot§7, §aGravel§7, §aHard",
          "§aStone§7, §aIron Ingot§7, §aLapis Lazuli§7, §aMithril§7, §aMycelium§7, §aNether",
          "§aQuartz§7, §aNetherrack§7, §aObsidian§7, §aOil Barrel§7, §aPlasma§7, §aRed",
          "§aSand§7, §aRedstone§7, §aRefined Mineral§7, §aSand§7, §aStarfall§7, §aStone§7,",
          "§7§aTitanium§7, §aTreasurite§7, §aTungsten§7, §aUmber§7, §aVolta",
          "",
          "§7Capacity: §e141,120 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is triple-stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Mining Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 3,
        "originTag": "LARGE_MINING_SACK",
        "id": "LARGE_MINING_SACK",
        "uuid": "0a006af8-bc86-41df-bd30-1a2daad259a6",
        "timestamp": 1609610100000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "651d82e2-a336-3206-8418-afd4c3efae11",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1643608870691,
                "profileId": "c03ee51623e54e8a8754c56eafbcd08e",
                "profileName": "laymanuel",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/e345875e921a145f92038858aeecc3c2f083441ebc5c8265d31a281d268e365b",
                    "metadata": {
                      "model": "slim"
                    }
                  }
                },
                "timeInUTC": "2022-01-31 06:01:10 GMT",
                "timeInLocalZone (UTC-05:00)": "2022-01-31 01:01:10 GMT-5"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aBezos§7, §aBlaze Ashes§7, §aBlaze Rod§7, §aBurning Eye§7,",
          "§7§aCompact Ooze§7, §aCorrupted Fragment§7, §aDigested Mushrooms§7,",
          "§7§aFlames§7, §aGazing Pearl§7, §aGhast Tear§7, §aGlowstone Dust§7,",
          "§7§aHallowed Skull§7, §aHeavy Pearl§7, §aKada Lead§7, §aKuudra Teeth§7,",
          "§7§aLeather Cloth§7, §aLumino Fiber§7, §aMagma Chunk§7, §aMagma Cream§7,",
          "§7§aMagmag§7, §aMillenia-Old Blaze Ashes§7, §aMutated Blaze Ashes§7,",
          "§7§aMycelium§7, §aNether Quartz§7, §aNether Star§7, §aNether Wart§7,",
          "§7§aNetherrack§7, §aRed Sand§7, §aRekindled Ember Fragment§7,",
          "§7§aSpectre Dust§7, §aSpell Powder§7, §aSulphur§7, §aTentacle Meat§7,",
          "§7§aWither Soul§7, §aX§7, §aY§7, §aZ",
          "",
          "§7Capacity: §e60,480 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Nether Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 1,
        "id": "LARGE_NETHER_SACK",
        "uuid": "d3dd935e-f6ea-4627-b0d5-02a8b989c609",
        "timestamp": 1654718880000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "1cf3a3ac-05c8-35d2-95ee-bf98489bbce8",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1591103150707,
                "profileId": "41d3abc2d749400c9090d5434d03831b",
                "profileName": "Megakloon",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/c0ccbd15d76a748e08926ef6d21dc3e54d9adec766cc25019531a493b1fd4b44"
                  }
                },
                "timeInUTC": "2020-06-02 13:05:50 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-06-02 09:05:50 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aCrude Gabagool§7, §aDerelict Ashe§7, §aNull Atom§7, §aNull",
          "§aSphere§7, §aRaw Soulflow§7, §aRevenant Catalyst§7, §aRevenant",
          "§aFlesh§7, §aSoulflow§7, §aSpider Catalyst§7, §aTarantula Web§7, §aUndead",
          "§aCatalyst§7, §aWolf Tooth",
          "",
          "§7Capacity: §e141,120 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is triple-stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§6§lLEGENDARY"
        ],
        "Name": "§6Large Slayer Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 3,
        "originTag": "MEDIUM_SLAYER_SACK",
        "id": "LARGE_SLAYER_SACK",
        "uuid": "2d06976b-5439-4b73-be34-68e1045d14aa",
        "timestamp": 1591823940000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "c16cfb77-c2b1-348b-bee6-73cb0b38d7bf",
        "Properties": {
          "textures": [
            {
              "Value": {
                "timestamp": 1604068212030,
                "profileId": "a2f834595c894a27add3049716ca910c",
                "profileName": "bPunch",
                "signatureRequired": true,
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/12ef39437d7d43a034c5a40b974e8d2c6734a218c76485d04910f507bdc2e809"
                  }
                },
                "timeInUTC": "2020-10-30 14:30:12 GMT",
                "timeInLocalZone (UTC-04:00)": "2020-10-30 10:30:12 GMT-4"
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aDark Candy§7, §aEctoplasm§7, §aGreen Candy§7, §aPumpkin",
          "§aGuts§7, §aPurple Candy§7, §aSpooky Shard§7, §aWerewolf Skin",
          "",
          "§7Capacity: §e20,160 per item",
          "§8Sacks sum their capacity.",
          "",
          "§eRight Click to open sack!",
          "",
          "§5§lEPIC"
        ],
        "Name": "§5Spooky Sack"
      },
      "ExtraAttributes": {
        "id": "LARGE_CANDY_SACK",
        "uuid": "38faf107-65b8-4c14-a38f-cab7a2fe205a",
        "timestamp": 1682979180000
      }
    },
    "Damage": 3
  },
  {
    "id": "minecraft:skull",
    "Count": 1,
    "tag": {
      "HideFlags": 254,
      "SkullOwner": {
        "Id": "c04592a5-1918-34da-ad16-e2b406686018",
        "Properties": {
          "textures": [
            {
              "Value": {
                "textures": {
                  "SKIN": {
                    "url": "http://textures.minecraft.net/texture/ab339b1cd40053defd7d3528e01fea876d41b42f9d9268461da79f5f66771236"
                  }
                }
              }
            }
          ]
        }
      },
      "display": {
        "Lore": [
          "§7Item pickups go directly into your",
          "§7sacks.",
          "",
          "§7§7Items: §aEnchanted Ice§7, §aEnchanted Packed Ice§7, §aEnchanted",
          "§aSnow Block§7, §aGlacial Fragment§7, §aGreen Gift§7, §aHunk of Blue",
          "§aIce§7, §aHunk of Ice§7, §aIce§7, §aPacked Ice§7, §aSnow Block§7, §aSnowball§7,",
          "§7§aWalnut§7, §aWhite Gift§7, §aWinter Fragment§7, §a§cRed Gift§7, §a§cVolcanic Rock",
          "",
          "§7Capacity: §e60,480 per item",
          "§8Sacks sum their capacity.",
          "",
          "§7§7This sack is stitched with a §cPocket",
          "§cSack-in-a-Sack§7.",
          "",
          "§eRight Click to open sack!",
          "",
          "§9§lRARE"
        ],
        "Name": "§9Winter Sack"
      },
      "ExtraAttributes": {
        "sack_pss": 1,
        "originTag": "UNKNOWN",
        "id": "LARGE_WINTER_SACK",
        "uuid": "b0a30f5c-a026-4b5b-a4cd-55cdb82e0e0f",
        "timestamp": 1620053640000
      }
    },
    "Damage": 3
  }
];