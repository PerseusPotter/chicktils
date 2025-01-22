import settings from '../../settings';
import reg from '../../util/registerer';
import { StateProp, StateVar } from '../../util/state';
import { createChestNoInv, getLowerContainer } from '../../util/mc';
import { stateFloor, stateIsInBoss } from '../dungeon.js';
import { setAccessible } from '../../util/polyfill';

const ySizeF = setAccessible(Java.type('net.minecraft.client.gui.inventory.GuiContainer').class.getDeclaredField('field_147000_g'));
const newYSizeInt = new (Java.type('java.lang.Integer'))(143);

const origGuiSize = new StateVar(-1);

const tickReg = reg('tick', () => {
  if (!Client.isInGui()) {
    Client.settings.video.setGuiScale(origGuiSize.get());
    origGuiSize.set(-1);
  }
}).setEnabled(new StateProp(settings._dungeonTerminalsGuiSize).notequals('Unchanged').and(new StateProp(origGuiSize).notequals(-1)).and(settings._dungeonTerminalsHelper));
const termOpenReg = reg('guiOpened', evn => {
  const gui = evn.gui;
  if (gui.getClass().getSimpleName() !== 'GuiChest') return;
  // net.minecraft.client.player.inventory.ContainerLocalMenu
  const inv = getLowerContainer(gui);
  const name = inv.func_70005_c_();
  if (!(
    name === 'Change all to same color!' ||
    name === 'Click in order!' ||
    name === 'Correct all the panes!' ||
    name === 'Click the button on time!' ||
    name.startsWith('Select all the') ||
    name.startsWith('What starts with:')
  )) return;

  if (settings.dungeonTerminalsGuiSize !== 'Unchanged' && origGuiSize.get() === -1) {
    origGuiSize.set(Client.settings.video.getGuiScale());
    Client.settings.video.setGuiScale(function() {
      switch (settings.dungeonTerminalsGuiSize) {
        case 'Small': return 1;
        case 'Normal': return 2;
        case 'Large': return 3;
        case '4x': return 4;
        case '5x': return 5;
        case 'Auto': return 0;
      }
    }());
  }
  if (settings.dungeonTerminalsHideInv) GuiHandler.openGui(createChestNoInv(gui));
  if (settings.dungeonTerminalsHideInvScuffed) ySizeF.set(gui, newYSizeInt);
}).setEnabled(new StateProp(stateFloor).equalsmult('F7', 'M7').and(stateIsInBoss).and(settings._dungeonTerminalsHelper));

export function init() { }
export function start() {
  origGuiSize.set(-1);

  tickReg.register();
  termOpenReg.register();
}
export function reset() {
  tickReg.unregister();
  termOpenReg.unregister();
}