/**
 * Netlify Functions v2 wrapper for the AI Planner handler.
 * ---------------------------------------------------------
 * This file is the production counterpart to `server/vitePlugin.ts`: in dev,
 * Vite mounts the same `handleAnalyze` as middleware; in production, Netlify
 * bundles this file into a Lambda and serves it at `/api/ai-planner/analyze`
 * (via the redirect rule in `netlify.toml`).
 *
 * Why a thin wrapper?
 *   - Keeps provider / prompt / validation code framework-agnostic (see
 *     `server/aiPlanner/*`) so the same brain works for dev, Netlify,
 *     Cloudflare, Vercel, or a Node/Express host.
 *   - Translates the Fetch-style `Request` Netlify hands us into the plain
 *     JSON body the handler expects, and re-wraps the result as `Response`.
 *
 * Environment variables consumed at runtime (configure in the Netlify
 * dashboard under Site settings → Environment variables):
 *
 *   OPENAI_API_KEY          required when AI_PLANNER_PROVIDER != heuristic
 *   OPENAI_BASE_URL         optional — for Gemini/Azure/LiteLLM/OpenRouter
 *   OPENAI_PLANNER_MODEL    optional — defaults to gpt-4o-mini
 *   AI_PLANNER_PROVIDER     optional — auto | openai | heuristic (default: auto)
 *
 * None of these are exposed to the browser — they only exist inside the
 * Lambda runtime. The client bundle never sees them.
 */

import { handleAnalyze } from "../../server/aiPlanner/handler";

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export default async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      405,
      { allow: "POST, OPTIONS" },
    );
  }

  let body: unknown;
  try {
    const raw = await req.text();
    body = raw.trim() ? JSON.parse(raw) : {};
  } catch (err) {
    return json(
      { error: "Invalid JSON body", detail: (err as Error).message },
      400,
    );
  }

  try {
    const result = await handleAnalyze(body);
    return json(result.body, result.status);
  } catch (err) {
    return json(
      {
        error: "AI Planner handler crashed",
        detail: (err as Error).message,
      },
      500,
    );
  }
};

/* -------------------------------- Helpers -------------------------------- */

function json(
  payload: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}
