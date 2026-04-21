"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import confetti from "canvas-confetti";

import Flashcard3D from "@/components/flashcard/Flashcard3D";
import { RATING_OPTIONS, type CardForReview } from "@/lib/spaced-repetition";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SessionStats {
  studied: number;
  correct: number; // quality >= 3
  masteredThisSession: number;
  startTime: number;
}

interface StudySessionShellProps {
  deckId: string;
  deckTitle: string;
  cards: CardForReview[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function motivationalMessage(accuracy: number) {
  if (accuracy >= 90) return "Outstanding! You're crushing it. 🔥";
  if (accuracy >= 70) return "Solid session. Keep building momentum.";
  return "Great effort. These cards will come back for more practice.";
}

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StudySessionShell({
  deckId,
  deckTitle,
  cards: initialCards,
}: StudySessionShellProps) {
  const router = useRouter();
  const [queue] = useState<CardForReview[]>(initialCards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = next, -1 = prev
  const [isDone, setIsDone] = useState(initialCards.length === 0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useRef<SessionStats>({
    studied: 0,
    correct: 0,
    masteredThisSession: 0,
    startTime: Date.now(),
  });

  const total = queue.length;
  const progress = total === 0 ? 100 : Math.round((currentIdx / total) * 100);
  const currentCard = queue[currentIdx];

  // ── Rate a card ─────────────────────────────────────────────────────────────
  const rateCard = useCallback(
    async (quality: number) => {
      if (!currentCard || isSubmitting) return;
      setIsSubmitting(true);

      // Optimistic UI: advance immediately
      const wasCorrect = quality >= 3;
      stats.current.studied += 1;
      if (wasCorrect) stats.current.correct += 1;

      // Fire & forget the server update — don't block animation
      fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: currentCard.id,
          deckId,
          quality,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json() as { update: { status: string } };
            if (data.update?.status === "MASTERED") {
              stats.current.masteredThisSession += 1;
            }
          }
        })
        .catch(console.error);

      if (quality === 5) {
        confetti({
          particleCount: 12,
          spread: 40,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#10b981", "#3b82f6"],
          disableForReducedMotion: true,
          ticks: 40,
          gravity: 1.2,
          scalar: 0.6,
        });
      }

      setDirection(1);
      setIsFlipped(false);

      // Small delay so flip-to-front is visible before card exits
      await new Promise((r) => setTimeout(r, 150));

      if (currentIdx + 1 >= total) {
        setIsDone(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
      setIsSubmitting(false);
    },
    [currentCard, currentIdx, deckId, isSubmitting, total],
  );

  // ── Keyboard handling ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Escape") {
        setShowConfirm(true);
        return;
      }
      // Prevent arrow-key scroll
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        return;
      }
      if (isDone || showConfirm) return;

      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((f) => !f);
        return;
      }
      if (isFlipped && !isSubmitting) {
        if (e.key === "1") rateCard(1);
        if (e.key === "2") rateCard(3);
        if (e.key === "3") rateCard(4);
        if (e.key === "4") rateCard(5);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDone, isFlipped, isSubmitting, rateCard, showConfirm]);

  // ── Completion screen ───────────────────────────────────────────────────────
  if (isDone) {
    const elapsed = Date.now() - stats.current.startTime;
    const accuracy =
      stats.current.studied === 0
        ? 0
        : Math.round((stats.current.correct / stats.current.studied) * 100);

    const statCards = [
      { label: "Cards Studied", value: stats.current.studied, suffix: "" },
      { label: "Accuracy", value: accuracy, suffix: "%" },
      { label: "Time Spent", value: formatTime(elapsed), isString: true },
      { label: "Newly Mastered", value: stats.current.masteredThisSession, suffix: "" },
    ];

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-16">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Icon */}
          <motion.div
            className="flex justify-center"
            variants={{
              hidden: { scale: 0.4, opacity: 0 },
              show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 280, damping: 18 } },
            }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            className="text-center"
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          >
            <h2 className="bg-gradient-to-r from-violet-300 via-zinc-100 to-emerald-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Session Complete!
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {motivationalMessage(accuracy)}
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
          >
            {statCards.map((s) => (
              <motion.div
                key={s.label}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
              >
                <p className="text-xs text-zinc-500">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
                  {s.isString ? s.value : `${s.value}${s.suffix}`}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="space-y-3"
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          >
            <button
              onClick={() => router.push(`/decks/${deckId}/study`)}
              className="h-11 w-full rounded-xl bg-violet-600 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              Study Again
            </button>
            <button
              onClick={() => router.push(`/decks/${deckId}`)}
              className="h-11 w-full rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              Back to Deck
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-400"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Main study UI ───────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6">
        <div className="text-center w-full max-w-sm rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 mb-6 border border-zinc-700/50">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 mb-2">Nothing to review right now</h2>
          <p className="text-sm text-zinc-400 mb-8">
            You&apos;re all caught up! Come back later to strengthen your memory.
          </p>
          <button
            onClick={() => router.push(`/decks/${deckId}`)}
            className="h-11 w-full rounded-xl bg-violet-600 text-sm font-medium text-white transition hover:bg-violet-500 hover:scale-[0.98] active:scale-[0.96]"
          >
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top progress bar */}
      <div className="fixed left-0 top-0 z-50 h-[3px] w-full bg-zinc-900">
        <motion.div
          className="h-full bg-violet-500"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 28 }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 sm:px-8">
        <p className="max-w-[45%] truncate text-sm font-medium text-zinc-300">
          {deckTitle}
        </p>
        <p className="text-sm tabular-nums text-zinc-500">
          {currentIdx + 1} / {total}
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
          aria-label="End session"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Card area */}
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-8 px-5 py-10">
        {/* Animated card swap */}
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={currentCard?.id ?? "empty"}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
            }}
            initial={false}
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
            className="w-full max-w-xl"
          >
            {currentCard ? (
              <Flashcard3D
                key={currentCard.id}
                front={currentCard.front}
                back={currentCard.back}
                difficulty={currentCard.difficulty}
                flipped={isFlipped}
                onFlipChange={setIsFlipped}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* Flip hint */}
        <AnimatePresence initial={false}>
          {!isFlipped && (
            <motion.p
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-zinc-600"
            >
              Press <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-zinc-500">Space</kbd> or tap to flip
            </motion.p>
          )}
        </AnimatePresence>

        {/* Rating buttons */}
        <AnimatePresence initial={false}>
          {isFlipped && (
            <motion.div
              initial={false}
              animate="show"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.055 } },
              }}
              className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {RATING_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.label}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  onClick={() => rateCard(opt.quality)}
                  disabled={isSubmitting}
                  className={`group relative rounded-xl p-3 text-left transition-all ${opt.colorClass} disabled:opacity-40`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opt.label}</span>
                    <kbd className="rounded border border-zinc-700/50 bg-zinc-900/60 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      {opt.shortcut}
                    </kbd>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* End session confirm dialog */}
      <AnimatePresence initial={false}>
        {showConfirm && (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-6 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <h3 className="text-base font-semibold text-zinc-100">End session?</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Your progress so far has been saved. You can resume anytime.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => router.push(`/decks/${deckId}`)}
                  className="flex-1 rounded-xl bg-red-500/10 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                >
                  End session
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-xl border border-zinc-700 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
                >
                  Keep studying
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
