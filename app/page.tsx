"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameContainer } from "@/components/GameContainer";
import { StatBar } from "@/components/StatBar";
import { TermCard } from "@/components/TermCard";
import { VsBadge } from "@/components/VsBadge";
import { GuessButtons } from "@/components/GuessButtons";
import { GameOverModal } from "@/components/GameOverModal";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { ConnectMenu } from "@/components/ConnectMenu";
import { DifficultySelect } from "@/components/DifficultySelect";
import { TERMS, TERMS_BY_DIFFICULTY } from "@/data/terms";
import { Difficulty, GameState, SearchTerm } from "@/lib/types";
import { GAME_CONTRACT_ABI, GAME_CONTRACT_ADDRESS } from "@/lib/gameContract";
import { isValidTermEntry, preloadImages, shuffle, triggerHaptic } from "@/lib/utils";
import { storage } from "@/lib/storage";
import { sdk } from "@farcaster/miniapp-sdk";
import { useChainId, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import {
  useEnsureBaseChain,
  UserRejectedNetworkSwitch,
  UnsupportedNetworkSwitchError
} from "@/hooks/useEnsureBaseChain";
import { withBaseChain } from "@/lib/ensureBaseChain";

const REVEAL_DELAY = 900;
const HIGH_SCORE_KEY = "higherlower-highscore";
const MODE_SCORE_KEY = (mode: Difficulty) => `higherlower-highscore-${mode}`;
const MODE_LABELS: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const DIFFICULTY_TO_PARAM: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
type TxAction = `select-${Difficulty}` | "play-again" | "change-difficulty" | null;

const formatTxError = (err: unknown) => {
  if (!err || typeof err !== "object") return "Transaction failed. Please try again.";
  const anyErr = err as any;
  return anyErr?.shortMessage || anyErr?.message || "Transaction failed. Please try again.";
};

export default function Page() {
  const remainingRef = useRef<SearchTerm[]>([]);
  const usedRef = useRef<Set<string>>(new Set());
  const [topTerm, setTopTerm] = useState<SearchTerm | null>(null);
  const [bottomTerm, setBottomTerm] = useState<SearchTerm | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [state, setState] = useState<GameState>("selectingDifficulty");
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [modeHighScore, setModeHighScore] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0
  });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [highlight, setHighlight] = useState<"success" | "error" | null>(null);
  const [shake, setShake] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const chainId = useChainId();
  const { writeContractAsync, isPending: isTxPending } = useWriteContract();
  const { ensureBaseChain, isSwitching } = useEnsureBaseChain();
  const [txAction, setTxAction] = useState<TxAction>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const pendingDifficulty =
    txAction && txAction.startsWith("select-")
      ? (txAction.replace("select-", "") as Difficulty)
      : null;
  const isOnBase = chainId === base.id;
  const isTxBusy = isTxPending || txAction !== null || isSwitching;

  const canGuess = useMemo(
    () => state === "awaitingGuess" && !locked && !!difficulty,
    [state, locked, difficulty]
  );

  const nextNonce = () => BigInt(Date.now());

  const requireBaseChain = useCallback(async () => {
    try {
      await ensureBaseChain();
      setNetworkError(null);
    } catch (err) {
      if (err instanceof UserRejectedNetworkSwitch) {
        setNetworkError("Please switch to Base to play.");
      } else if (err instanceof UnsupportedNetworkSwitchError) {
        setNetworkError("This wallet cannot switch automatically. Please switch to Base to play.");
      } else {
        setNetworkError("Unable to switch to Base. Please switch to Base to play.");
      }
      throw err;
    }
  }, [ensureBaseChain]);

  const runWrite = async (actionName: TxAction, writer: () => Promise<void>) => {
    setTxError(null);
    setNetworkError(null);
    try {
      await withBaseChain(requireBaseChain, async () => {
        if (actionName) setTxAction(actionName);
        try {
          await writer();
        } finally {
          if (actionName) setTxAction(null);
        }
      });
      return true;
    } catch (error) {
      if (error instanceof UserRejectedNetworkSwitch || error instanceof UnsupportedNetworkSwitchError) {
        return false;
      }
      setTxError(formatTxError(error));
      return false;
    }
  };

  const writeSelectMode = async (difficultyValue: number, nonce: bigint) => {
    const difficultyLabel = Object.entries(DIFFICULTY_TO_PARAM).find(([, v]) => v === difficultyValue)?.[0] as
      | Difficulty
      | undefined;
    const action: TxAction = difficultyLabel ? (`select-${difficultyLabel}` as TxAction) : null;
    return runWrite(action, async () => {
      await writeContractAsync({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: "selectMode",
        args: [difficultyValue, nonce],
        chainId: base.id
      });
    });
  };

  const writePlayAgain = async (nonce: bigint) => {
    return runWrite("play-again", async () => {
      await writeContractAsync({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: "playAgain",
        args: [nonce],
        chainId: base.id
      });
    });
  };

  const writeChangeDifficulty = async (nonce: bigint) => {
    return runWrite("change-difficulty", async () => {
      await writeContractAsync({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: "changeDifficulty",
        args: [nonce],
        chainId: base.id
      });
    });
  };

  const persistHighScore = (next: number) => {
    storage.set(HIGH_SCORE_KEY, String(next));
  };

  const hydrateHighScore = () => {
    const stored = storage.get(HIGH_SCORE_KEY);
    if (stored) setHighScore(Number(stored));
    const easy = Number(storage.get(MODE_SCORE_KEY("easy")) ?? "0");
    const medium = Number(storage.get(MODE_SCORE_KEY("medium")) ?? "0");
    const hard = Number(storage.get(MODE_SCORE_KEY("hard")) ?? "0");
    setModeHighScore({ easy, medium, hard });
  };

  const persistModeHighScore = (mode: Difficulty, value: number) => {
    storage.set(MODE_SCORE_KEY(mode), String(value));
  };

  const refillPool = (mode: Difficulty, avoidId?: string) => {
    let pool = shuffle(
      TERMS_BY_DIFFICULTY[mode].filter((term) => term.id !== avoidId && !usedRef.current.has(term.id))
    );
    if (!pool.length) {
      usedRef.current = new Set(avoidId ? [avoidId] : []);
      pool = shuffle(TERMS_BY_DIFFICULTY[mode].filter((term) => term.id !== avoidId));
    }
    remainingRef.current = pool;
    return pool;
  };

  const pickBiasedNext = (current: SearchTerm, mode: Difficulty): SearchTerm => {
    let available = remainingRef.current.filter((term) => term.id !== current.id && !usedRef.current.has(term.id));
    if (!available.length) {
      available = refillPool(mode, current.id);
    }
    const baseDiff = (term: SearchTerm) =>
      Math.abs(term.searches - current.searches) / Math.max(current.searches, 1);

    let candidates: SearchTerm[] = [];
    if (mode === "hard") {
      candidates = available.filter((term) => baseDiff(term) <= 0.25);
    } else if (mode === "medium") {
      candidates = available.filter((term) => baseDiff(term) <= 0.5);
    } else {
      candidates = available.filter((term) => baseDiff(term) >= 0.4);
    }

    const selectionPool = (candidates.length ? candidates : available) ?? [];
    if (!selectionPool.length) {
      return current;
    }
    const next = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    remainingRef.current = remainingRef.current.filter((term) => term.id !== next.id);
    usedRef.current.add(next.id);
    return next;
  };

  const resetToDifficultySelection = () => {
    setDifficulty(null);
    setTopTerm(null);
    setBottomTerm(null);
    usedRef.current = new Set();
    remainingRef.current = [];
    setState("selectingDifficulty");
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setHighlight(null);
    setConfetti(false);
    setLocked(false);
    setRevealed(false);
    setShake(false);
  };

  const startGameForDifficulty = (mode: Difficulty) => {
    const pool = shuffle(TERMS_BY_DIFFICULTY[mode].filter(isValidTermEntry));
    if (pool.length < 2) return;
    const [first, second, ...rest] = pool;
    usedRef.current = new Set([first.id, second.id]);
    remainingRef.current = rest;
    setDifficulty(mode);
    setTopTerm(first);
    setBottomTerm(second);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setHighlight(null);
    setShake(false);
    setRevealed(false);
    setFeedback(null);
    setConfetti(false);
    setLocked(false);
    setState("awaitingGuess");
  };

  const advanceCards = () => {
    if (!bottomTerm || !difficulty) return;
    const nextTop = bottomTerm;
    const nextBottom = pickBiasedNext(nextTop, difficulty);
    setTopTerm(nextTop);
    setBottomTerm(nextBottom);
    setState("awaitingGuess");
    setLocked(false);
    setRevealed(false);
    setHighlight(null);
    setShake(false);
    setFeedback(null);
  };

  const handleGuess = (direction: "higher" | "lower") => {
    if (!canGuess || !topTerm || !bottomTerm || !difficulty) return;
    sdk.haptics.selectionChanged().catch(() => {});
    triggerHaptic();
    setLocked(true);
    setState("revealing");
    setRevealed(true);
    const isHigher = bottomTerm.searches >= topTerm.searches;
    const correct = direction === "higher" ? isHigher : !isHigher;
    setHighlight(correct ? "success" : "error");
    setShake(!correct);
    setFeedback(correct ? "Correct" : "Wrong");

    if (correct) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), REVEAL_DELAY);
      setScore((prev) => {
        const nextScore = prev + 1;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          persistHighScore(nextScore);
        }
        setModeHighScore((prevScores) => {
          const nextScores = { ...prevScores };
          if (nextScore > nextScores[difficulty]) {
            nextScores[difficulty] = nextScore;
            persistModeHighScore(difficulty, nextScore);
          }
          return nextScores;
        });
        return nextScore;
      });
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setTimeout(() => {
        setState("transitioning");
        advanceCards();
      }, REVEAL_DELAY);
    } else {
      setBestStreak((b) => Math.max(b, streak));
      setTimeout(() => {
        setState("gameOver");
        setLocked(false);
      }, REVEAL_DELAY);
    }
  };

  const handleSelectDifficulty = async (mode: Difficulty) => {
    if (isTxBusy) return;
    const ok = await writeSelectMode(DIFFICULTY_TO_PARAM[mode], nextNonce());
    if (ok) startGameForDifficulty(mode);
  };

  const handlePlayAgain = async () => {
    if (!difficulty || isTxBusy) return;
    const ok = await writePlayAgain(nextNonce());
    if (ok) {
      startGameForDifficulty(difficulty);
    }
  };

  const handleChangeDifficulty = async () => {
    if (isTxBusy) return;
    if (!difficulty) {
      resetToDifficultySelection();
      return;
    }
    const ok = await writeChangeDifficulty(nextNonce());
    if (ok) {
      resetToDifficultySelection();
    }
  };

  useEffect(() => {
    sdk.actions.ready().catch(() => {});
    preloadImages(TERMS);
    hydrateHighScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chainId === base.id) {
      setNetworkError(null);
    } else {
      setNetworkError("Please switch to Base to play.");
    }
  }, [chainId]);

  return (
    <GameContainer>
      <StatBar
        score={state === "selectingDifficulty" ? 0 : score}
        highScore={highScore}
        difficultyLabel={difficulty ? MODE_LABELS[difficulty] : "Select mode"}
      />
      <ConnectMenu />

      {txError ? (
        <div className="feedback error" style={{ marginTop: 6 }}>
          {txError}
        </div>
      ) : null}

      {networkError ? (
        <div className="feedback error" style={{ marginTop: 6 }}>
          {networkError}
          {!isOnBase ? (
            <div style={{ marginTop: 8 }}>
              <button
                className="cta-secondary"
                onClick={() => requireBaseChain()}
                disabled={isTxBusy}
              >
                {isSwitching ? "Switching to Base..." : "Switch to Base"}
              </button>
              {networkError.includes("cannot switch automatically") ? (
                <div style={{ marginTop: 6 }}>
                  Open your wallet and switch to Base, then try again.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {state === "selectingDifficulty" ? (
        <DifficultySelect
          onSelect={handleSelectDifficulty}
          pendingDifficulty={pendingDifficulty}
          disabled={isTxBusy}
        />
      ) : (
        <>
          <div className="card-stack">
            <TermCard term={topTerm} position="top" revealed highlight={null} />
            <TermCard
              term={bottomTerm}
              position="bottom"
              revealed={revealed}
              highlight={highlight}
              shake={shake}
              hint={topTerm ? `searches than ${topTerm.term}` : "searches"}
              actions={
                <GuessButtons
                  locked={locked || state !== "awaitingGuess"}
                  onHigher={() => handleGuess("higher")}
                  onLower={() => handleGuess("lower")}
                />
              }
            />
            <VsBadge />
          </div>

          {feedback && (
            <div className={`feedback ${highlight === "success" ? "success" : "error"}`}>{feedback}</div>
          )}
        </>
      )}

      <ConfettiBurst active={confetti} />

      {state === "gameOver" && (
        <GameOverModal
          score={score}
          highScore={highScore}
          streak={bestStreak}
          difficulty={difficulty ? MODE_LABELS[difficulty] : "Select mode"}
          difficultyBest={difficulty ? modeHighScore[difficulty] : 0}
          onPlayAgain={handlePlayAgain}
          onChangeDifficulty={handleChangeDifficulty}
          playAgainPending={txAction === "play-again" || isTxPending || isSwitching}
          changeDifficultyPending={txAction === "change-difficulty" || isTxPending || isSwitching}
          actionsDisabled={isSwitching}
        />
      )}
    </GameContainer>
  );
}
