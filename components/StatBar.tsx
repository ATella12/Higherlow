type StatBarProps = {
  score: number;
  highScore: number;
  difficultyLabel?: string;
};

export function StatBar({ score, highScore, difficultyLabel }: StatBarProps) {
  const modeLabel = difficultyLabel ?? "Select mode";
  return (
    <div className="stat-bar">
      <div className="stat-cell">
        <span className="pill-label">High Score</span>
        <span className="stat-value">{highScore}</span>
      </div>
      <div className="stat-cell stat-mode">
        <span className="pill-label">Mode</span>
        <span className="mode-value">{modeLabel}</span>
      </div>
      <div className="stat-cell">
        <span className="pill-label">Score</span>
        <span className="stat-value">{score}</span>
      </div>
    </div>
  );
}
