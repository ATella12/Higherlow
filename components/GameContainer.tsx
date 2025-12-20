import { ReactNode } from "react";

type GameContainerProps = {
  children: ReactNode;
};

export function GameContainer({ children }: GameContainerProps) {
  return (
    <div className="app-shell">
      <div className="phone">
        <div className="bg-grid" />
        <div className="game-body">{children}</div>
      </div>
    </div>
  );
}
