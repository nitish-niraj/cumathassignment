"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

function getTitle(pathname: string) {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/decks/")) return "Decks";
  if (pathname === "/decks") return "Decks";
  if (pathname === "/upload") return "Upload";
  if (pathname === "/stats") return "Stats";

  return "Recall";
}

export default function TopBar() {
  const pathname = usePathname();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    );
  }, []);

  const title = useMemo(() => getTitle(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">{title}</h1>
        <p className="text-sm text-zinc-400">{today}</p>
      </div>
    </header>
  );
}
