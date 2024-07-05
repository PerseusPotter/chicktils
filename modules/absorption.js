import settings from '../settings';
import { drawTexturedRect } from '../util/draw';
import { dist } from '../util/math';
import reg from '../util/registerer';

let hpUpdateC = 0;
let updateC = 0;
let currHp = 0;
let prevHp = 0;
let prevTime = Date.now();
let actualAbsorb = 0;
const actionBarReg = reg('actionBar', (curr, max) => {
  const playerE = Player.getPlayer();
  if (!playerE) return;
  curr = +curr.replace(/,/g, '');
  max = +max.replace(/,/g, '');
  const hp = Math.ceil(Player.getHP());
  const maxHp = Math.ceil(playerE.func_110138_aP());
  const hpph = max / maxHp;
  actualAbsorb = Math.min(Math.max(Math.ceil(curr / hpph) - hp, 0), settings.absorptionMaxHearts);
}, 'absorption').setChatCriteria('${curr}/${max}❤${*}');

const renderHeartReg = reg('renderHealth', evn => {
  const playerE = Player.getPlayer();
  if (!playerE) return;
  updateC++;
  cancel(evn);

  // https://github.com/MinecraftForge/MinecraftForge/blob/d06e0ad71b8471923cc809dde58251de8299a143/src/main/java/net/minecraftforge/client/GuiIngameForge.java#L330
  const w = Renderer.screen.getWidth();
  const h = Renderer.screen.getHeight();
  GL11.glEnable(GL11.GL_BLEND);
  let hp = Math.ceil(Player.getHP());
  const doHighlight = hpUpdateC > updateC && (((hpUpdateC - updateC) / 3) & 1) === 1;

  const d = Date.now();
  if (playerE.field_70172_ad > 0 & hp !== currHp) {
    prevTime = d;
    hpUpdateC = updateC + (hp < currHp ? 20 : 10);
  } else if (d - prevTime > 1000) {
    prevHp = hp;
    prevTime = d;
  }

  currHp = hp;
  let hpDiff = doHighlight ? dist(prevHp, hp) : 0;
  hp = doHighlight ? Math.min(prevHp, hp) : hp;
  const maxHp = Math.ceil(playerE.func_110138_aP());
  let aa = Math.ceil(playerE.func_110139_bj());
  if (aa === 0) actualAbsorb = 0;
  let absorb = actualAbsorb;
  let slots = (Math.max(maxHp, hp + absorb) + 1) >> 1;

  const heartRows = Math.ceil((hp + absorb) / 20);
  const rowHeight = Math.max(12 - heartRows, 3);

  const l = (w >> 1) - 91;
  const b = h - Java.type('net.minecraftforge.client.GuiIngameForge').left_height;
  Java.type('net.minecraftforge.client.GuiIngameForge').left_height += (heartRows * rowHeight) + 10 - rowHeight;

  const regen = playerE.func_82165_m(10) ? (updateC % (maxHp + 5)) : -1;

  const TOP = 0; // 45 if hardcore mode. surely wont happen, right?
  const BACKGROUND = (doHighlight ? 25 : 16);
  const MARGIN =
    playerE.func_82165_m(19) ? 52 :
      playerE.func_82165_m(20) ? 88 :
        16;

  const pos = [];
  const drawText = (x, y, u) => {
    const i = y * 10 + x;
    if (!pos[i]) return;
    drawTexturedRect(pos[i][0], pos[i][1], u, TOP, 9, 9, 256, 256);
  };

  let x = 0;
  let y = 0;
  while (slots > 0) {
    let _x = l + x * 8;
    let _y = b - y * rowHeight + (hp <= 4) * (Math.random() < 0.5) + (pos.length === regen ? -2 : 0);
    pos.push([_x, _y]);
    drawTexturedRect(_x, _y, BACKGROUND, TOP, 9, 9, 256, 256);
    if (++x === 10) {
      x = 0;
      y++;
    }
    slots--;
  }
  x = (hp % 20) >> 1;
  y = ~~(hp / 20);
  let s = 1 + !(hp & 1);
  while (absorb > 0) {
    drawText(x, y, (absorb === 1 ? 169 : 160));
    if (++x === 10) {
      x = 0;
      y++;
    }
    absorb -= s;
    s = 2;
  }
  x = (hp % 20) >> 1;
  y = ~~(hp / 20);
  s = 1 + !(hp & 1);
  while (hpDiff > 0) {
    drawText(x, y, MARGIN + (hpDiff === 1 ? 63 : 54));
    if (++x === 10) {
      x = 0;
      y++;
    }
    hpDiff -= s;
    s = 2;
  }
  x = 0;
  y = 0;
  while (hp > 0) {
    drawText(x, y, MARGIN + (hp === 1 ? 45 : 36));
    if (++x === 10) {
      x = 0;
      y++;
    }
    hp -= 2;
  }

  GL11.glDisable(GL11.GL_BLEND);
}, 'absorption');

export function init() { }
export function load() {
  actionBarReg.register();
  renderHeartReg.register();
}
export function unload() {
  actionBarReg.unregister();
  renderHeartReg.unregister();
}