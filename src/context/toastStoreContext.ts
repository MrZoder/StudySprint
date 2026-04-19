import { createContext } from "react";

export type ToastTone = "success" | "info" | "warning" | "destructive";

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
