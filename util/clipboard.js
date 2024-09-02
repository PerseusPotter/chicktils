const board = Java.type('java.awt.Toolkit').getDefaultToolkit().getSystemClipboard();
const DataFlavor = Java.type('java.awt.datatransfer.DataFlavor');
const StringSelection = Java.type('java.awt.datatransfer.StringSelection');
const Character = Java.type('java.lang.Character');
const StringBuilder = Java.type('java.lang.StringBuilder');
/**
 * @returns {string}
 */
export function get() {
  try {
    const t = board.getContents(null);
    const r = DataFlavor.selectBestTextFlavor(t.getTransferDataFlavors()).getReaderForText(t);
    const s = new StringBuilder();
    let b = new Packages.java.lang.reflect.Array.newInstance(Character.TYPE, 65536);
    let l;
    while ((l = r.read(b, 0, 65536)) > 0) s.append(b, 0, l);
    r.close();
    return s.toString();
  } catch (e) {
    // nothing in clipboard
    return '';
  }
}
/**
 * @param {string} v
 */
export function set(v) {
  return board.setContents(new StringSelection(v), null);
}

export function getImage() {
  return board.getContents(null).getTransferData(DataFlavor.imageFlavor);
}