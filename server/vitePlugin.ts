/**
 * StudySprint AI Planner — Vite dev-server plugin
 * -----------------------------------------------------------------------------
 * Wires the framework-agnostic `handleAnalyze` handler into Vite's dev server
 * as a POST endpoint at `/api/ai-planner/analyze`, so the frontend can call
 * a real server-side AI route during local development without standing up a
 * separate backend process.
 *
 * For production deployment, wrap `handleAnalyze` in your serverless function
 * of choice (Netlify Functions, Cloudflare Workers, Express, etc.) — the
 * wrapper only needs to parse JSON body and forward it.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

import { handleAnalyze } from "./aiPlanner/handler";

const ROUTE = "/api/ai-planner/analyze";

export function aiPlannerDevPlugin(): Plugin {
  return {
    name: "studysprint-ai-planner",
    configureServer(server) {
      server.middlewares.use(ROUTE, async (req, res) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          setCorsHeaders(res);
          res.end();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("content-type", "application/json");
          res.setHeader("allow", "POST, OPTIONS");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body: unknown;
        try {
          body = await readJson(req);
        } catch (err) {
          res.statusCode = 400;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              error: "Invalid JSON body",
              detail: (err as Error).message,
            }),
          );
          return;
        }

        try {
          const result = await handleAnalyze(body);
          res.statusCode = result.status;
          res.setHeader("content-type", "application/json");
          setCorsHeaders(res);
          res.end(JSON.stringify(result.body));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              error: "AI Planner handler crashed",
              detail: (err as Error).message,
            }),
          );
        }
      });
    },
  };
}

function setCorsHeaders(res: ServerResponse) {
  // Dev-only: allows the UI on one port to call the handler on the same origin.
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}
