import data from '../data';
import settings from '../settings';
import createAlert from '../util/alert';
import createTextGui from '../util/customtextgui';
import { colorForNumber } from '../util/format';
import { log } from '../util/log';
import reg from '../util/registerer';

const primalTimer = createTextGui(() => data.greatSpookPrimalTimerLoc, () => ['&5Primal Fear in: &a69s']);
const primalAlert = createAlert('&5&lPrimal Fear Ready!', 2, settings.greatSpookPrimalAlertSound);

let lastPrimalTime = 0;
let lastPrimalAlertTime = 0;
const renderReg = reg('renderOverlay', () => {
  const t = Date.now() / 1000;
  const tts = Math.max(0, settings.greatSpookPrimalCd - t + lastPrimalTime);
  if (tts === 0) {
    primalTimer.setLine('&5Primal Fear in: &aREADY!');
    if (lastPrimalTime !== lastPrimalAlertTime) {
      lastPrimalAlertTime = lastPrimalTime;
      if (settings.greatSpookPrimalAlert) primalAlert.show(settings.greatSpookPrimalAlertTime);
    }
    if (settings.greatSpookPrimalTimerHideReady) return;
  } else primalTimer.setLine(`&5Primal Fear in: ${colorForNumber(tts, settings.greatSpookPrimalCd)}${tts.toFixed(1)}s`);
  if (settings.greatSpookPrimalTimer) primalTimer.render();
});
const primalSpawnReg = reg('chat', () => {
  const t = Date.now() / 1000;
  if (lastPrimalTime) log((t - lastPrimalTime).toFixed(1) + 's since last Primal Fear');
  lastPrimalTime = t;
}).setCriteria('&r&5&lFEAR. &r&eA &r&dPrimal Fear &r&ehas been summoned!&r');

export function init() {
  settings._moveGreatSpookPrimalTimer.onAction(v => primalTimer.edit(v));
  settings._greatSpookPrimalAlertSound.listen(v => primalAlert.sound = v);
}
export function load() {
  renderReg.register();
  primalSpawnReg.register();
}
export function unload() {
  renderReg.unregister();
  primalSpawnReg.unregister();
}