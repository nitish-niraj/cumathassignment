"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const STATUSES = ["Reading PDF...", "Extracting concepts...", "Generating flashcards..."];

type ProcessingUIProps = {
  visible: boolean;
};

export default function ProcessingUI({ visible }: ProcessingUIProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUSES.length);
    }, 1600);

    return () => window.clearInterval(timer);
  }, [visible]);

  const progress = useMemo(() => 30 + statusIndex * 25, [statusIndex]);

  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm text-zinc-300">
        <span>{STATUSES[statusIndex]}</span>
        <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity }}>
          ...
        </motion.span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="h-full rounded-full bg-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}
