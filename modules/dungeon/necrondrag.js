import settings from '../../settings';
import data from '../../data';
import reg, { customRegs } from '../../util/registerer';
import { colorForNumber } from '../../util/format';
import runHelper from '../../util/runner';
import createTextGui from '../../util/customtextgui';
import { AtomicStateVar, StateProp, StateVar } from '../../util/state';
import { stateFloor, stateIsInBoss, statePlayerClass } from '../dungeon.js';
import { applyTint, drawTimerBar, getPartialServerTick } from '../../util/draw';
import createGui from '../../util/customgui';
import { toArrayList } from '../../util/polyfill';
import { getRenderX, getRenderY, getRenderZ, renderBillboard } from '../../../Apelles/index';
import { getEyeHeight, getItemId } from '../../util/mc';

const DRAG_TICKS = 120;
const FROZEN_TICKS = 140;
const IMMUNE_TICKS = 163;
const NECRON_CEILING_HEIGHT = 120;
const NECRON_PATH = toArrayList([
  [0, 0, 0]
].map(v => toArrayList(v)));

const instaMidProc = new StateVar(undefined);
const necronDragStart = new StateVar(0);
const necronPhaseStart = new StateVar(false);
const statePullingBow = new StateVar(false);
const stateBowPullTicks = new AtomicStateVar(0);
statePullingBow.listen(() => {
  stateBowPullTicks.set(0);
  prevTarget = 0;
});
let prevTarget = 0;
let canHighPrefire = true;

const necronDragTimer = createTextGui(() => data.dungeonNecronDragTimerLoc, () => ['&a&lLeap: &2&l4.82s', '&e&lVulnerable: &2&l6.97s']);
const lock = new (Java.type('java.util.concurrent.locks.ReentrantLock'))();
const ProjectileHelper = Java.type('com.perseuspotter.chicktilshelper.ProjectileHelper');
const necronDragPrefire = createGui(
  () => data.dungeonNecronDragPrefireLoc,
  () => data.dungeonNecronDragPrefireLoc.w, () => data.dungeonNecronDragPrefireLoc.h,
  function render() {
    const px = getRenderX();
    const py = getRenderY() + getEyeHeight();
    const pz = getRenderZ();
    const moveTime = FROZEN_TICKS - (customRegs.serverTick.tick - necronDragStart.get() + getPartialServerTick());
    const immuneTime = IMMUNE_TICKS - (customRegs.serverTick.tick - necronDragStart.get() + getPartialServerTick());

    if (statePullingBow.get()) {
      drawTimerBar(
        this.getX1(), this.getY1(),
        this.getW(), this.getH() * 0.45,
        0, 0, 0, 0, 40,
        applyTint(settings.dungeonNecronDragPrefireBackgroundColor, settings.dungeonNecronDragPrefireInactiveTint),
        applyTint(settings.dungeonNecronDragPrefireForegroundColor, settings.dungeonNecronDragPrefireInactiveTint),
        applyTint(settings.dungeonNecronDragPrefireArrowColor, settings.dungeonNecronDragPrefireInactiveTint)
      );

      const pullTicks = stateBowPullTicks.get();
      const data = ProjectileHelper.aim(
        moveTime,
        NECRON_PATH,
        prevTarget,
        0.001,
        canHighPrefire,
        px, py, pz,
        Math.min(20, pullTicks), immuneTime
      );
      prevTarget = data?.index ?? 0;
      const pullTicksLerp = pullTicks + getPartialServerTick();
      const t1 = data ? pullTicksLerp + data.tick : 0;
      const t2 = data ? t1 + data.index : 0;

      drawTimerBar(
        this.getX1(), this.y(0.55),
        this.getW(), this.getH() * 0.45,
        pullTicksLerp, 0, t1, t2, 40,
        settings.dungeonNecronDragPrefireBackgroundColor,
        settings.dungeonNecronDragPrefireForegroundColor,
        settings.dungeonNecronDragPrefireArrowColor
      );
    } else {
      drawTimerBar(
        this.getX1(), this.y(0.55),
        this.getW(), this.getH() * 0.45,
        0, 0, 0, 0, 40,
        applyTint(settings.dungeonNecronDragPrefireBackgroundColor, settings.dungeonNecronDragPrefireInactiveTint),
        applyTint(settings.dungeonNecronDragPrefireForegroundColor, settings.dungeonNecronDragPrefireInactiveTint),
        applyTint(settings.dungeonNecronDragPrefireArrowColor, settings.dungeonNecronDragPrefireInactiveTint)
      );

      if (canHighPrefire) {
        const minTick = ProjectileHelper.calcTickRange(
          NECRON_PATH.get(0).get(0) - px,
          NECRON_PATH.get(0).get(1) - py,
          NECRON_PATH.get(0).get(2) - pz,
          NECRON_CEILING_HEIGHT - py,
          0.001, true, false
        );
        if (!minTick || minTick.data.ticks > immuneTime) canHighPrefire = false;
        else {
          const maxTick = ProjectileHelper.calcTickRange(
            NECRON_PATH.get(0).get(0) - px,
            NECRON_PATH.get(0).get(1) - py,
            NECRON_PATH.get(0).get(2) - pz,
            NECRON_CEILING_HEIGHT - py,
            0.001, true, true
          );
          const t1 = immuneTime - minTick.data.ticks - minTick.tick;
          const t2 = immuneTime - maxTick.data.ticks - maxTick.tick;
          drawTimerBar(
            this.getX1(), this.getY1(),
            this.getW(), this.getH() * 0.45,
            0, 0, Math.min(t1, t2), Math.max(t1, t2), 40,
            settings.dungeonNecronDragPrefireBackgroundColor,
            settings.dungeonNecronDragPrefireForegroundColor,
            settings.dungeonNecronDragPrefireArrowColor
          );
        }
      }
      if (!canHighPrefire) {
        drawTimerBar(
          this.getX1(), this.getY1(),
          this.getW(), this.getH() * 0.45,
          0, 0, 0, 40, 40,
          settings.dungeonNecronDragPrefireBackgroundColor,
          settings.dungeonNecronDragPrefireForegroundColor,
          settings.dungeonNecronDragPrefireArrowColor
        );
      }
    }
  },
  function renderEdit() {
    drawTimerBar(
      this.getX1(), this.getY1(),
      this.getW(), this.getH() * 0.45,
      0, 0, 0, 0, 40,
      settings.dungeonNecronDragPrefireBackgroundColor,
      settings.dungeonNecronDragPrefireForegroundColor,
      settings.dungeonNecronDragPrefireArrowColor
    );
    drawTimerBar(
      this.getX1(), this.y(0.55),
      this.getW(), this.getH() * 0.45,
      0, 0, 0, 0, 40,
      applyTint(settings.dungeonNecronDragPrefireBackgroundColor, settings.dungeonNecronDragPrefireInactiveTint),
      applyTint(settings.dungeonNecronDragPrefireForegroundColor, settings.dungeonNecronDragPrefireInactiveTint),
      applyTint(settings.dungeonNecronDragPrefireArrowColor, settings.dungeonNecronDragPrefireInactiveTint)
    );
  },
  '\n&7[&2←&7/&2→&7] &fChange Width' +
  '\n&7[&2↑&7/&2↓&7] &fChange Height'
);

necronDragPrefire.on('editKey', n => {
  switch (n) {
    case 200:
      data.dungeonNecronDragPrefireLoc.h = Math.max(10, data.dungeonNecronDragPrefireLoc.h - 10);
      break;
    case 208:
      data.dungeonNecronDragPrefireLoc.h += 10;
      break;
    case 203:
      data.dungeonNecronDragPrefireLoc.w = Math.max(10, data.dungeonNecronDragPrefireLoc.w - 10);
      break;
    case 205:
      data.dungeonNecronDragPrefireLoc.w += 10;
      break;
  }
});

const stateNecronDrag = new StateProp(stateFloor).equalsmult('F7', 'M7').and(stateIsInBoss).and(settings._dungeonNecronDrag);
const stateNecronDragPrefire = stateNecronDrag.and(settings._dungeonNecronDragPrefire).and(new StateProp(statePlayerClass).customBinary(settings._dungeonNecronDragPrefireClasses, (c, s) => c === 'Unknown' || s.includes(c[0].toLowerCase())));
const stateDragging = new StateProp(necronDragStart).notequals(0);

const necronStartReg = reg('chat', () => {
  necronDragStart.set(customRegs.serverTick.tick);
  necronPhaseStart.set(true);

  if (settings.dungeonNecronDragTimer === 'InstaMid' || settings.dungeonNecronDragTimer === 'Both') instaMidProc.set(runHelper('InstaMidHelper', [DRAG_TICKS.toString()]));
}).setCriteria('&r&4[BOSS] Necron&r&c: &r&cYou went further than any human before, congratulations.&r').setEnabled(stateNecronDrag);

const tickReg = reg('tick', () => {
  const inst = instaMidProc.get();
  if (inst.isAlive()) {
    lock.lock();
    const out = inst.getOutputStream();
    out.write(65);
    out.write(10);
    out.flush();
    lock.unlock();
  } else instaMidProc.set(void 0);
}).setEnabled(new StateProp(instaMidProc).notequals(undefined));

const serverTickReg = reg('serverTick', t => {
  if (t > necronDragStart.get() + IMMUNE_TICKS + 10) necronDragStart.set(0);

  const inst = instaMidProc.get();
  if (inst) {
    if (inst.isAlive()) {
      lock.lock();
      const out = inst.getOutputStream();
      out.write(66);
      out.write(10);
      out.flush();
      lock.unlock();
    } else instaMidProc.set(void 0);
  }
}).setEnabled(stateDragging.and(stateNecronDrag));

const rendOvTimerReg = reg('renderOverlay', () => {
  const dt = customRegs.serverTick.tick + getPartialServerTick() - necronDragStart.get();
  const dragTime = DRAG_TICKS - dt;
  const immuneTime = IMMUNE_TICKS - dt;
  necronDragTimer.setLines([
    `&a&lLeap: ${colorForNumber(dragTime, DRAG_TICKS)}&l${dragTime < 0 ? '&a&lNOW' : (dragTime / 20).toFixed(2)}s`,
    `&e&lVulnerable: ${colorForNumber(immuneTime, IMMUNE_TICKS)}&l${immuneTime < 0 ? '&a&lNOW' : (immuneTime / 20).toFixed(2)}s`
  ]);
  necronDragTimer.render();
}).setEnabled(new StateProp(settings._dungeonNecronDragTimer).equalsmult('OnScreen', 'Both').and(stateDragging));

const rendWrldPrefireReg = reg('renderWorld', () => {
  const px = getRenderX();
  const py = getRenderY() + getEyeHeight();
  const pz = getRenderZ();
  const moveTime = FROZEN_TICKS - (customRegs.serverTick.tick - necronDragStart.get() + getPartialServerTick());
  const immuneTime = IMMUNE_TICKS - (customRegs.serverTick.tick - necronDragStart.get() + getPartialServerTick());

  const data = ProjectileHelper.aim(
    moveTime,
    NECRON_PATH,
    prevTarget,
    0.001,
    canHighPrefire,
    px, py, pz,
    Math.min(20, stateBowPullTicks.get()), immuneTime
  );
  prevTarget = data?.index ?? 0;
  if (!data) return;

  const prefireP = data.data.phi;
  const prefireT = data.data.theta;

  if (Number.isNaN(prefireP)) return;

  renderBillboard(
    settings.dungeonNecronDragPrefireAimColor,
    px + Math.sin(prefireP) * Math.cos(prefireT),
    py + Math.cos(prefireP) + getEyeHeight(),
    pz + Math.sin(prefireP) * Math.sin(prefireT),
    0.005, 0.005,
    { phase: true }
  );
}).setEnabled(stateNecronDragPrefire.and(necronPhaseStart).and(statePullingBow));

const bowTickReg = reg('tick', () => {
  const p = Player.getPlayer();
  if (!p) return;
  const item = p.func_71011_bu();
  if (!item) return statePullingBow.set(false);
  const id = getItemId(item);
  statePullingBow.set(id === 'minecraft:bow');
}).setEnabled(stateNecronDragPrefire.and(necronPhaseStart));

const bowSTickReg = reg('serverTick', () => {
  stateBowPullTicks.set(stateBowPullTicks.get() + 1);
}).setEnabled(stateNecronDragPrefire.and(necronPhaseStart).and(statePullingBow));

export function init() {
  settings._moveNecronDragTimer.onAction(v => necronDragTimer.edit(v));
  settings._moveNecronDragPrefire.onAction(v => necronDragPrefire.edit(v));
  settings._dungeonNecronDragPrefireClasses.listen(function(v, o) {
    if (!/[^bmhat]/.test(v)) return;
    log('&4invalid classes, it should only contain the characters "bmhat" (case sensitive)');
    this.set(o);
  })
}
export function enter() {
  necronDragStart.set(0);
  necronPhaseStart.set(false);
  statePullingBow.set(false);
  stateBowPullTicks.set(0);
  prevTarget = 0;
  canHighPrefire = true;
}
export function start() {
  necronStartReg.register();
  tickReg.register();
  serverTickReg.register();
  rendOvTimerReg.register();
  rendWrldPrefireReg.register();
  bowTickReg.register();
  bowSTickReg.register();
}
export function reset() {
  const inst = instaMidProc.get();
  if (inst && inst.isAlive()) {
    inst.destroyForcibly();
    instaMidProc.set(void 0);
  }

  necronStartReg.unregister();
  tickReg.unregister();
  serverTickReg.unregister();
  rendOvTimerReg.unregister();
  rendWrldPrefireReg.unregister();
  bowTickReg.unregister();
  bowSTickReg.unregister();
}