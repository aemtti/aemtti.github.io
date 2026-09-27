// match.js — round flow, win conditions, economy and side switching (MR-x competitive).
import * as C from './constants.js';
import { SPAWNS } from '../world/brushes.js';
import {
  resetForRound, clearInventory, giveWeapon, addMoney, switchTo, bestWeapon,
} from './player.js';
import * as A from '../core/audio.js';

export class Match {
  constructor(game, maxRounds = 12) {
    this.game = game;
    this.maxRounds = maxRounds;              // first to maxRounds+1 wins
    this.halfAt = maxRounds;
    this.score = { [C.TEAM.T]: 0, [C.TEAM.CT]: 0 };
    this.lossStreak = { [C.TEAM.T]: 0, [C.TEAM.CT]: 0 };
    this.round = 0;
    this.state = 'freeze';
    this.timer = 0;
    this.buyTimer = 0;
    this.roundWinner = 0;
    this.roundReason = '';
    this.startSide = C.TEAM.CT;
    this.swapped = false;
    this.matchOver = false;
    this.pistolRound = true;
  }

  get roundsPlayed() { return this.score[C.TEAM.T] + this.score[C.TEAM.CT]; }

  begin() {
    this.round = 0;
    this.score[C.TEAM.T] = 0;
    this.score[C.TEAM.CT] = 0;
    this.lossStreak[C.TEAM.T] = 0;
    this.lossStreak[C.TEAM.CT] = 0;
    for (const p of this.game.players) {
      p.money = C.START_MONEY;
      p.kills = p.deaths = p.assists = p.score = p.damageDealt = p.mvps = 0;
      clearInventory(p);
    }
    this.startRound();
  }

  startRound() {
    const game = this.game;
    this.round++;
    this.state = 'freeze';
    this.timer = C.FREEZE_TIME;
    this.buyTimer = C.BUY_TIME;
    this.roundWinner = 0;
    this.roundReason = '';
    this.pistolRound = this.roundsPlayed === 0 || this.roundsPlayed === this.halfAt;

    game.fx.clearRound();
    game.nades.clear();
    game.bomb.reset();

    const tIdx = { [C.TEAM.T]: 0, [C.TEAM.CT]: 0 };
    for (const p of game.players) {
      // survivors keep their gear; the dead are re-kitted
      if (!p.alive) {
        const keepArmor = 0;
        clearInventory(p);
        p.armor = keepArmor;
        p.helmet = false;
        p.hasKit = false;
      }
      if (!p.inv.secondary && !p.inv.primary) {
        giveWeapon(p, p.team === C.TEAM.T ? 'glock' : 'usp', { noSwitch: true });
      }
      const list = SPAWNS[p.team === C.TEAM.T ? 'T' : 'CT'];
      const s = list[tIdx[p.team]++ % list.length];
      resetForRound(p, s);
      switchTo(p, bestWeapon(p), game.now);
    }

    // hand the bomb to a random terrorist
    const ts = game.players.filter((p) => p.team === C.TEAM.T && p.alive);
    if (ts.length) {
      const random = game.aiRng || Math.random;
      const carrier = ts[Math.floor(random() * ts.length)];
      game.bomb.giveTo(carrier);
    }

    game.onRoundStart();
    A.SFX.roundStart();
  }

  endRound(winner, reason) {
    if (this.state === 'over') return;
    const game = this.game;
    this.state = 'over';
    this.timer = C.ROUND_END_TIME;
    this.roundWinner = winner;
    this.roundReason = reason;
    this.score[winner]++;

    // ---- economy
    const loser = winner === C.TEAM.T ? C.TEAM.CT : C.TEAM.T;
    let winReward = C.WIN_ELIM;
    if (reason === 'bomb') winReward = C.WIN_BOMB;
    else if (reason === 'defuse') winReward = C.WIN_DEFUSE;
    else if (reason === 'time') winReward = C.WIN_TIME;
    const lossReward = C.LOSS_BONUS[Math.min(this.lossStreak[loser], C.LOSS_BONUS.length - 1)];

    for (const p of game.players) {
      if (p.team === winner) addMoney(p, winReward);
      else {
        addMoney(p, lossReward);
        // consolation for planting even in a lost round
        if (loser === C.TEAM.T && game.bomb.state !== 'none' && game.bomb.planter) {
          addMoney(p, C.PLANT_TEAM_REWARD - 0);
        }
      }
    }
    this.lossStreak[loser] = Math.min(this.lossStreak[loser] + 1, C.LOSS_BONUS.length - 1);
    this.lossStreak[winner] = Math.max(0, this.lossStreak[winner] - 1);

    // ---- MVP: most impactful player on the winning side
    let mvp = null, bestScore = -1;
    for (const p of game.players) {
      if (p.team !== winner) continue;
      let s = p.roundKills * 100 + p.damageDealt;
      if (game.bomb.planter === p && reason === 'bomb') s += 260;
      if (game.bomb.defuser === p && reason === 'defuse') s += 260;
      if (s > bestScore) { bestScore = s; mvp = p; }
    }
    if (mvp && bestScore > 0) { mvp.mvps++; mvp.score += 1; }

    game.onRoundEnd(winner, reason, mvp);
    if (game.localPlayer) {
      if (game.localPlayer.team === winner) A.SFX.win(); else A.SFX.lose();
    }

    const target = this.maxRounds + 1;
    if (this.score[winner] >= target) {
      this.matchOver = true;
    }
  }

  checkWinConditions() {
    if (this.state !== 'live') return;
    const game = this.game;
    const tAlive = game.players.filter((p) => p.team === C.TEAM.T && p.alive).length;
    const ctAlive = game.players.filter((p) => p.team === C.TEAM.CT && p.alive).length;
    const planted = game.bomb.state === 'planted';

    if (ctAlive === 0 && tAlive === 0) { this.endRound(planted ? C.TEAM.T : C.TEAM.CT, 'elim'); return; }
    if (ctAlive === 0) { this.endRound(C.TEAM.T, 'elim'); return; }
    if (tAlive === 0 && !planted) { this.endRound(C.TEAM.CT, 'elim'); return; }
    if (!planted && this.timer <= 0) { this.endRound(C.TEAM.CT, 'time'); return; }
  }

  update(dt) {
    const game = this.game;
    if (this.state === 'freeze') {
      this.timer -= dt;
      this.buyTimer -= dt;
      if (this.timer <= 0) {
        this.state = 'live';
        this.timer = C.ROUND_TIME;
        game.onFreezeEnd();
      }
    } else if (this.state === 'live') {
      this.timer -= dt;
      this.buyTimer -= dt;
      this.checkWinConditions();
    } else if (this.state === 'over') {
      this.timer -= dt;
      if (this.timer <= 0) {
        if (this.matchOver) {
          this.state = 'matchover';
          game.onMatchOver();
          return;
        }
        if (this.roundsPlayed === this.halfAt && !this.swapped) {
          this.swapSides();
        }
        this.startRound();
      }
    }
  }

  swapSides() {
    this.swapped = true;
    const game = this.game;
    for (const p of game.players) {
      p.team = p.team === C.TEAM.T ? C.TEAM.CT : C.TEAM.T;
      p.money = C.START_MONEY;
      clearInventory(p);
      if (p.bot) p.bot.onSideSwap();
      if (p.model) game.rebuildModel(p);
    }
    const t = this.score[C.TEAM.T];
    this.score[C.TEAM.T] = this.score[C.TEAM.CT];
    this.score[C.TEAM.CT] = t;
    const l = this.lossStreak[C.TEAM.T];
    this.lossStreak[C.TEAM.T] = this.lossStreak[C.TEAM.CT];
    this.lossStreak[C.TEAM.CT] = l;
    game.hud.bigMessage('SWITCHING SIDES', 3);
    game.onSideSwap();
  }

  get canBuy() { return this.buyTimer > 0 && this.state !== 'over'; }
  get frozen() { return this.state === 'freeze'; }
}
