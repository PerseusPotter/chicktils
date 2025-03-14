import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateIsInBoss } from '../dungeon.js';
import { JavaTypeOrNull } from '../../util/polyfill';
import { unrun } from '../../util/threading';

const DulkirConfig = JavaTypeOrNull('dulkirmod.config.DulkirConfig')?.INSTANCE;
let lastPlay = 0;
function playSound() {
  const t = Date.now();
  if (t - lastPlay < 50) return;
  lastPlay = t;
  unrun(() => {
    const prev = Client.settings.sound.getNoteblockVolume();
    Client.settings.sound.setNoteblockVolume(1);
    World.playSound('note.pling', DulkirConfig ? DulkirConfig.secretSoundVolume : 1, 1);
    Client.settings.sound.setNoteblockVolume(prev);
  });
}

const pickupKeyReg = reg('chat', () => playSound()).setCriteria('&r&e&lRIGHT CLICK &r&7on ${*} to open it. This key can only be used to open &r&a1&r&7 door!&r').setEnabled(new StateProp(stateIsInBoss).not().and(settings._dungeonPlaySoundKey));

export function init() { }
export function start() {
  pickupKeyReg.register();
}
export function reset() {
  pickupKeyReg.unregister();
}