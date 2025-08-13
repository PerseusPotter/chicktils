import settings from '../../settings';
import { log } from '../../util/log';
import { JavaTypeOrNull } from '../../util/polyfill';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateIsInBoss, statePrinceKilled } from '../dungeon.js';

const ScoreCalculation = JavaTypeOrNull('gg.skytils.skytilsmod.features.impl.dungeons.ScoreCalculation')?.INSTANCE;
const notifs = [false, false, false, false, false];

const scoreUpdateReg = reg('packetReceived', pack => {
  if (pack.func_149307_h() !== 2) return;
  if (!pack.func_149312_c().startsWith('team_')) return;

  if (!pack.func_149311_e().startsWith('Cleared:')) return;

  // '§8(18)'
  const score = parseInt(pack.func_149309_f().slice(3, -1)) + (stateIsInBoss.get() ? 0 : 28);
  if (score === 0 || Number.isNaN(score)) return;
  if (score < 280) return;

  // hopefully so that tablist updates
  Client.scheduleTask(2, () => {
    const stScore = ScoreCalculation.getTotalScore().get() + (statePrinceKilled.get() ? 1 : 0);

    let diff = score - stScore;
    if (diff > 4 && !ScoreCalculation.isPaul().get()) {
      if (!notifs[0]) log(`&dGuessing that Paul is active (score difference of ${diff})`);
      notifs[0] = true;
      ScoreCalculation.isPaul().set(true);
      diff -= 10;
    }
    if (diff < 5 && ScoreCalculation.isPaul().get()) {
      if (!notifs[1]) log(`&dGuessing that Paul is no longer active (score difference of ${diff})`);
      notifs[1] = true;
      ScoreCalculation.isPaul().set(false);
      diff += 10;
    }
    if (diff > 0 && ScoreCalculation.getDeaths().get() > 0 && !ScoreCalculation.getFirstDeathHadSpirit().get()) {
      if (!notifs[2]) log(`&dGuessing that first death DID have spirit (score difference of ${diff})`);
      notifs[2] = true;
      ScoreCalculation.getFirstDeathHadSpirit().set(true);
      diff--;
    }
    if (diff >= 2 && !ScoreCalculation.getMimicKilled().get()) {
      if (!notifs[3]) log(`&dGuessing that mimic has been killed (score difference of ${diff})`);
      notifs[3] = true;
      ScoreCalculation.getMimicKilled().set(true);
      diff -= 2;
    }
    if (diff >= 1 && !statePrinceKilled.get()) {
      if (!notifs[4]) log(`&dGuessing that a prince has been killed (score difference of ${diff})`);
      notifs[4] = true;
      statePrinceKilled.set(true);
      diff--;
    }

    if (diff !== 0) log(`&4Discrepancy of ${diff} between actual and estimated scores`);
  });
}).setFilteredClass(net.minecraft.network.play.server.S3EPacketTeams).setEnabled(new StateProp(ScoreCalculation).and(settings._dungeonGuessMimic));

export function start() {
  for (let i = 0; i < notifs.length; i++) notifs[i] = false;

  scoreUpdateReg.register();
}
export function reset() {
  scoreUpdateReg.unregister();
}