const System = Java.type('java.lang.System');
const File = Java.type('java.io.File');
function rel(p) {
  return './config/ChatTriggers/modules/chicktils/' + p;
}
function getJavaPath() {
  // https://stackoverflow.com/a/24295025
  if (System.getProperty('os.name').startsWith('Win')) return System.getProperties().getProperty('java.home') + File.separator + 'bin' + File.separator + 'javaw.exe';
  return System.getProperties().getProperty('java.home') + File.separator + 'bin' + File.separator + 'javaw';
}
/**
 * @param {string} clazz
 * @param {string[]} args
 * @returns {import('../../@types/External').JavaClass('java.lang.Process')}
 */
export default function runHelper(clazz, args = []) {
  const mod = new File(rel('chicktilshelper/build/libs')).listFiles()[0].getPath();
  // fuck constring
  return new (Java.type('java.lang.ProcessBuilder'))(
    getJavaPath().toString(),
    '-cp',
    `"${mod}"`.toString(),
    `com.perseuspotter.chicktilshelper.${clazz}`.toString(),
    ...args
  ).start();
};