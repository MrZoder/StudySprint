/**
 * AI provider abstraction
 * -----------------------------------------------------------------------------
 * Keeps the AI request layer cleanly separated from both the HTTP handler
 * and the UI. Swap providers (OpenAI, Azure, Anthropic, local) by pointing
 * the factory at a different implementation.
 *
 * Environment variables consumed:
 *
 *   AI_PLANNER_PROVIDER     auto | openai | heuristic   (default: auto)
 *   OPENAI_API_KEY          required for the openai provider
 *   OPENAI_BASE_URL         override for Azure / proxies (optional)
 *   OPENAI_PLANNER_MODEL    override model (default: gpt-4o-mini)
 *
 * The `auto` provider picks openai when OPENAI_API_KEY is set, otherwise
 * falls back to the deterministic heuristic planner so the UI keeps working
 * with no keys configured.
 */

import type { BriefAnalysis } from "../../src/types/briefAnalysis";
import {
  BRIEF_ANALYSIS_JSON_SCHEMA,
  SYSTEM_PROMPT,
  buildUserPrompt,
} from "./prompt";

export interface AIProviderInput {
  brief: string;
  filename?: string;
}

export interface AIProvider {
  readonly id: "openai" | "heuristic";
  analyze: (input: AIProviderInput) => Promise<BriefAnalysis>;
}

/* ------------------------------- OpenAI ---------------------------------- */

interface OpenAIResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
}

function createOpenAIProvider(apiKey: string): AIProvider {
  const model = process.env.OPENAI_PLANNER_MODEL || "gpt-4o-mini";
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  // Human-readable provider label for error messages. Anything pointed at a
  // non-openai.com base URL (Gemini, Azure, LiteLLM, Ollama, …) is really a
  // different vendor, so we avoid claiming "OpenAI failed" in that case.
  const providerLabel = /openai\.com/i.test(baseUrl) ? "OpenAI" : "LLM";

  return {
    id: "openai",
    async analyze({ brief, filename }) {
      const body = {
        model,
        // Low temperature keeps the plan consistent and reduces hallucination.
        temperature: 0.25,
        response_format: {
          type: "json_schema",
          json_schema: BRIEF_ANALYSIS_JSON_SCHEMA,
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(brief, filename) },
        ],
      };

      const res = await fetchWithRetry(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(
          `${providerLabel} request failed: ${res.status} ${res.statusText} ${errText.slice(0, 300)}`,
        );
      }

      const json = (await res.json()) as OpenAIResponse;
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`${providerLabel} response missing message content`);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        throw new Error(
          `${providerLabel} response was not valid JSON: ${(err as Error).message}`,
        );
      }

      return normaliseAnalysis(parsed, model);
    },
  };
}

/**
 * Retry transient errors (429, 503, 502, 504) a few times with exponential
 * backoff + jitter. Gemini's OpenAI-compatible endpoint in particular returns
 * 503 "model experiencing high demand" frequently during spikes; a short retry
 * loop turns most of those into successful requests instead of falling the
 * user back to the heuristic planner.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  { maxAttempts = 3, baseDelayMs = 800 }: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      const retriable = res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504;
      if (!retriable || attempt === maxAttempts) return res;
      await sleep(baseDelayMs * 2 ** (attempt - 1) + Math.random() * 250);
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) throw err;
      await sleep(baseDelayMs * 2 ** (attempt - 1) + Math.random() * 250);
    }
  }
  throw lastError ?? new Error("fetchWithRetry: exhausted attempts");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------ Heuristic -------------------------------- */

/**
 * Heuristic provider reuses the on-device rule-based analyser. We dynamically
 * import it because the server runs in Node — the analyser itself only depends
 * on `date-fns` so it works in both environments.
 */
function createHeuristicProvider(): AIProvider {
  return {
    id: "heuristic",
    async analyze({ brief }) {
      const { analyzeBrief } = await import("../../src/lib/briefAnalyzer");
      const result = analyzeBrief(brief);
      return { ...result, source: "heuristic" };
    },
  };
}

/* ------------------------------- Factory --------------------------------- */

export function getConfiguredProvider(): AIProvider {
  const explicit = (process.env.AI_PLANNER_PROVIDER || "auto").toLowerCase();
  const hasKey = !!process.env.OPENAI_API_KEY;

  if (explicit === "openai") {
    if (!hasKey) {
      throw new Error(
        "AI_PLANNER_PROVIDER=openai but OPENAI_API_KEY is not set. Add it to your .env file.",
      );
    }
    return createOpenAIProvider(process.env.OPENAI_API_KEY as string);
  }
  if (explicit === "heuristic") {
    return createHeuristicProvider();
  }
  // auto
  return hasKey
    ? createOpenAIProvider(process.env.OPENAI_API_KEY as string)
    : createHeuristicProvider();
}

/* ---------------------- Normalise + sanitise response -------------------- */

/**
 * Loosely shape whatever the LLM returns into a clean BriefAnalysis. We clamp
 * obviously broken fields rather than rejecting the whole analysis so a single
 * sloppy field doesn't destroy the user experience.
 */
function normaliseAnalysis(raw: unknown, model: string): BriefAnalysis {
  if (!raw || typeof raw !== "object") {
    throw new Error("LLM returned non-object analysis payload");
  }
  const r = raw as Record<string, unknown>;

  const stages = Array.isArray(r.stages) ? r.stages : [];
  const rawLength =
    typeof r.rawLength === "number" && Number.isFinite(r.rawLength) ? r.rawLength : 0;

  return {
    title: s(r.title, "Untitled assignment").slice(0, 140),
    summary: s(
      r.summary,
      "This brief describes an assessment to complete. Review it closely and confirm the key requirements.",
    ),
    deliverables: Array.isArray(r.deliverables)
      ? (r.deliverables as Record<string, unknown>[])
          .map((d) => ({
            type: s(d?.type, "other") as BriefAnalysis["deliverables"][number]["type"],
            label: s(d?.label, "Deliverable"),
            detail: optionalString(d?.detail),
          }))
          .slice(0, 8)
      : [],
    requirements: Array.isArray(r.requirements)
      ? (r.requirements as Record<string, unknown>[])
          .map((req) => ({
            icon: s(req?.icon, "topic") as BriefAnalysis["requirements"][number]["icon"],
            label: s(req?.label, "Requirement"),
            detail: optionalString(req?.detail),
          }))
          .slice(0, 10)
      : [],
    requiredSections: Array.isArray(r.requiredSections)
      ? (r.requiredSections as unknown[])
          .map((x) => (typeof x === "string" ? x : ""))
          .filter(Boolean)
          .slice(0, 12)
      : [],
    rubricSignals: Array.isArray(r.rubricSignals)
      ? (r.rubricSignals as Record<string, unknown>[])
          .map((sig) => ({
            criterion: s(sig?.criterion, "Criterion"),
            weight: optionalString(sig?.weight),
            guidance: optionalString(sig?.guidance),
          }))
          .slice(0, 10)
      : [],
    missingDetails: Array.isArray(r.missingDetails)
      ? (r.missingDetails as unknown[])
          .map((x) => (typeof x === "string" ? x : ""))
          .filter(Boolean)
          .slice(0, 8)
      : [],
    dueDateISO: validISODate(r.dueDateISO),
    dueDatePhrase: optionalString(r.dueDatePhrase),
    wordCount:
      typeof r.wordCount === "number" && Number.isFinite(r.wordCount) && r.wordCount > 0
        ? Math.round(r.wordCount)
        : undefined,
    stages: stages
      .map((stage, i) => {
        const st = stage as Record<string, unknown>;
        return {
          id: s(st.id, `stage-${i + 1}`),
          title: s(st.title, `Stage ${i + 1}`),
          description: s(st.description, ""),
          subtasks: Array.isArray(st.subtasks)
            ? (st.subtasks as unknown[])
                .map((sub) => (typeof sub === "string" ? sub : ""))
                .filter(Boolean)
                .slice(0, 6)
            : [],
          phaseId: s(st.phaseId, "draft") as BriefAnalysis["stages"][number]["phaseId"],
        };
      })
      .slice(0, 12),
    // Timeline phases are always the same set — keeps rendering consistent.
    timeline: DEFAULT_TIMELINE.map((t) => ({ ...t })),
    highMarkTips: Array.isArray(r.highMarkTips)
      ? (r.highMarkTips as unknown[])
          .map((t) => (typeof t === "string" ? t : ""))
          .filter(Boolean)
          .slice(0, 8)
      : [],
    confidence: s(r.confidence, "medium") as BriefAnalysis["confidence"],
    signals: normaliseSignals(r.signals),
    estimatedHours:
      typeof r.estimatedHours === "number" && Number.isFinite(r.estimatedHours)
        ? Math.max(0, Math.round(r.estimatedHours))
        : undefined,
    source: "llm",
    model,
    rawLength,
  };
}

function normaliseSignals(raw: unknown): BriefAnalysis["signals"] {
  const base: BriefAnalysis["signals"] = {
    dueDate: "missing",
    wordCount: "missing",
    rubric: "missing",
    references: "missing",
    submission: "missing",
  };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const allowed: BriefAnalysis["signals"][keyof BriefAnalysis["signals"]][] = [
    "confirmed",
    "inferred",
    "missing",
  ];
  (Object.keys(base) as Array<keyof BriefAnalysis["signals"]>).forEach((key) => {
    const v = r[key];
    if (typeof v === "string" && (allowed as string[]).includes(v)) {
      base[key] = v as BriefAnalysis["signals"][typeof key];
    }
  });
  return base;
}

function s(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function optionalString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

/**
 * Only keep dueDateISO when it parses to a real calendar date. LLMs occasionally
 * return placeholders like "TBA", "Week 8", or partial strings like "2025-13";
 * letting those reach the UI causes `format(new Date(value))` to throw
 * "Invalid time value" and crash the planner page. Falling back to `undefined`
 * means the UI will render the human-readable `dueDatePhrase` instead.
 */
function validISODate(v: unknown): string | undefined {
  const raw = optionalString(v);
  if (!raw) return undefined;
  const time = Date.parse(raw);
  if (Number.isNaN(time)) return undefined;
  // Re-emit in canonical ISO form so the client always parses cleanly.
  return new Date(time).toISOString();
}

/* The LLM doesn't need to author the timeline — it's a consistent visual
   pattern and stays identical across all plans so the UI keeps its rhythm. */
const DEFAULT_TIMELINE: BriefAnalysis["timeline"] = [
  {
    id: "discover",
    label: "Discover & plan",
    description: "Understand the brief, read the rubric, choose an angle.",
    endPortion: 0.15,
  },
  {
    id: "research",
    label: "Research & outline",
    description: "Gather sources and plan the structure before drafting.",
    endPortion: 0.4,
  },
  {
    id: "draft",
    label: "Draft",
    description: "Write the messy first version. Progress > perfection.",
    endPortion: 0.7,
  },
  {
    id: "refine",
    label: "Refine",
    description: "Tighten arguments, check evidence, revisit weak sections.",
    endPortion: 0.9,
  },
  {
    id: "polish",
    label: "Polish & submit",
    description: "Edit, format, rubric self-check, and submit with a buffer.",
    endPortion: 1,
  },
];
