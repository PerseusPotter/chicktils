import settings from '../settings';
import { getBlockPos } from '../util/mc';
import reg from '../util/registerer';
import { registerListenIsland, stateIsland } from '../util/skyblock';
import { AtomicStateVar, StateProp } from '../util/state';

/** @typedef {'Normal' | 'Hide' | 'Remove'} Action */
/** @typedef {{
  player(id: number, x: number, y: number, z: number, packet: import('../../@types/External').JavaClass<'net.minecraft.network.play.server.S0CPacketSpawnPlayer'>): Action;
  object(type: number, id: number, x: number, y: number, z: number, packet: import('../../@types/External').JavaClass<'net.minecraft.network.play.server.S0EPacketSpawnObject'>): Action;
  mob(type: number, id: number, x: number, y: number, z: number, packet: import('../../@types/External').JavaClass<'net.minecraft.network.play.server.S0FPacketSpawnMob'>): Action;
  painting(id: number, x: number, y: number, z: number, facing: import('../../@types/External').JavaClass<'net.minecraft.util.EnumFacing'>, title: string, packet: import('../../@types/External').JavaClass<'net.minecraft.network.play.server.S10PacketSpawnPainting'>): Action;
}} Handler */

/** @type {AtomicStateVar<Handler?>} */
const stateHandler = new AtomicStateVar(null);
const stateHub = new StateProp(stateIsland).equals('Hub').and(settings._entityReducerHub);
const stateDHub = new StateProp(stateIsland).equals('Dungeon Hub').and(settings._entityReducerDHub);
const stateMines = new StateProp(stateIsland).equals('Dwarven Mines').and(settings._entityReducerMines);
const stateEnabled = new StateProp(stateHandler).and(new StateProp(stateHub).or(stateDHub).or(stateMines));

const spawnPlayerReg = reg('packetReceived', (pack, evn) => {
  const handler = stateHandler.get()?.player;
  if (!handler) return;
  const id = pack.func_148943_d();
  const x = pack.func_148942_f();
  const y = pack.func_148949_g();
  const z = pack.func_148946_h();
  const action = handler(id, x, y, z, pack);
  takeAction(action, id, evn);
}).setFilteredClass(net.minecraft.network.play.server.S0CPacketSpawnPlayer).setEnabled(stateEnabled);
const spawnObjectReg = reg('packetReceived', (pack, evn) => {
  const handler = stateHandler.get()?.object;
  if (!handler) return;
  const type = pack.func_148993_l();
  const id = pack.func_149001_c();
  const x = pack.func_148997_d();
  const y = pack.func_148998_e();
  const z = pack.func_148994_f();
  const action = handler(type, id, x, y, z, pack);
  takeAction(action, id, evn);
}).setFilteredClass(net.minecraft.network.play.server.S0EPacketSpawnObject).setEnabled(stateEnabled);
const spawnMobReg = reg('packetReceived', (pack, evn) => {
  const handler = stateHandler.get()?.mob;
  if (!handler) return;
  const type = pack.func_149025_e();
  const id = pack.func_149024_d();
  const x = pack.func_149023_f();
  const y = pack.func_149034_g();
  const z = pack.func_149029_h();
  const action = handler(type, id, x, y, z, pack);
  takeAction(action, id, evn);
}).setFilteredClass(net.minecraft.network.play.server.S0FPacketSpawnMob).setEnabled(stateEnabled);
const spawnPaintingReg = reg('packetReceived', (pack, evn) => {
  const handler = stateHandler.get()?.painting;
  if (!handler) return;
  const id = pack.func_148965_c();
  const bp = pack.func_179837_b();
  const pos = getBlockPos(bp);
  const facing = pack.func_179836_c();
  const title = pack.func_148961_h();
  const action = handler(id, pos.x, pos.y, pos.z, facing, title, pack);
  takeAction(action, id, evn);
}).setFilteredClass(net.minecraft.network.play.server.S10PacketSpawnPainting).setEnabled(stateEnabled);

const hiddenEntities = new (Java.type('java.util.WeakHashMap'))();
const renderReg = reg('renderEntity', (e, _, __, evn) => {
  if (hiddenEntities.containsKey(e.entity)) cancel(evn);
}).setEnabled(stateEnabled);

/**
 * @param {Action} action
 * @param {number} id
 * @param {import('../../@types/IRegister').CancellableCTEvent} evn
 */
function takeAction(action, id, evn) {
  if (action === 'Remove') cancel(evn);
  else if (action === 'Hide') Client.scheduleTask(2, () => hiddenEntities.put(World.getWorld().func_73045_a(id), 0));
}

/** @type {Record<import('../util/state').ExtractStateVar<typeof stateIsland>, Handler>} */
const handlers = {
  'Hub': {
    object(type, id, x, y, z, packet) {
      switch (type) {
        case 71: {
          if (settings.entityReducerHubMap !== 'Normal' && z === -3070) return settings.entityReducerHubMap;
          if (settings.entityReducerHubMarco !== 'Normal' && -414 <= x && x <= -66 && (y === 2320 || y === 2304) && -638 <= z && z <= -290) return settings.entityReducerHubMarco;
          break;
        }
        case 78: {
          if (settings.entityReducerHubCityProject !== 'Normal' && 104 <= id && id <= 186) return settings.entityReducerHubCityProject;
          if (settings.entityReducerHubTopAuctions !== 'Normal') {
            if (z === -2608 || z === -3184) return settings.entityReducerHubTopAuctions;
            if (x === -848 || x === -784 || x === -624) return settings.entityReducerHubTopAuctions;
          }
          if (settings.entityReducerHubHex !== 'Normal' && 273 <= id && id <= 322) return settings.entityReducerHubCityProject;
          if (settings.entityReducerHubDHub !== 'Normal') {
            if (268 <= id && id <= 272) return settings.entityReducerHubDHub;
            if (450 <= id && id <= 475) return settings.entityReducerHubDHub;
          }
          if (settings.entityReducerHubJax !== 'Normal' && 482 <= id && id <= 492) return settings.entityReducerHubJax;
          if (settings.entityReducerHubKatHouse !== 'Normal' && 1071 <= x && x <= 1224 && 2437 <= y && y <= 2464 && -2960 <= z && z <= -2800) return settings.entityReducerHubKatHouse;
          if (settings.entityReducerHubTaylor !== 'Normal' && 231 <= id && id <= 237) return settings.entityReducerHubTaylor;
          if (settings.entityReducerHubCarpenter !== 'Normal') {
            if (320 <= x && x <= 896 && 1920 <= y && y <= 2080 && -224 <= z && z <= 288) return settings.entityReducerHubCarpenter;
            if (416 <= x && x <= 512 && 2240 <= y && y <= 2336 && -480 <= z && z <= -416) return settings.entityReducerHubCarpenter;
          }
          if (settings.entityReducerHubRabbit !== 'Normal') {
            if (x === 272 && z === 624) return settings.entityReducerHubRabbit;
            if (x === 496 && z === 432) return settings.entityReducerHubRabbit;
            if (x === 592 && z === 560) return settings.entityReducerHubRabbit;
            if (x === 592 && z === 784) return settings.entityReducerHubRabbit;
            if (x === 464 && z === 752) return settings.entityReducerHubRabbit;
            if (x === 304 && z === 752) return settings.entityReducerHubRabbit;
          }
          break;
        }
      }
      return 'Normal';
    },
    painting(id, x, y, z, facing, title, packet) {
      if (settings.entityReducerHubVincent !== 'Normal' && x > 95 && z < -95) return settings.entityReducerHubVincent;
    }
  },
  'Dungeon Hub': {
    object(type, id, x, y, z, packet) {
      switch (type) {
        case 78: {
          if (settings.entityReducerDHubRace !== 'Normal' && -736 <= x && x <= -448 && 2720 <= y && y <= 2944 && -800 <= z && z <= -448) return settings.entityReducerDHubRace;
          break;
        }
      }
      return 'Normal';
    }
  },
  'Dwarven Mines': {
    object(type, id, x, y, z, packet) {
      switch (type) {
        case 78: {
          // starts at 10, but can't open off of the armor stand name tag so
          if (settings.entityReducerMinesFossil !== 'Normal' && 10 < id && id <= 109) return settings.entityReducerMinesFossil;
          break;
        }
      }
      return 'Normal';
    }
  }
};
stateIsland.listen(v => settings.enableentityreducer && stateHandler.set(handlers[v]));

export function init() {
  registerListenIsland(settings._enableentityreducer);
  stateHandler.set(handlers[stateIsland.get()]);
}
export function load() {
  spawnPlayerReg.register();
  spawnObjectReg.register();
  spawnMobReg.register();
  spawnPaintingReg.register();
  renderReg.register();
}
export function unload() {
  stateHandler.set(null);

  spawnPlayerReg.unregister();
  spawnObjectReg.unregister();
  spawnMobReg.unregister();
  spawnPaintingReg.unregister();
  renderReg.unregister();
}