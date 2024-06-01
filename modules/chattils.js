import settings from '../settings';
import { drawBeaconBeam, drawBoxAtBlock, drawString, renderWaypoints } from '../util/draw';
import { execCmd, getPlayerName } from '../util/format';
import { getLeader } from '../util/party';
import { log, logMessage } from '../util/log';
import { reg, regForge } from '../util/registerer';
import { StateProp } from '../util/state';

const blockedNames = new Set();
const blockNameCmd = reg('command', ign => {
  if (ign) blockedNames.add(ign);
}).setName('ctschatwaypointblock').setEnabled(settings._chatTilsWaypoint);

const coords = [];
const removeOldestCmd = reg('command', () => coords.shift()).setName('ctsremoveoldestwaypoint').setEnabled(settings._chatTilsWaypoint);
const worldRenderReg = reg('renderWorld', partial => {
  const c = settings.chatTilsWaypointColor;
  const r = ((c >> 24) & 0xFF) / 256;
  const g = ((c >> 16) & 0xFF) / 256;
  const b = ((c >> 8) & 0xFF) / 256;
  const a = ((c >> 0) & 0xFF) / 256;
  if (settings.chatTilsWaypointType === 'Box') renderWaypoints(coords, r, g, b, true, false);
  if (settings.chatTilsWaypointType === 'Wireframe') coords.forEach(v => drawBoxAtBlock(v.x, v.y, v.z, r, g, b, 1, 1, a));
  if (settings.chatTilsWaypointBeacon) coords.forEach(v => drawBeaconBeam(v.x, v.y + 1, v.z, r, g, b, a, false));
  if (settings.chatTilsWaypointName) coords.forEach(v => drawString(v.n, v.x + 0.5, v.y + 1.5, v.z + 0.5/*, rgbaToARGB(c)*/));
});
let waypointReloadNum = 0;
const worldUnloadReg = reg('worldUnload', () => {
  coords.length = 0;
  worldRenderReg.unregister();
  waypointReloadNum++;
}).setEnabled(settings._chatTilsWaypointPersist);

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
  const re = /(?:\b|(?=-))(-?\d+(?:\.?\d+)?)\b/g;
  let match;
  let lastPos = 0;
  while (match = re.exec(msg)) {
    if (match.index - lastPos > 5) return;
    pos.push(+match[1]);
    lastPos = match.index + match[0].length;
    if (pos.length > 3) return;
  }
  if (pos.length !== 3) return;

  coords.push({ x: pos[0], y: pos[1], z: pos[2], n: oIgn, c: waypointReloadNum });
  if (settings.chatTilsWaypointDuration) Client.scheduleTask(settings.chatTilsWaypointDuration * 20, () => {
    if (coords.length === 0) return;
    if (coords[0].c !== waypointReloadNum) return;
    coords.shift();
    if (coords.length === 0) worldRenderReg.unregister();
  });
  if (coords.length === 1) worldRenderReg.register();

  if (isOwn) log('&7Loaded waypoint from chat.');
  else logMessage(new Message(
    `&7Loaded waypoint from &3${ign}&7. `,
    new TextComponent('&6CLICK HERE').setClick('run_command', 'ctschatwaypointblock ' + ign),
    ' &7to ignore waypoints from them. (until game restart)'
  ));
}

const melodyMessages = new Map();
function hideMessage(option, evn) {
  if (option === 'False') return;
  cancelNextPing = true;
  if (option === 'Both') cancel(evn);
}
function tryMelody(ign, msg, evn, mel) {
  if (mel === msg) hideMessage(settings.chatTilsHideMelody, evn);
  else if (msg.startsWith(mel) && msg.endsWith('/4')) {
    hideMessage(settings.chatTilsHideMelody, evn);
    if (settings.chatTilsCompactMelody && helper) {
      const prog = +msg.slice(-3, -2);
      const prev = prog === 1 ? mel : `${mel} ${prog - 1}/4`;
      helper.deleteMessages([new Message(`§r§9Party §8> ${ign}§f: §r${prev}§r`.toString()).getFormattedText()]);
    }
  }
}
const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');

const allChatReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}).setCriteria(/^&r([^>]+?)&(?:7|f): (.+?)&r$/).setEnabled(settings._chatTilsWaypoint);
const partyChatReg = reg('chat', (ign, msg, evn) => {
  processMessageWaypoint(ign, msg);

  if (settings.chatTilsHideBonzo !== 'False' && msg === 'Bonzo Procced (3s)') return hideMessage(settings.chatTilsHideBonzo, evn);
  if (settings.chatTilsHidePhoenix !== 'False' && msg === 'Phoenix Procced (3s)') return hideMessage(settings.chatTilsHidePhoenix, evn);
  if (settings.chatTilsHideLeap !== 'False' && msg.startsWith('Leaped to ')) return hideMessage(settings.chatTilsHideLeap, evn);
  if (settings.chatTilsCompactMelody || settings.chatTilsHideMelody !== 'False') {
    const lIgn = ign.toLowerCase();
    let mel = melodyMessages.get(lIgn);
    if (mel) return tryMelody(ign, msg, evn, mel);
    if (msg === 'melody') {
      melodyMessages.set(lIgn, msg);
      hideMessage(settings.chatTilsHideMelody, evn);
      return;
    } else if (msg.endsWith(' 1/4')) {
      mel = msg.slice(0, -4);
      melodyMessages.set(lIgn, mel);
      tryMelody(ign, msg, evn, mel);
      return;
    }
  }
}).setCriteria('&r&9Party &8> ${ign}&f: &r${msg}&r').setEnabled(new StateProp(settings._chatTilsWaypoint).or(new StateProp(settings._chatTilsHideBonzo).notequals('False')).or(new StateProp(settings._chatTilsHidePhoenix).notequals('False')).or(new StateProp(settings._chatTilsHideLeap).notequals('False')).or(new StateProp(settings._chatTilsHideMelody).notequals('False')).or(settings._chatTilsCompactMelody));
const coopChatReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}).setCriteria('&r&bCo-op > ${ign}&f: &r${msg}&r').setEnabled(settings._chatTilsWaypoint);
const wisperToReg = reg('chat', msg => {
  processMessageWaypoint(Player.getName(), msg);
}).setCriteria('&dTo ${*}&7: &r&7${msg}&r').setEnabled(settings._chatTilsWaypoint);
const wisperFromReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}).setCriteria('&dFrom ${ign}&7: &r&7${msg}&r').setEnabled(settings._chatTilsWaypoint);
const guildChatReg = reg('chat', (ign, msg) => {
  // better not be able to contain [ in guild ranks
  if (ign.endsWith(']')) ign = ign.split(0, ign.lastIndexOf('['));
  processMessageWaypoint(ign, msg);
}).setCriteria('&r&2Guild > ${ign}&f: &r${msg}&r').setEnabled(settings._chatTilsWaypoint);

let cancelNextPing = false;
const chatPingReg = reg('soundPlay', (pos, name, vol, pitch, cat, evn) => {
  if (!cancelNextPing || name !== 'random.orb' || vol !== 1 || pitch !== 1) return;
  cancel(evn);
  cancelNextPing = false;
}).setEnabled(new StateProp(settings._chatTilsHideBonzo).notequals('False').or(new StateProp(settings._chatTilsHidePhoenix).notequals('False')).or(new StateProp(settings._chatTilsHideLeap).notequals('False')).or(new StateProp(settings._chatTilsHideMelody).notequals('False')));

// https://github.com/bowser0000/SkyblockMod/blob/7f7ffca9cad7340ea08354b0a8a96eac4e88df88/src/main/java/me/Danker/features/FasterMaddoxCalling.java#L24
let lastFollowTime = 0;
let lastFollowToken = '';
const followReg = regForge(net.minecraftforge.client.event.ClientChatReceivedEvent, undefined, evn => {
  const msg = evn.message.func_150254_d().match(/§9§l» (.+?) §eis traveling to (.+?) §e§lFOLLOW§r/);
  if (!msg) return;
  const ign = getPlayerName(msg[1]);
  if (ign === Player.getName()) return;
  if (settings.chatTilsClickAnywhereFollowOnlyLead && ign !== getLeader()) return;
  lastFollowTime = Date.now();
  lastFollowToken = evn.message.func_150256_b().func_150235_h()?.func_150668_b();
  log(`Open chat then click anywhere on-screen to follow &b${ign}`);
}).setEnabled(settings._chatTilsClickAnywhereFollow);
const clickChatReg = regForge(net.minecraftforge.client.event.GuiScreenEvent.MouseInputEvent.Post, undefined, evn => {
  if (Java.type('org.lwjgl.input.Mouse').getEventButtonState() || Java.type('org.lwjgl.input.Mouse').getEventButton() != 0 || !(evn.gui instanceof Java.type('net.minecraft.client.gui.GuiChat'))) return;
  if (!lastFollowToken || Date.now() - lastFollowTime > 10_000) return;
  execCmd(lastFollowToken.slice(1));
}).setEnabled(settings._chatTilsClickAnywhereFollow);

export function init() {
  settings._chatTilsWaypointDuration.onBeforeChange(() => coords.length > 0 && log('Uh Oh! Looks like you are about to change the duration of waypoints with current ones active. Be wary that this may mess up the order that those waypoints disappear!'));
}
export function load() {
  blockNameCmd.register();
  removeOldestCmd.register();
  allChatReg.register();
  partyChatReg.register();
  coopChatReg.register();
  wisperToReg.register();
  wisperFromReg.register();
  guildChatReg.register();
  chatPingReg.register();
  followReg.register();
  clickChatReg.register();
}
export function unload() {
  blockNameCmd.unregister();
  removeOldestCmd.unregister();
  allChatReg.unregister();
  partyChatReg.unregister();
  coopChatReg.unregister();
  wisperToReg.unregister();
  wisperFromReg.unregister();
  guildChatReg.unregister();
  chatPingReg.unregister();
  followReg.unregister();
  clickChatReg.unregister();
}