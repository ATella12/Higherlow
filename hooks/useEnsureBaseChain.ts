"use client";

import { useCallback, useState } from "react";
import { useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { ensureBaseChain, UserRejectedNetworkSwitch, UnsupportedNetworkSwitchError } from "@/lib/ensureBaseChain";
import { wagmiConfig } from "@/lib/wagmi";

export function useEnsureBaseChain() {
  const chainId = useChainId();
  const [isSwitching, setIsSwitching] = useState(false);

  const ensure = useCallback(async () => {
    if (chainId === base.id) return;
    setIsSwitching(true);
    try {
      await ensureBaseChain(wagmiConfig);
    } finally {
      setIsSwitching(false);
    }
  }, [chainId]);

  return { ensureBaseChain: ensure, isSwitching };
}

export { UserRejectedNetworkSwitch, UnsupportedNetworkSwitchError } from "@/lib/ensureBaseChain";
