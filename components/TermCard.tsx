import { ReactNode } from "react";
import { clsx } from "clsx";
import { SearchTerm } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";

type TermCardProps = {
  term: SearchTerm | null;
  position: "top" | "bottom";
  revealed: boolean;
  highlight?: "success" | "error" | null;
  shake?: boolean;
  actions?: ReactNode;
  hint?: string;
};

export function TermCard({ term, position, revealed, highlight, shake, actions, hint }: TermCardProps) {
  const safeName =
    term?.term && term.term.trim().length > 1 ? term.term : (console.warn("Missing term name", term), "Unknown");
  const animated = useCountUp(term?.searches ?? 0, 420, revealed);

  return (
    <div
      className={clsx(
        "term-card",
        revealed && "revealed",
        highlight === "success" && "highlight-success",
        highlight === "error" && "highlight-error",
        shake && "shake"
      )}
      data-position={position}
    >
      <div
        className="media"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6,7,15,0.08), rgba(6,7,15,0.75)), url(${
            term?.imageUrl ?? "https://picsum.photos/seed/placeholder/800/1100"
          })`
        }}
      />
      <div className="content">
        <div className="term-name">“{safeName ?? "—"}”</div>
        <div className={clsx("term-number", !revealed && "hidden-number")}>
          {revealed ? formatNumber(animated) : "??,???,???"}
        </div>
        <div className="term-subtitle">
          {revealed ? "average monthly searches" : "pick higher or lower"}
        </div>
        {!revealed && actions && <div className="inline-actions">{actions}</div>}
        {!revealed && hint && (
          <div className="term-subtitle" style={{ marginTop: 8 }}>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
