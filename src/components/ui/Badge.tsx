/**
 * Badge — neutral pill primitive.
 * Just the shape and base typography; callers pass colour utilities via
 * `className`. Intentionally unstyled by tone so each surface picks its own.
 */
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
      {children}
    </span>
  );
}
