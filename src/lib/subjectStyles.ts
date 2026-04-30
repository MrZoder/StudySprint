/**
 * Subject visual themes.
 * -----------------------------------------------------------------------------
 * Maps a Subject onto a coordinated set of Tailwind classes for each surface
 * it appears on (calendar tiles, sidebar dots, badges). The seeded subjects
 * (CS301 / CS201 / CS305 / ENG202) get curated palettes by code so they
 * always look identical across the app; user-defined subjects fall back to a
 * fuzzy match against `subject.color` so they still pick up a sensible
 * palette without needing to be in the lookup table.
 */
import type { Subject } from "../types";

/** Three correlated class strings — same hue applied at three intensities. */
type SubjectTheme = {
  /** Tiny coloured dot used in lists and the sidebar. */
  dot: string;
  /** Pill / badge styling for subject pills. */
  badge: string;
  /** Calendar event tile styling. */
  calendar: string;
};

/** Hand-tuned palette per seeded subject code so they stay on-brand. */
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

/**
 * Resolve a subject to its theme. Lookup priority:
 *   1. Exact match on `subject.code` (covers seeded subjects).
 *   2. Fuzzy match on `subject.color` (Tailwind utility) so user-created
 *      subjects with a "bg-amber-500" colour still get the amber palette.
 *   3. Falls back to the blue default if nothing matches.
 */
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
