type GuessButtonsProps = {
  locked?: boolean;
  onHigher: () => void;
  onLower: () => void;
};

export function GuessButtons({ locked, onHigher, onLower }: GuessButtonsProps) {
  return (
    <div className="guess-area">
      <button className="cta-primary" onClick={onHigher} disabled={locked}>
        Higher
      </button>
      <button className="cta-secondary" onClick={onLower} disabled={locked}>
        Lower
      </button>
    </div>
  );
}
