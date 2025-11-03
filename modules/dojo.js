import { AtomicStateVar, StateProp, StateVar } from '../util/state';
import reg, { customRegs } from '../util/registerer';
import settings from '../settings';
import { bowVelocity, getBlockId, getEyeHeight, getItemId } from '../util/mc';
import { Deque } from '../util/polyfill';
import { getRenderX, getRenderY, getRenderZ, renderBillboardString, renderLine } from '../../Apelles/index';
import { colorForNumber } from '../util/format';
import createTextGui from '../util/customtextgui';
import createPointer from '../util/pointto';
import { getMedianPing } from '../util/ping';
import { getPartialServerTick } from '../util/draw';

/** @type {StateVar<'' | 'Force' | 'Stamina' | 'Mastery' | 'Discipline' | 'Swiftness' | 'Control' | 'Tenacity'} */
const stateCurrentChallenge = new StateVar('');

const startChallengeReg = reg('chat', chal => stateCurrentChallenge.set(chal)).setCriteria(/&r&f                     &r&.Test of (\w+) &r&e&lOBJECTIVES&r/);
const endChallengeReg = reg('chat', () => stateCurrentChallenge.set('')).setCriteria(/&r&f                               &r&7Time: &r&b\d\d:\d\d:\d\d\d&r/)
const leaveChallengeReg = reg('worldUnload', () => stateCurrentChallenge.set(''));

const stateMasteryEnabled = new StateProp(stateCurrentChallenge).equals('Mastery').and(settings._dojoMastery);
/** @type {Deque<{ pos: { x: number, y: number, z: number }, time: number }>} */
const masteryBlocks = new Deque();
const masteryTimerGui = createTextGui(() => ({ a: 0, c: 3, s: 1, x: Renderer.screen.getWidth() / 2, y: Renderer.screen.getHeight() / 2 + 10, b: true }));
let masteryBowTime = 0;
const stateBowPullTicks = new AtomicStateVar(0);
const stateMasteryPullingBow = new StateVar(false);
stateMasteryPullingBow.listen(() => stateBowPullTicks.set(0));
const masteryTickReg = reg('tick', () => {
  const p = Player.getPlayer();
  if (!p) return;
  const item = p.func_71011_bu();
  stateMasteryPullingBow.set(item && getItemId(item) === 'minecraft:bow');
});
const masterySTickReg = reg('serverTick', () => {
  stateBowPullTicks.set(stateBowPullTicks.get() + 1);
}).setEnabled(stateMasteryEnabled.and(stateMasteryPullingBow));
const masteryBlockReg = reg('blockChange', (pos, bs) => {
  const block = bs.func_177230_c();
  const id = getBlockId(block);
  if (id === 0 && masteryBlocks.length > 0) {
    const first = masteryBlocks.getFirst();
    if (pos.x === first.pos.x && pos.y === first.pos.y && pos.z === first.pos.z) masteryBlocks.shift();
  }
  if (id !== 35) return;
  if (block.func_176201_c(bs) !== 5) return;
  masteryBlocks.push({ pos, time: customRegs.serverTick.tick });
}).setEnabled(stateMasteryEnabled);
const masteryBlockRenderWorldReg = reg('renderWorld', () => {
  while (masteryBlocks.length > 0 && 135 < customRegs.serverTick.tick - masteryBlocks.getFirst().time) masteryBlocks.shift();
  if (masteryBlocks.length < 2) return;

  const first = masteryBlocks.getFirst();
  const next = masteryBlocks.at(1);
  renderLine(
    settings.dojoMasteryPointToNextColor,
    [
      [first.pos.x + 0.5, first.pos.y + 0.5, first.pos.z + 0.5],
      [next.pos.x + 0.5, next.pos.y + 0.5, next.pos.z + 0.5]
    ],
    { lw: 3 }
  );
  if (settings.dojoMasteryPointToNextTimer) {
    const timeRemaining = (125 - (customRegs.serverTick.tick - next.time)) * 50;
    renderBillboardString(
      0xFFFFFFFF,
      `${colorForNumber(timeRemaining, 1000)}${~~(timeRemaining / 1000)}:${(timeRemaining % 1000).toString().padStart(3, '0')}`,
      first.pos.x + 0.5,
      first.pos.y + 1.5,
      first.pos.z + 0.5,
      { scale: 2, phase: true }
    );
  }
}).setEnabled(stateMasteryEnabled.and(settings._dojoMasteryPointToNext));
const masteryBlockRenderOvReg = reg('renderOverlay', () => {
  if (masteryBlocks.length === 0) return;
  const first = masteryBlocks.getFirst();
  const timeRemaining = (125 - (customRegs.serverTick.tick - first.time) - masteryBowTime - getPartialServerTick() + 5) * 50;
  masteryTimerGui.setLine(`${colorForNumber(timeRemaining, 1000)}${(timeRemaining / 1000).toFixed(3)}`);
  masteryTimerGui.render();
}).setEnabled(stateMasteryEnabled.and(settings._dojoMasteryShowLowestTime));
const ProjectileHelper = Java.type('com.perseuspotter.chicktilshelper.ProjectileHelper');
const masteryPointReg = createPointer(
  settings._dojoMasteryPointToLowestColor,
  () => {
    const first = masteryBlocks.getFirst();
    const { theta, phi, ticks } = ProjectileHelper.solve(
      first.pos.x + 0.5 - Player.getX(),
      first.pos.y + 0.5 - Player.getY() - getEyeHeight(),
      first.pos.z + 0.5 - Player.getZ(),
      0.01, -0.05, Math.max(bowVelocity(stateBowPullTicks.get()), 1), 0.99, false
    );
    if (Number.isNaN(theta)) {
      masteryBowTime = 0;
      return [first.pos.x + 0.5, first.pos.y + 0.5, first.pos.z + 0.5];
    }
    masteryBowTime = ticks;
    return [
      getRenderX() + Math.sin(phi) * Math.cos(theta),
      getRenderY() + Math.cos(phi) + getEyeHeight(),
      getRenderZ() + Math.sin(phi) * Math.sin(theta)
    ];
  },
  {
    enabled: stateMasteryEnabled,
    req: () => masteryBlocks.length > 0
  }
);
const masteryHideTitle = reg('renderTitle', (_, __, evn) => cancel(evn)).setEnabled(stateMasteryEnabled.and(settings._dojoMasteryHideTitles));

export function init() { }
export function load() {
  startChallengeReg.register();
  endChallengeReg.register();
  leaveChallengeReg.register();

  masteryTickReg.register();
  masterySTickReg.register();
  masteryBlockReg.register();
  masteryBlockRenderWorldReg.register();
  masteryBlockRenderOvReg.register();
  masteryPointReg.register();
  masteryHideTitle.register();
}
export function unload() {
  startChallengeReg.unregister();
  endChallengeReg.unregister();
  leaveChallengeReg.unregister();

  masteryTickReg.unregister();
  masterySTickReg.unregister();
  masteryBlockReg.unregister();
  masteryBlockRenderWorldReg.unregister();
  masteryBlockRenderOvReg.unregister();
  masteryPointReg.unregister();
  masteryHideTitle.unregister();
}