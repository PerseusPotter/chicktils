package com.perseuspotter.chicktilshelper;

import java.lang.reflect.Field;
import java.net.URLConnection;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.ChatLine;
import net.minecraft.client.gui.GuiNewChat;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.entity.player.ItemTooltipEvent;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.Mod.EventHandler;
import net.minecraftforge.fml.common.event.FMLInitializationEvent;

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

  public static boolean contains(String[] strs, String str) {
    for (int i = 0; i < strs.length; i++) {
      if (strs[i].equals(str)) return true;
    }
    return false;
  }

  public static String trimReset(String str) {
    int l = -2;
    while (l + 2 < str.length()) {
      if (
        (str.charAt(l + 2) == '§' || str.charAt(l + 2) == '&') &&
        str.charAt(l + 3) == 'r'
      ) l += 2; else break;
    }
    int r = str.length();
    while (r - 2 >= 0) {
      if (
        (str.charAt(r - 2) == '§' || str.charAt(r - 2) == '&') &&
        str.charAt(r - 1) == 'r'
      ) r -= 2; else break;
    }
    return str.substring(l + 2, r);
  }

  public static void deleteMessages(List<String> str) {
    try {
      long start = System.currentTimeMillis();
      GuiNewChat gui = Minecraft.getMinecraft().ingameGUI.getChatGUI();
      Field prop = GuiNewChat.class.getDeclaredField("field_146252_h");
      prop.setAccessible(true);
      @SuppressWarnings("unchecked")
      List<ChatLine> lines = (List<ChatLine>) prop.get(gui);

      String[] strs = new String[str.size()];
      for (int i = 0; i < str.size(); i++) strs[i] = trimReset(str.get(i));
      for (int i = 0; i < lines.size(); i++) {
        if (System.currentTimeMillis() - start > 50) break;
        ChatLine c = lines.get(i);
        try {
          if (
            contains(strs, trimReset(c.getChatComponent().getFormattedText()))
            // str.contains(c.getChatComponent().getFormattedText().substring(4))
          ) lines.remove(i--);
        } catch (StringIndexOutOfBoundsException e) {}
      }

      gui.refreshChat();
    } catch (IllegalAccessException e) {} catch (
      NoSuchFieldException e
    ) {} catch (NullPointerException e) {}
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
      CopyOnWriteArrayList<?> arr = (CopyOnWriteArrayList<?>) f.get(o);
      arr.remove(arr.size() - 1);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
