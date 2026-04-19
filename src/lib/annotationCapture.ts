/**
 * Proposal screenshot mode: inset outlines (no ring-offset gaps / double lines).
 *
 * REVERT AFTER SCREENSHOTS:
 * 1. Set ANNOTATION_CAPTURE_MODE to false (or delete this file and all imports).
 * 2. Remove annotation-related code from Dashboard, Assignments, Subjects, Sidebar, AssignmentCard.
 */
export const ANNOTATION_CAPTURE_MODE = false;

/**
 * Inset 2px frame — stays inside the element, reads clearly on screenshots without overlapping neighbours.
 */
const inset = {
  teal:
    'rounded-2xl shadow-[inset_0_0_0_2px_rgb(13_148_136_/_0.55)] dark:shadow-[inset_0_0_0_2px_rgb(45_212_191_/_0.42)]',
  amber:
    'rounded-2xl shadow-[inset_0_0_0_2px_rgb(217_119_6_/_0.55)] dark:shadow-[inset_0_0_0_2px_rgb(251_191_36_/_0.38)]',
  blue:
    'rounded-2xl shadow-[inset_0_0_0_2px_rgb(59_130_246_/_0.55)] dark:shadow-[inset_0_0_0_2px_rgb(96_165_250_/_0.42)]',
  rose:
    'rounded-2xl shadow-[inset_0_0_0_2px_rgb(244_63_94_/_0.5)] dark:shadow-[inset_0_0_0_2px_rgb(251_113_133_/_0.4)]',
  green:
    'rounded-xl shadow-[inset_0_0_0_2px_rgb(16_185_129_/_0.55)] dark:shadow-[inset_0_0_0_2px_rgb(52_211_153_/_0.38)]',
  indigo:
    'rounded-xl shadow-[inset_0_0_0_2px_rgb(99_102_241_/_0.55)] dark:shadow-[inset_0_0_0_2px_rgb(129_140_248_/_0.45)]',
  violet:
    'rounded-xl shadow-[inset_0_0_0_2px_rgb(139_92_246_/_0.5)] dark:shadow-[inset_0_0_0_2px_rgb(167_139_250_/_0.38)]',
  /** Sidebar — full height */
  navInset:
    'shadow-[inset_0_0_0_2px_rgb(249_115_22_/_0.45)] dark:shadow-[inset_0_0_0_2px_rgb(251_146_60_/_0.35)]',
} as const;

export type AnnotationRing = keyof typeof inset;

export function annotate(zone: AnnotationRing): string {
  if (!ANNOTATION_CAPTURE_MODE) return '';
  return inset[zone];
}

/** First assignment card: outer frame only (inner zones use soft fills in AssignmentCard). */
export function captureCardFrame(): string {
  if (!ANNOTATION_CAPTURE_MODE) return '';
  return 'rounded-xl shadow-[inset_0_0_0_2px_rgb(99_102_241_/_0.55)] dark:shadow-[inset_0_0_0_2px_rgb(129_140_248_/_0.45)]';
}

/** Progress row — tint only, no second outline */
export function captureProgressFill(): string {
  if (!ANNOTATION_CAPTURE_MODE) return '';
  return 'rounded-md bg-emerald-500/[0.08] dark:bg-emerald-400/[0.09] px-2 py-1.5 -mx-0.5';
}

/** Subtasks block — tint only */
export function captureSubtasksFill(): string {
  if (!ANNOTATION_CAPTURE_MODE) return '';
  return 'rounded-md bg-rose-500/[0.07] dark:bg-rose-400/[0.08] px-2 py-1.5 -mx-0.5';
}
