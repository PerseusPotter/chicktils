import createAlert from '../util/alert';
import { drawBoxAtBlock, drawBoxAtBlockNotVisThruWalls } from '../util/draw';
import drawBeaconBeam from '../../BeaconBeam/index';
import settings from '../settings';
import { reg } from '../util/registerer';

const eggSpawnAlert = createAlert('Egg Spawned !');
const eggFoundAlert = createAlert('Egg Found !');
let eggs = [];
function reset() {
  eggs = [];
  eggCollectReg.unregister();
  eggStepReg.unregister();
  eggRenderReg.unregister();
  unloadReg.unregister();
}
// const unloadReg = reg('worldUnload', () => reset());
const unloadReg = reg('worldUnload', () => eggs = []);
function scanEgg() {
  const l = eggs.length;
  eggs = World.getAllEntities().filter(v => {
    if (v.getClassName() !== 'EntityArmorStand') return false;
    const nbt = v.entity.func_71124_b(4)?.func_77978_p();
    if (!nbt) return false;
    const id = nbt.func_74775_l('SkullOwner').func_74779_i('Id');
    return ['55ae5624-c86b-359f-be54-e0ec7c175403', '015adc61-0aba-3d4d-b3d1-ca47a68a154b', 'e67f7c89-3a19-3f30-ada2-43a3856e5028'].includes(id);
  });
  if (eggs.length > l) {
    eggSpawnAlert.hide();
    eggFoundAlert.show(settings.rabbitAlertTime);
  }
}
const eggSpawnReg = reg('chat', () => {
  unloadReg.register();
  eggStepReg.register();
  eggCollectReg.register();
  eggRenderReg.register();
  scanEgg();
  eggSpawnAlert.show(settings.rabbitAlertTime);
}).setCriteria('&r&d&lHOPPITY\'S HUNT ${*} &r&dhas appeared!&r');
const eggStepReg = reg('step', () => scanEgg()).setFps(5);
const eggCollectReg = reg('chat', () => {
  Client.scheduleTask(() => scanEgg());
}).setCriteria('§r§d§lHOPPITY\'S HUNT §r§dYou found a ${*} §r§dwithin the §r${*}§r§d!§r').unregister();
const eggRenderReg = reg('renderWorld', () => {
  const c = settings.rabbitBoxColor;
  const r = ((c >> 24) & 0xFF) / 256;
  const g = ((c >> 16) & 0xFF) / 256;
  const b = ((c >> 8) & 0xFF) / 256;
  const a = ((c >> 0) & 0xFF) / 256;
  eggs.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    if (settings.rabbitBoxEsp) drawBoxAtBlock(x - 0.25, y + 1.5, z - 0.25, r, g, b, 0.5, 0.5, a);
    else drawBoxAtBlockNotVisThruWalls(x - 0.25, y + 1.5, z - 0.25, r, g, b, 0.5, 0.5, a);
    drawBeaconBeam(x - 0.5, y + 2.5, z - 0.5, r, g, b, a, !settings.rabbitBoxEsp);
  });
});

export function init() { }
export function load() {
  eggSpawnReg.register();
}
export function unload() {
  eggSpawnReg.unregister();
  reset();
}