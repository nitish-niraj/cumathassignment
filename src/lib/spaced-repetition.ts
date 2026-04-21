// ── SM-2 Spaced Repetition Algorithm ─────────────────────────────────────────
// Based on the original SM-2 algorithm by Piotr Wozniak (SuperMemo)
// quality: 0 = complete blackout, 5 = perfect instant recall

export type CardStatus = "NEW" | "LEARNING" | "REVIEW" | "MASTERED";

export interface CardForReview {
  id: string;
  front: string;
  back: string;
  difficulty: string;
  status: string;
  easeFactor: number;
  interval: number;
  repetitionCount: number;
  nextReviewAt: string; // ISO string
  lastReviewedAt: string | null;
}

export interface ReviewUpdate {
  easeFactor: number;
  interval: number;
  repetitionCount: number;
  nextReviewAt: string; // ISO string
  status: CardStatus;
}

// ── Core SM-2 calculation ─────────────────────────────────────────────────────
export function processReview(card: CardForReview, quality: number): ReviewUpdate {
  let { easeFactor, interval, repetitionCount } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitionCount === 0) {
      interval = 1;
    } else if (repetitionCount === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitionCount += 1;
  } else {
    // Incorrect response — reset
    repetitionCount = 0;
    interval = 1;
  }

  // Update ease factor (min 1.3)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, Math.round(easeFactor * 1000) / 1000);

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  nextReviewAt.setHours(0, 0, 0, 0); // Normalize to start of day

  // Map to status
  let status: CardStatus;
  if (repetitionCount === 0) {
    status = "LEARNING";
  } else if (repetitionCount < 3) {
    status = "LEARNING";
  } else if (interval < 21) {
    status = "REVIEW";
  } else {
    status = "MASTERED";
  }

  return {
    easeFactor,
    interval,
    repetitionCount,
    nextReviewAt: nextReviewAt.toISOString(),
    status,
  };
}

// ── Session queue builder ─────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getCardsForStudy(
  cards: CardForReview[],
  limit = 20,
): CardForReview[] {
  const now = new Date();

  // Overdue cards (due date <= now), newest overdue first
  const overdue = cards
    .filter((c) => c.status !== "NEW" && new Date(c.nextReviewAt) <= now)
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());

  // New cards (never studied)
  const newCards = cards.filter((c) => c.status === "NEW");

  const queue = [...shuffle(overdue), ...shuffle(newCards)];
  return queue.slice(0, limit);
}

// ── Quality label mapping ─────────────────────────────────────────────────────
export const RATING_OPTIONS = [
  {
    label: "Forgot",
    quality: 1,
    shortcut: "1",
    colorClass:
      "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    dotClass: "bg-red-400",
  },
  {
    label: "Hard",
    quality: 3,
    shortcut: "2",
    colorClass:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20",
    dotClass: "bg-amber-400",
  },
  {
    label: "Good",
    quality: 4,
    shortcut: "3",
    colorClass:
      "bg-zinc-300/10 text-zinc-300 border border-zinc-300/20 hover:bg-zinc-300/15",
    dotClass: "bg-zinc-300",
  },
  {
    label: "Easy",
    quality: 5,
    shortcut: "4",
    colorClass:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
    dotClass: "bg-emerald-400",
  },
] as const;
