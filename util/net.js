// modified from soopy
const File = Java.type('java.io.File');
const URL = Java.type('java.net.URL');
const PrintStream = Java.type('java.io.PrintStream');
const Byte = Java.type('java.lang.Byte');
const ByteArrayOutputStream = Java.type('java.io.ByteArrayOutputStream');
export function urlToFile(url, dst, connecttimeout = 1000, readtimeout = 1000) {
  const d = new File(dst);
  d.getParentFile().mkdirs();
  if (d.exists()) d.delete();
  const connection = new URL(url).openConnection();
  Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper').removeCertCheck(connection);
  connection.setDoOutput(true);
  connection.setConnectTimeout(connecttimeout);
  connection.setReadTimeout(readtimeout);
  const IS = connection.getInputStream();
  const FilePS = new PrintStream(dst);
  let buf = new Packages.java.lang.reflect.Array.newInstance(Byte.TYPE, 65536);
  let len;
  while ((len = IS.read(buf)) > 0) {
    FilePS.write(buf, 0, len);
  }
  IS.close();
  FilePS.close();
}
export function urlToString(url, connecttimeout = 1000, readtimeout = 1000) {
  try {
    const connection = new URL(url).openConnection();
    // Java.type('com.perseuspotter.chicktilshelper.ChickTilsHelper').removeCertCheck(connection);
    connection.setDoOutput(true);
    connection.setConnectTimeout(connecttimeout);
    connection.setReadTimeout(readtimeout);
    const IS = connection.getInputStream();
    const out = new ByteArrayOutputStream();
    let buf = new Packages.java.lang.reflect.Array.newInstance(Byte.TYPE, 65536);
    let len;
    while ((len = IS.read(buf)) > 0) {
      out.write(buf, 0, len);
    }
    IS.close();
    return out.toString('UTF-8');
  } catch (e) {
    if (e.toString().includes('java.io.FileNotFoundException')) return null;
    throw e;
  }
}