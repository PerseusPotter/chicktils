import { StateProp, StateVar } from '../util/state';
import reg, { customRegs } from '../util/registerer';
import settings from '../settings';
import { getBlockId } from '../util/mc';
import { Deque } from '../util/polyfill';
import { renderLine, renderTracer } from '../../Apelles/index';
import { drawArrow3DPos, renderString } from '../util/draw';
import { colorForNumber } from '../util/format';
import createTextGui from '../util/customtextgui';

/** @type {StateVar<'' | 'Force' | 'Stamina' | 'Mastery' | 'Discipline' | 'Swiftness' | 'Control' | 'Tenacity'} */
const stateCurrentChallenge = new StateVar('');

const startChallengeReg = reg('chat', chal => stateCurrentChallenge.set(chal)).setCriteria(/&r&f                     &r&.Test of (\w+) &r&e&lOBJECTIVES&r/);
const endChallengeReg = reg('chat', () => stateCurrentChallenge.set('')).setCriteria(/&r&f                               &r&7Time: &r&b\d\d:\d\d:\d\d\d&r/)
const leaveChallengeReg = reg('worldUnload', () => stateCurrentChallenge.set(''));

const stateMasteryEnabled = new StateProp(stateCurrentChallenge).equals('Mastery').and(settings._dojoMastery);
/** @type {Deque<{ pos: { x: number, y: number, z: number }, time: number }>} */
const masteryBlocks = new Deque();
const masteryTimerGui = createTextGui(() => ({ a: 0, c: 3, s: 1, x: Renderer.screen.getWidth() / 2, y: Renderer.screen.getHeight() / 2 + 10, b: true }));
const masteryBlockReg = reg('blockChange', (pos, bs) => {
  const block = bs.func_177230_c();
  const id = getBlockId(block);
  if (id === 0 && masteryBlocks.length > 0) {
    const first = masteryBlocks.getFirst();
    if (pos.x === first.x && pos.y === first.y && pos.z === first.z) masteryBlocks.shift();
  }
  if (id !== 35) return;
  if (block.func_176201_c(bs) !== 5) return;
  masteryBlocks.push({ pos, time: customRegs.serverTick2.tick });
}).setEnabled(stateMasteryEnabled);
const masteryBlockRenderWorldReg = reg('renderWorld', () => {
  while (masteryBlocks.length > 0 && 135 < customRegs.serverTick2.tick - masteryBlocks.getFirst().time) masteryBlocks.shift();

  if (settings.dojoMasteryPointToLowest && masteryBlocks.length > 0 && settings.preferUseTracer) {
    const first = masteryBlocks.getFirst();
    if (settings.preferUseTracer) renderTracer(
      settings.dojoMasteryPointToLowestColor,
      first.pos.x + 0.5,
      first.pos.y + 0.5,
      first.pos.z + 0.5,
      { lw: 3 }
    );
  }
  if (settings.dojoMasteryPointToNext && masteryBlocks.length >= 2) {
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
      const timeRemaining = (125 - (customRegs.serverTick2.tick - next.time)) * 50;
      renderString(
        `${colorForNumber(timeRemaining, 1000)}${~~(timeRemaining / 1000)}:${(timeRemaining % 1000).toString().padStart(3, '0')}`,
        first.pos.x + 0.5,
        first.pos.y + 1.5,
        first.pos.z + 0.5,
        0xFFFFFFFF,
        true,
        0.04,
        false, false
      );
    }
  }
}).setEnabled(stateMasteryEnabled);
const masteryBlockRenderOvReg = reg('renderOverlay', () => {
  if (masteryBlocks.length === 0) return;
  const first = masteryBlocks.getFirst();
  if (settings.dojoMasteryPointToLowest && !settings.preferUseTracer) drawArrow3DPos(
    settings.dojoMasteryPointToLowestColor,
    first.pos.x, first.pos.y, first.pos.z,
    false
  );
  if (settings.dojoMasteryShowLowestTime) {
    const timeRemaining = (125 - (customRegs.serverTick2.tick - first.time)) * 50;
    masteryTimerGui.setLine(`${colorForNumber(timeRemaining, 1000)}${~~(timeRemaining / 1000)}:${(timeRemaining % 1000).toString().padStart(3, '0')}`);
    masteryTimerGui.render();
  }
}).setEnabled(stateMasteryEnabled);
const masteryHideTitle = reg('renderTitle', (_, __, evn) => cancel(evn)).setEnabled(stateMasteryEnabled.and(settings._dojoMasteryHideTitles));

export function init() { }
export function load() {
  startChallengeReg.register();
  endChallengeReg.register();
  leaveChallengeReg.register();

  masteryBlockReg.register();
  masteryBlockRenderWorldReg.register();
  masteryBlockRenderOvReg.register();
  masteryHideTitle.register();
}
export function unload() {
  startChallengeReg.unregister();
  endChallengeReg.unregister();
  leaveChallengeReg.unregister();

  masteryBlockReg.unregister();
  masteryBlockRenderWorldReg.unregister();
  masteryBlockRenderOvReg.unregister();
  masteryHideTitle.unregister();
}