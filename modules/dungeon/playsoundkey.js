import settings from '../../settings';
import reg from '../../util/registerer';
import { log } from '../../util/log';
import { StateProp } from '../../util/state';
import { stateIsInBoss } from '../dungeon.js';

const SecretSounds = Java.type('dulkirmod.features.dungeons.SecretSounds');
const pickupKeyReg = reg('chat', () => SecretSounds.INSTANCE.playSound()).setCriteria('&r&e&lRIGHT CLICK &r&7on ${*} to open it. This key can only be used to open &r&a1&r&7 door!&r').setEnabled(new StateProp(stateIsInBoss).not().and(settings._dungeonPlaySoundKey).and(Boolean(SecretSounds)));

export function init() {
  settings._dungeonPlaySoundKey.onAfterChange(v => v && !SecretSounds && log('Dulkir not found. (will not work)'));
}
export function start() {
  pickupKeyReg.register();
}
export function reset() {
  pickupKeyReg.unregister();
}