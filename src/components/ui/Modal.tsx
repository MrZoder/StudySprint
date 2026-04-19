import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Modal({ isOpen, title, onClose, children, className }: ModalProps) {
  if (!isOpen) return null;

  // Prevent background scroll while modal open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-gray-950/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className={cn(
          "relative z-[201] flex max-h-[min(92dvh,100%)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.55)] dark:border-gray-800 dark:bg-gray-900 sm:max-h-[min(88vh,720px)] sm:rounded-2xl",
          "pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-1",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 pb-3 pt-4 dark:border-gray-800 sm:px-6">
          <h2
            id="modal-title"
            className="min-w-0 flex-1 text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-4 sm:px-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
