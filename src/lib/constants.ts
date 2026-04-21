export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "History",
  "Literature",
  "Languages",
  "Other",
] as const;

export const DEFAULT_DECK_EMOJIS: Record<string, string> = {
  Mathematics: "📐",
  Science: "🔬",
  History: "📜",
  Literature: "📚",
  Languages: "🗣️",
  Other: "🧠",
};

export const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  HARD: "bg-red-500/10 text-red-300 border border-red-500/20",
};

export const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-zinc-500/15 text-zinc-300 border border-zinc-500/20",
  LEARNING: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  REVIEW: "bg-violet-500/10 text-violet-300 border border-violet-500/25",
  MASTERED: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
};
