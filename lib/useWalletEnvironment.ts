"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function useWalletEnvironment() {
  const [isMiniApp, setIsMiniApp] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function detect() {
      try {
        const provider = await sdk.wallet.getEthereumProvider();
        if (!active) return;
        setIsMiniApp(!!provider);
      } catch {
        if (!active) return;
        setIsMiniApp(false);
      }
    }
    detect();
    return () => {
      active = false;
    };
  }, []);

  return { isMiniApp };
}
