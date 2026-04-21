import PageWrapper from "@/components/layout/PageWrapper";
import DeckBrowser from "@/components/deck/DeckBrowser";
import { db } from "@/lib/db";

export default async function DecksPage() {
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
    deck.cards.forEach(c => {
      if (c.status === "NEW") counts.new++;
      else if (c.status === "LEARNING") counts.learning++;
      else if (c.status === "REVIEW") counts.review++;
      else if (c.status === "MASTERED") counts.mastered++;
    });

    const dueCount = deck.cards.filter((card) => card.status !== "NEW" && card.nextReviewAt <= now).length;

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
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">All Decks</h2>
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400 shadow-inner">
            {deckModels.length}
          </span>
        </div>
      </section>

      <DeckBrowser decks={deckModels} />
    </PageWrapper>
  );
}
