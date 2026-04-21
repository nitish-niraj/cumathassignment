import PageWrapper from "@/components/layout/PageWrapper";
import DeckBrowser from "@/components/deck/DeckBrowser";
import { db } from "@/lib/db";

// Database-backed list; must run at request time.
export const dynamic = "force-dynamic";

export default async function DecksPage() {
  try {
    const decks = await db.deck.findMany({
      select: {
        id: true,
        title: true,
        subject: true,
        emoji: true,
        cardCount: true,
        lastStudiedAt: true,
        createdAt: true,
        cards: {
          select: {
            status: true,
            nextReviewAt: true,
          },
        },
      },
    });

    const now = new Date();

    const deckModels = decks.map((deck) => {
      const counts = { new: 0, learning: 0, review: 0, mastered: 0 };
      deck.cards.forEach((c) => {
        if (c.status === "NEW") counts.new++;
        else if (c.status === "LEARNING") counts.learning++;
        else if (c.status === "REVIEW") counts.review++;
        else if (c.status === "MASTERED") counts.mastered++;
      });

      const dueCount = deck.cards.filter(
        (card) => card.status !== "NEW" && card.nextReviewAt <= now,
      ).length;

      return {
        id: deck.id,
        title: deck.title,
        subject: deck.subject,
        emoji: deck.emoji,
        cardCount: deck.cardCount,
        counts,
        dueCount,
        lastTouchedAt: (deck.lastStudiedAt ?? deck.createdAt).toISOString(),
      };
    });

    return (
      <PageWrapper>
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
              All Decks
            </h2>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400 shadow-inner">
              {deckModels.length}
            </span>
          </div>
        </section>

        <DeckBrowser decks={deckModels} />
      </PageWrapper>
    );
  } catch (err) {
    console.error("[DECKS_PAGE]", err);
    return (
      <PageWrapper>
        <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">
            Couldn&apos;t load decks
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            The server failed while fetching decks. In production this is most
            commonly caused by a missing/incorrect{" "}
            <code className="text-zinc-300">DATABASE_URL</code>.
          </p>
        </div>
      </PageWrapper>
    );
  }
}
