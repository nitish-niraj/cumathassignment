"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useDebounce } from "@/hooks/useDebounce";
import { DIFFICULTY_STYLES, STATUS_STYLES } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/store/useToast";

type DeckDetailCard = {
  id: string;
  front: string;
  back: string;
  difficulty: string;
  status: string;
  nextReviewAt: string;
};

type DeckDetailCardListProps = {
  deckId: string;
  cards: DeckDetailCard[];
};

export default function DeckDetailCardList({ deckId, cards: initialCards }: DeckDetailCardListProps) {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [cards, setCards] = useState(initialCards);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCards = useMemo(() => {
    if (!debouncedSearch.trim()) return cards;
    const lowerSearch = debouncedSearch.toLowerCase();
    return cards.filter(
      (card) =>
        card.front.toLowerCase().includes(lowerSearch) ||
        card.back.toLowerCase().includes(lowerSearch)
    );
  }, [cards, debouncedSearch]);

  const toggleExpand = (id: string) => {
    if (editingId) return; // Prevent collapse while editing
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const startEdit = (card: DeckDetailCard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(card.id);
    setExpandedId(card.id); // Ensure it's expanded to see back
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const saveEdit = async (cardId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: editFront, back: editBack }),
      });
      if (!res.ok) throw new Error();
      
      setCards(cards.map(c => c.id === cardId ? { ...c, front: editFront, back: editBack } : c));
      setEditingId(null);
      addToast("Card updated", "success");
      router.refresh();
    } catch {
      addToast("Failed to update card", "error");
    }
  };

  const deleteCard = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this card?")) return;
    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      
      setCards(cards.filter(c => c.id !== cardId));
      addToast("Card deleted", "success");
      router.refresh();
    } catch {
      addToast("Failed to delete card", "error");
    }
  };

  const handleAddCard = async () => {
    if (!newFront.trim() || !newBack.trim()) {
      addToast("Both sides are required", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: newFront, back: newBack }),
      });
      
      if (!res.ok) throw new Error();
      const newCard = await res.json();
      
      // Map API response to Component Type
      const formattedCard: DeckDetailCard = {
        id: newCard.id,
        front: newCard.front,
        back: newCard.back,
        difficulty: newCard.difficulty,
        status: newCard.status,
        nextReviewAt: newCard.nextReviewAt,
      };
      
      setCards([formattedCard, ...cards]);
      setNewFront("");
      setNewBack("");
      setIsAdding(false);
      addToast("Card added successfully", "success");
      router.refresh();
    } catch {
      addToast("Failed to add card", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-zinc-900/50 border-zinc-800 focus-visible:ring-violet-500 rounded-xl"
          />
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" /> Add Card
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 backdrop-blur-md mb-4">
               <h4 className="text-sm font-medium text-violet-200 mb-4">Create New Card</h4>
               <div className="space-y-3 shrink-0">
                  <Input 
                    placeholder="Front content (Question)" 
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    className="bg-zinc-950/50 border-violet-500/20 text-zinc-100" 
                  />
                  <Input 
                    placeholder="Back content (Answer)" 
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    className="bg-zinc-950/50 border-violet-500/20 text-zinc-100" 
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddCard}
                      disabled={isSubmitting}
                      className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save Card"}
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className="space-y-3">
        <AnimatePresence initial={false}>
          {filteredCards.length === 0 ? (
            <motion.div
              layout
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center text-zinc-500"
            >
              No cards found.
            </motion.div>
          ) : (
            filteredCards.map((card) => {
               const isExpanded = expandedId === card.id;
               const isEditing = editingId === card.id;

              return (
                <motion.div
                  layout
                  key={card.id}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`overflow-hidden rounded-2xl border bg-zinc-900/60 backdrop-blur-xl transition-colors ${
                    isEditing ? "border-violet-500/50" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Summary row */}
                  <div
                    onClick={() => toggleExpand(card.id)}
                    className="flex w-full cursor-pointer flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <input 
                          value={editFront}
                          onChange={(e) => setEditFront(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-zinc-950 px-3 py-1.5 text-sm outline-none border border-zinc-700 rounded-md focus:border-violet-500 text-zinc-100"
                        />
                      ) : (
                        <p className={`line-clamp-2 text-sm text-zinc-200 transition-all ${isExpanded ? "line-clamp-none font-medium" : ""}`}>
                          {card.front}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                       {!isEditing && (
                         <>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                                DIFFICULTY_STYLES[card.difficulty] ?? DIFFICULTY_STYLES.MEDIUM
                              }`}
                            >
                              {card.difficulty}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                                STATUS_STYLES[card.status] ?? STATUS_STYLES.NEW
                              }`}
                            >
                              {card.status}
                            </span>
                            <span className="text-xs text-zinc-500 w-[100px] text-right">
                              {formatRelativeDate(new Date(card.nextReviewAt))}
                            </span>
                         </>
                       )}

                       {/* Action Buttons */}
                       <div className="flex items-center gap-1 border-l border-zinc-800/80 pl-2 ml-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); saveEdit(card.id); }}
                                className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition"
                                title="Save"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                                className="p-1.5 text-zinc-400 hover:bg-zinc-800 rounded-md transition"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => startEdit(card, e)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => deleteCard(card.id, e)}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <div className="mx-1 h-4 w-px bg-zinc-800" />
                              <ChevronDown
                                className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={false}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                         <div className="border-t border-zinc-800/50 p-4">
                           {isEditing ? (
                             <textarea 
                               value={editBack}
                               onChange={(e) => setEditBack(e.target.value)}
                               className="w-full min-h-[80px] bg-zinc-950 px-3 py-2 text-sm outline-none border border-zinc-700 rounded-md focus:border-violet-500 text-zinc-100 resize-none"
                             />
                           ) : (
                             <p className="text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">
                               {card.back}
                             </p>
                           )}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
