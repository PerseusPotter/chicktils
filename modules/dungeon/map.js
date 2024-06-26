import settings from '../../settings';
import data from '../../data';
import createGui from '../../util/customgui';
import reg from '../../util/registerer';
import { logDebug } from '../../util/log';
import { StateProp } from '../../util/state';
import { registerTrackPlayers, roundRoomCoords, stateIsInBoss } from '../dungeon.js';
import { run } from '../../util/threading';

let map;
let mapId;
const mapDisplay = createGui(() => data.dungeonMapLoc, renderMap, renderMapEdit);
let lastRoom = '';

const stateMap = new StateProp(settings._dungeonMap).and(new StateProp(settings._dungeonMapHideBoss).not().or(new StateProp(stateIsInBoss).not()));

/**
 * @this typeof mapDisplay
 */
function renderMap() {
  if (!map) return;
  // copy map to screen

  if (settings.dungeonMapRenderHead) renderHeads.call(this);

  const isHoldingLeap = false;
  if (settings.dungeonMapRenderName === 'Always' || (settings.dungeonMapRenderName === 'Holding Leap' && isHoldingLeap)) renderPlayerText.call(this, 'name');
  else if (settings.dungeonMapRenderClass === 'Always' || (settings.dungeonMapRenderClass === 'Holding Leap' && isHoldingLeap)) renderPlayerText.call(this, 'class');
}
/**
 * @this typeof mapDisplay
 */
function renderHeads() {

}
/**
 * @this typeof mapDisplay
 */
function renderPlayerText(type) {
  // draw text with shadow
}
/**
 * @this typeof mapDisplay
 */
function renderMapEdit() {

}

const tickReg = reg('tick', () => {
  run(() => {
    map = null;
    const mapI = Player.getInventory()?.getStackInSlot(8);
    if (mapI && mapI.getRegistryName() === 'minecraft:filled_map') {
      map = mapI.item.func_77873_a(mapI.itemStack, World.getWorld());
      if (map && !mapId) mapId = mapI.getMetadata();
    } else if (mapId) map = World.getWorld().func_72943_a(Java.type('net.minecraft.world.storage.MapData').class, 'map_' + mapId);

    const x = roundRoomCoords(Player.getX());
    const z = roundRoomCoords(Player.getZ());
    const k = x + ',' + z;
    if (k === lastRoom) return;
    // TODO: update doors
    // TODO: check if room coords are in same room based on map doors
    lastRoom = k;
  });
}, 'dungeon/map').setEnabled(stateMap);
const renderWorldReg = reg('renderWorld', () => { }, 'dungeon/map').setEnabled(stateMap.and(settings._dungeonMapBoxDoors));
const renderOverlayReg = reg('renderOverlay', () => mapDisplay.render(), 'dungeon/map').setEnabled(stateMap);
const mapPacketReg = reg('packetReceived', p => {
  if (map && !mapId) mapId = p.func_149188_c();
}, 'dungeon/map').setFilteredClass(Java.type('net.minecraft.network.play.server.S34PacketMaps')).setEnabled(stateMap);
register('command', () => {
  const obj = {};
  if (map) map.field_76203_h.forEach((k, v) => obj[k] = `${v.func_176110_a()}, ${v.func_176112_b()}, ${v.func_176113_c()}, ${v.func_176111_d()}`);
  logDebug({
    id: mapId,
    data: Array.from(map?.field_76198_e),
    dec: obj
  });
}).setName('csmdump');

export function init() {
  registerTrackPlayers(stateMap);
  settings._moveDungeonMap.onAction(() => mapDisplay.edit());
}
export function start() {
  map = null;
  mapId = null;
  lastRoom = '';

  tickReg.register();
  renderWorldReg.register();
  renderOverlayReg.register();
  mapPacketReg.register();
}
export function reset() {
  tickReg.unregister();
  renderWorldReg.unregister();
  renderOverlayReg.unregister();
  mapPacketReg.unregister();
}