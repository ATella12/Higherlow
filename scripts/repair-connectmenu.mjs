import fs from "fs";
import path from "path";

const targetPath = path.join(process.cwd(), "components", "ConnectMenu.tsx");

const goodContent = `"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function shorten(address?: string | null) {
  if (!address) return "";
  return \`\${address.slice(0, 6)}...\${address.slice(-4)}\`;
}

export function ConnectMenu() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, connectAsync, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const autoTried = useRef(false);
  const [copied, setCopied] = useState(false);

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
    const preferred =
      farcasterConnector && (farcasterConnector as any).ready ? farcasterConnector : injectedConnector;
    if (!preferred) return;
    connect({ connector: preferred });
  };

  const isConnecting = status === "pending";
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
    </div>
  );
}
`;

// Ensure folder exists
fs.mkdirSync(path.dirname(targetPath), { recursive: true });

// Write UTF-8, real newlines
fs.writeFileSync(targetPath, goodContent, { encoding: "utf8" });

// Guard against the exact regression you're seeing
const head = fs.readFileSync(targetPath, { encoding: "utf8" }).slice(0, 80);
if (head.includes('\\"use client\\"') || head.includes("\\n") || !head.startsWith('"use client";')) {
  throw new Error(
    `repair-connectmenu wrote escaped content. File head:\n${head}`
  );
}

console.log(`Repaired ${targetPath}`);
console.log(`Bytes written: ${Buffer.byteLength(goodContent, "utf8")}`);
