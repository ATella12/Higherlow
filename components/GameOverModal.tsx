type GameOverModalProps = {
  score: number;
  highScore: number;
  streak: number;
  difficulty: string;
  difficultyBest: number;
  onPlayAgain: () => void | Promise<void>;
  onChangeDifficulty: () => void | Promise<void>;
  playAgainPending?: boolean;
  changeDifficultyPending?: boolean;
  actionsDisabled?: boolean;
};

export function GameOverModal({
  score,
  highScore,
  streak,
  difficulty,
  difficultyBest,
  onPlayAgain,
  onChangeDifficulty,
  playAgainPending = false,
  changeDifficultyPending = false,
  actionsDisabled = false
}: GameOverModalProps) {
  return (
    <div className="game-over-backdrop">
      <div className="game-over-card">
        <h3>Round over</h3>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          You guessed {score} in a row. Think you can beat that streak?
        </p>
        <div className="game-over-grid">
          <div className="stat-chip">
            <span className="label">Score</span>
            <span className="value">{score}</span>
          </div>
          <div className="stat-chip">
            <span className="label">High Score</span>
            <span className="value">{highScore}</span>
          </div>
          <div className="stat-chip">
            <span className="label">Mode</span>
            <span className="value">{difficulty}</span>
          </div>
          <div className="stat-chip">
            <span className="label">Best in Mode</span>
            <span className="value">{difficultyBest}</span>
          </div>
          <div className="stat-chip">
            <span className="label">Streak</span>
            <span className="value">{streak}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
          <button
            className="cta-primary"
            onClick={onPlayAgain}
            disabled={playAgainPending || actionsDisabled}
          >
            {playAgainPending ? "Confirming..." : "Play again"}
          </button>
          <button
            className="cta-secondary"
            onClick={onChangeDifficulty}
            disabled={changeDifficultyPending || actionsDisabled}
          >
            {changeDifficultyPending ? "Confirming..." : "Change difficulty"}
          </button>
        </div>
      </div>
    </div>
  );
}
