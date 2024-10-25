import reg from '../util/registerer';

const isActive = org.lwjgl.opengl.Display.isActive;
const START = net.minecraftforge.fml.common.gameevent.TickEvent.Phase.START;
let p = null;
const renderReg = reg(net.minecraftforge.fml.common.gameevent.TickEvent.RenderTickEvent, evn => {
  /*
  field_71454_w is checked twice per render tick
  first in the Minecraft class, and again in EntityRenderer
  begin render tick -> check field_71454_w -> RenderTickEvent.START -> update mouse -> check field_71454_w -> rendering -> RenderTickEvent.END -> end of render tick
  we only intercept the 2nd check to not render, however we still want to process mouse movements so the game doesn't "freeze"
  */
  const v = evn.phase.equals(START) && !isActive();
  if (v !== p) {
    p = v;
    Client.getMinecraft().field_71454_w = p;
  }
});

export function init() { }
export function load() {
  p = null;
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}