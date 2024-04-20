package com.perseuspotter.chicktilshelper;

import java.lang.reflect.Field;
import java.util.List;
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

  public static boolean contains(List<String> strs, String str) {
    for (int i = 0; i < strs.size(); i++) {
      if (strs.get(i).equals(str)) return true;
    }
    return false;
  }

  public static void deleteMessages(List<String> str) {
    try {
      GuiNewChat gui = Minecraft.getMinecraft().ingameGUI.getChatGUI();
      Field prop = GuiNewChat.class.getDeclaredField("field_146252_h");
      prop.setAccessible(true);
      List<ChatLine> lines = (List<ChatLine>) prop.get(gui);

      for (int i = lines.size() - 1; i >= 0; i--) {
        ChatLine c = lines.get(i);
        try {
          if (
            contains(str, c.getChatComponent().getFormattedText())
            // str.contains(c.getChatComponent().getFormattedText().substring(4))
          ) lines.remove(i);
        } catch (StringIndexOutOfBoundsException e) {}
      }

      gui.refreshChat();
    } catch (IllegalAccessException e) {} catch (
      NoSuchFieldException e
    ) {} catch (NullPointerException e) {}
  }
}
