"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/lib/store/useToast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DeckOptionsProps = {
  deckId: string;
  deckTitle: string;
  cardCount: number;
  deckDataStr: string; // JSON string of deck and cards for export
};

export default function DeckOptions({ deckId, deckTitle, cardCount, deckDataStr }: DeckOptionsProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Future feature: Edit Modal
  const handleEdit = () => {
    addToast("Edit deck details coming soon.", "info");
  };

  const handleExport = () => {
    try {
      const blob = new Blob([deckDataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deckTitle.replace(/\s+/g, "_").toLowerCase()}_export.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("Deck exported successfully.", "success");
    } catch {
      addToast("Failed to export deck.", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${deckTitle}" and all its ${cardCount} cards? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete deck");
      addToast("Deck deleted successfully.", "success");
      router.push("/decks");
      router.refresh();
    } catch {
      addToast("Failed to delete deck.", "error");
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 outline-none transition hover:bg-zinc-800 hover:text-zinc-200">
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border-zinc-800 bg-zinc-950 p-1">
        <DropdownMenuItem onClick={handleEdit} className="rounded-lg py-2.5 text-xs text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100">
          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Deck
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExport} className="rounded-lg py-2.5 text-xs text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100">
          <Download className="mr-2 h-3.5 w-3.5" /> Export JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800/80" />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg py-2.5 text-xs text-red-500 focus:bg-red-500/10 focus:text-red-400"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" /> {isDeleting ? "Deleting..." : "Delete Deck"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
