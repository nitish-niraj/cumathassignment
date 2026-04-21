"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";

import { DIFFICULTY_STYLES } from "@/lib/constants";

type Flashcard3DProps = {
  front: string;
  back: string;
  difficulty: string;
  /** Controlled flip state — parent owns this */
  flipped: boolean;
  onFlipChange: (next: boolean) => void;
};

export default function Flashcard3D({
  front,
  back,
  difficulty,
  flipped,
  onFlipChange,
}: Flashcard3DProps) {
  const toggle = useCallback(() => {
    onFlipChange(!flipped);
  }, [flipped, onFlipChange]);

  // Space / Enter handled by parent shell; just expose click toggle here
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    /* Gradient-border wrapper: 1 px gradient border via padding trick */
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: "1200px" }}
      onClick={toggle}
    >
      {/* Gradient border ring */}
      <div
        className="absolute -inset-px rounded-[calc(1rem+1px)] opacity-60"
        style={{
          background: flipped
            ? "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)"
            : "linear-gradient(135deg, #3f3f46 0%, #52525b 100%)",
          transition: "background 0.6s ease",
        }}
      />

      {/* 3-D rotating card */}
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: flipped
            ? "0 24px 48px rgba(0,0,0,0.65)"
            : "0 12px 28px rgba(0,0,0,0.45)",
          transition: "box-shadow 0.55s ease",
        }}
        className="relative min-h-[300px] w-full rounded-2xl"
      >
        {/* FRONT face */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl bg-zinc-900/95 p-8 backdrop-blur-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Difficulty badge */}
          <div className="flex justify-end">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.MEDIUM
              }`}
            >
              {difficulty}
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <p className="text-center text-xl font-medium leading-relaxed text-zinc-100">
              {front}
            </p>
          </div>

          <p className="text-center text-[11px] text-zinc-600">QUESTION</p>
        </div>

        {/* BACK face */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-zinc-900/95 p-8 backdrop-blur-xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-center text-lg leading-relaxed text-zinc-200">{back}</p>
          <p className="mt-6 text-center text-[11px] text-zinc-600">ANSWER</p>
        </div>
      </motion.div>
    </div>
  );
}
