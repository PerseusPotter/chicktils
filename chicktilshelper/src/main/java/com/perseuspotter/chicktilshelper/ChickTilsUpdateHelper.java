package com.perseuspotter.chicktilshelper;

import java.io.File;

public class ChickTilsUpdateHelper {

  public static void main(String[] args) throws Exception {
    boolean done = false;
    do {
      done = true;
      for (String s : args) {
        File f = new File(s);
        if (!f.exists()) continue;
        if (!f.delete()) done = false;
      }
      Thread.sleep(500);
    } while (!done);
  }
}
