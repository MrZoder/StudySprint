/**
 * Toast store contract. Provider lives in ToastContext.tsx, consumer hook
 * lives in useToast.ts. Kept separate so the contract type can be imported
 * without dragging the JSX provider tree into pure utilities.
 */
import { createContext } from "react";

/** Semantic colour tone — drives both background tint and action button hue. */
export type ToastTone = "success" | "info" | "warning" | "destructive";

/** A single queued toast as held in provider state. */
export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number;
  action?: { label: string; onPress: () => void };
}

export type ShowToastInput = {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: { label: string; onPress: () => void };
};

export interface ToastContextValue {
  showToast: (input: ShowToastInput) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
