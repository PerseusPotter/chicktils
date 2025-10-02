package com.perseuspotter.chicktilshelper;

public class MathHelper {
    // fastapprox v0.3.2
    /*=====================================================================*
     *                   Copyright (C) 2011 Paul Mineiro                   *
     * All rights reserved.                                                *
     *                                                                     *
     * Redistribution and use in source and binary forms, with             *
     * or without modification, are permitted provided that the            *
     * following conditions are met:                                       *
     *                                                                     *
     *     * Redistributions of source code must retain the                *
     *     above copyright notice, this list of conditions and             *
     *     the following disclaimer.                                       *
     *                                                                     *
     *     * Redistributions in binary form must reproduce the             *
     *     above copyright notice, this list of conditions and             *
     *     the following disclaimer in the documentation and/or            *
     *     other materials provided with the distribution.                 *
     *                                                                     *
     *     * Neither the name of Paul Mineiro nor the names                *
     *     of other contributors may be used to endorse or promote         *
     *     products derived from this software without specific            *
     *     prior written permission.                                       *
     *                                                                     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND              *
     * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,         *
     * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES               *
     * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE             *
     * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER               *
     * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                 *
     * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES            *
     * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE           *
     * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR                *
     * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF          *
     * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT           *
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY              *
     * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE             *
     * POSSIBILITY OF SUCH DAMAGE.                                         *
     *                                                                     *
     * Contact: Paul Mineiro <paul@mineiro.com>                            *
     *=====================================================================*/
    public static float fastLambertW0(float x) {
        final float threshold = 2.26445f;

        final float c = (x < threshold) ? 1.546865557f : 1.0f;
        final float d = (x < threshold) ? 2.250366841f : 0.0f;
        final float a = (x < threshold) ? -0.737769969f : 0.0f;

        final float logterm = fastLog(c * x + d);
        final float loglogterm = fastLog(logterm);

        final float minusw = -a - logterm + loglogterm - loglogterm / logterm;
        final float expminusw = fastExp(minusw);
        final float xexpminusw = x * expminusw;
        final float pexpminusw = xexpminusw - minusw;

        return (2.0f * xexpminusw - minusw * (4.0f * xexpminusw - minusw * pexpminusw)) / (2.0f + pexpminusw * (2.0f - minusw));
    }

    public static float fastLog2(float x) {
        final int vx = Float.floatToRawIntBits(x);
        final float mx = Float.intBitsToFloat((vx & 0x007FFFFF) | 0x3f000000);

        return vx * 1.1920928955078125e-7f - 124.22551499f - 1.498030302f * mx - 1.72587999f / (0.3520887068f + mx);
    }

    public static float fastLog(float x) {
        return 0.69314718f * fastLog2(x);
    }

    public static float fastPow2(float p) {
        final float offset = (p < 0) ? 1.0f : 0.0f;
        final float clipp = (p < -126) ? -126.0f : p;
        final int w = (int) clipp;
        final float z = clipp - w + offset;

        return Float.intBitsToFloat((int) ((1 << 23) * (clipp + 121.2740575f + 27.7280233f / (4.84252568f - z) - 1.49012907f * z)));
    }

    public static float fastExp(float p) {
        return fastPow2(1.442695040f * p);
    }

    // http://doi.org/10.1016/j.cpc.2012.07.008
    // https://doi.org/10.1016/S0378-4754(02)00051-4

    public static double lambertW0(double x) {
        if (x < -1.0 / Math.E) return Double.NaN;
        return x == 0.0 ? 0.0 : lambertWFritschIteration(x, fastLambertW0((float) x), 1, Double.MIN_VALUE);
    }

    public static double lambertW1(double x) {
        if (x < -1.0 / Math.E || 0.0 <= x) return Double.NaN;
        return lambertWFritschIteration(x, lambertW1Guess(x), 1, Double.MIN_VALUE);
    }

    public static double lambertWFritschIteration(double x, double W, double iter, double eps) {
        double r = Math.abs(W - Math.log(Math.abs(x)) + Math.log(Math.abs(W)));

        while (r > eps && --iter >= 0) {
            final double z = Math.log(x / W) - W;
            final double q = 2 * (1 + W) * (1 + W + (2.0 / 3.0) * z);
            final double eps_term = z * (q - z) / ((1 + W) * (q - 2 * z));
            W = W * (1 + eps_term);

            r = Math.abs(W - Math.log(Math.abs(x)) + Math.log(Math.abs(W)));
        }

        return Double.isNaN(W) ? 0.0 : W;
    }

    public static double lambertW1Guess(double x) {
        final double M1 = 0.3361;
        final double M2 = -0.0042;
        final double M3 = -0.0201;

        final double sigma = -1 - Math.log(-x);
        final double sqrt_sigma = Math.sqrt(sigma);
        final double expr = (M1 * sqrt_sigma / 2) / (1 + M2 * sigma * Math.exp(M3 * sqrt_sigma));
        return -1 - sigma - (2 / M1) * (1 - 1 / (1 + expr));
    }
}