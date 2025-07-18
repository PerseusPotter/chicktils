import { getRenderX, getRenderY, getRenderZ, renderBoxFilled, renderBoxOutline } from '../../Apelles/index';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { fastDistance } from '../util/math';
import { getEyeHeight } from '../util/mc';
import reg from '../util/registerer';
import { getSbId } from '../util/skyblock';
import { StateProp, StateVar } from '../util/state';

let etherDistance = 0;
let maxEtherDist = 0;
const etherReasonDisplay = createTextGui(() => ({ a: 0, c: 3, s: 4 / Renderer.screen.getScale(), x: Renderer.screen.getWidth() / 2, y: Renderer.screen.getHeight() / 2 - 20, b: true }));
const stateCanEther = new StateVar(false);
let isConduit = false;

const itemCache = new (Java.type('java.util.WeakHashMap'))();
const tickReg = reg('tick', () => {
  maxEtherDist = fastDistance(256, (Client.settings.video.getRenderDistance() + 1) << 4);

  etherDistance = 0;
  const item = Player.getHeldItem();
  isConduit = false;
  if (!item) return;

  const stack = item.itemStack;
  let dist = itemCache.get(stack);
  if (dist < 0) {
    isConduit = true;
    dist = -dist;
  }
  if (dist !== null) return etherDistance = dist;

  const id = getSbId(item);
  if (['ETHERWARP_CONDUIT', 'ASPECT_OF_THE_VOID', 'ASPECT_OF_THE_END'].includes(id)) {
    const tag = stack.func_77978_p().func_74775_l('display');
    const lore = tag.func_150295_c('Lore', 8);
    for (let i = 0; i < lore.func_74745_c(); i++) {
      let m = lore.func_150307_f(i).match(/^§7(?:up )?to §a(\d\d) blocks §7away\.$/);
      if (m) {
        etherDistance = +m[1];
        break;
      }
    }
    if (id === 'ETHERWARP_CONDUIT') {
      isConduit = true;
      etherDistance = -etherDistance;
    }
  }

  itemCache.put(stack, etherDistance);
  if (id === 'ETHERWARP_CONDUIT') etherDistance = -etherDistance;
}).setEnabled(settings._blockHighlightCheckEther);

const MovingObjectTypeBLOCK = Java.type('net.minecraft.util.MovingObjectPosition').MovingObjectType.BLOCK;
const MovingObjectTypeENTITY = Java.type('net.minecraft.util.MovingObjectPosition').MovingObjectType.ENTITY;
const MaterialAir = Java.type('net.minecraft.block.material.Material').field_151579_a;
const BlocksAir = Java.type('net.minecraft.init.Blocks').field_150350_a;
const BlocksCarpet = Java.type('net.minecraft.init.Blocks').field_150404_cg;
const BlocksSkull = Java.type('net.minecraft.init.Blocks').field_150465_bP;
const BlocksSnowLayer = Java.type('net.minecraft.init.Blocks').field_150431_aC;
const BlocksFlowerPot = Java.type('net.minecraft.init.Blocks').field_150457_bL;
const BlocksWallSign = Java.type('net.minecraft.init.Blocks').field_150444_as;
const BlocksStandingSign = Java.type('net.minecraft.init.Blocks').field_150472_an;
const BlocksDoublePlant = Java.type('net.minecraft.init.Blocks').field_150398_cm;
const highlightReg = reg(net.minecraftforge.client.event.DrawBlockHighlightEvent, evn => {
  cancel(evn);

  if (evn.target.field_72313_a === MovingObjectTypeENTITY) {
    if (!settings.blockHighlightBoxEntity) return;
    const ent = evn.target.field_72308_g;
    renderBlockHighlight(
      ent.func_174813_aQ()
        .func_72317_d(
          (ent.field_70165_t - ent.field_70169_q) * evn.partialTicks,
          (ent.field_70163_u - ent.field_70167_r) * evn.partialTicks,
          (ent.field_70161_v - ent.field_70166_s) * evn.partialTicks
        )
        .func_72314_b(0.002, 0.002, 0.002)
        .func_72317_d(-getRenderX(), -getRenderY(), -getRenderZ()),
      settings.blockHighlightWireColor,
      settings.blockHighlightFillColor,
      settings.blockHighlightWireWidth,
      false
    );
    return;
  }

  if (settings.blockHighlightCheckEther && etherDistance > 0 && (isConduit || Player.isSneaking())) {
    let result = raycast(Player.getPlayer(), 1, 0, etherDistance, 0.1);
    if (!result) {
      stateCanEther.set(false);
      etherReasonDisplay.setLine('&4Can\'t TP: Too far!');
      result = raycast(Player.getPlayer(), 1, etherDistance, maxEtherDist, 0.1);
    } else {
      const [blockPos, state] = result;
      const block = state.func_177230_c();
      const w = World.getWorld();
      if (
        !block.func_149703_v() ||
        block === BlocksCarpet || block === BlocksSkull || block == BlocksSnowLayer || block === BlocksFlowerPot ||
        (
          block.func_180640_a(w, blockPos, state) === null &&
          block !== BlocksWallSign && block !== BlocksStandingSign
        )
      ) {
        stateCanEther.set(false);
        etherReasonDisplay.setLine('&4Can\'t TP: Not solid!');
      } else {
        const blockPosAbove = blockPos.func_177982_a(0, 1, 0);
        const stateAbove = w.func_180495_p(blockPosAbove)
        const blockAbove = stateAbove.func_177230_c();
        const twoBlockAbove = w.func_180495_p(blockPos.func_177982_a(0, 2, 0)).func_177230_c();
        if (
          (
            blockAbove !== BlocksAir && blockAbove !== BlocksCarpet && blockAbove !== BlocksSkull && blockAbove !== BlocksSnowLayer && blockAbove !== BlocksFlowerPot &&
            blockAbove.func_149703_v() &&
            blockAbove.func_180640_a(w, blockPosAbove, stateAbove) !== null
          ) ||
          blockAbove === BlocksWallSign || block === BlocksStandingSign ||
          (twoBlockAbove !== BlocksAir && twoBlockAbove !== BlocksDoublePlant && twoBlockAbove !== BlocksCarpet && twoBlockAbove !== BlocksSkull && twoBlockAbove !== BlocksSnowLayer && twoBlockAbove !== BlocksFlowerPot)
        ) {
          stateCanEther.set(false);
          etherReasonDisplay.setLine('&4Can\'t TP: No air above!');
        } else stateCanEther.set(true);
      }
    }

    if (stateCanEther.get()) tryHighlightBlock(
      result[0],
      settings.blockHighlightEtherWireColor,
      settings.blockHighlightEtherFillColor,
      settings.blockHighlightEtherWireWidth,
      true
    );
    else if (result) tryHighlightBlock(
      result[0],
      settings.blockHighlightCantEtherWireColor,
      settings.blockHighlightCantEtherFillColor,
      settings.blockHighlightCantEtherWireWidth,
      true
    );

    return;
  } else stateCanEther.set(true);

  if (evn.target.field_72313_a !== MovingObjectTypeBLOCK) return;
  tryHighlightBlock(
    evn.target.func_178782_a(),
    settings.blockHighlightWireColor,
    settings.blockHighlightFillColor,
    settings.blockHighlightWireWidth,
    false
  );
});

const renderReg = reg('renderOverlay', () => etherReasonDisplay.render()).setEnabled(new StateProp(stateCanEther).not().and(settings._blockHighlightCantEtherShowReason).and(settings._blockHighlightCheckEther));

const Vector3f = Java.type('org.lwjgl.util.vector.Vector3f');
const MCBlockPos = Java.type('net.minecraft.util.BlockPos');
/**
 * @link https://github.com/NotEnoughUpdates/NotEnoughUpdates/blob/70df0c0f96da20c0da74929e3e709121357b3fb9/src/main/java/io/github/moulberry/notenoughupdates/miscfeatures/CustomItemEffects.java#L578
 */
function raycast(player, pt, minDist, maxDist, step) {
  const pos = new Vector3f(player.field_70165_t, player.field_70163_u + getEyeHeight(player), player.field_70161_v);
  const lookVec3 = player.func_70676_i(pt);
  const look = new Vector3f(lookVec3.field_72450_a, lookVec3.field_72448_b, lookVec3.field_72449_c);
  if (minDist > 0) {
    look.scale(minDist / look.length());
    Vector3f.add(pos, look, pos);
  }
  look.scale(step / look.length());
  const stepCount = Math.ceil(maxDist / step);
  const w = World.getWorld();
  for (let i = 0; i < stepCount; i++) {
    Vector3f.add(pos, look, pos);
    let blockPos = new MCBlockPos(pos.x, pos.y, pos.z);
    let state = w.func_180495_p(blockPos);
    if (state.func_177230_c() !== BlocksAir) {
      Vector3f.sub(pos, look, pos);
      look.scale(0.1);
      for (let j = 0; j < 10; j++) {
        Vector3f.add(pos, look, pos);
        let blockPos2 = new MCBlockPos(pos.x, pos.y, pos.z);
        let state2 = w.func_180495_p(blockPos2);
        if (state2.func_177230_c() !== BlocksAir) return [blockPos2, state2];
      }
      return [blockPos, state];
    }
  }
  return null;
}

function tryHighlightBlock(blockPos, cw, cf, lw, isEther) {
  const w = World.getWorld();
  const block = w.func_180495_p(blockPos).func_177230_c();

  if (block.func_149688_o() === MaterialAir) return;
  if (!w.func_175723_af().func_177746_a(blockPos)) return;

  block.func_180654_a(w, blockPos);
  const aabb = block.func_180646_a(w, blockPos)
    .func_72314_b(0.01, 0.01, 0.01)
    .func_72317_d(-getRenderX(), -getRenderY(), -getRenderZ());
  renderBlockHighlight(aabb, cw, cf, lw, isEther);
}

function renderBlockHighlight(aabb, cw, cf, lw, isEther) {
  const x = aabb.field_72340_a + getRenderX();
  const y = aabb.field_72338_b + getRenderY();
  const z = aabb.field_72339_c + getRenderZ();
  const wx = aabb.field_72336_d - aabb.field_72340_a;
  const h = aabb.field_72337_e - aabb.field_72338_b;
  const wz = aabb.field_72334_f - aabb.field_72339_c;

  renderBoxFilled(
    cf,
    x, y, z,
    wx, h,
    { centered: false, wz }
  );

  renderBoxOutline(
    cw,
    x, y, z,
    wx, h,
    { centered: false, wz, lw, phase: isEther, smooth: true }
  );
}

export function init() { }
export function load() {
  tickReg.register();
  highlightReg.register();
  renderReg.register();
}
export function unload() {
  tickReg.unregister();
  highlightReg.unregister();
  renderReg.unregister();
}