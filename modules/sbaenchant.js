import { JavaTypeOrNull, setAccessible } from '../util/polyfill';

/** @type {({ type: 'Normal' | 'Ultimate', nbtName: string, loreName: string, goodLevel: number, maxLevel: number } | { type: 'Stacking', nbtName: string, loreName: string, goodLevel: number, maxLevel: number, nbtNum: string, statLabel: string, translation: string, stackLevel: number[] })[]} */
const ENCHANT_DICT = [
  {
    type: 'Normal',
    nbtName: 'piscary',
    loreName: 'Piscary',
    goodLevel: 5,
    maxLevel: 7
  },
  {
    type: 'Normal',
    nbtName: 'prosperity',
    loreName: 'Prosperity',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'sunder',
    loreName: 'Sunder',
    goodLevel: 0,
    maxLevel: 6
  },
  {
    type: 'Normal',
    nbtName: 'dedication',
    loreName: 'Dedication',
    goodLevel: 3,
    maxLevel: 4
  },
  {
    type: 'Normal',
    nbtName: 'green_thumb',
    loreName: 'Green Thumb',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'reflection',
    loreName: 'Reflection',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'quantum',
    loreName: 'Quantum',
    goodLevel: 3,
    maxLevel: 5
  },
  {
    type: 'Ultimate',
    nbtName: 'ultimate_the_one',
    loreName: 'The One',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'transylvanian',
    loreName: 'Transylvanian',
    goodLevel: 3,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'pesterminator',
    loreName: 'Pesterminator',
    goodLevel: 4,
    maxLevel: 6
  },
  {
    type: 'Ultimate',
    nbtName: 'ultimate_refrigerate',
    loreName: 'Refrigerate',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'ice_cold',
    loreName: 'Ice Cold',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'paleontologist',
    loreName: 'Paleontologist',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Stacking',
    nbtName: 'toxophilite',
    loreName: 'Toxophilite',
    goodLevel: 0,
    maxLevel: 10,
    nbtNum: 'toxophilite_combat_xp',
    statLabel: 'toxophiliteCombatXp',
    translation: 'Toxophilite Combat XP',
    stackLevel: [0, 50_000, 100_000, 250_000, 500_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000]
  },
  {
    type: 'Ultimate',
    nbtName: 'ultimate_flowstate',
    loreName: 'Flowstate',
    goodLevel: 0,
    maxLevel: 3
  },
  {
    type: 'Normal',
    nbtName: 'pristine',
    loreName: 'Prismatic',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'lapidary',
    loreName: 'Lapidary',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'scavenger',
    loreName: 'Scavenger',
    goodLevel: 3,
    maxLevel: 6
  },
  {
    type: 'Normal',
    nbtName: 'experience',
    loreName: 'Experience',
    goodLevel: 3,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'small_brain',
    loreName: 'Small Brain',
    goodLevel: 3,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'tidal',
    loreName: 'Tidal',
    goodLevel: 2,
    maxLevel: 3
  },
  {
    type: 'Normal',
    nbtName: 'quick_bite',
    loreName: 'Quick Bite',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'luck_of_the_sea',
    loreName: 'Luck Of The Sea',
    goodLevel: 5,
    maxLevel: 7
  },
  {
    type: 'Normal',
    nbtName: 'charm',
    loreName: 'Charm',
    goodLevel: 4,
    maxLevel: 6
  },
  {
    type: 'Normal',
    nbtName: 'frail',
    loreName: 'Frail',
    goodLevel: 5,
    maxLevel: 7
  },
  {
    type: 'Normal',
    nbtName: 'spiked_hook',
    loreName: 'Spiked Hook',
    goodLevel: 5,
    maxLevel: 7
  },
  {
    type: 'Normal',
    nbtName: 'drain',
    loreName: 'Drain',
    goodLevel: 3,
    maxLevel: 5
  },
  {
    type: 'Stacking',
    nbtName: 'absorb',
    loreName: 'Absorb',
    goodLevel: 0,
    maxLevel: 10,
    nbtNum: 'absorb_logs_chopped',
    statLabel: 'absorbLogsChopped',
    translation: 'Absorb Logs Chopped',
    stackLevel: [0, 1_000, 5_000, 25_000, 100_000, 300_000, 1_500_000, 5_000_000, 25_000_000, 50_000_000]
  },
  {
    type: 'Normal',
    nbtName: 'arcane',
    loreName: 'Arcane',
    goodLevel: 4,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'forest_pledge',
    loreName: 'Forest Pledge',
    goodLevel: 3,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'respiration',
    loreName: 'Respiration',
    goodLevel: 3,
    maxLevel: 4
  },
  {
    type: 'Normal',
    nbtName: 'scuba',
    loreName: 'Scuba',
    goodLevel: 3,
    maxLevel: 5
  },
  {
    type: 'Normal',
    nbtName: 'stealth',
    loreName: 'Stealth',
    goodLevel: 0,
    maxLevel: 1
  },
  {
    type: 'Ultimate',
    nbtName: 'ultimate_first_impression',
    loreName: 'First Impression',
    goodLevel: 0,
    maxLevel: 5
  },
  {
    type: 'Ultimate',
    nbtName: 'ultimate_missile',
    loreName: 'Missile',
    goodLevel: 0,
    maxLevel: 5
  }
];

const arrToTreeSet = (function() {
  const TreeSet = Java.type('java.util.TreeSet');
  return arr => arr.reduce((a, v) => (a.add(v), a), new TreeSet());
}());

let added = false;
export function init() { }
export function load() {
  if (added) return;
  added = true;

  const EnchantManager = JavaTypeOrNull('codes.biscuit.skyblockaddons.features.enchants.EnchantManager');
  if (!EnchantManager) return;

  const enchantsF = setAccessible(EnchantManager.class.getDeclaredField('enchants'));
  const enchants = enchantsF.get(null);
  const EnchantMap = {
    Normal: setAccessible(enchants.class.getDeclaredField('NORMAL')).get(enchants),
    Ultimate: setAccessible(enchants.class.getDeclaredField('ULTIMATE')).get(enchants),
    Stacking: setAccessible(enchants.class.getDeclaredField('STACKING')).get(enchants)
  };

  const Enchant = EnchantManager.Enchant;
  const EnchantConstructor = {
    Normal: setAccessible(Enchant.Normal.class.getDeclaredConstructor()),
    Ultimate: setAccessible(Enchant.Ultimate.class.getDeclaredConstructor()),
    Stacking: setAccessible(Enchant.Stacking.class.getDeclaredConstructor())
  };

  const EnchantTranslations = Java.type('codes.biscuit.skyblockaddons.SkyblockAddons').getInstance().getConfigValues().getLanguageConfig().get('enchants');

  const nbtNameF = setAccessible(Enchant.class.getDeclaredField('nbtName'));
  const loreNameF = setAccessible(Enchant.class.getDeclaredField('loreName'));
  const goodLevelF = setAccessible(Enchant.class.getDeclaredField('goodLevel'));
  const maxLevelF = setAccessible(Enchant.class.getDeclaredField('maxLevel'));
  const nbtNumF = setAccessible(Enchant.Stacking.class.getDeclaredField('nbtNum'));
  const statLabelF = setAccessible(Enchant.Stacking.class.getDeclaredField('statLabel'));
  const stackLevelF = setAccessible(Enchant.Stacking.class.getDeclaredField('stackLevel'));

  ENCHANT_DICT.forEach(v => {
    const e = EnchantConstructor[v.type].newInstance();

    nbtNameF.set(e, v.nbtName);
    loreNameF.set(e, v.loreName);
    goodLevelF.setInt(e, v.goodLevel);
    maxLevelF.setInt(e, v.maxLevel);

    if (v.type === 'Stacking') {
      nbtNumF.set(e, v.nbtNum);
      statLabelF.set(e, v.statLabel);
      stackLevelF.set(e, arrToTreeSet(v.stackLevel.map(n => new (Java.type('java.lang.Integer'))(n))));
      EnchantTranslations.addProperty(v.statLabel, v.translation);
    }

    EnchantMap[v.type].put(v.loreName.toLowerCase(), e);
  });
}
export function unload() { }