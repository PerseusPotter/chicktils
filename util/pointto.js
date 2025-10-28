import { renderTracer } from '../../Apelles/index';
import settings from '../settings';
import { drawArrow3DPos } from './draw';
import reg from './registerer';
import { StateProp, StateVar } from './state';

/**
 * @param {import ('../settingsLib').PropertyColor | StateVar<number>} color
 * @param {() => [number, number, number]} position
 * @param {object} [options]
 * @param {import ('../settingsLib').PropertyToggle | StateVar<boolean>} [options.phase]
 * @param {StateVar<boolean>} [options.enabled]
 * @param {number} [options.lw]
 * @param {number} [options.size]
 * @param {() => boolean} [options.req]
 */
export default function createPointer(color, position, {
  phase = new StateVar(true),
  enabled = new StateVar(true),
  lw = 3,
  size = 3,
  req = (() => true)
} = {}) {
  const wrldReg = reg('renderWorld', () => {
    if (!req()) return;
    const pos = position();
    renderTracer(
      color.get(),
      pos[0], pos[1], pos[2],
      { lw, phase: phase.get() }
    );
  }).setEnabled(new StateProp(settings._preferUseTracer).and(enabled));
  const ovlyReg = reg('renderOverlay', () => {
    if (!req()) return;
    const pos = position();
    drawArrow3DPos(
      color.get(),
      pos[0], pos[1], pos[2],
      false, size
    );
  }).setEnabled(new StateProp(settings._preferUseTracer).not().and(enabled));

  return {
    register() {
      wrldReg.register();
      ovlyReg.register();
    },
    unregister() {
      wrldReg.unregister();
      ovlyReg.unregister();
    }
  };
}