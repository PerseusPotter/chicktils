import { wrap } from './threading';

const ActualThread = Java.type('java.lang.Thread');
const ProcessBuilder = Java.type('java.lang.ProcessBuilder');
const Files = Java.type('java.nio.file.Files');
const File = Java.type('java.io.File');
const rootPath = (new File('./config/ChatTriggers/modules/chicktils/')).toPath();
// const PosixFilePermissions = Java.type('java.nio.file.attribute.PosixFilePermissions');
// thank you rhino very cool
// Can't find method java.nio.file.attribute.PosixFilePermissions.asFileAttribute([Ljava.lang.Object;)
// const perms = PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString('rw-rw-rw-'));
const FileAttribute = Java.type('java.nio.file.attribute.FileAttribute');
const PosixFilePermission = Java.type('java.nio.file.attribute.PosixFilePermission');
const EnumSet = Java.type('java.util.EnumSet');
const permSet = EnumSet.of(
  PosixFilePermission.OWNER_READ, PosixFilePermission.OWNER_WRITE,
  PosixFilePermission.GROUP_READ, PosixFilePermission.GROUP_WRITE,
  PosixFilePermission.OTHERS_READ, PosixFilePermission.OTHERS_WRITE,
);
const perms = new JavaAdapter(FileAttribute, {
  name() {
    return 'posix:permissions';
  },
  value() {
    return permSet;
  }
});
const UTF8 = Java.type('java.nio.charset.StandardCharsets').UTF_8;
const System = Java.type('java.lang.System');
const isWindows = System.getProperty('os.name').startsWith('Win');

/**
 * @param {(err?: string, value?: string) => void} cb runs in thread
 * @param {string} [initial = '']
 */
export default function getTextEditor(cb, initial = '') {
  if (!cb || typeof cb !== 'function') throw 'provide a callback';
  const thread = new ActualThread(wrap(() => {
    try {
      const tmpPath = isWindows ?
        Files.createTempFile(rootPath, 'edit-', '.txt') :
        Files.createTempFile(rootPath, 'edit-', '.txt', perms);
      Files.write(tmpPath, initial.split('\n'), UTF8);

      const editProc = (new ProcessBuilder(
        isWindows ?
          ['cmd.exe', '/s', '/c', 'start', '/B', '/WAIT', '""', `"${tmpPath.toString()}"`.toString()] :
          ['editor', `"${tmpPath.toString()}"`.toString()]
      )).start();
      editProc.waitFor();

      const txt = Files.readAllLines(tmpPath, UTF8).join('\n');
      Files.delete(tmpPath);

      cb(undefined, txt);
    } catch (e) {
      cb(e.toString());
    }
  }));
  thread.start();
}