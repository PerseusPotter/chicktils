import createAlert from '../util/alert';
import { renderWaypoints } from '../util/draw';
import settings from '../settings';
import { reg } from '../util/registerer';

const crystalAlert = createAlert('crystals respawned', 2);
let crystals = [];
function updateCrystals() {
  Client.scheduleTask(5, () => {
    const oldCount = crystals.length;
    crystals = World.getAllEntities().filter(v => v.getClassName() === 'EntityEnderCrystal').map(v => ({ x: v.getX(), y: v.getY(), z: v.getZ(), w: 2, h: 2 }));
    if (oldCount === crystals.length) return;
    crystalAlert.text = 'Crystal x' + crystals.length;
    crystalAlert.show(settings.crystalAlertTime);
  });
}
const destroyReg = reg('chat', () => updateCrystals()).setCriteria('${*}destroyed an Ender Crystal!');
const stepReg = reg('step', () => updateCrystals()).setFps(1);
const renderReg = reg('renderWorld', () => {
  const c = settings.crystalBoxColor;
  const r = ((c >> 24) & 0xFF) / 256;
  const g = ((c >> 16) & 0xFF) / 256;
  const b = ((c >> 8) & 0xFF) / 256;
  // const a = ((c >> 24) & 0xFF) / 256;
  renderWaypoints(crystals, r, g, b, settings.crystalBoxEsp, false);
});
function reset() {
  crystals = [];
  destroyReg.unregister();
  dragonDieReg.unregister();
  stepReg.unregister();
  renderReg.unregister();
}
const unloadReg = reg('worldUnload', () => reset());
const dragonDieReg = reg('chat', () => reset()).setCriteria('${*}DRAGON DOWN!');
function start() {
  destroyReg.register();
  dragonDieReg.register();
  stepReg.register();
  renderReg.register();
  updateCrystals();
}
const dragonSpawnReg = reg('chat', (_) => start()).setCriteria('${*}Dragon has spawned!');

export function init() {
  settings._crystalAlertSound.onAfterChange(v => crystalAlert.sound = v);
}
export function load() {
  unloadReg.register();
  dragonSpawnReg.register();
}
export function unload() {
  unloadReg.unregister();
  dragonSpawnReg.unregister();
  reset();
}