import settings from '../../settings';
import { renderOutline } from '../../util/draw';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

let withers = [];

const stateBoxWithers = new StateProp(stateFloor).equalsmult('F7', 'M7').and(settings._dungeonBoxWither).and(stateIsInBoss);

const EntityWither = Java.type('net.minecraft.entity.boss.EntityWither');
const entSpawnReg = reg('spawnEntity', e => {
  if (e instanceof EntityWither) withers.push(new EntityLivingBase(e));
}, 'dungeon/boxwithers').setEnabled(stateBoxWithers);
const tickReg = reg('tick', () => withers = withers.filter(v => !v.isDead() && v.getName() === 'Wither' && v.getMaxHP() !== 300), 'dungeon/boxwithers').setEnabled(stateBoxWithers);
const renderWorldReg = reg('renderWorld', () => {
  withers.forEach(e => {
    const x = e.getRenderX();
    const y = e.getRenderY();
    const z = e.getRenderZ();
    renderOutline(x, y - 0.25, z, 1.5, 4, settings.dungeonBoxWitherColor, settings.dungeonBoxWitherEsp);
  });
}, 'dungeon/boxwithers').setEnabled(stateBoxWithers);

export function init() { }
export function start() {
  withers = [];

  entSpawnReg.register();
  tickReg.register();
  renderWorldReg.register();
}
export function reset() {
  entSpawnReg.unregister();
  tickReg.unregister();
  renderWorldReg.unregister();
}