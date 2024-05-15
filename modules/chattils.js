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
  Client.scheduleTask(settings.chatTilsWaypointDuration * 20, () => {
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

const allChatReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}).setCriteria('&r${ign}&f: ${msg}&r');
const partyChatReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
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
}
export function load() {
  regs.forEach(v => v.register());
}
export function unload() {
  regs.forEach(v => v.unregister());
  worldRenderReg.unregister();
  worldUnloadReg.unregister();
}