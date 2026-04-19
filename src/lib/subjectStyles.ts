import type { Subject } from "../types";

type SubjectTheme = {
  dot: string;
  badge: string;
  calendar: string;
};

const SUBJECT_THEME_BY_CODE: Record<string, SubjectTheme> = {
  CS301: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    calendar: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300",
  },
  CS201: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    calendar: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300",
  },
  CS305: {
    dot: "bg-teal-500",
    badge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900",
    calendar: "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/40 dark:border-teal-900 dark:text-teal-300",
  },
  ENG202: {
    dot: "bg-cyan-500",
    badge:
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900",
    calendar:
      "bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-950/40 dark:border-cyan-900 dark:text-cyan-300",
  },
};

const DEFAULT_THEME: SubjectTheme = {
  dot: "bg-blue-500",
  badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  calendar: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300",
};

export function getSubjectTheme(subject?: Subject): SubjectTheme {
  if (!subject) return DEFAULT_THEME;
  const fromCode = SUBJECT_THEME_BY_CODE[subject.code.toUpperCase()];
  if (fromCode) return fromCode;
  if (subject.color.includes("amber")) return SUBJECT_THEME_BY_CODE.CS201;
  if (subject.color.includes("teal")) return SUBJECT_THEME_BY_CODE.CS305;
  if (subject.color.includes("purple") || subject.color.includes("cyan")) return SUBJECT_THEME_BY_CODE.ENG202;
  if (subject.color.includes("blue")) return SUBJECT_THEME_BY_CODE.CS301;
  return DEFAULT_THEME;
}
