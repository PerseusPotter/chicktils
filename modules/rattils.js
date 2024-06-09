import createAlert from '../util/alert';
import { drawBoxAtBlock, drawBoxAtBlockNotVisThruWalls } from '../util/draw';
import settings from '../settings';
import { _clearTimeout, _setTimeout } from '../util/timers';
import { log } from '../util/log';
import reg from '../util/registerer';

const cheeseAlert = createAlert('Cheese !');
let cheese = [];
let players = {};
function reset() {
  cheese = [];
  Object.values(players).forEach(v => _clearTimeout(v));
  players = {};
  cheesePickReg.unregister();
  cheeseStepReg.unregister();
  cheeseRenderReg.unregister();
  unloadReg.unregister();
}
const unloadReg = reg('worldUnload', () => reset());
function scanCheese() {
  cheese = World.getAllEntities().filter(v => {
    if (v.getClassName() !== 'EntityItem') return false;
    /*
    {
      SkullOwner: {
        Id: "d91490fc-b575-3128-a4e3-0cc0f9f1d23c",
        Properties: {
          textures: [
            0: {
              Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMzE1MzlkYmNkMzZmODc3MjYzMmU1NzM5ZTJlNTE0ODRlZGYzNzNjNTU4ZDZmYjJjNmI2MWI3MmI3Y2FhIn19fQ"
            }
          ]
        }
      }
    }
    */
    const nbt = v.entity.func_92059_d().func_77978_p();
    if (!nbt) return false;
    const id = nbt.func_74775_l('SkullOwner').func_74779_i('Id');
    // const texture = nbt.func_74775_l('SkullOwner').func_74775_l('Properties').func_150295_c('textures', 10).func_150305_b(0).func_74779_i('Value');
    return id === 'd91490fc-b575-3128-a4e3-0cc0f9f1d23c'; // && texture === 'eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMzE1MzlkYmNkMzZmODc3MjYzMmU1NzM5ZTJlNTE0ODRlZGYzNzNjNTU4ZDZmYjJjNmI2MWI3MmI3Y2FhIn19fQ';
  });
}
const cheeseSpawnReg = reg('chat', () => {
  unloadReg.register();
  cheeseStepReg.register();
  cheesePickReg.register();
  cheeseRenderReg.register();
  scanCheese();
  cheeseAlert.show(settings.ratTilsAlertTime);
  if (settings.ratTilsMessage) ChatLib.command('pc [RatTils] ' + settings.ratTilsMessage);
}).setCriteria('CHEESE! You smell Cheese nearby!');
const cheeseStepReg = reg('step', () => scanCheese()).setFps(5);
const cheesePickReg = reg('chat', (name, t) => {
  Client.scheduleTask(() => scanCheese());
  ChatLib.command(`pc [RatTils] Buffed ${name}`);
  if (name in players) _clearTimeout(players[name]);
  players[name] = _setTimeout(() => log(`Rat Buff to ${name} has expired.`), t * 1000);
}).setCriteria('CHEESE! You buffed ${name} giving them +${*}✯ Magic Find for ${t} seconds!').unregister();
const cheeseRenderReg = reg('renderWorld', () => {
  const c = settings.ratTilsBoxColor;
  const r = ((c >> 24) & 0xFF) / 256;
  const g = ((c >> 16) & 0xFF) / 256;
  const b = ((c >> 8) & 0xFF) / 256;
  const a = ((c >> 0) & 0xFF) / 256;
  cheese.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    if (settings.ratTilsBoxEsp) drawBoxAtBlock(x - 0.25, y, z - 0.25, r, g, b, 0.5, 0.5, a);
    else drawBoxAtBlockNotVisThruWalls(x - 0.25, y, z - 0.25, r, g, b, 0.5, 0.5, a);
  });
});
const muteReg = reg('soundPlay', (pos, name, vol, pitch, category, evn) => vol === 1 && (Math.abs(pitch - 1.19047) < 0.0001) && cancel(evn)).setCriteria('mob.bat.idle').setEnabled(settings._ratTilsMuteSound);

export function init() {
  settings._ratTilsAlertSound.onAfterChange(v => cheeseAlert.sound = v);
}
export function load() {
  cheeseSpawnReg.register();
  muteReg.register();
}
export function unload() {
  cheeseSpawnReg.unregister();
  muteReg.unregister();
  reset();
}