import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";
import { ToastContext, type ToastItem, type ToastTone } from "./toastStoreContext";

const toneStyles: Record<ToastTone, string> = {
  success:
    "border-emerald-200/90 bg-white text-emerald-900 shadow-md dark:border-emerald-900/60 dark:bg-gray-900 dark:text-emerald-200",
  info: "border-blue-200/90 bg-white text-blue-900 shadow-md dark:border-blue-900/60 dark:bg-gray-900 dark:text-blue-200",
  warning:
    "border-amber-200/90 bg-white text-amber-950 shadow-md dark:border-amber-900/50 dark:bg-gray-900 dark:text-amber-200",
  destructive:
    "border-rose-200/90 bg-white text-rose-950 shadow-md dark:border-rose-900/60 dark:bg-gray-900 dark:text-rose-200",
};

function ToastBar({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex max-w-sm animate-in slide-in-from-bottom-3 fade-in zoom-in-95 flex-col gap-2 rounded-xl border px-3.5 py-3 text-sm duration-200 sm:flex-row sm:items-center",
        toneStyles[item.tone],
      )}
    >
      <p className="min-w-0 flex-1 leading-snug">{item.message}</p>
      <div className="flex shrink-0 items-center gap-2 sm:justify-end">
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onPress();
              onDismiss();
            }}
            className={cn(
              "min-h-10 rounded-lg px-3 py-2 text-xs font-semibold underline-offset-2 hover:underline sm:min-h-0 sm:px-2 sm:py-1.5",
              item.tone === "destructive"
                ? "text-rose-700 dark:text-rose-300"
                : "text-blue-700 dark:text-blue-300",
            )}
          >
            {item.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-800 dark:hover:bg-white/10 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t !== undefined) {
      window.clearTimeout(t);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (input: {
      message: string;
      tone?: ToastTone;
      durationMs?: number;
      action?: { label: string; onPress: () => void };
    }) => {
      const id = crypto.randomUUID();
      const durationMs = input.durationMs ?? 4200;
      const item: ToastItem = {
        id,
        message: input.message,
        tone: input.tone ?? "info",
        durationMs,
        action: input.action,
      };
      setToasts((prev) => [...prev, item]);
      const timer = window.setTimeout(() => dismissToast(id), durationMs);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const timerMap = timersRef.current;
    return () => {
      timerMap.forEach((t) => window.clearTimeout(t));
      timerMap.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col-reverse items-stretch gap-2 px-3 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:items-end sm:px-4 sm:pb-6 lg:pb-8"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastBar key={item.id} item={item} onDismiss={() => dismissToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
