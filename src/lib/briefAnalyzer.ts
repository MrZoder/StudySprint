/**
 * StudySprint Brief Analyzer — heuristic fallback
 * -----------------------------------------------------------------------------
 * Deterministic rule-based brief analyser that runs fully in the browser / on
 * the server without any LLM call. It is used as:
 *
 *   1. A zero-config fallback when no LLM API key is configured.
 *   2. A safety net if the server-side AI call fails or times out.
 *
 * Design intent:
 *   - Never fabricate content. If the brief doesn't state a due date or word
 *     count, the analyser returns `missing` rather than guessing.
 *   - Mirror how a disciplined student breaks a brief down: identify the
 *     artefact, pull out constraints, plan the stages backwards from the
 *     due date.
 *   - Produce the same `BriefAnalysis` shape the LLM path returns so the UI
 *     can render either indistinguishably.
 */

import { addDays, differenceInCalendarDays, format } from "date-fns";

import type {
  BriefAnalysis,
  Deliverable,
  DeliverableType,
  FieldSignals,
  PlanStage,
  Requirement,
  RequirementIcon,
  RubricSignal,
  TimelinePhase,
} from "../types/briefAnalysis";

export type {
  BriefAnalysis,
  Deliverable,
  DeliverableType,
  FieldSignals,
  PlanStage,
  Requirement,
  RequirementIcon,
  RubricSignal,
  TimelinePhase,
} from "../types/briefAnalysis";

/* ---------------------------- Keyword dictionary -------------------------- */

const DELIVERABLE_KEYWORDS: Array<{
  type: DeliverableType;
  label: string;
  patterns: RegExp[];
}> = [
  {
    type: "report",
    label: "Written report",
    patterns: [/\breports?\b/i, /\btechnical\s+report\b/i, /\bwhite\s?paper\b/i],
  },
  {
    type: "essay",
    label: "Essay",
    patterns: [/\bessays?\b/i, /\bargumentative\b/i, /\bcritical\s+essay\b/i],
  },
  {
    type: "presentation",
    label: "Presentation / slides",
    patterns: [/\bpresent(?:ation)?s?\b/i, /\bslides?\b/i, /\bpitch\b/i, /\bkeynote\b/i],
  },
  {
    type: "research",
    label: "Research component",
    patterns: [
      /\bresearch\b/i,
      /\bliterature\s+review\b/i,
      /\bsources?\b/i,
      /\bacademic\s+sources?\b/i,
    ],
  },
  {
    type: "code",
    label: "Code / implementation",
    patterns: [
      /\bcode\b/i,
      /\bimplement(?:ation|s)?\b/i,
      /\balgorithm\b/i,
      /\bprogram(?:ming|me)?\b/i,
      /\bprototype\b/i,
      /\brepository\b/i,
      /\bgithub\b/i,
    ],
  },
  {
    type: "analysis",
    label: "Analysis / case study",
    patterns: [
      /\banalysis\b/i,
      /\bcase\s+study\b/i,
      /\bevaluate\b/i,
      /\bcompare\b/i,
      /\bcritique\b/i,
    ],
  },
  {
    type: "reflection",
    label: "Reflection / journal",
    patterns: [/\breflect(?:ion|ive)?\b/i, /\bjournal\b/i, /\blearning\s+log\b/i],
  },
  {
    type: "quiz",
    label: "Quiz / test",
    patterns: [/\bquiz(?:zes)?\b/i, /\btests?\b/i, /\bexam\b/i, /\bmcq\b/i],
  },
  {
    type: "group",
    label: "Group work",
    patterns: [/\bgroup\b/i, /\bteam\s+project\b/i, /\bpeer\b/i],
  },
];

const REQUIREMENT_KEYWORDS: Array<{
  icon: RequirementIcon;
  label: string;
  patterns: RegExp[];
}> = [
  {
    icon: "references",
    label: "Academic references required",
    patterns: [
      /\breferences?\b/i,
      /\bcitations?\b/i,
      /\bbibliography\b/i,
      /\bapa\b/i,
      /\bharvard\b/i,
      /\bmla\b/i,
      /\bieee\b/i,
    ],
  },
  {
    icon: "rubric",
    label: "Marked against a rubric",
    patterns: [/\brubric\b/i, /\bmarking\s+criteria\b/i, /\bassessment\s+criteria\b/i],
  },
  {
    icon: "submission",
    label: "Staged / online submission",
    patterns: [/\bturnitin\b/i, /\bsubmission\b/i, /\bupload\b/i, /\bportal\b/i, /\blms\b/i],
  },
  {
    icon: "format",
    label: "Formatting constraints",
    patterns: [
      /\bpdf\b/i,
      /\bdocx?\b/i,
      /\bfont\s+size\b/i,
      /\btimes\s+new\s+roman\b/i,
      /\bdouble[-\s]?spaced\b/i,
      /\bmargins?\b/i,
    ],
  },
  {
    icon: "group",
    label: "Group submission",
    patterns: [/\bgroup\s+(?:submission|work|project)\b/i, /\bpeer\s+review\b/i],
  },
];

/* ----------------------------- Date extraction ---------------------------- */

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const MONTH_SHORT = MONTHS.map((m) => m.slice(0, 3));

function parseMonth(name: string): number | null {
  const lower = name.toLowerCase();
  let idx = MONTHS.indexOf(lower);
  if (idx >= 0) return idx;
  idx = MONTH_SHORT.indexOf(lower.slice(0, 3));
  return idx >= 0 ? idx : null;
}

function extractDueDate(text: string, now: Date): { iso?: string; phrase?: string } {
  const windowed = text.replace(/\s+/g, " ").toLowerCase();

  const iso = windowed.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}`);
    if (!isNaN(+d)) return { iso: d.toISOString(), phrase: iso[0] };
  }

  const dmy = windowed.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]) - 1;
    const year = Number(dmy[3]);
    const d = new Date(year, month, day);
    if (!isNaN(+d)) return { iso: d.toISOString(), phrase: dmy[0] };
  }

  const dayMonth = windowed.match(
    /(?:due|by|submit(?:ted)?(?:\s+on)?|deadline[:\s]*)\s+(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(?:\s+(20\d{2}))?/,
  );
  if (dayMonth) {
    const day = Number(dayMonth[1]);
    const month = parseMonth(dayMonth[2]);
    const year = dayMonth[3] ? Number(dayMonth[3]) : now.getFullYear();
    if (month !== null) {
      let d = new Date(year, month, day);
      if (!dayMonth[3] && d < now) d = new Date(year + 1, month, day);
      if (!isNaN(+d)) return { iso: d.toISOString(), phrase: dayMonth[0] };
    }
  }

  const monthDay = windowed.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?/,
  );
  if (monthDay) {
    const month = parseMonth(monthDay[1]);
    const day = Number(monthDay[2]);
    const year = monthDay[3] ? Number(monthDay[3]) : now.getFullYear();
    if (month !== null) {
      let d = new Date(year, month, day);
      if (!monthDay[3] && d < now) d = new Date(year + 1, month, day);
      if (!isNaN(+d)) return { iso: d.toISOString(), phrase: monthDay[0] };
    }
  }

  const relative = windowed.match(/\bin\s+(\d{1,2})\s+(day|week)s?\b/);
  if (relative) {
    const n = Number(relative[1]);
    const mult = relative[2] === "week" ? 7 : 1;
    return { iso: addDays(now, n * mult).toISOString(), phrase: relative[0] };
  }

  return {};
}

/* ------------------------------ Title + summary --------------------------- */

function extractTitle(text: string, deliverables: Deliverable[]): string {
  const trimmed = text.trim();
  if (!trimmed) return "Untitled assignment";

  const labelled = trimmed.match(
    /(?:assignment\s+title|assignment|task\s+title|title|topic)[:\-–]\s*(.{3,100})/i,
  );
  if (labelled?.[1]) {
    return truncate(labelled[1].replace(/[\r\n].*$/, "").trim(), 80);
  }

  const firstLine = trimmed.split(/\r?\n/).find((l) => l.trim().length > 0);
  if (firstLine) {
    const cleaned = firstLine.replace(/[*#>•]+/g, "").trim();
    if (cleaned.length >= 6 && cleaned.length <= 110) return truncate(cleaned, 90);
  }

  const primary = deliverables[0];
  return primary ? `${primary.label} assignment` : "Assignment brief";
}

function buildSummary(
  deliverables: Deliverable[],
  requirements: Requirement[],
  dueDatePhrase: string | undefined,
  wordCount: number | undefined,
): string {
  const parts: string[] = [];
  if (deliverables.length === 0) {
    parts.push("This brief describes an assessment you'll need to complete.");
  } else {
    const labels = deliverables
      .slice(0, 3)
      .map((d) => d.label.toLowerCase())
      .join(deliverables.length === 2 ? " and " : ", ");
    parts.push(
      `You've been asked to produce ${startsWithVowel(labels) ? "an" : "a"} ${labels}${
        deliverables.length > 3 ? ", among other elements" : ""
      }.`,
    );
  }

  const wordBit = wordCount ? `around ${wordCount.toLocaleString()} words` : null;
  const refBit = requirements.some((r) => r.icon === "references")
    ? "credible academic references"
    : null;
  const rubricBit = requirements.some((r) => r.icon === "rubric")
    ? "marked against a rubric"
    : null;
  const tail = [wordBit, refBit, rubricBit].filter(Boolean).join(", ");
  if (tail) parts.push(`Expect ${tail}.`);

  if (dueDatePhrase) {
    parts.push(`Timing: the brief references \u201C${dueDatePhrase}\u201D as the deadline signal.`);
  }

  parts.push(
    "Your job isn't to do everything at once — it's to understand what's being asked, break it into realistic stages, and pace the work across the weeks you have.",
  );
  return parts.join(" ");
}

function startsWithVowel(s: string): boolean {
  return /^[aeiou]/i.test(s.trim());
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

/* ---------------------------- Stage templates ----------------------------- */

interface StageTemplate {
  id: string;
  title: string;
  description: string;
  subtasks: string[];
  phaseId: string;
  appliesTo?: DeliverableType[];
  alwaysInclude?: boolean;
}

const STAGE_TEMPLATES: StageTemplate[] = [
  {
    id: "understand",
    title: "Understand the brief",
    description:
      "Read the brief slowly, underline verbs, and write a one-sentence version of the task in your own words.",
    subtasks: [
      "Read the brief twice — once for structure, once for detail",
      "Highlight key verbs (analyse, compare, design, propose)",
      "Write one sentence that summarises the task in your own words",
    ],
    phaseId: "discover",
    alwaysInclude: true,
  },
  {
    id: "rubric",
    title: "Map the rubric",
    description:
      "Turn the marking criteria into a checklist so you know exactly what each band is asking for.",
    subtasks: [
      "Locate the rubric or marking criteria",
      "List each criterion and what 'high distinction' looks like for it",
      "Mark which criteria you're least sure about",
    ],
    phaseId: "discover",
    appliesTo: ["report", "essay", "analysis", "research", "presentation", "reflection"],
  },
  {
    id: "topic",
    title: "Pick a sharp topic / angle",
    description:
      "Narrow the scope to something specific enough to do well in the word count you have.",
    subtasks: [
      "Brainstorm 3 possible angles",
      "Choose the one with the best sources and your strongest interest",
      "Write a one-paragraph pitch of your angle",
    ],
    phaseId: "discover",
    appliesTo: ["essay", "report", "research", "presentation", "analysis"],
  },
  {
    id: "sources",
    title: "Gather credible sources",
    description:
      "Find 5–8 high-quality academic sources you'll actually use, not just cite at the end.",
    subtasks: [
      "Search the library database (not just Google)",
      "Collect 5–8 sources with full citation info",
      "Write a one-line summary of each source",
    ],
    phaseId: "research",
    appliesTo: ["essay", "report", "research", "analysis", "reflection"],
  },
  {
    id: "outline",
    title: "Build a detailed outline",
    description:
      "Plan the structure before you draft — it saves days of rewriting later.",
    subtasks: [
      "List the sections / slides / functions required",
      "Allocate a rough word count or time budget to each",
      "Note the evidence or data you'll use per section",
    ],
    phaseId: "research",
    alwaysInclude: true,
  },
  {
    id: "prototype",
    title: "Build a working prototype",
    description:
      "Ship the skeleton first — a smallest-possible end-to-end version you can improve on.",
    subtasks: [
      "Scaffold the repo / project structure",
      "Get one thin slice working end-to-end",
      "Commit and push a baseline version",
    ],
    phaseId: "draft",
    appliesTo: ["code"],
  },
  {
    id: "draft",
    title: "Draft section by section",
    description:
      "Write the hardest section first while you have energy. Messy drafts are fine — editing fixes them.",
    subtasks: [
      "Draft the hardest section first",
      "Write continuously without editing as you go",
      "Commit a visible checkpoint for each section",
    ],
    phaseId: "draft",
    appliesTo: ["essay", "report", "analysis", "reflection", "presentation", "research"],
  },
  {
    id: "slides",
    title: "Design slides and flow",
    description:
      "Fewer words per slide, clear narrative arc, and a strong opening and closing.",
    subtasks: [
      "Storyboard the slide sequence on paper",
      "Design title slide + 1 slide per section",
      "Keep each slide to one core idea",
    ],
    phaseId: "draft",
    appliesTo: ["presentation"],
  },
  {
    id: "rehearse",
    title: "Rehearse and time the delivery",
    description:
      "A rehearsed presentation beats a polished deck. Speak it out loud at least twice.",
    subtasks: [
      "Rehearse out loud once end-to-end",
      "Time yourself — trim if over the limit",
      "Record and review a second pass",
    ],
    phaseId: "refine",
    appliesTo: ["presentation"],
  },
  {
    id: "tests",
    title: "Add tests and edge cases",
    description:
      "Consider obvious failure modes — empty input, bad data, boundary conditions.",
    subtasks: [
      "Write at least one test per core function",
      "Cover one happy path and one edge case",
      "Run the full suite before you submit",
    ],
    phaseId: "refine",
    appliesTo: ["code"],
  },
  {
    id: "refine",
    title: "Refine arguments and evidence",
    description:
      "Re-read each section and ask: is the claim clear? Is the evidence actually supporting it?",
    subtasks: [
      "Re-read with fresh eyes after a break",
      "Tighten weak claims or replace unclear evidence",
      "Check transitions between sections read naturally",
    ],
    phaseId: "refine",
    appliesTo: ["essay", "report", "analysis", "reflection", "research"],
  },
  {
    id: "references",
    title: "Check references and formatting",
    description:
      "Lecturers notice sloppy references first. A clean bibliography lifts the whole piece.",
    subtasks: [
      "Format every citation in the required style",
      "Cross-check in-text citations against your bibliography",
      "Remove sources you ended up not citing",
    ],
    phaseId: "polish",
    appliesTo: ["essay", "report", "research", "analysis"],
  },
  {
    id: "edit",
    title: "Final edit and polish",
    description:
      "Small things — typos, inconsistent formatting, awkward sentences — move you a grade band.",
    subtasks: [
      "Read the whole piece aloud once",
      "Fix typos and inconsistent formatting",
      "Check headings, page numbers, and captions",
    ],
    phaseId: "polish",
    alwaysInclude: true,
  },
  {
    id: "rubric-check",
    title: "Rubric self-check before submission",
    description:
      "Score your own work against the rubric before the marker does. Fix the weakest criterion.",
    subtasks: [
      "Re-read the rubric with your draft beside it",
      "Self-score each criterion honestly",
      "Fix the single weakest one before submitting",
    ],
    phaseId: "polish",
    alwaysInclude: true,
  },
  {
    id: "submit",
    title: "Submit and confirm",
    description: "Submit early if you can — give yourself a buffer for tech problems.",
    subtasks: [
      "Upload the correct file format",
      "Confirm the submission receipt / confirmation email",
      "Back up the final version somewhere you trust",
    ],
    phaseId: "polish",
    alwaysInclude: true,
  },
];

export const DEFAULT_TIMELINE: TimelinePhase[] = [
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

/* ------------------------------ High-mark tips ---------------------------- */

const GENERAL_TIPS: string[] = [
  "Read the rubric before you start drafting — write for the rubric, not just the topic.",
  "Draft the hardest section first while your focus is freshest.",
  "Leave at least 24 hours between finishing the draft and final editing.",
  "Every claim deserves a source or a reason — vague assertions lose marks quickly.",
];

const DELIVERABLE_TIPS: Partial<Record<DeliverableType, string[]>> = {
  essay: [
    "State your thesis explicitly in the introduction and revisit it in the conclusion.",
    "Every paragraph should make one claim and back it with evidence.",
  ],
  report: [
    "Include a one-page executive summary even if it isn't explicitly required.",
    "Use headings and short paragraphs — reports are scanned, not read linearly.",
  ],
  research: [
    "Prefer peer-reviewed sources over web results and reference them precisely.",
    "Show the shape of the literature — agreements, tensions, and gaps.",
  ],
  presentation: [
    "Rehearse timing at least twice — going over time loses marks for no reason.",
    "One core idea per slide; the speaker adds the rest.",
  ],
  code: [
    "Write a clean README with setup, run, and test instructions.",
    "Prefer small, reviewable commits over one large final commit.",
  ],
  analysis: [
    "Ground every claim in the data or the source you analysed.",
    "Explicitly name the framework or lens you're using for the analysis.",
  ],
  reflection: [
    "Reflections reward specific moments and self-awareness, not generic lessons.",
    "Tie each insight back to evidence (something you did, read, or observed).",
  ],
};

/* ------------------------ Sections & rubric signals ----------------------- */

const SECTION_LIBRARY: Partial<Record<DeliverableType, string[]>> = {
  report: [
    "Title page",
    "Executive summary",
    "Introduction",
    "Background / context",
    "Methodology",
    "Findings / analysis",
    "Recommendations",
    "Conclusion",
    "References",
  ],
  essay: [
    "Introduction with thesis",
    "Body paragraphs (one claim each)",
    "Counter-argument",
    "Conclusion",
    "References",
  ],
  research: [
    "Research question",
    "Literature review",
    "Methodology",
    "Findings",
    "Discussion",
    "References",
  ],
  presentation: [
    "Title slide",
    "Problem / context",
    "Proposed solution",
    "Evidence / data",
    "Conclusion & Q&A",
  ],
  code: [
    "Problem statement",
    "Project structure",
    "Core implementation",
    "Tests",
    "README / documentation",
  ],
  analysis: [
    "Introduction",
    "Framework / lens",
    "Analysis of evidence",
    "Discussion",
    "Conclusion",
    "References",
  ],
  reflection: [
    "Context",
    "Event / experience",
    "Reflection",
    "Learning outcomes",
    "Forward plan",
  ],
};

function deriveRubricSignals(text: string): RubricSignal[] {
  const signals: RubricSignal[] = [];
  // Pattern: "criterion 25%" / "analysis 35%"
  const weightRe = /\b([a-z][a-z\s/&-]{2,30}?)\s*[(\-–:]?\s*(\d{1,2}\s*%|\d{1,2}\s*percent)/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = weightRe.exec(text)) !== null) {
    const rawName = match[1].trim().replace(/[,;:]$/g, "");
    const weight = match[2].replace(/\s*percent/i, "%").trim();
    const name = titleCase(rawName);
    if (name.length < 3 || name.length > 40) continue;
    if (/^(the|this|that|one|two|three|four|five|six|seven|eight|nine|ten|up to|only|at least|just|full|total|over|above|below)$/i.test(rawName)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    signals.push({ criterion: name, weight });
  }

  // Common rubric words that usually appear without weights
  const knownCriteria: Array<[RegExp, string, string]> = [
    [/\bclarity\b/i, "Clarity", "Write cleanly and structure ideas logically."],
    [/\banalys(?:is|e)\b/i, "Analysis", "Go beyond description — explain why the evidence matters."],
    [/\bargument\b/i, "Argument", "Make a clear claim and sustain it throughout."],
    [/\bpresentation\b/i, "Presentation", "Polish formatting, layout and references."],
    [/\bcritical\s+thinking\b/i, "Critical thinking", "Consider alternative interpretations explicitly."],
    [/\bevidence\b/i, "Use of evidence", "Back every claim with a credible source or data."],
    [/\bstructure\b/i, "Structure", "Signpost sections and keep transitions smooth."],
    [/\boriginality\b/i, "Originality", "Bring a fresh angle, not just a summary."],
  ];
  for (const [re, name, guidance] of knownCriteria) {
    if (!re.test(text)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    signals.push({ criterion: name, guidance });
  }

  return signals.slice(0, 8);
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* --------------------------------- Core ----------------------------------- */

function detectDeliverables(text: string): Deliverable[] {
  const found: Deliverable[] = [];
  for (const entry of DELIVERABLE_KEYWORDS) {
    if (entry.patterns.some((p) => p.test(text))) {
      found.push({ type: entry.type, label: entry.label });
    }
  }
  if (found.length === 0) found.push({ type: "other", label: "Written deliverable" });
  return found;
}

function detectRequirements(text: string, wordCount?: number): Requirement[] {
  const found: Requirement[] = [];
  if (wordCount) {
    found.push({
      icon: "wordCount",
      label: `Around ${wordCount.toLocaleString()} words`,
      detail: "Target length detected in the brief.",
    });
  }
  for (const entry of REQUIREMENT_KEYWORDS) {
    if (entry.patterns.some((p) => p.test(text))) {
      found.push({ icon: entry.icon, label: entry.label });
    }
  }
  const seen = new Set<string>();
  return found.filter((r) => {
    if (seen.has(r.label)) return false;
    seen.add(r.label);
    return true;
  });
}

function extractWordCount(text: string): number | undefined {
  const m = text.match(/(\d{3,5})\s*(?:-\s*\d{3,5}\s*)?\b(?:words?|word\s*count|wc)\b/i);
  if (m) return Number(m[1]);
  return undefined;
}

function composeStages(deliverables: Deliverable[]): PlanStage[] {
  const types = new Set(deliverables.map((d) => d.type));
  const stages: PlanStage[] = [];
  for (const t of STAGE_TEMPLATES) {
    const include =
      t.alwaysInclude || (t.appliesTo ? t.appliesTo.some((dt) => types.has(dt)) : false);
    if (!include) continue;
    stages.push({
      id: t.id,
      title: t.title,
      description: t.description,
      subtasks: [...t.subtasks],
      phaseId: t.phaseId,
    });
  }
  return stages;
}

function buildTips(deliverables: Deliverable[]): string[] {
  const tips: string[] = [...GENERAL_TIPS];
  for (const d of deliverables) {
    const extra = DELIVERABLE_TIPS[d.type];
    if (extra) tips.push(...extra);
  }
  return Array.from(new Set(tips)).slice(0, 6);
}

function gradeConfidence(
  deliverables: Deliverable[],
  requirements: Requirement[],
  dueDateISO: string | undefined,
  textLength: number,
): "low" | "medium" | "high" {
  let score = 0;
  if (textLength > 250) score += 1;
  if (textLength > 700) score += 1;
  if (deliverables.some((d) => d.type !== "other")) score += 1;
  if (requirements.length >= 2) score += 1;
  if (dueDateISO) score += 1;
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function estimateHours(deliverables: Deliverable[], wordCount?: number): number | undefined {
  let hours = 0;
  if (wordCount) hours += Math.round(wordCount / 250);
  for (const d of deliverables) {
    switch (d.type) {
      case "research": hours += 6; break;
      case "presentation": hours += 5; break;
      case "code": hours += 10; break;
      case "analysis": hours += 4; break;
      case "reflection": hours += 2; break;
      default: break;
    }
  }
  return hours > 0 ? hours : undefined;
}

function buildRequiredSections(deliverables: Deliverable[]): string[] {
  const sections = new Set<string>();
  for (const d of deliverables) {
    const list = SECTION_LIBRARY[d.type];
    if (list) list.forEach((s) => sections.add(s));
  }
  return Array.from(sections).slice(0, 10);
}

function buildMissingDetails(
  text: string,
  wordCount: number | undefined,
  dueDateISO: string | undefined,
  rubric: RubricSignal[],
  hasReferences: boolean,
): string[] {
  const missing: string[] = [];
  if (!dueDateISO) missing.push("No clear due date detected — confirm the submission deadline before planning.");
  if (!wordCount) missing.push("No word count detected — check the brief or course page for a target length.");
  if (rubric.length === 0) missing.push("No rubric signals detected — find the marking criteria before drafting.");
  if (!hasReferences && /\b(essay|report|research|analysis)\b/i.test(text)) {
    missing.push("Citation style not stated — confirm whether APA, Harvard, IEEE or MLA is required.");
  }
  if (!/\bsubmit|submission|turnitin|upload|portal|lms\b/i.test(text)) {
    missing.push("Submission method not stated — check where and in what format to submit.");
  }
  return missing;
}

function buildSignals(
  wordCount: number | undefined,
  dueDateISO: string | undefined,
  rubric: RubricSignal[],
  requirements: Requirement[],
): FieldSignals {
  return {
    dueDate: dueDateISO ? "confirmed" : "missing",
    wordCount: wordCount ? "confirmed" : "missing",
    rubric: rubric.length > 0 ? "confirmed" : "missing",
    references: requirements.some((r) => r.icon === "references") ? "confirmed" : "missing",
    submission: requirements.some((r) => r.icon === "submission") ? "confirmed" : "missing",
  };
}

/* ---------------------------------- API ---------------------------------- */

export function analyzeBrief(
  briefText: string,
  opts: { now?: Date } = {},
): BriefAnalysis {
  const now = opts.now ?? new Date();
  const text = briefText.replace(/\r/g, "");

  const deliverables = detectDeliverables(text);
  const wordCount = extractWordCount(text);
  const requirements = detectRequirements(text, wordCount);
  const { iso: dueDateISO, phrase: dueDatePhrase } = extractDueDate(text, now);
  const title = extractTitle(text, deliverables);
  const summary = buildSummary(deliverables, requirements, dueDatePhrase, wordCount);
  const stages = composeStages(deliverables);
  const highMarkTips = buildTips(deliverables);
  const confidence = gradeConfidence(deliverables, requirements, dueDateISO, text.length);
  const estimatedHours = estimateHours(deliverables, wordCount);
  const rubricSignals = deriveRubricSignals(text);
  const requiredSections = buildRequiredSections(deliverables);
  const missingDetails = buildMissingDetails(
    text,
    wordCount,
    dueDateISO,
    rubricSignals,
    requirements.some((r) => r.icon === "references"),
  );
  const signals = buildSignals(wordCount, dueDateISO, rubricSignals, requirements);

  return {
    title,
    summary,
    deliverables,
    requirements,
    requiredSections,
    rubricSignals,
    missingDetails,
    dueDateISO,
    dueDatePhrase,
    wordCount,
    stages,
    timeline: DEFAULT_TIMELINE.map((t) => ({ ...t })),
    highMarkTips,
    confidence,
    signals,
    estimatedHours,
    source: "heuristic",
    rawLength: text.length,
  };
}

/* --------------------------- Timeline date helpers ------------------------ */

export interface PhaseDateRange {
  id: string;
  label: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startLabel: string;
  endLabel: string;
}

export function projectTimeline(
  timeline: TimelinePhase[],
  to?: string,
  from: Date = new Date(),
): PhaseDateRange[] | null {
  if (!to) return null;
  const end = new Date(to);
  if (isNaN(+end)) return null;
  const totalDays = Math.max(1, differenceInCalendarDays(end, from));

  let cursor = 0;
  return timeline.map((phase) => {
    const startOffset = cursor;
    const endOffset = Math.max(cursor + 1, Math.round(totalDays * phase.endPortion));
    cursor = endOffset;
    const startDate = addDays(from, startOffset);
    const endDate = addDays(from, endOffset);
    return {
      id: phase.id,
      label: phase.label,
      description: phase.description,
      startDate,
      endDate,
      startLabel: format(startDate, "MMM d"),
      endLabel: format(endDate, "MMM d"),
    };
  });
}
