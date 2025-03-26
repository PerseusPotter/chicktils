const https = require('https');
const fs = require('fs');

function curl(path) {
  return new Promise(res => {
    const chunks = [];
    https.get(path, r => {
      r.on('data', c => chunks.push(c));
      r.once('close', () => res(Buffer.concat(chunks)));
    }).end();
  });
}

const formatting = {
  '%%black%%': '§0',
  '%%blue%%': '§1',
  '%%dark_green%%': '§2',
  '%%dark_aqua%%': '§3',
  '%%dark_red%%': '§4',
  '%%dark_purple%%': '§5',
  '%%gold%%': '§6',
  '%%gray%%': '§7',
  '%%dark_gray%%': '§8',
  '%%green%%': '§a',
  '%%aqua%%': '§b',
  '%%red%%': '§c',
  '%%light_purple%%': '§d',
  '%%yellow%%': '§e',
  '%%white%%': '§f',
  '%%italic%%': '§o',
};
const rarity = {
  'COMMON': '§f',
  'UNCOMMON': '§a',
  'RARE': '§9',
  'EPIC': '§5',
  'LEGENDARY': '§6',
  'MYTHIC': '§d',
  'DIVINE': '§b',
  'SPECIAL': '§c',
};
function format(name, tier) {
  const str = name.replace(/%%(\w+)%%/g, v => formatting[v]);
  return /^§\w/.test(str) ? str : (rarity[tier] ?? '') + str;
}

(async function() {
  const allItems = JSON.parse(await curl('https://api.hypixel.net/v2/resources/skyblock/items')).items;
  const itemNames = new Map(allItems.map(v => [v.id, v.name]));
  const itemTiers = new Map(allItems.map(v => [v.id, v.tier]));
  const sacks = JSON.parse(await curl('https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/refs/heads/master/constants/sacks.json')).sacks;

  /** @type {{ nameF: string, nameUF: string, id: string }[]} */
  const output = [];
  async function add(i) {
    const n = itemNames.get(i) ?? JSON.parse(await curl(`https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/refs/heads/master/items/${i}.json`)).displayname;
    const name = format(n, itemTiers.get(i));
    output.push({
      nameF: name,
      nameUF: name.replace(/§\w/g, ''),
      id: i
    });
  }

  await Promise.allSettled(
    Object.values(sacks).map(({ contents }) =>
      Promise.allSettled(
        contents.map(id => add(id))
      )
    )
  );

  fs.writeFileSync(
    './util/sackitems.js',
    `/** @type {{ nameF: string, nameUF: string, id: string }[]} */\n` +
    `export const ITEMS = ${JSON.stringify(output.sort((a, b) => a.id.localeCompare(b.id)), null, 2)};\n` +
    `export const ITEMS_ID_MAP = new Map(ITEMS.map(v => [v.id, v]));\n` +
    `export const ITEMS_NAME_MAP = new Map(ITEMS.map(v => [v.nameUF, v]));`
  );
}());