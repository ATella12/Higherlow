"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectorType,
  WalletEnvironment,
  WalletState,
  connectWallet,
  detectEnvironment,
  disconnectWallet,
  getCurrentWallet,
  getFarcasterProvider,
  getInjectedProvider,
  getPersistedConnector,
  normalizeChainId,
  persistConnector
} from "./wallet";

const baseState: WalletState = {
  status: "idle",
  address: null,
  chainId: null,
  connectorType: null,
  error: null
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(baseState);
  const [environment, setEnvironment] = useState<WalletEnvironment>("none");
  const focusRefreshRef = useRef<() => void>();

  useEffect(() => {
    let cancelled = false;
    detectEnvironment().then((env) => {
      if (!cancelled) setEnvironment(env);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const persisted = getPersistedConnector();
    if (!persisted) return;
    setWallet((prev) => ({ ...prev, status: "connecting", error: null }));
    getCurrentWallet(persisted).then((restored) => {
      if (cancelled) return;
      if (restored.status === "connected") {
        setWallet({ ...restored, status: "connected", error: null });
      } else {
        setWallet({ ...baseState, status: "idle", error: restored.error ?? null });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [environment]);

  const connect = useCallback(async () => {
    if (wallet.status === "connecting") return;
    setWallet((prev) => ({ ...prev, status: "connecting", error: null }));
    try {
      const next = await connectWallet();
      setEnvironment(next.connectorType === "farcaster" ? "farcaster" : "injected");
      setWallet({ ...next, status: "connected", error: null });
    } catch (err: any) {
      const message = err?.message ?? "Failed to connect";
      setWallet({ ...baseState, status: "error", error: message });
    }
  }, [wallet.status]);

  const disconnect = useCallback(async () => {
    await disconnectWallet(wallet.connectorType);
    setWallet({ ...baseState });
  }, [wallet.connectorType]);

  useEffect(() => {
    const provider = getInjectedProvider();
    if (wallet.connectorType !== "injected" || !provider?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts?.length) {
        persistConnector(null);
        setWallet({ ...baseState });
        return;
      }
      setWallet((prev) => ({
        ...prev,
        status: "connected",
        connectorType: "injected",
        address: accounts[0] ?? null
      }));
    };

    const handleChainChanged = (nextChain: string | number) => {
      setWallet((prev) => ({
        ...prev,
        chainId: normalizeChainId(nextChain)
      }));
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [wallet.connectorType]);

  useEffect(() => {
    let cancelled = false;
    if (wallet.connectorType !== "farcaster") return;

    const attach = async () => {
      const provider = await getFarcasterProvider();
      if (!provider || cancelled) return;

      const refreshFromProvider = async () => {
        const current = await getCurrentWallet("farcaster");
        if (cancelled) return;
        if (current.status === "connected") {
          setWallet({ ...current, status: "connected" });
        } else {
          setWallet({ ...baseState, status: "idle", error: current.error ?? null });
        }
      };

      const handleAccountChange = (accounts: string[]) => {
        if (!accounts?.length) {
          persistConnector(null);
          setWallet({ ...baseState });
          return;
        }
        refreshFromProvider();
      };

      const handleChainChange = (nextChain: string | number) => {
        setWallet((prev) => ({
          ...prev,
          chainId: normalizeChainId(nextChain)
        }));
      };

      if (provider.on) {
        provider.on("accountsChanged", handleAccountChange);
        provider.on("chainChanged", handleChainChange);
        focusRefreshRef.current = undefined;
        return () => {
          provider.removeListener?.("accountsChanged", handleAccountChange);
          provider.removeListener?.("chainChanged", handleChainChange);
        };
      }

      const onFocus = () => {
        refreshFromProvider();
      };
      focusRefreshRef.current = onFocus;
      window.addEventListener("focus", onFocus);
      return () => {
        window.removeEventListener("focus", onFocus);
      };
    };

    const cleanupPromise = attach();
    return () => {
      cancelled = true;
      cleanupPromise?.then((cleanup) => cleanup?.()).catch(() => {});
    };
  }, [wallet.connectorType]);

  const connecting = wallet.status === "connecting";
  const isConnected = wallet.status === "connected";
  const noInjected = environment !== "farcaster" && !getInjectedProvider();

  return {
    wallet,
    environment,
    connecting,
    isConnected,
    noInjected,
    connect,
    disconnect
  };
}
