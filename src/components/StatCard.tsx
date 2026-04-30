/**
 * StatCard — KPI tile used on the Dashboard grid.
 * Five tones (blue/amber/rose/emerald/slate) keyed to the metric's mood.
 * The vertical accent rail is the only chromatic element so a row of cards
 * still reads as a unit; the value and label stay neutral.
 */
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

type StatTone = "blue" | "amber" | "rose" | "emerald" | "slate";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  hint?: string;
  tone?: StatTone;
}

const toneMap: Record<StatTone, { rail: string; icon: string; value: string }> = {
  blue: {
    rail: "from-blue-500/70 to-cyan-400/60 dark:from-blue-400/70 dark:to-cyan-300/60",
    icon: "text-blue-600 dark:text-blue-300",
    value: "text-slate-900 dark:text-white",
  },
  amber: {
    rail: "from-amber-500/75 to-orange-400/60 dark:from-amber-400/75 dark:to-orange-300/60",
    icon: "text-amber-600 dark:text-amber-300",
    value: "text-slate-900 dark:text-white",
  },
  rose: {
    rail: "from-rose-500/75 to-pink-400/55 dark:from-rose-400/75 dark:to-pink-300/55",
    icon: "text-rose-600 dark:text-rose-300",
    value: "text-slate-900 dark:text-white",
  },
  emerald: {
    rail: "from-emerald-500/75 to-teal-400/60 dark:from-emerald-400/75 dark:to-teal-300/60",
    icon: "text-emerald-600 dark:text-emerald-300",
    value: "text-slate-900 dark:text-white",
  },
  slate: {
    rail: "from-slate-400/50 to-slate-300/40 dark:from-slate-500/50 dark:to-slate-400/40",
    icon: "text-slate-600 dark:text-slate-300",
    value: "text-slate-900 dark:text-white",
  },
};

export default function StatCard({ title, value, icon, hint, tone = "blue" }: StatCardProps) {
  const t = toneMap[tone];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-3 transition-all duration-200",
        "shadow-[0_1px_2px_rgba(15,23,42,0.03),0_6px_16px_-14px_rgba(15,23,42,0.12)]",
        "hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_14px_28px_-18px_rgba(15,23,42,0.2)]",
        "dark:border-white/[0.06] dark:bg-white/[0.025] dark:shadow-[0_1px_2px_rgba(2,6,23,0.4),0_14px_28px_-20px_rgba(2,6,23,0.6)]",
        "dark:hover:border-white/[0.12] dark:hover:bg-white/[0.04]",
      )}
    >
      {/* Gradient accent rail */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-2 left-0 w-[2.5px] rounded-full bg-gradient-to-b",
          t.rail,
        )}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <span className={cn("inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0", t.icon)}>
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "mt-1 text-[26px] font-bold leading-none tabular-nums tracking-tight",
          t.value,
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}
