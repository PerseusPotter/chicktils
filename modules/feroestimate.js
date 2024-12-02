import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { binarySearch } from '../util/math';
import reg from '../util/registerer';
import { DelayTimer } from '../util/timers';

const hud = createTextGui(() => data.feroEstimateLoc, () => ['&c⫽420']);
const updateDelay = new DelayTimer(settings.feroEstimateUpdateDelay);
let guess = 0;
let bowHits = [];
let feroHits = [];
let shouldRender = false;

const soundReg = reg('soundPlay', (pos, name) => {
  // random.successful_hit -> fire.ignite -> mob.irongolem.throw -> mob.zombie.woodbreak
  if (name === 'random.successful_hit') bowHits.push(Date.now());
  else if (name === 'mob.zombie.woodbreak') feroHits.push(Date.now());
});
const renderOvReg = reg('renderOverlay', () => {
  if (updateDelay.shouldTick()) {
    const d = Date.now();
    const feroOffset = guess * 1000 / 3;
    bowHits = bowHits.slice(binarySearch(bowHits, d - settings.feroEsimateMaxAge - feroOffset) + 1);
    feroHits = feroHits.slice(binarySearch(feroHits, d - settings.feroEsimateMaxAge) + 1);

    const bowHitCount = binarySearch(bowHits, d - feroOffset);
    const est = bowHitCount === 0 ? 0 : feroHits.length / bowHitCount;
    guess = settings.feroEstimateSmoothingFactor * est + (1 - settings.feroEstimateSmoothingFactor) * guess;

    const roundedFero = ~~(guess * 100);
    hud.setLine('&c⫽' + roundedFero);
    shouldRender = roundedFero > 0;
  }

  if (shouldRender) hud.render();
});

export function init() {
  settings._moveFeroEstimate.onAction(() => hud.edit());
  settings._feroEstimateUpdateDelay.listen(v => updateDelay.delay = v);
}
export function load() {
  guess = 0;
  bowHits = [];
  feroHits = [];

  soundReg.register();
  renderOvReg.register();
}
export function unload() {
  soundReg.unregister();
  renderOvReg.unregister();
}