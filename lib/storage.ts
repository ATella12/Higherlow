"use client";

type MaybeString = string | null;

const hasWindow = () => typeof window !== "undefined";

export const storage = {
  get(key: string): MaybeString {
    if (!hasWindow()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    if (!hasWindow()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore write errors
    }
  },
  remove(key: string): void {
    if (!hasWindow()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore remove errors
    }
  }
};
