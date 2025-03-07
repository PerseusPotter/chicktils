import settings from '../settings';
import { getRenderX, getRenderY, getRenderZ, renderFilledBox, renderOutline, renderParaCurve } from '../util/draw';
import { lerp } from '../util/math';
import { getEyeHeight } from '../util/mc';
import reg from '../util/registerer';
import { getSbId } from '../util/skyblock';
import { StateVar } from '../util/state';

const stateHoldingPearl = new StateVar(false);

/** @type {[number, number, number][]} */
let pearlPos = [];
let collidedEntity;

const v = 1.5;
const d = 0.99;
const g = -0.03;
const Vec3 = Java.type('net.minecraft.util.Vec3');
const AABB = new (Java.type('net.minecraft.util.AxisAlignedBB'))(-0.125, 0, -0.125, 0.125, 0.25, 0.125);
const tickReg = reg('tick', () => {
  stateHoldingPearl.set(getSbId(Player.getHeldItem()) === 'ENDER_PEARL');

  if (!stateHoldingPearl.get()) return;

  pearlPos = [];
  collidedEntity = null;
  if (!settings.pearlPathCheeto && Client.getMinecraft().field_71476_x && Client.getMinecraft().field_71476_x.field_72313_a.toString() !== 'MISS') return;

  let yaw = Player.getRawYaw() / 180 * Math.PI;
  let pitch = Player.getPitch() / 180 * Math.PI;
  let ix = -Math.cos(yaw) * 0.16;
  let iz = -Math.sin(yaw) * 0.16;
  let iy = getEyeHeight() - 0.1;
  const x0 = Player.getX();
  const y0 = Player.getY();
  const z0 = Player.getZ();
  let vx = v * -Math.sin(yaw) * Math.cos(pitch);
  let vz = v * +Math.cos(yaw) * Math.cos(pitch);
  let vy = v * -Math.sin(pitch);

  let curr = new Vec3(ix + x0, iy + y0, iz + z0);
  while (iy + y0 >= 0) {
    pearlPos.push([ix, iy, iz]);
    let x = ix + x0;
    let z = iz + z0;
    let y = iy + y0;
    let next = new Vec3(x + vx, y + vy, z + vz);

    if (settings.pearlPathCollideEntity) {
      let aabb = AABB.func_72317_d(x, y, z);
      let minD = Number.POSITIVE_INFINITY;
      World.getWorld().func_72839_b(Player.getPlayer(), aabb.func_72321_a(vx, vy, vz).func_72314_b(1, 1, 1)).forEach(ent => {
        if (!ent.func_70067_L()) return;
        const eaabb = ent.func_174813_aQ().func_72314_b(0.3, 0.3, 0.3);
        const mop = eaabb.func_72327_a(curr, next);
        if (!mop) return;
        const d = curr.func_72436_e(mop.field_72307_f);
        if (d < minD) {
          minD = d;
          collidedEntity = ent;
        }
      });

      if (collidedEntity) break;
    }

    if (World.getWorld().func_72933_a(curr, next)) break;

    curr = next;
    ix += vx;
    iy += vy;
    iz += vz;
    vx *= d;
    vy *= d;
    vz *= d;
    vy += g;
  }
});
const renderReg = reg('renderWorld', pt => {
  if (pearlPos.length === 0) return;

  if (collidedEntity) renderOutline(
    lerp(collidedEntity.field_70169_q, collidedEntity.field_70165_t, pt),
    lerp(collidedEntity.field_70167_r, collidedEntity.field_70163_u, pt),
    lerp(collidedEntity.field_70166_s, collidedEntity.field_70161_v, pt),
    collidedEntity.field_70130_N,
    collidedEntity.field_70131_O,
    settings.pearlPathCollidedEntityColor,
    settings.pearlPathEsp,
    true
  );
  const rx = getRenderX();
  const ry = getRenderY();
  const rz = getRenderZ();
  if (pearlPos.length > 1) renderParaCurve(
    settings.pearlPathPathColor,
    t => [
      rx + pearlPos[t][0],
      ry + pearlPos[t][1],
      rz + pearlPos[t][2]
    ],
    0, pearlPos.length - 1,
    pearlPos.length - 1,
    settings.pearlPathEsp
  );

  const ex = Math.floor(rx + pearlPos[pearlPos.length - 1][0]) + 0.5;
  const ey = Math.floor(ry + pearlPos[pearlPos.length - 1][1]);
  const ez = Math.floor(rz + pearlPos[pearlPos.length - 1][2]) + 0.5;
  renderFilledBox(
    ex, ey, ez,
    0.6, 1.8,
    settings.pearlPathDestColorFill,
    settings.pearlPathEsp,
    true
  );
  renderOutline(
    ex, ey, ez,
    0.6, 1.8,
    settings.pearlPathDestColorOutline,
    settings.pearlPathEsp,
    true
  );
}).setEnabled(stateHoldingPearl);

export function init() { }
export function load() {
  stateHoldingPearl.set(false);

  tickReg.register();
  renderReg.register();
}
export function unload() {
  pearlPos = [];
  collidedEntity = null;

  tickReg.unregister();
  renderReg.unregister();
}