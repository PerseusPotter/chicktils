import settings from '../settings';
import { execCmd } from '../util/format';
import reg from '../util/registerer';
import { ITEMS } from '../util/sackitems';

function sanitizeName(str) {
  return str.toUpperCase().replace(/[^A-Za-z0-9]/g, '');
}
function sanitizeId(str) {
  return str.toUpperCase();
}
let ids = ITEMS.map(v => v.id);
let names = ITEMS.map(v => v.nameUF).map(v => v.split(' ').map(v => sanitizeName(v)));
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
  names.forEach((v, k) => {
    for (let o = 0; o <= v.length - args.length; o++) {
      if (args.every((a, i) => v[i + o].startsWith(a))) possNames.add(k);
    }
  });
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