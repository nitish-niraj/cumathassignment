"use client";

import { type DragEvent, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type DropZoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DropZone({ file, onFileChange }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (incoming: File | null) => {
    if (!incoming) {
      onFileChange(null);
      return;
    }

    if (incoming.type !== "application/pdf") {
      return;
    }

    onFileChange(incoming);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const nextFile = event.dataTransfer.files?.[0] ?? null;
    handleSelect(nextFile);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-70 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-violet-500/50 bg-violet-500/5"
            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600"
        }`}
      >
        <UploadCloud className="h-12 w-12 text-zinc-500" />
        <p className="mt-4 text-lg text-zinc-300">Drop your PDF here</p>
        <p className="mt-1 text-sm text-zinc-500">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            handleSelect(nextFile);
          }}
        />
      </div>

      {file ? (
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2">
          <div>
            <p className="text-sm text-zinc-200">{file.name}</p>
            <p className="text-xs text-zinc-500">{formatSize(file.size)}</p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-200"
            onClick={(event) => {
              event.stopPropagation();
              onFileChange(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
