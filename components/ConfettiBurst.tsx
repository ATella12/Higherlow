type ConfettiBurstProps = {
  active: boolean;
};

const pieces = Array.from({ length: 26 }, (_, i) => i);

export function ConfettiBurst({ active }: ConfettiBurstProps) {
  if (!active) return null;
  return (
    <div className="confetti">
      {pieces.map((i) => (
        <span
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.2}s`,
            animationDuration: `${0.6 + Math.random() * 0.4}s`
          }}
        />
      ))}
    </div>
  );
}
