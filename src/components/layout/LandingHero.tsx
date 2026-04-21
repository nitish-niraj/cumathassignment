"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, GraduationCap, Flame } from "lucide-react";

export default function LandingHero() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-100 sm:text-6xl mb-6">
          recall
        </h1>
        <p className="text-xl text-zinc-400 mb-12 max-w-lg mx-auto leading-relaxed">
          Turn any PDF into smart flashcards. Study smarter with spaced repetition.
        </p>

        <div className="space-y-6 text-left max-w-sm mx-auto mb-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <p className="text-zinc-200 font-medium text-lg">Drop a PDF document</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <p className="text-zinc-200 font-medium text-lg">AI generates comprehensive cards</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="h-6 w-6" />
            </div>
            <p className="text-zinc-200 font-medium text-lg">Spaced repetition handles the rest</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Link 
            href="/upload" 
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-violet-600 px-8 text-base font-semibold text-white transition hover:bg-violet-500 hover:scale-[0.98] active:scale-[0.96] shadow-xl shadow-violet-500/20"
          >
            Upload Your First PDF
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
