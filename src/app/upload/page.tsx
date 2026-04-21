"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, UploadCloud, X, AlertCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECT_OPTIONS } from "@/lib/constants";

// ── Utility ───────────────────────────────────────────────────────────────────
function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface UploadResult {
  deckId: string;
  cardCount: number;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const canGenerate = Boolean(file && title.trim().length > 0 && !isProcessing);

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileSelect = (incoming: File | null) => {
    if (!incoming) return setFile(null);
    if (incoming.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setFile(incoming);
    setError(null);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] ?? null);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setFile(null);
    setTitle("");
    setSubject("");
    setProgress(0);
    setStatusMessage("");
    setError(null);
    setResult(null);
    setIsProcessing(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!file || !title.trim()) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusMessage("Starting…");
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("subject", subject);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? "Upload failed");
      }

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const update = JSON.parse(trimmed) as {
              status: string;
              message: string;
              progress?: number;
              deckId?: string;
              cardCount?: number;
            };

            if (update.progress !== undefined) setProgress(update.progress);
            if (update.message) setStatusMessage(update.message);

            if (update.status === "error") {
              setError(update.message);
              setIsProcessing(false);
              return;
            }

            if (update.status === "complete" && update.deckId) {
              setProgress(100);
              setStatusMessage(`✨ ${update.cardCount} flashcards created!`);
              setResult({
                deckId: update.deckId,
                cardCount: update.cardCount ?? 0,
              });
              setIsProcessing(false);
              router.refresh();

              // Fire confetti 🎉
              confetti({
                particleCount: 80,
                spread: 60,
                decay: 0.9,
                origin: { x: 0.5, y: 0.5 },
                colors: ["#7c3aed", "#8b5cf6", "#a78bfa", "#71717a", "#d4d4d8"],
              });
              return;
            }
          } catch {
            // Malformed JSON line — skip
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageWrapper className="max-w-3xl">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Create a new deck
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Upload a PDF and let AI generate targeted flashcards from it.
        </p>
      </section>

      {/* Error card */}
      <AnimatePresence>
        {error && !isProcessing && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
            <Button
              variant="ghost"
              className="w-fit rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={reset}
            >
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form section — animates out when processing */}
      <AnimatePresence>
        {!isProcessing && !result && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Drop zone */}
            <div className="space-y-3">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={[
                  "flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
                  isDragging
                    ? "border-violet-500/70 bg-violet-500/8 shadow-[0_0_24px_rgba(139,92,246,0.15)]"
                    : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/60",
                ].join(" ")}
              >
                <div className={[
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                  isDragging ? "bg-violet-500/20" : "bg-zinc-800",
                ].join(" ")}>
                  <UploadCloud className={[
                    "h-7 w-7 transition-colors",
                    isDragging ? "text-violet-400" : "text-zinc-500",
                  ].join(" ")} />
                </div>
                <p className="mt-4 text-base font-medium text-zinc-300">
                  Drop your PDF here
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  or{" "}
                  <span className="text-violet-400 underline underline-offset-2">
                    browse files
                  </span>
                </p>
                <p className="mt-3 text-xs text-zinc-600">PDF · max 20 MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />
              </div>

              {/* Selected file bar */}
              <AnimatePresence>
                {file && (
                  <motion.div
                    key="file-bar"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
                        <FileText className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {file.name}
                        </p>
                        <p className="text-xs text-zinc-500">{formatSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (inputRef.current) inputRef.current.value = "";
                        }}
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Title input */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Deck Title *</label>
              <Input
                id="deck-title"
                placeholder="e.g. Linear Algebra Midterm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Subject select */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              id="generate-btn"
              className="h-11 w-full rounded-xl bg-violet-600 px-6 text-white hover:bg-violet-500 disabled:opacity-40"
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              Generate Flashcards
            </Button>

            <p className="text-xs text-zinc-500">
              Powered by AI — generation may take a minute on the free tier.
              Works best with text-based PDFs.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing / Result card */}
      <AnimatePresence>
        {(isProcessing || result) && !error && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="mx-auto w-full max-w-md"
          >
            {/* Card with animated gradient border */}
            <div className="processing-card relative rounded-2xl p-px">
              <div className="relative rounded-2xl bg-zinc-950 px-8 py-8">
                {/* Progress bar at top */}
                <div className="mb-8 h-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    style={{ width: `${progress}%` }}
                    className={[
                      "h-full rounded-full transition-all duration-700",
                      result ? "bg-emerald-500" : "bg-violet-500",
                    ].join(" ")}
                  />
                </div>

                {/* Status message */}
                <div className="flex min-h-12 flex-col items-center justify-center text-center">
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
                          <Sparkles className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-zinc-100">
                            {result.cardCount} flashcards created!
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Your deck is ready to study
                          </p>
                        </div>

                        {/* CTA buttons */}
                        <motion.div
                          className="mt-2 flex w-full flex-col gap-3"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.1 } },
                          }}
                        >
                          <motion.div
                            variants={{
                              hidden: { opacity: 0, y: 8 },
                              visible: { opacity: 1, y: 0 },
                            }}
                          >
                            <Button
                              className="h-11 w-full rounded-xl bg-violet-600 text-white hover:bg-violet-500"
                              onClick={() => router.push(`/decks/${result.deckId}/study`)}
                            >
                              Start Studying
                            </Button>
                          </motion.div>
                          <motion.div
                            variants={{
                              hidden: { opacity: 0, y: 8 },
                              visible: { opacity: 1, y: 0 },
                            }}
                          >
                            <Button
                              variant="ghost"
                              className="h-11 w-full rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                              onClick={() => router.push(`/decks/${result.deckId}`)}
                            >
                              View Deck
                            </Button>
                          </motion.div>
                          <motion.div
                            variants={{
                              hidden: { opacity: 0 },
                              visible: { opacity: 1 },
                            }}
                          >
                            <button
                              className="w-full text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-400"
                              onClick={reset}
                            >
                              Create Another
                            </button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={statusMessage}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <p className="text-lg text-zinc-200">{statusMessage}</p>
                        <p className="text-xs text-zinc-600">
                          This usually takes 30–60 seconds
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated border CSS */}
      <style>{`
        @keyframes spin-border {
          from { --angle: 0deg; }
          to   { --angle: 360deg; }
        }

        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .processing-card {
          background: conic-gradient(
            from var(--angle),
            transparent 20%,
            #7c3aed 40%,
            #a78bfa 50%,
            #7c3aed 60%,
            transparent 80%
          );
          animation: spin-border 3s linear infinite;
        }
      `}</style>
    </PageWrapper>
  );
}
