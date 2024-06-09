import settings from '../../settings';
import { drawLine3D } from '../../util/draw';
import reg from '../../util/registerer';
import Grid from '../../util/grid';

const brokenStairBucket = new Grid({ size: 2, addNeighbors: 2 });

const BlockStairs = Java.type('net.minecraft.block.BlockStairs');
const stairBreakReg = reg('blockBreak', b => {
  if (!(b.type.mcBlock instanceof BlockStairs)) return;
  const x = b.getX();
  const y = b.getY();
  const z = b.getZ();
  const n = x * 631 * 631 + y * 631 + z;
  if (brokenStairBucket.get(x, z).some(v => v[0] === n)) return;
  switch (b.getMetadata()) {
    case 0:
      brokenStairBucket.add(x, z, [n, [x + 0.24, y + 1.1, z], [x + 0.24, y + 1.1, z + 1]]);
      break;
    case 1:
      brokenStairBucket.add(x, z, [n, [x + 0.76, y + 1.1, z], [x + 0.76, y + 1.1, z + 1]]);
      break;
    case 2:
      brokenStairBucket.add(x, z, [n, [x, y + 1.1, z + 0.24], [x + 1, y + 1.1, z + 0.24]]);
      break;
    case 3:
      brokenStairBucket.add(x, z, [n, [x, y + 1.1, z + 0.76], [x + 1, y + 1.1, z + 0.76]]);
      break;
  }
}).setEnabled(settings._dungeonStairStonkHelper);
const renderWorldReg = reg('renderWorld', () => {
  brokenStairBucket.get(Player.getX(), Player.getZ()).forEach(v => {
    // average rhino L
    // java.lang.ClassCastException: java.lang.Boolean cannot be cast to [Ljava.lang.Object;
    // drawLine(settings.dungeonStairStonkHelperColor, ...v[1], ...v[2], 2);
    drawLine3D(
      settings.dungeonStairStonkHelperColor,
      v[1][0], v[1][1], v[1][2],
      v[2][0], v[2][1], v[2][2],
      2
    );
  });
}).setEnabled(settings._dungeonStairStonkHelper);

export function init() { }
export function start() {
  brokenStairBucket.clear();

  stairBreakReg.register();
  renderWorldReg.register();
}
export function reset() {
  stairBreakReg.unregister();
  renderWorldReg.unregister();
}