import settings from '../../settings';
import { drawBoxAtBlockNotVisThruWalls, drawBoxAtBlock } from '../../util/draw';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateIsInBoss } from '../dungeon.js';

let withers = [];

const stateBoxWithers = new StateProp(settings._dungeonBoxWither).and(stateIsInBoss);

const entSpawnReg = reg(net.minecraftforge.event.entity.EntityJoinWorldEvent, evn => {
  if (evn.entity.getClass().getSimpleName() === 'EntityWither') withers.push(new EntityLivingBase(evn.entity));
}).setEnabled(stateBoxWithers);
const tickReg = reg('tick', () => withers = withers.filter(v => !v.isDead() && v.getName() === 'Wither' && v.getMaxHP() !== 300)).setEnabled(stateBoxWithers);
const renderWorldReg = reg('renderWorld', () => {
  const r = ((settings.dungeonBoxWitherColor >> 24) & 0xFF) / 256;
  const g = ((settings.dungeonBoxWitherColor >> 16) & 0xFF) / 256;
  const b = ((settings.dungeonBoxWitherColor >> 8) & 0xFF) / 256;
  const a = ((settings.dungeonBoxWitherColor >> 0) & 0xFF) / 256;
  withers.forEach(e => {
    const x = e.getRenderX();
    const y = e.getRenderY();
    const z = e.getRenderZ();
    if (settings.dungeonBoxWitherEsp) drawBoxAtBlock(x - 0.75, y - 0.25, z - 0.75, r, g, b, 1.5, 4, a, 5);
    else drawBoxAtBlockNotVisThruWalls(x - 0.75, y - 0.25, z - 0.75, r, g, b, 1.5, 4, a, 5);
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