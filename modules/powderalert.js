import createAlert from '../util/alert';
import { renderWaypoint } from '../util/draw';
import settings from '../settings';
import reg from '../util/registerer';

let chests = [];
const recent = [];
const chestAlert = createAlert('chest');
const PlayerInteractAction = Java.type('com.chattriggers.ctjs.minecraft.listeners.ClientListener').PlayerInteractAction;
const rcReg = reg('playerInteract', (action, pos) => {
  if (!action.equals(PlayerInteractAction.RIGHT_CLICK_BLOCK)) return;
  let i = chests.findIndex(v => v.x === pos.x && v.y === pos.y && v.z === pos.z);
  if (i >= 0) {
    const removed = chests.splice(i, 1);
    recent.push(removed[0]);
    if (recent.length > 3) recent.shift();
  }
});
function reset() {
  chests = [];
  rcReg.unregister();
  renderReg.unregister();
  unloadReg.unregister();
  chatReg.unregister();
}
const unloadReg = reg('worldUnload', () => reset());
const startReg = reg('chat', () => {
  renderReg.register();
  rcReg.register();
  chatReg.register();
  unloadReg.register();
  Client.scheduleTask(5, () => {
    chests = World.getAllTileEntities()
      .filter(v =>
        v.getBlockType().getRegistryName() === 'minecraft:chest' &&
        Math.hypot(
          Player.getX() - v.getX(),
          Player.getY() - v.getY(),
          Player.getZ() - v.getZ()
        ) < settings.powderScanRange &&
        !recent.some(r => r.x === v.getX() && r.y === v.getY() && r.z === v.getZ())
      ).map(v => ({ x: v.getX(), y: v.getY(), z: v.getZ() }));

    chestAlert.text = 'Chest x' + chests.length;
    chestAlert.show(settings.powderAlertTime);
  });
}).setCriteria('&r&aYou uncovered a treasure chest!&r');

const renderReg = reg('renderWorld', () => {
  chests.forEach(v => renderWaypoint(v.x, v.y, v.z, 1, 1, settings.powderBoxColor, settings.powderBoxEsp, false));
});

let doBlock = false;
const chatReg = reg('chat', evn => {
  const str = evn.str;
  if (str === '&r&e&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r') {
    cancel(evn);
    doBlock = false;
    return;
  }
  if (str === '&r  &r&6&lCHEST LOCKPICKED &r') doBlock = true;
  if (doBlock) cancel(evn);
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