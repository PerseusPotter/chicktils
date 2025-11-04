package com.perseuspotter.chicktilshelper;

import net.minecraft.client.Minecraft;
import net.minecraft.entity.Entity;
import net.minecraft.util.BlockPos;
import net.minecraft.util.Vec3;
import net.minecraft.world.World;

import java.util.Iterator;
import java.util.PriorityQueue;

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
            this.x = (int) Math.floor(x);
            this.y = (int) Math.floor(y);
            this.z = (int) Math.floor(z);
            mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
            double dx1 = dx / mag;
            double dy1 = dy / mag;
            double dz1 = dz / mag;
            sx = (int) Math.signum(dx1);
            sy = (int) Math.signum(dy1);
            sz = (int) Math.signum(dz1);
            tdx = sx / dx1;
            tdy = sy / dy1;
            tdz = sz / dz1;
            tmx = dx1 == 0.0 ? Double.POSITIVE_INFINITY : (this.x + (dx1 > 0.0 ? 1.0 : 0.0) - x) / dx1;
            tmy = dy1 == 0.0 ? Double.POSITIVE_INFINITY : (this.y + (dy1 > 0.0 ? 1.0 : 0.0) - y) / dy1;
            tmz = dz1 == 0.0 ? Double.POSITIVE_INFINITY : (this.z + (dz1 > 0.0 ? 1.0 : 0.0) - z) / dz1;
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

    public static class BundleOfJoy implements Iterator<BundleOfJoy.Step> {
        public final DDA[] children;
        private final int[] emitCount;
        private final PriorityQueue<Step> q;

        public BundleOfJoy(DDA[] devils) {
            children = devils;
            emitCount = new int[devils.length];
            q = new PriorityQueue<>(devils.length);

            for (int i = 0; i < children.length; i++) {
                DDA d = children[i];
                if (!d.hasNext()) continue;
                BlockPos bp = d.next();
                q.add(new Step(i, bp, d.t, emitCount[i]++));
            }
        }

        @Override
        public boolean hasNext() {
            return !q.isEmpty();
        }

        public Step next() {
            Step f = q.poll();
            if (f == null) return f;

            DDA d = children[f.index];
            if (d.hasNext()) {
                BlockPos bp = d.next();
                q.add(new Step(f.index, bp, d.t, emitCount[f.index]++));
            }

            return f;
        }

        public Iterable<Step> asIterable() {
            return () -> this;
        }

        public static class Step implements Comparable<Step> {
            public final int index;
            public final BlockPos bp;
            private final double t;
            private final int c;

            public Step(int index, BlockPos bp, double t, int c) {
                this.index = index;
                this.bp = bp;
                this.t = t;
                this.c = c;
            }

            @Override
            public int compareTo(Step o) {
                if (c != o.c) return Integer.signum(c - o.c);
                if (index == 0) return 1;
                if (o.index == 0) return -1;
                return (int) Math.signum(t - o.t);
            }
        }
    }

    public static BlockPos raycast(
        double x, double y, double z,
        double dx, double dy, double dz
    ) {
        World w = Minecraft.getMinecraft().theWorld;

        for (BlockPos bp : new DDA(x, y, z, dx, dy, dz).asIterable()) {
            if (BlockRegistry.isSolid(w.getBlockState(bp).getBlock())) return bp;
        }

        return null;
    }

    public static BlockPos raycast(Entity ent, float pt, double minDist, double maxDist) {
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

    public static BlockPos transmission(
        double x, double y, double z,
        double dx, double dy, double dz
    ) {
        World wld = Minecraft.getMinecraft().theWorld;
        BlockPos result = null;

        for (BundleOfJoy.Step s : new BundleOfJoy(new DDA[] {
            new DDA(x, y, z, dx, dy, dz),
            new DDA(x, y + 1, z, dx, dy, dz),

            new DDA(x - 0.6 * 0.5, y, z - 0.6 * 0.5, dx, dy, dz),
            new DDA(x - 0.6 * 0.5, y, z + 0.6 * 0.5, dx, dy, dz),
            new DDA(x - 0.6 * 0.5, y + 1, z - 0.6 * 0.5, dx, dy, dz),
            new DDA(x - 0.6 * 0.5, y + 1, z + 0.6 * 0.5, dx, dy, dz),
            new DDA(x + 0.6 * 0.5, y, z - 0.6 * 0.5, dx, dy, dz),
            new DDA(x + 0.6 * 0.5, y, z + 0.6 * 0.5, dx, dy, dz),
            new DDA(x + 0.6 * 0.5, y + 1, z - 0.6 * 0.5, dx, dy, dz),
            new DDA(x + 0.6 * 0.5, y + 1, z + 0.6 * 0.5, dx, dy, dz)
        }).asIterable()) {
            BlockPos bp = s.bp;

            if (BlockRegistry.isSolid(wld.getBlockState(bp).getBlock())) break;

            if (s.index == 0) result = bp.down();
        }

        return result;
    }

    public static BlockPos transmission(Entity ent, float pt, double minDist, double maxDist) {
        Vec3 look = ent.getLook(pt);
        return transmission(
            ent.posX + look.xCoord * minDist,
            ent.posY + look.yCoord * minDist + ent.getEyeHeight(),
            ent.posZ + look.zCoord * minDist,
            look.xCoord * (maxDist - minDist),
            look.yCoord * (maxDist - minDist),
            look.zCoord * (maxDist - minDist)
        );
    }
}
