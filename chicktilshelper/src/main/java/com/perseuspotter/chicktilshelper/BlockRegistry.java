package com.perseuspotter.chicktilshelper;

import net.minecraft.block.Block;
import net.minecraft.init.Blocks;

public class BlockRegistry {
    public static final boolean[] dict = new boolean[198];
    static {
        Block[] basicallyAir = new Block[] {
            Blocks.air,
            Blocks.sapling,
            Blocks.flowing_water,
            Blocks.water,
            Blocks.flowing_lava,
            Blocks.lava,
            Blocks.golden_rail,
            Blocks.detector_rail,
            Blocks.web,
            Blocks.tallgrass,
            Blocks.deadbush,
            Blocks.yellow_flower,
            Blocks.red_flower,
            Blocks.brown_mushroom,
            Blocks.red_mushroom,
            Blocks.torch,
            Blocks.fire,
            Blocks.redstone_wire,
            Blocks.wheat,
            Blocks.ladder,
            Blocks.rail,
            Blocks.lever,
            Blocks.unlit_redstone_torch,
            Blocks.redstone_torch,
            Blocks.stone_button,
            Blocks.snow_layer,
            Blocks.reeds,
            Blocks.portal,
            Blocks.unpowered_repeater,
            Blocks.powered_repeater,
            Blocks.pumpkin_stem,
            Blocks.melon_stem,
            Blocks.vine,
            Blocks.nether_wart,
            Blocks.end_portal,
            Blocks.cocoa,
            Blocks.tripwire_hook,
            Blocks.tripwire,
            Blocks.flower_pot,
            Blocks.carrots,
            Blocks.potatoes,
            Blocks.wooden_button,
            Blocks.skull,
            Blocks.unpowered_comparator,
            Blocks.powered_comparator,
            Blocks.activator_rail,
            Blocks.carpet,
            Blocks.double_plant,
        };
        for (Block b : basicallyAir) {
            dict[Block.getIdFromBlock(b)] = true;
        }
    }

    public static boolean isSolid(int id) {
        if (id < 0 || id >= dict.length) return true;
        return !dict[id];
    }
    public static boolean isSolid(Block b) {
        return isSolid(Block.getIdFromBlock(b));
    }
    public static boolean isBasicallyAir(int id) {
        if (id < 0 || id >= dict.length) return false;
        return dict[id];
    }
    public static boolean isBasicallyAir(Block b) {
        return isBasicallyAir(Block.getIdFromBlock(b));
    }
}
