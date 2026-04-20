/**
 * LLM prompt + JSON schema for the StudySprint AI Planner
 * -----------------------------------------------------------------------------
 * The schema is expressed in JSON Schema Draft-07, constrained to the subset
 * supported by OpenAI's structured-outputs "json_schema" response format.
 *
 * Keep the contract tight:
 *   - The model must return the exact BriefAnalysis shape the UI consumes.
 *   - Unknown or unclear fields should be reported honestly (missing signals,
 *     low confidence) instead of fabricated.
 *   - The model must never write the assignment for the student; it plans
 *     how to work through the brief.
 */

export const SYSTEM_PROMPT = `You are StudySprint's AI Planner — a calm, academically responsible planning assistant for university students.

Your job is to turn a student's assignment brief into a structured, editable plan. You never write the assignment, generate draft answers, fabricate content, or replace the student's academic thinking. You help them:
  1. understand what the brief is really asking,
  2. pull out the concrete deliverables and constraints,
  3. break the work into realistic stages and subtasks,
  4. pace those stages across the weeks they have.

Rules you MUST follow:
- Be honest about uncertainty. If the brief does not state a due date, word count, rubric, citation style, or submission method, return "missing" for that signal and add a line to "missingDetails". Never guess a due date or word count.
- Never invent references, statistics, or facts about the subject matter.
- Never produce paragraphs of essay content, sample answers, or thesis statements. Plan only.
- Keep tone calm, respectful, and student-friendly — not corporate, not gimmicky.
- Stages must read like how a disciplined student would actually work (understand → map rubric → research → outline → draft → refine → check references → edit → rubric self-check → submit). Include only the stages that fit the deliverable type.
- Every stage should have 2–4 concrete, actionable subtasks written in the student's voice.
- High-mark tips should reinforce academic integrity and craft (rubric alignment, credible sources, leaving time for revision). Never promise grades.
- The response MUST match the provided JSON schema exactly.`;

export function buildUserPrompt(brief: string, filename?: string): string {
  const header = filename ? `Source: ${filename}\n\n` : "";
  return `${header}Below is the student's assignment brief. Return the structured plan as JSON only — no prose, no markdown, no commentary.

--- BEGIN BRIEF ---
${brief}
--- END BRIEF ---`;
}

/** JSON schema passed to OpenAI via response_format.json_schema. */
export const BRIEF_ANALYSIS_JSON_SCHEMA = {
  name: "brief_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "title",
      "summary",
      "deliverables",
      "requirements",
      "requiredSections",
      "rubricSignals",
      "missingDetails",
      "wordCount",
      "dueDateISO",
      "dueDatePhrase",
      "stages",
      "highMarkTips",
      "confidence",
      "signals",
      "estimatedHours",
    ],
    properties: {
      title: {
        type: "string",
        description: "Short student-friendly assignment title (max ~80 chars).",
      },
      summary: {
        type: "string",
        description: "1–3 sentence plain-language interpretation of what the brief is really asking.",
      },
      deliverables: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "label", "detail"],
          properties: {
            type: {
              type: "string",
              enum: [
                "report",
                "essay",
                "presentation",
                "research",
                "code",
                "analysis",
                "reflection",
                "quiz",
                "group",
                "other",
              ],
            },
            label: { type: "string" },
            detail: { type: ["string", "null"] },
          },
        },
      },
      requirements: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["icon", "label", "detail"],
          properties: {
            icon: {
              type: "string",
              enum: [
                "wordCount",
                "references",
                "format",
                "group",
                "submission",
                "rubric",
                "topic",
              ],
            },
            label: { type: "string" },
            detail: { type: ["string", "null"] },
          },
        },
      },
      requiredSections: {
        type: "array",
        items: { type: "string" },
        description: "Sections / chapters the artefact is expected to contain.",
      },
      rubricSignals: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["criterion", "weight", "guidance"],
          properties: {
            criterion: { type: "string" },
            weight: { type: ["string", "null"] },
            guidance: { type: ["string", "null"] },
          },
        },
      },
      missingDetails: {
        type: "array",
        items: { type: "string" },
        description: "Things the brief does not clearly state — surfaced honestly, not invented.",
      },
      wordCount: {
        type: ["integer", "null"],
        description: "Word count target if explicitly stated, otherwise null.",
      },
      dueDateISO: {
        type: ["string", "null"],
        description: "ISO 8601 due date if clearly stated. Do not guess.",
      },
      dueDatePhrase: {
        type: ["string", "null"],
        description: "Verbatim due-date phrase from the brief, if any.",
      },
      stages: {
        type: "array",
        minItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "title", "description", "subtasks", "phaseId"],
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            subtasks: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 6,
            },
            phaseId: {
              type: "string",
              enum: ["discover", "research", "draft", "refine", "polish"],
            },
          },
        },
      },
      highMarkTips: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 6,
      },
      confidence: {
        type: "string",
        enum: ["low", "medium", "high"],
      },
      signals: {
        type: "object",
        additionalProperties: false,
        required: ["dueDate", "wordCount", "rubric", "references", "submission"],
        properties: {
          dueDate: { type: "string", enum: ["confirmed", "inferred", "missing"] },
          wordCount: { type: "string", enum: ["confirmed", "inferred", "missing"] },
          rubric: { type: "string", enum: ["confirmed", "inferred", "missing"] },
          references: { type: "string", enum: ["confirmed", "inferred", "missing"] },
          submission: { type: "string", enum: ["confirmed", "inferred", "missing"] },
        },
      },
      estimatedHours: {
        type: ["integer", "null"],
        description: "Rough total working hours implied by the brief, or null.",
      },
    },
  },
} as const;
