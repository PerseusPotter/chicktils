import settings from '../../settings';
import { renderFilledBox, renderLine3D } from '../../util/draw';
import reg from '../../util/registerer';
import Grid from '../../util/grid';
import { getBlockPos } from '../../util/mc';

const brokenStairBucket = new Grid({ size: 2, addNeighbors: 2 });
let cID = NaN;
let cArr = null;
let lookPos = null;

const BlockStairs = Java.type('net.minecraft.block.BlockStairs');
const MovingObjectPosition = Java.type('net.minecraft.util.MovingObjectPosition');

// curved stairs arent a thing :pray:
const stairBreakReg = reg('blockBreak', b => {
  if (!(b.type.mcBlock instanceof BlockStairs)) return;
  const x = b.getX();
  const y = b.getY();
  const z = b.getZ();
  const n = x * 631 * 631 + y * 631 + z;
  if (brokenStairBucket.get(x, z).some(v => v[0] === n)) return;
  cID = NaN;
  switch (b.getMetadata()) {
    case 0:
      brokenStairBucket.add(x, z, [n, [x + 0.24, y + 1.02, z], [x + 0.24, y + 1.02, z + 1]]);
      break;
    case 1:
      brokenStairBucket.add(x, z, [n, [x + 0.76, y + 1.02, z], [x + 0.76, y + 1.02, z + 1]]);
      break;
    case 2:
      brokenStairBucket.add(x, z, [n, [x, y + 1.02, z + 0.24], [x + 1, y + 1.02, z + 0.24]]);
      break;
    case 3:
      brokenStairBucket.add(x, z, [n, [x, y + 1.02, z + 0.76], [x + 1, y + 1.02, z + 0.76]]);
      break;
  }
}).setEnabled(settings._dungeonStairStonkHelper);
const tickReg = reg('tick', () => {
  const id = brokenStairBucket._getId(Player.getX(), Player.getZ());
  if (id !== cID) {
    cID = id;
    cArr = brokenStairBucket._getById(id);
  }

  lookPos = null;
  const obj = Client.getMinecraft().field_71476_x;
  if (obj === null || obj.field_72313_a !== MovingObjectPosition.MovingObjectType.BLOCK) return;
  const bPos = obj.func_178782_a();
  if (bPos === null) return;

  const bState = World.getWorld().func_180495_p(bPos);
  const b = bState.func_177230_c();
  if (!(b instanceof BlockStairs)) return;
  const m = b.func_176201_c(bState);
  if (m & 1) return;
  lookPos = getBlockPos(bPos);
});
const renderWorldReg = reg('renderWorld', () => {
  if (!cArr) {
    const id = brokenStairBucket._getId(Player.getX(), Player.getZ());
    cID = id;
    cArr = brokenStairBucket._getById(id);
  }
  cArr.forEach(v => {
    // average rhino L
    // java.lang.ClassCastException: java.lang.Boolean cannot be cast to [Ljava.lang.Object;
    // drawLine(settings.dungeonStairStonkHelperColor, ...v[1], ...v[2], 2);
    renderLine3D(
      settings.dungeonStairStonkHelperColor,
      v[1][0], v[1][1], v[1][2],
      v[2][0], v[2][1], v[2][2],
      false,
      2
    );
  });

  if (lookPos) renderFilledBox(lookPos.x - 0.005, lookPos.y - 0.005, lookPos.z - 0.005, 1.01, 1.01, settings.dungeonStairStonkHelperHighlightColor, false, false);
}).setEnabled(settings._dungeonStairStonkHelper);

export function init() { }
export function start() {
  brokenStairBucket.clear();
  cID = NaN;
  cArr = null;
  lookPos = null;

  stairBreakReg.register();
  tickReg.register();
  renderWorldReg.register();
}
export function reset() {
  stairBreakReg.unregister();
  tickReg.unregister();
  renderWorldReg.unregister();
}