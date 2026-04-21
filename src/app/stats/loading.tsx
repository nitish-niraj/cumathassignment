import Skeleton from "@/components/shared/Skeleton";

export default function LoadingStatsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-52 rounded-xl" />
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-44 rounded-lg" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </div>
  );
}
