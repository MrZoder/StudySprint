import { Link } from "react-router-dom";
import { CalendarClock, Clock } from "lucide-react";
import type { Assignment, Subject } from "../types";
import { cn } from "../lib/utils";
import { getSubjectTheme } from "../lib/subjectStyles";
import { formatDaysLeft } from "../lib/planner";

const priorityDot: Record<Assignment["priority"], string> = {
  Low: "bg-slate-300 dark:bg-slate-600",
  Medium: "bg-blue-400 dark:bg-blue-500",
  High: "bg-amber-500 dark:bg-amber-400",
  Urgent: "bg-rose-500 dark:bg-rose-400",
};

const priorityRing: Record<Assignment["priority"], string> = {
  Low: "",
  Medium: "",
  High: "",
  Urgent:
    "ring-1 ring-rose-200/70 dark:ring-rose-900/40",
};

interface PlannerAssignmentChipProps {
  assignment: Assignment;
  subject?: Subject;
  onReschedule?: (assignment: Assignment) => void;
}

export default function PlannerAssignmentChip({
  assignment,
  subject,
  onReschedule,
}: PlannerAssignmentChipProps) {
  const theme = getSubjectTheme(subject);
  const isOverdue = assignment.status === "Overdue";
  const isCompleted = assignment.status === "Completed";
  const dueHint = formatDaysLeft(assignment.dueDate);
  const progress = Math.max(0, Math.min(100, assignment.progress));

  return (
    <div
      className={cn(
        "group/chip relative overflow-hidden rounded-lg border border-slate-200/90 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 dark:border-slate-800/90 dark:bg-[#060e1e]/90",
        "hover:-translate-y-px hover:border-blue-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_22px_-18px_rgba(59,130,246,0.3)] dark:hover:border-blue-900/70",
        priorityRing[assignment.priority],
        isOverdue &&
          "border-rose-200/90 ring-1 ring-rose-200/60 dark:border-rose-900/50 dark:ring-rose-900/40",
        isCompleted && "opacity-75",
      )}
    >
      <div
        className={cn("absolute inset-y-0 left-0 w-[3px]", theme.dot)}
        aria-hidden
      />
      <div className="flex items-start gap-0">
        <Link
          to={`/assignments/${assignment.id}`}
          className="min-w-0 flex-1 px-2 pl-2.5 py-1.5"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={cn("size-1.5 shrink-0 rounded-full", priorityDot[assignment.priority])}
              aria-hidden
            />
            <p
              className={cn(
                "truncate text-[12.5px] font-semibold leading-snug text-slate-900 dark:text-slate-100",
                isCompleted && "line-through text-slate-500 dark:text-slate-500",
              )}
            >
              {assignment.title}
            </p>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] leading-tight">
            {subject && (
              <span className="truncate font-medium text-slate-500 dark:text-slate-400">
                {subject.code}
              </span>
            )}
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular-nums",
                isOverdue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              <Clock size={9} className="shrink-0" />
              {dueHint}
            </span>
          </div>
          {progress > 0 && !isCompleted && (
            <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isOverdue
                    ? "bg-rose-500/80"
                    : "bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-300",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </Link>
        {onReschedule && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReschedule(assignment);
            }}
            className={cn(
              "flex shrink-0 items-center justify-center self-stretch border-l border-slate-100 px-1.5 text-slate-400 transition-colors",
              "hover:bg-slate-50 hover:text-blue-600 dark:border-slate-800/80 dark:hover:bg-slate-800/80 dark:hover:text-blue-400",
              "min-h-[44px] min-w-[32px] sm:opacity-0 sm:group-hover/chip:opacity-100",
            )}
            title="Reschedule due date"
            aria-label={`Reschedule ${assignment.title}`}
          >
            <CalendarClock size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
