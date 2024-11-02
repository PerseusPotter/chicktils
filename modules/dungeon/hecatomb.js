import settings from '../../settings';
import createAlert from '../../util/alert';
import { listenBossMessages, stateFloor } from '../dungeon.js';

const hecAlert = createAlert('Hecatomb');

function onBossEnd() {
  let score = -1;
  const sb = Scoreboard.getLines(false);
  for (let i = 0; i < sb.length; i++) {
    let m = sb[i].getName().match(/^Cleared:.+?\((\d+)\)$/);
    if (!m) continue;
    score = +m[1];
    break;
  }
  if (Number.isNaN(score) || score < 270) return;
  hecAlert.show(settings.dungeonHecatombAlertTime);
}

export function init() {
  listenBossMessages((name, msg) => {
    if (!settings.dungeonHecatombAlert) return;
    if (name.endsWith('Livid') && msg === `Impossible! How did you figure out which one I was?!`) return onBossEnd();
    switch (name) {
      case 'Bonzo':
        if (msg === `Alright, maybe I'm just weak after all..`) onBossEnd();
        break;
      case 'Scarf':
        if (msg === `Whatever...`) onBossEnd();
        break;
      case 'The Professor':
        if (msg === `What?! My Guardian power is unbeatable!`) onBossEnd();
        break;
      case 'Thorn':
        // if (msg === `This is it... where shall I go now?`) onBossEnd();
        break;
      case 'Sadan':
        if (msg === `Maybe in another life. Until then, meet my ultimate corpse.`) onBossEnd();
        break;
      case 'Necron':
        if (msg === `All this, for nothing...` && stateFloor.get() === 'F7') onBossEnd();
        break;
      case 'Wither King':
        // if (msg === `Incredible. You did what I couldn't do myself.`) onBossEnd();
        break;
    }
  });
  settings._dungeonHecatombAlertSound.listen(v => hecAlert.sound = v);
}
export function start() {

}
export function reset() {

}