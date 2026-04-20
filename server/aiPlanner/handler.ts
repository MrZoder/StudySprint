/**
 * Framework-agnostic AI Planner handler
 * -----------------------------------------------------------------------------
 * Pure function that takes the parsed request body and returns the HTTP result
 * the caller should emit. Used by:
 *   - the Vite dev-server middleware (server/vitePlugin.ts)
 *   - (future) any serverless function wrapper (Netlify, Cloudflare, etc.)
 *
 * The handler never throws — it returns a status + JSON body so wrappers can
 * focus on wiring, not error translation.
 */

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BriefAnalysis,
} from "../../src/types/briefAnalysis";
import { getConfiguredProvider } from "./provider";
import { validateAnalysis } from "./validate";

export interface HandlerResult {
  status: number;
  body:
    | AnalyzeResponse
    | { error: string; detail?: string };
}

const MIN_BRIEF_CHARS = 40;
const MAX_BRIEF_CHARS = 60_000;

export async function handleAnalyze(raw: unknown): Promise<HandlerResult> {
  const parsed = parseRequest(raw);
  if ("error" in parsed) {
    return { status: 400, body: { error: parsed.error } };
  }

  const brief = parsed.brief.slice(0, MAX_BRIEF_CHARS);
  const provider = (() => {
    try {
      return getConfiguredProvider();
    } catch (err) {
      return { error: (err as Error).message };
    }
  })();

  if ("error" in provider) {
    return {
      status: 500,
      body: { error: "AI provider misconfigured", detail: provider.error },
    };
  }

  let analysis: BriefAnalysis;
  try {
    analysis = await provider.analyze({ brief, filename: parsed.filename });
  } catch (err) {
    // Graceful degradation: when the LLM fails for any reason (network,
    // rate-limit, malformed response) we fall back to the heuristic analyser
    // so the student always leaves with a plan.
    if (provider.id !== "heuristic") {
      try {
        const { analyzeBrief } = await import("../../src/lib/briefAnalyzer");
        const fallback = analyzeBrief(brief);
        const warnings = validateAnalysis(fallback);
        warnings.unshift(
          `Falling back to on-device planner — AI provider failed: ${truncate(
            (err as Error).message,
            200,
          )}`,
        );
        return {
          status: 200,
          body: {
            analysis: { ...fallback, source: "heuristic" },
            warnings,
          },
        };
      } catch (fallbackErr) {
        return {
          status: 500,
          body: {
            error: "AI analysis failed and fallback unavailable",
            detail: (fallbackErr as Error).message,
          },
        };
      }
    }
    return {
      status: 500,
      body: {
        error: "AI analysis failed",
        detail: truncate((err as Error).message, 300),
      },
    };
  }

  // Fill in rawLength consistently on both paths.
  analysis.rawLength = brief.length;

  const warnings = validateAnalysis(analysis);

  return {
    status: 200,
    body: { analysis, warnings },
  };
}

/* -------------------------------- Helpers -------------------------------- */

type ParsedRequest =
  | { brief: string; filename?: string }
  | { error: string };

function parseRequest(raw: unknown): ParsedRequest {
  if (!raw || typeof raw !== "object") {
    return { error: "Request body must be a JSON object" };
  }
  const r = raw as Partial<AnalyzeRequest>;
  if (typeof r.brief !== "string") {
    return { error: "Missing required field: brief (string)" };
  }
  const brief = r.brief.trim();
  if (brief.length < MIN_BRIEF_CHARS) {
    return {
      error: `Brief is too short. Provide at least ${MIN_BRIEF_CHARS} characters of context.`,
    };
  }
  const filename =
    typeof r.filename === "string" && r.filename.trim() ? r.filename.trim() : undefined;
  return { brief, filename };
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max - 1) + "…";
}
