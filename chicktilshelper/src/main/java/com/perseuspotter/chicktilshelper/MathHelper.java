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

    public static float fastSqrt(float x) {
        return fastPow2(0.5f * fastLog2(x));
    }
}
