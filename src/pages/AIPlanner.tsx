/**
 * StudySprint AI Planner page — /ai-planner
 * -----------------------------------------------------------------------------
 * Academic planning workspace. The student drops a PDF / DOCX / pasted brief,
 * the server-side AI endpoint returns a structured analysis, and the page
 * renders a two-column planning desk:
 *
 *   main column  → brief summary, requirements, rubric, action-plan split
 *                   workspace, high-mark guidance, full timeline
 *   right rail   → status, field signals, missing details, pacing summary,
 *                   and a sticky convert-to-assignment panel
 *
 * Visual goal: calm, restrained, credible. Structure and typography do the
 * heavy lifting — a single violet accent is used sparingly instead of layered
 * gradients, glowing halos, and coloured chips.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Compass,
  FileText,
  Flag,
  GraduationCap,
  Hash,
  Hourglass,
  Info,
  Layers,
  Lightbulb,
  ListChecks,
  Loader2,
  Lock,
  Paperclip,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  SquarePen,
  Target,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { format } from "date-fns";

import Button from "../components/ui/Button";
import Textarea from "../components/ui/Textarea";
import { usePlanner } from "../context/usePlanner";
import { useToast } from "../context/useToast";
import { cn } from "../lib/utils";
import { projectTimeline } from "../lib/briefAnalyzer";
import { extractBriefFromFile } from "../lib/briefExtract";
import { requestBriefAnalysis } from "../lib/aiPlannerClient";
import type {
  BriefAnalysis,
  Deliverable,
  FieldSignals,
  PlanStage,
  Requirement,
  RequirementIcon,
  RubricSignal,
  SignalConfidence,
} from "../types/briefAnalysis";
import type { Priority } from "../types";

/* --------------------------------- Sample --------------------------------- */

const SAMPLE_BRIEF = `Assignment Title: Software Engineering Group Report — Design Proposal

Overview:
You and your team will propose a software solution to a real-world problem.
The report must include a problem statement, stakeholder analysis, design
approach, comparison of alternatives, and a recommended solution.

Requirements:
- 2,500 words
- At least 6 credible academic references (IEEE format)
- Submission via Turnitin as a single PDF
- Marked against the attached rubric (clarity 25%, analysis 35%,
  argument 25%, presentation 15%)

Due: Submit by 15 November. A 10-minute group presentation in week 11 will
summarise your proposal. This is a group submission (teams of 3).`;

const PRIORITY_OPTIONS: Priority[] = ["Low", "Medium", "High", "Urgent"];

const ANALYSIS_STEPS = [
  "Reading your brief carefully",
  "Identifying deliverables and requirements",
  "Mapping rubric signals and constraints",
  "Structuring a stage-by-stage action plan",
  "Pacing the work between now and your due date",
];

const ACCEPTED_FILE_TYPES =
  ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown";

/* ------------------------------ Phase identity ---------------------------- */
/**
 * Subtle per-phase treatment. We stay in the violet-blue range for the primary
 * accent, and let each phase earn a small distinguishing hue — used only as a
 * hair-thin accent bar, a dot, or a micro-label. Never as a full background.
 */
type PhaseKey = "discover" | "research" | "draft" | "refine" | "polish";

interface PhaseTheme {
  label: string;
  icon: ReactNode;
  /** 2px top/left accent bar colour */
  bar: string;
  /** small solid dot */
  dot: string;
  /** quiet text colour for the phase label itself */
  text: string;
  /** soft tint for phase chip background */
  chip: string;
  /** border when a phase chip/card needs a whisper of the hue */
  ring: string;
}

const PHASE_THEME: Record<PhaseKey, PhaseTheme> = {
  discover: {
    label: "Discover",
    icon: <Compass size={10} />,
    bar: "bg-sky-400/70 dark:bg-sky-400/80",
    dot: "bg-sky-400",
    text: "text-sky-700 dark:text-sky-300",
    chip: "bg-sky-50 dark:bg-sky-500/10",
    ring: "ring-sky-200/70 dark:ring-sky-500/20",
  },
  research: {
    label: "Research",
    icon: <Search size={10} />,
    bar: "bg-indigo-400/70 dark:bg-indigo-400/80",
    dot: "bg-indigo-400",
    text: "text-indigo-700 dark:text-indigo-300",
    chip: "bg-indigo-50 dark:bg-indigo-500/10",
    ring: "ring-indigo-200/70 dark:ring-indigo-500/20",
  },
  draft: {
    label: "Draft",
    icon: <PenLine size={10} />,
    bar: "bg-violet-500/80 dark:bg-violet-400/90",
    dot: "bg-violet-500 dark:bg-violet-400",
    text: "text-violet-700 dark:text-violet-300",
    chip: "bg-violet-50 dark:bg-violet-500/10",
    ring: "ring-violet-200/70 dark:ring-violet-500/20",
  },
  refine: {
    label: "Refine",
    icon: <SquarePen size={10} />,
    bar: "bg-fuchsia-400/70 dark:bg-fuchsia-400/80",
    dot: "bg-fuchsia-400",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    chip: "bg-fuchsia-50 dark:bg-fuchsia-500/10",
    ring: "ring-fuchsia-200/70 dark:ring-fuchsia-500/20",
  },
  polish: {
    label: "Polish",
    icon: <Sparkles size={10} />,
    bar: "bg-emerald-400/70 dark:bg-emerald-400/80",
    dot: "bg-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300",
    chip: "bg-emerald-50 dark:bg-emerald-500/10",
    ring: "ring-emerald-200/70 dark:ring-emerald-500/20",
  },
};

const FALLBACK_PHASE: PhaseTheme = {
  label: "Stage",
  icon: <CircleDot size={10} />,
  bar: "bg-slate-400/70 dark:bg-slate-500/70",
  dot: "bg-slate-400",
  text: "text-slate-600 dark:text-slate-300",
  chip: "bg-slate-100 dark:bg-slate-800/60",
  ring: "ring-slate-200/70 dark:ring-slate-700/60",
};

function phaseTheme(phaseId: string | undefined): PhaseTheme {
  if (!phaseId) return FALLBACK_PHASE;
  return (PHASE_THEME as Record<string, PhaseTheme | undefined>)[phaseId] ?? FALLBACK_PHASE;
}

/**
 * Safe wrapper around `format(new Date(...), pattern)`. Returns the fallback
 * string when the input doesn't parse as a real date instead of letting
 * date-fns throw `RangeError: Invalid time value` and crashing the page.
 *
 * The server normalises `dueDateISO` before sending it, but this gives the UI
 * a second line of defence in case persisted state, third-party imports, or a
 * future provider returns something unparseable.
 */
function safeFormat(value: string | undefined, pattern: string, fallback = ""): string {
  if (!value) return fallback;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return fallback;
  return format(new Date(time), pattern);
}

/** Split the first sentence off a summary so we can render it as a hero line. */
function splitSummary(summary: string): { hero: string; rest: string } {
  const trimmed = summary.trim();
  if (!trimmed) return { hero: "", rest: "" };
  const match = trimmed.match(/^(.+?[.!?])(\s+)(.*)$/s);
  if (!match) return { hero: trimmed, rest: "" };
  let hero = match[1].trim();
  let rest = match[3].trim();

  // If the first sentence is too terse (e.g. "Overview."), fold the next
  // sentence into the hero line so it still reads as a distilled statement.
  if (hero.length < 40 && rest.length > 0) {
    const next = rest.match(/^(.+?[.!?])(\s+)(.*)$/s);
    if (next) {
      hero = `${hero} ${next[1].trim()}`.trim();
      rest = next[3].trim();
    } else {
      hero = `${hero} ${rest}`.trim();
      rest = "";
    }
  }
  return { hero, rest };
}

/* --------------------------------- Page ----------------------------------- */

export default function AIPlanner() {
  const { subjects, addAssignment } = usePlanner();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [brief, setBrief] = useState<string>("");
  const [fileMeta, setFileMeta] = useState<{ name: string; kind: string; pages?: number } | null>(
    null,
  );
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<BriefAnalysis | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  const [includedStageIds, setIncludedStageIds] = useState<Set<string>>(new Set());
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("High");
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedDueDate, setEditedDueDate] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = brief.length;
  const canAnalyze = charCount >= 40 && !isAnalyzing && !isExtracting;

  const timeline = useMemo(
    () => (analysis ? projectTimeline(analysis.timeline, analysis.dueDateISO) : null),
    [analysis],
  );

  const selectedStage = useMemo(
    () => analysis?.stages.find((s) => s.id === selectedStageId) ?? null,
    [analysis, selectedStageId],
  );

  /* --------------------------- Input interactions --------------------------- */

  /**
   * Run a dropped or picked file through the client-side extractor. We pull
   * the text into the brief textarea instead of sending the raw file to the
   * server so the user can review/edit the extracted text before triggering
   * the AI call. Errors (encrypted PDF, scanned image, oversized file) are
   * surfaced both inline and as a toast.
   */
  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setExtractionError(null);
    setIsExtracting(true);
    try {
      const extracted = await extractBriefFromFile(file);
      setBrief(extracted.text);
      setFileMeta({
        name: extracted.filename,
        kind: extracted.kind,
        pages: extracted.pageCount,
      });
      showToast({
        tone: "success",
        message:
          extracted.kind === "pdf" && extracted.pageCount
            ? `Extracted ${extracted.pageCount}-page PDF — ready to analyse.`
            : `Loaded ${extracted.filename} — ready to analyse.`,
        durationMs: 3000,
      });
    } catch (err) {
      const message = (err as Error).message;
      setExtractionError(message);
      showToast({ tone: "warning", message, durationMs: 4800 });
    } finally {
      setIsExtracting(false);
    }
  }

  /** Drag-and-drop handler for the upload zone — first file wins. */
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    void handleFile(file);
  }

  /**
   * Native file-input change. We reset `event.target.value` so the user can
   * immediately re-pick the same file after clearing — without that, the
   * input would fire no change event for an identical name.
   */
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    void handleFile(file);
    event.target.value = "";
  }

  /** Drop the demo brief into the editor so first-time visitors can try the planner without their own file. */
  function handleLoadSample() {
    setBrief(SAMPLE_BRIEF);
    setFileMeta(null);
    setExtractionError(null);
  }

  /** Reset the workspace to its empty state — both the input side and any rendered analysis. */
  function handleClear() {
    setBrief("");
    setFileMeta(null);
    setAnalysis(null);
    setIncludedStageIds(new Set());
    setSelectedStageId(null);
    setWarnings([]);
    setFallbackReason(null);
    setExtractionError(null);
  }

  /* ------------------------------- Analysis ------------------------------- */

  // While the analysis is in flight, walk through ANALYSIS_STEPS at ~850 ms
  // intervals so the progress copy reads as a real sequence ("reading…",
  // "identifying deliverables…") instead of a static spinner. The interval
  // clears as soon as `isAnalyzing` flips back to false.
  useEffect(() => {
    if (!isAnalyzing) return;
    setAnalysisStep(0);
    const interval = window.setInterval(() => {
      setAnalysisStep((prev) => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
    }, 850);
    return () => window.clearInterval(interval);
  }, [isAnalyzing]);

  /**
   * Kick off the AI Planner request. The fetch helper handles transport and
   * server fallbacks; this function focuses on UI state: loading, success
   * (seed the editable plan + due date + subject), and graceful warning when
   * we ended up on the on-device fallback.
   */
  async function runAnalysis() {
    if (!canAnalyze) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setWarnings([]);
    setFallbackReason(null);

    try {
      const result = await requestBriefAnalysis({
        brief,
        filename: fileMeta?.name,
      });
      setAnalysis(result.analysis);
      setWarnings(result.warnings);
      setFallbackReason(result.fallbackReason ?? null);
      setIncludedStageIds(new Set(result.analysis.stages.map((s) => s.id)));
      setSelectedStageId(result.analysis.stages[0]?.id ?? null);
      setEditedTitle(result.analysis.title);
      setEditedDueDate(safeFormat(result.analysis.dueDateISO, "yyyy-MM-dd"));
      setSubjectId((prev) => prev || subjects[0]?.id || "");

      if (result.fallbackReason) {
        showToast({
          tone: "warning",
          message:
            "Using on-device fallback — the AI service wasn't reachable. Plan is still editable.",
          durationMs: 4600,
        });
      }
    } catch (err) {
      showToast({
        tone: "warning",
        message: `Analysis failed: ${(err as Error).message}`,
        durationMs: 4600,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  /* --------------------------- Stage interactions --------------------------- */

  /** Add or remove a stage from the "include in conversion" set without mutating the analysis. */
  function toggleStage(stageId: string) {
    setIncludedStageIds((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }

  /** Drop a single suggested subtask before conversion (e.g. doesn't apply to this brief). */
  function removeSubtask(stageId: string, index: number) {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      stages: analysis.stages.map((s) =>
        s.id === stageId
          ? { ...s, subtasks: s.subtasks.filter((_, i) => i !== index) }
          : s,
      ),
    });
  }

  /** Inline rename of a generated subtask before it becomes a real assignment subtask. */
  function updateSubtaskText(stageId: string, index: number, value: string) {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      stages: analysis.stages.map((s) =>
        s.id === stageId
          ? { ...s, subtasks: s.subtasks.map((t, i) => (i === index ? value : t)) }
          : s,
      ),
    });
  }

  /** Append a placeholder subtask that the student can rename inline. */
  function addSubtask(stageId: string) {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      stages: analysis.stages.map((s) =>
        s.id === stageId ? { ...s, subtasks: [...s.subtasks, "New subtask"] } : s,
      ),
    });
  }

  /* ------------------------- Convert to StudySprint ------------------------ */

  /**
   * Turn the (edited) AI plan into a real StudySprint assignment.
   *
   * Strategy:
   *   - Validate that the student picked a subject and gave a title.
   *   - Resolve a due date in priority: edited input → analysis-detected ISO
   *     → 14 days from now as a safe placeholder.
   *   - Flatten only the *included* stages into prefixed subtask titles
   *     (e.g. "[Research] Find 5 academic sources") so the subtasks stay
   *     contextualised inside the assignment view.
   *   - Hand off to PlannerContext.addAssignment, then navigate the user
   *     straight into the new card with an "Open" undo-style toast.
   */
  function handleConvertToAssignment() {
    if (!analysis) return;
    if (!subjectId) {
      showToast({
        tone: "warning",
        message: "Pick a subject so StudySprint knows where this plan belongs.",
        durationMs: 3800,
      });
      return;
    }
    if (!editedTitle.trim()) {
      showToast({
        tone: "warning",
        message: "Give your assignment a title before converting.",
        durationMs: 3400,
      });
      return;
    }

    const dueISO = editedDueDate
      ? new Date(`${editedDueDate}T18:00:00`).toISOString()
      : analysis.dueDateISO
      ? analysis.dueDateISO
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const selectedStages = analysis.stages.filter((s) => includedStageIds.has(s.id));
    const subtaskTitles = selectedStages.flatMap((stage) =>
      stage.subtasks.length > 0
        ? stage.subtasks.map((t) => `[${stage.title}] ${t}`)
        : [stage.title],
    );

    const id = addAssignment({
      title: editedTitle.trim(),
      subjectId,
      dueDate: dueISO,
      priority,
      notes: `Generated from AI Planner (${
        analysis.source === "llm" ? analysis.model || "LLM" : "on-device planner"
      }).\n\n${analysis.summary}`,
      subtasks: subtaskTitles,
    });

    showToast({
      tone: "success",
      message: `Created "${editedTitle.trim()}" with ${subtaskTitles.length} subtasks.`,
      durationMs: 4200,
      action: {
        label: "Open",
        onPress: () => navigate(`/assignments/${id}`),
      },
    });
    navigate(`/assignments/${id}`);
  }

  const totalSelectedSubtasks = useMemo(() => {
    if (!analysis) return 0;
    return analysis.stages
      .filter((s) => includedStageIds.has(s.id))
      .reduce((acc, s) => acc + s.subtasks.length, 0);
  }, [analysis, includedStageIds]);

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader />

      <InputStudio
        brief={brief}
        setBrief={setBrief}
        charCount={charCount}
        isAnalyzing={isAnalyzing}
        isExtracting={isExtracting}
        canAnalyze={canAnalyze}
        fileMeta={fileMeta}
        extractionError={extractionError}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        onDrop={handleDrop}
        onFileChange={handleFileChange}
        onPickFile={() => fileInputRef.current?.click()}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        onAnalyze={runAnalysis}
        onClearFile={() => {
          setFileMeta(null);
          setBrief("");
        }}
        fileInputRef={fileInputRef}
      />

      {isAnalyzing && <AnalyzingState activeStep={analysisStep} />}

      {analysis && !isAnalyzing && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main working area */}
          <div className="min-w-0 space-y-5">
            <AnalysisHeader analysis={analysis} onReset={handleClear} />

            {fallbackReason && <FallbackBanner reason={fallbackReason} />}

            {warnings.length > 0 && <WarningsCard warnings={warnings} />}

            <SummaryCard analysis={analysis} />

            <RequirementsCard
              deliverables={analysis.deliverables}
              requirements={analysis.requirements}
              requiredSections={analysis.requiredSections}
            />

            {analysis.rubricSignals.length > 0 && (
              <RubricCard signals={analysis.rubricSignals} />
            )}

            <ActionPlanWorkspace
              stages={analysis.stages}
              selectedStageId={selectedStageId}
              setSelectedStageId={setSelectedStageId}
              selectedStage={selectedStage}
              includedStageIds={includedStageIds}
              onToggleStage={toggleStage}
              onRemoveSubtask={removeSubtask}
              onUpdateSubtask={updateSubtaskText}
              onAddSubtask={addSubtask}
            />

            {timeline && timeline.length > 0 && analysis.dueDateISO && (
              <TimelineCard phases={timeline} dueDateISO={analysis.dueDateISO} />
            )}

            {analysis.highMarkTips.length > 0 && (
              <HighMarkCard tips={analysis.highMarkTips} />
            )}

            <EthicalNote source={analysis.source} model={analysis.model} />
          </div>

          {/* Right rail */}
          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <StatusCard analysis={analysis} />
            <SignalsCard signals={analysis.signals} />
            {analysis.missingDetails.length > 0 && (
              <MissingDetailsCard items={analysis.missingDetails} />
            )}
            {timeline && timeline.length > 0 && (
              <PacingRailCard phases={timeline} dueDateISO={analysis.dueDateISO} />
            )}
            <ConvertPanel
              subjects={subjects}
              subjectId={subjectId}
              setSubjectId={setSubjectId}
              editedTitle={editedTitle}
              setEditedTitle={setEditedTitle}
              editedDueDate={editedDueDate}
              setEditedDueDate={setEditedDueDate}
              priority={priority}
              setPriority={setPriority}
              includedStages={analysis.stages.filter((s) => includedStageIds.has(s.id)).length}
              totalStages={analysis.stages.length}
              totalSubtasks={totalSelectedSubtasks}
              onConvert={handleConvertToAssignment}
            />
          </aside>
        </section>
      )}

      {!analysis && !isAnalyzing && <IntroExamples onLoadSample={handleLoadSample} />}
    </div>
  );
}

/* ============================================================================
 * Header
 * ========================================================================== */

function PageHeader() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Planner
        </p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[26px]">
          Assignment planner
        </h1>
        <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">
          Upload or paste an assignment brief. StudySprint interprets the
          requirements and lays out a staged plan you can refine before turning
          it into a real assignment. It helps you plan — it doesn&apos;t write
          the work.
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <Lock size={11} className="text-emerald-600 dark:text-emerald-400" />
        Server-side · not stored
      </span>
    </header>
  );
}

/* ============================================================================
 * Input studio
 * ========================================================================== */

interface InputStudioProps {
  brief: string;
  setBrief: (value: string) => void;
  charCount: number;
  isAnalyzing: boolean;
  isExtracting: boolean;
  canAnalyze: boolean;
  fileMeta: { name: string; kind: string; pages?: number } | null;
  extractionError: string | null;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPickFile: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  onAnalyze: () => void;
  onClearFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function InputStudio({
  brief,
  setBrief,
  charCount,
  isAnalyzing,
  isExtracting,
  canAnalyze,
  fileMeta,
  extractionError,
  isDragging,
  setIsDragging,
  onDrop,
  onFileChange,
  onPickFile,
  onLoadSample,
  onClear,
  onAnalyze,
  onClearFile,
  fileInputRef,
}: InputStudioProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm transition-colors sm:p-6 dark:bg-[#0a1020]",
        isDragging
          ? "border-violet-400 ring-2 ring-violet-200/60 dark:border-violet-500 dark:ring-violet-900/50"
          : "border-slate-200 dark:border-slate-800",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
            Your brief
          </h2>
          <p className="mt-1 max-w-2xl text-[12.5px] text-slate-600 dark:text-slate-400">
            PDF, DOCX, or pasted text. The more context (brief + rubric + word
            count + due date), the sharper the plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadSample}
            iconLeft={<Wand2 size={12} />}
          >
            Load sample
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Drop zone */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onPickFile}
          disabled={isExtracting}
          className={cn(
            "group flex w-full flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed p-6 text-center transition-colors",
            isDragging
              ? "border-violet-500 bg-violet-50/60 dark:border-violet-400 dark:bg-violet-950/25"
              : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600 dark:hover:bg-slate-900/60",
            isExtracting && "cursor-wait opacity-80",
          )}
          aria-label="Upload assignment brief"
        >
          <span className="inline-flex size-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {isExtracting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
              {isExtracting ? "Extracting your brief…" : "Drop a PDF, DOCX, or text file"}
            </p>
            <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
              Click to browse · up to 20 MB · scanned PDFs need a text-copy export
            </p>
          </div>
        </button>

        {fileMeta && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-[12px] text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200">
            <span className="flex items-center gap-2 min-w-0">
              <Paperclip size={12} className="shrink-0 text-slate-400" />
              <span className="truncate font-medium">{fileMeta.name}</span>
              <span className="shrink-0 rounded-sm bg-slate-200/80 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {fileMeta.kind}
              </span>
              {fileMeta.pages != null && (
                <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
                  · {fileMeta.pages} pages
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={onClearFile}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-200/80 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={11} /> Remove
            </button>
          </div>
        )}

        {extractionError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>{extractionError}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="relative mt-5 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        Or paste the brief
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="mt-3">
        <Textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={8}
          placeholder="Paste the assignment brief, rubric, and any submission instructions here."
          className="min-h-[160px] resize-y text-[13.5px] leading-relaxed"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
          <Info size={12} />
          Drag &amp; drop supported · {charCount.toLocaleString()} chars
        </span>
        <div className="flex items-center gap-2">
          {brief.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              iconLeft={<RefreshCw size={12} />}
            >
              Start over
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onAnalyze}
            disabled={!canAnalyze}
            iconLeft={
              isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />
            }
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:bg-violet-600 dark:hover:bg-violet-500 dark:disabled:bg-slate-700"
          >
            {isAnalyzing ? "Analysing brief…" : "Analyse brief"}
          </Button>
        </div>
      </div>

      {charCount > 0 && charCount < 40 && (
        <p className="mt-2 text-[11.5px] text-amber-700 dark:text-amber-300">
          Add a little more context (40+ characters) so the planner has enough signal.
        </p>
      )}
    </section>
  );
}

/* ============================================================================
 * Analysing state
 * ========================================================================== */

function AnalyzingState({ activeStep }: { activeStep: number }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0a1020] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">
          <Loader2 size={16} className="animate-spin" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Working on your brief
          </p>
          <h3 className="mt-0.5 text-[15px] font-semibold text-slate-900 dark:text-white">
            Turning instructions into a plan
          </h3>
          <ul className="mt-3 space-y-1.5 text-[12.5px] text-slate-700 dark:text-slate-300">
            {ANALYSIS_STEPS.map((step, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <li
                  key={step}
                  className={cn(
                    "flex items-center gap-2 transition-opacity",
                    i > activeStep && "opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded-full transition-colors",
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                        ? "bg-violet-500 text-white"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                    )}
                  >
                    {done ? (
                      <Check size={9} />
                    ) : active ? (
                      <Loader2 size={9} className="animate-spin" />
                    ) : null}
                  </span>
                  <span className={cn(active && "font-semibold text-slate-900 dark:text-white")}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * Fallback / warnings banners
 * ========================================================================== */

function FallbackBanner({ reason }: { reason: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-2.5 text-[12.5px] leading-snug text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/[0.07] dark:text-amber-200">
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
      <span>
        <span className="font-semibold">On-device fallback in use.</span>{" "}
        The AI service wasn&apos;t reachable ({reason}). This plan came from
        the built-in heuristic planner — still fully editable and convertible.
      </span>
    </div>
  );
}

function WarningsCard({ warnings }: { warnings: string[] }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/60 px-5 py-4 text-amber-900 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/[0.06] dark:text-amber-100">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-amber-400/80 dark:bg-amber-400/60"
      />
      <header className="flex items-center gap-2.5">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30">
          <AlertTriangle size={13} />
        </span>
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
            Review checkpoint
          </p>
          <h3 className="text-[14px] font-semibold leading-tight text-amber-900 dark:text-amber-50">
            Read these before you convert
          </h3>
        </div>
      </header>
      <ul className="mt-3 space-y-2 pl-1">
        {warnings.map((w) => (
          <li
            key={w}
            className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-amber-900/90 dark:text-amber-100/90"
          >
            <span className="mt-[7px] inline-block size-[5px] shrink-0 rounded-full bg-amber-500/90 dark:bg-amber-300" />
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ============================================================================
 * Analysis header (title + quiet meta)
 * ========================================================================== */

function AnalysisHeader({
  analysis,
  onReset,
}: {
  analysis: BriefAnalysis;
  onReset: () => void;
}) {
  const isLLM = analysis.source === "llm";
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 pb-3 dark:border-slate-800/80">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          Analysis complete
        </span>

        <span className="hidden h-3 w-px bg-slate-200 dark:bg-slate-800 sm:inline-block" />

        <div className="flex min-w-0 flex-col leading-tight">
          <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-700 dark:text-slate-200">
            {isLLM ? (
              <Sparkles size={11} className="text-violet-500 dark:text-violet-300" />
            ) : (
              <ListChecks size={11} className="text-slate-500 dark:text-slate-400" />
            )}
            <span className="truncate">
              {isLLM ? analysis.model ?? "Language model" : "On-device planner"}
            </span>
          </span>
          <span className="text-[10.5px] text-slate-500 dark:text-slate-500">
            {isLLM
              ? "AI-assisted interpretation · verify against your brief"
              : "Heuristic interpretation · no AI model available"}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        iconLeft={<RefreshCw size={12} />}
        className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        New brief
      </Button>
    </div>
  );
}

/* ============================================================================
 * Summary
 * ========================================================================== */

function SummaryCard({ analysis }: { analysis: BriefAnalysis }) {
  const { hero, rest } = splitSummary(analysis.summary);
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0a1020]">
      {/* subtle hairline accent */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent dark:via-violet-500/40"
      />

      <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        <span className="inline-flex size-4 items-center justify-center rounded-sm bg-violet-100/80 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          <ListChecks size={10} />
        </span>
        Brief summary
      </div>

      <p className="mt-2 text-[13px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {analysis.title}
      </p>

      {hero && (
        <p className="mt-2 text-[18px] font-semibold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-[19px]">
          {hero}
        </p>
      )}

      {rest && (
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
          {rest}
        </p>
      )}

      {(analysis.wordCount || analysis.dueDatePhrase) && (
        <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80 sm:grid-cols-2">
          {analysis.dueDatePhrase ? (
            <FactRow
              icon={<CalendarIcon size={13} />}
              label="Due"
              value={
                safeFormat(analysis.dueDateISO, "EEE d MMM yyyy") ||
                analysis.dueDatePhrase
              }
              sub={
                analysis.dueDateISO && analysis.dueDatePhrase
                  ? analysis.dueDatePhrase
                  : undefined
              }
            />
          ) : null}
          {analysis.wordCount ? (
            <FactRow
              icon={<Hash size={13} />}
              label="Word count"
              value={`${analysis.wordCount.toLocaleString()}`}
              sub="words"
            />
          ) : null}
        </dl>
      )}
    </article>
  );
}

function FactRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100/80 text-slate-600 ring-1 ring-slate-200/70 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-700/60">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
          {label}
        </dt>
        <dd className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
          {sub && (
            <span className="text-[11.5px] text-slate-500 dark:text-slate-400">{sub}</span>
          )}
        </dd>
      </div>
    </div>
  );
}

/* ============================================================================
 * Requirements
 * ========================================================================== */

function RequirementsCard({
  deliverables,
  requirements,
  requiredSections,
}: {
  deliverables: Deliverable[];
  requirements: Requirement[];
  requiredSections: string[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0a1020]">
      <header>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Requirements
        </p>
        <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-slate-900 dark:text-white">
          What this assignment expects
        </h3>
      </header>

      <div className="mt-5 space-y-6">
        {/* ───────── Tier 1 · Deliverables (primary) ───────── */}
        {deliverables.length > 0 && (
          <Subsection tier="primary" title="You'll produce" caption="Deliverables">
            <ul className="space-y-2">
              {deliverables.map((d) => (
                <li
                  key={d.label}
                  className="flex items-start gap-3 rounded-lg border border-slate-200/70 bg-slate-50/60 px-3.5 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/40"
                >
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-600 ring-1 ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20">
                    {iconForDeliverable(d.type)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold leading-snug text-slate-900 dark:text-white">
                      {d.label}
                    </p>
                    {d.detail && (
                      <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                        {d.detail}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Subsection>
        )}

        {/* ───────── Tier 2 · Expectations (secondary) ───────── */}
        <Subsection tier="secondary" title="What the brief expects" caption="Constraints">
          {requirements.length === 0 ? (
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
              No explicit constraints detected. Double-check the original brief for word
              count, formatting, or citation style.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {requirements.map((r) => (
                <li
                  key={r.label}
                  className="flex items-start gap-2.5 rounded-md border border-slate-200/80 bg-white px-3 py-2 text-[12.5px] text-slate-700 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-200"
                >
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {iconForRequirement(r.icon)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-semibold leading-tight text-slate-900 dark:text-white">
                      {r.label}
                    </span>
                    {r.detail && (
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-slate-500 dark:text-slate-400">
                        {r.detail}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Subsection>

        {/* ───────── Tier 3 · Likely sections (tertiary) ───────── */}
        {requiredSections.length > 0 && (
          <Subsection
            tier="tertiary"
            title="Likely sections in your artefact"
            caption="Structure hints"
          >
            <ul className="flex flex-wrap gap-1.5">
              {requiredSections.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                >
                  {s}
                </li>
              ))}
            </ul>
          </Subsection>
        )}
      </div>
    </article>
  );
}

function Subsection({
  title,
  caption,
  tier,
  children,
}: {
  title: string;
  caption?: string;
  tier: "primary" | "secondary" | "tertiary";
  children: ReactNode;
}) {
  const titleClass =
    tier === "primary"
      ? "text-[14px] font-semibold tracking-tight text-slate-900 dark:text-white"
      : tier === "secondary"
      ? "text-[13px] font-semibold text-slate-800 dark:text-slate-100"
      : "text-[12px] font-semibold text-slate-600 dark:text-slate-300";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h4 className={titleClass}>{title}</h4>
        {caption && (
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            {caption}
          </span>
        )}
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function iconForDeliverable(type: Deliverable["type"]) {
  switch (type) {
    case "report":
    case "analysis":
      return <FileText size={13} />;
    case "essay":
      return <PenLine size={13} />;
    case "presentation":
      return <Target size={13} />;
    case "research":
      return <BookOpen size={13} />;
    case "code":
      return <Layers size={13} />;
    case "reflection":
      return <SquarePen size={13} />;
    case "quiz":
      return <ListChecks size={13} />;
    case "group":
      return <GraduationCap size={13} />;
    default:
      return <ClipboardList size={13} />;
  }
}

function iconForRequirement(icon: RequirementIcon) {
  switch (icon) {
    case "wordCount":
      return <FileText size={11} />;
    case "references":
      return <BookOpen size={11} />;
    case "format":
      return <Layers size={11} />;
    case "group":
      return <GraduationCap size={11} />;
    case "submission":
      return <Upload size={11} />;
    case "rubric":
      return <Target size={11} />;
    default:
      return <Info size={11} />;
  }
}

/* ============================================================================
 * Rubric
 * ========================================================================== */

function RubricCard({ signals }: { signals: RubricSignal[] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0a1020]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Rubric interpretation
          </p>
          <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-slate-900 dark:text-white">
            How the marker will read your work
          </h3>
        </div>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="tabular-nums text-slate-800 dark:text-slate-200">
            {signals.length}
          </span>{" "}
          criteria detected
        </p>
      </header>

      <ol className="mt-5 space-y-2.5">
        {signals.map((s, i) => (
          <li
            key={s.criterion}
            className="group relative flex gap-4 rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3.5 transition-colors hover:border-slate-300/80 hover:bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-900/30 dark:hover:border-slate-700 dark:hover:bg-slate-900/50"
          >
            <span className="flex flex-col items-center">
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-white text-[11px] font-semibold tabular-nums text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                {String(i + 1).padStart(2, "0")}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-[14px] font-semibold tracking-tight text-slate-900 dark:text-white">
                  {s.criterion}
                </p>
                {s.weight && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-violet-700 ring-1 ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20">
                    <Target size={9} />
                    {s.weight}
                  </span>
                )}
              </div>
              {s.guidance && (
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {s.guidance}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

/* ============================================================================
 * Action plan — split workspace
 * ========================================================================== */

function ActionPlanWorkspace({
  stages,
  selectedStageId,
  setSelectedStageId,
  selectedStage,
  includedStageIds,
  onToggleStage,
  onRemoveSubtask,
  onUpdateSubtask,
  onAddSubtask,
}: {
  stages: PlanStage[];
  selectedStageId: string | null;
  setSelectedStageId: (id: string) => void;
  selectedStage: PlanStage | null;
  includedStageIds: Set<string>;
  onToggleStage: (id: string) => void;
  onRemoveSubtask: (stageId: string, index: number) => void;
  onUpdateSubtask: (stageId: string, index: number, value: string) => void;
  onAddSubtask: (stageId: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0a1020]">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 p-6 pb-4 dark:border-slate-800/80">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="inline-flex size-4 items-center justify-center rounded-sm bg-violet-100/80 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <Flag size={10} />
            </span>
            Action plan
          </div>
          <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-slate-900 dark:text-white">
            Work through each stage
          </h3>
          <p className="mt-1 max-w-md text-[12.5px] text-slate-500 dark:text-slate-400">
            Pick a stage to inspect and edit its subtasks. Only included stages are
            converted into the assignment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
            <span className="inline-flex size-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
            <span>
              <span className="tabular-nums text-slate-900 dark:text-white">
                {includedStageIds.size}
              </span>{" "}
              of{" "}
              <span className="tabular-nums">{stages.length}</span> included
            </span>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-[minmax(0,288px)_minmax(0,1fr)]">
        {/* ───────── Stage list ───────── */}
        <ol className="max-h-[480px] overflow-y-auto bg-slate-50/30 p-2 md:border-r md:border-slate-100 dark:bg-slate-950/40 dark:md:border-slate-800/80">
          {stages.map((stage, index) => {
            const included = includedStageIds.has(stage.id);
            const active = selectedStageId === stage.id;
            const theme = phaseTheme(stage.phaseId);
            return (
              <li key={stage.id} className="mb-1 last:mb-0">
                <button
                  type="button"
                  onClick={() => setSelectedStageId(stage.id)}
                  className={cn(
                    "group relative flex w-full items-start gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-left transition-colors",
                    active
                      ? "bg-white shadow-[0_1px_0_0_rgba(15,23,42,0.04)] ring-1 ring-violet-300/80 dark:bg-slate-900/70 dark:ring-violet-500/40"
                      : "hover:bg-white/70 dark:hover:bg-slate-900/50",
                  )}
                >
                  {/* Active rail */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-1 left-0 w-[3px] rounded-full transition-opacity",
                      theme.bar,
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-50",
                    )}
                  />

                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums ring-1 transition-colors",
                      included
                        ? "bg-violet-600 text-white ring-violet-500 dark:bg-violet-500 dark:ring-violet-400/60"
                        : "bg-white text-slate-500 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[13px] font-semibold leading-tight",
                        active
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-700 dark:text-slate-200",
                      )}
                    >
                      {stage.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px]">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold uppercase tracking-wider",
                          theme.chip,
                          theme.text,
                        )}
                      >
                        <span className={cn("size-1 rounded-full", theme.dot)} />
                        {theme.label}
                      </span>
                      <span className="text-slate-500 dark:text-slate-500">
                        <span className="tabular-nums">{stage.subtasks.length}</span>{" "}
                        subtask{stage.subtasks.length === 1 ? "" : "s"}
                      </span>
                      {!included && (
                        <span className="text-slate-400 dark:text-slate-600">· Excluded</span>
                      )}
                    </span>
                  </span>

                  <ChevronRight
                    size={13}
                    className={cn(
                      "mt-1 shrink-0 transition-colors",
                      active
                        ? "text-violet-600 dark:text-violet-300"
                        : "text-slate-300 dark:text-slate-700",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ol>

        {/* ───────── Stage detail ───────── */}
        <div className="min-h-[320px] p-6">
          {selectedStage ? (
            <StageDetail
              stage={selectedStage}
              included={includedStageIds.has(selectedStage.id)}
              onToggle={() => onToggleStage(selectedStage.id)}
              onRemoveSubtask={(i) => onRemoveSubtask(selectedStage.id, i)}
              onUpdateSubtask={(i, v) => onUpdateSubtask(selectedStage.id, i, v)}
              onAddSubtask={() => onAddSubtask(selectedStage.id)}
            />
          ) : (
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
              Select a stage to see its details.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function StageDetail({
  stage,
  included,
  onToggle,
  onRemoveSubtask,
  onUpdateSubtask,
  onAddSubtask,
}: {
  stage: PlanStage;
  included: boolean;
  onToggle: () => void;
  onRemoveSubtask: (index: number) => void;
  onUpdateSubtask: (index: number, value: string) => void;
  onAddSubtask: () => void;
}) {
  const theme = phaseTheme(stage.phaseId);
  return (
    <div className="group flex h-full flex-col">
      {/* Phase identity strip */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
              theme.chip,
              theme.text,
            )}
          >
            <span className={cn("inline-flex", theme.text)}>{theme.icon}</span>
            {theme.label} phase
          </div>
          <h4 className="mt-2 text-[17px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
            {stage.title}
          </h4>
          {stage.description && (
            <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">
              {stage.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
            included
              ? "border-violet-300/80 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-200 dark:hover:bg-violet-500/25"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900",
          )}
          aria-pressed={included}
        >
          {included ? <CheckCircle2 size={12} /> : <Plus size={12} className="rotate-45" />}
          {included ? "Included" : "Excluded"}
        </button>
      </div>

      {/* Subtasks */}
      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <div className="flex items-baseline justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Subtasks
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            <span className="tabular-nums text-slate-600 dark:text-slate-300">
              {stage.subtasks.length}
            </span>{" "}
            item{stage.subtasks.length === 1 ? "" : "s"}
          </p>
        </div>

        {stage.subtasks.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-slate-200 px-3 py-3 text-[12.5px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No subtasks yet. Add one below if you want to break this stage down.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {stage.subtasks.map((task, i) => (
              <li
                key={`${stage.id}-${i}`}
                className="flex items-center gap-2.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-slate-300 bg-white text-[9px] text-slate-400 dark:border-slate-600 dark:bg-slate-900">
                  ○
                </span>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => onUpdateSubtask(i, e.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-[13px] leading-snug text-slate-800 transition-colors hover:border-slate-200 focus:border-violet-300 focus:bg-white focus:outline-none dark:text-slate-100 dark:hover:border-slate-700 dark:focus:border-violet-500/50 dark:focus:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => onRemoveSubtask(i)}
                  className="shrink-0 rounded p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-rose-600 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-slate-800"
                  aria-label="Remove subtask"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onAddSubtask}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-violet-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-violet-200"
        >
          <Plus size={11} /> Add subtask
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
 * High-mark tips — editorial list
 * ========================================================================== */

function HighMarkCard({ tips }: { tips: string[] }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-50/50 to-white p-6 shadow-sm dark:border-amber-500/15 dark:from-amber-500/[0.05] dark:to-[#0a1020]">
      <header className="flex items-center gap-2.5">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30">
          <Lightbulb size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
            High-mark focus
          </p>
          <h3 className="text-[15.5px] font-semibold tracking-tight text-slate-900 dark:text-white">
            How stronger students approach this
          </h3>
        </div>
      </header>

      <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-400">
        Faculty-style guidance drawn from common rubric expectations. Treat these
        as directional — verify against your lecturer&apos;s stated criteria.
      </p>

      <ol className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {tips.map((t, i) => (
          <li
            key={t}
            className="group flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3.5 py-3 shadow-[0_1px_0_0_rgba(15,23,42,0.03)] transition-colors hover:border-amber-200/80 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-amber-500/25"
          >
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-50 text-[11px] font-semibold tabular-nums text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/25">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-200">
              {t}
            </p>
          </li>
        ))}
      </ol>
    </article>
  );
}

/* ============================================================================
 * Timeline (full)
 * ========================================================================== */

function TimelineCard({
  phases,
  dueDateISO,
}: {
  phases: NonNullable<ReturnType<typeof projectTimeline>>;
  dueDateISO?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0a1020]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="inline-flex size-4 items-center justify-center rounded-sm bg-violet-100/80 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <CalendarIcon size={10} />
            </span>
            Suggested pacing
          </div>
          <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-slate-900 dark:text-white">
            From today to submission
          </h3>
        </div>
        {safeFormat(dueDateISO, "EEE d MMM") && (
          <p className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[11.5px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
            <Flag size={11} className="text-violet-500 dark:text-violet-300" />
            Submit by{" "}
            <span className="text-slate-900 dark:text-white">
              {safeFormat(dueDateISO, "EEE d MMM")}
            </span>
          </p>
        )}
      </header>

      <ol className="mt-5 grid gap-3 md:grid-cols-5">
        {phases.map((phase) => {
          const theme = phaseTheme(phase.id);
          return (
            <li
              key={phase.id}
              className="relative flex flex-col rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/30"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 top-0 h-[2px] rounded-full",
                  theme.bar,
                )}
              />
              <span
                className={cn(
                  "inline-flex w-max items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em]",
                  theme.chip,
                  theme.text,
                )}
              >
                <span className={theme.text}>{theme.icon}</span>
                {theme.label}
              </span>
              <p className="mt-2 text-[13.5px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
                {phase.label}
              </p>
              <p className="mt-1 line-clamp-3 text-[11.5px] leading-snug text-slate-500 dark:text-slate-400">
                {phase.description}
              </p>
              <p className="mt-auto pt-3 text-[11px] font-medium tabular-nums text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500">{phase.startLabel}</span>
                <span className="mx-1 text-slate-300 dark:text-slate-700">→</span>
                <span>{phase.endLabel}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

/* ============================================================================
 * Ethical note
 * ========================================================================== */

function EthicalNote({ source, model }: { source: BriefAnalysis["source"]; model?: string }) {
  return (
    <p className="flex items-start gap-2 pt-2 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-500">
      <ShieldCheck size={12} className="mt-0.5 shrink-0 text-emerald-600/80 dark:text-emerald-400/70" />
      <span>
        <span className="font-medium text-slate-600 dark:text-slate-400">
          StudySprint helps interpret briefs — it doesn&apos;t replace your academic thinking.
        </span>{" "}
        Verify every field against your official brief and rubric, and follow your
        institution&apos;s academic integrity policies.
        {source === "llm" && model && (
          <span className="text-slate-400 dark:text-slate-600">
            {" · "}
            Plan generated with AI assistance ({model})
          </span>
        )}
      </span>
    </p>
  );
}

/* ============================================================================
 * Right rail — status
 * ========================================================================== */

function RailCard({
  title,
  caption,
  children,
  className,
}: {
  title: string;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0a1020]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {caption && <span className="text-[10px] text-slate-400 dark:text-slate-500">{caption}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function StatusCard({ analysis }: { analysis: BriefAnalysis }) {
  const confLabel =
    analysis.confidence === "high"
      ? "High"
      : analysis.confidence === "medium"
      ? "Medium"
      : "Low";
  const confDot =
    analysis.confidence === "high"
      ? "bg-emerald-500"
      : analysis.confidence === "medium"
      ? "bg-amber-500"
      : "bg-slate-400";

  return (
    <RailCard title="Status">
      <dl className="space-y-2 text-[12.5px]">
        <RailRow label="Confidence">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-100">
            <span className={cn("size-1.5 rounded-full", confDot)} />
            {confLabel}
          </span>
        </RailRow>
        <RailRow label="Source">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {analysis.source === "llm" ? analysis.model ?? "LLM" : "On-device"}
          </span>
        </RailRow>
        {analysis.dueDatePhrase && (
          <RailRow label="Due">
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {safeFormat(analysis.dueDateISO, "EEE d MMM") ||
                analysis.dueDatePhrase}
            </span>
          </RailRow>
        )}
        {analysis.wordCount && (
          <RailRow label="Word count">
            <span className="font-medium tabular-nums text-slate-800 dark:text-slate-100">
              {analysis.wordCount.toLocaleString()}
            </span>
          </RailRow>
        )}
        {analysis.estimatedHours && (
          <RailRow label="Est. effort">
            <span className="inline-flex items-center gap-1 font-medium tabular-nums text-slate-800 dark:text-slate-100">
              <Hourglass size={10} className="text-slate-400" />~{analysis.estimatedHours}h
            </span>
          </RailRow>
        )}
      </dl>
    </RailCard>
  );
}

function RailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* --------------- Signals (rail) ------------------------------------------ */

function SignalsCard({ signals }: { signals: FieldSignals }) {
  const entries: Array<{ key: keyof FieldSignals; label: string }> = [
    { key: "dueDate", label: "Due date" },
    { key: "wordCount", label: "Word count" },
    { key: "rubric", label: "Rubric" },
    { key: "references", label: "References" },
    { key: "submission", label: "Submission" },
  ];
  const confirmed = entries.filter((e) => signals[e.key] === "confirmed").length;
  return (
    <RailCard
      title="Detected signals"
      caption={
        <span className="tabular-nums">
          <span className="text-slate-700 dark:text-slate-200">{confirmed}</span>
          <span className="text-slate-400 dark:text-slate-500">/{entries.length}</span>
        </span>
      }
    >
      <ul className="divide-y divide-slate-100 text-[12.5px] dark:divide-slate-800/80">
        {entries.map((e) => (
          <SignalRow key={e.key} label={e.label} state={signals[e.key]} />
        ))}
      </ul>
    </RailCard>
  );
}

function SignalRow({ label, state }: { label: string; state: SignalConfidence }) {
  const dot =
    state === "confirmed"
      ? "bg-emerald-500"
      : state === "inferred"
      ? "bg-amber-500"
      : "bg-slate-300 dark:bg-slate-700";
  const text =
    state === "confirmed" ? "Detected" : state === "inferred" ? "Inferred" : "Missing";
  const textClass =
    state === "confirmed"
      ? "text-emerald-700 dark:text-emerald-300"
      : state === "inferred"
      ? "text-amber-700 dark:text-amber-300"
      : "text-slate-400 dark:text-slate-500";
  return (
    <li className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <span className={cn("size-1.5 rounded-full", dot)} />
        {label}
      </span>
      <span className={cn("text-[10.5px] font-semibold uppercase tracking-wider", textClass)}>
        {text}
      </span>
    </li>
  );
}

/* --------------- Missing details (rail) ---------------------------------- */

function MissingDetailsCard({ items }: { items: string[] }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/[0.05]">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-amber-400/80 dark:bg-amber-400/60"
      />
      <header className="flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-amber-100 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30">
          <AlertCircle size={11} />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-300">
          Confirm with your lecturer
        </p>
      </header>
      <ul className="mt-3 space-y-2 text-[12.5px] leading-snug text-amber-900 dark:text-amber-100">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[7px] inline-block size-[5px] shrink-0 rounded-full bg-amber-500/90 dark:bg-amber-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* --------------- Pacing summary (rail) ----------------------------------- */

function PacingRailCard({
  phases,
  dueDateISO,
}: {
  phases: NonNullable<ReturnType<typeof projectTimeline>>;
  dueDateISO?: string;
}) {
  return (
    <RailCard title="Pacing">
      <ol className="space-y-2 text-[12.5px]">
        {phases.map((phase) => {
          const theme = phaseTheme(phase.id);
          return (
            <li key={phase.id} className="flex items-start gap-2.5">
              <span className={cn("mt-[5px] size-2 shrink-0 rounded-full", theme.dot)} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-medium leading-tight text-slate-800 dark:text-slate-100">
                    {phase.label}
                  </span>
                </p>
                <p className="text-[10.5px] tabular-nums text-slate-500 dark:text-slate-400">
                  {phase.startLabel} → {phase.endLabel}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      {safeFormat(dueDateISO, "EEE d MMM") && (
        <p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          Submit by{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {safeFormat(dueDateISO, "EEE d MMM")}
          </span>
        </p>
      )}
    </RailCard>
  );
}

/* --------------- Convert panel (sticky in rail) -------------------------- */

function ConvertPanel({
  subjects,
  subjectId,
  setSubjectId,
  editedTitle,
  setEditedTitle,
  editedDueDate,
  setEditedDueDate,
  priority,
  setPriority,
  includedStages,
  totalStages,
  totalSubtasks,
  onConvert,
}: {
  subjects: { id: string; name: string; code: string }[];
  subjectId: string;
  setSubjectId: (v: string) => void;
  editedTitle: string;
  setEditedTitle: (v: string) => void;
  editedDueDate: string;
  setEditedDueDate: (v: string) => void;
  priority: Priority;
  setPriority: (v: Priority) => void;
  includedStages: number;
  totalStages: number;
  totalSubtasks: number;
  onConvert: () => void;
}) {
  const noSubjects = subjects.length === 0;
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-300/80 bg-white p-5 shadow-md ring-1 ring-violet-100/40 dark:border-slate-700/80 dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-[#0a1020] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.03)] dark:ring-violet-500/10">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500/80 via-violet-500 to-violet-500/80 dark:from-violet-400/70 dark:via-violet-400 dark:to-violet-400/70"
      />

      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/25">
          <ClipboardList size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Convert to assignment
          </p>
          <p className="text-[12.5px] font-semibold leading-tight text-slate-900 dark:text-white">
            Ready to schedule
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Title">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className={fieldInputClass}
          />
        </Field>

        <Field label="Subject">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={fieldInputClass}
          >
            {noSubjects && <option value="">Add a subject first</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Due date">
            <input
              type="date"
              value={editedDueDate}
              onChange={(e) => setEditedDueDate(e.target.value)}
              className={fieldInputClass}
            />
          </Field>
          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={fieldInputClass}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-[11.5px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <Layers size={11} className="text-slate-400" />
          <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
            {includedStages}
          </span>
          <span className="text-slate-500 dark:text-slate-400">/ {totalStages} stages</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks size={11} className="text-slate-400" />
          <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
            {totalSubtasks}
          </span>
          <span className="text-slate-500 dark:text-slate-400">subtasks</span>
        </span>
      </div>

      {noSubjects && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-amber-700 dark:text-amber-300">
          <AlertCircle size={11} /> Add a subject first —{" "}
          <Link to="/subjects" className="underline underline-offset-2">
            go to subjects
          </Link>
        </p>
      )}

      <Button
        variant="primary"
        onClick={onConvert}
        disabled={noSubjects}
        iconLeft={<ArrowUpRight size={14} />}
        className="mt-4 w-full bg-violet-600 py-2.5 text-[13.5px] font-semibold shadow-sm shadow-violet-600/20 hover:bg-violet-700 disabled:bg-slate-300 dark:bg-violet-600 dark:shadow-violet-500/20 dark:hover:bg-violet-500 dark:disabled:bg-slate-700 dark:disabled:shadow-none"
      >
        Convert to assignment
      </Button>
    </article>
  );
}

const fieldInputClass =
  "w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-900 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-900/40";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ============================================================================
 * Intro examples (pre-analysis)
 * ========================================================================== */

function IntroExamples({ onLoadSample }: { onLoadSample: () => void }) {
  const examples = [
    {
      icon: FileText,
      title: "Got a PDF brief?",
      body: "Upload it above — StudySprint reads it server-side and returns a plan in seconds.",
      interactive: false,
    },
    {
      icon: Upload,
      title: "DOCX or text works too",
      body: "Drop a .docx or paste the text. Scanned PDFs need a text-copy export from your LMS.",
      interactive: false,
    },
    {
      icon: Wand2,
      title: "Try the demo",
      body: "Load the sample SWE group-report brief and see how the planner interprets it.",
      interactive: true,
    },
  ];
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {examples.map((e) => (
        <button
          key={e.title}
          type="button"
          onClick={e.interactive ? onLoadSample : undefined}
          className={cn(
            "group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-[#0a1020]",
            e.interactive
              ? "cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 dark:hover:border-violet-800 dark:hover:bg-violet-950/20"
              : "cursor-default",
          )}
        >
          <span className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <e.icon size={14} />
          </span>
          <p className="mt-3 text-[13px] font-semibold text-slate-900 dark:text-white">
            {e.title}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-400">
            {e.body}
          </p>
        </button>
      ))}
    </section>
  );
}
