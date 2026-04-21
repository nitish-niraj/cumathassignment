"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

import { formatRelativeDate } from "@/lib/utils";

type DeckGridProps = {
  decks: {
    id: string;
    title: string;
    emoji: string;
    cardCount: number;
    counts?: { new: number; learning: number; review: number; mastered: number };
    dueCount?: number;
    lastTouchedAt?: string;
  }[];
  className?: string;
};

export default function DeckGrid({ decks, className = "" }: DeckGridProps) {
  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 py-12 text-center">
        <BookOpen className="mb-4 h-8 w-8 text-zinc-600" />
        <p className="text-sm font-medium text-zinc-300">No decks found</p>
        <p className="mt-1 text-xs text-zinc-500">Create or upload a new deck to see it here.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {decks.map((deck, idx) => {
        // Calculate mastery bar widths
        let masteryBar = null;
        if (deck.counts && deck.cardCount > 0) {
          const { new: newC, learning, review, mastered } = deck.counts;
          const total = deck.cardCount;
          masteryBar = (
            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              {mastered > 0 && <div style={{ width: `${(mastered / total) * 100}%` }} className="bg-violet-500" title={`Mastered: ${mastered}`} />}
              {review > 0 && <div style={{ width: `${(review / total) * 100}%` }} className="bg-emerald-500" title={`Reviewing: ${review}`} />}
              {learning > 0 && <div style={{ width: `${(learning / total) * 100}%` }} className="bg-amber-500" title={`Learning: ${learning}`} />}
              {newC > 0 && <div style={{ width: `${(newC / total) * 100}%` }} className="bg-zinc-600" title={`New: ${newC}`} />}
            </div>
          );
        }

        return (
          <Link key={deck.id} href={`/decks/${deck.id}`}>
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md transition-all hover:border-violet-500/40 hover:shadow-[0_8px_30px_rgb(139,92,246,0.12)]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/80 text-2xl">
                    {deck.emoji}
                  </span>
                  {deck.dueCount && deck.dueCount > 0 ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse" />
                      {deck.dueCount} due
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 line-clamp-1 text-lg font-medium tracking-tight text-zinc-100 group-hover:text-violet-200 transition-colors">
                  {deck.title}
                </h3>
                
                <p className="mt-1 text-sm text-zinc-400">{deck.cardCount} cards</p>
              </div>

              <div className="mt-auto pt-2">
                {masteryBar}
                <p className="mt-3 text-[11px] text-zinc-500">
                  {deck.lastTouchedAt
                    ? `Last studied ${formatRelativeDate(new Date(deck.lastTouchedAt))} ago`
                    : "Never studied"}
                </p>
              </div>
            </motion.article>
          </Link>
        )
      })}
    </div>
  );
}
