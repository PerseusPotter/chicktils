import settings from '../settings';
import data from '../data';
import reg from '../util/registerer';
import createTextGui from '../util/customtextgui';
import { StateProp, StateVar } from '../util/state';

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
 * @param {string} song
 */
function formatSong(song) {
  return '&2Spotify &7>&r ' + (spotifyNames[song] ?? '&a' + song.replace(/&([\da-fk-or])/g, '&🐀$1').replace(' - ', ' &7-&b '));
}

// const stateSpotifyPID = new StateVar(-1);
const stateSpotifyOpen = new StateVar(false);
const spotifyGui = createTextGui(() => data.spotifyDisplayLoc, () => [formatSong('Rick Astley - Never Gonna Give You Up')]);

const renderReg = reg('renderOverlay', () => spotifyGui.render(), 'spotify').setEnabled(new StateProp(settings._spotifyHideNotOpen).not().or(stateSpotifyOpen));
const updateReg = reg('step', () => {
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
    spotifyGui.setLine(formatSong(name));
    stateSpotifyOpen.set(true);
    return;
  }
  spotifyGui.setLine(formatSong('NOT OPENED'));
  stateSpotifyOpen.set(false);
  // proc.waitFor();
}, 'spotify').setDelay(2);

export function init() {
  settings._moveSpotifyDisplay.onAction(() => spotifyGui.edit());
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