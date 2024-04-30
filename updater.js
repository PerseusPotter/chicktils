import { urlToFile, urlToString } from './util/net';
import runHelper from './util/runner';
const File = Java.type('java.io.File');
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
  return FileLib.read(rel('v.txt')).split(' ').map(v => +v);
};
export function getUpdateVV() {
  return FileLib.read(rel('temp/v.txt')).split(' ').map(v => +v);
};

export function applyUpdate() {
  const modFolder = new File(rel('chicktilshelper/build/libs'));
  const newMod = new File(rel('temp/chicktilshelper/build/libs')).listFiles()[0];
  const oldMods = modFolder.listFiles();
  // oldMods.forEach(v => v.deleteOnExit()); // doesn't on crash
  const newModName = newMod.getName().slice(0, 'chicktilshelper-1.0'.length) + Date.now() + '.jar';
  newMod.renameTo(new File(modFolder, newModName));
  runHelper('ChickTilsUpdateHelper', oldMods.map(v => `"${v.getPath()}"`.toString()));
  rimraf(rel('temp/chicktilshelper'));
  copy(new File(rel('temp')), new File(rel('')));
  deleteDownload();
};

export function deleteDownload() {
  rimraf(rel('temp'));
}

function rimraf(src) {
  if (!(src instanceof File)) src = new File(src);
  if (!src.exists()) return;
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
    else {
      if (d.exists()) d.delete();
      f.renameTo(d);
      // FileLib.write(d.getPath(), FileLib.read(f.getPath()));
    }
  });
}