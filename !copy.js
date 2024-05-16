const path = require('path');
const fs = require('fs');
const src = __dirname;
const appdata = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
const moduleName = path.basename(__dirname);
const dest = path.join(appdata, String.raw`.minecraft\config\ChatTriggers\modules`, moduleName);
const { files, dirs } = require('./!files');

if (!fs.existsSync(dest)) fs.mkdirSync(dest);
dirs.forEach(v => {
  if (!fs.existsSync(path.join(dest, v))) fs.mkdirSync(path.join(dest, v));
});
try {
  fs.readdirSync(path.join(dest, 'chicktilshelper/build/libs')).forEach(v => fs.unlinkSync(path.join(dest, 'chicktilshelper/build/libs', v)));
} catch (e) { }
files.forEach(v => {
  try {
    // if (v.endsWith('.jar')) return;
    fs.copyFileSync(path.join(src, v), path.join(dest, v));
  } catch (e) { }
});