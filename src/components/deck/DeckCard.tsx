"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type DeckCardModel = {
  id: string;
  title: string;
  emoji: string;
  cardCount: number;
  masteredCount: number;
};

type DeckCardProps = {
  deck: DeckCardModel;
};

export default function DeckCard({ deck }: DeckCardProps) {
  const mastery = deck.cardCount > 0 ? Math.round((deck.masteredCount / deck.cardCount) * 100) : 0;

  return (
    <Link href={`/decks/${deck.id}`}>
      <motion.article
        whileHover={{ y: -2, boxShadow: "0 14px 30px rgba(139, 92, 246, 0.05)" }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-xl transition-colors hover:border-zinc-700"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            {deck.emoji}
          </span>
          <h3 className="truncate text-base font-medium text-zinc-100">{deck.title}</h3>
        </div>

        <p className="mt-5 text-sm text-zinc-400">{deck.cardCount} cards</p>

        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-violet-500"
            initial={false}
            animate={{ width: `${mastery}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">{mastery}% mastered</p>
      </motion.article>
    </Link>
  );
}
