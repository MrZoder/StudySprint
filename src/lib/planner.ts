import { differenceInCalendarDays, isBefore, isToday } from "date-fns";
import type { Assignment, Status, Subtask } from "../types";

export function calculateProgress(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0;
  const completed = subtasks.filter((task) => task.isCompleted).length;
  return Math.round((completed / subtasks.length) * 100);
}

export function deriveStatus(assignment: Assignment): Status {
  if (assignment.progress >= 100) return "Completed";
  const due = new Date(assignment.dueDate);
  if (isBefore(due, new Date()) && !isToday(due)) return "Overdue";
  if (assignment.progress > 0) return "In Progress";
  return "Not Started";
}

export function isDueSoon(dueDate: string, daysAhead = 3): boolean {
  const due = new Date(dueDate);
  const days = differenceInCalendarDays(due, new Date());
  return days >= 0 && days <= daysAhead;
}

export function formatDaysLeft(dueDate: string): string {
  const days = differenceInCalendarDays(new Date(dueDate), new Date());
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days left`;
}
