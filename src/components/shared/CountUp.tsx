"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

type CountUpProps = {
  value: number;
  duration?: number;
  className?: string;
};

export default function CountUp({ value, duration = 1, className }: CountUpProps) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(motionValue, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
    });

    return () => controls.stop();
  }, [duration, motionValue, value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
