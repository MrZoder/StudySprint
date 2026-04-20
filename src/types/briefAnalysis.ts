/**
 * Shared brief-analysis types
 * -----------------------------------------------------------------------------
 * These types describe the structured output StudySprint's AI Planner produces
 * for any assignment brief, whether the planner is powered by the server-side
 * LLM or the offline heuristic fallback.
 *
 * Keeping the types in a neutral, dependency-free module means the same shape
 * is safe to import from:
 *   - the browser UI (React components)
 *   - the server-side Vite plugin / Node handler
 *   - the on-device heuristic fallback
 *
 * Do not add runtime imports (date-fns, lucide, etc) to this file — just types.
 */

export type DeliverableType =
  | "report"
  | "essay"
  | "presentation"
  | "research"
  | "code"
  | "analysis"
  | "reflection"
  | "quiz"
  | "group"
  | "other";

export interface Deliverable {
  /** Canonical type — used for icon mapping and stage selection. */
  type: DeliverableType;
  /** Student-friendly label such as "Written report" or "Presentation / slides". */
  label: string;
  /** Optional extra detail surfaced under the label. */
  detail?: string;
}

export type RequirementIcon =
  | "wordCount"
  | "references"
  | "format"
  | "group"
  | "submission"
  | "rubric"
  | "topic";

export interface Requirement {
  icon: RequirementIcon;
  label: string;
  detail?: string;
}

/** A single criterion the brief / rubric implies will be marked. */
export interface RubricSignal {
  /** E.g. "Analysis", "Argument", "Presentation". */
  criterion: string;
  /** Optional weight if one was detected (e.g. "35%"). */
  weight?: string;
  /** Short explainer of what strong work on this criterion looks like. */
  guidance?: string;
}

export interface PlanStage {
  id: string;
  title: string;
  description: string;
  subtasks: string[];
  /** Which timeline phase this stage belongs to (discover / research / ...). */
  phaseId: string;
}

export interface TimelinePhase {
  id: string;
  label: string;
  description: string;
  /** 0..1, portion of the total window consumed at the end of this phase. */
  endPortion: number;
}

/** Confidence buckets used for the overall analysis and key field signals. */
export type SignalConfidence = "confirmed" | "inferred" | "missing";

/** Honest per-field confidence flags surfaced in the UI validation layer. */
export interface FieldSignals {
  dueDate: SignalConfidence;
  wordCount: SignalConfidence;
  rubric: SignalConfidence;
  references: SignalConfidence;
  submission: SignalConfidence;
}

export type OverallConfidence = "low" | "medium" | "high";

export interface BriefAnalysis {
  /** Student-friendly assignment title (best guess from the brief). */
  title: string;
  /** Plain-language 1–3 sentence interpretation of the brief. */
  summary: string;
  /** What the student has to produce. */
  deliverables: Deliverable[];
  /** Concrete constraints pulled out of the text. */
  requirements: Requirement[];
  /** Sections / chapters the artefact is expected to contain. */
  requiredSections: string[];
  /** Criteria the brief / rubric hints the work will be marked against. */
  rubricSignals: RubricSignal[];
  /** Things the brief does NOT make explicit — surfaced honestly in the UI. */
  missingDetails: string[];
  /** Extracted or inferred due date ISO string, if any. */
  dueDateISO?: string;
  /** Human-readable due date phrase detected in the brief. */
  dueDatePhrase?: string;
  /** Word count target if detected. */
  wordCount?: number;
  /** Ordered action plan the student should work through. */
  stages: PlanStage[];
  /** Named phases covering the span from today → due date. */
  timeline: TimelinePhase[];
  /** Quality-oriented nudges stronger students tend to follow. */
  highMarkTips: string[];
  /** How confident the engine is about the overall interpretation. */
  confidence: OverallConfidence;
  /** Per-field signal confidence for the validation UI. */
  signals: FieldSignals;
  /** Rough total working hours the brief implies, if detectable. */
  estimatedHours?: number;
  /** Source of the analysis (useful for debugging / UI badges). */
  source: "llm" | "heuristic";
  /** Which model produced the plan when source === "llm". */
  model?: string;
  /** Echoed raw brief length for reference in the UI. */
  rawLength: number;
}

/** Wire response format returned by the /api/ai-planner/analyze endpoint. */
export interface AnalyzeResponse {
  analysis: BriefAnalysis;
  /** Warnings the validation layer raised (empty = clean). */
  warnings: string[];
}

export interface AnalyzeRequest {
  /** Raw brief text (extracted client-side from PDF / DOCX / paste). */
  brief: string;
  /** Original filename (metadata only — helps logging). */
  filename?: string;
}
