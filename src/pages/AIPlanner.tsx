import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Calendar as CalendarIcon,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Hourglass,
  Info,
  Layers,
  Lightbulb,
  ListChecks,
  Loader2,
  Paperclip,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Wand2,
} from "lucide-react";
import { format } from "date-fns";

import Button from "../components/ui/Button";
import Textarea from "../components/ui/Textarea";
import { usePlanner } from "../context/usePlanner";
import { useToast } from "../context/useToast";
import { cn } from "../lib/utils";
import {
  analyzeBrief,
  projectTimeline,
  type BriefAnalysis,
  type Deliverable,
  type PlanStage,
  type Requirement,
  type RequirementIcon,
} from "../lib/briefAnalyzer";
import type { Priority } from "../types";

/* ---------------------------- Sample + constants --------------------------- */

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

/* --------------------------------- Page ----------------------------------- */

export default function AIPlanner() {
  const { subjects, addAssignment } = usePlanner();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [brief, setBrief] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<BriefAnalysis | null>(null);
  const [includedStageIds, setIncludedStageIds] = useState<Set<string>>(new Set());
  const [subjectId, setSubjectId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("High");
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedDueDate, setEditedDueDate] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = brief.length;
  const canAnalyze = charCount >= 40 && !isAnalyzing;

  const timeline = useMemo(
    () => (analysis ? projectTimeline(analysis.timeline, analysis.dueDateISO) : null),
    [analysis],
  );

  /* --------------------------- Input interactions --------------------------- */

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    const isText = /\.(txt|md|rtf)$/i.test(file.name) || file.type.startsWith("text/");
    if (!isText) {
      showToast({
        tone: "warning",
        message: "Only plain text files (.txt, .md) can be read directly. Paste PDF content manually.",
        durationMs: 4200,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setBrief(text);
      setFileName(file.name);
    };
    reader.readAsText(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    handleFile(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    handleFile(file);
    event.target.value = "";
  }

  function handleLoadSample() {
    setBrief(SAMPLE_BRIEF);
    setFileName(null);
  }

  function handleClear() {
    setBrief("");
    setFileName(null);
    setAnalysis(null);
    setIncludedStageIds(new Set());
  }

  function runAnalysis() {
    if (!canAnalyze) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    // A small artificial delay makes the analysis feel considered rather than
    // instantaneous — useful for a "smart" planning UX.
    window.setTimeout(() => {
      const result = analyzeBrief(brief);
      setAnalysis(result);
      setIncludedStageIds(new Set(result.stages.map((s) => s.id)));
      setEditedTitle(result.title);
      setEditedDueDate(
        result.dueDateISO ? format(new Date(result.dueDateISO), "yyyy-MM-dd") : "",
      );
      setSubjectId((prev) => prev || subjects[0]?.id || "");
      setIsAnalyzing(false);
    }, 1100);
  }

  /* --------------------------- Stage interactions --------------------------- */

  function toggleStage(stageId: string) {
    setIncludedStageIds((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }

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

  function updateSubtaskText(stageId: string, index: number, value: string) {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      stages: analysis.stages.map((s) =>
        s.id === stageId
          ? {
              ...s,
              subtasks: s.subtasks.map((t, i) => (i === index ? value : t)),
            }
          : s,
      ),
    });
  }

  /* ------------------------- Convert to StudySprint ------------------------ */

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
    // Flatten stage → subtask list, prefixing each subtask with the stage name
    // so the context is clear inside the StudySprint assignment detail page.
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
      notes: `Generated from AI brief breakdown.\n\n${analysis.summary}`,
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
    <div className="space-y-7 animate-in fade-in duration-500">
      {/* Introduction */}
      <HeaderIntro />

      {/* Input */}
      <InputStudio
        brief={brief}
        setBrief={setBrief}
        charCount={charCount}
        isAnalyzing={isAnalyzing}
        canAnalyze={canAnalyze}
        fileName={fileName}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        onDrop={handleDrop}
        onFileChange={handleFileChange}
        onPickFile={() => fileInputRef.current?.click()}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        onAnalyze={runAnalysis}
        fileInputRef={fileInputRef}
      />

      {/* Analysing state */}
      {isAnalyzing && <AnalyzingState />}

      {/* Results */}
      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          <AnalysisHeader analysis={analysis} onReset={handleClear} />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <SummaryCard analysis={analysis} />
            <RequirementsCard
              deliverables={analysis.deliverables}
              requirements={analysis.requirements}
            />
          </div>

          <ActionPlanCard
            stages={analysis.stages}
            includedStageIds={includedStageIds}
            onToggleStage={toggleStage}
            onRemoveSubtask={removeSubtask}
            onUpdateSubtask={updateSubtaskText}
          />

          {timeline && timeline.length > 0 && (
            <TimelineCard
              phases={timeline}
              dueDateISO={analysis.dueDateISO}
            />
          )}

          <HighMarkCard tips={analysis.highMarkTips} />

          <ConvertCard
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

          <EthicalNote />
        </div>
      )}

      {!analysis && !isAnalyzing && <IntroExamples onLoadSample={handleLoadSample} />}
    </div>
  );
}

/* -------------------------------- Sections -------------------------------- */

function HeaderIntro() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-cyan-50/60 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_30px_60px_-40px_rgba(124,58,237,0.35)] dark:border-violet-900/50 dark:from-[#0a0b24] dark:via-[#060918] dark:to-[#06161f] sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-violet-400/25 via-fuchsia-300/15 to-transparent blur-3xl dark:from-violet-500/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-gradient-to-br from-cyan-300/25 via-blue-300/15 to-transparent blur-3xl dark:from-cyan-500/25"
      />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700 backdrop-blur dark:border-violet-800/70 dark:bg-violet-950/40 dark:text-violet-200">
            <Sparkles size={12} />
            Planner assist · beta
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-[34px] dark:text-white">
            Drop in your brief.{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              Leave with a plan.
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            Paste an assignment brief and StudySprint will help you understand the task,
            pull out what actually matters, and turn it into a realistic action plan you can
            work through — not an answer, a <em>path forward</em>.
          </p>
          <ul className="mt-5 grid gap-2 text-[13px] text-slate-700 sm:grid-cols-2 dark:text-slate-300">
            {[
              { icon: Brain, text: "Plain-language summary of what the brief is really asking" },
              { icon: ListChecks, text: "Deliverables and requirements pulled into a checklist" },
              { icon: Layers, text: "Staged action plan, editable before you save" },
              { icon: CalendarIcon, text: "Suggested pacing from now until the due date" },
            ].map((row) => (
              <li key={row.text} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500/15 to-cyan-500/15 text-violet-600 ring-1 ring-violet-200/60 dark:text-violet-200 dark:ring-violet-800/60">
                  <row.icon size={12} />
                </span>
                <span>{row.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden lg:block">
          <StudioPreviewCard />
        </div>
      </div>
    </section>
  );
}

function StudioPreviewCard() {
  return (
    <div className="relative rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl shadow-violet-900/10 backdrop-blur-sm dark:border-slate-800 dark:bg-[#050d1b]/95 dark:shadow-[0_40px_80px_-40px_rgba(124,58,237,0.5)]">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <Wand2 size={13} className="text-violet-500 dark:text-violet-300" />
        StudySprint planner assist
      </div>
      <div className="mt-3 space-y-2.5">
        <PreviewRow label="Understand the brief" status="todo" />
        <PreviewRow label="Map the rubric" status="todo" />
        <PreviewRow label="Gather credible sources" status="todo" />
        <PreviewRow label="Draft section by section" status="todo" />
        <PreviewRow label="Rubric self-check" status="todo" />
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        <span className="font-semibold text-slate-800 dark:text-white">Pacing:</span>{" "}
        Discover · Research · Draft · Refine · Polish
      </div>
    </div>
  );
}

function PreviewRow({ label, status }: { label: string; status: "todo" | "done" }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50/80 px-2.5 py-1.5 dark:bg-slate-900/40">
      <span
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-sm border",
          status === "done"
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800",
        )}
      >
        {status === "done" && <CheckCircle2 size={10} />}
      </span>
      <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{label}</span>
    </div>
  );
}

/* ---------------------------- Input studio ------------------------------- */

interface InputStudioProps {
  brief: string;
  setBrief: (value: string) => void;
  charCount: number;
  isAnalyzing: boolean;
  canAnalyze: boolean;
  fileName: string | null;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPickFile: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  onAnalyze: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function InputStudio({
  brief,
  setBrief,
  charCount,
  isAnalyzing,
  canAnalyze,
  fileName,
  isDragging,
  setIsDragging,
  onDrop,
  onFileChange,
  onPickFile,
  onLoadSample,
  onClear,
  onAnalyze,
  fileInputRef,
}: InputStudioProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-white/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_24px_60px_-36px_rgba(15,23,42,0.2)] transition-colors sm:p-6 dark:bg-[#060e1e]/90",
        isDragging
          ? "border-violet-400 bg-violet-50/70 ring-4 ring-violet-200/50 dark:border-violet-500 dark:bg-violet-950/25"
          : "border-slate-200/80 dark:border-slate-800",
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
          <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-500/15 text-violet-600 ring-1 ring-violet-200/70 dark:text-violet-200 dark:ring-violet-800/60">
              <FileText size={15} />
            </span>
            Your assignment brief
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] text-slate-600 dark:text-slate-300">
            Paste the full brief, rubric, or assignment instructions below. The more
            context you give, the better the plan — the assist works fully on your device,
            so nothing leaves your browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLoadSample} iconLeft={<Sparkles size={13} />}>
            Load sample brief
          </Button>
          <Button variant="secondary" size="sm" onClick={onPickFile} iconLeft={<Upload size={13} />}>
            Upload .txt / .md
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-0.5 dark:border-slate-800 dark:bg-slate-900/40">
        <Textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={10}
          placeholder="Paste the assignment brief here — or drag a .txt / .md file onto this card.\n\nThe more detail (brief + rubric + word count + due date), the sharper the plan."
          className="min-h-[220px] resize-y !border-transparent !bg-transparent text-[14px] leading-relaxed focus:!border-transparent dark:!bg-transparent"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[12px] text-slate-500 dark:text-slate-400">
          {fileName ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Paperclip size={11} />
              {fileName}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Info size={12} />
              Drag & drop supported for plain text files
            </span>
          )}
          <span className="tabular-nums">{charCount.toLocaleString()} chars</span>
        </div>
        <div className="flex items-center gap-2">
          {brief.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} iconLeft={<RefreshCw size={13} />}>
              Start over
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onAnalyze}
            disabled={!canAnalyze}
            iconLeft={isAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
            className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 hover:from-violet-500 hover:via-fuchsia-400 hover:to-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            {isAnalyzing ? "Analysing brief…" : "Break down my brief"}
          </Button>
        </div>
      </div>

      {charCount > 0 && charCount < 40 && (
        <p className="mt-2 text-[11.5px] text-amber-700 dark:text-amber-300">
          Add a little more context (40+ characters) so the assist has enough signal.
        </p>
      )}
    </section>
  );
}

/* --------------------------- Analysing state ----------------------------- */

function AnalyzingState() {
  const steps = [
    "Reading your brief carefully…",
    "Identifying deliverables and requirements…",
    "Building the staged action plan…",
    "Pacing the work across the weeks you have…",
  ];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-white via-violet-50/70 to-cyan-50/60 p-6 shadow-sm dark:border-violet-900/60 dark:from-[#08081d] dark:via-[#0a0b24] dark:to-[#06161f]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.15),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.15),transparent_55%)]"
      />
      <div className="relative flex items-start gap-4">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30">
          <Loader2 size={22} className="animate-spin" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
            Working through your brief
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            Turning instructions into a plan
          </h3>
          <ul className="mt-4 space-y-1.5 text-[13px] text-slate-700 dark:text-slate-300">
            {steps.map((s, i) => (
              <li
                key={s}
                className="flex items-center gap-2 opacity-0 animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${i * 220}ms`, animationFillMode: "forwards" }}
              >
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-200">
                  <Sparkles size={10} />
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Analysis top — title chips ------------------------ */

function AnalysisHeader({
  analysis,
  onReset,
}: {
  analysis: BriefAnalysis;
  onReset: () => void;
}) {
  const confidenceTone =
    analysis.confidence === "high"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
      : analysis.confidence === "medium"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
      : "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200">
          <Sparkles size={11} />
        </span>
        Analysis ready
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em]",
            confidenceTone,
          )}
        >
          <ShieldCheck size={11} />
          {analysis.confidence} confidence
        </span>
        {analysis.estimatedHours && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            <Hourglass size={11} />~{analysis.estimatedHours}h of work
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={onReset} iconLeft={<RefreshCw size={12} />}>
          New brief
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------- Summary -------------------------------- */

function SummaryCard({ analysis }: { analysis: BriefAnalysis }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#060e1e]/90">
      <header className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200">
          <Brain size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
            Brief summary
          </p>
          <h3 className="mt-0.5 text-[17px] font-bold leading-tight text-slate-900 dark:text-white">
            {analysis.title}
          </h3>
        </div>
      </header>

      <p className="mt-4 text-[14px] leading-relaxed text-slate-700 dark:text-slate-200">
        {analysis.summary}
      </p>

      {analysis.dueDatePhrase && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/60 px-3 py-2 text-[12px] text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
          <CalendarIcon size={13} />
          Due-date signal detected: <span className="font-semibold">{analysis.dueDatePhrase}</span>
          {analysis.dueDateISO && (
            <span className="text-blue-600 dark:text-blue-300">
              · {format(new Date(analysis.dueDateISO), "EEE d MMM yyyy")}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

/* -------------------------- Deliverables + requirements ------------------- */

function RequirementsCard({
  deliverables,
  requirements,
}: {
  deliverables: Deliverable[];
  requirements: Requirement[];
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#060e1e]/90">
      <header className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-200">
          <ClipboardList size={15} />
        </span>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
            What this assignment requires
          </p>
          <h3 className="mt-0.5 text-[16px] font-bold text-slate-900 dark:text-white">
            Deliverables & constraints
          </h3>
        </div>
      </header>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            You'll produce
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {deliverables.map((d) => (
              <li
                key={d.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[12px] font-semibold text-violet-700 dark:border-violet-800/70 dark:bg-violet-950/30 dark:text-violet-200"
              >
                <Target size={11} />
                {d.label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Expect
          </p>
          {requirements.length === 0 ? (
            <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
              No explicit constraints detected. Double-check the original brief for word count,
              formatting, or citation style.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {requirements.map((r) => (
                <li
                  key={r.label}
                  className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-[12.5px] text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
                >
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300">
                    {iconForRequirement(r.icon)}
                  </span>
                  <span>
                    <span className="font-semibold text-slate-900 dark:text-white">{r.label}</span>
                    {r.detail && (
                      <span className="mt-0.5 block text-[11.5px] text-slate-500 dark:text-slate-400">
                        {r.detail}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
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

/* ------------------------------- Action plan ----------------------------- */

function ActionPlanCard({
  stages,
  includedStageIds,
  onToggleStage,
  onRemoveSubtask,
  onUpdateSubtask,
}: {
  stages: PlanStage[];
  includedStageIds: Set<string>;
  onToggleStage: (id: string) => void;
  onRemoveSubtask: (stageId: string, index: number) => void;
  onUpdateSubtask: (stageId: string, index: number, value: string) => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#060e1e]/90">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              <Layers size={11} />
            </span>
            Action plan
          </p>
          <h3 className="mt-1 text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
            How a high-performing student would tackle this
          </h3>
          <p className="mt-1 max-w-2xl text-[12.5px] text-slate-600 dark:text-slate-300">
            Every stage is editable. Deselect anything that doesn't fit your brief, tweak the
            subtasks, and StudySprint will turn whatever you keep into a real assignment with
            subtasks below.
          </p>
        </div>
        <p className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
          {includedStageIds.size} of {stages.length} stages included
        </p>
      </header>

      <ol className="mt-5 space-y-3">
        {stages.map((stage, index) => (
          <StageRow
            key={stage.id}
            index={index}
            stage={stage}
            included={includedStageIds.has(stage.id)}
            onToggle={() => onToggleStage(stage.id)}
            onRemoveSubtask={(i) => onRemoveSubtask(stage.id, i)}
            onUpdateSubtask={(i, v) => onUpdateSubtask(stage.id, i, v)}
          />
        ))}
      </ol>
    </article>
  );
}

function StageRow({
  index,
  stage,
  included,
  onToggle,
  onRemoveSubtask,
  onUpdateSubtask,
}: {
  index: number;
  stage: PlanStage;
  included: boolean;
  onToggle: () => void;
  onRemoveSubtask: (index: number) => void;
  onUpdateSubtask: (index: number, value: string) => void;
}) {
  return (
    <li
      className={cn(
        "group relative rounded-2xl border p-4 transition-all",
        included
          ? "border-emerald-200/80 bg-emerald-50/40 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/15"
          : "border-dashed border-slate-300 bg-slate-50/60 opacity-75 dark:border-slate-700 dark:bg-slate-900/30",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ring-1 transition-colors",
            included
              ? "bg-emerald-500 text-white ring-emerald-500/30 hover:bg-emerald-600"
              : "bg-white text-slate-500 ring-slate-300 hover:bg-slate-100 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800",
          )}
          aria-pressed={included}
          aria-label={included ? "Exclude stage from plan" : "Include stage in plan"}
        >
          {included ? <CheckCircle2 size={14} /> : index + 1}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white">
              {stage.title}
            </h4>
            <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {stage.phaseId}
            </span>
          </div>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">
            {stage.description}
          </p>

          {stage.subtasks.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {stage.subtasks.map((task, i) => (
                <li key={`${stage.id}-${i}`} className="flex items-center gap-2">
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-slate-300 bg-white text-[9px] text-slate-500 dark:border-slate-600 dark:bg-slate-900">
                    ○
                  </span>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => onUpdateSubtask(i, e.target.value)}
                    className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[12.5px] text-slate-700 transition-colors hover:border-slate-200 focus:border-emerald-300 focus:bg-white focus:outline-none dark:text-slate-200 dark:hover:border-slate-700 dark:focus:border-emerald-700 dark:focus:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveSubtask(i)}
                    className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-rose-600 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-slate-800"
                    aria-label="Remove subtask"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

/* -------------------------------- Timeline ------------------------------- */

function TimelineCard({
  phases,
  dueDateISO,
}: {
  phases: NonNullable<ReturnType<typeof projectTimeline>>;
  dueDateISO?: string;
}) {
  const toneForIndex = (i: number) =>
    [
      "from-violet-500/80 to-violet-600",
      "from-fuchsia-500/80 to-fuchsia-600",
      "from-blue-500/80 to-blue-600",
      "from-cyan-500/80 to-cyan-600",
      "from-emerald-500/80 to-emerald-600",
    ][i % 5];

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#060e1e]/90">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
              <CalendarIcon size={11} />
            </span>
            Suggested pacing
          </p>
          <h3 className="mt-1 text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
            From now to submission
          </h3>
          <p className="mt-1 max-w-2xl text-[12.5px] text-slate-600 dark:text-slate-300">
            A calm rhythm helps you avoid last-minute panic. These are suggested windows — you
            can slide your own work into the pattern that fits.
          </p>
        </div>
        {dueDateISO && (
          <p className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
            Submit by {format(new Date(dueDateISO), "EEE d MMM")}
          </p>
        )}
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {phases.map((phase, i) => (
          <div
            key={phase.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/40 p-3.5 shadow-sm dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-900/20"
          >
            <span
              className={cn(
                "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                toneForIndex(i),
              )}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Phase {i + 1}
            </p>
            <h4 className="mt-1 text-[14px] font-bold text-slate-900 dark:text-white">
              {phase.label}
            </h4>
            <p className="mt-1 text-[11.5px] leading-snug text-slate-600 dark:text-slate-300">
              {phase.description}
            </p>
            <p className="mt-3 text-[11px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">
              {phase.startLabel} → {phase.endLabel}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

/* ------------------------------ High-mark tips --------------------------- */

function HighMarkCard({ tips }: { tips: string[] }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/70 via-white to-rose-50/40 p-5 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:via-[#060e1e] dark:to-rose-950/15">
      <header className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
          <Lightbulb size={15} />
        </span>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
            High-mark focus
          </p>
          <h3 className="mt-0.5 text-[16px] font-bold text-slate-900 dark:text-white">
            What stronger students tend to do
          </h3>
        </div>
      </header>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {tips.map((t) => (
          <li
            key={t}
            className="flex items-start gap-2 rounded-xl border border-white/80 bg-white/90 p-3 text-[13px] leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-[#050d1b]/80 dark:text-slate-200"
          >
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
              <Sparkles size={11} />
            </span>
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}

/* -------------------------------- Convert -------------------------------- */

function ConvertCard({
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
    <article className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-cyan-50/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_24px_60px_-32px_rgba(139,92,246,0.35)] sm:p-6 dark:border-violet-900/55 dark:from-violet-950/25 dark:via-[#060e1e] dark:to-cyan-950/20 dark:shadow-[0_1px_2px_rgba(2,6,23,0.6),0_32px_72px_-28px_rgba(139,92,246,0.45)]">
      <header className="flex items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30">
          <ArrowRight size={16} />
        </span>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
            Turn the plan into real work
          </p>
          <h3 className="mt-0.5 text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
            Convert to a StudySprint assignment
          </h3>
          <p className="mt-1 text-[12.5px] text-slate-600 dark:text-slate-300">
            Review the details, then drop everything into your planner with the subtasks already
            broken out. You stay in control — nothing is saved until you click convert.
          </p>
        </div>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
            Assignment title
          </label>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13.5px] text-slate-900 outline-none transition-colors focus:border-violet-400 dark:border-slate-700 dark:bg-[#070f1f] dark:text-white dark:focus:border-violet-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
            Subject
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13.5px] text-slate-900 outline-none transition-colors focus:border-violet-400 dark:border-slate-700 dark:bg-[#070f1f] dark:text-white dark:focus:border-violet-500"
          >
            {noSubjects && <option value="">Add a subject first</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
            Due date
          </label>
          <input
            type="date"
            value={editedDueDate}
            onChange={(e) => setEditedDueDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13.5px] text-slate-900 outline-none transition-colors focus:border-violet-400 dark:border-slate-700 dark:bg-[#070f1f] dark:text-white dark:focus:border-violet-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
            Priority
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITY_OPTIONS.map((p) => {
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
                    active
                      ? "border-violet-500 bg-violet-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-[#070f1f] dark:text-slate-300 dark:hover:border-violet-600 dark:hover:text-violet-200",
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200/60 bg-white/70 px-4 py-3 text-[12.5px] text-slate-700 dark:border-violet-800/50 dark:bg-[#050d1b]/70 dark:text-slate-200">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            <span className="font-bold text-violet-700 dark:text-violet-300">{includedStages}</span>{" "}
            of {totalStages} stages · {totalSubtasks} subtasks
          </span>
          {noSubjects && (
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-amber-700 dark:text-amber-300">
              <AlertCircle size={11} /> Add a subject first:{" "}
              <Link to="/subjects" className="underline underline-offset-2">
                go to subjects
              </Link>
            </span>
          )}
        </div>
        <Button
          variant="primary"
          onClick={onConvert}
          disabled={noSubjects}
          iconLeft={<ArrowUpRight size={14} />}
          className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 hover:from-violet-500 hover:via-fuchsia-400 hover:to-cyan-400"
        >
          Convert to assignment
        </Button>
      </div>
    </article>
  );
}

/* ---------------------------- Ethical safeguard -------------------------- */

function EthicalNote() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[12px] leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
      <p className="flex items-start gap-2">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300" />
        <span>
          <span className="font-semibold text-slate-800 dark:text-white">
            StudySprint planner assist supports planning and interpretation only.
          </span>{" "}
          The thinking, writing, research, and final academic decisions stay with you. Always
          cross-check against your official brief and rubric, and follow your institution's
          academic integrity policies.
        </span>
      </p>
    </div>
  );
}

/* ------------------------------ Intro examples --------------------------- */

function IntroExamples({ onLoadSample }: { onLoadSample: () => void }) {
  const examples = [
    {
      icon: FileText,
      title: "Pasted a brief?",
      body: "Hit 'Break down my brief' — you'll get a plan in seconds.",
    },
    {
      icon: Upload,
      title: "Got a .txt or .md file?",
      body: "Drop it on the card above or use the upload button.",
    },
    {
      icon: Sparkles,
      title: "Want a quick demo?",
      body: "Load the sample SWE group-report brief and see it in action.",
    },
  ];
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {examples.map((e, i) => (
        <button
          key={e.title}
          type="button"
          onClick={i === 2 ? onLoadSample : undefined}
          className={cn(
            "group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all dark:border-slate-800 dark:bg-[#060e1e]/90",
            i === 2
              ? "border-violet-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg dark:border-violet-900/60"
              : "border-slate-200/80 cursor-default",
          )}
        >
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-500/15 text-violet-600 ring-1 ring-violet-200/60 dark:text-violet-200 dark:ring-violet-800/60">
            <e.icon size={16} />
          </span>
          <p className="mt-3 text-[13.5px] font-bold text-slate-900 dark:text-white">{e.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
            {e.body}
          </p>
        </button>
      ))}
    </section>
  );
}
