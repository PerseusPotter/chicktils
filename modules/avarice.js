import data from '../data';
import settings from '../settings';
import createTextGui from '../util/customtextgui';
import { drawArrow3DPos, renderOutline, renderTracer } from '../util/draw';
import { commaNumber } from '../util/format';
import { lerp } from '../util/math';
import { getItemId, getMaxHp } from '../util/mc';
import reg from '../util/registerer';
import { StateProp, StateVar } from '../util/state';
import { run, unrun } from '../util/threading';

const coinCounterEnabled = new StateVar(false);
const coinCounter = createTextGui(() => data.avariceCoinCounterLoc, () => ['&7Coins: &669,426,942']);

const coinRenderReg = reg('renderOverlay', () => coinCounter.render(), 'avarice').setEnabled(new StateProp(settings._avariceShowCoinCounter).and(coinCounterEnabled));
const coinUpdateReg = reg('packetReceived', pack => {
  if (pack.func_149175_c() !== 0 || pack.func_149173_d() !== 5) return;
  coinCounterEnabled.set(Boolean(function() {
    const it = pack.func_149174_e();
    if (!it) return;
    const n = getItemId(it);
    if (n !== 'minecraft:skull') return;
    const extAtt = it.func_77978_p()?.func_74775_l('ExtraAttributes');
    if (extAtt?.func_74779_i('id') !== 'CROWN_OF_AVARICE') return;

    const coins = extAtt.func_74762_e('collected_coins');
    // fuck rhino
    // "toLocaleString is just an alias for toString for now"
    // https://github.com/ChatTriggers/rhino/blob/7c7c5096680e793e6a8f27bb3ed8f1ee3a1d5170/src/main/java/org/mozilla/javascript/NativeNumber.java#L166C17-L166C72
    // coinCounter.setLine('&7Coins: &6' + coins.toLocaleString('en-US'));
    // https://stackoverflow.com/a/2901298
    coinCounter.setLine('&7Coins: &6' + commaNumber(coins));

    return true;
  }()));
}, 'avarice').setFilteredClass(net.minecraft.network.play.server.S2FPacketSetSlot).setEnabled(settings._avariceShowCoinCounter);

const stateIsArachne = new StateVar(0);
const stateDoArachne = new StateProp(settings._avariceArachne).and(stateIsArachne);
const stateArachneRecentDead = new StateVar(false);
const stateArachneLeech = new StateProp(stateArachneRecentDead).not().and(settings._avariceArachne).and(new StateProp(stateIsArachne).equals(0));

const arachneStartReg1 = reg('chat', () => stateIsArachne.set(1), 'avarice').setCriteria('&r&c[BOSS] Arachne&r&f: Ahhhh...A Calling...&r').setEnabled(settings._avariceArachne);
const arachneStartReg2 = reg('chat', () => stateIsArachne.set(2), 'avarice').setCriteria('&r&c[BOSS] Arachne&r&f: So it is time.&r').setEnabled(settings._avariceArachne);
function arachneLeech() {
  stateIsArachne.set(3);
  World.getAllEntities().forEach(v => arachneSpawnReg.forceTrigger(v.entity));
}
const arachneLeechReg1 = reg('chat', arachneLeech, 'avarice').setCriteria('&r&c[BOSS] Arachne&r&f: ').setStart().setEnabled(stateArachneLeech);
const arachneLeechReg2 = reg('chat', arachneLeech, 'avarice').setCriteria('&r&cThe boss is already spawning!&r').setEnabled(stateArachneLeech);
const arachneEndReg = reg('chat', () => {
  stateIsArachne.set(0);
  stateArachneRecentDead.set(true);
}, 'avarice').setCriteria('&r&f                              &r&6&lARACHNE DOWN!&r').setEnabled(settings._avariceArachne);
const arachneLeaveReg = reg('worldUnload', () => {
  stateIsArachne.set(0);
  stateArachneRecentDead.set(false);
  arachneClientTick.register();
}, 'avarice').setEnabled(settings._avariceArachne);

let arachneEnt;
stateIsArachne.listen(v => v || (arachneEnt = null));
let arachneBroodEnts = new (Java.type('java.util.WeakHashMap'))();
let arachnePossBig = [];
let arachnePossSmall = [];
let arachnePossNames = [];

const EntitySpider = Java.type('net.minecraft.entity.monster.EntitySpider');
const EntityCaveSpider = Java.type('net.minecraft.entity.monster.EntityCaveSpider');
const EntityArmorStand = Java.type('net.minecraft.entity.item.EntityArmorStand');
const arachneSpawnReg = reg('spawnEntity', ent => {
  if (settings.avariceArachneHideBroodNames && ent instanceof EntityArmorStand) arachnePossNames.push([5, ent]);
  if (settings.avariceArachneBoxBigSpooder && (!arachneEnt || arachneEnt.field_70128_L) && ent instanceof EntitySpider && !(ent instanceof EntityCaveSpider)) arachnePossBig.push([100, ent]);
  if (settings.avariceArachneBoxSmallSpooders && ent instanceof EntityCaveSpider) arachnePossSmall.push([5, ent]);
}, 'avarice').setEnabled(stateDoArachne);
function arachneTick() {
  run(() => {
    arachnePossBig = arachnePossBig.filter(v => {
      const hp = getMaxHp(v[1]);
      if (
        (stateIsArachne.get() & 1 && (hp === 20_000 || hp === 40_000)) ||
        (stateIsArachne.get() & 2 && (hp === 100_000 || hp === 200_000))
      ) {
        arachneEnt = v[1];
        return false;
      }
      return --v[0] > 0;
    });
    arachnePossSmall = arachnePossSmall.filter(v => {
      const hp = getMaxHp(v[1]);
      if (
        (stateIsArachne.get() & 1 && [4_000, 8_000, 16_000, 32_000].includes(hp)) ||
        (stateIsArachne.get() & 2 && [20_000, 40_000, 80_000, 160_000].includes(hp))
      ) {
        arachneBroodEnts.put(v[1], 0);
        return false;
      }
      return --v[0] > 0;
    });
    arachnePossNames = arachnePossNames.filter(v => {
      const n = v[1].func_70005_c_();
      if (n.includes('Arachne\u0027s Brood')) {
        unrun(() => World.getWorld().func_72900_e(v[1]));
        return false;
      }
      return n === 'Armor Stand' && --v[0] > 0;
    });
  });
}
const arachneClientTick = reg('tick', arachneTick, 'avarice').setEnabled(stateDoArachne.and(settings._avariceArachneHideBroodNames));
const arachneServerTick = reg('serverTick', () => {
  arachneClientTick.unregister();
  arachneTick();
}, 'avarice').setEnabled(stateDoArachne.and(settings._avariceArachneHideBroodNames));

const arachneRenderReg = reg('postRenderEntity', (ent, pos) => {
  const e = ent.entity;
  if (settings.avariceArachneBoxBigSpooder && e === arachneEnt) renderOutline(
    pos.getX(), pos.getY(), pos.getZ(),
    1.5, 1,
    settings.avariceArachneBoxBigSpooderColor, settings.avariceArachneBoxBigSpooderEsp,
    true, 5, true
  );
  if (settings.avariceArachneBoxSmallSpooders && e instanceof EntityCaveSpider && arachneBroodEnts.containsKey(e)) renderOutline(
    pos.getX(), pos.getY(), pos.getZ(),
    0.8, 0.6,
    settings.avariceArachneBoxSmallSpoodersColor, settings.avariceArachneBoxSmallSpoodersEsp,
    true, 5, true
  );
}, 'avarice').setEnabled(stateDoArachne);
const arachneTracerReg = reg('renderWorld', partial => {
  if (arachneEnt && !arachneEnt.field_70128_L) renderTracer(
    settings.avariceArachneBoxBigSpooderColor,
    lerp(arachneEnt.field_70169_q, arachneEnt.field_70165_t, partial),
    lerp(arachneEnt.field_70167_r, arachneEnt.field_70163_u, partial) + 0.5,
    lerp(arachneEnt.field_70166_s, arachneEnt.field_70161_v, partial),
    false
  );
}, 'avarice').setEnabled(stateDoArachne.and(settings._avariceArachneBoxBigSpooderDrawArrow).and(settings._preferUseTracer));
const arachnePointReg = reg('renderOverlay', () => {
  if (arachneEnt && !arachneEnt.field_70128_L) drawArrow3DPos(
    settings.avariceArachneBoxBigSpooderColor,
    lerp(arachneEnt.field_70169_q, arachneEnt.field_70165_t, Tessellator.partialTicks),
    lerp(arachneEnt.field_70167_r, arachneEnt.field_70163_u, Tessellator.partialTicks) + 0.5,
    lerp(arachneEnt.field_70166_s, arachneEnt.field_70161_v, Tessellator.partialTicks),
    false, 5
  );
}, 'avarice').setEnabled(stateDoArachne.and(settings._avariceArachneBoxBigSpooderDrawArrow).and(new StateProp(settings._preferUseTracer).not()));

const stateDoingTara = new StateVar(false);
const stateTaraStarted = new StateVar(0);
const SlayerFeatures = Java.type('gg.skytils.skytilsmod.features.impl.slayer.SlayerFeatures');
const taraHitReg = reg('attackEntity', (ent, evn) => {
  const e = ent.entity;
  if (e instanceof EntityCaveSpider) {
    if (getMaxHp(e) < 1_000_000_000) return;
  } else if (e instanceof EntitySpider) {
    if (getMaxHp(e) !== 2_400_000) return;
  } else return;

  if (
    stateTaraStarted.get() === 0 &&
    !(SlayerFeatures && SlayerFeatures.INSTANCE.getHasSlayerText())
  ) return;

  cancel(evn);
}, 'avarice').setEnabled(new StateProp(stateDoingTara).and(settings._avariceTaraTrader));
const taraStartReg = reg('chat', () => {
  stateDoingTara.set(true);
  stateTaraStarted.set(15);
}, 'avarice').setCriteria('&r   &5&l» &7Slay &c2,000 Combat XP &7worth of Spiders&7.&r').setEnabled(settings._avariceTaraTrader);
const taraLeaveReg = reg('worldUnload', () => {
  stateDoingTara.set(false);
  stateTaraStarted.set(0);
}, 'avarice').setEnabled(new StateProp(stateDoingTara).and(settings._avariceTaraTrader));
const taraServerTickReg = reg('serverTick', () => stateTaraStarted.set(stateTaraStarted.get() - 1), 'avarice').setEnabled(new StateProp(stateTaraStarted).notequals(0));

export function init() {
  settings._moveAvariceCoinCounter.onAction(() => coinCounter.edit());
}
export function load() {
  coinCounterEnabled.set(false);
  stateIsArachne.set(0);
  stateArachneRecentDead.set(false);
  arachneEnt = null;
  arachneBroodEnts.clear();
  arachnePossBig = [];
  arachnePossSmall = [];
  arachnePossNames = [];
  stateDoingTara.set(false);
  stateTaraStarted.set(0);

  coinRenderReg.register();
  coinUpdateReg.register();
  arachneStartReg1.register();
  arachneStartReg2.register();
  arachneLeechReg1.register();
  arachneLeechReg2.register();
  arachneEndReg.register();
  arachneLeaveReg.register();
  arachneSpawnReg.register();
  arachneClientTick.register();
  arachneServerTick.register();
  arachneRenderReg.register();
  arachneTracerReg.register();
  arachnePointReg.register();
  taraHitReg.register();
  taraStartReg.register();
  taraLeaveReg.register();
  taraServerTickReg.register();
}
export function unload() {
  coinRenderReg.unregister();
  coinUpdateReg.unregister();
  arachneStartReg1.unregister();
  arachneStartReg2.unregister();
  arachneLeechReg1.unregister();
  arachneLeechReg2.unregister();
  arachneEndReg.unregister();
  arachneLeaveReg.unregister();
  arachneSpawnReg.unregister();
  arachneClientTick.unregister();
  arachneServerTick.unregister();
  arachneRenderReg.unregister();
  arachneTracerReg.unregister();
  arachnePointReg.unregister();
  taraHitReg.unregister();
  taraStartReg.unregister();
  taraLeaveReg.unregister();
  taraServerTickReg.unregister();
}