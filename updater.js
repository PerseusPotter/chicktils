// downloader from soopy
const File = Java.type('java.io.File');
const URL = Java.type('java.net.URL');
const PrintStream = Java.type('java.io.PrintStream');
const Byte = Java.type('java.lang.Byte');
const ByteArrayOutputStream = Java.type('java.io.ByteArrayOutputStream');
function urlToFile(url, dst, connecttimeout, readtimeout) {
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
function urlToString(url, connecttimeout, readtimeout) {
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
}
export function loadMeta() {
  return JSON.parse(urlToString('https://api.github.com/repos/perseuspotter/chicktils/releases/latest', 1000, 1000));
};

export function getVersion(meta) {
  return meta.tag_name.slice(1);
};

export function getAssetURL(meta) {
  return meta.assets.find(v => v.name === 'chicktils.zip').browser_download_url;
  // return meta.zipball_url;
};

function rel(p) {
  return './config/ChatTriggers/modules/chicktils/' + p;
}
export function downloadUpdate(url) {
  const tmp = new File(rel('temp'));
  if (tmp.exists()) rimraf(tmp);
  urlToFile(url, rel('temp.zip'), 5000, 5000);
  FileLib.unzip(rel('temp.zip'), rel('temp'));
  FileLib.delete(rel('temp.zip'));
};

export function getCurrVV() {
  return FileLib.read(rel('v.txt')).split(' ');
};
export function getUpdateVV() {
  return FileLib.read(rel('temp/v.txt')).split(' ');
};

export function applyUpdate() {
  copy(new File(rel('temp')), new File(rel('')));
  FileLib.deleteDirectory(rel('temp'));
};

function rimraf(src) {
  src.listFiles()?.forEach(f => {
    if (f.isDirectory()) rimraf(f);
    else f.delete();
  });
  src.delete();
}
function copy(src, dst) {
  if (!dst.exists()) dst.mkdir();
  src.listFiles().forEach(f => {
    const d = new File(dst, f.getName());
    if (f.isDirectory()) copy(f, d);
    else FileLib.write(d.getPath(), FileLib.read(f.getPath()));
  });
}