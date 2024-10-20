import reg from '../util/registerer';

const LWJGLDisplay = org.lwjgl.opengl.Display;
const TickEvent = net.minecraftforge.fml.common.gameevent.TickEvent;
const renderReg = reg(net.minecraftforge.fml.common.gameevent.TickEvent.RenderTickEvent, evn => {
  /*
  field_71454_w is checked twice per render tick
  first in the Minecraft class, and again in EntityRenderer
  begin render tick -> check field_71454_w -> RenderTickEvent.START -> update mouse -> check field_71454_w -> rendering -> RenderTickEvent.END -> end of render tick
  we only intercept the 2nd check to not render, however we still want to process mouse movements so the game doesn't "freeze"
  */
  Client.getMinecraft().field_71454_w = evn.phase.equals(TickEvent.Phase.START) && !LWJGLDisplay.isActive();
});

export function init() { }
export function load() {
  renderReg.register();
}
export function unload() {
  renderReg.unregister();
}