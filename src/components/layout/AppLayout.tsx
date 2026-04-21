"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ToastProvider from "@/components/ui/ToastProvider";
import CommandPalette from "@/components/ui/CommandPalette";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const isStudyRoute = /^\/decks\/[^/]+\/study$/.test(pathname);

  if (isStudyRoute) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {children}
        <ToastProvider />
        <CommandPalette />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="ml-0 pb-20 lg:ml-64 lg:pb-0 min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 px-5 pb-10 pt-5 sm:px-6 lg:px-8">{children}</main>
      </div>
      <ToastProvider />
      <CommandPalette />
    </div>
  );
}
