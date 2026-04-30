/**
 * Calendar — week-at-a-glance planner view (/calendar).
 * -----------------------------------------------------------------------------
 * Three-pane layout (mobile collapses to a single column):
 *   - Header strip: week navigator, "today" jump, mode summary.
 *   - Day grid:    seven columns, one per day; each day shows its
 *                  PlannerAssignmentChips, sorted by priority then time.
 *   - Right rail:  workload distribution, focus pick, and a "rebalance"
 *                  hint when one day is visibly heavier than the others.
 *
 * The page is read-mostly — interactions are limited to navigation between
 * weeks and click-through to assignment detail. Reschedule is exposed via the
 * chip's reschedule button which opens a quick date picker.
 */
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Gauge,
  Moon,
  Sparkles,
  Sun,
  Target,
} from "lucide-react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isBefore,
  isSameDay,
  isWeekend,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { usePlanner } from "../context/usePlanner";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import PlannerAssignmentChip from "../components/PlannerAssignmentChip";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { formatDaysLeft } from "../lib/planner";
import type { Assignment, Subject } from "../types";

type Intensity = "quiet" | "light" | "moderate" | "heavy";

function getIntensity(count: number): Intensity {
  if (count === 0) return "quiet";
  if (count === 1) return "light";
  if (count <= 3) return "moderate";
  return "heavy";
}

const intensityMeta: Record<
  Intensity,
  { label: string; bar: string; dot: string; textTone: string }
> = {
  quiet: {
    label: "Quiet",
    bar: "bg-slate-200 dark:bg-slate-800",
    dot: "bg-slate-300 dark:bg-slate-700",
    textTone: "text-slate-400 dark:text-slate-500",
  },
  light: {
    label: "Light",
    bar: "bg-emerald-500/75 dark:bg-emerald-400/60",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    textTone: "text-emerald-600 dark:text-emerald-400",
  },
  moderate: {
    label: "Moderate",
    bar: "bg-amber-500/80 dark:bg-amber-400/65",
    dot: "bg-amber-500 dark:bg-amber-400",
    textTone: "text-amber-600 dark:text-amber-400",
  },
  heavy: {
    label: "Heavy",
    bar: "bg-rose-500/85 dark:bg-rose-500/70",
    dot: "bg-rose-500 dark:bg-rose-400",
    textTone: "text-rose-600 dark:text-rose-400",
  },
};

type WeekLoad = "Quiet" | "Light" | "Moderate" | "Heavy";

function getWeekLoad(total: number): WeekLoad {
  if (total === 0) return "Quiet";
  if (total <= 3) return "Light";
  if (total <= 6) return "Moderate";
  return "Heavy";
}

const weekLoadTone: Record<WeekLoad, string> = {
  Quiet: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-300 dark:ring-slate-700",
  Light: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  Moderate: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  Heavy: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
};

function suggestionForEmptyDay(
  day: Date,
  today: Date,
  nextUpcoming?: Assignment,
): { icon: typeof Sparkles; title: string; body: string } {
  const diff = differenceInCalendarDays(startOfDay(day), startOfDay(today));
  if (diff < 0) {
    return {
      icon: Moon,
      title: "No work scheduled",
      body: "Nothing was due this day.",
    };
  }
  if (isWeekend(day)) {
    return {
      icon: Sun,
      title: "Catch-up day",
      body: nextUpcoming
        ? `Room to get ahead on ${nextUpcoming.title}.`
        : "Recharge or plan the week ahead.",
    };
  }
  if (diff === 0) {
    return {
      icon: Compass,
      title: "Open day",
      body: nextUpcoming
        ? `Great moment to progress on ${nextUpcoming.title}.`
        : "Use it to plan the rest of the week.",
    };
  }
  return {
    icon: Sparkles,
    title: "Light study day",
    body: nextUpcoming
      ? `Good time to prepare for ${nextUpcoming.title}.`
      : "Plan ahead or revise recent material.",
  };
}

export default function Calendar() {
  const { assignments, subjects, updateAssignment } = usePlanner();
  const today = new Date();
  const [referenceDate, setReferenceDate] = useState(today);
  const [rescheduleTarget, setRescheduleTarget] = useState<{
    assignmentId: string;
    title: string;
    dueInput: string;
  } | null>(null);

  const startDate = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const endDate = addDays(startDate, 6);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(startDate, i)),
    [startDate],
  );

  const todayInWeek = weekDays.find((d) => isSameDay(d, today));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const idx = weekDays.findIndex((d) => isSameDay(d, today));
    return idx >= 0 ? idx : 0;
  });

  const subjectsById = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const perDay = useMemo(() => {
    return weekDays.map((day) =>
      assignments
        .filter((a) => isSameDay(new Date(a.dueDate), day))
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)),
    );
  }, [weekDays, assignments]);

  const totalThisWeek = perDay.reduce((sum, list) => sum + list.length, 0);

  const overdueAll = useMemo(
    () =>
      assignments
        .filter((a) => a.status === "Overdue")
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)),
    [assignments],
  );

  const upcomingAfterWeek = useMemo(() => {
    const endOfWeekBoundary = startOfDay(addDays(endDate, 1));
    return assignments
      .filter(
        (a) =>
          a.status !== "Completed" &&
          a.status !== "Overdue" &&
          isBefore(endOfWeekBoundary, new Date(a.dueDate)),
      )
      .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
      .slice(0, 4);
  }, [assignments, endDate]);

  const firstUpcoming = upcomingAfterWeek[0];

  const busiestDayIndex = perDay.reduce(
    (best, list, i) => (list.length > perDay[best].length ? i : best),
    0,
  );
  const busiestDayCount = perDay[busiestDayIndex]?.length ?? 0;
  const maxDayCount = busiestDayCount;

  const weekLoad = getWeekLoad(totalThisWeek);
  const overdueThisWeek = perDay.reduce(
    (sum, list) => sum + list.filter((a) => a.status === "Overdue").length,
    0,
  );

  const selectedDay = weekDays[selectedDayIndex] ?? weekDays[0];
  const selectedDayAssignments = perDay[selectedDayIndex] ?? [];
  const selectedSuggestion = suggestionForEmptyDay(selectedDay, today, firstUpcoming);

  const openReschedule = (assignment: Assignment) => {
    setRescheduleTarget({
      assignmentId: assignment.id,
      title: assignment.title,
      dueInput: new Date(assignment.dueDate).toISOString().slice(0, 10),
    });
  };

  const saveReschedule = () => {
    if (!rescheduleTarget) return;
    const { assignmentId, dueInput } = rescheduleTarget;
    if (!dueInput) return;
    updateAssignment(assignmentId, {
      dueDate: new Date(`${dueInput}T12:00:00`).toISOString(),
    });
    setRescheduleTarget(null);
  };

  const goPrevWeek = () => setReferenceDate((prev) => addDays(prev, -7));
  const goNextWeek = () => setReferenceDate((prev) => addDays(prev, 7));
  const goToday = () => {
    setReferenceDate(today);
    const idx = Array.from({ length: 7 }, (_, i) =>
      addDays(startOfWeek(today, { weekStartsOn: 1 }), i),
    ).findIndex((d) => isSameDay(d, today));
    setSelectedDayIndex(idx >= 0 ? idx : 0);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 animate-in fade-in duration-500 sm:gap-5">
      {/* ====== Weekly header ====== */}
      <header className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_26px_-20px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-[#060e1e]/80 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-400/15 text-blue-600 ring-1 ring-blue-200/60 dark:from-blue-500/20 dark:to-cyan-400/15 dark:text-blue-300 dark:ring-blue-900/70">
                <CalendarDays size={16} />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Planner
              </h1>
              <span
                className={cn(
                  "ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                  weekLoadTone[weekLoad],
                )}
              >
                <Gauge size={11} />
                {weekLoad} week
              </span>
            </div>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Your week at a glance — spot pressure points before they arrive.
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-blue-600 dark:text-blue-400">
              {format(startDate, "MMM d")} – {format(endDate, "MMM d, yyyy")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0b1429]">
              <button
                type="button"
                onClick={goPrevWeek}
                className="min-h-10 min-w-10 rounded-l-xl p-2 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/80"
                aria-label="Previous week"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="border-x border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-200">
                {format(referenceDate, "MMMM yyyy")}
              </span>
              <button
                type="button"
                onClick={goNextWeek}
                className="min-h-10 min-w-10 rounded-r-xl p-2 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/80"
                aria-label="Next week"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="min-h-10"
              onClick={goToday}
            >
              Today
            </Button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <SummaryTile
            icon={<CalendarDays size={14} />}
            label="Tasks this week"
            value={String(totalThisWeek)}
            hint={totalThisWeek === 0 ? "Wide open" : totalThisWeek === 1 ? "Just one to ship" : "Plan accordingly"}
            tone="blue"
          />
          <SummaryTile
            icon={<AlertTriangle size={14} />}
            label="Overdue"
            value={String(overdueAll.length)}
            hint={
              overdueAll.length === 0
                ? "All caught up"
                : overdueThisWeek > 0
                  ? `${overdueThisWeek} in this week`
                  : "From previous weeks"
            }
            tone={overdueAll.length === 0 ? "slate" : "rose"}
          />
          <SummaryTile
            icon={<Flame size={14} />}
            label="Busiest day"
            value={
              maxDayCount === 0
                ? "—"
                : format(weekDays[busiestDayIndex], "EEE")
            }
            hint={
              maxDayCount === 0
                ? "Nothing scheduled"
                : `${maxDayCount} task${maxDayCount > 1 ? "s" : ""} due`
            }
            tone={maxDayCount >= 4 ? "rose" : maxDayCount >= 2 ? "amber" : "slate"}
          />
          <SummaryTile
            icon={<Target size={14} />}
            label="Next up"
            value={
              firstUpcoming
                ? format(new Date(firstUpcoming.dueDate), "MMM d")
                : "—"
            }
            hint={firstUpcoming ? firstUpcoming.title : "No upcoming deadlines"}
            tone="cyan"
            truncate
          />
        </div>
      </header>

      {/* ====== Grid + side panel ====== */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* --- Weekly grid --- */}
        <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_26px_-20px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-[#060e1e]/80">
          <div className="touch-pan-x overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <div className="min-w-[820px] lg:min-w-0">
              {/* Day header row */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-b from-slate-50/80 to-white dark:border-slate-800 dark:from-[#081122] dark:to-[#060e1e]">
                {weekDays.map((day, i) => {
                  const isTodayCol = isSameDay(day, today);
                  const count = perDay[i].length;
                  const intensity = getIntensity(count);
                  const meta = intensityMeta[intensity];
                  const isSelected = i === selectedDayIndex;
                  const loadWidth =
                    maxDayCount === 0
                      ? "0%"
                      : `${Math.max(6, Math.round((count / Math.max(maxDayCount, 1)) * 100))}%`;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDayIndex(i)}
                      className={cn(
                        "group relative flex flex-col items-stretch border-r border-slate-200 px-2 py-3 text-left transition-colors last:border-r-0 dark:border-slate-800",
                        isTodayCol && "bg-blue-50/60 dark:bg-blue-950/30",
                        isWeekend(day) && !isTodayCol && "bg-slate-50/40 dark:bg-slate-950/30",
                        isSelected && "ring-2 ring-inset ring-blue-400/50 dark:ring-blue-500/50",
                      )}
                      aria-pressed={isSelected}
                      aria-label={`${format(day, "EEEE, MMMM d")} — ${count} task${count === 1 ? "" : "s"}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          {format(day, "EEE")}
                        </p>
                        <span
                          className={cn("size-1.5 rounded-full", meta.dot)}
                          aria-hidden
                        />
                      </div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-bold tabular-nums sm:h-9 sm:w-9",
                            isTodayCol
                              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 dark:bg-blue-500"
                              : "text-slate-900 dark:text-white",
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        <span className={cn("text-[11px] font-semibold tabular-nums", meta.textTone)}>
                          {count === 0 ? "—" : `${count}`}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                        <div
                          className={cn("h-full rounded-full transition-all duration-300", meta.bar)}
                          style={{ width: loadWidth }}
                        />
                      </div>
                      <p
                        className={cn(
                          "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                          meta.textTone,
                        )}
                      >
                        {meta.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Day tiles body */}
              <div className="grid grid-cols-7">
                {weekDays.map((day, i) => {
                  const dayAssignments = perDay[i];
                  const count = dayAssignments.length;
                  const isTodayCol = isSameDay(day, today);
                  const isSelected = i === selectedDayIndex;
                  const isPast =
                    differenceInCalendarDays(startOfDay(day), startOfDay(today)) < 0;
                  const suggestion = suggestionForEmptyDay(day, today, firstUpcoming);
                  const SIcon = suggestion.icon;

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDayIndex(i)}
                      role="button"
                      tabIndex={-1}
                      className={cn(
                        "flex min-h-[min(55vh,28rem)] cursor-pointer flex-col border-r border-slate-200 transition-colors last:border-r-0 dark:border-slate-800",
                        isTodayCol && "bg-blue-50/35 dark:bg-blue-950/20",
                        isWeekend(day) && !isTodayCol && "bg-slate-50/30 dark:bg-slate-950/20",
                        isSelected && "bg-blue-50/60 dark:bg-blue-950/30",
                        isPast && !count && "opacity-70",
                      )}
                    >
                      <div className="flex-1 p-1.5 sm:p-2">
                        {count > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {dayAssignments.map((assignment) => (
                              <PlannerAssignmentChip
                                key={assignment.id}
                                assignment={assignment}
                                subject={subjectsById.get(assignment.subjectId)}
                                onReschedule={openReschedule}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/80 bg-gradient-to-b from-white to-slate-50/40 px-2 py-5 text-center dark:border-slate-700/70 dark:from-[#0b1429]/40 dark:to-[#060e1e]/40">
                            <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
                              <SIcon size={13} />
                            </span>
                            <p className="mt-2 text-[11.5px] font-semibold text-slate-600 dark:text-slate-300">
                              {suggestion.title}
                            </p>
                            <p className="mt-0.5 line-clamp-3 text-[10.5px] leading-snug text-slate-500 dark:text-slate-500">
                              {suggestion.body}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* --- Side panel (desktop-first) --- */}
        <aside className="flex min-h-0 flex-col gap-4">
          {/* Selected day detail */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_26px_-20px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-[#060e1e]/80">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {isSameDay(selectedDay, today) ? "Today" : "Selected day"}
                </p>
                <p className="mt-0.5 text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
                  {format(selectedDay, "EEEE, MMM d")}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                  intensityMeta[getIntensity(selectedDayAssignments.length)].textTone,
                  "bg-slate-100 dark:bg-slate-800/70",
                )}
              >
                <Gauge size={10} />
                {intensityMeta[getIntensity(selectedDayAssignments.length)].label}
              </span>
            </div>

            {selectedDayAssignments.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {selectedDayAssignments.map((a) => (
                  <li key={a.id}>
                    <PlannerAssignmentChip
                      assignment={a}
                      subject={subjectsById.get(a.subjectId)}
                      onReschedule={openReschedule}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-3 text-center dark:border-slate-700/70 dark:from-[#0b1429]/50 dark:to-[#060e1e]/50">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
                  <selectedSuggestion.icon size={13} />
                </span>
                <p className="mt-1.5 text-[12.5px] font-semibold text-slate-700 dark:text-slate-200">
                  {selectedSuggestion.title}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500 dark:text-slate-500">
                  {selectedSuggestion.body}
                </p>
                {firstUpcoming && (
                  <Link
                    to={`/assignments/${firstUpcoming.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open {firstUpcoming.title}
                    <ArrowUpRight size={12} />
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Overdue */}
          {overdueAll.length > 0 && (
            <section className="rounded-2xl border border-rose-200/70 bg-rose-50/60 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-rose-900/50 dark:bg-rose-950/25">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-6 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                  <AlertTriangle size={13} />
                </span>
                <h2 className="text-[13px] font-bold text-rose-800 dark:text-rose-200">
                  Overdue
                </h2>
                <span className="ml-auto rounded-full bg-rose-100 px-1.5 py-0.5 text-[10.5px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  {overdueAll.length}
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {overdueAll.slice(0, 4).map((a) => (
                  <SidePanelItem
                    key={a.id}
                    assignment={a}
                    subject={subjectsById.get(a.subjectId)}
                    tone="rose"
                  />
                ))}
              </ul>
            </section>
          )}

          {/* Upcoming */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_26px_-20px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-[#060e1e]/80">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                <Target size={13} />
              </span>
              <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">
                Upcoming deadlines
              </h2>
            </div>
            {upcomingAfterWeek.length === 0 ? (
              <p className="mt-2 rounded-lg border border-dashed border-slate-200 px-2 py-3 text-center text-[11.5px] text-slate-500 dark:border-slate-700/70 dark:text-slate-500">
                Horizon is clear beyond this week.
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {upcomingAfterWeek.map((a) => (
                  <SidePanelItem
                    key={a.id}
                    assignment={a}
                    subject={subjectsById.get(a.subjectId)}
                    tone="default"
                  />
                ))}
              </ul>
            )}
            <Link
              to="/assignments"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              View all assignments
              <ArrowUpRight size={12} />
            </Link>
          </section>

          {/* Weekly focus note */}
          <section className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/70 via-white to-cyan-50/60 p-4 dark:border-slate-800 dark:from-blue-950/40 dark:via-[#060e1e]/80 dark:to-cyan-950/30">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-200/70 dark:bg-[#0b1429] dark:text-blue-300 dark:ring-blue-900/70">
                <Sparkles size={13} />
              </span>
              <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">
                Weekly focus
              </h2>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
              {weeklyFocusLine({
                totalThisWeek,
                overdueCount: overdueAll.length,
                busiestDay: maxDayCount > 0 ? weekDays[busiestDayIndex] : null,
                busiestCount: maxDayCount,
                todayInWeek,
              })}
            </p>
          </section>
        </aside>
      </div>

      <Modal
        isOpen={Boolean(rescheduleTarget)}
        title="Reschedule due date"
        onClose={() => setRescheduleTarget(null)}
      >
        {rescheduleTarget && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium text-slate-900 dark:text-white">
                {rescheduleTarget.title}
              </span>
            </p>
            <div className="space-y-1">
              <label
                htmlFor="planner-due-date"
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                New due date
              </label>
              <Input
                id="planner-due-date"
                type="date"
                value={rescheduleTarget.dueInput}
                onChange={(e) =>
                  setRescheduleTarget((prev) =>
                    prev ? { ...prev, dueInput: e.target.value } : prev,
                  )
                }
                className="w-full"
              />
            </div>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 w-full sm:w-auto"
                onClick={() => setRescheduleTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="min-h-11 w-full sm:w-auto"
                onClick={saveReschedule}
              >
                Save date
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* -------------------------- Small inline components ------------------------- */

type SummaryTone = "blue" | "cyan" | "amber" | "rose" | "slate";

const summaryToneClasses: Record<SummaryTone, { iconWrap: string; label: string }> = {
  blue: {
    iconWrap:
      "bg-blue-50 text-blue-600 ring-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900/70",
    label: "text-slate-500 dark:text-slate-400",
  },
  cyan: {
    iconWrap:
      "bg-cyan-50 text-cyan-600 ring-cyan-200/70 dark:bg-cyan-950/50 dark:text-cyan-300 dark:ring-cyan-900/70",
    label: "text-slate-500 dark:text-slate-400",
  },
  amber: {
    iconWrap:
      "bg-amber-50 text-amber-600 ring-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/70",
    label: "text-slate-500 dark:text-slate-400",
  },
  rose: {
    iconWrap:
      "bg-rose-50 text-rose-600 ring-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900/70",
    label: "text-slate-500 dark:text-slate-400",
  },
  slate: {
    iconWrap:
      "bg-slate-100 text-slate-500 ring-slate-200/70 dark:bg-slate-800/70 dark:text-slate-400 dark:ring-slate-700/70",
    label: "text-slate-500 dark:text-slate-400",
  },
};

function SummaryTile({
  icon,
  label,
  value,
  hint,
  tone,
  truncate,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone: SummaryTone;
  truncate?: boolean;
}) {
  const t = summaryToneClasses[tone];
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 p-2.5 dark:border-slate-800/80 dark:bg-[#0b1429]/60 sm:p-3">
      <span
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg ring-1",
          t.iconWrap,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.12em]",
            t.label,
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[17px] leading-tight font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
        {hint && (
          <p
            className={cn(
              "mt-0.5 text-[10.5px] leading-snug text-slate-500 dark:text-slate-500",
              truncate && "truncate",
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function SidePanelItem({
  assignment,
  subject,
  tone,
}: {
  assignment: Assignment;
  subject?: Subject;
  tone: "rose" | "default";
}) {
  const days = formatDaysLeft(assignment.dueDate);
  return (
    <li>
      <Link
        to={`/assignments/${assignment.id}`}
        className={cn(
          "group/item flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
          tone === "rose"
            ? "hover:bg-rose-100/70 dark:hover:bg-rose-950/40"
            : "hover:bg-slate-50 dark:hover:bg-slate-900/60",
        )}
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            tone === "rose"
              ? "bg-rose-500"
              : "bg-blue-400 dark:bg-blue-500",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-[12.5px] font-semibold",
              tone === "rose"
                ? "text-rose-900 dark:text-rose-200"
                : "text-slate-800 dark:text-slate-100",
            )}
          >
            {assignment.title}
          </p>
          <p
            className={cn(
              "mt-0.5 flex items-center gap-1 text-[10.5px] font-medium",
              tone === "rose"
                ? "text-rose-600 dark:text-rose-300"
                : "text-slate-500 dark:text-slate-400",
            )}
          >
            {subject && <span className="truncate">{subject.code}</span>}
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <Clock size={9} />
            <span className="tabular-nums">{days}</span>
          </p>
        </div>
        <ArrowUpRight
          size={12}
          className={cn(
            "shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100",
            tone === "rose"
              ? "text-rose-500"
              : "text-slate-400 dark:text-slate-500",
          )}
        />
      </Link>
    </li>
  );
}

function weeklyFocusLine({
  totalThisWeek,
  overdueCount,
  busiestDay,
  busiestCount,
  todayInWeek,
}: {
  totalThisWeek: number;
  overdueCount: number;
  busiestDay: Date | null;
  busiestCount: number;
  todayInWeek?: Date;
}): string {
  if (overdueCount > 0) {
    return `Start by clearing ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}. Once those are behind you, the rest of the week opens up.`;
  }
  if (totalThisWeek === 0) {
    return "Wide-open week — a great chance to get ahead, revise, or plan longer-term work.";
  }
  if (busiestDay && busiestCount >= 3) {
    return `Protect ${format(busiestDay, "EEEE")} — it's the heaviest day with ${busiestCount} tasks. Use lighter days around it to prep.`;
  }
  if (todayInWeek) {
    return "A balanced week — steady daily progress will keep pressure low and momentum high.";
  }
  return "A balanced week ahead — pace yourself and use lighter days to prepare for the heavier ones.";
}
