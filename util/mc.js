import { setAccessible } from './polyfill';

const itemIdDict = Java.type('net.minecraft.item.Item').field_150901_e;
/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.item.ItemStack'>} item
 * @returns {string}
 */
export function getItemId(item) {
  const i = item?.func_77973_b();
  if (!i) return '';
  return itemIdDict.func_177774_c(i).toString();
}
/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.item.Item'>} item
 * @returns {string}
 */
export function getItemIdI(item) {
  return itemIdDict.func_177774_c(item).toString();
}

const lowerInvF = setAccessible(Java.type('net.minecraft.client.gui.inventory.GuiChest').class.getDeclaredField('field_147015_w'));
/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.client.gui.inventory.GuiChest'>} gui
 * @returns {import ('../../@types/External').JavaClass<'net.minecraft.client.player.inventory.ContainerLocalMenu'>}
 */
export function getLowerContainer(gui) {
  return lowerInvF.get(gui);
}

/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.client.player.inventory.ContainerLocalMenu'>} inv
 * @param {(inv: import ('../../@types/External').JavaClass<'net.minecraft.client.player.inventory.ContainerLocalMenu'>) => void} cb
 */
export function listenInventory(inv, cb) {
  const listener = new JavaAdapter(Java.type('net.minecraft.inventory.IInvBasic'), {
    func_76316_a(inv) {
      cb(inv);
    }
  });
  inv.func_110134_a(listener);
  // inv.func_110132_b(cb); // remove hook
}

function wrapString(str) {
  return typeof str === 'string' ? new TextComponent(str).chatComponentText : str;
}

/**
 * @param {string | import ('../../@types/External').JavaClass<'net.minecraft.util.IChatComponent'> | () => string | import ('../../@types/External').JavaClass<'net.minecraft.util.IChatComponent'>} getName
 * @param {() => number} getHp
 * @param {number | () => number} getMaxHp
 * @returns {import ('../../@types/External').JavaClass<'net.minecraft.entity.boss.IBossDisplayData'>}
 * @link https://github.com/Marcelektro/MCP-919/blob/main/temp/src/minecraft/net/minecraft/entity/boss/BossStatus.java
 */
export function createBossBar(getName, getHp, getMaxHp) {
  const cn = typeof getName === 'function' ? undefined : wrapString(getName);
  return new JavaAdapter(Java.type('net.minecraft.entity.boss.IBossDisplayData'), {
    func_145748_c_() {
      return cn ?? wrapString(getName());
    },
    func_110143_aJ() {
      return getHp();
    },
    func_110138_aP() {
      if (typeof getMaxHp === 'function') return getMaxHp();
      return getMaxHp;
    }
  });
}

const BossStatus = Java.type('net.minecraft.entity.boss.BossStatus');
/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.entity.boss.IBossDisplayData'>} bar
 */
export function setBossBar(bar) {
  BossStatus.func_82824_a(bar, false);
}

/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.entity.Entity'>?} ent
 * @returns {number}
 */
export function getEyeHeight(ent) {
  return (ent || Player.getPlayer())?.func_70047_e() || 0;
}

/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.entity.Entity'>} ent
 * @returns {number}
 */
export function getMaxHp(ent) {
  return ent.func_110140_aT().func_111152_a('generic.maxHealth').func_111125_b();
}

const Vec3 = Java.type('net.minecraft.util.Vec3');
/**
 * @param {{ x: number, y: number, z: number}} pos
 * @returns {import ('../../@types/External').JavaClass<'net.minecraft.util.Vec3'>}
 */
export function toVec3({ x, y, z }) {
  return new Vec3(x, y, z);
}

/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.util.Vec3'>} vec
 * @returns {{ x: number, y: number, z: number}}
 */
export function fromVec3(vec) {
  return { x: vec.field_72450_a, y: vec.field_72448_b, z: vec.field_72449_c };
}

/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.util.BlockPos'>} bPos
 * @returns {{ x: number, y: number, z: number}}
 */
export function getBlockPos(bPos) {
  return {
    x: bPos.func_177958_n(),
    y: bPos.func_177956_o(),
    z: bPos.func_177952_p()
  };
}

const ResourceLocation = Java.type('net.minecraft.util.ResourceLocation');
const CHEST_GUI_TEXTURE = new ResourceLocation('textures/gui/container/generic_54.png');
const Container = Java.type('net.minecraft.inventory.Container');
const GuiContainer = Java.type('net.minecraft.client.gui.inventory.GuiContainer');
const JSlot = Java.type('net.minecraft.inventory.Slot');
const addSlotToContainerM = setAccessible(Container.class.getDeclaredMethod('func_75146_a', [JSlot.class]));
/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.client.gui.inventory.GuiChest'>} chest
 * @returns {typeof GuiContainer}
 * @link https://github.com/Marcelektro/MCP-919/blob/main/temp/src/minecraft/net/minecraft/entity/boss/BossStatus.java
 */
export function createChestNoInv(chest) {
  const p = Player.getPlayer();
  if (!p) return chest;
  const inv = getLowerContainer(chest);
  const cont = new JavaAdapter(Container, {
    // canInteractWith
    func_75145_c(p) {
      return inv.func_70300_a(p);
    },
    // transferStackInSlot
    func_82846_b(p, i) {
      let itemStack = null;
      const slot = this.field_75151_b[p_82846_2_];
      if (slot && slot.func_75216_d()) {
        const itemStack1 = slot.func_75211_c();
        itemStack = itemStack1.func_77946_l();
        if (i < contNumRows * 9) {
          if (!this.func_75135_a(itemStack1, contNumRows * 9, this.field_75151_b.size(), true)) return null;
        } else if (!this.func_75135_a(itemStack1, 0, contNumRows * 9, false)) return null;

        if (itemStack1.field_77994_a === 0) slot.func_75215_d(null);
        else slot.func_75218_e();
      }

      return itemStack;
    },
    // onContainerClosed
    func_75134_a(p) {
      this.super$func_75134_a(p);
      inv.func_174886_c(p);
    }
  });
  const contNumRows = inv.func_70302_i_() / 9;
  inv.func_174889_b(p);
  Client.scheduleTask(() => cont.field_75152_c = chest.field_147002_h.field_75152_c);

  for (let i = 0; i < contNumRows; i++) {
    for (let j = 0; j < 9; j++) {
      addSlotToContainerM.invoke(cont, new JSlot(inv, j + i * 9, 8 + j * 18, 18 + i * 18));
    }
  }
  const gCont = new JavaAdapter(GuiContainer, {
    // drawGuiContainerForegroundLayer
    func_146979_b(mX, mY) {
      this.field_146289_q.func_78276_b(inv.func_145748_c_().func_150260_c(), 8, 6, 4210752);
    },
    // drawGuiContainerBackgroundLayer
    func_146976_a(pt, mX, mY) {
      GlStateManager.func_179131_c(1, 1, 1, 1);
      this.field_146297_k.func_110434_K().func_110577_a(CHEST_GUI_TEXTURE);
      const i = (this.field_146294_l - this.field_146999_f) / 2;
      const j = (this.field_146295_m - this.field_147000_g) / 2;
      this.func_73729_b(i, j, 0, 0, this.field_146999_f, this.field_147018_x * 18 + 17);
      this.func_73729_b(i, j + this.field_147018_x * 18 + 17, 0, 126 + 96 - 7, this.field_146999_f, 7);
    }
  }, cont);

  gCont.field_146291_p = false;
  gCont.field_147018_x = inv.func_70302_i_() / 9;
  gCont.field_147000_g = gCont.field_147018_x * 18 + 36;

  return gCont;
}

export function createBlockMapping(orig1, orig2, actual1, actual2) {
  const dOx = orig1.x - orig2.x;
  const dOy = orig1.y - orig2.y;
  const dOz = orig1.z - orig2.z;
  let dy = 0;

  let rot = 0;
  const xMult = () => (rot === 1 || rot === 2) ? -1 : 1;
  const zMult = () => (rot === 2 || rot === 3) ? -1 : 1;
  let cornerX = 0;
  let cornerZ = 0;

  const obj = {
    calibrate(actual1, actual2) {
      const dAx = actual1.x - actual2.x;
      const dAy = actual1.y - actual2.y;
      const dAz = actual1.z - actual2.z;
      if (dOy !== dAy) return false;
      dy = orig1.y - actual1.y;
      if (dOx === dAx && dOz === dAz) {
        rot = 0;
        cornerX = actual1.x - orig1.x;
        cornerZ = actual1.z - orig1.z;
      } else if (dOx === dAz && -dOz === dAx) {
        rot = 1;
        cornerX = actual1.x + orig1.z;
        cornerZ = actual1.z - orig1.x;
      } else if (-dOx === dAx && -dOz === dAz) {
        rot = 2;
        cornerX = actual1.x + orig1.x;
        cornerZ = actual1.z + orig1.z;
      } else if (-dOx === dAz && dOz === dAx) {
        rot = 3;
        cornerX = actual1.x - orig1.z;
        cornerZ = actual1.z + orig1.x;
      } else return false;
      return true;
    },
    origToActual(orig) {
      let dx = orig.x;
      let dz = orig.z;
      if (rot & 1) {
        let t = dx;
        dx = dz;
        dz = t;
      }
      return { x: cornerX + dx * xMult(), y: orig.y - dy, z: cornerZ + dz * zMult() };
    },
    actualToOrig(actual) {
      let dx = actual.x - cornerX;
      let dz = actual.z - cornerZ;
      dx *= xMult();
      dz *= zMult();
      if (rot & 1) {
        let t = dx;
        dx = dz;
        dz = t;
      }
      return { x: dx, y: actual.y + dy, z: dz };
    }
  };

  if (actual1 && actual2) obj.calibrate(actual1, actual2);

  return obj;
}

const MCBlock = Java.type('net.minecraft.block.Block');
/**
 * @param {import('../../@types/External').JavaClass<'net.minecraft.block.Block'>} block
 * @returns {number}
 */
export function getBlockId(block) {
  return MCBlock.func_149682_b(block);
}

/**
 * @param {import('../../@types/External').JavaClass<'net.minecraft.util.IChatComponent'>} comp
 * @param {number} id
 */
export function printChatComponent(comp, id) {
  Client.getMinecraft().field_71456_v.func_146158_b().func_146234_a(comp, id);
}