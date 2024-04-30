package com.perseuspotter.chicktilshelper;

import java.awt.Font;
import java.util.Scanner;
import javax.swing.*;

public class InstaMidHelper {

  public static long lastBeat = System.currentTimeMillis();
  public static final long startTime = System.currentTimeMillis();

  public static void main(String[] args) throws Exception {
    KeepAlive heartbeat = new KeepAlive();
    Thread t = new Thread(heartbeat);
    t.start();
    boolean f = true;
    while (true) {
      Thread.sleep(100);
      long d = System.currentTimeMillis();
      if (d - startTime > 6000) break;
      if (d - lastBeat > 500) {
        if (f) showGui();
        f = false;
      } else if (!f) break;
    }
    System.exit(0);
  }

  public static void showGui() {
    JFrame frame = new JFrame("ChickTils Instamid");
    frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

    JLabel label = new JLabel("");
    label.setFont(new Font("Monospaced", Font.BOLD, 80));
    frame.getContentPane().add(label);

    frame.pack();
    frame.setVisible(true);

    frame.setAlwaysOnTop(true);

    new Thread(
      new Runnable() {
        public void run() {
          while (true) {
            long t = 6000 - System.currentTimeMillis() + startTime;
            label.setText(String.format("%d.%02d", t / 1000, (t % 1000) / 10));
            frame.pack();
            try {
              Thread.sleep(10);
            } catch (Exception e) {}
          }
        }
      }
    )
      .start();
  }
}

class KeepAlive implements Runnable {

  public Scanner sc = null;

  public void run() {
    sc = new Scanner(System.in);
    while (!Thread.interrupted()) {
      sc.nextLine();
      InstaMidHelper.lastBeat = System.currentTimeMillis();
    }
  }

  public void close() {
    sc.close();
  }
}
