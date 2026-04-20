/**
 * Validation layer for AI Planner responses
 * -----------------------------------------------------------------------------
 * Runs AFTER the AI (or heuristic) returns a structured analysis. Its job is
 * not to reject the response — it's to surface honest "this signal looks weak"
 * warnings that the UI can render clearly so the student never thinks the
 * planner is 100% confident when it isn't.
 */

import type { BriefAnalysis } from "../../src/types/briefAnalysis";

export function validateAnalysis(analysis: BriefAnalysis): string[] {
  const warnings: string[] = [];

  if (!analysis.dueDateISO && analysis.signals.dueDate !== "missing") {
    warnings.push("Due date signal claimed but no ISO date returned — treating as missing.");
  }
  if (!analysis.dueDateISO) {
    warnings.push("No clear due date in the brief — confirm the deadline before planning.");
  }
  if (!analysis.wordCount) {
    warnings.push("No explicit word count detected — double-check the brief.");
  }
  if (analysis.rubricSignals.length === 0) {
    warnings.push("No rubric criteria detected — locate the marking criteria before drafting.");
  }
  if (analysis.stages.length < 4) {
    warnings.push("Action plan is unusually short — consider expanding it manually.");
  }
  if (
    analysis.deliverables.length === 0 ||
    analysis.deliverables.every((d) => d.type === "other")
  ) {
    warnings.push("Deliverable type unclear — confirm what you're being asked to produce.");
  }

  // Alignment check — the plan should reflect the extracted deliverables.
  const deliverableTypes = new Set(analysis.deliverables.map((d) => d.type));
  if (deliverableTypes.has("presentation")) {
    const mentionsSlidesOrRehearsal = analysis.stages.some((s) =>
      /slide|present|rehears/i.test(`${s.title} ${s.description}`),
    );
    if (!mentionsSlidesOrRehearsal) {
      warnings.push("Brief mentions a presentation but the plan has no slide/rehearsal stage.");
    }
  }
  if (deliverableTypes.has("code")) {
    const mentionsCode = analysis.stages.some((s) =>
      /code|implement|prototype|test/i.test(`${s.title} ${s.description}`),
    );
    if (!mentionsCode) {
      warnings.push("Brief mentions code but the plan has no implementation/testing stage.");
    }
  }

  return warnings;
}
