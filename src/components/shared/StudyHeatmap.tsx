"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";

type HeatmapData = {
  date: string; // yyyy-MM-dd
  count: number;
};

type StudyHeatmapProps = {
  data: HeatmapData[]; // expects 84 days (12 weeks)
};

export default function StudyHeatmap({ data }: StudyHeatmapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // We want to render a 7x12 grid (rows x cols)
  // Ensure the data is sorted chronologically
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Transform flat array into columns of 7 days
  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < sortedData.length; i += 7) {
      cols.push(sortedData.slice(i, i + 7));
    }
    return cols;
  }, [sortedData]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-[#1C1C1F] border-zinc-800/40";
    if (count <= 5) return "bg-violet-500/20 border-violet-500/10 text-violet-200";
    if (count <= 15) return "bg-violet-500/40 border-violet-500/20 text-violet-200";
    if (count <= 30) return "bg-violet-500/70 border-violet-500/40 text-violet-100";
    return "bg-violet-500 border-violet-400 text-white shadow-[0_0_8px_rgba(139,92,246,0.5)]";
  };

  const monthLabels = useMemo(() => {
    const labels: { label: string; colIndex: number }[] = [];
    let currentMonth = "";
    
    columns.forEach((col, idx) => {
      if (col.length > 0) {
        const month = format(new Date(col[0].date), "MMM");
        if (month !== currentMonth) {
          labels.push({ label: month, colIndex: idx });
          currentMonth = month;
        }
      }
    });
    
    return labels;
  }, [columns]);

  if (!mounted) {
    return (
      <div className="w-full overflow-x-auto pb-4">
        <div className="h-24 w-full animate-pulse rounded bg-zinc-800/30" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-max">
        {/* Months header */}
        <div className="flex w-full mb-2 ml-8 relative h-4">
          {monthLabels.map(({ label, colIndex }) => (
            <span 
              key={`${label}-${colIndex}`} 
              className="absolute text-[10px] uppercase font-medium tracking-wider text-zinc-500"
              style={{ left: `${colIndex * 16}px` }} // 12px box + 4px gap = 16
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          {/* Day labels (Mon, Wed, Fri) */}
          <div className="flex flex-col justify-between py-1 text-[10px] text-zinc-500 pr-1">
            <span></span>
            <span className="leading-none h-3">Mon</span>
            <span></span>
            <span className="leading-none h-3">Wed</span>
            <span></span>
            <span className="leading-none h-3">Fri</span>
            <span></span>
          </div>

          {/* Core Grid */}
          <div className="flex gap-1 items-start">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1">
                {col.map((day) => (
                  <div
                    key={day.date}
                    className={`group relative h-3 w-3 rounded-[3px] border transition-colors hover:border-zinc-400 ${getColor(day.count)}`}
                  >
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2.5 py-1.5 text-[11px] text-zinc-200 shadow-xl opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                      <p className="font-semibold">{day.count === 0 ? "No cards" : `${day.count} cards`} studied</p>
                      <p className="text-zinc-400">{format(new Date(day.date), "MMM d, yyyy")}</p>
                      {/* Triangle Pointer */}
                      <div className="absolute left-1/2 top-full -mt-0.5 -translate-x-1/2 border-[4px] border-transparent border-t-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-zinc-500 mr-2">
          <span>Less</span>
          <div className="flex gap-1">
             <div className="h-3 w-3 rounded-[3px] bg-[#1C1C1F] border border-zinc-800/40" />
             <div className="h-3 w-3 rounded-[3px] bg-violet-500/20" />
             <div className="h-3 w-3 rounded-[3px] bg-violet-500/40" />
             <div className="h-3 w-3 rounded-[3px] bg-violet-500/70" />
             <div className="h-3 w-3 rounded-[3px] bg-violet-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
