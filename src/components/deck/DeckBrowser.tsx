"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

import DeckGrid from "@/components/deck/DeckGrid";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortMode = "recent" | "alphabetical" | "most-cards" | "lowest-mastery";
type FilterMode = "all" | "due" | "recent" | "never";

export type DeckBrowserModel = {
  id: string;
  title: string;
  subject: string | null;
  emoji: string;
  cardCount: number;
  counts: { new: number; learning: number; review: number; mastered: number };
  dueCount: number;
  lastTouchedAt: string;
};

type DeckBrowserProps = {
  decks: DeckBrowserModel[];
};

export default function DeckBrowser({ decks }: DeckBrowserProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [sort, setSort] = useState<SortMode>("recent");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const filteredDecks = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    // 1. Filter
    const next = decks.filter((deck) => {
      // Name/Subject check
      if (normalizedQuery) {
        if (
          !deck.title.toLowerCase().includes(normalizedQuery) &&
          !(deck.subject?.toLowerCase().includes(normalizedQuery) ?? false)
        ) {
          return false;
        }
      }

      // Chip check
      if (filterMode === "due") return deck.dueCount > 0;
      if (filterMode === "recent") {
        // Assume recent means lastTouchedAt is within 7 days and they actually studied it
        // We use dummy logic: any deck that has lastTouchedAt > its creation time OR within a strict window
        // But for simplicity, just sort will handle recency better. Let's say last 7 days:
        const isRecent = new Date().getTime() - new Date(deck.lastTouchedAt).getTime() < 7 * 24 * 60 * 60 * 1000;
        return isRecent;
      }
      if (filterMode === "never") {
        // A deck is 'never' studied if all cards are NEW (mastered+learning+review == 0) and no due counts
        return Object.values(deck.counts).reduce((a, b) => a + b, 0) === deck.counts.new;
      }
      
      return true;
    });

    // 2. Sort
    next.sort((a, b) => {
      if (sort === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      if (sort === "most-cards") {
        return b.cardCount - a.cardCount;
      }
      if (sort === "lowest-mastery") {
        const aRate = a.cardCount === 0 || a.cardCount === a.counts.new ? 0 : a.counts.mastered / (a.cardCount - a.counts.new);
        const bRate = b.cardCount === 0 || b.cardCount === b.counts.new ? 0 : b.counts.mastered / (b.cardCount - b.counts.new);
        return aRate - bRate; // lower mastery first
      }

      // default 'recent'
      return new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime();
    });

    return next;
  }, [decks, debouncedQuery, sort, filterMode]);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search decks..."
            className="h-11 rounded-xl border-zinc-800 bg-zinc-900/50 pl-10 focus-visible:ring-violet-500"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "due", label: "Has Due Cards" },
                  { id: "recent", label: "Recently Studied" },
                  { id: "never", label: "Never Studied" }
                ] as const
              ).map(opt => (
                 <button
                   key={opt.id}
                   onClick={() => setFilterMode(opt.id)}
                   className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                     filterMode === opt.id 
                       ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                       : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                   }`}
                 >
                   {opt.label}
                 </button>
              ))}
           </div>
           
           <div className="w-[160px]">
             <Select value={sort} onValueChange={(value) => setSort(value as SortMode)}>
               <SelectTrigger className="h-11 rounded-xl bg-zinc-900/50 border-zinc-800 text-sm">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="recent">Last Studied</SelectItem>
                 <SelectItem value="alphabetical">Alphabetical</SelectItem>
                 <SelectItem value="most-cards">Most Cards</SelectItem>
                 <SelectItem value="lowest-mastery">Lowest Mastery</SelectItem>
               </SelectContent>
             </Select>
           </div>
        </div>
      </div>

      {/* Grid rendering */}
      {filteredDecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center mt-12">
           <BookOpen className="mb-4 h-10 w-10 text-zinc-600" />
           <p className="text-base font-medium text-zinc-200">
             {decks.length === 0 ? "No decks yet" : "No decks found matching your filters"}
           </p>
           {decks.length === 0 ? (
             <p className="mt-2 text-sm text-zinc-500 max-w-sm mb-6">
                Upload a PDF document and let AI instantly generate a study set for you.
             </p>
           ) : (
             <p className="mt-2 text-sm text-zinc-500 max-w-sm mb-6">
                Try adjusting your search query or removing filter chips to see more results.
             </p>
           )}
           <a 
             href={decks.length === 0 ? "/upload" : "#"}
             onClick={(e) => {
               if (decks.length !== 0) {
                 e.preventDefault();
                 setQuery("");
                 setFilterMode("all");
               }
             }}
             className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors"
           >
             {decks.length === 0 ? "Upload PDF" : "Clear Filters"}
           </a>
        </div>
      ) : (
        <DeckGrid
          decks={filteredDecks}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      )}
    </div>
  );
}
