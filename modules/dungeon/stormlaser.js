import settings from '../../settings';
import { log } from '../../util/log';
import reg from '../../util/registerer';
import { StateProp, StateVar } from '../../util/state';
import { unrun } from '../../util/threading';
import { getPlayers, listenBossMessages, registerTrackHeldItem, registerTrackPlayers, stateBossName, stateFloor, stateIsInBoss } from '../dungeon.js';

const stateInStormClear = new StateVar(true);
const stateEnabled = new StateProp(stateFloor).equalsmult('F7', 'M7').and(settings._dungeonStormClearLaser).and(stateIsInBoss).and(stateInStormClear).and(new StateProp(stateBossName).equals('Storm'));

const swingReg = reg('packetReceived', pack => {
  if (pack.func_148977_d() !== 0) return;
  const id = pack.func_148978_c();
  unrun(() => {
    const player = getPlayers().find(v => v.me?.func_145782_y() === id);
    if (!player) return;
    if (player.items.getFirst()?.id !== 'TERMINATOR') return;
    log(`&4&l${player.ign}&r &7(${player.class}) &cused term laser in storm clear ಠ╭╮ಠ`);
  });
}).setFilteredClass(net.minecraft.network.play.server.S0BPacketAnimation).setEnabled(stateEnabled);

export function init() {
  registerTrackPlayers(stateEnabled);
  registerTrackHeldItem(stateEnabled);
  listenBossMessages((name, msg) => {
    if (name !== 'Storm') return;
    if (msg === 'ENERGY HEED MY CALL!' || msg === 'THUNDER LET ME BE YOUR CATALYST!') stateInStormClear.set(false);
  });
}
export function enter() {
  stateInStormClear.set(true);
}
export function start() {
  swingReg.register();
}
export function reset() {
  swingReg.unregister();
}