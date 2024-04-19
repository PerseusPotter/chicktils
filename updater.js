import axios from '../axios/index';
import Promise from '../promisev2/index';

export function loadMeta() {
  return new Promise((res, rej) => {
    axios.get('https://api.github.com/repos/perseuspotter/chicktils/releases/latest').then(({ data }) => res(data)).catch(rej);
  });
};

export function getVersion(meta) {
  return meta.tag_name.slice(1);
};

export function getAssetURL(meta) {
  return meta.assets.find(v => v.name === 'chicktils.zip').browser_download_url;
};

function rel(p) {
  return './config/ChatTriggers/modules/chicktils/' + p;
}
export function downloadUpdate(url) {
  return new Promise((res, rej) => {
    axios.get(url).then(({ data }) => {
      FileLib.write(rel('temp.zip'), data);
      FileLib.unzip(rel('temp.zip'), rel('temp'));
      FileLib.delete(rel('temp.zip'));
      res();
    }).catch(rej);
  });
};

export function getCurrVV() {
  return FileLib.read(rel('v.txt')).split(' ');
};
export function getUpdateVV() {
  return FileLib.read(rel('temp/v.txt')).split(' ');
};

function copy(src, dst) {
  if (!dst.exists()) dst.mkdir();
  src.listFiles().forEach(f => {
    const d = new File(dst, f.getName());
    if (f.isDirectory()) copy(f, d);
    else FileLib.write(d.getPath(), FileLib.read(f.getPath()));
  });
}
const File = Java.type('java.io.File');
export function applyUpdate() {
  copy(new File(rel('temp')), new File(rel('')));
  FileLib.deleteDirectory(rel('temp'));
};