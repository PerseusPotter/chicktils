import reg from '../../util/registerer';
import { rescale } from '../../util/math';
import { StateProp, StateVar } from '../../util/state';
import { getSbId } from '../../util/skyblock';
import settings from '../../settings';

const statePullingLb = new StateVar(false);
let totalTicks = 0;
statePullingLb.listen(() => totalTicks = 0);

const tickReg = reg('tick', () => {
  const p = Player.getPlayer();
  if (!p) return;
  const item = p.func_71011_bu();
  if (!item) return statePullingLb.set(false);
  const id = getSbId(item);
  statePullingLb.set(
    id === 'LAST_BREATH' ||
    id === 'STARRED_LAST_BREATH'
  );
}).setEnabled(settings._dungeonLBPullProgress);
const serverTickReg = reg('serverTick2', () => {
  totalTicks++;
  World.playSound('note.pling', settings.dungeonLBPullProgressVolume, Math.min(2, rescale(totalTicks, 0, 20, 0.5, 2)));
}).setEnabled(new StateProp(settings._dungeonLBPullProgress).and(statePullingLb));

export function init() { }
export function start() {
  statePullingLb.set(false);
  totalTicks = 0;

  tickReg.register();
  serverTickReg.register();
}
export function reset() {
  tickReg.unregister();
  serverTickReg.unregister();
}