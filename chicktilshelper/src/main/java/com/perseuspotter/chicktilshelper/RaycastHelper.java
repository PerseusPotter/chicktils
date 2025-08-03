package com.perseuspotter.chicktilshelper;

import net.minecraft.block.state.IBlockState;
import net.minecraft.client.Minecraft;
import net.minecraft.entity.Entity;
import net.minecraft.util.BlockPos;
import net.minecraft.util.Vec3;
import net.minecraft.world.World;

import java.util.Iterator;

public class RaycastHelper {
    public static class DDA implements Iterator<BlockPos> {
        private int x;
        private int y;
        private int z;
        private final double mag;
        private final int sx;
        private final int sy;
        private final int sz;
        private final double tdx;
        private final double tdy;
        private final double tdz;
        private double tmx;
        private double tmy;
        private double tmz;

        public DDA(double x, double y, double z, double dx, double dy, double dz) {
            this.x = (int)x;
            this.y = (int)y;
            this.z = (int)z;
            mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
            double dx1 = dx / mag;
            double dy1 = dy / mag;
            double dz1 = dz / mag;
            sx = (int)Math.signum(dx1);
            sy = (int)Math.signum(dy1);
            sz = (int)Math.signum(dz1);
            tdx = Math.abs(1.0 / dx1);
            tdy = Math.abs(1.0 / dy1);
            tdz = Math.abs(1.0 / dz1);
            tmx = dx1 == 0.0 ? Double.POSITIVE_INFINITY : ((dx1 > 0.0 ? (this.x + 1.0 - x) : (x - this.x)) / Math.abs(dx1));
            tmy = dy1 == 0.0 ? Double.POSITIVE_INFINITY : ((dy1 > 0.0 ? (this.y + 1.0 - y) : (y - this.y)) / Math.abs(dy1));
            tmz = dz1 == 0.0 ? Double.POSITIVE_INFINITY : ((dz1 > 0.0 ? (this.z + 1.0 - z) : (z - this.z)) / Math.abs(dz1));
        }

        private double t = 0.0;

        @Override
        public boolean hasNext() {
            return t <= mag;
        }

        @Override
        public BlockPos next() {
            BlockPos bp = new BlockPos(x, y, z);

            if (tmx < tmy && tmx < tmz) {
                x += sx;
                t = tmx;
                tmx += tdx;
            } else if (tmy < tmz) {
                y += sy;
                t = tmy;
                tmy += tdy;
            } else {
                z += sz;
                t = tmz;
                tmz += tdz;
            }

            return bp;
        }

        public Iterable<BlockPos> asIterable() {
            return () -> this;
        }
    }

    public static class RaycastResult {
        public final IBlockState state;
        public final BlockPos pos;
        public RaycastResult(IBlockState state, BlockPos pos) {
            this.state = state;
            this.pos = pos;
        }
    }

    public static RaycastResult raycast(double x, double y, double z, double dx, double dy, double dz) {
        World w = Minecraft.getMinecraft().theWorld;

        for (BlockPos bp : new DDA(x, y, z, dx, dy, dz).asIterable()) {
            IBlockState bs = w.getBlockState(bp);

            if (BlockRegistry.isSolid(bs.getBlock())) return new RaycastResult(bs, bp);
        }

        return null;
    }
    public static RaycastResult raycast(Entity ent, float pt, double minDist, double maxDist) {
        Vec3 look = ent.getLook(pt);
        return raycast(
            ent.posX + look.xCoord * minDist,
            ent.posY + look.yCoord * minDist + ent.getEyeHeight(),
            ent.posZ + look.zCoord * minDist,
            look.xCoord * (maxDist - minDist),
            look.yCoord * (maxDist - minDist),
            look.zCoord * (maxDist - minDist)
        );
    }
}
