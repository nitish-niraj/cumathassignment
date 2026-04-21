import { Flame } from "lucide-react";
import { format, startOfDay, addDays } from "date-fns";

import ActivityHeatmap from "@/components/stats/ActivityHeatmap";
import MasteryRing from "@/components/stats/MasteryRing";
import PageWrapper from "@/components/layout/PageWrapper";
import CountUp from "@/components/shared/CountUp";
import { db } from "@/lib/db";
import { calculateStudyStreak } from "@/lib/stats";

// Database-backed analytics; must run at request time (not at build time).
export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [cards, logs, decks] = await Promise.all([
    db.card.findMany({
      select: {
        status: true,
        nextReviewAt: true,
      },
    }),
    db.reviewLog.findMany({
      select: {
        reviewedAt: true,
        rating: true,
      },
      orderBy: {
        reviewedAt: "desc",
      },
    }),
    db.deck.findMany({
      select: {
        id: true,
        title: true,
        emoji: true,
        cards: {
          select: {
            status: true,
          },
        },
      },
    }),
  ]);

  const totalCards = cards.length;
  const masteredCards = cards.filter((card) => card.status === "MASTERED").length;
  const overallMastery = totalCards ? Math.round((masteredCards / totalCards) * 100) : 0;

  const streak = calculateStudyStreak(logs.map((entry) => entry.reviewedAt));

  const startToday = startOfDay(new Date());
  const startTomorrow = addDays(startToday, 1);
  const startInTwoDays = addDays(startToday, 2);
  const endOfWeekWindow = addDays(startToday, 8);

  const reviewedToday = logs.filter((entry) => entry.reviewedAt >= startToday).length;
  const successful = logs.filter((entry) => entry.rating === "good" || entry.rating === "easy").length;
  const accuracy = logs.length ? Math.round((successful / logs.length) * 100) : 0;

  const countsByDate: Record<string, number> = {};
  logs.forEach((entry) => {
    const key = format(entry.reviewedAt, "yyyy-MM-dd");
    countsByDate[key] = (countsByDate[key] ?? 0) + 1;
  });

  const deckBreakdown = decks.map((deck) => {
    const total = deck.cards.length || 1;
    const mastered = deck.cards.filter((card) => card.status === "MASTERED").length;
    const review = deck.cards.filter((card) => card.status === "REVIEW").length;
    const learning = deck.cards.filter((card) => card.status === "LEARNING").length;
    const fresh = deck.cards.filter((card) => card.status === "NEW").length;
    const masteryPercent = Math.round((mastered / total) * 100);

    return {
      id: deck.id,
      title: deck.title,
      emoji: deck.emoji,
      total,
      mastered,
      review,
      learning,
      fresh,
      masteryPercent,
    };
  });

  const reviewsToday = cards.filter(
    (card) => card.nextReviewAt >= startToday && card.nextReviewAt < startTomorrow,
  ).length;
  const reviewsTomorrow = cards.filter(
    (card) => card.nextReviewAt >= startTomorrow && card.nextReviewAt < startInTwoDays,
  ).length;
  const reviewsThisWeek = cards.filter(
    (card) => card.nextReviewAt >= startInTwoDays && card.nextReviewAt < endOfWeekWindow,
  ).length;

  return (
    <PageWrapper>
      <section className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Your Progress</h2>
        {streak > 0 ? (
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
            🔥 {streak} day streak
          </span>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="glass-card rounded-2xl p-5">
          <p className="text-sm text-zinc-400">Overall Mastery</p>
          <div className="mt-4 flex justify-center">
            <MasteryRing percentage={overallMastery} />
          </div>
        </article>

        <article className="glass-card rounded-2xl p-5">
          <p className="text-sm text-zinc-400">Reviewed Today</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100">
            <CountUp value={reviewedToday} />
          </p>
          <div className="mt-5 flex items-end gap-1">
            {[16, 28, 18, 34, 26, 38, 30].map((height, index) => (
              <span key={`${height}-${index}`} className="w-2 rounded-full bg-zinc-700/80" style={{ height }} />
            ))}
          </div>
        </article>

        <article className="glass-card rounded-2xl p-5">
          <p className="text-sm text-zinc-400">Study Streak</p>
          <p className="mt-3 flex items-center gap-2 text-4xl font-semibold tracking-tight text-zinc-100">
            <CountUp value={streak} />
            <Flame className="h-6 w-6 text-zinc-200" />
          </p>
          <p className="mt-1 text-xs text-zinc-500">consecutive active days</p>
        </article>

        <article className="glass-card rounded-2xl p-5">
          <p className="text-sm text-zinc-400">Accuracy</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100">
            <CountUp value={accuracy} />%
          </p>
          <p className="mt-1 text-xs text-zinc-500">good + easy over total reviews</p>
        </article>
      </section>

      <section className="mt-10 space-y-3">
        <h3 className="text-lg font-medium tracking-tight text-zinc-100">Study Activity</h3>
        <p className="text-sm text-zinc-500">Last 90 days</p>
        <ActivityHeatmap countsByDate={countsByDate} />
      </section>

      <section className="mt-10 space-y-4">
        <h3 className="text-lg font-medium tracking-tight text-zinc-100">Deck Breakdown</h3>
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          {deckBreakdown.map((deck) => (
            <div key={deck.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <p className="text-zinc-200">
                  <span className="mr-2">{deck.emoji}</span>
                  {deck.title}
                </p>
                <p className="text-zinc-400">{deck.masteryPercent}%</p>
              </div>

              <div className="flex h-2 overflow-hidden rounded-full bg-zinc-800">
                <span className="bg-emerald-500/70" style={{ width: `${(deck.mastered / deck.total) * 100}%` }} />
                <span className="bg-violet-500/70" style={{ width: `${(deck.review / deck.total) * 100}%` }} />
                <span className="bg-amber-500/70" style={{ width: `${(deck.learning / deck.total) * 100}%` }} />
                <span className="bg-zinc-500/80" style={{ width: `${(deck.fresh / deck.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h3 className="text-lg font-medium tracking-tight text-zinc-100">Upcoming Reviews</h3>
        <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-300">Today — {reviewsToday} cards</p>
          <p className="text-sm text-zinc-300">Tomorrow — {reviewsTomorrow} cards</p>
          <p className="text-sm text-zinc-300">This week — {reviewsThisWeek} cards</p>
        </div>
      </section>
    </PageWrapper>
  );
}
