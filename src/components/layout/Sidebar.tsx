"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, LayoutDashboard, Layers, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/decks", label: "Decks", icon: Layers },
  { href: "/stats", label: "Stats", icon: BarChart3 },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const fetchDueCount = async () => {
      try {
        const response = await fetch("/api/stats/due-count", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const data: { count: number } = await response.json();
        setDueCount(data.count);
      } catch {
        setDueCount(0);
      }
    };

    fetchDueCount();
  }, [pathname]);

  const activePath = useMemo(() => {
    if (pathname.startsWith("/decks/")) {
      return "/decks";
    }

    return pathname;
  }, [pathname]);

  return (
    <aside className="fixed bottom-0 left-0 z-40 flex w-full flex-row border-t border-zinc-800 bg-zinc-950 px-2 py-2 lg:top-0 lg:h-screen lg:w-64 lg:flex-col lg:border-r lg:border-t-0 lg:px-4 lg:py-6">
      <div className="hidden lg:block">
        <p className="text-xl font-bold tracking-tight text-zinc-100">Recall</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500">remember everything</p>
      </div>

      <nav className="flex w-full justify-around lg:mt-8 lg:flex-col lg:justify-start lg:space-y-1">
        {items.map((item) => {
          const isActive = activePath === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200",
                isActive && "text-zinc-100",
              )}
            >
              {isActive ? (
                <div className="absolute inset-0 -z-10 rounded-xl bg-zinc-800/80" />
              ) : null}
              <Icon className="h-5 w-5 lg:h-4 lg:w-4" />
              <span className="hidden text-xs lg:inline lg:text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden mt-auto rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur-xl lg:block">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Due Today</p>
        <p
          className={`mt-2 text-3xl font-semibold tracking-tight text-zinc-100 ${
            dueCount > 0 ? "animate-pulse" : ""
          }`}
        >
          {dueCount}
        </p>
        <p className="mt-1 text-xs text-zinc-500">cards waiting for review</p>
      </div>
    </aside>
  );
}
