import createAlert from '../util/alert';
import { Gradient, renderWaypoint } from '../util/draw';
import settings from '../settings';
import reg, { customRegs } from '../util/registerer';
import { getBlockId } from '../util/mc';
import { unrun } from '../util/threading';

const chests = new Map();
const recent = new Set();
const chestAlert = createAlert('chest');

const PlayerInteractAction = Java.type('com.chattriggers.ctjs.minecraft.listeners.ClientListener').PlayerInteractAction;
const rcReg = reg('playerInteract', (action, pos) => {
  if (!action.equals(PlayerInteractAction.RIGHT_CLICK_BLOCK)) return;
  const id = `${pos.x},${pos.y},${pos.z}`;
  if (chests.delete(id)) recent.add(id);
});
const blockReg = reg('blockChange', (pos, bs) => {
  if (getBlockId(bs.func_177230_c()) !== 54) return;
  const id = `${pos.x},${pos.y},${pos.z}`;
  if (recent.has(id)) return;
  if (chests.has(id)) return;
  unrun(() => {
    if (
      (Player.getX() - pos.x) ** 2 +
      (Player.getY() - pos.y) ** 2 +
      (Player.getZ() - pos.z) ** 2
      > settings.powderScanRange ** 2
    ) return;
    chests.set(id, { x: pos.x, y: pos.y, z: pos.z, t: customRegs.serverTick2.tick });
    chestAlert.text = 'Chest x' + chests.size;
    chestAlert.show(settings.powderAlertTime);
  });
});
const MAX_CHEST_LIFE = 20 * 60;
const chestGradient = new Gradient(settings._powderBoxColor, settings._powderBoxColor2);
const renderReg = reg('renderWorld', () => {
  const t = customRegs.serverTick2.tick;
  Array.from(chests.entries()).forEach(([k, v]) => {
    const dt = t - v.t;
    renderWaypoint(
      v.x, v.y, v.z, 1, 1,
      chestGradient.get(dt / MAX_CHEST_LIFE),
      settings.powderBoxEsp, false
    );
    if (dt > MAX_CHEST_LIFE) chests.delete(k);
  });
});

function reset() {
  chests.clear();
  recent.clear();

  rcReg.unregister();
  blockReg.unregister();
  renderReg.unregister();
  unloadReg.unregister();
  chatReg.unregister();
}
const unloadReg = reg('worldUnload', () => reset());
const startReg = reg('chat', () => {
  rcReg.register();
  blockReg.register();
  renderReg.register();
  unloadReg.register();
  chatReg.register();
}).setCriteria('&r&aYou uncovered a treasure chest!&r');

let doBlock = false;
const chatReg = reg('chat', evn => {
  const str = evn.str;
  if (str === '&r&e&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r') {
    cancel(evn);
    doBlock = false;
    return;
  }
  if (str === '&r  &r&6&lCHEST LOCKPICKED &r') doBlock = true;
  if (doBlock && !(settings.powderShowPowder && str.startsWith('&r    &r&dGemstone Powder'))) cancel(evn);
}).setEnabled(settings._powderBlockRewards);

export function init() {
  settings._powderAlertSound.listen(v => chestAlert.sound = v);
}
export function load() {
  startReg.register();
}
export function unload() {
  startReg.unregister();
  reset();
}