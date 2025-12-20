import { Difficulty, SearchTerm } from "./types";

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export const DIFFICULTY_THRESHOLDS = {
  easy: 50_000_000,
  medium: 5_000_000
};

export function computeDifficulty(searches: number): Difficulty {
  if (searches >= DIFFICULTY_THRESHOLDS.easy) return "easy";
  if (searches >= DIFFICULTY_THRESHOLDS.medium) return "medium";
  return "hard";
}

export function isPlaceholderTerm(term?: string): boolean {
  if (!term) return true;
  return /^(easy|medium|hard)\s+term\s+\d+$/i.test(term.trim());
}

export function isValidTermEntry(entry: SearchTerm): boolean {
  if (!entry || !entry.term) return false;
  if (isPlaceholderTerm(entry.term)) return false;
  if (entry.term.trim().length < 2) return false;
  return true;
}

export function triggerHaptic() {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(12);
  }
}

export function preloadImages(terms: SearchTerm[]) {
  if (typeof window === "undefined") return;
  terms.forEach((term) => {
    const img = new Image();
    img.src = term.imageUrl;
  });
}
