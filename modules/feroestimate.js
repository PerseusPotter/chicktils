import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { dist } from '../util/math';
import reg, { customRegs } from '../util/registerer';
import { DelayTimer } from '../util/timers';

const hud = createTextGui(() => data.feroEstimateLoc, () => ['&c⫽420']);
const updateDelay = new DelayTimer(settings.feroEstimateUpdateDelay);
let bowHits = [];
let feroHits = [];
let shouldRender = false;

const calcFero = (function() {
  let fHits = [];
  const K = 9;
  const R = 6;
  const feroOffset = c => Math.min(1, c) * K + Math.max(0, c - 1) * R;

  class FeroHit {
    time = 0;
    constructor(t) {
      this.time = t;
    }
    numHits = 0;
    matches(t) {
      return this.numHits < 5 && dist(this.time + feroOffset(this.numHits + 1), t) <= 1;
    }
  }

  return function(hits, feroHits, time) {
    hits.forEach(v => fHits.push(new FeroHit(v)));
    let missed = 0;
    feroHits.forEach(v => {
      let minH;
      let minC = Number.POSITIVE_INFINITY;
      let i = 0;
      while (i < fHits.length && v > fHits[i].time) {
        if (fHits[i].numHits < minC && fHits[i].matches(v)) {
          minH = fHits[i];
          minC = minH.numHits;
        }
        i++;
      }
      if (minH) minH.numHits++;
      else missed++;
    });
    const i = fHits.findIndex(v => v.time > time - K * 6);
    fHits = i < 0 ? [] : fHits.slice(i);
    return fHits.reduce((a, v) => a + v.numHits, 0) / fHits.length || 0;
  };
}());
function getTickCount() {
  return customRegs.serverTick2.tick;
}

const soundReg = reg('soundPlay', (pos, name) => {
  // random.successful_hit -> fire.ignite -> mob.irongolem.throw -> mob.zombie.woodbreak
  if (name === 'random.successful_hit') bowHits.push(getTickCount());
  else if (name === 'mob.irongolem.throw') feroHits.push(getTickCount());
});

const renderOvReg = reg('renderOverlay', () => {
  if (updateDelay.shouldTick()) {
    const f = Math.round(calcFero(bowHits, feroHits, getTickCount()) * 100);
    hud.setLine('&c⫽' + f);
    bowHits = [];
    feroHits = [];
    shouldRender = f > 0;
  }

  if (shouldRender) hud.render();
});

export function init() {
  settings._moveFeroEstimate.onAction(v => hud.edit(v));
  settings._feroEstimateUpdateDelay.listen(v => updateDelay.delay = v);
}
export function load() {
  bowHits = [];
  feroHits = [];

  soundReg.register();
  renderOvReg.register();
}
export function unload() {
  soundReg.unregister();
  renderOvReg.unregister();
}