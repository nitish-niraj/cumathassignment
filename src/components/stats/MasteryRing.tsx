"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

type MasteryRingProps = {
  percentage: number;
};

const SIZE = 120;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MasteryRing({ percentage }: MasteryRingProps) {
  const value = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(value, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    const controls = animate(value, percentage, {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1],
    });

    return () => controls.stop();
  }, [percentage, value]);

  const offset = CIRCUMFERENCE - (display / 100) * CIRCUMFERENCE;

  return (
    <div className="relative h-30 w-30">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          className="stroke-zinc-800"
          fill="none"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="stroke-violet-500"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold tracking-tight text-zinc-100">
        {display}%
      </span>
    </div>
  );
}
