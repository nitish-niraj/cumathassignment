export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-violet-500/20" />
        <div className="absolute inset-0 animate-ping rounded-2xl bg-violet-500/10" />
        {/* Core shape */}
        <div className="relative h-8 w-8 animate-pulse rounded-lg bg-violet-500/40" />
      </div>
      <p className="text-sm font-medium tracking-widest text-zinc-500 uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
}
