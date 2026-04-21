"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service here
    console.error(error);
  }, [error]);

  return (
    <PageWrapper>
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-100">
            Something went wrong!
          </h2>
          <p className="mb-8 text-sm text-zinc-400">
            An unexpected error occurred while trying to render this section. 
            Our systems have logged the issue.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-8 text-sm font-medium text-white transition hover:bg-violet-500 active:scale-95"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
