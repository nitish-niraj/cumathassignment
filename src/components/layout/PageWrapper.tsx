"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

export default function PageWrapper({ children, className }: PageWrapperProps) {
  return <div className={cn("space-y-8", className)}>{children}</div>;
}
