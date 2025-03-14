package com.perseuspotter.chicktilshelper;

import java.awt.Font;
import java.util.Scanner;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import javax.swing.*;

public class InstaMidHelper {

  public static AtomicLong lastBeat = new AtomicLong(System.currentTimeMillis());
  public static AtomicLong lastTick = new AtomicLong(System.currentTimeMillis());
  public static final long startTime = System.currentTimeMillis();
  public static AtomicInteger ticksRemaining;

  public static void main(String[] args) throws Exception {
    ticksRemaining = new AtomicInteger(Integer.parseInt(args[0]));

    KeepAlive heartbeat = new KeepAlive();
    Thread t = new Thread(heartbeat);
    t.start();
    boolean f = true;
    while (true) {
      Thread.sleep(100);
      long d = System.currentTimeMillis();
      if (d - startTime > 10000L) break;
      if (ticksRemaining.get() <= 0) break;
      if (d - lastBeat.get() > 500L) {
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
            long t = ticksRemaining.get() * 50L - Math.min(50L, System.currentTimeMillis() - lastTick.get());
            label.setText(String.format("%d.%02d", t / 1000L, (t % 1000L) / 10L));
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
      String s = sc.nextLine();
      if (s.equals("A")) InstaMidHelper.lastBeat.set(System.currentTimeMillis());
      else {
        InstaMidHelper.lastTick.set(System.currentTimeMillis());
        InstaMidHelper.ticksRemaining.set(InstaMidHelper.ticksRemaining.get() - 1);
      }
    }
  }

  public void close() {
    sc.close();
  }
}
