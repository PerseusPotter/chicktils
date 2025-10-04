package com.perseuspotter.chicktilshelper;

import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.ChatLine;
import net.minecraft.client.gui.GuiNewChat;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.entity.player.ItemTooltipEvent;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.Mod.EventHandler;
import net.minecraftforge.fml.common.event.FMLInitializationEvent;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URLConnection;
import java.nio.ByteBuffer;
import java.util.*;

@Mod(modid = ChickTilsHelper.MODID, version = ChickTilsHelper.VERSION)
public class ChickTilsHelper {

    public static final String MODID = "chicktilshelper";
    public static final String VERSION = "1.0";

    public static final ChickTilsHelper instance = new ChickTilsHelper();

    @EventHandler
    public void init(FMLInitializationEvent event) {
        MinecraftForge.EVENT_BUS.register(this);
    }

    public static void clearTooltip(ItemTooltipEvent evn) {
        ((List<String>) (evn.toolTip)).clear();
    }

    public static void addTooltip(ItemTooltipEvent evn, String str) {
        ((List<String>) (evn.toolTip)).add(str);
    }

    public static void deleteChatIds(int start, int end) {
        if (end <= start) return;
        GuiNewChat gui = Minecraft.getMinecraft().ingameGUI.getChatGUI();
        try {
            Field prop = GuiNewChat.class.getDeclaredField("field_146252_h");
            prop.setAccessible(true);
            @SuppressWarnings("unchecked")
            List<ChatLine> lines = (List<ChatLine>) prop.get(gui);

            int c = end - start;
            ListIterator<ChatLine> iter = lines.listIterator(lines.size());
            while (iter.hasPrevious()) {
                int id = iter.previous().getChatLineID();
                if (start <= id && id < end) {
                    iter.remove();
                    if (--c == 0) break;
                }
            }

            gui.refreshChat();
        } catch (NoSuchFieldException | IllegalAccessException ignored) {}
    }

    public static void deleteChatId(int target) {
        GuiNewChat gui = Minecraft.getMinecraft().ingameGUI.getChatGUI();
        try {
            Field prop = GuiNewChat.class.getDeclaredField("field_146252_h");
            prop.setAccessible(true);
            @SuppressWarnings("unchecked")
            List<ChatLine> lines = (List<ChatLine>) prop.get(gui);

            ListIterator<ChatLine> iter = lines.listIterator(lines.size());
            while (iter.hasPrevious()) {
                int id = iter.previous().getChatLineID();
                if (id == target) {
                    iter.remove();
                    break;
                }
            }

            gui.refreshChat();
        } catch (NoSuchFieldException | IllegalAccessException ignored) {}
    }

    // https://stackoverflow.com/a/2752455
    private static final TrustManager[] trustAllCerts = new TrustManager[] {
        new X509TrustManager() {
            public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                return null;
            }

            public void checkClientTrusted(
                java.security.cert.X509Certificate[] certs,
                String authType
            ) {}

            public void checkServerTrusted(
                java.security.cert.X509Certificate[] certs,
                String authType
            ) {}
        },
    };

    public static void removeCertCheck(URLConnection url) {
        try {
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, null);
            ((HttpsURLConnection) url).setSSLSocketFactory(sc.getSocketFactory());
        } catch (Exception e) {}
    }

    // not scuffed tf you mean?
    public static boolean removeLastElement(Field f, Object o) {
        try {
            List<?> arr = (List<?>) f.get(o);
            arr.remove(arr.size() - 1);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean removeElementSet(Field f, Object o, Object r) {
        try {
            Set<?> set = (Set<?>) f.get(o);
            set.remove(r);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean removeElementMap(Field f, Object o, Object r) {
        try {
            Map<?, ?> map = (Map<?, ?>) f.get(o);
            map.remove(r);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static <T> boolean addElementList(Field f, Object o, T v) {
        try {
            List<T> arr = (List<T>) f.get(o);
            arr.add(v);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static String base64Encode(Method m, Object o, Object[] args) {
        try {
            Object r = m.invoke(o, args);
            return Base64.getEncoder().encodeToString((byte[]) r);
        } catch (Exception e) {
            return "";
        }
    }

    public static String base64EncodeInt(Method m, Object o, Object[] args) {
        try {
            Object r = m.invoke(o, args);
            int[] arr = (int[]) r;
            ByteBuffer buf = ByteBuffer.allocate(arr.length * 4);
            for (int n : arr) buf.putInt(n);
            return Base64.getEncoder().encodeToString(buf.array());
        } catch (Exception e) {
            return "";
        }
    }
}
