import { renderBeacon, renderTracer } from '../../Apelles/index';
import settings from '../settings';
import { drawArrow3DPos } from '../util/draw';
import { compareFloat } from '../util/math';
import { DSU, JavaTypeOrNull, setAccessible } from '../util/polyfill';
import reg from '../util/registerer';
import { StateProp, StateVar } from '../util/state';
import { unrun } from '../util/threading';

/** @type {[number, number, number][]} */
let hotspots = [];
/** @type {[number, number, number][][]} */
let hotspotParts = [];
const stateNearestHotspot = new StateVar();
const stateHotspotDist = new StateVar(0);

const hotspotUpdateReg = reg('step', () => {
  try {
    const a = hotspotParts;
    hotspotParts = [];

    const hotspotLocs = [];
    a.forEach((v, y) => {
      const dists = [];
      for (let i = 0; i < v.length; i++) {
        for (let j = i + 1; j < v.length; j++) {
          let d = (v[i][0] - v[j][0]) ** 2 + (v[i][2] - v[j][2]) ** 2;
          if (d < 4.269) dists.push([i, j, d]);
        }
      }
      const clusters = new DSU(v.length);
      dists.sort((a, b) => a[2] - b[2]).forEach(([i, j]) => {
        if (clusters.find(i) !== clusters.find(j)) clusters.union(i, j);
      });

      const locs = [];
      for (let i = 0; i < v.length; i++) {
        let r = clusters.find(i);
        if (!locs[r]) locs[r] = [0, 0, 0];
        locs[r][0] += v[i][0];
        locs[r][1] += v[i][2];
        locs[r][2]++;
      }

      locs.forEach(([x, z, c]) => {
        if (c > 10) hotspotLocs.push([x / c, y, z / c]);
      });
    });

    unrun(() => {
      hotspots = hotspotLocs;
      const [nearest, dist] = hotspots.reduce((a, v) => {
        const d = Math.hypot(Player.getX() - v[0], Player.getZ() - v[2]);
        if (d < a[1]) return [v, d];
        return a;
      }, [null, Number.POSITIVE_INFINITY]);
      stateNearestHotspot.set(nearest);
      stateHotspotDist.set(dist);
    });
  } catch (_) { }
}).setEnabled(settings._fishingTilsHotspotWaypoint).setFps(1);
const EnumParticleTypes = Java.type('net.minecraft.util.EnumParticleTypes');
const hotspotPartReg = reg('packetReceived', pack => {
  if (pack.func_179749_a().equals(EnumParticleTypes.REDSTONE)) {
    if (pack.func_149222_k() !== 0) return;
    if (pack.func_149227_j() !== 1) return;
    if (!pack.func_179750_b()) return;
    if (pack.func_149221_g() !== 1) return;
    if (compareFloat(pack.func_149224_h(), 0.4117647409439087) !== 0) return;
    if (compareFloat(pack.func_149223_i(), 0.7058823704719543) !== 0) return;
  } else if (pack.func_179749_a().equals(EnumParticleTypes.SMOKE_NORMAL)) {
    if (pack.func_149227_j() !== 0) return;
    if (!pack.func_179750_b()) return;
    if (pack.func_149221_g() !== 0) return;
    if (pack.func_149224_h() !== 0) return;
    if (pack.func_149223_i() !== 0) return;
  } else return;

  const x = pack.func_149220_d();
  const y = pack.func_149226_e();
  const z = pack.func_149225_f();
  const yFloor = ~~y;
  if (!hotspotParts[yFloor]) hotspotParts[yFloor] = [];
  hotspotParts[yFloor].push([x, y, z]);
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).setEnabled(settings._fishingTilsHotspotWaypoint);

const stateInHotspotRange = new StateProp(stateHotspotDist).customBinary(settings._fishingTilsHotspotWaypointDisableRange, (d, s) => d > s).and(settings._fishingTilsHotspotWaypoint);
const hotspotRenderReg = reg('renderWorld', () => {
  hotspots.forEach(v => {
    renderBeacon(
      settings.fishingTilsHotspotWaypointColor,
      v[0], v[1], v[2],
      { phase: true }
    );
  });
}).setEnabled(stateInHotspotRange);
const hotspotArrowOvlReg = reg('renderOverlay', () => {
  drawArrow3DPos(
    settings.fishingTilsHotspotWaypointColor,
    stateNearestHotspot.get()[0], stateNearestHotspot.get()[1], stateNearestHotspot.get()[2],
    false
  );
}).setEnabled(stateInHotspotRange.and(stateNearestHotspot).and(new StateProp(settings._preferUseTracer).not()));
const hotspotArrowWrdReg = reg('renderWorld', () => {
  renderTracer(
    settings.fishingTilsHotspotWaypointColor,
    stateNearestHotspot.get()[0], stateNearestHotspot.get()[1], stateNearestHotspot.get()[2],
    { lw: 3 }
  );
}).setEnabled(stateInHotspotRange.and(stateNearestHotspot).and(settings._preferUseTracer));

export function init() {
  const stateAddedSBA = new StateVar(false);
  new StateProp(stateAddedSBA).not().and(settings._fishingTilsUpdateSBAList).listen(v => {
    if (!v) return;

    const SeaCreatureManager = JavaTypeOrNull('codes.biscuit.skyblockaddons.core.seacreatures.SeaCreatureManager');
    if (!SeaCreatureManager) return;

    const SeaCreature = JavaTypeOrNull('codes.biscuit.skyblockaddons.core.seacreatures.SeaCreature');
    const ItemRarity = JavaTypeOrNull('codes.biscuit.skyblockaddons.core.ItemRarity');
    const createSeaCreature = (function() {
      const SeaCreatureConstructor = setAccessible(SeaCreature.class.getDeclaredConstructor());
      const nameF = setAccessible(SeaCreature.class.getDeclaredField('name'));
      const rarityF = setAccessible(SeaCreature.class.getDeclaredField('rarity'));
      const spawnMessageF = setAccessible(SeaCreature.class.getDeclaredField('spawnMessage'));
      return function(name, rarity, spawnMessage) {
        const inst = SeaCreatureConstructor.newInstance();
        nameF.set(inst, name);
        rarityF.set(inst, ItemRarity[rarity]);
        spawnMessageF.set(inst, spawnMessage);
        return inst;
      };
    }());

    // const allMessages = SeaCreatureManager.getInstance().getAllSeaCreatureSpawnMessages();
    // const legMessages = SeaCreatureManager.getInstance().getLegendarySeaCreatureSpawnMessages();

    /** @type {{ name: string, rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC', spawnMessage: string }[]} */
    const SCList = [
      {
        name: 'Squid',
        rarity: 'COMMON',
        spawnMessage: 'A Squid appeared.'
      },
      {
        name: 'Sea Walker',
        rarity: 'COMMON',
        spawnMessage: 'You caught a Sea Walker.'
      },
      {
        name: 'Night Squid',
        rarity: 'COMMON',
        spawnMessage: 'Pitch darkness reveals a Night Squid.'
      },
      {
        name: 'Frozen Steve',
        rarity: 'COMMON',
        spawnMessage: 'Frozen Steve fell into the pond long ago, never to resurface...until now!'
      },
      {
        name: 'Nurse Shark',
        rarity: 'COMMON',
        spawnMessage: 'A tiny fin emerges from the water, you\'ve caught a Nurse Shark.'
      },
      {
        name: 'Sea Guardian',
        rarity: 'COMMON',
        spawnMessage: 'You stumbled upon a Sea Guardian.'
      },
      {
        name: 'Frosty',
        rarity: 'COMMON',
        spawnMessage: 'It\'s a snowman! He looks harmless.'
      },
      {
        name: 'Scarecrow',
        rarity: 'COMMON',
        spawnMessage: 'Phew! It\'s only a scarecrow.'
      },
      {
        name: 'Sea Witch',
        rarity: 'UNCOMMON',
        spawnMessage: 'It looks like you\'ve disrupted the Sea Witch\'s brewing session. Watch out, she\'s furious!'
      },
      {
        name: 'Blue Shark',
        rarity: 'UNCOMMON',
        spawnMessage: 'You spot a fin as blue as the water it came from, it\'s a Blue Shark.'
      },
      {
        name: 'Sea Archer',
        rarity: 'UNCOMMON',
        spawnMessage: 'You reeled in a Sea Archer.'
      },
      {
        name: 'Monster of The Deep',
        rarity: 'UNCOMMON',
        spawnMessage: 'The Monster of the Deep has emerged.'
      },
      {
        name: 'Grinch',
        rarity: 'UNCOMMON',
        spawnMessage: 'The Grinch stole Jerry\'s Gifts...get them back!'
      },
      {
        name: 'Catfish',
        rarity: 'RARE',
        spawnMessage: 'Huh? A Catfish!'
      },
      {
        name: 'Nightmare',
        rarity: 'RARE',
        spawnMessage: 'You hear trotting from beneath the waves, you caught a Nightmare.'
      },
      {
        name: 'Carrot King',
        rarity: 'RARE',
        spawnMessage: 'Is this even a fish? It\'s the Carrot King!'
      },
      {
        name: 'Sea Leech',
        rarity: 'RARE',
        spawnMessage: 'Gross! A Sea Leech!'
      },
      {
        name: 'Magma Slug',
        rarity: 'UNCOMMON',
        spawnMessage: 'From beneath the lava appears a Magma Slug.'
      },
      {
        name: 'Lava Flame',
        rarity: 'RARE',
        spawnMessage: 'A Lava Flame flies out from beneath the lava.'
      },
      {
        name: 'Lava Leech',
        rarity: 'RARE',
        spawnMessage: 'A small but fearsome Lava Leech emerges.'
      },
      {
        name: 'Fire Eel',
        rarity: 'RARE',
        spawnMessage: 'A Fire Eel slithers out from the depths.'
      },
      {
        name: 'Moogma',
        rarity: 'UNCOMMON',
        spawnMessage: 'You hear a faint Moo from the lava... A Moogma appears.'
      },
      {
        name: 'Pyroclastic Worm',
        rarity: 'RARE',
        spawnMessage: 'You feel the heat radiating as a Pyroclastic Worm surfaces.'
      },
      {
        name: 'Tarus',
        rarity: 'RARE',
        spawnMessage: 'Taurus and his steed emerge.'
      },
      {
        name: 'Guardian Defender',
        rarity: 'EPIC',
        spawnMessage: 'You\'ve discovered a Guardian Defender of the sea.'
      },
      {
        name: 'Werewolf',
        rarity: 'RARE',
        spawnMessage: 'It must be a full moon, a Werewolf appears.'
      },
      {
        name: 'Tiger Shark',
        rarity: 'EPIC',
        spawnMessage: 'A striped beast bounds from the depths, the wild Tiger Shark!'
      },
      {
        name: 'Deep Sea Protector',
        rarity: 'EPIC',
        spawnMessage: 'You have awoken the Deep Sea Protector, prepare for a battle!'
      },
      {
        name: 'Water Hydra',
        rarity: 'LEGENDARY',
        spawnMessage: 'The Water Hydra has come to test your strength.'
      },
      {
        name: 'Phantom Fisher',
        rarity: 'LEGENDARY',
        spawnMessage: 'The spirit of a long lost Phantom Fisher has come to haunt you.'
      },
      {
        name: 'Great White Shark',
        rarity: 'LEGENDARY',
        spawnMessage: 'Hide no longer, a Great White Shark has tracked your scent and thirsts for your blood!'
      },
      {
        name: 'Yeti',
        rarity: 'LEGENDARY',
        spawnMessage: 'What is this creature!?'
      },
      {
        name: 'Grim Reaper',
        rarity: 'LEGENDARY',
        spawnMessage: 'This can\'t be! The manifestation of death himself!'
      },
      {
        name: 'Thunder',
        rarity: 'MYTHIC',
        spawnMessage: 'You hear a massive rumble as Thunder emerges.'
      },
      {
        name: 'Lord Jawbus',
        rarity: 'MYTHIC',
        spawnMessage: 'You have angered a legendary creature... Lord Jawbus has arrived.'
      },
      {
        name: 'Frog Man',
        rarity: 'COMMON',
        spawnMessage: 'Is it a frog? Is it a man? Well, yes, sorta, IT\'S FROG MAN!!!!!!'
      },
      {
        name: 'Trash Gobbler',
        rarity: 'COMMON',
        spawnMessage: 'The Trash Gobbler is hungry for you!'
      },
      {
        name: 'Dumpster Diver',
        rarity: 'UNCOMMON',
        spawnMessage: 'A Dumpster Diver has emerged from the swamp!'
      },
      {
        name: 'Mithril Grubber',
        rarity: 'UNCOMMON',
        spawnMessage: 'A leech of the mines surfaces... you\'ve caught a Mithril Grubber.'
      },
      {
        name: 'Oasis Sheep',
        rarity: 'UNCOMMON',
        spawnMessage: 'An Oasis Sheep appears from the water.'
      },
      {
        name: 'Oasis Rabbit',
        rarity: 'UNCOMMON',
        spawnMessage: 'An Oasis Rabbit appears from the water.'
      },
      {
        name: 'Banshee',
        rarity: 'RARE',
        spawnMessage: 'The desolate wail of a Banshee breaks the silence.'
      },
      {
        name: 'Snapping Turtle',
        rarity: 'RARE',
        spawnMessage: 'A Snapping Turtle is coming your way, and it\'s ANGRY!'
      },
      {
        name: 'Rider of the Deep',
        rarity: 'UNCOMMON',
        spawnMessage: 'The Rider of the Deep has emerged.'
      },
      {
        name: 'Fried Chicken',
        rarity: 'COMMON',
        spawnMessage: 'Smells of burning. Must be a Fried Chicken.'
      },
      {
        name: 'Agarimoo',
        rarity: 'RARE',
        spawnMessage: 'Your Chumcap Bucket trembles, it\'s an Agarimoo.'
      },
      {
        name: 'Water Worm',
        rarity: 'RARE',
        spawnMessage: 'A Water Worm surfaces!'
      },
      {
        name: 'Bayou Sludge',
        rarity: 'RARE',
        spawnMessage: 'A swampy mass of slime emerges, the Bayou Sludge!'
      },
      {
        name: 'Fireproof Witch',
        rarity: 'RARE',
        spawnMessage: 'Trouble\'s brewing, it\'s a Fireproof Witch!'
      },
      {
        name: 'Poisoned Water Worm',
        rarity: 'RARE',
        spawnMessage: 'A Poisoned Water Worm surfaces!'
      },
      {
        name: 'Flaming Worm',
        rarity: 'RARE',
        spawnMessage: 'A Flaming Worm surfaces from the depths!'
      },
      {
        name: 'Lava Blaze',
        rarity: 'EPIC',
        spawnMessage: 'A Lava Blaze has surfaced from the depths!'
      },
      {
        name: 'Alligator',
        rarity: 'LEGENDARY',
        spawnMessage: 'A long snout breaks the surface of the water. It\'s an Alligator!'
      },
      {
        name: 'The Sea Emperor',
        rarity: 'LEGENDARY',
        spawnMessage: 'The Sea Emperor arises from the depths.'
      },
      {
        name: 'Lava Pigman',
        rarity: 'EPIC',
        spawnMessage: 'A Lava Pigman arose from the depths!'
      },
      {
        name: 'Abyssal Miner',
        rarity: 'LEGENDARY',
        spawnMessage: 'An Abyssal Miner breaks out of the water!'
      },
      {
        name: 'Nutcracker',
        rarity: 'RARE',
        spawnMessage: 'You found a forgotten Nutcracker laying beneath the ice.'
      },
      {
        name: 'Titanoboa',
        rarity: 'MYTHIC',
        spawnMessage: 'A massive Titanoboa surfaces. It\'s body stretches as far as the eye can see.'
      },
      {
        name: 'Blue Ringed Octopus',
        rarity: 'LEGENDARY',
        spawnMessage: 'A garish set of tentacles arise. It\'s a Blue Ringed Octopus!'
      },
      {
        name: 'Reindrake',
        rarity: 'MYTHIC',
        spawnMessage: 'A Reindrake forms from the depths.'
      },
      {
        name: 'Plhlegblast',
        rarity: 'MYTHIC',
        spawnMessage: 'WOAH! A Plhlegblast appeared.'
      },
      {
        name: 'Fiery Scuttler',
        rarity: 'LEGENDARY',
        spawnMessage: 'A Fiery Scuttler inconspicuously waddles up to you, friends in tow.'
      },
      {
        name: 'Wiki Tiki',
        rarity: 'MYTHIC',
        spawnMessage: 'The water bubbles and froths. A massive form emerges- you have disturbed the Wiki Tiki! You shall pay the price.'
      },
      {
        name: 'Ragnarok',
        rarity: 'MYTHIC',
        spawnMessage: 'The sky darkens and the air thickens. The end times are upon us: Ragnarok is here.'
      }
    ];
    const map = new HashMap();
    SCList.forEach(({ name, rarity, spawnMessage }) => {
      // allMessages.add(spawnMessage);
      // if (rarity === 'LEGENDARY' || rarity === 'MYTHIC') legMessages.add(spawnMessage);
      const sc = createSeaCreature(name, rarity, spawnMessage);
      map.put(name, sc);
    });
    SeaCreatureManager.getInstance().setSeaCreatures(map);
    stateAddedSBA.set(true);
  });
}
export function load() {
  hotspotUpdateReg.register();
  hotspotPartReg.register();
  hotspotRenderReg.register();
  hotspotArrowOvlReg.register();
  hotspotArrowWrdReg.register();
}
export function unload() {
  hotspotUpdateReg.unregister();
  hotspotPartReg.unregister();
  hotspotRenderReg.unregister();
  hotspotArrowOvlReg.unregister();
  hotspotArrowWrdReg.unregister();
}