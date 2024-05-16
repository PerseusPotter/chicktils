import settings from '../settings';
import { drawBoxAtBlock, renderWaypoints } from '../util/draw';
import drawBeaconBeam from '../../BeaconBeam/index';
import { getPlayerName } from '../util/format';
import { log, logMessage } from '../util/log';
import { reg } from '../util/registerer';

const blockedNames = new Set();
reg('command', ign => {
  if (ign) blockedNames.add(ign);
}).setName('ctschatwaypointblock');

const coords = [];
reg('command', () => coords.shift()).setName('ctsremoveoldestwaypoint');
const worldRenderReg = reg('renderWorld', partial => {
  const c = settings.chatTilsWaypointColor;
  const r = ((c >> 24) & 0xFF) / 256;
  const g = ((c >> 16) & 0xFF) / 256;
  const b = ((c >> 8) & 0xFF) / 256;
  const a = ((c >> 0) & 0xFF) / 256;
  if (settings.chatTilsWaypointType === 'Box') renderWaypoints(coords, r, g, b, true, false);
  if (settings.chatTilsWaypointType === 'Wireframe') coords.forEach(v => drawBoxAtBlock(v.x, v.y, v.z, r, g, b, 1, 1, a));
  if (settings.chatTilsWaypointBeacon) coords.forEach(v => drawBeaconBeam(v.x, v.y + 1, v.z, r, g, b, a, false));
  if (settings.chatTilsWaypointName) coords.forEach(v => Tessellator.drawString(v.n, v.x + 0.5, v.y + 1.5, v.z + 0.5/*, rgbaToARGB(c)*/));
});
let waypointReloadNum = 0;
const worldUnloadReg = reg('worldUnload', () => {
  coords.length = 0;
  worldRenderReg.unregister();
  waypointReloadNum++;
});

/**
 * @param {string} ign
 * @param {string} msg
 */
function processMessageWaypoint(ign, msg) {
  if (!settings.chatTilsWaypoint) return;
  const oIgn = getPlayerName(ign);
  ign = oIgn.toLowerCase();
  if (blockedNames.has(ign)) return;
  const isOwn = ign === Player.getName().toLowerCase();
  if (isOwn && !settings.chatTilsWaypointShowOwn) return;

  const pos = [];
  const re = /(?:\b|(?=-))(-?\d+)\b/g;
  let match;
  while (match = re.exec(msg)) {
    pos.push(+match[1]);
    if (pos.length > 3) return;
  }
  if (pos.length !== 3) return;

  coords.push({ x: pos[0], y: pos[1], z: pos[2], n: oIgn, z: waypointReloadNum });
  if (settings.chatTilsWaypointDuration) Client.scheduleTask(settings.chatTilsWaypointDuration * 20, () => {
    if (coords.length === 0) return;
    if (coords[0].z !== waypointReloadNum) return;
    coords.shift();
    if (coords.length === 0) worldRenderReg.unregister();
  });
  if (coords.length === 1) worldRenderReg.register();

  if (isOwn) log('&7Loaded waypoint from chat.');
  else logMessage(new Message(
    '&7Loaded waypoint from chat. Click ',
    new TextComponent('&6HERE').setClick('run_command', 'ctschatwaypointblock ' + ign),
    ' &7to block waypoints from them (until game restart)'
  ));
}

const melodyMessages = new Map();
function hideMessage(option, evn) {
  if (option === 'False') return;
  cancelNextPing = true;
  if (option === 'Both') cancel(evn);
}
function tryMelody(msg, evn, mel) {
  if (mel === msg) hideMessage(settings.chatTilsHideMelody, evn);
  else if (msg.startsWith(mel) && msg.endsWith('/4')) {
    hideMessage(settings.chatTilsHideMelody, evn);
    if (settings.chatTilsCompactMelody && helper) {
      const prog = +msg.slice(-3, -2);
      const prev = prog === 1 ? mel : `${mel} ${prog - 1}/4`;
      helper.deleteMessages([`&r&9Party &8> ${ign}&f: &r${prev}&r`.toString()]);
    }
  } else return false;
  return true;
}
const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');

const allChatReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}).setCriteria('&r${ign}&f: ${msg}&r');
const partyChatReg = reg('chat', (ign, msg, evn) => {
  processMessageWaypoint(ign, msg);
  if (settings.chatTilsHideBonzo !== 'False' && msg === 'Bonzo Procced (3s)') return hideMessage(settings.chatTilsHideBonzo, evn);
  if (settings.chatTilsHidePhoenix !== 'False' && msg === 'Phoenix Procced (3s)') return hideMessage(settings.chatTilsHidePhoenix, evn);
  if (settings.chatTilsHideLeap !== 'False' && msg.startsWith('Leaped to ')) return hideMessage(settings.chatTilsHideLeap, evn);
  if (settings.chatTilsCompactMelody || settings.chatTilsHideMelody !== 'False') {
    const lIgn = ign.toLowerCase();
    let mel = melodyMessages.get(lIgn);
    if (mel) return tryMelody(msg, evn, mel);
    if (msg === 'melody') {
      melodyMessages.set(lIgn, msg);
      hideMessage(settings.chatTilsHideMelody, evn);
      return;
    } else if (msg.endsWith(' 1/4')) {
      mel = msg.slice(0, -4);
      melodyMessages.set(lIgn, mel);
      tryMelody(msg, evn, mel);
      return;
    }
  }
}).setCriteria('&r&9Party &8> ${ign}&f: &r${msg}&r');
const coopChatReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}).setCriteria('&r&bCo-op > ${ign}&f: &r${msg}&r');
const wisperToReg = reg('chat', msg => {
  processMessageWaypoint(Player.getName(), msg);
}).setCriteria('&dTo ${*}&7: &r&7${msg}&r');
const wisperFromReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}).setCriteria('&dFrom ${ign}&7: &r&7${msg}&r');
const guildChatReg = reg('chat', (ign, msg) => {
  // better not be able to contain [ in guild ranks
  if (ign.endsWith(']')) ign = ign.split(0, ign.lastIndexOf('['));
  processMessageWaypoint(ign, msg);
}).setCriteria('&r&2Guild > ${ign}&f: &r${msg}&r');
const regs = [allChatReg, partyChatReg, coopChatReg, wisperToReg, wisperFromReg, guildChatReg];

export function init() {
  settings._chatTilsWaypointPersist.onAfterChange(v => {
    if (v) worldUnloadReg.unregister();
    else worldUnloadReg.register();
  });
  settings._chatTilsWaypointDuration.onBeforeChange(() => coords.length > 0 && log('Uh Oh! Looks like you are about to change the duration of waypoints with current ones active. Be wary that this may mess up the order that those waypoints disappear!'));
  settings._chatTilsHideMelody.onAfterChange(v => {
    if (v !== 'None') chatPingReg.register();
    else chatPingReg.unregister();
  });
}
export function load() {
  regs.forEach(v => v.register());
}
export function unload() {
  regs.forEach(v => v.unregister());
  worldRenderReg.unregister();
  worldUnloadReg.unregister();
}

let cancelNextPing = false;
const chatPingReg = reg('soundPlay', (pos, name, vol, pitch, cat, evn) => {
  if (!cancelNextPing || name !== 'random.orb' || vol !== 1 || pitch !== 1) return;
  cancel(evn);
  cancelNextPing = false;
});