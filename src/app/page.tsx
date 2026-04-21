import Link from "next/link";
import { BarChart3, Clock, Flame, GraduationCap, Layers, CheckCircle2, TrendingUp, Trophy } from "lucide-react";

import DeckGrid from "@/components/deck/DeckGrid";
import PageWrapper from "@/components/layout/PageWrapper";
import LandingHero from "@/components/layout/LandingHero";
import CountUp from "@/components/shared/CountUp";
import StudyHeatmap from "@/components/shared/StudyHeatmap";
import { getDashboardData } from "@/lib/stats";
import { getGreetingByHour, formatRelativeDate } from "@/lib/utils";

// Uses database-backed stats; must run at request time.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const {
    totalCards,
    cardsDueToday,
    masteryRate,
    studyStreak,
    heatmap,
    sessions,
    decks,
    recentDecks,
  } = await getDashboardData();

  const greeting = getGreetingByHour();
  const dueDecks = decks.filter(d => d.dueCount > 0);

  if (decks.length === 0) {
    return <LandingHero />;
  }

  return (
    <PageWrapper>
      <section className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Good {greeting}, learner</h2>
        <p className="mt-2 text-zinc-400">Here&apos;s your latest progress breakdown.</p>
      </section>

      {/* TOP STATS ROW */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-all group-hover:bg-violet-500/20" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Cards</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-zinc-100">
                <CountUp value={totalCards} />
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-zinc-400">Due Today</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-zinc-100">
                <CountUp value={cardsDueToday} />
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-zinc-400">Mastery Rate</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-zinc-100">
                <CountUp value={masteryRate} />%
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl transition-all group-hover:bg-orange-500/20" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-zinc-400">Study Streak</p>
              <p className="mt-2 flex items-center gap-2 text-4xl font-semibold tracking-tight text-zinc-100">
                <CountUp value={studyStreak} />
                <span className="text-xl leading-none">days</span>
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              <Flame className={`h-5 w-5 ${studyStreak > 0 ? "text-orange-400" : ""}`} />
            </div>
          </div>
        </article>
      </section>

      {/* HEATMAP */}
      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-base font-medium tracking-tight text-zinc-100">Consistency graph</h3>
           <TrendingUp className="h-4 w-4 text-zinc-500" />
        </div>
        <StudyHeatmap data={heatmap} />
      </section>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
        {/* LEFT COLUMN: Cards due & Recent Decks */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* CARDS DUE SECTION */}
          <section>
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-medium tracking-tight text-zinc-100 flex items-center gap-2">
                 <GraduationCap className="h-5 w-5 text-violet-400" /> Needs Review
               </h3>
               {dueDecks.length > 1 && (
                 <Link href="/decks/merged-study" className="text-sm text-violet-400 hover:text-violet-300 font-medium px-2 py-1 bg-violet-400/10 rounded-lg">
                   Review All
                 </Link>
               )}
            </div>
            
            {cardsDueToday > 0 ? (
              <div className="flex flex-col gap-3">
                {dueDecks.map(deck => (
                  <div key={deck.id} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition">
                     <div className="flex items-center gap-3">
                        <span className="text-2xl">{deck.emoji}</span>
                        <div>
                          <p className="font-medium text-zinc-200">{deck.title}</p>
                          <p className="text-xs text-red-400 font-medium">{deck.dueCount} cards waiting</p>
                        </div>
                     </div>
                     <Link href={`/decks/${deck.id}/study`} className="shrink-0 bg-zinc-100 text-zinc-950 font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-zinc-300 transition">
                       Start Review
                     </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-zinc-800/50 border-dashed rounded-2xl bg-zinc-900/20">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                   <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-base text-zinc-200 font-medium">You&apos;re all caught up. Nice.</p>
                <p className="text-sm text-zinc-500 mt-1">Excellent work clearing your queue today.</p>
              </div>
            )}
          </section>

          {/* RECENT DECKS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium tracking-tight text-zinc-100">Pick up where you left off</h3>
              <Link href="/decks" className="text-sm text-zinc-500 hover:text-zinc-300 transition">View all</Link>
            </div>
            <DeckGrid decks={recentDecks} className="grid-cols-1 sm:grid-cols-2" />
          </section>
        </div>

        {/* RIGHT COLUMN: Recent Activity List */}
        <aside className="xl:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-zinc-400" />
            <h3 className="text-base font-medium tracking-tight text-zinc-100">Activity Log</h3>
          </div>
          
          {sessions.length === 0 ? (
            <div className="text-center py-6 text-sm text-zinc-500">
               No recent study sessions.
            </div>
          ) : (
            <div className="space-y-0.5">
              {sessions.map((session, idx) => {
                let dotColor = "bg-red-500";
                if (session.accuracy >= 80) dotColor = "bg-emerald-500";
                else if (session.accuracy >= 50) dotColor = "bg-amber-500";

                return (
                  <div key={session.id}>
                    <div className="flex items-start gap-4 py-3">
                      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor} relative`}>
                         <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${dotColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
                            {session.emoji} <span className="line-clamp-1 max-w-[120px] sm:max-w-max">{session.deckTitle}</span>
                          </span>
                          <span className="text-xs text-zinc-500">{formatRelativeDate(new Date(session.date))} ago</span>
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                           <span>{session.cardsStudied} cards</span>
                           <span>•</span>
                           <span>{session.accuracy}% acc</span>
                           <span>•</span>
                           <span>{session.durationMin}m</span>
                        </div>
                      </div>
                    </div>
                    {idx < sessions.length - 1 && <hr className="border-t border-zinc-800/60 ml-6" />}
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>

    </PageWrapper>
  );
}
