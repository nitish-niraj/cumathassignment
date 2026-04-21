"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToast, type ToastType } from "@/lib/store/useToast";

const toastConfig: Record<
  ToastType,
  { icon: React.ElementType; containerClass: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    containerClass: "border-emerald-500/30 bg-emerald-500/10",
    iconClass: "text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    containerClass: "border-red-500/30 bg-red-500/10",
    iconClass: "text-red-400",
  },
  info: {
    icon: Info,
    containerClass: "border-violet-500/30 bg-violet-500/10",
    iconClass: "text-violet-400",
  },
};

export default function ToastProvider() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 backdrop-blur-md shadow-lg ${config.containerClass}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClass}`} />
              <p className="flex-1 text-sm font-medium text-zinc-100">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
