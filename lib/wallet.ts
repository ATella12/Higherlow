"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { ensureBaseChainWithProvider } from "./ensureBaseChain";
import { storage } from "./storage";
import type { EIP1193Provider as ViemEip1193Provider } from "viem";

export type WalletEnvironment = "farcaster" | "injected" | "none";
export type ConnectorType = "farcaster" | "injected" | null;
export type WalletStatus = "idle" | "connecting" | "connected" | "error";

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<any>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
  disconnect?: () => Promise<void> | void;
}

function adaptToEip1193(provider: any): Eip1193Provider {
  const viemLike: ViemEip1193Provider = {
    request: (args: any) => provider.request(args),
    on: provider.on
      ? (event: string, listener: (...args: any[]) => void) => provider.on(event as any, listener as any)
      : undefined,
    removeListener: provider.removeListener
      ? (event: string, listener: (...args: any[]) => void) =>
          provider.removeListener(event as any, listener as any)
      : provider.off
        ? (event: string, listener: (...args: any[]) => void) => provider.off(event as any, listener as any)
        : undefined
  };
  return viemLike as unknown as Eip1193Provider;
}

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  chainId: string | null;
  connectorType: ConnectorType;
  error?: string | null;
}

const STORAGE_KEY = "higherlower-connector";

let cachedFarcasterProvider: Promise<Eip1193Provider | null> | null = null;

const baseState: WalletState = {
  status: "idle",
  address: null,
  chainId: null,
  connectorType: null,
  error: null
};

export function normalizeChainId(chainId: string | number | null): string | null {
  if (chainId === null || chainId === undefined) return null;
  if (typeof chainId === "number") return `0x${chainId.toString(16)}`;
  return chainId;
}

export function persistConnector(type: ConnectorType) {
  if (typeof window === "undefined") return;
  if (!type) {
    storage.remove(STORAGE_KEY);
    return;
  }
  storage.set(STORAGE_KEY, type);
}

export function getPersistedConnector(): ConnectorType {
  if (typeof window === "undefined") return null;
  const stored = storage.get(STORAGE_KEY);
  if (stored === "farcaster" || stored === "injected") return stored;
  return null;
}

export async function getFarcasterProvider(): Promise<Eip1193Provider | null> {
  if (typeof window === "undefined") return null;
  if (!cachedFarcasterProvider) {
    cachedFarcasterProvider = sdk.wallet
      .getEthereumProvider()
      .then((provider) => (provider ? adaptToEip1193(provider) : null))
      .catch(() => null);
  }
  return cachedFarcasterProvider;
}

export function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const provider = (window as any).ethereum as Eip1193Provider | undefined;
  return provider ?? null;
}

export async function detectEnvironment(): Promise<WalletEnvironment> {
  if (typeof window === "undefined") return "none";
  const farcaster = await getFarcasterProvider();
  if (farcaster) return "farcaster";
  if (getInjectedProvider()) return "injected";
  return "none";
}

async function connectWithProvider(
  provider: Eip1193Provider | null,
  connectorType: Exclude<ConnectorType, null>,
  requestAccounts: boolean
): Promise<WalletState> {
  if (!provider) {
    throw new Error(connectorType === "farcaster" ? "Farcaster wallet unavailable" : "No injected wallet found");
  }

  const method = requestAccounts ? "eth_requestAccounts" : "eth_accounts";
  const accounts = (await provider.request({ method })) as string[];
  if (!accounts?.length) {
    throw new Error("No accounts returned from provider");
  }
  const chainId = normalizeChainId(await provider.request({ method: "eth_chainId" }));

  persistConnector(connectorType);

  return {
    status: "connected",
    address: accounts[0] ?? null,
    chainId,
    connectorType,
    error: null
  };
}

export async function connectWallet(): Promise<WalletState> {
  const env = await detectEnvironment();
  if (env === "farcaster") {
    const provider = await getFarcasterProvider();
    return connectWithProvider(provider, "farcaster", true);
  }
  if (env === "injected") {
    const provider = getInjectedProvider();
    return connectWithProvider(provider, "injected", true);
  }
  throw new Error("No injected wallet found.");
}

export async function getCurrentWallet(preferred?: ConnectorType): Promise<WalletState> {
  const env = await detectEnvironment();
  const chosen: ConnectorType =
    preferred && preferred === env ? preferred : env === "none" ? null : (env as ConnectorType);
  if (!chosen) return { ...baseState };

  try {
    const provider = chosen === "farcaster" ? await getFarcasterProvider() : getInjectedProvider();
    return await connectWithProvider(provider, chosen, false);
  } catch (err: any) {
    return { ...baseState, status: "error", error: err?.message ?? "Failed to fetch wallet" };
  }
}

export async function disconnectWallet(connectorType: ConnectorType) {
  persistConnector(null);
  if (!connectorType) return;
  const provider = connectorType === "farcaster" ? await getFarcasterProvider() : getInjectedProvider();
  if (provider?.disconnect) {
    try {
      await provider.disconnect();
    } catch {
      // Some providers throw on disconnect; rely on cleared local state instead.
    }
  }
}

export async function sendZeroValueTx(address: string, connectorType: ConnectorType) {
  const provider = connectorType === "farcaster" ? await getFarcasterProvider() : getInjectedProvider();
  if (!provider) throw new Error("No provider available for transaction");
  await ensureBaseChainWithProvider(provider);
  return provider.request({
    method: "eth_sendTransaction",
    params: [{ from: address, to: address, value: "0x0", chainId: "0x2105" }]
  });
}
