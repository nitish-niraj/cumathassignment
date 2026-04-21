import { notFound } from "next/navigation";

import StudySessionShell from "@/components/flashcard/StudySessionShell";
import { db } from "@/lib/db";
import { getCardsForStudy, type CardForReview } from "@/lib/spaced-repetition";
import type { Prisma } from "@prisma/client";

// Force dynamic since study queue relies on current timestamp
export const dynamic = "force-dynamic";

type StudyPageProps = {
  params: {
    id: string;
  };
  searchParams: {
    mode?: string;
  };
};

// Quick fisher-yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default async function StudyPage({ params, searchParams }: StudyPageProps) {
  type DeckWithCards = Prisma.DeckGetPayload<{ include: { cards: true } }>;
  let deck: DeckWithCards | null = null;

  try {
    deck = await db.deck.findUnique({
      where: {
        id: params.id,
      },
      include: {
        cards: true,
      },
    });
  } catch (err) {
    console.error("[STUDY_PAGE]", err);
    return (
      <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Couldn&apos;t start study session</h2>
        <p className="mt-2 text-sm text-zinc-400">
          The server failed while loading this deck. This is usually caused by a database configuration issue in production (missing/incorrect{" "}
          <code className="text-zinc-300">DATABASE_URL</code>).
        </p>
      </div>
    );
  }

  if (!deck) {
    notFound();
  }

  // Convert schema cards to SM-2 expected format
  const allCards: CardForReview[] = deck.cards.map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    difficulty: card.difficulty,
    status: card.status,
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitionCount: card.repetitionCount,
    nextReviewAt: card.nextReviewAt.toISOString(),
    lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
  }));

  let activeCards: CardForReview[] = [];

  if (searchParams.mode === "all") {
    // Override: just study everything, shuffled
    activeCards = shuffle(allCards);
  } else {
    // Normal SM-2 due queue (limit 20 by default)
    activeCards = getCardsForStudy(allCards, 20);
  }

  return (
    <StudySessionShell
      deckId={deck.id}
      deckTitle={deck.title}
      cards={activeCards}
    />
  );
}
