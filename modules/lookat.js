import settings from '../settings';
import { log } from '../util/log';
import reg from '../util/registerer';
import { StateProp, StateVar } from '../util/state';
import { unrun } from '../util/threading';
import { getRenderX, getRenderY, getRenderZ, renderBillboard, renderTracer } from '../../Apelles/index';
import { getEyeHeight } from '../util/mc';
import { distAngle } from '../util/math';
import { drawArrow3D, getPitch, getYaw } from '../util/draw';

let id = 0;
/** @type {StateVar<[number, number, number]?>} */
const stateCurrentPos = new StateVar();
let lookedAt = 0;

function reset(time, cid) {
  Client.scheduleTask(time, () => {
    const curr = stateCurrentPos.get();
    if (curr && curr[0] === cid) stateCurrentPos.set(null);
  });
}

const cmdReg = reg('command', (yaw, pitch) => {
  yaw = +yaw;
  pitch = +pitch;
  if (Number.isNaN(pitch) || Number.isNaN(yaw)) return log('&4please provide valid yaw/pitch values');
  const cid = ++id;
  unrun(() => stateCurrentPos.set([cid, yaw, pitch]));
  reset(settings.lookAtTimeout, cid);
}).setName('lookat');
const renderReg = reg('renderWorld', () => {
  let [cid, yaw, pitch] = stateCurrentPos.get();

  if (lookedAt < id && distAngle(yaw, getYaw()) < settings.lookAtThreshold && distAngle(pitch, getPitch()) < settings.lookAtThreshold) {
    lookedAt = id;
    reset(10, cid);
    World.playSound('note.pling', 1, 1);
  }

  yaw *= Math.PI / 180;
  pitch *= Math.PI / 180;
  const dx = -Math.sin(yaw) * Math.cos(pitch);
  const dy = -Math.sin(pitch);
  const dz = Math.cos(yaw) * Math.cos(pitch);

  renderBillboard(
    settings.lookAtColor,
    getRenderX() + dx,
    getRenderY() + dy + getEyeHeight(),
    getRenderZ() + dz,
    settings.lookAtSize,
    settings.lookAtSize,
    { phase: true }
  );

  if (settings.lookAtPointTo && settings.preferUseTracer) renderTracer(
    settings.lookAtColor,
    getRenderX() + dx,
    getRenderY() + dy + getEyeHeight(),
    getRenderZ() + dz,
    { lw: 3, phase: true }
  );
}).setEnabled(stateCurrentPos);
const pointOvReg = reg('renderOverlay', () => {
  let [cid, yaw, pitch] = stateCurrentPos.get();

  drawArrow3D(
    settings.lookAtColor,
    (yaw - 90) * Math.PI / 180,
    pitch * Math.PI / 180
  );
}).setEnabled(new StateProp(settings._preferUseTracer).not().and(settings._lookAtPointTo).and(stateCurrentPos));

export function init() { }
export function load() {
  cmdReg.register();
  renderReg.register();
  pointOvReg.register();
}
export function unload() {
  cmdReg.unregister();
  renderReg.unregister();
  pointOvReg.unregister();
}