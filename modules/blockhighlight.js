import { getRenderX, getRenderY, getRenderZ, renderBoxFilled, renderBoxOutline } from '../../Apelles/index';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { fastDistance } from '../util/math';
import { stateSinglePlayer } from '../util/mc';
import reg from '../util/registerer';
import { getSbId } from '../util/skyblock';
import { StateProp, StateVar } from '../util/state';
import { isFakeAotv, stateAOTVSim } from './singleplayer';

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

  if (stateSinglePlayer.get()) {
    if (stateAOTVSim.get() && isFakeAotv(stack)) etherDistance = 57 + settings.singlePlayerAOTVTuners;
  } else {
    var id = getSbId(item);
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
  }

  itemCache.put(stack, etherDistance);
  if (id === 'ETHERWARP_CONDUIT') etherDistance = -etherDistance;
}).setEnabled(settings._blockHighlightCheckEther);

const MovingObjectTypeBLOCK = Java.type('net.minecraft.util.MovingObjectPosition').MovingObjectType.BLOCK;
const MovingObjectTypeENTITY = Java.type('net.minecraft.util.MovingObjectPosition').MovingObjectType.ENTITY;
const RaycastHelper = Java.type('com.perseuspotter.chicktilshelper.RaycastHelper');
const BlockRegistry = Java.type('com.perseuspotter.chicktilshelper.BlockRegistry');
const highlightReg = reg(net.minecraftforge.client.event.DrawBlockHighlightEvent, evn => {
  cancel(evn);

  if (evn.target.field_72313_a === MovingObjectTypeENTITY) {
    stateCanEther.set(true);
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

  const w = World.getWorld();
  if (
    settings.blockHighlightCheckEther &&
    etherDistance > 0 &&
    (isConduit || Player.isSneaking()) &&
    (
      settings.blockHighlightEtherCheeto ||
      evn.target.field_72313_a !== MovingObjectTypeBLOCK ||
      BlockRegistry.isInert(w.func_180495_p(evn.target.func_178782_a()).func_177230_c())
    )
  ) {
    let result = RaycastHelper.raycast(Player.getPlayer(), Tessellator.partialTicks, 0, etherDistance);
    if (!result) {
      stateCanEther.set(false);
      etherReasonDisplay.setLine('&4Can\'t TP: Too far!');
      result = RaycastHelper.raycast(Player.getPlayer(), Tessellator.partialTicks, etherDistance, maxEtherDist);
    } else {
      const blockAbove = w.func_180495_p(result.func_177982_a(0, 1, 0)).func_177230_c();
      const twoBlockAbove = w.func_180495_p(result.func_177982_a(0, 2, 0)).func_177230_c();
      if (!BlockRegistry.isBasicallyAir(blockAbove) || !BlockRegistry.isBasicallyAir(twoBlockAbove)) {
        stateCanEther.set(false);
        etherReasonDisplay.setLine('&4Can\'t TP: No air above!');
      } else stateCanEther.set(true);
    }

    if (stateCanEther.get()) tryHighlightBlock(
      result,
      settings.blockHighlightEtherWireColor,
      settings.blockHighlightEtherFillColor,
      settings.blockHighlightEtherWireWidth,
      true
    );
    else if (result) tryHighlightBlock(
      result,
      settings.blockHighlightCantEtherWireColor,
      settings.blockHighlightCantEtherFillColor,
      settings.blockHighlightCantEtherWireWidth,
      true
    );
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

const MaterialAir = Java.type('net.minecraft.block.material.Material').field_151579_a;
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