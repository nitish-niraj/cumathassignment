import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton-shimmer animate-pulse rounded-xl bg-zinc-800", className)} />;
}
