export type Difficulty = "easy" | "medium" | "hard";

export type GameState = "selectingDifficulty" | "awaitingGuess" | "revealing" | "transitioning" | "gameOver";

export type SearchTerm = {
  id: string;
  term: string;
  searches: number;
  imageUrl: string;
  difficulty: Difficulty;
  source?: string;
  tags?: string[];
  familiarity?: "global" | "popular" | "niche";
};
