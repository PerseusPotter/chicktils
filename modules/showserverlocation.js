import { renderBoxOutline, renderLine } from '../../Apelles/index';
import settings from '../settings';
import { getEyeHeight } from '../util/mc';
import { setAccessible } from '../util/polyfill';
import reg from '../util/registerer';

const lastReportedPosX = setAccessible(net.minecraft.client.entity.EntityPlayerSP.class.getDeclaredField('field_175172_bI'));
const lastReportedPosY = setAccessible(net.minecraft.client.entity.EntityPlayerSP.class.getDeclaredField('field_175166_bJ'));
const lastReportedPosZ = setAccessible(net.minecraft.client.entity.EntityPlayerSP.class.getDeclaredField('field_175167_bK'));
const lastReportedPit = setAccessible(net.minecraft.client.entity.EntityPlayerSP.class.getDeclaredField('field_175165_bM'));
const lastReportedYaw = setAccessible(net.minecraft.client.entity.EntityPlayerSP.class.getDeclaredField('field_175164_bL'));

const renderReg = reg('renderWorld', () => {
  const p = Player.getPlayer();
  if (!p) return;
  const x = lastReportedPosX.get(p);
  const y = lastReportedPosY.get(p);
  const z = lastReportedPosZ.get(p);
  const pit = -(lastReportedPit.get(p) + 90) * Math.PI / 180;
  const yaw = (lastReportedYaw.get(p) - 90) * Math.PI / 180;
  const eye = getEyeHeight(p);

  renderBoxOutline(
    settings.showServerLocationColor,
    x, y, z,
    p.field_70130_N, p.field_70131_O,
    { centered: true, lw: 5 }
  );
  renderLine(
    settings.showServerLookColor,
    [
      [x, y + eye, z],
      [
        x + Math.cos(yaw) * Math.sin(pit),
        y + eye + Math.cos(pit),
        z + Math.sin(yaw) * Math.sin(pit)
      ]
    ],
    { lw: 5 }
  );
});

export function init() { }
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}