package com.perseuspotter.chicktilshelper;

public class PearlHelper {
    // https://github.com/protobi/lambertw
    private static final double GSL_DBL_EPSILON = 2.2204460492503131e-16;
    private static final double ONE_OVER_E = 1.0 / Math.E;

    private static double halleyIteration(double x, double w0, int maxIters) {
        double w = w0;

        while (--maxIters >= 0) {
            final double e = Math.exp(w);
            final double p = w + 1.0;
            double t = w * e - x;

            if (w > 0.0) t /= p / e;
            else t /= e * p - 0.5 * t * (p + 1.0) / p;

            w -= t;
            final double tol = GSL_DBL_EPSILON * Math.max(Math.abs(w), 1.0 / (Math.abs(p) * e));
            if (Math.abs(t) < tol) return w;
        }

        return w;
    }

    private static final double[] $C = new double[]{
            -1.0,
            2.331643981597124203363536062168,
            -1.812187885639363490240191647568,
            1.936631114492359755363277457668,
            -2.353551201881614516821543561516,
            3.066858901050631912893148922704,
            -4.175335600258177138854984177460,
            5.858023729874774148815053846119,
            -8.401032217523977370984161688514,
            12.250753501314460424,
            -18.100697012472442755,
            27.029044799010561650
    };

    private static double seriesEval(double r) {
        final double t8 = $C[8] + r * ($C[9] + r * ($C[10] + r * $C[11]));
        final double t5 = $C[5] + r * ($C[6] + r * ($C[7] + r * t8));
        final double t1 = $C[1] + r * ($C[2] + r * ($C[3] + r * ($C[4] + r * t5)));
        return $C[0] + r * t1;
    }

    private static double lambertW0(double x) {
        if (x == 0.0) return 0.0;

        final double q = x + ONE_OVER_E;
        if (q <= 0.0) return -1.0;
        if (q < 1e-3) return seriesEval(Math.sqrt(q));

        double w;
        if (x < 1.0) {
            final double p = Math.sqrt(2 * Math.E * q);
            w = -1.0 + p * (1.0 + p * (-1.0 / 3.0 + p * 11.0 / 72.0));
        } else {
            w = Math.log(x);
            if (x > 3) w -= Math.log(w);
        }

        return halleyIteration(x, w, 100);
    }

    public static class PearlData {
        public final double theta;
        public final double phi;
        public final double ticks;

        PearlData(double theta, double phi, double ticks) {
            this.theta = theta;
            this.phi = phi;
            this.ticks = ticks;
        }
    }

    /*
     * t_{heta}=y_{aw}+90
     * p_{hi}=p_{itch}+90
     * v=1.5
     * a=-0.03
     * d=-0.01
     * v_{x}\left(t\right)=\left(1+d\right)^{t}v\sin\left(p_{hi}\right)\cos\left(t_{heta}\right)
     * v_{y}\left(t\right)=\left(1+d\right)^{t}v\cos\left(p_{hi}\right)+a\frac{\left(1+d\right)^{t}-1}{d}
     * v_{z}\left(t\right)=\left(1+d\right)^{t}v\sin\left(p_{hi}\right)\sin\left(t_{heta}\right)
     * p\left(t\right)=\left(\sum_{n=0}^{t-1}v_{x}\left(n\right)+x_{0},\sum_{n=0}^{t-1}v_{z}\left(n\right)+z_{0},\sum_{n=0}^{t-1}v_{y}\left(n\right)+y_{0}\right)
     * p\left(\left[0...100\right]\right)
     *
     * plug solution to y(t) into x, z to obtain new functions for landing point given angle
     * phi and solution to y(t) is same for both function so x is of form Ccos(theta) and z is of form Csin(theta)
     * use arctan to solve for theta
     *
     * pos_x(phi, theta) = (100 - 100 * 0.99 ^ y-1(phi)) * sin(phi) * cos(theta)
     */
    private static final double a = -0.03;
    private static final double v = 1.5;
    private static final double v2 = v * v;

    public static PearlData solve(double dx, double dy, double dz, double err) {
        final double theta = Math.atan2(dz, dx);
        final double R = Math.hypot(dx, dz);
        dy = -dy;

        double phi;
        {
            final double R2 = R * R;
            final double y2 = dy * dy;
            phi = Math.PI - Math.acos(-Math.sqrt((R2 * Math.sqrt(-a * a * R2 - 2 * a * dy * v2 + v2 * v2) + a * R2 * dy + R2 * v2 + 2 * y2 * v2) / (v2 * (R2 + y2))) / Math.sqrt(2));
        }
        if (Double.isNaN(phi)) return new PearlData(Double.NaN, Double.NaN, Double.NaN);

        double d = 1;
        double dp = 1.0 / 180.0 * Math.PI;
        double t;
        double r;
        double pr = 0;
        int i = 0;
        rngcarried:
        do {
            double td = 0;
            do {
                phi += td * dp;
                final double vy = v * Math.cos(phi);
                t = 33.1664 * (1.00503 * vy + 0.00100503 * dy + 3.0 * lambertW0(-0.122625 * Math.exp(-0.335011 * vy - 0.00335011 * dy) * (vy + 3)) + 3.0151);
                r = Math.abs(v * (100 - 100 * Math.pow(0.99, t)) * Math.sin(phi));
                if (td > 0 && r < pr) return new PearlData(Double.NaN, Double.NaN, Double.NaN);
                td = Math.signum(R - r);
                pr = r;
                if (td == 0) break rngcarried;
            } while (td == d && i++ < 100);
            d = td;
            dp /= 2;
        } while (Math.abs(R - r) > err && i < 100);

        return new PearlData(theta, phi, t);
    }
}
