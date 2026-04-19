import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CalendarDays,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

interface ReminderPanelProps {
  dueSoonCount: number;
  overdueCount: number;
  dueThisWeekActiveCount: number;
  activeAssignmentCount: number;
  completedRatio: string;
  completionPercent: number;
  nextDeadlineLabel: string;
  focusLabel: string;
  proposalCaptureTint?: boolean;
  weekRangeLabel?: string;
}

function heroCopy(params: {
  overdueCount: number;
  dueSoonCount: number;
  dueThisWeekActiveCount: number;
  activeAssignmentCount: number;
  completionPercent: number;
}): { eyebrow: string; title: string; body: string; mood: "calm" | "focus" | "warn" | "alert" } {
  const { overdueCount, dueSoonCount, dueThisWeekActiveCount, activeAssignmentCount, completionPercent } = params;

  if (activeAssignmentCount === 0) {
    return {
      eyebrow: "All clear",
      title: "You’re caught up — or ready to plan.",
      body: "Add assignments when new work lands so deadlines never sneak up on you.",
      mood: "calm",
    };
  }
  if (overdueCount > 0) {
    return {
      eyebrow: "Today’s priority",
      title: "Overdue work needs the first slot.",
      body: `You have ${overdueCount} overdue assignment${overdueCount > 1 ? "s" : ""}. Finishing one now unlocks calmer days ahead.`,
      mood: "alert",
    };
  }
  if (dueSoonCount >= 4) {
    return {
      eyebrow: "Busy stretch",
      title: "Sequence small wins across the week.",
      body: `${dueSoonCount} assignments are due soon. Pick the smallest next step on each and chip away.`,
      mood: "warn",
    };
  }
  if (dueSoonCount > 0) {
    return {
      eyebrow: "Stay ahead",
      title: "A short focus block today beats a scramble later.",
      body: `${dueSoonCount} due soon — pick one, open it, and ship the first subtask.`,
      mood: "focus",
    };
  }
  if (dueThisWeekActiveCount > 0 && completionPercent >= 70) {
    return {
      eyebrow: "Strong momentum",
      title: "Protect the progress you’ve built.",
      body: `${dueThisWeekActiveCount} still on the calendar — one focused session keeps the week in your control.`,
      mood: "focus",
    };
  }
  if (completionPercent >= 85) {
    return {
      eyebrow: "Almost there",
      title: "Close the loop on this week’s tasks.",
      body: "Finish remaining subtasks while the context is fresh.",
      mood: "focus",
    };
  }
  return {
    eyebrow: "Steady rhythm",
    title: "Keep the pipeline clear.",
    body: `You have ${activeAssignmentCount} active assignment${activeAssignmentCount !== 1 ? "s" : ""}. Check the planner when you’re ready to load-balance the week.`,
    mood: "calm",
  };
}

const moodAccent: Record<
  "calm" | "focus" | "warn" | "alert",
  { ring: string; dot: string; text: string; eyebrow: string }
> = {
  calm: {
    ring: "ring-emerald-400/20",
    dot: "bg-emerald-400",
    text: "text-emerald-200",
    eyebrow: "text-emerald-300/90",
  },
  focus: {
    ring: "ring-blue-400/20",
    dot: "bg-blue-400",
    text: "text-blue-200",
    eyebrow: "text-blue-300/90",
  },
  warn: {
    ring: "ring-amber-400/25",
    dot: "bg-amber-400",
    text: "text-amber-200",
    eyebrow: "text-amber-300/90",
  },
  alert: {
    ring: "ring-rose-400/25",
    dot: "bg-rose-400",
    text: "text-rose-200",
    eyebrow: "text-rose-300/90",
  },
};

export default function ReminderPanel({
  dueSoonCount,
  overdueCount,
  dueThisWeekActiveCount,
  activeAssignmentCount,
  completedRatio,
  completionPercent,
  nextDeadlineLabel,
  focusLabel,
  proposalCaptureTint = false,
  weekRangeLabel,
}: ReminderPanelProps) {
  const { eyebrow, title: heroTitle, body: heroBody, mood } = heroCopy({
    overdueCount,
    dueSoonCount,
    dueThisWeekActiveCount,
    activeAssignmentCount,
    completionPercent,
  });
  const accent = moodAccent[mood];

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-28px_rgba(15,23,42,0.25)] sm:p-6",
        "dark:border-blue-950/55 dark:bg-gradient-to-br dark:from-[#050e22]/95 dark:via-[#060f25]/90 dark:to-[#07132b]/95 dark:shadow-[0_1px_2px_rgba(2,6,23,0.6),0_32px_72px_-28px_rgba(59,130,246,0.35)]",
        proposalCaptureTint &&
          "dark:from-[#052216]/90 dark:via-[#062f22]/85 dark:to-[#08332b]/90 dark:border-teal-900/55",
      )}
    >
      {/* ambient glows */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/15 via-cyan-400/10 to-transparent blur-3xl dark:from-blue-500/25 dark:via-cyan-500/15" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-400/10 via-fuchsia-400/5 to-transparent blur-3xl dark:from-indigo-500/20 dark:via-fuchsia-500/10" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent dark:via-blue-500/40" />

      <div className="relative grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:items-stretch">
        {/* ================= LEFT: Briefing ================= */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-slate-900/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 ring-1 ring-slate-200 backdrop-blur-sm dark:bg-white/5 dark:text-slate-200 dark:ring-white/10",
              )}
            >
              <span className={cn("size-1.5 rounded-full", accent.dot)} aria-hidden />
              <span className={cn("dark:", accent.eyebrow)}>{eyebrow}</span>
            </span>
            {weekRangeLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/[0.04] px-2.5 py-1 text-[10.5px] font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                <CalendarDays size={11} />
                {weekRangeLabel}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-[22px] font-bold tracking-tight text-slate-900 sm:text-[26px] dark:bg-gradient-to-br dark:from-white dark:via-slate-100 dark:to-blue-100 dark:bg-clip-text dark:text-transparent">
            {heroTitle}
          </h1>
          <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-300/90">
            {heroBody}
          </p>

          {/* Workload chips */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <WorkloadChip
              icon={<AlertTriangle size={12} />}
              label={`${overdueCount} overdue`}
              tone="rose"
              active={overdueCount > 0}
            />
            <WorkloadChip
              icon={<BellRing size={12} />}
              label={`${dueSoonCount} due soon`}
              tone="amber"
              active={dueSoonCount > 0}
            />
            <WorkloadChip
              icon={<CalendarClock size={12} />}
              label={`${dueThisWeekActiveCount} this week`}
              tone="blue"
              active={dueThisWeekActiveCount > 0}
            />
            <WorkloadChip
              icon={<TrendingUp size={12} />}
              label={`${completedRatio} done`}
              tone="emerald"
              active={completionPercent > 0}
            />
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              to="/assignments"
              className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_18px_-6px_rgba(14,165,233,0.45)] transition-all hover:shadow-[0_8px_24px_-6px_rgba(14,165,233,0.6)] hover:-translate-y-px active:translate-y-0"
            >
              <Plus size={14} />
              New assignment
            </Link>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
            >
              <CalendarDays size={14} />
              Open planner
            </Link>
            <Link
              to="/assignments"
              className="ml-auto hidden text-[12px] font-semibold text-blue-600 underline-offset-4 hover:underline sm:inline-flex dark:text-blue-300"
            >
              Jump to today’s work →
            </Link>
          </div>
        </div>

        {/* ================= RIGHT: Priority rail ================= */}
        <div
          className={cn(
            "relative flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-inner backdrop-blur-sm",
            "dark:border-white/10 dark:bg-white/[0.03]",
          )}
        >
          <div className="flex items-center gap-3">
            {/* Completion ring */}
            <div
              className="relative h-14 w-14 shrink-0 rounded-full p-[3px]"
              style={{
                background: `conic-gradient(#22d3ee ${completionPercent}%, rgba(148,163,184,0.18) ${completionPercent}% 100%)`,
              }}
              aria-label={`Weekly completion ${completionPercent}%`}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-700 dark:bg-[#081022] dark:text-slate-100">
                <span className="text-[13px] leading-none tabular-nums">{completionPercent}%</span>
                <span className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-400">
                  done
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Weekly completion
              </p>
              <p className="mt-0.5 truncate text-[13px] font-semibold text-slate-800 dark:text-white">
                {completedRatio}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {completionPercent >= 85
                  ? "Nearly there — keep the streak."
                  : completionPercent >= 50
                    ? "Halfway — one more push."
                    : completionPercent > 0
                      ? "Momentum is building."
                      : "Start with one small subtask."}
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

          <RailRow
            icon={<CalendarClock size={13} />}
            label="Next deadline"
            value={nextDeadlineLabel}
            iconTone="text-blue-500 dark:text-blue-300"
          />
          <RailRow
            icon={<Target size={13} />}
            label="Focus today"
            value={focusLabel}
            iconTone="text-cyan-500 dark:text-cyan-300"
            highlight
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------- Sub-parts -------------------- */

type ChipTone = "rose" | "amber" | "blue" | "emerald";

const chipToneMap: Record<ChipTone, { active: string; muted: string }> = {
  rose: {
    active:
      "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/55",
    muted:
      "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/10",
  },
  amber: {
    active:
      "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/50",
    muted:
      "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/10",
  },
  blue: {
    active:
      "bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-950/45 dark:text-blue-200 dark:ring-blue-900/55",
    muted:
      "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/10",
  },
  emerald: {
    active:
      "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/50",
    muted:
      "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/10",
  },
};

function WorkloadChip({
  icon,
  label,
  tone,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  tone: ChipTone;
  active: boolean;
}) {
  const classes = chipToneMap[tone][active ? "active" : "muted"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        classes,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function RailRow({
  icon,
  label,
  value,
  iconTone,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconTone: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 flex items-start gap-1.5 text-[12.5px] font-semibold leading-snug text-slate-900 dark:text-white",
          highlight && "dark:text-cyan-100",
        )}
      >
        <span className={cn("mt-0.5 shrink-0", iconTone)}>{icon}</span>
        <span className="min-w-0 break-words">{value}</span>
      </p>
    </div>
  );
}
