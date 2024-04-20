import { urlToFile, urlToString } from './util/net';
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