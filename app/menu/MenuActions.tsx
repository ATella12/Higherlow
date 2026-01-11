"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { base } from "wagmi/chains";
import { useEnsureBaseChain, UserRejectedNetworkSwitch, UnsupportedNetworkSwitchError } from "@/hooks/useEnsureBaseChain";
import { menuAbi, menuContracts, type MenuAction } from "@/lib/menuContracts";

const labels: Record<MenuAction, string> = {
  win: "Win",
  draw: "Draw",
  loose: "Loose"
};

export function MenuActions() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { ensureBaseChain, isSwitching } = useEnsureBaseChain();
  const { writeContractAsync, isPending } = useWriteContract();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: base.id
  });

  const explorerBase = useMemo(() => "https://basescan.org", []);
  const txLink = txHash ? `${explorerBase}/tx/${txHash}` : null;
  const isBusy = isPending || isSwitching;

  useEffect(() => {
    if (!receipt) return;
    if (receipt.status === "success") {
      setStatusMessage("Confirmed on Base.");
      setTxError(null);
    } else if (receipt.status === "reverted") {
      setTxError("Transaction reverted.");
    }
  }, [receipt]);

  const handleAction = useCallback(
    async (action: MenuAction) => {
      setStatusMessage(null);
      setTxError(null);
      setTxHash(undefined);

      if (!isConnected) {
        setTxError("Connect your wallet to continue.");
        return;
      }

      if (chainId !== base.id) {
        try {
          await ensureBaseChain();
        } catch (err) {
          if (err instanceof UserRejectedNetworkSwitch) {
            setTxError("Please switch to Base to continue.");
          } else if (err instanceof UnsupportedNetworkSwitchError) {
            setTxError("This wallet cannot switch automatically. Please switch to Base.");
          } else {
            setTxError("Unable to switch to Base. Please switch in your wallet.");
          }
          return;
        }
      }

      setStatusMessage("Confirm in wallet...");
      try {
        const hash = await writeContractAsync({
          address: menuContracts[action],
          abi: menuAbi,
          functionName: action,
          value: parseEther("0.000001"),
          chainId: base.id
        });
        setTxHash(hash);
        setStatusMessage("Submitted to Base.");
      } catch (err: any) {
        setTxError(err?.shortMessage || err?.message || "Transaction failed.");
      }
    },
    [chainId, ensureBaseChain, isConnected, writeContractAsync]
  );

  return (
    <div className="menu-actions">
      <button className="cta-primary" onClick={() => handleAction("win")} disabled={isBusy}>
        {labels.win}
      </button>
      <button className="cta-secondary" onClick={() => handleAction("draw")} disabled={isBusy}>
        {labels.draw}
      </button>
      <button className="cta-tertiary" onClick={() => handleAction("loose")} disabled={isBusy}>
        {labels.loose}
      </button>

      {statusMessage || txError || txLink ? (
        <div className={`menu-status ${txError ? "error" : ""}`}>
          {txError ? txError : statusMessage}
          {txLink ? (
            <a className="menu-link-inline" href={txLink} target="_blank" rel="noreferrer">
              View tx
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
