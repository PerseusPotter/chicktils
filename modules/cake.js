import { deleteMessages } from '../util/helper';
import { logMessage } from '../util/log';
import reg from '../util/registerer';

const cakes = [
  '&d+1♣ Pet Luck',
  '&a+3❈ Defense',
  '&c+10❤ Health',
  '&b+5✎ Intelligence',
  '&c+2❁ Strength',
  '&3+1α Sea Creature Chance',
  '&6+5☘ Farming Fortune',
  '&f+10✦ Speed',
  '&6+5☘ Foraging Fortune',
  '&c+2⫽ Ferocity',
  '&6+5☘ Mining Fortune',
  '&4+1♨ Vitality',
  '&f+1❂ True Defense',
  '&b+1✯ Magic Find'
];
const colors = [
  '&5purple',
  '&alime',
  '&dpink',
  '&blight blue',
  '&4red',
  '&1blue',
  '&6brown',
  '&eyellow',
  '&fwhite',
  '&6orange',
  '&3teal',
  '&2green',
  '&8gray',
  '&0black'
];

let lastEatTime = 0;
let lastEat = new Set();
let prevMsg;
function onEat(cake) {
  const t = Date.now();
  if (t - lastEatTime > 5 * 60 * 1000) lastEat = new Set(cakes);
  lastEatTime = t;
  if (prevMsg) deleteMessages([prevMsg.getFormattedText()]);

  lastEat.delete(cake);
  if (lastEat.size === 0) prevMsg = new Message('&aAll cakes eaten!');
  else prevMsg = new Message(
    new TextComponent(`&bEaten ${14 - lastEat.size}/14 cakes.`)
      .setHover('show_text', [
        '&aMissing:',
        ...Array.from(lastEat.values()).map(v => `${v} &r&7(${colors[cakes.indexOf(v)]}&7)`)
      ].join('\n'))
  );
  logMessage(prevMsg);
}
const eatReg = reg('chat', onEat).setCriteria('&r&d&lYum! &r&eYou gain &r${cake} &r&efor &r&a48 &r&ehours!&r');
const refreshReg = reg('chat', onEat).setCriteria('&r&d&lBig Yum! &r&eYou refresh &r${cake} &r&efor &r&a48 &r&ehours!&r');

export function init() { }
export function load() {
  eatReg.register();
  refreshReg.register();
}
export function unload() {
  eatReg.unregister();
  refreshReg.unregister();
}