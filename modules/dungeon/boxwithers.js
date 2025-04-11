import { renderBoxOutline } from '../../../Apelles/index';
import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateFloor, stateIsInBoss } from '../dungeon.js';

let withers = [];

const stateBoxWithers = new StateProp(stateFloor).equalsmult('F7', 'M7').and(settings._dungeonBoxWither).and(stateIsInBoss);

const EntityWither = Java.type('net.minecraft.entity.boss.EntityWither');
const entSpawnReg = reg('spawnEntity', e => {
  if (e instanceof EntityWither) withers.push(new EntityLivingBase(e));
}).setEnabled(stateBoxWithers);
const tickReg = reg('tick', () => withers = withers.filter(v => !v.isDead() && v.getName() === 'Wither')).setEnabled(stateBoxWithers);
const renderWorldReg = reg('renderWorld', () => {
  withers.forEach(e => {
    if (e.getMaxHP() === 300) return;
    const x = e.getRenderX();
    const y = e.getRenderY();
    const z = e.getRenderZ();
    renderBoxOutline(settings.dungeonBoxWitherColor, x, y - 0.25, z, 1.5, 4, { phase: settings.dungeonBoxWitherEsp });
  });
}).setEnabled(stateBoxWithers);

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