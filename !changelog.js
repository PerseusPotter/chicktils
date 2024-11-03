const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const obj = {};
function ask(q) {
  return new Promise(res => rl.question(q, v => res(v)));
}

(async () => {
  const version = await ask('version > ');
  if (!/^\d+\.\d+\.\d+$/.test(version)) return;
  obj.version = version;
  obj.changes = [];
  while (true) {
    const [type, desc] = (await ask('change, feat|fix|misc|del|change|done> ')).split(': ');
    if (type === 'done') break;
    if (!['feat', 'fix', 'misc', 'del', 'change'].includes(type)) {
      console.log('bad type');
      continue;
    }
    obj.changes.push({ type, desc });
  }

  console.log(JSON.stringify(obj, null, 2));
})();