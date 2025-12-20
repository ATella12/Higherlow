"use client";

const getLocalStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const asyncStorage = {
  async getItem(key: string): Promise<string | null> {
    const storage = getLocalStorage();
    if (!storage) return null;
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  async removeItem(key: string): Promise<void> {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch {
      // ignore
    }
  },
  async clear(): Promise<void> {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.clear();
    } catch {
      // ignore
    }
  },
  async getAllKeys(): Promise<string[]> {
    const storage = getLocalStorage();
    if (!storage) return [];
    try {
      return Array.from({ length: storage.length }, (_, i) => storage.key(i) || "").filter(Boolean);
    } catch {
      return [];
    }
  }
};

export default asyncStorage;
