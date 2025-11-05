import settings from '../settings';
import { createS08PacketPlayerPosLook } from '../util/helper';
import { getBlockPos, getItemId, getLastReportedPit, getLastReportedX, getLastReportedY, getLastReportedYaw, getLastReportedZ, getServerSneakState, stateSinglePlayer } from '../util/mc';
import reg from '../util/registerer';
import { StateProp } from '../util/state';
import { unrun } from '../util/threading';

const executor = Java.type('java.util.concurrent.Executors').newSingleThreadScheduledExecutor();
const MS = Java.type('java.util.concurrent.TimeUnit').MILLISECONDS;
function submitPacket(packet) {
  if (settings.singlePlayerPing === 0) Client.scheduleTask(() => packet.func_148833_a(Client.getConnection()));
  else executor['schedule(java.lang.Runnable,long,java.util.concurrent.TimeUnit)'](
    () => Client.scheduleTask(() => packet.func_148833_a(Client.getConnection())),
    settings.singlePlayerPing,
    MS
  );
}

const stateSpeed = new StateProp(settings._singlePlayerSpeed).notequals(0).and(stateSinglePlayer);
const SharedMonsterAttributes = Java.type('net.minecraft.entity.SharedMonsterAttributes');
const playerAbilityReg = reg('packetReceived', pack => {
  pack.func_149110_b(Math.max(100, settings.singlePlayerSpeed) / 1000);
}).setFilteredClass(net.minecraft.network.play.server.S39PacketPlayerAbilities).setEnabled(stateSpeed);
const packetSpeedReg = reg('tick', () => {
  if (!Player.getPlayer()) return;
  Player.getPlayer().field_71075_bZ.func_82877_b(settings.singlePlayerSpeed / 1000);
  Player.getPlayer().func_110148_a(SharedMonsterAttributes.field_111263_d).func_111128_a(settings.singlePlayerSpeed / 1000);
}).setEnabled(stateSpeed);

const S1DPacketEntityEffect = Java.type('net.minecraft.network.play.server.S1DPacketEntityEffect');
const S1EPacketRemoveEntityEffect = Java.type('net.minecraft.network.play.server.S1EPacketRemoveEntityEffect');
const MCPotionEffect = Java.type('net.minecraft.potion.PotionEffect');
const packetEffectReg = reg('step', () => {
  unrun(() => {
    if (!Player.getPlayer()) return;
    new S1DPacketEntityEffect(
      Player.getPlayer().func_145782_y(),
      new MCPotionEffect(
        8,
        32767,
        settings.singlePlayerJumpBoost - 1,
        false,
        true
      )
    ).func_148833_a(Client.getConnection());
  });
}).setDelay(5).setEnabled(new StateProp(settings._singlePlayerJumpBoost).notequals(0).and(stateSinglePlayer));
settings._singlePlayerJumpBoost.listen(v => {
  if (v === 0 && stateSinglePlayer.get()) unrun(() => {
    new S1EPacketRemoveEntityEffect(
      Player.getPlayer().func_145782_y(),
      new MCPotionEffect(
        8,
        0,
        0,
        false,
        true
      )
    ).func_148833_a(Client.getConnection());
  });
});

export const stateAOTVSim = new StateProp(settings._singlePlayerAOTV).and(stateSinglePlayer);
/**
 * @param {import('../../@types/External').JavaClass<'net.minecraft.item.ItemStack'>} stack
 * @returns {boolean}
 */
export function isFakeAotv(stack) {
  const name = stack.func_82833_r();
  const id = getItemId(stack);
  return (
    ((name === 'AOTV' || name === 'Aspect of the Void') && id === 'minecraft:diamond_shovel') ||
    ((name === 'AOTE' || name === 'Aspect of the End') && id === 'minecraft:diamond_sword')
  );
}
const RaycastHelper = Java.type('com.perseuspotter.chicktilshelper.RaycastHelper');
const BlockRegistry = Java.type('com.perseuspotter.chicktilshelper.BlockRegistry');
const aotvSimReg = reg('packetSent', pack => {
  if (pack.func_149568_f() !== 255) return;
  const stack = pack.func_149574_g();
  if (!stack) return;
  if (!isFakeAotv(stack)) return;

  const x = getLastReportedX();
  const y = getLastReportedY();
  const z = getLastReportedZ();
  const pit = -(getLastReportedPit() + 90) * Math.PI / 180;
  const yaw = (getLastReportedYaw() - 90) * Math.PI / 180;
  const dx = Math.cos(yaw) * Math.sin(pit);
  const dy = Math.cos(pit);
  const dz = Math.sin(yaw) * Math.sin(pit);
  const w = World.getWorld();
  let pos;
  if (getServerSneakState()) {
    const dist = 57 + settings.singlePlayerAOTVTuners;
    const bp = RaycastHelper.raycast(
      x,
      y + 1.62 - 0.08,
      z,
      dx * dist,
      dy * dist,
      dz * dist
    );
    if (!bp) return;
    pos = getBlockPos(bp);
    pos.x += 0.5;
    pos.y++;
    pos.z += 0.5;
    const blockAbove = w.func_180495_p(bp.func_177982_a(0, 1, 0)).func_177230_c();
    const twoBlockAbove = w.func_180495_p(bp.func_177982_a(0, 2, 0)).func_177230_c();
    if (!BlockRegistry.isBasicallyAir(blockAbove) || !BlockRegistry.isBasicallyAir(twoBlockAbove)) return;
    World.getWorld()?.func_72980_b(
      pos.x, pos.y, pos.z,
      'mob.enderdragon.hit',
      1, 0.5396825671195984,
      false
    );
    pos.y += 0.05;
  } else {
    const dist = 8 + settings.singlePlayerAOTVTuners;
    const bp = RaycastHelper.transmission(
      x,
      y + 1.62,
      z,
      dx * dist,
      dy * dist,
      dz * dist
    );
    if (!bp) return;
    pos = getBlockPos(bp);
    pos.x += 0.5;
    pos.y++;
    pos.z += 0.5;
    // haha no wood.click on "blocks in the way" fuck you
    World.getWorld()?.func_72980_b(
      pos.x, pos.y, pos.z,
      'mob.endermen.portal',
      1, 1,
      false
    );
  }

  submitPacket(createS08PacketPlayerPosLook(
    pos.x,
    pos.y,
    pos.z,
    0, 0,
    0b11000
  ));
}).setFilteredClass(net.minecraft.network.play.client.C08PacketPlayerBlockPlacement).setEnabled(stateAOTVSim);

const S12PacketEntityVelocity = Java.type('net.minecraft.network.play.server.S12PacketEntityVelocity');
let lavaDebounce = 5;
const lavaBounceReg = reg('tick', () => {
  if (--lavaDebounce >= 0) return;
  if (Player.getPlayer().func_180799_ab()) {
    lavaDebounce = 5;
    submitPacket(new S12PacketEntityVelocity(
      Player.getPlayer().func_145782_y(),
      Player.getMotionX(),
      3.5,
      Player.getMotionZ()
    ));
  }
}).setEnabled(new StateProp(settings._singlePlayerLavaBounce).and(stateSinglePlayer));

export function init() { }
export function load() {
  playerAbilityReg.register();
  packetSpeedReg.register();
  packetEffectReg.register();
  aotvSimReg.register();
  lavaBounceReg.register();
}
export function unload() {
  playerAbilityReg.unregister();
  packetSpeedReg.unregister();
  packetEffectReg.unregister();
  aotvSimReg.unregister();
  lavaBounceReg.unregister();
}