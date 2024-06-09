import settings from '../../settings';
import reg from '../../util/registerer';
import { execCmd } from '../../util/format';
import { StateProp } from '../../util/state';
import { DelayTimer } from '../../util/timers';
import { countItems, getSbId } from '../../util/skyblock';

const pearlRefillDelay = new DelayTimer(2_000);

const tickReg = reg('tick', () => {
  const c = countItems('ENDER_PEARL');
  if (
    c < settings.dungeonAutoRefillPearlsThreshold &&
    c < settings.dungeonAutoRefillPearlsAmount &&
    pearlRefillDelay.shouldTick()
  ) Client.scheduleTask(6, () => {
    const inv = Player.getInventory();
    if (!inv) return;
    if (getSbId(inv.getStackInSlot(0)) === 'HAUNT_ABILITY') return;
    const c = countItems('ENDER_PEARL');
    if (c >= settings.dungeonAutoRefillPearlsThreshold || c >= settings.dungeonAutoRefillPearlsAmount) return;
    if (settings.dungeonAutoRefillPearlsGhostPickFix) {
      let pickCount = 0;
      if (inv.getItems().some(v => {
        if (!v) return;
        if (v.getRegistryName().endsWith('_pickaxe')) pickCount++;
        return pickCount === 2;
      })) return;
    }
    execCmd('gfs ENDER_PEARL ' + (settings.dungeonAutoRefillPearlsAmount - c));
  });
}).setEnabled(new StateProp(settings._dungeonAutoRefillPearlsThreshold).notequals(0).and(settings._dungeonAutoRefillPearls));

export function init() { }
export function start() {
  if (settings.dungeonAutoRefillPearls) {
    const c = settings.dungeonAutoRefillPearlsAmount - countItems('ENDER_PEARL');
    if (c > 0) execCmd('gfs ENDER_PEARL ' + c);
  }

  tickReg.register();
}
export function reset() {
  tickReg.unregister();
}