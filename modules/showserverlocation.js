import { renderBoxOutline, renderLine } from '../../Apelles/index';
import settings from '../settings';
import { getEyeHeight, getLastReportedPit, getLastReportedX, getLastReportedY, getLastReportedYaw, getLastReportedZ } from '../util/mc';
import reg from '../util/registerer';

const renderReg = reg('renderWorld', () => {
  const p = Player.getPlayer();
  if (!p) return;
  const x = getLastReportedX();
  const y = getLastReportedY();
  const z = getLastReportedZ();
  const pit = -(getLastReportedPit() + 90) * Math.PI / 180;
  const yaw = (getLastReportedYaw() - 90) * Math.PI / 180;
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