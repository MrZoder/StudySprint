/**
 * EmptyState — minimal "nothing to show" placeholder.
 * Dashed-border card with optional icon. Used inside lists/tables where the
 * surrounding chrome already provides framing, so this stays deliberately quiet.
 */
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  message: string;
  className?: string;
  icon?: ReactNode;
}

export default function EmptyState({ message, className, icon }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400",
        className,
      )}
    >
      <div className="inline-flex items-center gap-2">
        {icon}
        <span>{message}</span>
      </div>
    </div>
  );
}
