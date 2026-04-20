/**
 * Client-side AI Planner request wrapper
 * -----------------------------------------------------------------------------
 * Single entry point the UI uses to request a structured plan from the
 * server-side /api/ai-planner/analyze endpoint. Keeps fetch / JSON / error
 * handling out of the React page.
 *
 * Falls back to the on-device heuristic analyser if the network request fails
 * entirely (e.g. offline dev, server crash) so the UX never dead-ends.
 */

import { analyzeBrief } from "./briefAnalyzer";
import type {
  AnalyzeResponse,
  BriefAnalysis,
} from "../types/briefAnalysis";

const ENDPOINT = "/api/ai-planner/analyze";
const REQUEST_TIMEOUT_MS = 45_000;

export interface AnalyzeResult {
  analysis: BriefAnalysis;
  warnings: string[];
  /** Set when we fell back to the local heuristic because the server failed. */
  fallbackReason?: string;
}

export async function requestBriefAnalysis(params: {
  brief: string;
  filename?: string;
  signal?: AbortSignal;
}): Promise<AnalyzeResult> {
  const { brief, filename, signal } = params;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Hook external signal to our internal controller so callers can cancel too.
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ brief, filename }),
      signal: controller.signal,
    });

    const text = await res.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`AI Planner returned invalid JSON (status ${res.status}).`);
    }

    if (!res.ok) {
      const err = (payload as { error?: string; detail?: string } | null) ?? {};
      throw new Error(err.detail || err.error || `Request failed with ${res.status}`);
    }

    const response = payload as AnalyzeResponse;
    if (!response?.analysis) {
      throw new Error("AI Planner response missing `analysis` payload.");
    }

    return {
      analysis: response.analysis,
      warnings: Array.isArray(response.warnings) ? response.warnings : [],
    };
  } catch (err) {
    // Network / server failure → use the on-device heuristic so the student
    // still leaves with a plan. The UI shows a warning banner explaining.
    const fallback = analyzeBrief(brief);
    return {
      analysis: fallback,
      warnings: buildFallbackWarnings(fallback),
      fallbackReason: (err as Error).message,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function buildFallbackWarnings(analysis: BriefAnalysis): string[] {
  const warnings: string[] = [];
  if (!analysis.dueDateISO) warnings.push("No due date detected — set one before converting.");
  if (!analysis.wordCount) warnings.push("No word count detected — double-check the brief.");
  if (analysis.rubricSignals.length === 0) {
    warnings.push("No rubric criteria detected — locate the marking criteria before drafting.");
  }
  return warnings;
}
