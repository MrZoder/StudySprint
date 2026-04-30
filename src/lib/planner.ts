/**
 * Pure planner helpers — derived state + relative-time formatting.
 * -----------------------------------------------------------------------------
 * These are the only functions that should know how progress / status / "due
 * soon" are computed. Importing them everywhere keeps the rules consistent
 * across Dashboard, Assignments, Calendar, and the notification popover.
 */
import { differenceInCalendarDays, isBefore, isToday } from "date-fns";
import type { Assignment, Status, Subtask } from "../types";

/** % complete = ratio of finished subtasks; 0 when there are no subtasks. */
export function calculateProgress(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0;
  const completed = subtasks.filter((task) => task.isCompleted).length;
  return Math.round((completed / subtasks.length) * 100);
}

/**
 * Map an assignment's current numbers to a Status enum value.
 * Order of checks matters: completion wins over overdue (a 100 %-done item
 * isn't "Overdue" even if its due date passed). Today's deadlines are *not*
 * yet overdue — the student still has the day.
 */
export function deriveStatus(assignment: Assignment): Status {
  if (assignment.progress >= 100) return "Completed";
  const due = new Date(assignment.dueDate);
  if (isBefore(due, new Date()) && !isToday(due)) return "Overdue";
  if (assignment.progress > 0) return "In Progress";
  return "Not Started";
}

/** True if the deadline lands within `daysAhead` calendar days from today. */
export function isDueSoon(dueDate: string, daysAhead = 3): boolean {
  const due = new Date(dueDate);
  const days = differenceInCalendarDays(due, new Date());
  return days >= 0 && days <= daysAhead;
}

/**
 * Human-friendly relative deadline label:
 *   - past  → "n days overdue"
 *   - 0     → "Due today"
 *   - 1     → "Due tomorrow"
 *   - n>1   → "n days left"
 */
export function formatDaysLeft(dueDate: string): string {
  const days = differenceInCalendarDays(new Date(dueDate), new Date());
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days left`;
}
