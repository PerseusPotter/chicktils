import settings from '../settings';
import { drawBeaconBeam, drawOutline, drawString, drawWaypoint } from '../util/draw';
import { execCmd, getPlayerName } from '../util/format';
import { getLeader } from '../util/party';
import { log, logMessage } from '../util/log';
import reg from '../util/registerer';
import { StateProp, StateVar } from '../util/state';
import { run } from '../util/threading';
import { dither, fromImage, fromURL, grayscale, guassian, resize, sharpen, sobel } from '../util/image';
import { getImage } from '../util/clipboard';
import { _setTimeout } from '../util/timers';

const blockedNames = new Set();
const blockNameCmd = reg('command', ign => {
  if (ign) blockedNames.add(ign);
}, 'chattils').setName('ctschatwaypointblock').setEnabled(settings._chatTilsWaypoint);

const coords = [];
const removeOldestCmd = reg('command', () => coords.shift(), 'chattils').setName('ctsremoveoldestwaypoint').setEnabled(settings._chatTilsWaypoint);
const worldRenderReg = reg('renderWorld', () => {
  if (settings.chatTilsWaypointType !== 'None') coords.forEach(v => {
    if (settings.chatTilsWaypointType === 'Box') drawWaypoint(v.x, v.y, v.z, 1, 1, settings.chatTilsWaypointColor, true, false);
    else drawOutline(v.x, v.y, v.z, 1, 1, settings.chatTilsWaypointColor, true, false);
  });
  if (settings.chatTilsWaypointBeacon) coords.forEach(v => drawBeaconBeam(v.x, v.y + 1, v.z, settings.chatTilsWaypointColor, true, false));
  if (settings.chatTilsWaypointName) coords.forEach(v => drawString(v.n, v.x + 0.5, v.y + 1.5, v.z + 0.5/*, rgbaToARGB(settings.chatTilsWaypointColor)*/));
}, 'chattils');
let waypointReloadNum = 0;
const worldUnloadReg = reg('worldUnload', () => {
  coords.length = 0;
  worldRenderReg.unregister();
  waypointReloadNum++;
}, 'chattils').setEnabled(settings._chatTilsWaypointPersist);

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

  const pos = msg.match(/(?:x: )?(-?\d+)(?:, y:)? (-?\d+)(?:, z:)? (-?\d+)/);
  if (!pos) return;

  coords.push({ x: +pos[1], y: +pos[2], z: +pos[3], n: oIgn, c: waypointReloadNum });
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
    new TextComponent('&6CLICK HERE').setClick('run_command', '/ctschatwaypointblock ' + ign),
    ' &7to ignore waypoints from them. (until game restart)'
  ));
}

const melodyMessages = new Map();
const lastMessages = new Map();
const odinMelodies = [
  'Melody terminal is at 25%',
  'Melody terminal is at 50%',
  'Melody terminal is at 75%'
];
function hideMessage(option, evn) {
  if (option === 'False') return;
  stateCancelNextPing.set(true);
  if (option === 'Both') cancel(evn);
}
function tryMelody(ign, msg, evn, mel) {
  if (mel.trim() === msg) hideMessage(settings.chatTilsHideMelody, evn);
  else if (msg.startsWith(mel) && msg.endsWith('/4')) {
    hideMessage(settings.chatTilsHideMelody, evn);
    if (settings.chatTilsCompactMelody && helper) {
      const prog = +msg.slice(-3, -2);
      const prev = prog === 1 ? mel : `${mel} ${prog - 1}/4`;
      helper.deleteMessages([new Message(`§r§9Party §8> ${ign}§f: §r${prev}§r`.toString()).getFormattedText()]);
    }
  } else {
    const i = odinMelodies.indexOf(msg);
    if (i >= 0) {
      hideMessage(settings.chatTilsHideMelody, evn);
      if (settings.chatTilsCompactMelody && helper) {
        const prev = i === 0 ? mel : odinMelodies[i - 1];
        helper.deleteMessages([new Message(`§r§9Party §8> ${ign}§f: §r${prev}§r`.toString()).getFormattedText()]);
      }
    }
  }
}

const helper = Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper');
const allChatReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}, 'chattils').setCriteria(/^&r([^>]+?)&(?:7|f): (.+?)&r$/).setEnabled(settings._chatTilsWaypoint);
const partyChatReg = reg('chat', (ign, msg, evn) => {
  processMessageWaypoint(ign, msg);

  if (settings.chatTilsHideBonzo !== 'False' && msg === 'Bonzo Procced (3s)') return hideMessage(settings.chatTilsHideBonzo, evn);
  if (settings.chatTilsHidePhoenix !== 'False' && msg === 'Phoenix Procced (3s)') return hideMessage(settings.chatTilsHidePhoenix, evn);
  if (settings.chatTilsHideLeap !== 'False' && (msg.startsWith('Leaped to ') || msg.startsWith('Leaping to ') || msg.startsWith('I\'m leaping to '))) return hideMessage(settings.chatTilsHideLeap, evn);
  if (settings.chatTilsCompactMelody || settings.chatTilsHideMelody !== 'False') {
    const lIgn = ign.toLowerCase();
    let mel = melodyMessages.get(lIgn);
    if (mel) return tryMelody(ign, msg, evn, mel);
    if (msg === 'melody' || msg === 'Melody Terminal start!') {
      melodyMessages.set(lIgn, msg);
      hideMessage(settings.chatTilsHideMelody, evn);
    } else if (msg.endsWith(' 1/4')) {
      mel = msg.slice(0, -4);
      melodyMessages.set(lIgn, mel);
      tryMelody(ign, msg, evn, mel);
    } else if (msg === odinMelodies[0]) {
      melodyMessages.set(lIgn, lastMessages.get(lIgn));
      tryMelody(ign, msg, evn, lastMessages.get(lIgn));
    } else lastMessages.set(lIgn, msg);
  }
}, 'chattils').setCriteria('&r&9Party &8> ${ign}&f: &r${msg}&r').setEnabled(new StateProp(settings._chatTilsWaypoint).or(new StateProp(settings._chatTilsHideBonzo).notequals('False')).or(new StateProp(settings._chatTilsHidePhoenix).notequals('False')).or(new StateProp(settings._chatTilsHideLeap).notequals('False')).or(new StateProp(settings._chatTilsHideMelody).notequals('False')).or(settings._chatTilsCompactMelody));
const coopChatReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}, 'chattils').setCriteria('&r&bCo-op > ${ign}&f: &r${msg}&r').setEnabled(settings._chatTilsWaypoint);
const wisperToReg = reg('chat', msg => {
  processMessageWaypoint(Player.getName(), msg);
}, 'chattils').setCriteria('&dTo ${*}&7: &r&7${msg}&r').setEnabled(settings._chatTilsWaypoint);
const wisperFromReg = reg('chat', (ign, msg) => {
  processMessageWaypoint(ign, msg);
}, 'chattils').setCriteria('&dFrom ${ign}&7: &r&7${msg}&r').setEnabled(settings._chatTilsWaypoint);
const guildChatReg = reg('chat', (ign, msg) => {
  // better not be able to contain [ in guild ranks
  if (ign.endsWith(']')) ign = ign.split(0, ign.lastIndexOf('['));
  processMessageWaypoint(ign, msg);
}, 'chattils').setCriteria('&r&2Guild > ${ign}&f: &r${msg}&r').setEnabled(settings._chatTilsWaypoint);

const stateCancelNextPing = new StateVar(false);
const chatPingReg = reg('soundPlay', (pos, name, vol, pitch, cat, evn) => {
  if (name !== 'random.orb' || vol !== 1 || pitch !== 1) return;
  cancel(evn);
  stateCancelNextPing.set(false);
}, 'chattils').setEnabled(new StateProp(stateCancelNextPing).and(new StateProp(settings._chatTilsHideBonzo).notequals('False').or(new StateProp(settings._chatTilsHidePhoenix).notequals('False')).or(new StateProp(settings._chatTilsHideLeap).notequals('False')).or(new StateProp(settings._chatTilsHideMelody).notequals('False'))));

// https://github.com/bowser0000/SkyblockMod/blob/7f7ffca9cad7340ea08354b0a8a96eac4e88df88/src/main/java/me/Danker/features/FasterMaddoxCalling.java#L24
let lastFollowTime = 0;
let lastFollowToken = '';
const followReg = reg(net.minecraftforge.client.event.ClientChatReceivedEvent, evn => {
  const msg = evn.message.func_150254_d().match(/§9§l» (.+?) §eis traveling to (.+?) §e§lFOLLOW§r/);
  if (!msg) return;
  const ign = getPlayerName(msg[1]);
  if (ign === Player.getName()) return;
  if (settings.chatTilsClickAnywhereFollowOnlyLead && ign !== getLeader()) return;
  lastFollowTime = Date.now();
  lastFollowToken = evn.message.func_150256_b().func_150235_h()?.func_150668_b();
  log(`Open chat then click anywhere on-screen to follow &b${ign}`);
}, 'chattils').setEnabled(settings._chatTilsClickAnywhereFollow);
const clickChatReg = reg(net.minecraftforge.client.event.GuiScreenEvent.MouseInputEvent.Post, evn => {
  if (Java.type('org.lwjgl.input.Mouse').getEventButtonState() || Java.type('org.lwjgl.input.Mouse').getEventButton() != 0 || !(evn.gui instanceof Java.type('net.minecraft.client.gui.GuiChat'))) return;
  if (!lastFollowToken || Date.now() - lastFollowTime > 10_000) return;
  execCmd(lastFollowToken.slice(1));
}, 'chattils').setEnabled(settings._chatTilsClickAnywhereFollow);

let imgArtLines = [];
let imgArtId = 0;
let blankLines = ['.', ',', '\'', '"', '`', '^'];
const genImgArtReg = (function() {
  function loadFromUrl(url) {
    if (url) try {
      return fromURL(url);
    } catch (e) {
      log('unable to load image from url');
      if (settings.isDev) {
        log(e.message);
        log(e.stack);
      }
    }
  }
  /**
   * @param {import('../../@types/External').JavaClass<'java.awt.image.BufferedImage'>} img
   * @link https://github.com/505e06b2/Image-to-Braille/blob/master/braille.js
   */
  function encodeBraille(img) {
    const w = img.getWidth();
    const h = img.getHeight();
    const l = h * w;
    const mh = ((h + 7) & ~7);
    const output = [];
    const pixels = img.getRaster().getDataBuffer().getData();
    const n = i => {
      const p = i >= l ? 0 : pixels[i];
      return settings.chatTilsImageArtInvert ? p >= 0 : p <= 0;
    };

    for (let y = 0; y < mh; y += 4) {
      output.push([]);
      for (let x = 0; x < w; x += 2) {
        let i = y * w + x;
        let offset =
          (n(i + 0) << 0) |
          (n(i + 1) << 3) |
          (n(i + w + 0) << 1) |
          (n(i + w + 1) << 4) |
          (n(i + w + w + 0) << 2) |
          (n(i + w + w + 1) << 5) |
          (n(i + w + w + w + 0) << 6) |
          (n(i + w + w + w + 1) << 7);

        // if (offset === 0) offset = 4;
        output[output.length - 1].push(0x2800 | offset);
      }
    }

    return output.map(v => String.fromCharCode.apply(null, v));
  }
  const ab = '$@B%8WM#oahkbdpqwmZOQLCJUYXzcvunxrjft/|()1{}[]?-_+~<>!l;:,\"^`\'. '.split('');
  // ab.length === 64
  /**
   * @param {import('../../@types/External').JavaClass<'java.awt.image.BufferedImage'>} img
   */
  function encodeASCII(img) {
    const w = img.getWidth();
    const h = img.getHeight();
    const output = [];
    const pixels = img.getRaster().getDataBuffer().getData();

    for (let y = 0; y < h; y++) {
      output.push([]);
      for (let x = 0; x < w; x++) {
        let i = y * w + x;
        let p = (pixels[i] + 128) >> 2;
        output[output.length - 1].push(ab[settings.chatTilsImageArtInvert ? 63 - p : p]);
      }
    }

    return output.map(v => v.join(''));
  }
  return reg('command', url => {
    run(() => {
      let img;
      if (url) img = loadFromUrl(url);
      else try {
        img = fromImage(getImage());
      } catch (e) {
        log('unable to load image from clipboard');
        if (settings.isDev) {
          log(e.message);
          log(e.stack);
        }
      }
      if (!img) return;

      try {
        const h = ~~(img.getHeight() / img.getWidth() * settings.chatTilsImageArtWidth * 2 / 3);
        if (settings.chatTilsImageArtEncoding === 'Braille') {
          const w = settings.chatTilsImageArtWidth << 1;
          img = resize(img, w, h << 1);
          // if (img.getHeight() & 7) img = img.getSubimage(0, 0, w, img.getHeight() & ~7);
        } else img = resize(img, settings.chatTilsImageArtWidth, h);
        if (settings.chatTilsImageArtUseGaussian) img = guassian(img);
        if (settings.chatTilsImageArtSharpen) img = sharpen(img);
        if (settings.chatTilsImageArtDither) dither(img);
        if (settings.chatTilsImageArtAlgorithm === 'Grayscale') img = grayscale(img);
        else if (settings.chatTilsImageArtAlgorithm === 'Sobel') img = sobel(img);
        if (imgArtLines.length) log(`&coverriding ${imgArtLines.length} previously existing line${imgArtLines === 1 ? '' : 's'}`);
        imgArtId = 0;
        if (settings.chatTilsImageArtEncoding === 'Braille') imgArtLines = encodeBraille(img);
        else if (settings.chatTilsImageArtEncoding === 'ASCII') imgArtLines = encodeASCII(img);
      } catch (e) {
        log('unable to generate text from image');
        if (settings.isDev) {
          log(e.message);
          log(e.stack);
        }
        return;
      }
      ChatLib.command('printimageline', true);
    });
  }, 'chattils').setName('printimage').setEnabled(settings._chatTilsImageArt);
}());
const nextArtLineMsg = new Message(new TextComponent('&a[NEXT]').setClick('run_command', '/printimageline'), ' ', new TextComponent('&4[CANCEL]').setClick('run_command', '/printimagecancel'));
function printNextLine() {
  let l = imgArtLines.shift();
  if (!l) return log('&cno more lines left');
  if (!l.trim()) {
    l = blankLines.shift();
    blankLines.push(l);
  } else if (settings.chatTilsImageArtEncoding === 'Braille') l += String.fromCharCode(0x2800 | (imgArtId++));
  else l += imgArtId++;
  if (settings.chatTilsImageArtParty) l = '/pc ' + l;
  ChatLib.say(l);
  _setTimeout(() => {
    helper.deleteMessages([nextArtLineMsg.getFormattedText()]);
    if (imgArtLines.length) {
      if (settings.chatTilsImageArtAutoPrint) printNextLine();
      else nextArtLineMsg.chat();
    } else log('all lines printed!');
  }, 500);
}
const nextArtLineReg = reg('command', () => printNextLine(), 'chattils').setName('printimageline').setEnabled(settings._chatTilsImageArt);
const cancelArtLines = reg('command', () => {
  if (imgArtLines.length) {
    log(`cleared ${imgArtLines.length} remaining lines`);
    imgArtLines = [];
  } else log('&cno lines to clear');
}, 'chattils').setName('printimagecancel').setEnabled(settings._chatTilsImageArt);

export function init() {
  settings._chatTilsWaypointDuration.onBeforeChange(() => coords.length > 0 && log('Uh Oh! Looks like you are about to change the duration of waypoints with current ones active. Be wary that this may mess up the order that those waypoints disappear!'));
}
export function load() {
  blockNameCmd.register();
  removeOldestCmd.register();
  worldUnloadReg.register();
  allChatReg.register();
  partyChatReg.register();
  coopChatReg.register();
  wisperToReg.register();
  wisperFromReg.register();
  guildChatReg.register();
  chatPingReg.register();
  followReg.register();
  clickChatReg.register();
  genImgArtReg.register();
  nextArtLineReg.register();
  cancelArtLines.register();
}
export function unload() {
  blockNameCmd.unregister();
  removeOldestCmd.unregister();
  worldUnloadReg.register();
  allChatReg.unregister();
  partyChatReg.unregister();
  coopChatReg.unregister();
  wisperToReg.unregister();
  wisperFromReg.unregister();
  guildChatReg.unregister();
  chatPingReg.unregister();
  followReg.unregister();
  clickChatReg.unregister();
  genImgArtReg.unregister();
  nextArtLineReg.unregister();
  cancelArtLines.unregister();
}