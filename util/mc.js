const itemIdDict = Java.type('net.minecraft.item.Item').field_150901_e;
/**
 * @param {import ('../../@types/External').JavaClass<'net.minecraft.item.ItemStack'>} item
 * @returns {string}
 */
export function getItemId(item) {
  return itemIdDict.func_177774_c(item.func_77973_b()).toString();
}

const lowerInvF = Java.type('net.minecraft.client.gui.inventory.GuiChest').class.getDeclaredField('field_147015_w');
lowerInvF.setAccessible(true);
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
  return typeof str === 'string' ? new TextComponent('§6﴾ §c§lKuudra§6 ﴿').chatComponentText : str;
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