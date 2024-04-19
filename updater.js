export function loadMeta() {
  return JSON.parse(FileLib.getUrlContent('https://api.github.com/repos/perseuspotter/chicktils/releases/latest'));
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
  FileLib.write(rel('temp.zip'), FileLib.getUrlContent(url));
  FileLib.unzip(rel('temp.zip'), rel('temp'));
  FileLib.delete(rel('temp.zip'));
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