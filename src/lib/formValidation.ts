import type { Assignment, Subject } from "../types";

/** True when trim is empty (blocks whitespace-only “names”). */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function subjectCodeTaken(
  subjects: Subject[],
  code: string,
  excludeSubjectId?: string | null,
): boolean {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return false;
  return subjects.some(
    (s) => s.id !== excludeSubjectId && s.code.trim().toUpperCase() === normalized,
  );
}

/** HTML date input value `yyyy-mm-dd` → local Date at noon (avoids TZ edge cases). */
export function parseHtmlDateValue(value: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isHtmlDateInPast(value: string): boolean {
  const parsed = parseHtmlDateValue(value);
  if (!parsed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cmp = new Date(parsed);
  cmp.setHours(0, 0, 0, 0);
  return cmp < today;
}

export function assignmentTitleTaken(
  assignments: Assignment[],
  subjectId: string,
  title: string,
  excludeAssignmentId?: string,
): boolean {
  if (!subjectId || isBlank(title)) return false;
  const t = title.trim().toLowerCase();
  return assignments.some(
    (a) =>
      a.id !== excludeAssignmentId &&
      a.subjectId === subjectId &&
      a.title.trim().toLowerCase() === t,
  );
}
