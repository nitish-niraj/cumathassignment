import Link from "next/link";
import { notFound } from "next/navigation";

import DeckDetailCardList from "@/components/deck/DeckDetailCardList";
import DeckOptions from "@/components/deck/DeckOptions";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { formatStudyDate } from "@/lib/utils";
import { db } from "@/lib/db";

type DeckDetailPageProps = {
  params: {
    id: string;
  };
};

const dotClass: Record<string, string> = {
  total: "bg-zinc-400",
  new: "bg-zinc-500",
  learning: "bg-amber-400",
  due: "bg-violet-400",
  mastered: "bg-emerald-400",
};

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
  const deck = await db.deck.findUnique({
    where: {
      id: params.id,
    },
    include: {
      cards: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!deck) {
    notFound();
  }

  const now = new Date();
  const totalCards = deck.cards.length;
  const newCount = deck.cards.filter((card) => card.status === "NEW").length;
  const learningCount = deck.cards.filter((card) => card.status === "LEARNING").length;
  const dueCount = deck.cards.filter((card) => card.nextReviewAt <= now && card.status !== "NEW").length;
  const masteredCount = deck.cards.filter((card) => card.status === "MASTERED").length;
  const nextReview = deck.cards
    .filter((card) => card.nextReviewAt > now && card.status !== "NEW")
    .sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime())[0];

  const dueOrNewCount = dueCount + newCount;

  const statItems = [
    { label: `${totalCards} total`, tone: "total" },
    { label: `${newCount} new`, tone: "new" },
    { label: `${learningCount} learning`, tone: "learning" },
    { label: `${dueCount} due`, tone: "due" },
    { label: `${masteredCount} mastered`, tone: "mastered" },
  ] as const;

  return (
    <PageWrapper>
      <section className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 text-4xl shadow-sm" aria-hidden>
              {deck.emoji}
            </span>
            <div className="pt-1">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">{deck.title}</h2>
              {deck.description ? <p className="mt-1.5 text-zinc-400">{deck.description}</p> : null}
            </div>
          </div>
          
          <DeckOptions 
            deckId={deck.id}
            deckTitle={deck.title}
            cardCount={totalCards}
            deckDataStr={JSON.stringify(deck, null, 2)}
          />
        </div>

        {/* MASTERY BREAKDOWN VISUALIZATION */}
        {totalCards > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mt-2">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Mastery Breakdown</h3>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
              {masteredCount > 0 && <div style={{ width: `${(masteredCount / totalCards) * 100}%` }} className="bg-violet-500 transition-all duration-1000" />}
              {dueCount > 0 && <div style={{ width: `${(dueCount / totalCards) * 100}%` }} className="bg-emerald-500 transition-all duration-1000" />}
              {learningCount > 0 && <div style={{ width: `${(learningCount / totalCards) * 100}%` }} className="bg-amber-500 transition-all duration-1000" />}
              {newCount > 0 && <div style={{ width: `${(newCount / totalCards) * 100}%` }} className="bg-zinc-600 transition-all duration-1000" />}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
               <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                     <div className="h-2 w-2 rounded-full bg-violet-500" />
                     <p className="text-xs text-zinc-400">Mastered</p>
                  </div>
                  <p className="text-lg font-semibold text-zinc-200">{masteredCount} <span className="text-xs font-normal text-zinc-500 ml-0.5">({Math.round((masteredCount/totalCards)*100)}%)</span></p>
               </div>
               <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                     <div className="h-2 w-2 rounded-full bg-emerald-500" />
                     <p className="text-xs text-zinc-400">Reviewing</p>
                  </div>
                  <p className="text-lg font-semibold text-zinc-200">{dueCount} <span className="text-xs font-normal text-zinc-500 ml-0.5">({Math.round((dueCount/totalCards)*100)}%)</span></p>
               </div>
               <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                     <div className="h-2 w-2 rounded-full bg-amber-500" />
                     <p className="text-xs text-zinc-400">Learning</p>
                  </div>
                  <p className="text-lg font-semibold text-zinc-200">{learningCount} <span className="text-xs font-normal text-zinc-500 ml-0.5">({Math.round((learningCount/totalCards)*100)}%)</span></p>
               </div>
               <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                     <div className="h-2 w-2 rounded-full bg-zinc-600" />
                     <p className="text-xs text-zinc-400">New</p>
                  </div>
                  <p className="text-lg font-semibold text-zinc-200">{newCount} <span className="text-xs font-normal text-zinc-500 ml-0.5">({Math.round((newCount/totalCards)*100)}%)</span></p>
               </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {statItems.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dotClass[item.tone]}`} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {dueOrNewCount > 0 ? (
            <Button asChild className="h-11 rounded-xl px-6 bg-violet-600 hover:bg-violet-500 text-white">
              <Link href={`/decks/${deck.id}/study`}>
                Study Now
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs ml-2">{dueOrNewCount}</span>
              </Link>
            </Button>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-2.5 text-sm text-zinc-400">
              All caught up
              {nextReview ? ` · Next review ${formatStudyDate(nextReview.nextReviewAt)}` : ""}
            </div>
          )}

          <Button asChild variant="secondary" className="h-11 rounded-xl px-6">
            <Link href={`/decks/${deck.id}/study?mode=all`}>Study All</Link>
          </Button>

          <Button asChild variant="ghost" className="h-11 shadow-none rounded-xl px-6">
            <a href="#cards">Browse Cards</a>
          </Button>
        </div>
      </section>

      <section id="cards" className="mt-8 space-y-4">
        <h3 className="text-lg font-medium tracking-tight text-zinc-100">Cards</h3>
        <DeckDetailCardList
          deckId={deck.id}
          cards={deck.cards.map((card) => ({
            id: card.id,
            front: card.front,
            back: card.back,
            difficulty: card.difficulty,
            status: card.status,
            nextReviewAt: card.nextReviewAt.toISOString(),
          }))}
        />
      </section>
    </PageWrapper>
  );
}
