import createAlert from '../util/alert';
import { renderWaypoints } from '../util/draw';
import settings from '../settings';
import { reg } from '../util/registerer';

let chests = [];
const chestAlert = createAlert('chest');
const rcReg = reg('playerInteract', (action, pos) => {
  if (action.toString() !== 'RIGHT_CLICK_BLOCK') return;
  let i = chests.findIndex(v => v.x === pos.x && v.y === pos.y && v.z === pos.z);
  if (i >= 0) chests.splice(i, 1);
});
function reset() {
  chests = [];
  rcReg.unregister();
  renderReg.unregister();
  unloadReg.unregister();
}
const unloadReg = reg('worldUnload', () => reset());
const startReg = reg('chat', () => {
  renderReg.register();
  rcReg.register();
  unloadReg.register();
  Client.scheduleTask(5, () => {
    chests = World.getAllTileEntities().filter(v => v.getBlockType().getRegistryName() === 'minecraft:chest' && Math.hypot(Player.getX() - v.getX(), Player.getY() - v.getY(), Player.getZ() - v.getZ()) < settings.powderScanRange).map(v => ({ x: v.getX(), y: v.getY(), z: v.getZ(), w: 1, h: 1 }));

    chestAlert.text = 'Chest x' + chests.length;
    chestAlert.show(settings.powderAlertTime);
  });
}).setCriteria('&r&aYou uncovered a treasure chest!&r');

const renderReg = reg('renderWorld', () => {
  const c = settings.powderBoxColor;
  const r = ((c >> 24) & 0xFF) / 256;
  const g = ((c >> 16) & 0xFF) / 256;
  const b = ((c >> 8) & 0xFF) / 256;
  // const a = ((c >> 0) & 0xFF) / 256;
  renderWaypoints(chests, r, g, b, settings.powderBoxEsp, false);
});

export function init() {
  settings._powderAlertSound.onAfterChange(v => chestAlert.sound = v);
}
export function load() {
  startReg.register();
}
export function unload() {
  startReg.unregister();
  reset();
}