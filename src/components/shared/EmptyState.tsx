import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function EmptyState({ icon: Icon, title, description, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-10 text-center backdrop-blur-xl">
      <Icon className="mx-auto h-16 w-16 text-zinc-700" />
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
      {ctaHref && ctaLabel ? (
        <Button asChild className="mt-6">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
