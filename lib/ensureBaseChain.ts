"use client";

import { getAccount, getChainId, getConnectorClient, switchChain } from "@wagmi/core";
import { base } from "wagmi/chains";
import { ChainMismatchError } from "viem";
import type { Config } from "wagmi";

export type Eip1193Provider = {
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export class UserRejectedNetworkSwitch extends Error {
  constructor(message = "User rejected network switch") {
    super(message);
    this.name = "UserRejectedNetworkSwitch";
  }
}

export class UnsupportedNetworkSwitchError extends Error {
  constructor(message = "This wallet cannot switch networks automatically") {
    super(message);
    this.name = "UnsupportedNetworkSwitchError";
  }
}

export class NetworkSwitchFailed extends Error {
  constructor(message = "Failed to switch network", public cause?: unknown) {
    super(message);
    this.name = "NetworkSwitchFailed";
  }
}

const BASE_CHAIN_HEX = "0x2105";
const BASE_ADD_PARAMS = {
  chainId: BASE_CHAIN_HEX,
  chainName: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"]
};

const isDev = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
const debugLog = (...args: any[]) => {
  if (isDev) console.debug("[ensureBaseChain]", ...args);
};

const isUserRejectedError = (err: any) =>
  err?.code === 4001 ||
  err?.code === "ACTION_REJECTED" ||
  err?.message?.toLowerCase?.().includes("rejected");

const isChainMismatchError = (err: any) =>
  err instanceof ChainMismatchError ||
  err?.name === "ChainMismatchError" ||
  `${err?.shortMessage ?? err?.message ?? ""}`.toLowerCase().includes("chain mismatch");

const normalizeChainId = (chainId: string | number | null | undefined): string | null => {
  if (chainId === null || chainId === undefined) return null;
  if (typeof chainId === "number") return `0x${chainId.toString(16)}`;
  return chainId;
};

const safeGetChainId = (config: Config): number | null => {
  try {
    return getChainId(config);
  } catch {
    return null;
  }
};

async function getConnectorProvider(config: Config): Promise<Eip1193Provider | null> {
  try {
    const client = await getConnectorClient(config);
    const provider = (client as any)?.transport?.value ?? (client as any)?.transport ?? null;
    if (provider?.request) return provider as Eip1193Provider;
  } catch (err) {
    debugLog("Failed to get connector client", err);
  }

  try {
    const connector = getAccount(config).connector;
    const provider = (await connector?.getProvider?.()) as Eip1193Provider | undefined;
    if (provider?.request) return provider;
  } catch (err) {
    debugLog("Failed to get connector provider", err);
  }

  if (typeof window !== "undefined") {
    const provider = (window as any).ethereum as Eip1193Provider | undefined;
    if (provider?.request) return provider;
  }
  return null;
}

async function switchWithProvider(provider: Eip1193Provider) {
  if (!provider?.request) throw new UnsupportedNetworkSwitchError();

  const before = normalizeChainId(
    (await provider.request({ method: "eth_chainId" }).catch(() => null)) as string | number | null
  );
  debugLog("provider switch: current chain", before);

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_CHAIN_HEX }]
    });
  } catch (err: any) {
    if (isUserRejectedError(err)) throw new UserRejectedNetworkSwitch();
    if (err?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [BASE_ADD_PARAMS]
      });
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_HEX }]
      });
    } else {
      throw new NetworkSwitchFailed("Provider switch failed", err);
    }
  }

  const after = normalizeChainId(
    (await provider.request({ method: "eth_chainId" }).catch(() => null)) as string | number | null
  );
  debugLog("provider switch: after chain", after);
  if (after !== BASE_CHAIN_HEX) throw new NetworkSwitchFailed("Provider switch did not reach Base");
}

export async function ensureBaseChainWithProvider(provider: Eip1193Provider) {
  await switchWithProvider(provider);
}

export async function ensureBaseChain(config: Config): Promise<void> {
  // getChainId is synchronous in wagmi v2; guard in try/catch to avoid hard failures
  const current: number | null = safeGetChainId(config);
  debugLog("current chain", current, "target", base.id, "connector", getAccount(config).connector?.name);
  if (current === base.id) return;

  try {
    await switchChain(config, { chainId: base.id });
    const post = safeGetChainId(config);
    debugLog("switchChain result", post);
    if (post === base.id) return;
  } catch (err: any) {
    debugLog("switchChain failed", err);
    if (isUserRejectedError(err)) throw new UserRejectedNetworkSwitch();
    // continue to provider fallback
  }

  const provider = await getConnectorProvider(config);
  if (!provider) {
    throw new UnsupportedNetworkSwitchError("This wallet cannot switch networks automatically");
  }

  await switchWithProvider(provider);
}

export async function withBaseChain<T>(
  ensureFn: () => Promise<void>,
  actionFn: () => Promise<T>
): Promise<T> {
  await ensureFn();
  try {
    return await actionFn();
  } catch (err) {
    if (isChainMismatchError(err)) {
      debugLog("retrying action after chain mismatch");
      await ensureFn();
      return actionFn();
    }
    throw err;
  }
}
