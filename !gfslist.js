const https = require('https');

function curl(path) {
  return new Promise(res => {
    const chunks = [];
    https.get(path, r => {
      r.on('data', c => chunks.push(c));
      r.once('close', () => res(Buffer.concat(chunks)));
    }).end();
  });
}

(async function() {
  const items = new Map(JSON.parse(await curl('https://api.hypixel.net/v2/resources/skyblock/items')).items.map(v => [v.id, v.name]));
  const sacks = JSON.parse(await curl('https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/refs/heads/master/constants/sacks.json')).sacks;

  const names = [];
  const ids = [];
  function add(n, i) {
    names.push(n);
    ids.push(i);
  }

  Object.values(sacks).forEach(({ contents }) => {
    contents.forEach(id => add(items.get(id), id));
  });

  console.log(
    `let ids = ${JSON.stringify(ids)};\n` +
    `let names = ${JSON.stringify(names)};`
  );
}());