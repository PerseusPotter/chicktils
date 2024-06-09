import settings from '../../settings';
import createAlert from '../../util/alert';
import { listenBossMessages } from '../dungeon.js';

const hecAlert = createAlert('Hecatomb');

function onBossEnd() {
  if (!settings.dungeonHecatombAlert) return;
  /**
   * @type {{getName(): string}[]}
   */
  const lines = Scoreboard.getLines(false);
  let score = lines[6].getName();
  if (!score) return;
  score = score.removeFormatting().match(/\((\d+)\)/);
  if (!score) return;
  score = +(score[1]);
  if (score < 270) return;
  hecAlert.show(settings.dungeonHecatombAlertTime);
}

export function init() {
  listenBossMessages((name, msg) => {
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
        if (msg === `All this, for nothing...`) onBossEnd();
        break;
      case 'Wither King':
        // if (msg === `Incredible. You did what I couldn't do myself.`) onBossEnd();
        break;
    }
  });
  settings._dungeonHecatombAlertSound.onAfterChange(v => hecAlert.sound = v);
}
export function start() {

}
export function reset() {

}