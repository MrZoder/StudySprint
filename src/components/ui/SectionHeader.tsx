/**
 * SectionHeader — large page-level header with optional description + actions.
 * Responsive: stacks vertically on narrow screens, splits left/right on sm+.
 * Used at the top of Subjects, Settings, etc. for consistent typography.
 */
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:items-center">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:bg-gradient-to-r dark:from-slate-100 dark:via-blue-100 dark:to-slate-200 dark:bg-clip-text dark:text-transparent">{title}</h1>
        {description && (
          <p className="mt-1 text-pretty text-gray-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&_a]:w-full sm:[&_a]:w-auto [&_a_button]:w-full sm:[&_a_button]:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
