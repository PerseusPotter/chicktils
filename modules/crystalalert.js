import createAlert from '../util/alert';
import { renderWaypoint } from '../util/draw';
import settings from '../settings';
import reg from '../util/registerer';

const crystalAlert = createAlert('crystals respawned', 2);
let crystals = [];
const EntityEnderCrystal = Java.type('net.minecraft.entity.item.EntityEnderCrystal');
function updateCrystals() {
  Client.scheduleTask(5, () => {
    const oldCount = crystals.length;
    crystals = World.getAllEntitiesOfType(EntityEnderCrystal).map(v => ({ x: v.getX(), y: v.getY(), z: v.getZ() }));
    if (oldCount === crystals.length) return;
    crystalAlert.text = 'Crystal x' + crystals.length;
    crystalAlert.show(settings.crystalAlertTime);
  });
}
const destroyReg = reg('chat', () => updateCrystals()).setCriteria('${*}destroyed an Ender Crystal!');
const stepReg = reg('step', () => updateCrystals()).setFps(1);
const renderReg = reg('renderWorld', () => {
  crystals.forEach(v => renderWaypoint(v.x, v.y, v.z, 2, 2, settings.crystalBoxColor, settings.crystalBoxEsp, false));
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
  unloadReg.register();
  updateCrystals();
}
const dragonSpawnReg = reg('chat', (_) => start()).setCriteria('${*}Dragon has spawned!');

export function init() {
  settings._crystalAlertSound.listen(v => crystalAlert.sound = v);
}
export function load() {
  dragonSpawnReg.register();
}
export function unload() {
  unloadReg.unregister();
  dragonSpawnReg.unregister();
  reset();
}