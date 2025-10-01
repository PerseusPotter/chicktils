import settings from '../settings';
import { timeToStr } from '../util/format';
import { serialize as _serialize } from '../util/format';
import { base64Encode } from '../util/helper';
import { getBlockId } from '../util/mc';
import { setAccessible } from '../util/polyfill';
import reg from '../util/registerer';
import { wrap } from '../util/threading';

const serialize = o => _serialize(o, 4, { precision: -1 });

/** @type {Set<string>} */
const whitelist = new Set();
/** @type {Set<string>} */
const blacklist = new Set();
/** @type {(s: string) => void} */
let logger = Function.prototype;
let printWriter;
let ioThread;
let startTime = 0;

const formatWatcher = w => w?.map(v => ({
  id: v.func_75672_a(),
  type: v.func_75674_c(),
  value: v.func_75669_b()
}));

const ByteBuf$array = Java.type('io.netty.buffer.ByteBuf').class.getDeclaredMethod('array');
const S21PacketChunkData$getData = net.minecraft.network.play.server.S21PacketChunkData.class.getDeclaredMethod('func_149272_d');
const S26PacketMapChunkBulk$getData = net.minecraft.network.play.server.S26PacketMapChunkBulk.class.getDeclaredMethod('func_149256_c', java.lang.Integer.TYPE);

const C02PacketUseEntity$entityId = setAccessible(net.minecraft.network.play.client.C02PacketUseEntity.class.getDeclaredField('field_149567_a'));
const C0DPacketCloseWindow$windowId = setAccessible(net.minecraft.network.play.client.C0DPacketCloseWindow.class.getDeclaredField('field_149556_a'));
const C13PacketPlayerAbilities$flySpeed = setAccessible(net.minecraft.network.play.client.C13PacketPlayerAbilities.class.getDeclaredField('field_149497_e'));
const C13PacketPlayerAbilities$walkSpeed = setAccessible(net.minecraft.network.play.client.C13PacketPlayerAbilities.class.getDeclaredField('field_149495_f'));
const C15PacketClientSettings$renderDistance = setAccessible(net.minecraft.network.play.client.C15PacketClientSettings.class.getDeclaredField('field_149528_b'));
const C18PacketSpectate$uuid = setAccessible(net.minecraft.network.play.client.C18PacketSpectate.class.getDeclaredField('field_179729_a'));
const C19PacketResourcePackStatus$hash = setAccessible(net.minecraft.network.play.client.C19PacketResourcePackStatus.class.getDeclaredField('field_179720_a'));
const C19PacketResourcePackStatus$status = setAccessible(net.minecraft.network.play.client.C19PacketResourcePackStatus.class.getDeclaredField('field_179719_b'));
const clientReg = reg('packetSent', pack => {
  const name = pack.getClass().getSimpleName();

  if (whitelist.size > 0 && !whitelist.has(name)) return;
  if (blacklist.has(name)) return;

  const t = Date.now();

  /** @type {[string, any][]} */
  const fields = [];
  switch (name) {
    case 'C00PacketKeepAlive':
      fields.push(['id', pack.func_149460_c()]);
      break;
    case 'C01PacketChatMessage':
      fields.push(['message', pack.func_149439_c()]);
      break;
    case 'C02PacketUseEntity':
      fields.push(['entityId', C02PacketUseEntity$entityId.get(pack)]);
      fields.push(['action', pack.func_149565_c().name()]);
      fields.push(['hitVec', pack.func_179712_b()]);
      break;
    case 'C03PacketPlayer':
    case 'C04PacketPlayerPosition':
    case 'C05PacketPlayerLook':
    case 'C06PacketPlayerPosLook':
      if (pack.func_149466_j()) {
        fields.push(['x', pack.func_149464_c()]);
        fields.push(['y', pack.func_149467_d()]);
        fields.push(['z', pack.func_149472_e()]);
      }
      if (pack.func_149463_k()) {
        fields.push(['yaw', pack.func_149462_g()]);
        fields.push(['pitch', pack.func_149470_h()]);
      }
      fields.push(['onGround', pack.func_149465_i()]);
      fields.push(['moving', pack.func_149466_j()]);
      fields.push(['rotating', pack.func_149463_k()]);
      break;
    case 'C07PacketPlayerDigging':
      fields.push(['position', pack.func_179715_a()]);
      fields.push(['facing', pack.func_179714_b().name()]);
      fields.push(['status', pack.func_180762_c().name()]);
      break;
    case 'C08PacketPlayerBlockPlacement':
      fields.push(['position', pack.func_179724_a()]);
      fields.push(['direction', pack.func_149568_f()]);
      fields.push(['directionN', pack.func_149568_f() === 255 ? 'None' : ['UP', 'DOWN', 'NORTH', 'SOUTH', 'WEST', 'EAST'][pack.func_149568_f() % 6]]);
      fields.push(['stack', pack.func_149574_g()]);
      fields.push(['offsetX', pack.func_149573_h()]);
      fields.push(['offsetY', pack.func_149569_i()]);
      fields.push(['offsetZ', pack.func_149575_j()]);
      break;
    case 'C09PacketHeldItemChange':
      fields.push(['hotbarId', pack.func_149614_c()]);
      break;
    case 'C0APacketAnimation':
      break;
    case 'C0BPacketEntityAction':
      fields.push(['action', pack.func_180764_b().name()]);
      fields.push(['auxData', pack.func_149512_e()]);
      break;
    case 'C0CPacketInput':
      fields.push(['strafeSpeed', pack.func_149620_c()]);
      fields.push(['forwardSpeed', pack.func_149616_d()]);
      fields.push(['jumping', pack.func_149618_e()]);
      fields.push(['sneaking', pack.func_149617_f()]);
      break;
    case 'C0DPacketCloseWindow':
      fields.push(['windowId', C0DPacketCloseWindow$windowId.get(pack)]);
      break;
    case 'C0EPacketClickWindow':
      fields.push(['windowId', pack.func_149548_c()]);
      fields.push(['slotId', pack.func_149544_d()]);
      fields.push(['actionId', pack.func_149547_f()]);
      fields.push(['buttonUsed', pack.func_149543_e()]);
      fields.push(['clickedItem', pack.func_149546_g()]);
      fields.push(['mode', pack.func_149542_h()]);
      break;
    case 'C0FPacketConfirmTransaction':
      fields.push(['windowId', pack.func_149532_c()]);
      fields.push(['actionId', pack.func_149533_d()]);
      break;
    case 'C10PacketCreativeInventoryAction':
      fields.push(['slotId', pack.func_149627_c()]);
      fields.push(['stack', pack.func_149625_d()]);
      break;
    case 'C11PacketEnchantItem':
      fields.push(['windowId', pack.func_149539_c()]);
      fields.push(['optionId', pack.func_149537_d()]);
      break;
    case 'C12PacketUpdateSign':
      fields.push(['position', pack.func_179722_a()]);
      fields.push(['lines', pack.func_180768_b()]);
      break;
    case 'C13PacketPlayerAbilities':
      fields.push(['invulnerable', pack.func_149494_c()]);
      fields.push(['flying', pack.func_149488_d()]);
      fields.push(['allowFlying', pack.func_149486_e()]);
      fields.push(['creative', pack.func_149484_f()]);
      fields.push(['flySpeed', C13PacketPlayerAbilities$flySpeed.get(pack)]);
      fields.push(['walkSpeed', C13PacketPlayerAbilities$walkSpeed.get(pack)]);
      break;
    case 'C14PacketTabComplete':
      fields.push(['message', pack.func_149419_c()]);
      fields.push(['target', pack.func_179709_b()]);
      break;
    case 'C15PacketClientSettings':
      fields.push(['language', pack.func_149524_c()]);
      fields.push(['renderDistance', C15PacketClientSettings$renderDistance.get(pack)]);
      fields.push(['chatVisibility', pack.func_149523_e().name()]);
      fields.push(['colorsEnabled', pack.func_149520_f()]);
      fields.push(['modelPartFlags', pack.func_149521_d()]);
      break;
    case 'C16PacketClientStatus':
      fields.push(['status', pack.func_149435_c().name()]);
      break;
    case 'C17PacketCustomPayload':
      fields.push(['channel', pack.func_149559_c()]);
      fields.push(['payload', base64Encode(ByteBuf$array, pack.func_180760_b(), [])]);
      break;
    case 'C18PacketSpectate':
      fields.push(['uuid', C18PacketSpectate$uuid.get(pack)]);
      break;
    case 'C19PacketResourcePackStatus':
      fields.push(['hash', C19PacketResourcePackStatus$hash.get(pack)]);
      fields.push(['status', C19PacketResourcePackStatus$status.get(pack).name()]);
      break;
  }

  const fieldsS = fields.length ? '\n' + fields.map(v => `  ${v[0]}: ${serialize(v[1])}`).join('\n') + '\n' : '';
  logger(`${name} {${fieldsS}} ${t - startTime} ${timeToStr(t - startTime, 3)}`);
}).setPriority(Priority.HIGHEST).setEnabled(settings._logPacketClient);

const S0APacketUseBed$playerId = setAccessible(net.minecraft.network.play.server.S0APacketUseBed.class.getDeclaredField('field_149097_a'));
const S14PacketEntity$entityId = setAccessible(net.minecraft.network.play.server.S14PacketEntity.class.getDeclaredField('field_149074_a'));
const S19PacketEntityHeadLook$entityId = setAccessible(net.minecraft.network.play.server.S19PacketEntityHeadLook.class.getDeclaredField('field_149384_a'));
const S19PacketEntityStatus$entityId = setAccessible(net.minecraft.network.play.server.S19PacketEntityStatus.class.getDeclaredField('field_149164_a'));
const S29PacketSoundEffect$x = setAccessible(net.minecraft.network.play.server.S29PacketSoundEffect.class.getDeclaredField('field_149217_b'));
const S29PacketSoundEffect$y = setAccessible(net.minecraft.network.play.server.S29PacketSoundEffect.class.getDeclaredField('field_149218_c'));
const S29PacketSoundEffect$z = setAccessible(net.minecraft.network.play.server.S29PacketSoundEffect.class.getDeclaredField('field_149215_d'));
const S29PacketSoundEffect$pitch = setAccessible(net.minecraft.network.play.server.S29PacketSoundEffect.class.getDeclaredField('field_149214_f'));
const S2EPacketCloseWindow$windowId = setAccessible(net.minecraft.network.play.server.S2EPacketCloseWindow.class.getDeclaredField('field_148896_a'));
const S34PacketMaps$mapScale = setAccessible(net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField('field_179739_b'));
const S34PacketMaps$minX = setAccessible(net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField('field_179737_d'));
const S34PacketMaps$minY = setAccessible(net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField('field_179738_e'));
const S34PacketMaps$maxX = setAccessible(net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField('field_179735_f'));
const S34PacketMaps$maxY = setAccessible(net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField('field_179736_g'));
const S34PacketMaps$markers = setAccessible(net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField('field_179740_c'));
const S34PacketMaps$data = setAccessible(net.minecraft.network.play.server.S34PacketMaps.class.getDeclaredField('field_179741_h'));
const S44PacketWorldBorder$action = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179795_a'));
const S44PacketWorldBorder$size = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179793_b'));
const S44PacketWorldBorder$centerX = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179794_c'));
const S44PacketWorldBorder$centerY = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179791_d'));
const S44PacketWorldBorder$targetSize = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179792_e'));
const S44PacketWorldBorder$diameter = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179789_f'));
const S44PacketWorldBorder$transitionTime = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179790_g'));
const S44PacketWorldBorder$warningTime = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179796_h'));
const S44PacketWorldBorder$warningDistance = setAccessible(net.minecraft.network.play.server.S44PacketWorldBorder.class.getDeclaredField('field_179797_i'));
const S49PacketUpdateEntityNBT$entityId = setAccessible(net.minecraft.network.play.server.S49PacketUpdateEntityNBT.class.getDeclaredField('field_179766_a'));
const serverReg = reg('packetReceived', pack => {
  const name = pack.getClass().getSimpleName();

  if (whitelist.size > 0 && !whitelist.has(name)) return;
  if (blacklist.has(name)) return;

  const t = Date.now();

  /** @type {[string, any][]} */
  const fields = [];

  switch (name) {
    case 'S00PacketKeepAlive':
      fields.push(['id', pack.func_149134_c()]);
      break;
    case 'S01PacketJoinGame':
      fields.push(['entityId', pack.func_149197_c()]);
      fields.push(['hardcore', pack.func_149195_d()]);
      fields.push(['gamemode', pack.func_149198_e().name()]);
      fields.push(['dimension', pack.func_149194_f()]);
      fields.push(['difficulty', pack.func_149192_g().name()]);
      fields.push(['maxPlayers', pack.func_149193_h()]);
      fields.push(['worldType', pack.func_149196_i().func_77127_a()]);
      fields.push(['reducedDebugInfo', pack.func_179744_h()]);
      break;
    case 'S02PacketChat':
      fields.push(['type', pack.func_179841_c()]);
      fields.push(['type_', pack.func_179841_c() === 2 ? 'Action Bar' : 'Chat']);
      fields.push(['message', pack.func_148915_c()]);
      break;
    case 'S03PacketTimeUpdate':
      fields.push(['worldTime', pack.func_149365_d()]);
      fields.push(['totalWorldTime', pack.func_149366_c()]);
      break;
    case 'S04PacketEntityEquipment':
      fields.push(['entityId', pack.func_149389_d()]);
      fields.push(['equipmentSlot', pack.func_149388_e()]);
      fields.push(['itemStack', pack.func_149390_c()]);
      break;
    case 'S05PacketSpawnPosition':
      fields.push(['position', pack.func_179800_a()]);
      break;
    case 'S06PacketUpdateHealth':
      fields.push(['health', pack.func_149332_c()]);
      fields.push(['food', pack.func_149330_d()]);
      fields.push(['saturation', pack.func_149331_e()]);
      break;
    case 'S07PacketRespawn':
      fields.push(['dimension', pack.func_149082_c()]);
      fields.push(['difficulty', pack.func_149081_d().name()]);
      fields.push(['gamemode', pack.func_149083_e().name()]);
      fields.push(['worldType', pack.func_149080_f().func_77127_a()]);
      break;
    case 'S08PacketPlayerPosLook':
      fields.push(['deltaX', pack.func_148932_c()]);
      fields.push(['deltaY', pack.func_148928_d()]);
      fields.push(['deltaZ', pack.func_148933_e()]);
      fields.push(['deltaYaw', pack.func_148931_f()]);
      fields.push(['deltaPitch', pack.func_148930_g()]);
      break;
    case 'S09PacketHeldItemChange':
      fields.push(['hotbarId', pack.func_149385_c()]);
      break;
    case 'S0APacketUseBed':
      fields.push(['playerId', S0APacketUseBed$playerId.get(pack)]);
      fields.push(['position', pack.func_179798_a()]);
      break;
    case 'S0BPacketAnimation':
      fields.push(['entityId', pack.func_148978_c()]);
      fields.push(['type', pack.func_148977_d()]);
      fields.push(['type_', ['Swing Item', 'Hurt', 'Wake Up', null, 'Emit Crit Particle', 'Emit Crit Magic Particle'][pack.func_148977_d()] ?? 'Unknown']);
      break;
    case 'S0CPacketSpawnPlayer':
      fields.push(['entityId', pack.func_148943_d()]);
      fields.push(['playerId', pack.func_179819_c()]);
      fields.push(['x', pack.func_148942_f()]);
      fields.push(['y', pack.func_148949_g()]);
      fields.push(['z', pack.func_148946_h()]);
      fields.push(['x_', pack.func_148942_f() / 32]);
      fields.push(['y_', pack.func_148949_g() / 32]);
      fields.push(['z_', pack.func_148946_h() / 32]);
      fields.push(['yaw', pack.func_148941_i()]);
      fields.push(['pitch', pack.func_148945_j()]);
      fields.push(['yaw_', pack.func_148941_i() * 360 / 256]);
      fields.push(['pitch_', pack.func_148945_j() * 360 / 256]);
      fields.push(['heldItemId', pack.func_148947_k()]);
      fields.push(['heldItemId_', Java.type('net.minecraft.item.Item').func_150899_d(pack.func_148947_k())]);
      fields.push(['watcher', formatWatcher(pack.func_148944_c())]);
      break;
    case 'S0DPacketCollectItem':
      fields.push(['entityId', pack.func_149353_d()]);
      fields.push(['itemEntityId', pack.func_149354_c()]);
      break;
    case 'S0EPacketSpawnObject':
      fields.push(['entityId', pack.func_149001_c()]);
      fields.push(['type', pack.func_148993_l()]);
      fields.push(['type_', {
        10: 'EntityMinecart',
        90: 'EntityFishHook',
        60: 'EntityArrow',
        61: 'EntitySnowball',
        71: 'EntityItemFrame',
        77: 'EntityLeashKnot',
        65: 'EntityEnderPearl',
        72: 'EntityEnderEye',
        76: 'EntityFireworkRocket',
        63: 'EntityLargeFireball',
        64: 'EntitySmallFireball',
        66: 'EntityWitherSkull',
        62: 'EntityEgg',
        73: 'EntityPotion',
        1: 'EntityBoat',
        50: 'EntityTNTPrimed',
        78: 'EntityArmorStand',
        51: 'EntityEnderCrystal',
        2: 'EntityItem',
        70: 'EntityFallingBlock',
      }[pack.func_148993_l()] ?? 'Unknown']);
      fields.push(['x', pack.func_148997_d()]);
      fields.push(['y', pack.func_148998_e()]);
      fields.push(['z', pack.func_148994_f()]);
      fields.push(['x_', pack.func_148997_d() / 32]);
      fields.push(['y_', pack.func_148998_e() / 32]);
      fields.push(['z_', pack.func_148994_f() / 32]);
      if (pack.func_149009_m() > 0 || [63, 64, 66].includes(pack.func_148993_l())) {
        fields.push(['velocityX', pack.func_149010_g()]);
        fields.push(['velocityY', pack.func_149004_h()]);
        fields.push(['velocityZ', pack.func_148999_i()]);
        fields.push(['velocityX_', pack.func_149010_g() / 8000]);
        fields.push(['velocityY_', pack.func_149004_h() / 8000]);
        fields.push(['velocityZ_', pack.func_148999_i() / 8000]);
      }
      fields.push(['yaw', pack.func_149006_k()]);
      fields.push(['pitch', pack.func_149008_j()]);
      fields.push(['yaw_', pack.func_149006_k() * 360 / 256]);
      fields.push(['pitch_', pack.func_149008_j() * 360 / 256]);
      switch (pack.func_148993_l()) {
        case 10:
          fields.push(['minecartType', pack.func_149009_m()]);
          fields.push(['minecartType_', ['RIDEABLE', 'CHEST', 'FURNACE', 'TNT', 'SPAWNER', 'HOPPER', 'COMMAND_BLOCK'][pack.func_149009_m()] ?? 'RIDEABLE']);
          break;
        case 90:
          fields.push(['ownerId', pack.func_149009_m()]);
          break;
        case 71:
          fields.push(['facing', pack.func_149009_m()]);
          fields.push(['facing_', ['SOUTH', 'WEST', 'NORTH', 'EAST'][pack.func_149009_m() & 3]]);
        case 73:
          fields.push(['throwerId', pack.func_149009_m()]);
          break;
        case 70:
          fields.push(['blockId', pack.func_149009_m()]);
          fields.push(['blockId_', net.minecraft.block.Block.func_176220_d(pack.func_149009_m() & 65535)]);
          break;
        case 60:
          fields.push(['shooterId', pack.func_149009_m()]);
          break;
        default:
          fields.push(['auxData', pack.func_149009_m()]);
      }
      break;
    case 'S0FPacketSpawnMob':
      fields.push(['entityId', pack.func_149024_d()]);
      fields.push(['type', pack.func_149025_e()]);
      fields.push(['type_', net.minecraft.entity.EntityList.func_90035_a(pack.func_149025_e())?.getSimpleName() ?? 'Unknown']);
      fields.push(['x', pack.func_149023_f()]);
      fields.push(['y', pack.func_149034_g()]);
      fields.push(['z', pack.func_149029_h()]);
      fields.push(['x_', pack.func_149023_f() / 32]);
      fields.push(['y_', pack.func_149034_g() / 32]);
      fields.push(['z_', pack.func_149029_h() / 32]);
      fields.push(['velocityX', pack.func_149026_i()]);
      fields.push(['velocityY', pack.func_149033_j()]);
      fields.push(['velocityZ', pack.func_149031_k()]);
      fields.push(['velocityX_', pack.func_149026_i() / 8000]);
      fields.push(['velocityY_', pack.func_149033_j() / 8000]);
      fields.push(['velocityZ_', pack.func_149031_k() / 8000]);
      fields.push(['yaw', pack.func_149028_l()]);
      fields.push(['pitch', pack.func_149030_m()]);
      fields.push(['headYaw', pack.func_149032_n()]);
      fields.push(['yaw_', pack.func_149028_l() * 360 / 256]);
      fields.push(['pitch_', pack.func_149030_m() * 360 / 256]);
      fields.push(['headYaw_', pack.func_149032_n() * 360 / 256]);
      fields.push(['watcher', formatWatcher(pack.func_149027_c())]);
      break;
    case 'S10PacketSpawnPainting':
      fields.push(['entityId', pack.func_148965_c()]);
      fields.push(['position', pack.func_179837_b()]);
      fields.push(['facing', pack.func_179836_c().name()]);
      fields.push(['title', pack.func_148961_h()]);
      break;
    case 'S11PacketSpawnExperienceOrb':
      fields.push(['entityId', pack.func_148985_c()]);
      fields.push(['x', pack.func_148984_d()]);
      fields.push(['y', pack.func_148983_e()]);
      fields.push(['z', pack.func_148982_f()]);
      fields.push(['x_', pack.func_148984_d() / 32]);
      fields.push(['y_', pack.func_148983_e() / 32]);
      fields.push(['z_', pack.func_148982_f() / 32]);
      fields.push(['xpValue', pack.func_148986_g()]);
      break;
    case 'S12PacketEntityVelocity':
      fields.push(['entityId', pack.func_149412_c()]);
      fields.push(['velocityX', pack.func_149411_d()]);
      fields.push(['velocityY', pack.func_149410_e()]);
      fields.push(['velocityZ', pack.func_149409_f()]);
      fields.push(['velocityX_', pack.func_149411_d() / 8000]);
      fields.push(['velocityY_', pack.func_149410_e() / 8000]);
      fields.push(['velocityZ_', pack.func_149409_f() / 8000]);
      break;
    case 'S13PacketDestroyEntities':
      fields.push(['entityIds', pack.func_149098_c()]);
      break;
    case 'S14PacketEntity':
    case 'S15PacketEntityRelMove':
    case 'S16PacketEntityLook':
    case 'S17PacketEntityLookMove':
      fields.push(['entityId', S14PacketEntity$entityId.get(pack)]);
      fields.push(['deltaX', pack.func_149062_c()]);
      fields.push(['deltaY', pack.func_149061_d()]);
      fields.push(['deltaZ', pack.func_149064_e()]);
      fields.push(['deltaX_', pack.func_149062_c() / 32]);
      fields.push(['deltaY_', pack.func_149061_d() / 32]);
      fields.push(['deltaZ_', pack.func_149064_e() / 32]);
      if (pack.func_149060_h()) {
        fields.push(['yaw', pack.func_149066_f()]);
        fields.push(['pitch', pack.func_149063_g()]);
        fields.push(['yaw_', pack.func_149066_f() * 360 / 256]);
        fields.push(['pitch_', pack.func_149063_g() * 360 / 256]);
      }
      fields.push(['onGround', pack.func_179742_g()]);
      fields.push(['rotating', pack.func_149060_h()]);
      break;
    case 'S18PacketEntityTeleport':
      fields.push(['entityId', pack.func_149451_c()]);
      fields.push(['x', pack.func_149449_d()]);
      fields.push(['y', pack.func_149448_e()]);
      fields.push(['z', pack.func_149446_f()]);
      fields.push(['x_', pack.func_149449_d() / 32]);
      fields.push(['y_', pack.func_149448_e() / 32]);
      fields.push(['z_', pack.func_149446_f() / 32]);
      fields.push(['yaw', pack.func_149450_g()]);
      fields.push(['pitch', pack.func_149447_h()]);
      fields.push(['yaw_', pack.func_149450_g() * 360 / 256]);
      fields.push(['pitch_', pack.func_149447_h() * 360 / 256]);
      fields.push(['onGround', pack.func_179697_g()]);
      break;
    case 'S19PacketEntityHeadLook':
      fields.push(['entityId', S19PacketEntityHeadLook$entityId.get(pack)]);
      fields.push(['yaw', pack.func_149380_c()]);
      fields.push(['yaw_', pack.func_149380_c() * 360 / 256]);
      break;
    case 'S19PacketEntityStatus':
      fields.push(['entityId', S19PacketEntityStatus$entityId.get(pack)]);
      fields.push(['status', pack.func_149160_c()]);
      fields.push(['status_', [null, 'Rabbit Particles', 'Hurt', 'Die', 'Iron Golem Attack', null, 'Tame Fail', 'Tame Success', 'Wolf Shake', 'Hinish Using Item', 'Sheep Eat', 'Iron Golem Rose', 'Villager Hearts', 'Villager Angry', 'Villager Happy', 'Witch Particles', 'Zombie Cure', 'Firework Particles', 'Animal Breed Hearts', 'Squid Rotate', 'Explosion Particle', 'Guardian Sound', 'Toggle reducedDebugInfo true', 'Toggle reducedDebugInfo false'][pack.func_149160_c()] ?? 'Minecart Spawner Delay?']);
      break;
    case 'S1BPacketEntityAttach':
      fields.push(['riderEntityId', pack.func_149403_d()]);
      fields.push(['vehicleEntityId', pack.func_149402_e()]);
      fields.push(['leash', pack.func_149404_c()]);
      break;
    case 'S1CPacketEntityMetadata':
      fields.push(['entityId', pack.func_149375_d()]);
      fields.push(['watcher', formatWatcher(pack.func_149376_c())]);
      break;
    case 'S1DPacketEntityEffect':
      fields.push(['entityId', pack.func_149426_d()]);
      fields.push(['effectId', pack.func_149427_e()]);
      fields.push(['effectId_', (0 > pack.func_149427_e() || pack.func_149427_e() >= 32 ? null : net.minecraft.potion.Potion.field_76425_a[pack.func_149427_e()])?.func_76393_a() ?? 'Unknown']);
      fields.push(['amplifier', pack.func_149428_f()]);
      fields.push(['duration', pack.func_180755_e()]);
      fields.push(['duration_', pack.func_149429_c() ? '**:**' : `${Math.floor(pack.func_149429_c() / 20 / 60)}:${(Math.floor(pack.func_149429_c() / 20) % 60).toString().padStart(2, '0')}`]);
      fields.push(['hideParticles', pack.func_179707_f()]);
      break;
    case 'S1EPacketRemoveEntityEffect':
      fields.push(['entityId', pack.func_149076_c()]);
      fields.push(['effectId', pack.func_149075_d()]);
      fields.push(['effectId_', (0 > pack.func_149075_d() || pack.func_149075_d() >= 32 ? null : net.minecraft.potion.Potion.field_76425_a[pack.func_149075_d()])?.func_76393_a() ?? 'Unknown']);
      break;
    case 'S1FPacketSetExperience':
      fields.push(['expPercentBar', pack.func_149397_c()]);
      fields.push(['expAccumlated', pack.func_149396_d()]);
      fields.push(['expLevel', pack.func_149395_e()]);
      break;
    case 'S20PacketEntityProperties':
      fields.push(['entityId', pack.func_149442_c()]);
      fields.push(['attributes', pack.func_149441_d().map(v => ({
        name: v.func_151409_a(),
        baseValue: v.func_151410_b(),
        modifiers: v.func_151408_c().map(v => ({
          amount: v.func_111164_d(),
          operation: v.func_111169_c(),
          operation_: ['Base', 'Additive', 'Multiplicative'][v.func_111169_c()] ?? 'Unknown',
          name: v.func_111166_b(),
          uuid: v.func_111167_a()
        }))
      }))]);
      break;
    case 'S21PacketChunkData':
      fields.push(['chunkX', pack.func_149273_e()]);
      fields.push(['chunkZ', pack.func_149271_f()]);
      fields.push(['overwrite', pack.func_149274_i()]);
      fields.push(['dataSize', pack.func_149276_g()]);
      fields.push(['data', base64Encode(S21PacketChunkData$getData, pack, [])]);
      break;
    case 'S22PacketMultiBlockChange':
      fields.push(['changes', pack.func_179844_a().map(v => ({
        position: v.func_180090_a(),
        blockState: v.func_180088_c()
      }))]);
      break;
    case 'S23PacketBlockChange':
      fields.push(['position', pack.func_179827_b()]);
      fields.push(['blockState', pack.func_180728_a()]);
      break;
    case 'S24PacketBlockAction':
      fields.push(['position', pack.func_179825_a()]);
      fields.push(['block', pack.func_148868_c()]);
      switch (getBlockId(pack.func_148868_c())) {
        case 25:
          fields.push(['instrument', pack.func_148869_g()]);
          fields.push(['instrument_', ['harp', 'bd', 'snare', 'hat', 'bassattack'][pack.func_148869_g()] ?? 'harp']);
          fields.push(['pitch', pack.func_148864_h()]);
          fields.push(['pitch_', 2 ** ((pack.func_148864_h() - 12) / 12)]);
          break;
        case 52:
          fields.push(['spawnDelay', pack.func_148869_g()]);
          break;
        case 54:
        case 130:
          if (pack.func_148869_g() === 1) fields.push(['numPlayersUsing', pack.func_148864_h()]);
          break;
        case 149:
        case 150:
          break;
        case 138:
          if (pack.func_148869_g() === 1) fields.push(['shouldUpdateBeacon', pack.func_148869_g()]);
          break;
        case 29:
        case 33:
          fields.push(['shouldExtend', [true, false][pack.func_148869_g()] ?? 'Unknown'])
          fields.push(['metadata', pack.func_148864_h()]);
          break;
        default:
          fields.push(['eventId', pack.func_148869_g()]);
          fields.push(['eventParam', pack.func_148864_h()]);
      }
      break;
    case 'S25PacketBlockBreakAnim':
      fields.push(['entityId', pack.func_148845_c()]);
      fields.push(['position', pack.func_179821_b()]);
      fields.push(['progress', pack.func_148846_g()]);
      break;
    case 'S26PacketMapChunkBulk':
      fields.push(['chunks', new Array(pack.func_149254_d()).fill(0).map((_, i) => ({
        chunkX: pack.func_149255_a(i),
        chunkZ: pack.func_149253_b(i),
        dataSize: pack.func_179754_d(i),
        data: base64Encode(S26PacketMapChunkBulk$getData, pack, [i])
      }))]);
      break;
    case 'S27PacketExplosion':
      fields.push(['explosionX', pack.func_149148_f()]);
      fields.push(['explosionY', pack.func_149143_g()]);
      fields.push(['explosionZ', pack.func_149145_h()]);
      fields.push(['playerDeltaVelocityX', pack.func_149149_c()]);
      fields.push(['playerDeltaVelocityY', pack.func_149144_d()]);
      fields.push(['playerDeltaVelocityZ', pack.func_149147_e()]);
      fields.push(['strength', pack.func_149146_i()]);
      fields.push(['affectedPositions', pack.func_149150_j()]);
      break;
    case 'S28PacketEffect':
      fields.push(['soundType', pack.func_149242_d()]);
      if (pack.func_149244_c()) {
        fields.push(['soundType_', {
          1013: 'mob.wither.spawn',
          1018: 'mob.enderdragon.end'
        }[pack.func_149242_d()] ?? 'Unknown']);
      } else {
        fields.push(['soundType_', {
          1000: 'random.click (1.0 pitch)',
          1001: 'random.click (1.2 pitch)',
          1002: 'random.bow',
          1003: 'random.door_open',
          1004: 'random.fizz',
          1005: 'record',
          1006: 'random.door_close',
          1007: 'mob.ghast.charge',
          1008: 'mob.ghast.fireball (volume 10.0)',
          1009: 'mob.ghast.fireball (volume 2.0)',
          1010: 'mob.zombie.wood',
          1011: 'mob.zombie.metal',
          1012: 'mob.zombie.woodbreak',
          1014: 'mob.wither.shoot',
          1015: 'mob.bat.takeoff',
          1016: 'mob.zombie.infect',
          1017: 'mob.zombie.unfect',
          1020: 'random.anvil_break',
          1021: 'random.anvil_use',
          1022: 'random.anvil_land',
          2000: 'SMOKE_NORMAL',
          2001: 'Block Destroyed',
          2002: 'Splash Potion Break',
          2003: 'Ender Eye Shatter',
          2004: 'Mob Spawner Particles',
          2005: 'Bonemeal Particles'
        }[pack.func_149242_d()] ?? 'Unknown']);
      }
      fields.push(['position', pack.func_179746_d()]);
      fields.push(['serverWide', pack.func_149244_c()]);
      switch (pack.func_149244_c() ? null : pack.func_149242_d()) {
        case 1005:
          fields.push(['record', pack.func_149241_e()]);
          fields.push(['record_', Java.type('net.minecraft.item.Item').func_150899_d(pack.func_149241_e())]);
          break;
        case 2000:
          fields.push('blockOffset', pack.func_149241_e());
          fields.push('blockOffset_', {
            x: ((pack.func_149241_e() % 3) - 1) * 0.6 + 0.5,
            z: ((Math.floor(pack.func_149241_e() / 3) % 3) - 1) * 0.6 + 0.5
          });
          break;
        case 2001:
          fields.push(['block', pack.func_149241_e()]);
          fields.push(['block', net.minecraft.block.Block.func_176220_d(pack.func_149241_e() & 1048575)]);
          break;
        case 2002:
          fields.push(['metadata', pack.func_149241_e()]);
          break;
        case 2005:
          fields.push(['count', pack.func_149241_e()]);
          break;
        default:
          fields.push(['auxData', pack.func_149241_e()]);
      }
      break;
    case 'S29PacketSoundEffect':
      fields.push(['soundName', pack.func_149212_c()]);
      fields.push(['x', S29PacketSoundEffect$x.get(pack)]);
      fields.push(['x_', pack.func_149207_d()]);
      fields.push(['y', S29PacketSoundEffect$y.get(pack)]);
      fields.push(['y_', pack.func_149211_e()]);
      fields.push(['z', S29PacketSoundEffect$z.get(pack)]);
      fields.push(['z_', pack.func_149210_f()]);
      fields.push(['volume', pack.func_149208_g()]);
      fields.push(['pitch', S29PacketSoundEffect$pitch.get(pack)]);
      fields.push(['pitch_', pack.func_149209_h()]);
      break;
    case 'S2APacketParticles':
      fields.push(['type', pack.func_179749_a().name()]);
      fields.push(['longDistance', pack.func_179750_b()]);
      fields.push(['count', pack.func_149222_k()]);
      fields.push(['x', pack.func_149220_d()]);
      fields.push(['y', pack.func_149226_e()]);
      fields.push(['z', pack.func_149225_f()]);
      fields.push(['offsetX', pack.func_149221_g()]);
      fields.push(['offsetY', pack.func_149224_h()]);
      fields.push(['offsetZ', pack.func_149223_i()]);
      fields.push(['speed', pack.func_149227_j()]);
      if (pack.func_149222_k() === 0) {
        fields.push(['velocityX_', pack.func_149221_g() * pack.func_149227_j()]);
        fields.push(['velocityY_', pack.func_149224_h() * pack.func_149227_j()]);
        fields.push(['velocityZ_', pack.func_149223_i() * pack.func_149227_j()]);
      }
      switch (pack.func_179749_a().name()) {
        case 'EXPLOSION_NORMAL':
        case 'WATER_BUBBLE':
        case 'WATER_SPLASH':
        case 'WATER_WAKE':
        case 'WATER_DROP':
        case 'SUSPENDED':
        case 'SUSPENDED_DEPTH':
        case 'CRIT':
        case 'CRIT_MAGIC':
        case 'SMOKE_NORMAL':
        case 'SMOKE_LARGE':
        case 'SPELL':
        case 'SPELL_INSTANT':
        case 'SPELL_MOB':
        case 'SPELL_MOB_AMBIENT':
        case 'SPELL_WITCH':
        case 'DRIP_WATER':
        case 'DRIP_LAVA':
        case 'VILLAGER_ANGRY':
        case 'VILLAGER_HAPPY':
        case 'TOWN_AURA':
        case 'NOTE':
        case 'PORTAL':
        case 'ENCHANTMENT_TABLE':
        case 'FLAME':
        case 'LAVA':
        case 'FOOTSTEP':
        case 'CLOUD':
        case 'REDSTONE':
        case 'SNOWBALL':
        case 'SNOW_SHOVEL':
        case 'SLIME':
        case 'HEART':
        case 'BARRIER':
        case 'EXPLOSION_HUGE':
        case 'EXPLOSION_LARGE':
        case 'FIREWORKS_SPARK':
        case 'MOB_APPEARANCE':
          break;
        case 'ITEM_CRACK':
          fields.push(['arguments', pack.func_179748_k()]);
          fields.push(['item_', Java.type('net.minecraft.item.Item').func_150899_d(pack.func_179748_k()[0])]);
          fields.push(['metadata_', Java.type('net.minecraft.item.Item').func_150899_d(pack.func_179748_k().length > 1 ? pack.func_179748_k()[1] : 0)]);
          break;
        case 'BLOCK_CRACK':
        case 'BLOCK_DUST':
          fields.push(['arguments', pack.func_179748_k()]);
          fields.push(['block_', net.minecraft.block.Block.func_176220_d(pack.func_179748_k()[0])]);
          break;
        default:
          fields.push(['arguments', pack.func_179748_k()]);
      }
      break;
    case 'S2BPacketChangeGameState':
      fields.push(['state', pack.func_149138_c()]);
      switch (pack.func_149138_c()) {
        case 0:
          fields.push(['state_', 'Bed Missing Message']);
          break;
        case 1:
          fields.push(['state_', 'Toggle Rain On']);
          break;
        case 2:
          fields.push(['state_', 'Toggle Rain Off']);
          break;
        case 3:
          fields.push(['state_', 'Change Gamemode']);
          fields.push(['gamemode', pack.func_149137_d()]);
          fields.push(['gamemode_', net.minecraft.world.WorldSettings.GameType.func_77146_a(Math.floor(pack.func_149137_d() + 0.5)).name()]);
          break;
        case 4:
          fields.push(['state_', 'Display Credits']);
          break;
        case 5:
          fields.push(['state_', 'Gameplay Help']);
          fields.push(['action', pack.func_149137_d()]);
          fields.push(['action_', {
            0: 'Show Demo Screen',
            101: 'Show Movement Controls',
            102: 'Show Jump Control',
            103: 'Show Inventory Control'
          }[pack.pack.func_149137_d()()] ?? 'Unknown']);
          break;
        case 6:
          fields.push(['state_', 'play random.successful_hit']);
          break;
        case 7:
          fields.push(['state_', 'Set Rain Strength']);
          fields.push(['strength', pack.func_149137_d()]);
          break;
        case 8:
          fields.push(['state_', 'Set Thunder Strength']);
          fields.push(['strength', pack.func_149137_d()]);
          break;
        case 10:
          fields.push(['state_', 'Elder Guardian Dong']);
          break;
        default:
          fields.push(['state_', 'Unknown']);
          fields.push(['data', pack.func_149137_d()]);
      }
      break;
    case 'S2CPacketSpawnGlobalEntity':
      fields.push(['entityId', pack.func_149052_c()]);
      fields.push(['type', pack.func_149053_g()]);
      fields.push(['type_', { 1: 'EntityThunderBolt' }[pack.func_149053_g()] ?? 'Unknown']);
      fields.push(['x', pack.func_149051_d()]);
      fields.push(['y', pack.func_149050_e()]);
      fields.push(['z', pack.func_149049_f()]);
      fields.push(['x_', pack.func_149051_d() / 32]);
      fields.push(['y_', pack.func_149050_e() / 32]);
      fields.push(['z_', pack.func_149049_f() / 32]);
      break;
    case 'S2DPacketOpenWindow':
      fields.push(['windowId', pack.func_148901_c()]);
      fields.push(['type', pack.func_148902_e()]);
      fields.push(['title', pack.func_179840_c()]);
      fields.push(['slotCount', pack.func_148898_f()]);
      if (pack.func_148902_e() === 'EntityHorse') fields.push(['entityId', pack.func_148897_h()]);
      break;
    case 'S2EPacketCloseWindow':
      fields.push(['windowId', S2EPacketCloseWindow$windowId.get(pack)]);
      break;
    case 'S2FPacketSetSlot':
      fields.push(['windowId', pack.func_149175_c()]);
      fields.push(['slotId', pack.func_149173_d()]);
      fields.push(['item', pack.func_149174_e()]);
      break;
    case 'S30PacketWindowItems':
      fields.push(['windowId', pack.func_148911_c()]);
      fields.push(['items', pack.func_148910_d()]);
      break;
    case 'S31PacketWindowProperty':
      fields.push(['windowId', pack.func_149182_c()]);
      fields.push(['id', pack.func_149181_d()]);
      fields.push(['data', pack.func_149180_e()]);
      break;
    case 'S32PacketConfirmTransaction':
      fields.push(['windowId', pack.func_148889_c()]);
      fields.push(['actionId', pack.func_148890_d()]);
      fields.push(['dontAck', pack.func_148888_e()]);
      break;
    case 'S33PacketUpdateSign':
      fields.push(['position', pack.func_179704_a()]);
      fields.push(['lines', pack.func_180753_b()]);
      break;
    case 'S34PacketMaps':
      fields.push(['mapId', pack.func_149188_c()]);
      fields.push(['mapScale', S34PacketMaps$mapScale.get(pack)]);
      fields.push(['minX', S34PacketMaps$minX.get(pack)]);
      fields.push(['minY', S34PacketMaps$minY.get(pack)]);
      fields.push(['maxX', S34PacketMaps$maxX.get(pack)]);
      fields.push(['maxY', S34PacketMaps$maxY.get(pack)]);
      fields.push(['markers', S34PacketMaps$markers.get(pack)]);
      fields.push(['data', S34PacketMaps$data.get(pack)]);
      break;
    case 'S35PacketUpdateTileEntity':
      fields.push(['position', pack.func_179823_a()]);
      fields.push(['type', pack.func_148853_f()]);
      fields.push(['type_', [null, 'TileEntityMobSpawner', 'TileEntityCommandBlock', 'TileEntityBeacon', 'TileEntitySkull', 'TileEntityFlowerPot', 'TileEntityBanner'][pack.func_148853_f()] ?? 'Unknown']);
      fields.push(['nbt', pack.func_148857_g()]);
      break;
    case 'S36PacketSignEditorOpen':
      fields.push(['position', pack.func_179777_a()]);
      break;
    case 'S37PacketStatistics':
      fields.push(['stats', pack.func_148974_c().entrySet().map(v => ({
        id: v.getKey().field_75975_e,
        name: v.getKey().func_150951_e(),
        value: v.getValue(),
        value_: v.getKey().func_75968_a(v.getValue())
      }))]);
      break;
    case 'S38PacketPlayerListItem':
      fields.push(['action', pack.func_179768_b().name()]);
      fields.push(['entries', pack.func_179767_a().map(v => ({
        uuid: v.func_179962_a().getId(),
        name: v.func_179962_a().getName(),
        ping: v.func_179963_b(),
        gamemode: v.func_179960_c()?.name() ?? 'Unknown',
        displayName: v.func_179961_d()
      }))]);
      break;
    case 'S39PacketPlayerAbilities':
      fields.push(['invulnerable', pack.func_149112_c()]);
      fields.push(['flying', pack.func_149106_d()]);
      fields.push(['allowFlying', pack.func_149105_e()]);
      fields.push(['creative', pack.func_149103_f()]);
      fields.push(['flySpeed', pack.func_149101_g()]);
      fields.push(['walkSpeed', pack.func_149107_h()]);
      break;
    case 'S3APacketTabComplete':
      fields.push(['matches', pack.func_149630_c()]);
      break;
    case 'S3BPacketScoreboardObjective':
      fields.push(['action', pack.func_149338_e()]);
      fields.push(['action_', ['Add Objective', 'Remove Objective', 'Update Objective'][pack.func_149338_e()] ?? 'Unknown']);
      fields.push(['objectiveName', pack.func_149339_c()]);
      fields.push(['objectiveDisplayName', pack.func_149337_d()]);
      if ([0, 2].includes(pack.func_149338_e())) fields.push(['objectiveRenderType', pack.func_179817_d().name()]);
      break;
    case 'S3CPacketUpdateScore':
      fields.push(['action', pack.func_180751_d().name()]);
      fields.push(['playerName', pack.func_149324_c()]);
      fields.push(['objectiveName', pack.func_149321_d()]);
      if (pack.func_180751_d().name() === 'CHANGE') fields.push(['objectiveValue', pack.func_149323_e()]);
      break;
    case 'S3DPacketDisplayScoreboard':
      fields.push(['objectiveName', pack.func_149370_d()]);
      fields.push(['displaySlot', pack.func_149371_c()]);
      fields.push(['displaySlot_', ['Tab Menu', 'Sidebar', 'Below Name'][pack.func_149371_c()] ?? 'Unknown']);
      break;
    case 'S3EPacketTeams':
      fields.push(['action', pack.func_149307_h()]);
      fields.push(['action_', ['Create Team', 'Remove Team', 'Update Team', 'Add Players', 'Remove Players'][pack.func_149307_h()] ?? 'Unknown']);
      fields.push(['name', pack.func_149312_c()]);
      if ([0, 2].includes(pack.func_149307_h())) {
        fields.push(['displayName', pack.func_149306_d()]);
        fields.push(['prefix', pack.func_149311_e()]);
        fields.push(['suffix', pack.func_149309_f()]);
        fields.push(['friendlyFlags', pack.func_149308_i()]);
        fields.push(['friendlyFlags_', {
          friendlyFire: (pack.func_149308_i() & 1) > 0,
          seeInvisibleFriendlies: (pack.func_149308_i() & 2) > 0
        }]);
        fields.push(['nametagVisibility', pack.func_179814_i()]);
        fields.push(['color', pack.func_179813_h()]);
        fields.push(['color_', net.minecraft.util.EnumChatFormatting.func_175744_a(pack.func_179813_h())?.name() ?? 'Unknown']);
      }
      if ([0, 3, 4].includes(pack.func_149307_h())) fields.push(['players', pack.func_149310_g()]);
      break;
    case 'S3FPacketCustomPayload':
      fields.push(['channel', pack.func_149169_c()]);
      fields.push(['payload', base64Encode(ByteBuf$array, pack.func_180735_b(), [])]);
      break;
    case 'S40PacketDisconnect':
      fields.push(['reason', pack.func_149165_c()]);
      break;
    case 'S41PacketServerDifficulty':
      fields.push(['difficulty', pack.func_179831_b()]);
      fields.push(['isLocked', pack.func_179830_a()]);
      break;
    case 'S42PacketCombatEvent':
      fields.push(['type', pack.field_179776_a.name()]);
      switch (pack.field_179776_a.name()) {
        case 'END_COMBAT':
          fields.push(['trackerId', pack.field_179772_d]);
          fields.push(['entityId', pack.field_179775_c]);
          break;
        case 'ENTITY_DIED':
          fields.push(['killerId', pack.field_179774_b]);
          fields.push(['entityId', pack.field_179775_c]);
          fields.push(['deathMessage', pack.field_179773_e]);
          break;
      }
      break;
    case 'S43PacketCamera':
      fields.push(['entityId', pack.field_179781_a]);
      break;
    case 'S44PacketWorldBorder':
      fields.push(['action', S44PacketWorldBorder$action.get(pack).name()]);
      switch (S44PacketWorldBorder$action.get(pack).name()) {
        case 'SET_SIZE':
          fields.push(['targetSize', S44PacketWorldBorder$targetSize.get(pack)]);
          break;
        case 'LERP_SIZE':
          fields.push(['diameter', S44PacketWorldBorder$diameter.get(pack)]);
          fields.push(['targetSize', S44PacketWorldBorder$targetSize.get(pack)]);
          fields.push(['transitionTime', S44PacketWorldBorder$transitionTime.get(pack)]);
          break;
        case 'SET_CENTER':
          fields.push(['centerX', S44PacketWorldBorder$centerX.get(pack)]);
          fields.push(['centerY', S44PacketWorldBorder$centerY.get(pack)]);
          break;
        case 'INITIALIZE':
          fields.push(['centerX', S44PacketWorldBorder$centerX.get(pack)]);
          fields.push(['centerY', S44PacketWorldBorder$centerY.get(pack)]);
          fields.push(['diameter', S44PacketWorldBorder$diameter.get(pack)]);
          fields.push(['targetSize', S44PacketWorldBorder$targetSize.get(pack)]);
          fields.push(['transitionTime', S44PacketWorldBorder$transitionTime.get(pack)]);
          fields.push(['size', S44PacketWorldBorder$size.get(pack)]);
          fields.push(['warningTime', S44PacketWorldBorder$warningTime.get(pack)]);
          fields.push(['warningDistance', S44PacketWorldBorder$warningDistance.get(pack)]);
          break;
        case 'SET_WARNING_TIME':
          fields.push(['warningTime', S44PacketWorldBorder$warningTime.get(pack)]);
          break;
        case 'SET_WARNING_BLOCKS':
          fields.push(['warningDistance', S44PacketWorldBorder$warningDistance.get(pack)]);
          break;
      }
      break;
    case 'S45PacketTitle':
      fields.push(['type', pack.func_179807_a().name()]);
      switch (pack.func_179807_a().name()) {
        case 'TITLE':
        case 'SUBTITLE':
          fields.push(['message', pack.func_179805_b()]);
          break;
        case 'TIMES':
          fields.push(['fadeInTime', timeToStr(pack.func_179806_c() / 20, 2)]);
          fields.push(['displayTime', timeToStr(pack.func_179804_d() / 20, 2)]);
          fields.push(['fadeOutTime', timeToStr(pack.func_179803_e() / 20, 2)]);
          break;
      }
      break;
    case 'S46PacketSetCompressionLevel':
      fields.push(['level', pack.func_179760_a()]);
      break;
    case 'S47PacketPlayerListHeaderFooter':
      fields.push(['header', pack.func_179700_a()]);
      fields.push(['footer', pack.func_179701_b()]);
      break;
    case 'S48PacketResourcePackSend':
      fields.push(['url', pack.func_179783_a()]);
      fields.push(['hash', pack.func_179784_b()]);
      break;
    case 'S49PacketUpdateEntityNBT':
      fields.push(['entityId', S49PacketUpdateEntityNBT$entityId.get(pack)]);
      fields.push(['nbt', pack.func_179763_a()]);
      break;
  }

  const fieldsS = fields.length ? '\n' + fields.map(v => `  ${v[0]}: ${serialize(v[1])}`).join('\n') + '\n' : '';
  logger(`${name} {${fieldsS}} ${t - startTime} ${timeToStr(t - startTime, 3)}`);
}).setPriority(Priority.HIGHEST).setEnabled(settings._logPacketServer);

export function init() {
  settings._logPacketWhitelist.listen(v => {
    whitelist.clear();
    v.split(',').forEach(c => c && whitelist.add(c));
  });
  settings._logPacketBlacklist.listen(v => {
    blacklist.clear();
    v.split(',').forEach(c => c && blacklist.add(c));
  });

  function addWhitelist(arr) {
    arr.forEach(v => whitelist.add(v));
    settings.updateProp(settings._logPacketWhitelist, Array.from(whitelist.keys()).join(','));
  }

  settings._logPacketEnablePresetC1.onAction(() => addWhitelist([
    'C00PacketKeepAlive',
    'C15PacketClientSettings',
    'C16PacketClientStatus',
    'C17PacketCustomPayload',
  ]));
  settings._logPacketEnablePresetC2.onAction(() => addWhitelist([
    'C01PacketChatMessage',
    'C02PacketUseEntity',
    'C07PacketPlayerDigging',
    'C08PacketPlayerBlockPlacement',
    'C09PacketHeldItemChange',
    'C0APacketAnimation',
    'C0BPacketEntityAction',
    'C0DPacketCloseWindow',
    'C0EPacketClickWindow',
    'C14PacketTabComplete',
  ]));
  settings._logPacketEnablePresetC3.onAction(() => addWhitelist([
    'C03PacketPlayer',
    'C04PacketPlayerPosition',
    'C05PacketPlayerLook',
    'C06PacketPlayerPosLook',
    'C0CPacketInput',
    'C13PacketPlayerAbilities',
  ]));
  settings._logPacketEnablePresetC4.onAction(() => addWhitelist([
    'C0FPacketConfirmTransaction',
    'C10PacketCreativeInventoryAction',
    'C11PacketEnchantItem',
    'C12PacketUpdateSign',
  ]));
  settings._logPacketEnablePresetS1.onAction(() => addWhitelist([
    'S00PacketKeepAlive',
    'S03PacketTimeUpdate',
    'S37PacketStatistics',
    'S3FPacketCustomPayload',
    'S40PacketDisconnect',
    'S46PacketSetCompressionLevel',
    'S48PacketResourcePackSend',
  ]));
  settings._logPacketEnablePresetS2.onAction(() => addWhitelist([
    'S01PacketJoinGame',
    'S05PacketSpawnPosition',
    'S07PacketRespawn',
    'S41PacketServerDifficulty',
    'S44PacketWorldBorder',
  ]));
  settings._logPacketEnablePresetS3.onAction(() => addWhitelist([
    'S08PacketPlayerPosLook',
    'S39PacketPlayerAbilities',
  ]));
  settings._logPacketEnablePresetS4.onAction(() => addWhitelist([
    'S06PacketUpdateHealth',
    'S1FPacketSetExperience',
    'S2BPacketChangeGameState',
    'S3APacketTabComplete',
    'S43PacketCamera',
  ]));
  settings._logPacketEnablePresetS5.onAction(() => addWhitelist([
    'S02PacketChat',
    'S32PacketConfirmTransaction',
    'S38PacketPlayerListItem',
    'S3BPacketScoreboardObjective',
    'S3CPacketUpdateScore',
    'S3DPacketDisplayScoreboard',
    'S3EPacketTeams',
    'S45PacketTitle',
    'S47PacketPlayerListHeaderFooter',
  ]));
  settings._logPacketEnablePresetS6.onAction(() => addWhitelist([
    'S04PacketEntityEquipment',
    'S0CPacketSpawnPlayer',
    'S0EPacketSpawnObject',
    'S0FPacketSpawnMob',
    'S10PacketSpawnPainting',
    'S11PacketSpawnExperienceOrb',
    'S13PacketDestroyEntities',
    'S1BPacketEntityAttach',
    'S1CPacketEntityMetadata',
    'S1DPacketEntityEffect',
    'S1EPacketRemoveEntityEffect',
    'S20PacketEntityProperties',
    'S2CPacketSpawnGlobalEntity',
    'S35PacketUpdateTileEntity',
    'S42PacketCombatEvent',
    'S49PacketUpdateEntityNBT',
  ]));
  settings._logPacketEnablePresetS7.onAction(() => addWhitelist([
    'S08PacketPlayerPosLook',
    'S12PacketEntityVelocity',
    'S14PacketEntity',
    'S15PacketEntityRelMove',
    'S16PacketEntityLook',
    'S17PacketEntityLookMove',
    'S18PacketEntityTeleport',
    'S19PacketEntityHeadLook',
  ]));
  settings._logPacketEnablePresetS8.onAction(() => addWhitelist([
    'S09PacketHeldItemChange',
    'S0APacketUseBed',
    'S0BPacketAnimation',
    'S0DPacketCollectItem',
    'S19PacketEntityStatus',
  ]));
  settings._logPacketEnablePresetS9.onAction(() => addWhitelist([
    'S21PacketChunkData',
    'S22PacketMultiBlockChange',
    'S23PacketBlockChange',
    'S24PacketBlockAction',
    'S25PacketBlockBreakAnim',
    'S26PacketMapChunkBulk',
    'S33PacketUpdateSign',
    'S35PacketUpdateTileEntity',
    'S44PacketWorldBorder',
  ]));
  settings._logPacketEnablePresetS10.onAction(() => addWhitelist([
    'S27PacketExplosion',
    'S28PacketEffect',
    'S29PacketSoundEffect',
    'S2APacketParticles',
  ]));
  settings._logPacketEnablePresetS11.onAction(() => addWhitelist([
    'S2DPacketOpenWindow',
    'S2EPacketCloseWindow',
    'S2FPacketSetSlot',
    'S30PacketWindowItems',
    'S31PacketWindowProperty',
    'S32PacketConfirmTransaction',
    'S36PacketSignEditorOpen',
  ]));
  settings._logPacketEnablePresetS12.onAction(() => addWhitelist([
    'S34PacketMaps',
  ]));
  settings._logPacketClearWhitelist.onAction(() => settings.updateProp(settings._logPacketWhitelist, ''));
}
export function load() {
  startTime = Date.now();

  const fileStream = new java.io.FileOutputStream(`./config/ChatTriggers/modules/chicktils/packets-${startTime}.log.gz`);
  const gzipStream = new java.util.zip.GZIPOutputStream(fileStream);
  const buffStream = new java.io.BufferedOutputStream(gzipStream);
  printWriter = new java.io.OutputStreamWriter(buffStream, 'UTF-8');
  const ActualThread = Java.type('java.lang.Thread');
  const queue = new java.util.concurrent.LinkedBlockingQueue();
  ioThread = new ActualThread(wrap(() => {
    while (!ActualThread.currentThread().isInterrupted()) {
      try {
        let data = queue.poll(100, java.util.concurrent.TimeUnit.MILLISECONDS);
        if (data) printWriter.write(data + '\n');
      } catch (e) {
        if (!e.toString().startsWith('JavaException: java.lang.InterruptedException')) throw e;
        ActualThread.currentThread().interrupt();
        break;
      }
    }

    let remaining;
    while (remaining = queue.poll()) {
      printWriter.write(remaining + '\n');
    }
  }), 'ChicktilsPacketLogger');
  ioThread.start();
  logger = s => queue.offer(s);

  clientReg.register();
  serverReg.register();
}
export function unload() {
  clientReg.unregister();
  serverReg.unregister();

  if (printWriter) {
    ioThread.interrupt();
    ioThread.join(5000);
    printWriter.close();
    printWriter = null;
    logger = Function.prototype;
  }
}