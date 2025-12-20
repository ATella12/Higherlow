"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import { base } from "wagmi/chains";
import {
  useEnsureBaseChain,
  UserRejectedNetworkSwitch,
  UnsupportedNetworkSwitchError
} from "@/hooks/useEnsureBaseChain";

function shorten(address?: string | null) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectMenu() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, connectAsync, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { ensureBaseChain, isSwitching } = useEnsureBaseChain();
  const chainId = useChainId();
  const autoTried = useRef(false);
  const [copied, setCopied] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const isInFarcaster = typeof window !== "undefined" && "farcaster" in (window as any);

  const farcasterConnector = useMemo(() => {
    const fc = connectors.find((c) => c.name?.toLowerCase?.().includes("farcaster"));
    return fc ?? connectors[0];
  }, [connectors]);

  const injectedConnector = useMemo(() => {
    return connectors.find(
      (c) => c.id === "injected" || c.name?.toLowerCase?.().includes("injected")
    );
  }, [connectors]);

  useEffect(() => {
    if (autoTried.current) return;
    if (isConnected) return;
    if (status === "pending") return;
    if (isInFarcaster) return;
    if (!injectedConnector || !(injectedConnector as any).ready) return;

    autoTried.current = true;
    connectAsync({ connector: injectedConnector }).catch(() => {
      // ignore auto-connect failures
    });
  }, [connectAsync, injectedConnector, isConnected, isInFarcaster, status]);

  const handleConnect = () => {
    if (isConnected) return;
    const preferred =
      farcasterConnector && (farcasterConnector as any).ready ? farcasterConnector : injectedConnector;
    if (!preferred) return;
    connect({ connector: preferred });
  };

  const handleSwitchToBase = async () => {
    setSwitchError(null);
    try {
      await ensureBaseChain();
    } catch (err: any) {
      if (err instanceof UserRejectedNetworkSwitch) {
        setSwitchError("Please switch your wallet network to Base to continue.");
      } else if (err instanceof UnsupportedNetworkSwitchError) {
        setSwitchError("This wallet cannot switch automatically. Please switch to Base in your wallet.");
      } else {
        setSwitchError("Unable to switch automatically. Please switch to Base in your wallet.");
      }
    }
  };

  const isConnecting = status === "pending";
  const isOnBase = chainId === base.id;
  const addressLabel = isConnected ? shorten(address) : "";
  const noInjected = !injectedConnector || !(injectedConnector as any).ready;

  const handleCopy = async () => {
    if (!address || !navigator?.clipboard) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="connect-card">
      <div className="connect-row wallet-header">
        <div className="pill-label">Wallet</div>

        <div className="wallet-meta">
          {isConnected ? (
            <>
              <span className="status-pill status-connected">Connected</span>
              {addressLabel ? (
                <span className="address-pill">
                  {addressLabel}
                  <button className="copy-btn" onClick={handleCopy} aria-label="Copy address">
                    {copied ? "Copied" : "Copy"}
                  </button>
                </span>
              ) : null}
            </>
          ) : (
            <span className="status-pill status-idle">
              {isConnecting ? "Connecting..." : "Not connected"}
            </span>
          )}
        </div>
      </div>

      {isConnected && address ? (
        <button
          className="cta-wallet-disconnect"
          onClick={() => disconnect?.()}
          disabled={isConnecting}
        >
          Disconnect
        </button>
      ) : (
        <button
          className="cta-wallet-connect"
          onClick={handleConnect}
          disabled={isConnecting || (!farcasterConnector && !injectedConnector)}
        >
          {isConnecting ? "Connecting..." : "Connect wallet"}
        </button>
      )}

      {!isConnected && !isConnecting && noInjected && !isInFarcaster ? (
        <div className="feedback" style={{ marginTop: 6 }}>
          No injected wallet found. Open in Farcaster or install MetaMask/Brave.
        </div>
      ) : null}

      {status === "error" && error ? (
        <div className="feedback error" style={{ marginTop: 6 }}>
          {(error).message}
        </div>
      ) : null}

      {isConnected && !isOnBase ? (
        <div className="feedback error" style={{ marginTop: 8 }}>
          Please switch to Base to play.
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button className="cta-secondary" onClick={handleSwitchToBase} disabled={isSwitching}>
              {isSwitching ? "Switching to Base..." : "Switch to Base"}
            </button>
          </div>
          {switchError ? (
            <div style={{ marginTop: 6 }}>
              {switchError}
              {switchError.toLowerCase().includes("cannot switch automatically") ? (
                <div style={{ marginTop: 4 }}>Open your wallet and switch to Base, then retry.</div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
