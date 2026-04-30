/** Hook for showing/dismissing toasts. Must be used inside ToastProvider. */
import { useContext } from "react";
import { ToastContext } from "./toastStoreContext";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
