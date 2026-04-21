"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

type ActivityHeatmapProps = {
  countsByDate: Record<string, number>;
};

const DAY_LABELS = ["M", "W", "F"];
const LABEL_ROWS = [1, 3, 5];

function getIntensityClass(value: number) {
  if (value === 0) return "bg-zinc-900";
  if (value <= 2) return "bg-zinc-800";
  if (value <= 5) return "bg-violet-900/50";
  if (value <= 10) return "bg-violet-700/60";
  return "bg-violet-500";
}

export default function ActivityHeatmap({ countsByDate }: ActivityHeatmapProps) {
  const [columns, setColumns] = useState<Date[][]>([]);

  useEffect(() => {
    const today = new Date();
    const days = Array.from({ length: 91 }, (_, index) => subDays(today, 90 - index));
    const cols = Array.from({ length: 13 }, (_, index) => days.slice(index * 7, index * 7 + 7));
    setColumns(cols);
  }, []);

  if (columns.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="h-24 w-full animate-pulse rounded bg-zinc-800/30" />
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mt-1 flex flex-col gap-1 text-xs text-zinc-500">
        {Array.from({ length: 7 }).map((_, rowIndex) => (
          <div key={`label-${rowIndex}`} className="h-3.5 leading-4">
            {LABEL_ROWS.includes(rowIndex) ? DAY_LABELS[LABEL_ROWS.indexOf(rowIndex)] : ""}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {columns.map((column, colIndex) => (
          <div key={`col-${colIndex}`} className="flex flex-col gap-1">
            {column.map((date, rowIndex) => {
              const key = format(date, "yyyy-MM-dd");
              const value = countsByDate[key] ?? 0;

              return (
                <motion.div
                  key={key}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: colIndex * 0.03 + rowIndex * 0.01 }}
                  title={`${format(date, "MMM d, yyyy")} - ${value} review${value === 1 ? "" : "s"}`}
                  className={`h-3.5 w-3.5 rounded-sm ${getIntensityClass(value)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
