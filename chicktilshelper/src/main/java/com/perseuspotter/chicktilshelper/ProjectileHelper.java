package com.perseuspotter.chicktilshelper;

public class ProjectileHelper {
    public static class ProjectileData {
        public final float theta;
        public final float phi;
        public final float ticks;

        ProjectileData(float theta, float phi, float ticks) {
            this.theta = theta;
            this.phi = phi;
            this.ticks = ticks;
        }

        public String toString() {
            return String.format("%.1f %.1f %.2f", theta * 180 / Math.PI, phi * 180 / Math.PI, ticks / 20);
        }
    }

    private static final double NEG_INV_E = -1.0 / Math.E;

    // https://www.desmos.com/calculator/pxggrut9gf
    // V(n) = d * V(n - 1) + a
    // P(t) = integral V(floor(n)) = summation
    // V(n) is a linear recurrence relation
    // simplifies to (V0 + a / (d - 1)) * d^n - a / (d + 1)
    // summation simplifies to (V0 + a / (d - 1)) (d^t - 1) / (d - 1) - a * t / (d - 1) where d != 1
    // closed form of inverse can be found using lambert W
    // more math
    public static ProjectileData solve(float dx, float dy, float dz, float eps, float a, float v, float d, boolean high) {
        if (d == 1f) throw new IllegalArgumentException("sorry");
        final float theta = (float) Math.atan2(dz, dx);
        final float R = MathHelper.fastSqrt(dx * dx + dz * dz);

        final float f = 1f / (d - 1f);
        final float lnd = MathHelper.fastLog(d);
        final float inv_a = 1f / a;
        final float inv_lnd = 1f / lnd;

        float A = v + a * f;
        float r = -(dy * (d - 1) + A) * inv_a;
        float B = -A * lnd * MathHelper.fastExp(lnd * r) * inv_a;
        if (B < NEG_INV_E) return new ProjectileData(Float.NaN, Float.NaN, Float.NaN);

        float maxDomain = (float) (dy > 0f ? Math.PI / 2.0 : Math.PI);
        float searchL = 0f;
        float searchR = maxDomain;
        float x1 = 0f;
        float x2 = 0f;

        while (true) {
            final float windowSize = searchR - searchL;
            if (windowSize < eps) break;
            final float m1 = windowSize / 3f + searchL;
            A = v * (float) Math.cos(m1) + a * f;
            r = -(dy * (d - 1) + A) * inv_a;
            B = -A * lnd * MathHelper.fastExp(lnd * r) * inv_a;
            if (B < NEG_INV_E) searchR = maxDomain = m1;
            else {
                x1 = v * (float) Math.sin(m1) * (MathHelper.fastExp(lnd * (r - inv_lnd * MathHelper.fastLambertW0(B))) - 1) * f;
                final float m2 = windowSize * 2f / 3f + searchL;
                A = v * (float) Math.cos(m2) + a * f;
                r = -(dy * (d - 1) + A) * inv_a;
                B = -A * lnd * MathHelper.fastExp(lnd * r) * inv_a;
                if (B < NEG_INV_E) searchR = maxDomain = m2;
                else {
                    x2 = v * (float) Math.sin(m2) * (MathHelper.fastExp(lnd * (r - inv_lnd * MathHelper.fastLambertW0(B))) - 1) * f;
                    if (x1 < x2) searchL = m1;
                    else searchR = m2;
                }
            }
        }

        if (R > (x1 + x2) / 2f) return new ProjectileData(Float.NaN, Float.NaN, Float.NaN);

        final float peak = (searchL + searchR) / 2f;
        searchL = high ? 0f : peak;
        searchR = high ? peak : maxDomain;
        float t = Float.NaN;

        while (searchR - searchL > eps) {
            final float m = (searchL + searchR) / 2f;
            A = v * (float) Math.cos(m) + a * f;
            r = -(dy * (d - 1) + A) * inv_a;
            B = -A * lnd * MathHelper.fastExp(lnd * r) * inv_a;
            if (B < NEG_INV_E) searchR = m;
            else {
                t = r - inv_lnd * MathHelper.fastLambertW0(B);
                x1 = v * (float) Math.sin(m) * (MathHelper.fastExp(lnd * t) - 1) * f;
                if (x1 < R == high) searchL = m;
                else searchR = m;
            }
        }

        return new ProjectileData(theta, (searchL + searchR) / 2f, t);
    }
}
