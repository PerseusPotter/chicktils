import settings from '../../settings';
import data from '../../data';
import reg from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import createTextGui from '../../util/customtextgui';
import { StateVar } from '../../util/state';

const hasteTimer = createTextGui(() => data.dungeonSilverfishHasteTimerLoc, () => ['&l&66.9s']);

const stateEnableTimer = new StateVar(false);

function getHasteDuration() {
  const p = Player.getPlayer();
  if (!p) return 0;
  const haste = p.func_70660_b(PotionHaste);
  if (!haste || haste.func_76458_c() !== 2) return 0; // amplifier
  return haste.func_76459_b();
}

const PotionHaste = Java.type('net.minecraft.potion.Potion').field_76422_e;
const tickReg = reg('tick', () => {
  const duration = getHasteDuration();
  // hypixel updates every second, i.e. 280 but they also aren't known for their flawless servers
  if (duration === 0 || duration > 270) stateEnableTimer.set(false);
  else {
    stateEnableTimer.set(true);
    hasteTimer.setLine(`&l${colorForNumber(duration, 300)}${(duration / 20).toFixed(1)}s`);
  }
}).setEnabled(settings._dungeonSilverfishHasteTimer);
const renderOvReg = reg('renderOverlay', () => hasteTimer.render()).setEnabled(stateEnableTimer);

export function init() {
  settings._moveSilverfishHasteTimer.onAction(() => hasteTimer.edit());
}
export function start() {
  stateEnableTimer.set(false);

  tickReg.register();
  renderOvReg.register();
}
export function reset() {
  tickReg.unregister();
  renderOvReg.unregister();
}