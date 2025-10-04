import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { colorForNumber, commaNumber } from '../util/format';
import { setAccessible } from '../util/polyfill';
import reg from '../util/registerer';
import { StateProp, StateVar } from '../util/state';

const listenersF = setAccessible(Java.type('net.minecraftforge.fml.common.eventhandler.EventBus').class.getDeclaredField('listeners'));
let NEUEventListener = null;
listenersF.get(Java.type('net.minecraftforge.common.MinecraftForge').EVENT_BUS).forEach(v => {
  if (v.getClass().getName() === 'io.github.moulberry.notenoughupdates.listener.NEUEventListener') NEUEventListener = v;
});
const toPreloadF = NEUEventListener && setAccessible(NEUEventListener.getClass().getDeclaredField('toPreload'));
const preloadedItemsF = NEUEventListener && setAccessible(NEUEventListener.getClass().getDeclaredField('preloadedItems'));

const stateRemaining = new StateVar(-1);
let maxRemaining = 0;

const display = createTextGui(() => data.neuItemPreloadDisplay, () => ['&e42/69']);

const tickReg = reg('tick', () => {
  if (!preloadedItemsF.get(NEUEventListener)) return;
  const remaining = toPreloadF.get(NEUEventListener).length;
  maxRemaining = Math.max(maxRemaining, remaining);
  stateRemaining.set(remaining);
}).setEnabled(new StateProp(stateRemaining).notequals(0).and(NEUEventListener));
const renderReg = reg('renderOverlay', () => {
  display.setLine(`${colorForNumber(stateRemaining.get(), maxRemaining)}${commaNumber(stateRemaining.get())}/${commaNumber(maxRemaining)}`);
  display.render();
}).setEnabled(new StateProp(stateRemaining).customUnary(v => v > 0).and(NEUEventListener));

export function init() {
  settings._moveNeuItemPreloadProgress.onAction(v => display.edit(v));
}
export function load() {
  tickReg.register();
  renderReg.register();
}
export function unload() {
  tickReg.unregister();
  renderReg.unregister();
}