/**
 * NotificationsPopover
 * -----------------------------------------------------------------------------
 * Anchored panel that opens from the topbar bell. Surfaces the two notification
 * states students actually need to act on:
 *
 *   - Overdue assignments (status === "Overdue" OR dueDate is in the past
 *     and the work isn't already complete)
 *   - Due soon — anything not complete with a deadline in the next 7 days
 *
 * Each row shows the subject's colour dot, title, relative deadline, and
 * priority. Clicking a row navigates to /assignments, closes the popover, and
 * (when supported) drops a hash so the assignment can be scrolled into view.
 *
 * The popover itself is presentation-only; positioning, open/close, and
 * outside-click handling live in DashboardLayout where the anchor button is.
 */

import { forwardRef, useMemo, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { differenceInCalendarDays, isPast } from "date-fns";
import type { Assignment, Subject } from "../types";
import { formatDaysLeft } from "../lib/planner";
import { cn } from "../lib/utils";

export interface NotificationsAnchorRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface NotificationsPopoverProps {
  assignments: Assignment[];
  subjects: Subject[];
  anchorRect: NotificationsAnchorRect | null;
  onClose: () => void;
}

interface NotificationItem {
  assignment: Assignment;
  subject?: Subject;
  daysLeft: number;
  isOverdue: boolean;
}

const PRIORITY_TINT: Record<Assignment["priority"], string> = {
  Low: "text-slate-500 dark:text-slate-400",
  Medium: "text-blue-600 dark:text-blue-300",
  High: "text-amber-600 dark:text-amber-300",
  Urgent: "text-rose-600 dark:text-rose-300",
};

const NotificationsPopover = forwardRef<HTMLDivElement, NotificationsPopoverProps>(function NotificationsPopover(
  { assignments, subjects, anchorRect, onClose },
  ref,
) {
  const navigate = useNavigate();

  // Bucket every active assignment into one of two categories used by the
  // popover sections:
  //   - overdue : flagged Overdue OR past-due with a negative day-delta.
  //               The status check matters because deriveStatus treats a
  //               same-day deadline as still-on-time, but we still want to
  //               surface it in the "Due soon" group below.
  //   - dueSoon : not overdue and within seven calendar days.
  // Each group is then sorted earliest-first so the most urgent surface at
  // the top of its section. Completed work is skipped entirely.
  const { overdue, dueSoon, totalCount } = useMemo(() => {
    const now = new Date();
    const overdue: NotificationItem[] = [];
    const dueSoon: NotificationItem[] = [];

    for (const assignment of assignments) {
      if (assignment.status === "Completed") continue;
      const due = new Date(assignment.dueDate);
      if (Number.isNaN(due.getTime())) continue;

      const days = differenceInCalendarDays(due, now);
      const isOverdue = assignment.status === "Overdue" || (isPast(due) && days < 0);
      const subject = subjects.find((s) => s.id === assignment.subjectId);
      const item: NotificationItem = {
        assignment,
        subject,
        daysLeft: days,
        isOverdue,
      };

      if (isOverdue) {
        overdue.push(item);
      } else if (days <= 7) {
        dueSoon.push(item);
      }
    }

    overdue.sort(
      (a, b) => +new Date(a.assignment.dueDate) - +new Date(b.assignment.dueDate),
    );
    dueSoon.sort(
      (a, b) => +new Date(a.assignment.dueDate) - +new Date(b.assignment.dueDate),
    );

    return { overdue, dueSoon, totalCount: overdue.length + dueSoon.length };
  }, [assignments, subjects]);

  /**
   * Close the popover and deep-link into /assignments with the row's id in
   * the hash. The Assignments page reads `location.hash` and scrolls the
   * matching card into view with a brief highlight ring.
   */
  function goToAssignment(id: string) {
    onClose();
    navigate(`/assignments#assignment-${id}`);
  }

  const isEmpty = totalCount === 0;

  // Positioned with `position: fixed` and rendered through a portal at the
  // body root so the popover escapes every ancestor stacking context (header,
  // sidebar wrappers, page-level cards). Without this, content inside <main>
  // can paint on top of the popover regardless of its z-index.
  const positionStyle: CSSProperties = anchorRect
    ? {
        // Anchor below the bell with an 8 px gap.
        top: anchorRect.bottom + 8,
        // Right-align with the bell button.
        right: Math.max(8, window.innerWidth - anchorRect.right),
      }
    : { top: 0, right: 0, visibility: "hidden" };

  const node = (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notifications"
      style={positionStyle}
      className={cn(
        "fixed z-[100] w-[min(22rem,calc(100vw-1rem))] origin-top-right",
        "rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_-12px_rgba(15,23,42,0.25)]",
        "ring-1 ring-slate-900/[0.04]",
        "dark:border-slate-800 dark:bg-[#0a1020] dark:shadow-[0_24px_60px_-16px_rgba(2,6,23,0.7)] dark:ring-white/[0.04]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-violet-100/80 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <BellRing size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
              Notifications
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEmpty
                ? "Everything in your control."
                : `${totalCount} item${totalCount === 1 ? "" : "s"} need attention`}
            </p>
          </div>
        </div>
        {!isEmpty && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/55">
            {totalCount}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[26rem] overflow-y-auto overscroll-contain">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {overdue.length > 0 && (
              <Section
                eyebrow="Overdue"
                tone="rose"
                icon={<AlertTriangle size={11} />}
              >
                {overdue.map((item) => (
                  <NotificationRow
                    key={item.assignment.id}
                    item={item}
                    onClick={() => goToAssignment(item.assignment.id)}
                  />
                ))}
              </Section>
            )}
            {dueSoon.length > 0 && (
              <Section
                eyebrow="Coming up"
                tone="amber"
                icon={<CalendarClock size={11} />}
              >
                {dueSoon.map((item) => (
                  <NotificationRow
                    key={item.assignment.id}
                    item={item}
                    onClick={() => goToAssignment(item.assignment.id)}
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <button
        type="button"
        onClick={() => {
          onClose();
          navigate("/assignments");
        }}
        className="flex w-full items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800/80 dark:text-slate-200 dark:hover:bg-white/[0.04]"
      >
        <span>View all assignments</span>
        <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
      </button>
    </div>
  );

  return createPortal(node, document.body);
});

export default NotificationsPopover;

/* -------------------------- Section + Row -------------------------- */

type Tone = "rose" | "amber";

const sectionEyebrow: Record<Tone, string> = {
  rose: "text-rose-600 dark:text-rose-300",
  amber: "text-amber-700 dark:text-amber-300",
};

function Section({
  eyebrow,
  tone,
  icon,
  children,
}: {
  eyebrow: string;
  tone: Tone;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="px-2 py-2">
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em]",
          sectionEyebrow[tone],
        )}
      >
        {icon}
        {eyebrow}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function NotificationRow({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: () => void;
}) {
  const { assignment, subject, isOverdue } = item;
  const dueLabel = formatDaysLeft(assignment.dueDate);

  // Subject.color is a Tailwind utility like `bg-blue-500`. Strip the prefix so
  // we can render it as a thin vertical accent rather than as a tile.
  const subjectColor = subject?.color ?? "bg-slate-400";

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
          "hover:bg-slate-50 dark:hover:bg-white/[0.04]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
        )}
      >
        <span
          aria-hidden
          className={cn("mt-1 h-7 w-1 shrink-0 rounded-full", subjectColor)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
              {assignment.title}
            </p>
            <span
              className={cn(
                "shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]",
                PRIORITY_TINT[assignment.priority],
              )}
            >
              {assignment.priority}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-slate-500 dark:text-slate-400">
            {subject?.code && (
              <>
                <span className="truncate">{subject.code}</span>
                <span aria-hidden className="text-slate-300 dark:text-slate-600">
                  ·
                </span>
              </>
            )}
            <span
              className={cn(
                "font-medium",
                isOverdue
                  ? "text-rose-600 dark:text-rose-300"
                  : "text-slate-600 dark:text-slate-300",
              )}
            >
              {dueLabel}
            </span>
          </p>
        </div>
      </button>
    </li>
  );
}

/* ---------------------------- Empty state ---------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50">
        <CheckCircle2 size={18} />
      </span>
      <p className="mt-3 text-[13px] font-semibold text-slate-900 dark:text-white">
        You're all caught up
      </p>
      <p className="mt-1 max-w-[14rem] text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
        Nothing overdue, nothing due in the next week. Add new assignments before
        deadlines find you.
      </p>
    </div>
  );
}
