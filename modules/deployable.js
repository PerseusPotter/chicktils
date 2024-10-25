import reg from '../util/registerer';
import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { StateProp, StateVar } from '../util/state';
import { compareFloat, dist } from '../util/math';
import { colorForNumber } from '../util/format';
import GlStateManager2 from '../util/glStateManager';

function spawnParticle(x, y, z, r, g, b, age) {
  // World.particle.spawnParticle('REDSTONE', x, y, z, 0, 0, 0).setMaxAge(age).setColor(r, g, b, 1);
  const part = Client.getMinecraft().field_71438_f.func_174974_b(
    30, true,
    x, y, z,
    0, 0, 0
  );
  if (!part) return;
  part.field_70547_e = age;
  part.func_70538_b(r, g, b);
}
/**
 * @typedef {{ ent: import('../../@types/External').JavaClass<'net.minecraft.entity.Entity'>, ttl: number, isFlux: boolean, prio: number, id: string, stats: string[], range: number, isOwn: boolean, y: number }} Deployable
 */
const DEPLOYABLE_DATA = {
  RADIANT_POWER_ORB: {
    duration: 20 * 30,
    range: 18 ** 2,
    stats: ['§c+1% ❤/s'],
    prio: 1,
    /**
     * @param {number} t
     * @param {[number, number, number]} pos
     */
    parts(t, pos) {
      const y = 0.8 * Math.sin(t / 6);
      for (let i = 0; i < 20; i++) {
        let a = 2 * Math.PI * i / 20;
        let x = Math.cos(a);
        let z = Math.sin(a);
        spawnParticle(
          x + pos[0], y + pos[1], z + pos[2],
          0.2, 0.8, 0.16,
          10
        );
      }
    }
  },
  MANA_FLUX_POWER_ORB: {
    duration: 20 * 30,
    range: 18 ** 2,
    stats: [
      '§b+50% ✎',
      '§c+2% ❤/s',
      '§c+10 ❁'
    ],
    prio: 3,
    /**
     * @param {number} t
     * @param {[number, number, number]} pos
     */
    parts(t, pos) {
      pos[1]--;
      t /= 3;
      t %= 100;
      if (t < 69) {
        const k = 0.04;
        for (let i = 0; i < 3; i++) {
          let o = 2 * Math.PI * i / 3;
          spawnParticle(
            2 * Math.cos(t + o) / Math.cosh(k * t) + pos[0],
            2 * Math.tanh(k * t) + pos[1],
            2 * Math.sin(t + o) / Math.cosh(k * t) + pos[2],
            0, 0.5, 1,
            t > 50 ? 10 : 20
          );
        }
      } else if (t < 90) {
        t -= 69;
        spawnParticle(
          pos[0],
          -0.005 * t * t + 2 + pos[1],
          pos[2],
          0, 0.5, 1,
          10
        );
      } else {
        const r = 2 * (t - 90) / 10;
        const n = 30;
        for (let i = 0; i < n; i++) {
          let a = 2 * Math.PI * i / n + Math.random() / 20;
          spawnParticle(
            r * Math.cos(a) + pos[0],
            pos[1],
            r * Math.sin(a) + pos[2],
            0, 0.5, 1,
            5
          );
        }
      }
    }
  },
  OVERFLUX_POWER_ORB: {
    duration: 20 * 60,
    range: 18 ** 2,
    stats: [
      '§b+100% ✎',
      '§c+2.5% ❤/s',
      '§4+5 ♨',
      '§a+5 ☄',
      '§c+25 ❁'
    ],
    prio: 5,
    hoops: [
      [30, 150 * Math.PI / 180, 2 + Math.random(), 1.2, [59 / 255, 14 / 255, 55 / 255]],
      [25, 90 * Math.PI / 180, 4 + Math.random(), 1, [124 / 255, 26 / 255, 46 / 255]],
      [20, 10 * Math.PI / 180, 3 + Math.random(), 0.8, [188 / 255, 37 / 255, 37 / 255]]
    ],
    /**
     * @param {number} t
     * @param {[number, number, number]} pos
     * @param {number} y
     */
    parts(t, pos, y) {
      t /= 50;
      this.hoops.forEach(([n, a, k, r, c]) => {
        const nx = Math.cos(a) * Math.cos(t) * Math.cos(k * t) - Math.sin(t) * Math.sin(k * t);
        const ny = Math.sin(a) * Math.cos(k * t);
        const nz = Math.cos(a) * Math.sin(t) * Math.cos(k * t) + Math.cos(t) * Math.sin(k * t);
        let ux = 0;
        let uy = 1;
        let uz = nz === 0 ? 1 : -(nx * ux + ny * uy) / nz;
        const l = Math.hypot(ux, uy, uz);
        ux /= l;
        uy /= l;
        uz /= l;
        const vx = ny * uz - nz * uy;
        const vy = nz * ux - nx * uz;
        const vz = nx * uy - ny * ux;
        for (let i = 0; i < n; i++) {
          let a = 2 * Math.PI * i / n;
          spawnParticle(
            r * (ux * Math.cos(a) + vx * Math.sin(a)) + pos[0],
            r * (uy * Math.cos(a) + vy * Math.sin(a)) + y,
            r * (uz * Math.cos(a) + vz * Math.sin(a)) + pos[2],
            c[0], c[1], c[2],
            3
          );
        }
      });
    }
  },
  PLASMAFLUX_POWER_ORB: {
    duration: 20 * 60,
    range: 20 ** 2,
    stats: [
      '§b+125% ✎',
      '§c+3% ❤/s',
      '§4+7.5 ♨',
      '§a+7.5 ☄',
      '§c+35 ❁'
    ],
    prio: 6,
    hoops: [
      [30, 150 * Math.PI / 180, 2 + Math.random(), 1.2, [13 / 255, 6 / 255, 6 / 255]],
      [25, 90 * Math.PI / 180, 4 + Math.random(), 1, [59 / 255, 14 / 255, 55 / 255]],
      [20, 60 * Math.PI / 180, 3 + Math.random(), 0.8, [106 / 255, 50 / 255, 148 / 255]],
      [15, 10 * Math.PI / 180, 6 + Math.random(), 0.6, [209 / 255, 145 / 255, 252 / 255]]
    ],
    /**
     * @param {number} t
     * @param {[number, number, number]} pos
     * @param {number} y
     */
    parts(t, pos, y) {
      DEPLOYABLE_DATA.OVERFLUX_POWER_ORB.parts.call(this, t, pos, y);
    }
  },
  'ewogICJ0aW1lc3RhbXAiIDogMTY0NjY4NzMwNjIyMywKICAicHJvZmlsZUlkIiA6ICI0MWQzYWJjMmQ3NDk0MDBjOTA5MGQ1NDM0ZDAzODMxYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZWdha2xvb24iLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMjJlMmJmNmMxZWMzMzAyNDc5MjdiYTYzNDc5ZTU4NzJhYzY2YjA2OTAzYzg2YzgyYjUyZGFjOWYxYzk3MTQ1OCIKICAgIH0KICB9Cn0=': {
    duration: 20 * 3 * 60,
    range: 40 ** 2,
    stats: [
      '§4+10 ♨',
      '§f+10 ❂'
    ],
    prio: 2,
    /**
     * @param {number} t
     * @param {[number, number, number]} pos
     */
    parts(t, pos) {
      const q = 5 / 2;
      const k = q / (q + 2);
      const R = 1;
      const n = 3;
      t /= 3;
      for (let i = 0; i < n; i++) {
        let v = i * 30 / n + t;
        spawnParticle(
          R * (k * Math.cos(v) * Math.cos(k * v) + Math.sin(v) * Math.sin(k * v)) + pos[0],
          R * Math.sqrt(1 - k * k) * Math.cos(k * v) + pos[1],
          R * (k * Math.sin(v) * Math.cos(k * v) - Math.cos(v) * Math.sin(k * v)) + pos[2],
          0.2, 0.8, 0.16,
          20
        );
      }
    }
  },
  'ewogICJ0aW1lc3RhbXAiIDogMTY0NjY4NzMyNjQzMiwKICAicHJvZmlsZUlkIiA6ICI0MWQzYWJjMmQ3NDk0MDBjOTA5MGQ1NDM0ZDAzODMxYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZWdha2xvb24iLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvOWQyYmY5ODY0NzIwZDg3ZmQwNmI4NGVmYTgwYjc5NWM0OGVkNTM5YjE2NTIzYzNiMWYxOTkwYjQwYzAwM2Y2YiIKICAgIH0KICB9Cn0=': {
    duration: 20 * 3 * 60,
    range: 40 ** 2,
    stats: [
      '§b+50% ✎',
      '§4+20 ♨',
      '§f+20 ❂',
      '§c+10 ⫽'
    ],
    prio: 4,
    /**
     * @param {number} t
     * @param {[number, number, number]} pos
     */
    parts(t, pos) {
      const n = 3 / 5;
      const R = 1;
      const k = 3;
      t /= 5;
      for (let i = 0; i < k; i++) {
        let v = i * 30 / n + t;
        spawnParticle(
          R * Math.cos(n * v) * Math.cos(v) + pos[0],
          R * Math.sin(n * v) + pos[1],
          R * Math.cos(n * v) * Math.sin(v) + pos[2],
          0, 0.5, 1,
          20
        );
      }
    }
  },
  'ewogICJ0aW1lc3RhbXAiIDogMTY0NjY4NzM0NzQ4OSwKICAicHJvZmlsZUlkIiA6ICI0MWQzYWJjMmQ3NDk0MDBjOTA5MGQ1NDM0ZDAzODMxYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZWdha2xvb24iLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYzAwNjJjYzk4ZWJkYTcyYTZhNGI4OTc4M2FkY2VmMjgxNWI0ODNhMDFkNzNlYTg3YjNkZjc2MDcyYTg5ZDEzYiIKICAgIH0KICB9Cn0=': {
    duration: 20 * 3 * 60,
    range: 40 ** 2,
    stats: [
      '§b+125% ✎',
      '§4+30 ♨',
      '§f+25 ❂',
      '§c+10 ⫽',
      '§e+5 ⚔'
    ],
    prio: 6,
    /**
     * @param {number} t
     * @param {[number, number, number]} pos
     */
    parts(t, pos) {
      const a = 1;
      const b = 1;
      const p = 2;
      const q = 3;
      const u = 60 * Math.PI / 180;
      const v = 20 * Math.PI / 180;
      const n = 4;
      t /= 10;
      for (let i = 0; i < n; i++) {
        let o = 2 * Math.PI * i / n;
        spawnParticle(
          a * Math.sin(p * t + u + o) + pos[0],
          b * Math.sin(t) + pos[1],
          a * Math.sin(q * t + v + o) + pos[2],
          0.6, 0.1, 0.8,
          20
        );
      }
    }
  }
};
/** @type {Deployable[]} */
let deployables = [];
/** @type {{ x: number, y: number, z: number, isFlux: boolean }?} */
let ownDeployLoc;
/** @type {StateVar<Deployable?>} */
const stateActiveDeploy = new StateVar(null);

/** @type {Deployable} */
const DUMMY_DEPLOYABLE = {
  ent: null,
  id: 'PLASMAFLUX_POWER_ORB',
  isFlux: true,
  prio: DEPLOYABLE_DATA.PLASMAFLUX_POWER_ORB.prio,
  range: DEPLOYABLE_DATA.PLASMAFLUX_POWER_ORB.range,
  stats: DEPLOYABLE_DATA.PLASMAFLUX_POWER_ORB.stats,
  ttl: DEPLOYABLE_DATA.PLASMAFLUX_POWER_ORB.duration,
  isOwn: true,
  y: 60
};
const display = createTextGui(() => data.deployableHUDLoc, () => {
  const timer = `${settings.deployableHUDColorTimer ? colorForNumber(DUMMY_DEPLOYABLE.ttl, DEPLOYABLE_DATA[DUMMY_DEPLOYABLE.id].duration) : '&e'}${Math.ceil(DUMMY_DEPLOYABLE.ttl / 20).toFixed(0)}s`;
  if (settings.deployableHUD === 'Compact') return [timer];
  return [timer, ...DUMMY_DEPLOYABLE.stats];
});
const stateHUD = new StateProp(settings._deployableHUD).notequals('None');

/**
 * @param {Deployable} d
 * @param {import('../data').Location} loc top right corner im lazy ok
 * @link https://github.com/BiscuitDevelopment/SkyblockAddons/blob/dd200826f5d82531ab2dbdaefd1fac17cef01c1e/src/main/java/codes/biscuit/skyblockaddons/listeners/RenderListener.java#L2493
 * */
function renderDeployable(d, loc) {
  if (!d.ent) return;

  const origRenderYawOffset = d.ent.field_70761_aq;
  const origPrevRenderYawOffset = d.ent.field_70760_ar;

  GlStateManager2.pushMatrix();
  GlStateManager2.enableDepth();
  GlStateManager2.enableColorMaterial();
  GlStateManager2.translate(loc.x - 15, loc.y + 45, 50);
  GlStateManager2.scale(-25, 25, 25);
  GlStateManager2.rotate(180, 0, 0, 1);
  // GlStateManager2.rotate(135, 0, 1, 0);
  net.minecraft.client.renderer.RenderHelper.func_74519_b();
  // GlStateManager2.rotate(-135, 0, 1, 0);
  GlStateManager2.rotate(22, 1, 0, 0);

  const renderManager = Client.getMinecraft().func_175598_ae();
  renderManager.func_178631_a(180);
  const shadowsEnabled = renderManager.func_178627_a();
  renderManager.func_178633_a(false);

  d.ent.func_82142_c(true);
  const yaw = (Date.now() % 1750) / 1750 * 360;
  d.ent.field_70761_aq = yaw;
  d.ent.field_70760_ar = yaw;

  renderManager.func_147940_a(d.ent, 0, 0, 0, 0, 1);

  renderManager.func_178633_a(shadowsEnabled);
  net.minecraft.client.renderer.RenderHelper.func_74518_a();

  GlStateManager2.disableRescaleNormal();
  // needed for some reason
  GlStateManager2.setActiveTexture(net.minecraft.client.renderer.OpenGlHelper.field_77476_b);
  GlStateManager2.disableTexture2D();
  GlStateManager2.setActiveTexture(net.minecraft.client.renderer.OpenGlHelper.field_77478_a);
  GlStateManager2.popMatrix();

  d.ent.field_70761_aq = origRenderYawOffset;
  d.ent.field_70760_ar = origPrevRenderYawOffset;
}
display.on('editRender', () => {
  renderDeployable(DUMMY_DEPLOYABLE, display.getTrueLoc());
});
const renderReg = reg('renderOverlay', () => {
  display.render();
  renderDeployable(stateActiveDeploy.get(), display.getTrueLoc());
}).setEnabled(stateHUD.and(stateActiveDeploy));
const tickCalcActiveReg = reg('tick', () => {
  const d = deployables.reduce((a, v) => {
    if (a && a.prio > v.prio) return a;
    if ((
      (Player.getX() - v.ent.field_70165_t) ** 2 +
      (Player.getY() - v.ent.field_70163_u) ** 2 +
      (Player.getZ() - v.ent.field_70161_v) ** 2
    ) > v.range) return a;
    if (!a) return v;
    if (v.prio > a.prio) return v;
    if (v.id !== a.id) {
      if (v.isOwn) return v;
      if (a.isOwn) return a;
      return v.id === 'PLASMAFLUX_POWER_ORB' ? a : v;
    }
    return v.ttl > a.ttl ? v : a;
  }, null);
  stateActiveDeploy.set(d);
  if (d) {
    const timer = `${settings.deployableHUDColorTimer ? colorForNumber(d.ttl, DEPLOYABLE_DATA[d.id].duration) : '&e'}${Math.ceil(d.ttl / 20).toFixed(0)}s`;
    if (settings.deployableHUD === 'Compact') display.setLine(timer);
    else display.setLines([timer, ...d.stats]);
  }
}).setEnabled(stateHUD);

const knownEEnts = new (Java.type('java.util.WeakHashMap'))();
const knownNEnts = new (Java.type('java.util.WeakHashMap'))();
const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const serverTickReg = reg('serverTick2', () => {
  for (let i = deployables.length - 1; i >= 0; i--) {
    if (--deployables[i].ttl <= 0) {
      if (deployables[i].isOwn) ownDeployLoc = null;
      deployables.splice(i, 1);
    } else if (deployables[i].ent.field_70128_L) deployables.splice(i, 1);
  }
});
const equipmentReg = reg('packetReceived', (pack, doDupe) => {
  if (pack.func_149388_e() !== 4) return;
  const ent = World.getWorld().func_73045_a(pack.func_149389_d());
  if (!ent) {
    if (doDupe) Client.scheduleTask(2, () => equipmentReg.forceTrigger(pack, Number.isInteger(doDupe) ? doDupe - 1 : 10));
    return;
  }
  if (!(ent instanceof EntityArmorStand)) return;
  if (knownEEnts.containsKey(ent)) return;
  knownEEnts.put(ent, 0);

  const nbt = pack.func_149390_c()?.func_77978_p();
  if (!nbt) return;

  const exAt = nbt.func_74775_l('ExtraAttributes');
  const sbId = exAt?.func_74779_i('id');
  if (sbId) {
    const data = DEPLOYABLE_DATA[sbId];
    if (!data) return;
    let stats = data.stats;
    if (exAt.func_74762_e('jalapeno_count')) stats = [...stats, '§9+5 ☠', '§9+1 ☣'];
    deployables.push({
      ent,
      id: sbId,
      isFlux: true,
      prio: data.prio,
      range: data.range,
      stats,
      ttl: data.duration,
      isOwn: ownDeployLoc && ownDeployLoc.isFlux && dist(ownDeployLoc.x, ent.field_70165_t) < 1 && dist(ownDeployLoc.y - 1, ent.field_70163_u) < 1 && dist(ownDeployLoc.z, ent.field_70161_v) < 1,
      y: ent.field_70163_u + 1
    });
    return;
  }

  // SkullOwner.Id changes :/
  const txId = nbt.func_74775_l('SkullOwner')?.func_74775_l('Properties')?.func_150295_c('textures', 10)?.func_150305_b(0)?.func_74779_i('Value');
  if (!txId) return;

  const data = DEPLOYABLE_DATA[txId];
  if (!data) return;
  let stats = data.stats;
  if (settings.deployableAssumeJalapeno) stats = [...stats, '§9+5 ☠', '§9+1 ☣'];
  deployables.push({
    ent,
    id: txId,
    isFlux: false,
    prio: data.prio,
    range: data.range,
    stats,
    ttl: data.duration,
    isOwn: ownDeployLoc && !ownDeployLoc.isFlux && dist(ownDeployLoc.x, ent.field_70165_t) < 1 && ownDeployLoc.y < ent.field_70163_u && ownDeployLoc + 10 > ent.field_70163_u && dist(ownDeployLoc.z, ent.field_70161_v) < 1,
    y: ent.field_70163_u
  });
}).setFilteredClass(net.minecraft.network.play.server.S04PacketEntityEquipment);
const soundReg = reg('soundPlay', (pos, name, vol, pit) => {
  if (name === 'random.wood_click') {
    if (vol !== 0.5) return;
    if (compareFloat(pit, 0.841269850730896, 1e-10) !== 0) return;
    if (
      dist(Player.getX(), pos.x) > 1 ||
      dist(Player.getY(), pos.y) > 1 ||
      dist(Player.getZ(), pos.z) > 1
    ) return;
    ownDeployLoc = { x: pos.x, y: pos.y, z: pos.z, isFlux: true };
  } else if (name === 'fireworks.launch') {
    if (vol !== 3) return;
    if (pit !== 1) return;
    if (
      dist(Player.getX(), pos.x) > 1 ||
      dist(Player.getY() + 1.5, pos.y) > 1 ||
      dist(Player.getZ(), pos.z) > 1
    ) return;
    ownDeployLoc = { x: pos.x, y: pos.y, z: pos.z, isFlux: false };
  }
});
const unloadReg = reg('worldUnload', () => {
  deployables = [];
  ownDeployLoc = null;
  stateActiveDeploy.set(null);
});
function cancelPart(d, evn) {
  if (!d) return cancel(evn);
  if (d.isOwn) {
    if (settings.deployableParticlesOwn !== 'Default') cancel(evn);
  } else if (settings.deployableParticlesOther !== 'Default') cancel(evn);
}
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const partSpawnReg = reg('packetReceived', (pack, evn) => {
  const type = pack.func_179749_a();
  if (type.equals(EnumParticleTypes.FLAME)) {
    if (pack.func_149222_k() !== 11 || compareFloat(pack.func_149227_j(), 0.35) !== 0) return;
    const x = pack.func_149220_d();
    const y = pack.func_149226_e();
    const z = pack.func_149225_f();
    const d = deployables.find(v => !v.isFlux && dist(x, v.ent.field_70165_t) < 0.1 && dist(y, v.ent.field_70163_u) < 3 && dist(z, v.ent.field_70161_v) < 0.1);
    return cancelPart(d, evn);
  }
  if (type.equals(EnumParticleTypes.VILLAGER_HAPPY)) {
    if (pack.func_149227_j() !== 0) return;
    const cnt = pack.func_149222_k();
    if (cnt === 4) {
      if (compareFloat(0.3, pack.func_149221_g()) !== 0) return;
      return cancelPart(null, evn);
    }
    if (cnt !== 1) return;
    const x = pack.func_149220_d();
    const y = pack.func_149226_e();
    const z = pack.func_149225_f();
    const d = deployables.find(v => v.id === 'RADIANT_POWER_ORB' && dist(x, v.ent.field_70165_t) < 1.1 && dist(y, v.ent.field_70163_u) < 3 && dist(z, v.ent.field_70161_v) < 1.1);
    return cancelPart(d, evn);
  }
  if (type.equals(EnumParticleTypes.REDSTONE)) {
    if (pack.func_149227_j() !== 1) return;
    if (pack.func_149222_k() !== 0) return;
    const r = pack.func_149221_g();
    const g = pack.func_149224_h();
    const b = pack.func_149223_i();
    const a = [
      [0.42352941632270813, 0.7803921699523926, 0.9215686321258545, ['MANA_FLUX_POWER_ORB']],
      [0.7372549176216125, 0.14509804546833038, 0.14509804546833038, ['OVERFLUX_POWER_ORB']],
      [0.23137255012989044, 0.054901961237192154, 0.21568627655506134, ['OVERFLUX_POWER_ORB', 'PLASMAFLUX_POWER_ORB']],
      [0.05098039284348488, 0.0235294122248888, 0.0235294122248888, ['PLASMAFLUX_POWER_ORB']],
      [0.4156862795352936, 0.19607843458652496, 0.5803921818733215, ['PLASMAFLUX_POWER_ORB']],
    ].find(v => compareFloat(r, v[0]) === 0 && compareFloat(g, v[1]) === 0 && compareFloat(b, v[2]) === 0);
    if (!a) return;
    const x = pack.func_149220_d();
    const y = pack.func_149226_e();
    const z = pack.func_149225_f();
    const d = deployables.find(v => a[3].includes(v.id) && dist(x, v.ent.field_70165_t) < 1.1 && dist(y, v.ent.field_70163_u) < 3 && dist(z, v.ent.field_70161_v) < 1.1);
    return cancelPart(d, evn);
  }
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(new StateProp(settings._deployableParticlesOwn).notequals('Default').or(new StateProp(settings._deployableParticlesOther).notequals('Default')));
const partTickReg = reg('tick', () => {
  deployables.forEach(v => {
    if (v.isOwn) {
      if (settings.deployableParticlesOwn !== 'Custom') return;
    } else if (settings.deployableParticlesOther !== 'Custom') return;
    const t = DEPLOYABLE_DATA[v.id].duration - v.ttl;
    // .spawnParticle throws errors very cool ty
    try {
      DEPLOYABLE_DATA[v.id].parts(t, [v.ent.field_70165_t, v.y + 1.7, v.ent.field_70161_v], v.ent.field_70163_u + 1.8);
    } catch (_) { }
  });
}).setEnabled(new StateProp(settings._deployableParticlesOwn).equals('Custom').or(new StateProp(settings._deployableParticlesOther).equals('Custom')));

export function init() {
  settings._moveDeployableHUD.onAction(() => display.edit());
}
export function load() {
  knownEEnts.clear();
  knownNEnts.clear();
  deployables = [];
  ownDeployLoc = null;
  stateActiveDeploy.set(null);

  renderReg.register();
  tickCalcActiveReg.register();
  serverTickReg.register();
  equipmentReg.register();
  soundReg.register();
  unloadReg.register();
  partSpawnReg.register();
  partTickReg.register();
}
export function unload() {
  renderReg.unregister();
  tickCalcActiveReg.unregister();
  serverTickReg.unregister();
  equipmentReg.unregister();
  soundReg.unregister();
  unloadReg.unregister();
  partSpawnReg.unregister();
  partTickReg.unregister();
}