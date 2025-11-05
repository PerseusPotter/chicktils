package com.perseuspotter.chicktilshelper;

public class ProjectileHelper {
    public static class ProjectileData {
        public final double theta;
        public final double phi;
        public final double ticks;

        ProjectileData(double theta, double phi, double ticks) {
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
    public static ProjectileData solve(
        double dx, double dy, double dz,
        double eps,
        double a, double v, double d,
        boolean high
    ) {
        if (d == 1.0) throw new IllegalArgumentException("sorry");
        final double theta = Math.atan2(dz, dx);
        final double R = Math.sqrt(dx * dx + dz * dz);

        final double f = 1.0 / (d - 1.0);
        final double lnd = Math.log(d);
        final double inv_a = 1.0 / a;
        final double inv_lnd = 1.0 / lnd;

        double A = v + a * f;
        double r = -(dy * (d - 1) + A) * inv_a;
        double B = -A * lnd * Math.exp(lnd * r) * inv_a;
        if (B < NEG_INV_E) return new ProjectileData(Double.NaN, Double.NaN, Double.NaN);

        if (dy > 0.0 && !high) {
            double searchL = 0.0;
            double searchR = Math.PI / 2.0;
            double t = 0.0;

            while (searchR - searchL > eps) {
                final double m = (searchL + searchR) / 2.0;
                A = v * Math.cos(m) + a * f;
                r = -(dy * (d - 1) + A) * inv_a;
                B = -A * lnd * Math.exp(lnd * r) * inv_a;
                if (B < NEG_INV_E) searchR = m;
                else {
                    t = r - inv_lnd * MathHelper.lambertW1(B);
                    final double x = v * Math.sin(m) * (Math.exp(lnd * t) - 1) * f;
                    if (x < R) searchL = m;
                    else searchR = m;
                }
            }

            return new ProjectileData(theta, (searchL + searchR) / 2.0, t);
        }

        double maxDomain = dy > 0.0 ? Math.PI / 2.0 : Math.PI;
        double searchL = 0.0;
        double searchR = maxDomain;
        double x1 = 0.0;
        double x2 = 0.0;

        while (true) {
            final double windowSize = searchR - searchL;
            if (windowSize < eps) break;
            final double m1 = windowSize / 3.0 + searchL;
            A = v * Math.cos(m1) + a * f;
            r = -(dy * (d - 1) + A) * inv_a;
            B = -A * lnd * Math.exp(lnd * r) * inv_a;
            if (B < NEG_INV_E) searchR = maxDomain = m1;
            else {
                x1 = v * Math.sin(m1) * (Math.exp(lnd * (r - inv_lnd * MathHelper.lambertW0(B))) - 1) * f;
                final double m2 = windowSize * 2.0 / 3.0 + searchL;
                A = v * Math.cos(m2) + a * f;
                r = -(dy * (d - 1) + A) * inv_a;
                B = -A * lnd * Math.exp(lnd * r) * inv_a;
                if (B < NEG_INV_E) searchR = maxDomain = m2;
                else {
                    x2 = v * Math.sin(m2) * (Math.exp(lnd * (r - inv_lnd * MathHelper.lambertW0(B))) - 1) * f;
                    if (x1 < x2) searchL = m1;
                    else searchR = m2;
                }
            }
        }

        if (R > (x1 + x2) / 2.0) return new ProjectileData(Double.NaN, Double.NaN, Double.NaN);

        final double peak = (searchL + searchR) / 2.0;
        searchL = high ? 0.0 : peak;
        searchR = high ? peak : maxDomain;
        double t = Double.NaN;

        while (searchR - searchL > eps) {
            final double m = (searchL + searchR) / 2.0;
            A = v * Math.cos(m) + a * f;
            r = -(dy * (d - 1) + A) * inv_a;
            B = -A * lnd * Math.exp(lnd * r) * inv_a;
            if (B < NEG_INV_E) searchR = m;
            else {
                t = r - inv_lnd * MathHelper.lambertW0(B);
                x1 = v * Math.sin(m) * (Math.exp(lnd * t) - 1) * f;
                if (x1 < R == high) searchL = m;
                else searchR = m;
            }
        }

        return new ProjectileData(theta, (searchL + searchR) / 2.0, t);
    }

    // 3 <= ticks <= 20
    public static double bowVelocity(int ticks) {
        double t = ticks * 0.05;
        double v = t * t + 2.0 * t;
        return v < 0.3 ? 0.0 : Math.min(3.0, v);
    }

    // finds (max ? largest : smallest) number such that max height doesn't exceed maxDy
    // while still being able to reach the target
    public static int bestPrefireTick(
        double dx, double dy, double dz,
        double maxDy,
        double eps,
        boolean max
    ) {
        final double a = -0.05;
        final double d = 0.99;
        final double a_id = a / (d - 1);
        final double lnd = Math.log(d);

        int l = 3;
        int r = 20;
        int val = -1;

        while (l <= r) {
            int m = (l + r) >> 1;
            double v = bowVelocity(m);
            ProjectileData data = solve(
                dx, dy, dz,
                eps,
                a, v, d,
                true
            );

            if (Double.isNaN(data.theta)) {
                l = m + 1;
                continue;
            }

            double vy = Math.cos(data.phi) * v;
            double yPeak = 0.0;
            if (vy > 0.0) {
                double t = Math.log(a_id / (vy + a_id)) / lnd;
                yPeak = (vy + a_id) * (Math.pow(d, t + 1) - 1) / (d - 1) - (t + 1) * a_id;
            }

            if (yPeak < maxDy) val = m;
            if (yPeak < maxDy && max) l = m + 1;
            else r = m - 1;
        }

        return val;
    }
}
