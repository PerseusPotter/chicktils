import settings from '../../settings';
import { log } from '../../util/log';
import { JavaTypeOrNull } from '../../util/polyfill';
import reg from '../../util/registerer';
import { StateProp } from '../../util/state';
import { stateIsInBoss } from '../dungeon';

const ScoreCalculation = JavaTypeOrNull('gg.skytils.skytilsmod.features.impl.dungeons.ScoreCalculation')?.INSTANCE;
let princeKilled = false;

const scoreUpdateReg = reg('packetReceived', pack => {
  if (ScoreCalculation.getMimicKilled()) return;
  if (pack.func_149307_h() !== 2) return;
  if (!pack.func_149312_c().startsWith('team_')) return;

  if (!pack.func_149311_e().startsWith('Cleared:')) return;

  // '§8(18)'
  const score = parseInt(pack.func_149309_f().slice(3, -1)) + 28;
  if (score < 290) return;

  // hopefully so that tablist updates
  Client.scheduleTask(2, () => {
    const stScore = ScoreCalculation.getTotalScore().get();

    let diff = score - stScore;
    if (diff > 4 && !ScoreCalculation.isPaul().get()) {
      log(`&dGuessing that Paul is active (score difference of ${diff})`);
      ScoreCalculation.isPaul().set(true);
      diff -= 10;
    }
    if (diff < 5 && ScoreCalculation.isPaul().get()) {
      log(`&dGuessing that Paul is no longer active (score difference of ${diff})`);
      ScoreCalculation.isPaul().set(false);
      diff += 10;
    }
    if (diff > 0 && ScoreCalculation.getDeaths().get() > 0 && !ScoreCalculation.getFirstDeathHadSpirit().get()) {
      log(`&dGuessing that first death DID have spirit (score difference of ${diff})`);
      ScoreCalculation.getFirstDeathHadSpirit().set(true);
      diff--;
    }
    if (diff >= 2 && !ScoreCalculation.getMimicKilled().get()) {
      log(`&dGuessing that mimic has been killed (score difference of ${diff})`);
      ScoreCalculation.getMimicKilled().set(true);
      diff -= 2;
    }
    if (diff >= 1 && !princeKilled) {
      log(`&dGuessing that a prince has been killed (score difference of ${diff})`);
      princeKilled = true;
      diff--;
    }

    if (diff !== 0) log(`&4Discrepancy of ${diff} between actual and estimated scores`);
  });
}).setFilteredClass(net.minecraft.network.play.server.S3EPacketTeams).setEnabled(new StateProp(stateIsInBoss).not().and(ScoreCalculation).and(settings._dungeonGuessMimic));

export function start() {
  princeKilled = false;

  scoreUpdateReg.register();
}
export function reset() {
  scoreUpdateReg.unregister();
}