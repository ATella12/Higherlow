import { Difficulty } from "@/lib/types";

type DifficultySelectProps = {
  onSelect: (difficulty: Difficulty) => void | Promise<void>;
  pendingDifficulty?: Difficulty | null;
  disabled?: boolean;
};

const OPTIONS: { label: string; value: Difficulty; description: string; color: string }[] = [
  { label: "Easy", value: "easy", description: "Big famous terms & clear gaps", color: "var(--primary-green)" },
  { label: "Medium", value: "medium", description: "Mixed brands & closer calls", color: "var(--soft-pink)" },
  { label: "Hard", value: "hard", description: "Niche terms with tight spreads", color: "var(--soft-red)" }
];

export function DifficultySelect({ onSelect, pendingDifficulty = null, disabled = false }: DifficultySelectProps) {
  return (
    <div className="difficulty-card">
      <div className="difficulty-head">
        <h2>Choose difficulty</h2>
        <p>Select how spicy you want the matchups to be.</p>
      </div>
      <div className="difficulty-grid">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className="difficulty-pill"
            style={{ borderColor: opt.color }}
            onClick={() => onSelect(opt.value)}
            disabled={disabled || !!pendingDifficulty}
          >
            <div className="pill-top">
              <span style={{ color: opt.color }}>
                {pendingDifficulty === opt.value ? "Confirm in wallet..." : opt.label}
              </span>
            </div>
            <div className="pill-sub">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
