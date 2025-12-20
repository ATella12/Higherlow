"use client";

type MaybeWindow = typeof window | undefined;

const getStorage = () => {
  if (typeof window === "undefined") return null as MaybeWindow;
  return window;
};

const asyncStorage = {
  async getItem(key: string): Promise<string | null> {
    const w = getStorage();
    if (!w) return null;
    try {
      return w.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    const w = getStorage();
    if (!w) return;
    try {
      w.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  async removeItem(key: string): Promise<void> {
    const w = getStorage();
    if (!w) return;
    try {
      w.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
  async clear(): Promise<void> {
    const w = getStorage();
    if (!w) return;
    try {
      w.localStorage.clear();
    } catch {
      // ignore
    }
  },
  async getAllKeys(): Promise<string[]> {
    const w = getStorage();
    if (!w) return [];
    try {
      return Array.from({ length: w.localStorage.length }, (_, i) => w.localStorage.key(i) || "").filter(Boolean);
    } catch {
      return [];
    }
  }
};

export default asyncStorage;
