// from tree man (DocilElm)

import Settings from '../Amaterasu/core/Settings';
import DefaultConfig from '../Amaterasu/core/DefaultConfig';
import ConfigTypes from '../Amaterasu/core/ConfigTypes';

// Toggle -> Switch
// Integer -> Slider
// Number -> Slider
// Percent -> DecimalSlider
// Text -> TextInput
// Color -> ColorPicker
// Option -> Dropdown
// Action -> Button

const typesToAmat = [
  ConfigTypes.SWITCH,
  ConfigTypes.SLIDER,
  ConfigTypes.SLIDER,
  ConfigTypes.SLIDER,
  ConfigTypes.TEXTINPUT,
  ConfigTypes.COLORPICKER,
  ConfigTypes.DROPDOWN,
  ConfigTypes.BUTTON
];

export default function convert(settings) {
  FileLib.delete('ChickTils', 'settings_amaterasu.json');
  const defaultConf = new DefaultConfig('ChickTils', 'settings_amaterasu.json');
  settings.props.forEach((v, i) => propertyToAmaterasu(defaultConf, v, settings.propIds[i], settings.pageNames[v.page]));
  return new Settings('ChickTils', defaultConf, 'ColorScheme.json');
}

const getSubcategory = (function() {
  let counter = 1;
  let lastPage = null;
  return function(pageName, isNewSection) {
    if (isNewSection) counter++;
    // return `subcategory ${counter}`;
    return ' '.repeat(counter);
  };
}());
/**
 * @param {import('./settingsLib').Property} instance
 * @param {string} key
 * @param {string} pageName
 */
function propertyToAmaterasu(defaultConf, instance, key, pageName) {
  let { page, name, type, value, defaultValue, desc, isNewSection } = instance;
  name = name.match(/[a-z]+|[A-Z](?:[a-z]+|[A-Z]*(?![a-z]))|[.\d]+/g).join(' ');
  let { min, max, len, options, shouldShow } = instance.opts;
  const amtype = typesToAmat[type];

  switch (amtype) {
    case ConfigTypes.SWITCH:
      defaultConf
        .addSwitch({
          category: pageName,
          subcategory: getSubcategory(pageName, isNewSection),
          configName: key,
          title: name,
          description: desc,
          value: value,
          registerListener(oldV, newV) {
            instance.set(newV);
          },
          shouldShow: () => instance.shouldShow.get()
        });
      break;

    case ConfigTypes.SLIDER:
      if (!Number.isFinite(min) || !Number.isFinite(max)) desc = '&4I recommend you use the text version of the settings (/cts config). Amaterasu (the settings gui library) does not support numerical text input and I am too lazy to implement it myself.' + (desc ? '\n' : '') + desc;
      if (!Number.isFinite(min)) min = -10000;
      if (!Number.isFinite(max)) max = +10000;
      // cyclic dependency :(
      // if (type === Property.Type.Percent) min += 0.0001;
      if (type === 3) min += 0.0001;
      defaultConf
        .addSlider({
          category: pageName,
          subcategory: getSubcategory(pageName, isNewSection),
          configName: key,
          title: name,
          description: desc,
          options: [min, max],
          value: value,
          registerListener(oldV, newV) {
            instance.set(newV);
          },
          shouldShow: () => instance.shouldShow.get()
        });
      break;

    case ConfigTypes.TEXTINPUT:
      defaultConf
        .addTextInput({
          category: pageName,
          subcategory: getSubcategory(pageName, isNewSection),
          configName: key,
          title: name,
          description: desc,
          value: value,
          registerListener(oldV, newV) {
            instance.set(newV);
          },
          shouldShow: () => instance.shouldShow.get()
        });
      break;

    case ConfigTypes.COLORPICKER: {
      const r = (value >> 24) & 0xFF;
      const g = (value >> 16) & 0xFF;
      const b = (value >> 8) & 0xFF;
      const a = (value >> 0) & 0xFF;

      defaultConf
        .addColorPicker({
          category: pageName,
          subcategory: getSubcategory(pageName, isNewSection),
          configName: key,
          title: name,
          description: desc,
          value: [r, g, b, a],
          registerListener(oldV, newV) {
            instance.set((newV[0] << 24) | (newV[1] << 16) | (newV[2] << 8) | (newV[3] << 0));
          },
          shouldShow: () => instance.shouldShow.get()
        });
      break;
    }

    case ConfigTypes.DROPDOWN:
      defaultConf
        .addDropDown({
          category: pageName,
          subcategory: getSubcategory(pageName, isNewSection),
          configName: key,
          title: name,
          description: desc,
          options: options,
          value: options.indexOf(value),
          registerListener(oldV, newV) {
            instance.set(options[newV]);
          },
          shouldShow: () => instance.shouldShow.get()
        });
      break;

    case ConfigTypes.BUTTON:
      defaultConf
        .addButton({
          category: pageName,
          subcategory: getSubcategory(pageName, isNewSection),
          configName: key,
          title: name,
          description: desc,
          onClick() {
            instance.actionListeners.forEach(v => v(true));
          },
          shouldShow: () => instance.shouldShow.get()
        });
      break
  }
}
