"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Command, LayoutDashboard, Layers, Plus, GraduationCap, Search } from "lucide-react";

import { useCommandPalette } from "@/lib/store/useCommandPalette";

// Need some type for mocked out decks for commands
type DeckBasic = {
  id: string;
  title: string;
  dueCount: number;
};

// Internal API to fetch raw list of decks for the command palette
function useDeckCommands() {
  const [decks, setDecks] = useState<DeckBasic[]>([]);

  useEffect(() => {
    // We only fetch decks when component mounts
    fetch("/api/decks/minimal")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: DeckBasic[]) => setDecks(data))
      .catch(() => {});
  }, []);

  return decks;
}

export default function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPalette();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const decks = useDeckCommands();

  // Combine static commands with dynamic deck commands
  const commands = useMemo(() => {
    const list = [
      { id: "nav-dash", icon: LayoutDashboard, label: "Go to Dashboard", action: () => router.push("/") },
      { id: "nav-decks", icon: Layers, label: "Browse All Decks", action: () => router.push("/decks") },
      { id: "nav-new", icon: Plus, label: "Create a New Deck", action: () => router.push("/upload") },
    ];

    decks.forEach((deck) => {
      // Study Command
      if (deck.dueCount > 0) {
        list.push({
          id: `study-${deck.id}`,
          icon: GraduationCap,
          label: `Study: ${deck.title} (${deck.dueCount} due)`,
          action: () => router.push(`/decks/${deck.id}/study`),
        });
      }
      
      // View Command
      list.push({
        id: `view-${deck.id}`,
        icon: Layers,
        label: `View Deck: ${deck.title}`,
        action: () => router.push(`/decks/${deck.id}`),
      });
    });

    if (!query) return list;

    const lowerQuery = query.toLowerCase();
    return list.filter((c) => c.label.toLowerCase().includes(lowerQuery));
  }, [decks, query, router]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      // Small timeout allows AnimatePresence to mount the DOM node
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Handle local keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (commands.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % commands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = commands[selectedIndex];
      if (cmd) {
        close();
        cmd.action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex pt-[10vh] items-start justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center border-b border-zinc-800 px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-zinc-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
              <span className="ml-3 flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
                <Command className="h-3 w-3" /> ESC
              </span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {commands.length === 0 ? (
                <div className="py-14 text-center text-sm text-zinc-500">
                  No results found.
                </div>
              ) : (
                commands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        close();
                        cmd.action();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                        isSelected
                          ? "bg-violet-500/10 text-violet-100"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? "text-violet-400" : ""}`} />
                      {cmd.label}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
