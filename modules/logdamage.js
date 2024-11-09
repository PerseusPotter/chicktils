import settings from '../settings';
import { log } from '../util/log';
import { fastDistance } from '../util/math';
import reg from '../util/registerer';

let lastI = 0;

const settingsDict = {
  '7': 'logDamageNormal',
  'f': 'logDamageCrit',
  '0': 'logDamageWither',
  '2': 'logDamageVenomous',
  '3': 'logDamageSuffocation',
  '6': 'logDamageFire',
  '9': 'logDamageLightning',
  'd': 'logDamagePet'
};
function processName(n) {
  const data = parseName(n);
  if (!data || Number.isNaN(data.dmg)) return;

  if (
    settings[settingsDict[n[1]]] ||
    data.mods && (
      settings.logDamageOverload && data.mods.overload ||
      settings.logDamageExtremeFocus && data.mods.extremeFocus ||
      settings.logDamageOctodexterity && data.mods.octodexterity ||
      settings.logDamageWitherSkull && data.mods.witherSkull ||
      settings.logDamageLove && data.mods.love
    )
  ) log(n);
}
/** @param {string} n */
function parseName(n) {
  if (n[0] !== '§') return;
  switch (n[1]) {
    case '0': // wither
    case '2': // venomous/poison
    case '3': // suffocation/drowning
    case '6': // fire/flame/fa
    case '9': // thunderlord/bolt
      return { dmg: parseDamage(n.slice(2).replace(/,/g, '')) };

    case 'd': // pet
    case '7': // normal
      return parseDamageString(n.slice(2));
    // crit
    case 'f': return parseDamageString(n.slice(3));
  }
}
/** @param {string} s */
function parseDamage(s) {
  if (/^\d+$/.test(s)) return parseInt(s);
  return NaN;
}
/** @param {string} s */
function parseDamageString(s) {
  s = s.replace(/§.|,/g, '');
  let i = s.match(/\D/)?.index;
  if (!i) i = s.length;
  return { dmg: parseDamage(s.slice(0, i)), mods: parseModifiers(s.slice(i)) };
}
// https://github.com/Skytils/SkytilsMod/blob/34e6394d3b77799a05db39b8bfd8f11a44fff615/src/main/kotlin/gg/skytils/skytilsmod/features/impl/misc/damagesplash/Damage.kt#L30
/** @param {string} s */
function parseModifiers(s) {
  return {
    crit: s.includes('✧'),
    overload: s.includes('✯'),
    extremeFocus: s.includes('⚔'),
    octodexterity: s.includes('+'),
    witherSkull: s.includes('✷'),
    love: s.includes('❤'),
    // not used i think?
    // curse: s.includes('☄'),
    // combo: s.includes('ﬗ')
  };
}

const nameChangeReg = reg('packetReceived', pack => {
  // EntityArmorStand
  if (pack.func_149025_e() !== 30) return;
  if (fastDistance(
    pack.func_149023_f() / 32 - Player.getX(),
    pack.func_149029_h() / 32 - Player.getZ()
  ) > settings.logDamageRange) return;

  const list = pack.func_149027_c();
  if (list[lastI]?.func_75672_a() === 2) processName(list[lastI].func_75669_b());
  else {
    list.some((v, i) => {
      if (v.func_75672_a() !== 2) return;
      lastI = i;
      const n = v.func_75669_b();
      processName(n);
      return true;
    });
  }
}).setFilteredClass(net.minecraft.network.play.server.S0FPacketSpawnMob);

export function init() { }
export function load() {
  nameChangeReg.register();
}
export function unload() {
  nameChangeReg.unregister();
}