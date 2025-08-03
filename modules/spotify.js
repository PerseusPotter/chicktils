import settings from '../settings';
import data from '../data';
import reg from '../util/registerer';
import createTextGui, { editDisplay } from '../util/customtextgui';
import { StateProp, StateVar } from '../util/state';
import Marquee from '../util/marquee';
import { unrun } from '../util/threading';

const ProcessBuilder = Java.type('java.lang.ProcessBuilder');
const Scanner = Java.type('java.util.Scanner');

const spotifyNames = {
  'Spotify Free': '&cPaused',
  'Spotify Premium': '&cPaused',
  'AngleHiddenWindow': '&cPaused',
  'Spotify': '&aAdvertisement',
  'NOT OPENED': '&cNot Opened'
};
/**
 * @param {string} artist
 * @param {string} song
 */
function formatSong(artist, song) {
  return settings.spotifyFormat
    .replace('%ARTIST%', artist.replace(/&([\da-fk-or])/g, '&​$1'))
    .replace('%SONG%', song.replace(/&([\da-fk-or])/g, '&​$1'));
}

// const stateSpotifyPID = new StateVar(-1);
const stateSpotifyOpen = new StateVar(false);
let spotifyPrefixDisplay = '';
function updatePrefix(d = 1) {
  // lmao i give up
  if (d > 0) Client.scheduleTask(5, updatePrefix(d - 1));
  spotifyGui.setLine(' ');
  spotifyGui._forceUpdate();
  const spaceWidth = spotifyGui.getWidth();
  spotifyPrefixDisplay = settings.spotifyPrefix + ' '.repeat(settings.spotifyMaxSongLength / spaceWidth);
  spotifyGui.setLine(spotifyPrefixDisplay);
}
const spotifyGui = createTextGui(() => data.spotifyDisplayLoc, () => [spotifyPrefixDisplay]);
unrun(() => updatePrefix());
spotifyGui.on('editRender', () => {
  updatePrefix();
  const loc = editDisplay.getTrueLoc();
  songMarquee.setText(formatSong('Rick Astley', 'Never Gonna Give You Up'));
  songMarquee.render(loc.x + editDisplay.getVisibleWidth() + 4, loc.y, loc.s, editDisplay.getLoc().b);
});
const songMarquee = new Marquee(formatSong('Rick Astley', 'Never Gonna Give You Up'));
songMarquee.setMaxLen(settings.spotifyMaxSongLength);
songMarquee.setScrollSpeed(settings.spotifyScrollSpeed);
songMarquee.setAlternate(settings.spotifyAlternateScrolling);
spotifyGui.on('editClose', () => updateReg.forceTrigger());

const renderReg = reg('renderOverlay', () => {
  if (spotifyGui.isEdit) return;
  spotifyGui.render();
  const loc = spotifyGui.getTrueLoc();
  songMarquee.render(loc.x + spotifyGui.getVisibleWidth() + 4, loc.y, loc.s, spotifyGui.getLoc().b);
}).setEnabled(new StateProp(settings._spotifyHideNotOpen).not().or(stateSpotifyOpen));
const updateReg = reg('step', () => {
  if (spotifyGui.isEdit) return;
  const proc = new ProcessBuilder(
    'cmd.exe', '/s', '/c',
    'chcp', '65001',
    '&&',
    'tasklist.exe',
    '/fo', 'csv',
    '/nh',
    '/v',
    '/fi', '"IMAGENAME eq Spotify.exe"'
  ).start();
  const sc = new Scanner(proc.getInputStream(), 'utf-8');
  // Active code page: 65001
  sc.nextLine();
  while (sc.hasNextLine()) {
    let line = sc.nextLine();
    if (line === 'INFO: No tasks are running which match the specified criteria.') break;
    let parts = line.split('","');
    let name = parts.slice(8).join('","').slice(0, -1);
    if (name === 'N/A') continue;
    name = name.trim();
    if (name in spotifyNames) songMarquee.setText(spotifyNames[name]);
    else {
      const i = name.indexOf(' - ');
      songMarquee.setText(formatSong(name.slice(0, i), name.slice(i + 3)));
    }
    stateSpotifyOpen.set(true);
    return;
  }
  songMarquee.setText(spotifyNames['NOT OPENED']);
  stateSpotifyOpen.set(false);
  // proc.waitFor();
}).setDelay(2);

export function init() {
  settings._moveSpotifyDisplay.onAction(v => spotifyGui.edit(v));
  settings._spotifyMaxSongLength.listen(v => {
    songMarquee.setMaxLen(v);
    updatePrefix();
  });
  settings._spotifyPrefix.listen(() => updatePrefix());
  settings._spotifyScrollSpeed.listen(v => songMarquee.setScrollSpeed(v));
  settings._spotifyAlternateScrolling.listen(v => songMarquee.setAlternate(v));
}
export function load() {
  // stateSpotifyPID.set(-1);
  stateSpotifyOpen.set(false);

  renderReg.register();
  updateReg.register();
}
export function unload() {
  renderReg.unregister();
  updateReg.unregister();
}