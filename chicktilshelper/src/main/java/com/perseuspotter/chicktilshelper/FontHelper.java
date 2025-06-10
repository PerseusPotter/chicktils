package com.perseuspotter.chicktilshelper;

import java.awt.*;
import java.awt.font.TextAttribute;
import java.awt.font.TextLayout;
import java.text.AttributedCharacterIterator;
import java.text.AttributedString;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FontHelper {
    public static class LineData {
        public final AttributedString a;
        public final AttributedString b;
        public final obfObj[] o;
        public final double w;
        public final double vw;

        LineData(AttributedString a, AttributedString b, obfObj[] o, double w, double vw) {
            this.a = a;
            this.b = b;
            this.o = o;
            this.w = w;
            this.vw = vw;
        }
    }

    static class attsObj {
        public final char t;
        public final int s;
        public final int e;

        attsObj(char t, int s, int e) {
            this.t = t;
            this.s = s;
            this.e = e;
        }
    }

    public static class obfObj {
        public double a;
        public final int s;
        public final int e;

        obfObj(int s, int e) {
            this.s = s;
            this.e = e;
        }
    }

    private static boolean isColorCode(char c) {
        return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f');
    }

    private static void addAttribute(AttributedString str, AttributedCharacterIterator.Attribute a, Object v, int s, int e) {
        if (str == null) return;
        if (s >= e) return;
        str.addAttribute(a, v, s, e);
    }

    private static void setFontAttrOhShit(AttributedString att, char c, Font f, int i) {
        if (!f.canDisplay(c)) {
            Font n = ohShitFindAFontForThisCharacterSobs(c);
            if (n != null) f = n;
        }
        addAttribute(att, TextAttribute.FONT, f, i, i + 1);
    }

    private static Map<Character, Font> ohShitIRememberThisOne = new HashMap<>();
    private static Font ohShitFindAFontForThisCharacterSobs(char c) {
        // null :sob:
        if (!ohShitIRememberThisOne.containsKey(c)) ohShitIRememberThisOne.put(c, ohShitFindAFontForThisCharacterButActuallyFindIt(c));
        return ohShitIRememberThisOne.get(c);
    }
    private static Font ohShitFindAFontForThisCharacterButActuallyFindIt(char c) {
        for (Font f : GraphicsEnvironment.getLocalGraphicsEnvironment().getAllFonts()) {
            if (f.canDisplay(c)) return f;
        }
        return null;
    }

    private static void setFontAttr(AttributedString att, char[] str, Font f1, Font f2, int s, int e) {
        if (att == null) return;
        if (s >= e) return;
        if (s >= str.length) return;
        if (e > str.length) return;

        int i = f1.canDisplayUpTo(str, s, e);
        while (s < str.length && i >= 0) {
            addAttribute(att, TextAttribute.FONT, f1, s, i);
            setFontAttrOhShit(att, str[i], f2, i);
            s = i + 1;
            i = f1.canDisplayUpTo(str, s, e);
        }
        addAttribute(att, TextAttribute.FONT, f1, s, e);
    }

    private static final Map<Character, Color> COLORS1 = new HashMap<>();
    private static final Map<Character, Color> COLORS2 = new HashMap<>();

    static {
        COLORS1.put('0', new Color(0));
        COLORS1.put('1', new Color(170));
        COLORS1.put('2', new Color(43520));
        COLORS1.put('3', new Color(43690));
        COLORS1.put('4', new Color(11141120));
        COLORS1.put('5', new Color(11141290));
        COLORS1.put('6', new Color(16755200));
        COLORS1.put('7', new Color(11184810));
        COLORS1.put('8', new Color(5592405));
        COLORS1.put('9', new Color(5592575));
        COLORS1.put('a', new Color(5635925));
        COLORS1.put('b', new Color(5636095));
        COLORS1.put('c', new Color(16733525));
        COLORS1.put('d', new Color(16733695));
        COLORS1.put('e', new Color(16777045));
        COLORS1.put('f', new Color(16777215));
        COLORS2.put('0', new Color(0));
        COLORS2.put('1', new Color(42));
        COLORS2.put('2', new Color(10752));
        COLORS2.put('3', new Color(10794));
        COLORS2.put('4', new Color(2752512));
        COLORS2.put('5', new Color(2752554));
        COLORS2.put('6', new Color(4139520));
        COLORS2.put('7', new Color(2763306));
        COLORS2.put('8', new Color(1381653));
        COLORS2.put('9', new Color(1381695));
        COLORS2.put('a', new Color(1392405));
        COLORS2.put('b', new Color(1392447));
        COLORS2.put('c', new Color(4134165));
        COLORS2.put('d', new Color(4134207));
        COLORS2.put('e', new Color(4144917));
        COLORS2.put('f', new Color(4144959));
    }

    public static LineData processString(String str, boolean shadow, Graphics2D g, Font f1, Font f2, Font f3, int FONT_RENDERER_SIZE) {
        str = str + "&r";
        final StringBuilder sb = new StringBuilder();
        final List<obfObj> o = new ArrayList<>();
        final List<attsObj> atts = new ArrayList<>();
        List<attsObj> cAtts = new ArrayList<>();
        int obfS = -1;

        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if ((c == '&' || c == '§') && i < str.length() - 1) {
                char k = str.charAt(i + 1);
                if (isColorCode(k)) {
                    cAtts = cAtts
                            .stream()
                            .filter(v -> {
                                if (!isColorCode(v.t)) return true;
                                atts.add(new attsObj(v.t, v.s, sb.length()));
                                return false;
                            })
                            .collect(Collectors.toList());
                    cAtts.add(new attsObj(k, sb.length(), 0));
                    i++;
                    continue;
                }
                if (k == 'k') {
                    obfS = sb.length();
                    i++;
                    continue;
                }
                if (k == 'l' || k == 'o' || k == 'm' || k == 'n') {
                    cAtts.add(new attsObj(k, sb.length(), 0));
                    i++;
                    continue;
                }
                if (k == 'r') {
                    cAtts.forEach(v -> atts.add(new attsObj(v.t, v.s, sb.length())));
                    cAtts.clear();
                    if (obfS >= 0) o.add(new obfObj(obfS, sb.length()));
                    obfS = -1;
                    i++;
                    continue;
                }
            }
            sb.append(obfS >= 0 ? ' ' : c);
        }

        final String s = sb.toString();
        final char[] ca = s.toCharArray();
        final AttributedString a = new AttributedString(s);
        final AttributedString b = shadow ? new AttributedString(s) : null;

        addAttribute(a, TextAttribute.SIZE, FONT_RENDERER_SIZE, 0, s.length());
        addAttribute(b, TextAttribute.SIZE, FONT_RENDERER_SIZE, 0, s.length());
        int end = 0;
        for (final obfObj v : o) {
            setFontAttr(a, ca, f1, f3, end, v.s);
            setFontAttr(b, ca, f1, f3, end, v.s);
            addAttribute(a, TextAttribute.FONT, f2, v.s, v.e);
            addAttribute(b, TextAttribute.FONT, f2, v.s, v.e);
            end = v.e;
        }
        setFontAttr(a, ca, f1, f3, end, s.length());
        setFontAttr(b, ca, f1, f3, end, s.length());

        atts.forEach(v -> {
            if (isColorCode(v.t)) {
                addAttribute(a, TextAttribute.FOREGROUND, COLORS1.get(v.t), v.s, v.e);
                addAttribute(b, TextAttribute.FOREGROUND, COLORS2.get(v.t), v.s, v.e);
            } else if (v.t == 'l') {
                addAttribute(b, TextAttribute.WEIGHT, TextAttribute.WEIGHT_BOLD, v.s, v.e);
                addAttribute(a, TextAttribute.WEIGHT, TextAttribute.WEIGHT_BOLD, v.s, v.e);
            } else if (v.t == 'o') {
                addAttribute(b, TextAttribute.POSTURE, TextAttribute.POSTURE_OBLIQUE, v.s, v.e);
                addAttribute(a, TextAttribute.POSTURE, TextAttribute.POSTURE_OBLIQUE, v.s, v.e);
            } else if (v.t == 'm') {
                addAttribute(b, TextAttribute.STRIKETHROUGH, TextAttribute.STRIKETHROUGH_ON, v.s, v.e);
                addAttribute(a, TextAttribute.STRIKETHROUGH, TextAttribute.STRIKETHROUGH_ON, v.s, v.e);
            } else if (v.t == 'n') {
                addAttribute(b, TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_LOW_ONE_PIXEL, v.s, v.e);
                addAttribute(a, TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_LOW_ONE_PIXEL, v.s, v.e);
            } else throw new RuntimeException("unknown attribute: " + v.t);
        });

        o.forEach(v -> v.a = new TextLayout(a.getIterator(null, v.s, v.e), g.getFontRenderContext()).getAdvance());
        TextLayout tyl = new TextLayout(a.getIterator(), g.getFontRenderContext());

        return new LineData(a, b, o.toArray(new obfObj[0]), tyl.getAdvance(), tyl.getVisibleAdvance());
    }
}
