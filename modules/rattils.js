import createAlert from '../util/alert';
import { renderOutline } from '../util/draw';
import settings from '../settings';
import { _clearTimeout, _setTimeout } from '../util/timers';
import { log } from '../util/log';
import reg from '../util/registerer';
import { run } from '../util/threading';
import { getPlayerName } from '../util/format';

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
const EntityItem = Java.type('net.minecraft.entity.item.EntityItem');
function scanCheese() {
  run(() => {
    try {
      cheese = World.getAllEntitiesOfType(EntityItem).filter(v => {
        const nbt = v.entity.func_92059_d().func_77978_p();
        if (!nbt) return false;
        const id = nbt.func_74775_l('SkullOwner').func_74779_i('Id');
        return id === '9675d9a3-d888-3c30-93b1-8cac5b9be1f4';
      });
    } catch (_) { }
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
}).setCriteria('&r&e&lCHEESE! &r&7You smell Cheese nearby!&r');
const cheeseStepReg = reg('step', () => scanCheese()).setFps(1);
const cheesePickReg = reg('chat', (name, t) => {
  name = getPlayerName(name);
  Client.scheduleTask(() => scanCheese());
  ChatLib.command(`pc [RatTils] Buffed ${name}`);
  if (name in players) _clearTimeout(players[name]);
  players[name] = _setTimeout(() => log(`Rat Buff to ${name} has expired.`), t * 1000);
}).setCriteria('&r&e&lCHEESE!&r&7 You buffed ${name} giving them &r&b+${*}✯ Magic Find&r&7 for &r&a${t}&r&7 seconds&r&7!&r');
const cheeseRenderReg = reg('renderWorld', () => {
  cheese.forEach(v => {
    const x = v.getRenderX();
    const y = v.getRenderY();
    const z = v.getRenderZ();
    renderOutline(x, y, z, 0.5, 0.5, settings.ratTilsBoxColor, settings.ratTilsBoxEsp);
  });
});
const muteReg = reg('soundPlay', (pos, name, vol, pitch, category, evn) => vol === 1 && (Math.abs(pitch - 1.19047) < 0.0001) && cancel(evn)).setCriteria('mob.bat.idle').setEnabled(settings._ratTilsMuteSound);

export function init() {
  settings._ratTilsAlertSound.listen(v => cheeseAlert.sound = v);
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