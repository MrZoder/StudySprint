import { useMemo } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { addDays, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import { Link } from 'react-router-dom';

import AssignmentCard from '../components/AssignmentCard';
import { usePlanner } from '../context/usePlanner';
import { formatDaysLeft, isDueSoon } from '../lib/planner';
import StatCard from '../components/StatCard';
import ReminderPanel from '../components/ReminderPanel';
import { cn } from '../lib/utils';
import { ANNOTATION_CAPTURE_MODE, annotate } from '../lib/annotationCapture';
import { CaptureCallout } from '../components/CaptureCallout';
import EmptyState from '../components/ui/EmptyState';

export default function Dashboard() {
  const { assignments, subjects, toggleAssignmentComplete, toggleSubtask } = usePlanner();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekRangeLabel = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`;

  const dueSoonAssignments = useMemo(
    () =>
      assignments
        .filter((a) => a.status !== 'Completed' && a.status !== 'Overdue' && isDueSoon(a.dueDate, 4))
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)),
    [assignments],
  );
  const overdueAssignments = useMemo(
    () =>
      assignments
        .filter((a) => a.status === 'Overdue')
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)),
    [assignments],
  );
  const activeAssignments = assignments.filter((a) => a.status !== 'Completed');
  const completedAssignments = assignments.filter((a) => a.status === 'Completed');
  const dueThisWeekActive = assignments.filter(
    (a) => a.status !== 'Completed' && isDueSoon(a.dueDate, 7),
  );

  const allSubtasks = assignments.flatMap((a) => a.subtasks);
  const completedSubtasks = allSubtasks.filter((s) => s.isCompleted).length;
  const weeklyProgress =
    allSubtasks.length === 0 ? 0 : Math.round((completedSubtasks / allSubtasks.length) * 100);

  const recentAssignments = useMemo(() => {
    const now = new Date();
    return activeAssignments
      .filter((a) => a.status !== 'Overdue')
      .filter((a) => !dueSoonAssignments.some((x) => x.id === a.id))
      .filter((a) => new Date(a.dueDate) > now)
      .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
      .slice(0, 3);
  }, [activeAssignments, dueSoonAssignments]);

  const upNextItem = overdueAssignments[0] ?? dueSoonAssignments[0] ?? recentAssignments[0];
  const nextDeadline = dueSoonAssignments[0] ?? recentAssignments[0];

  // Day-of-week completion counts across this week (for mini rhythm row)
  const rhythm = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    return days.map((day) => {
      const dueHere = assignments.filter((a) => isSameDay(new Date(a.dueDate), day));
      const doneHere = dueHere.filter((a) => a.status === 'Completed').length;
      return {
        date: day,
        total: dueHere.length,
        done: doneHere,
        isToday: isSameDay(day, today),
      };
    });
    // today is stable within a render, weekStart only changes with date
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, weekStart.toISOString()]);

  const overdueN = overdueAssignments.length;
  const dueSoonN = dueSoonAssignments.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 sm:space-y-7">
      {/* ====================================================
          ZONE 1 — WEEKLY BRIEFING (Hero)
         ==================================================== */}
      <div className="relative">
        {ANNOTATION_CAPTURE_MODE && (
          <div className="mb-1.5 flex justify-end pr-0.5">
            <CaptureCallout n={1} tone="teal" variant="inline" />
          </div>
        )}
        <div className={cn('rounded-[1.25rem] overflow-hidden', annotate('teal'))}>
          <ReminderPanel
            proposalCaptureTint={ANNOTATION_CAPTURE_MODE}
            dueSoonCount={dueSoonAssignments.length}
            overdueCount={overdueAssignments.length}
            dueThisWeekActiveCount={dueThisWeekActive.length}
            activeAssignmentCount={activeAssignments.length}
            completedRatio={`${completedSubtasks}/${allSubtasks.length || 0} tasks`}
            completionPercent={weeklyProgress}
            nextDeadlineLabel={
              nextDeadline
                ? `${nextDeadline.title} · ${formatDaysLeft(nextDeadline.dueDate)}`
                : 'No upcoming deadlines'
            }
            focusLabel={upNextItem ? upNextItem.title : 'Pick any assignment to build momentum'}
            weekRangeLabel={weekRangeLabel}
          />
        </div>

        {/* Supporting KPIs — slim strip directly beneath hero for visual continuity */}
        <div className="mt-3 space-y-1.5">
          {ANNOTATION_CAPTURE_MODE && (
            <div className="flex justify-center">
              <CaptureCallout n={2} tone="amber" variant="inline" />
            </div>
          )}
          <div
            className={cn(
              'grid grid-cols-2 xl:grid-cols-4 gap-2.5 p-0.5 rounded-2xl',
              annotate('amber'),
            )}
          >
            <StatCard
              title="Total"
              value={String(assignments.length)}
              hint="All subjects"
              tone="blue"
              icon={<BookOpen size={14} />}
            />
            <StatCard
              title="Due this week"
              value={String(dueThisWeekActive.length)}
              hint="Active · next 7 days"
              tone="amber"
              icon={<Clock size={14} />}
            />
            <StatCard
              title="Overdue"
              value={String(overdueAssignments.length)}
              hint={overdueN === 0 ? 'All clear' : 'Tackle one to reset momentum'}
              tone={overdueN === 0 ? 'slate' : 'rose'}
              icon={<AlertCircle size={14} />}
            />
            <StatCard
              title="Completed"
              value={String(completedAssignments.length)}
              hint="Across history"
              tone="emerald"
              icon={<CheckCircle2 size={14} />}
            />
          </div>
        </div>
      </div>

      {/* ====================================================
          ZONE 2 — ACTION LAYER (Paired urgency panels)
         ==================================================== */}
      <section aria-labelledby="action-layer">
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <div>
            <h2 id="action-layer" className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Action board
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-600 dark:text-slate-400">
              What needs your attention before it grows teeth.
            </p>
          </div>
          <Link
            to="/assignments"
            className="hidden shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline dark:text-blue-300 sm:inline-flex"
          >
            All assignments <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Immediate pressure — Overdue */}
          <UrgencyPanel
            tone="rose"
            eyebrow="Immediate pressure"
            title="Overdue"
            description="These steal focus until cleared. Opening one is the fastest way to feel lighter."
            count={overdueN}
            footerHref="/assignments"
            footerLabel="View all assignments"
            captureIndex={4}
          >
            {overdueN === 0 ? (
              <PositiveEmpty
                tone="rose"
                title="Nothing overdue"
                body="You’re clear of past-due work. Keep the streak going."
              />
            ) : (
              overdueAssignments.map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  subjects={subjects}
                  onToggleAssignmentComplete={toggleAssignmentComplete}
                  onToggleSubtask={toggleSubtask}
                  compact
                  emphasis="urgent"
                />
              ))
            )}
          </UrgencyPanel>

          {/* Near-term pressure — Due soon */}
          <UrgencyPanel
            tone="amber"
            eyebrow="Near-term pressure"
            title="Due soon"
            description="Close enough to need a concrete next step within the next four days."
            count={dueSoonN}
            footerHref="/calendar"
            footerLabel="Open planner"
            captureIndex={3}
          >
            {dueSoonN === 0 ? (
              <PositiveEmpty
                tone="amber"
                title="Nothing due in four days"
                body="Use the breathing room to get ahead on upcoming work."
              />
            ) : (
              dueSoonAssignments.map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  subjects={subjects}
                  onToggleAssignmentComplete={toggleAssignmentComplete}
                  onToggleSubtask={toggleSubtask}
                  compact
                  emphasis="urgent"
                />
              ))
            )}
          </UrgencyPanel>
        </div>
      </section>

      {/* ====================================================
          ZONE 3 — MOMENTUM LAYER
         ==================================================== */}
      <section aria-labelledby="momentum-layer">
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <div>
            <h2
              id="momentum-layer"
              className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400"
            >
              Momentum
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-600 dark:text-slate-400">
              Where you are going and how the week is trending.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Up next — the main working card */}
          <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_42px_-26px_rgba(15,23,42,0.18)] dark:border-white/[0.06] dark:bg-white/[0.025] dark:shadow-[0_1px_2px_rgba(2,6,23,0.5),0_22px_48px_-26px_rgba(2,6,23,0.8)] md:p-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/10 via-blue-400/5 to-transparent blur-3xl dark:from-cyan-400/20 dark:via-blue-400/10" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-cyan-600 ring-1 ring-cyan-200/60 dark:from-cyan-400/20 dark:to-blue-400/15 dark:text-cyan-200 dark:ring-cyan-400/20">
                      <Sparkles size={14} />
                    </span>
                    <h3 className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-white">
                      Up next
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      Your main working surface
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-slate-600 dark:text-slate-400">
                    Queue calmly before deadlines tighten. Ship the smallest first step.
                  </p>
                </div>
                <p className="shrink-0 text-[11px] font-medium text-slate-500 dark:text-slate-500">
                  {recentAssignments.length === 0
                    ? 'No immediate pressure'
                    : `${recentAssignments.length} queued`}
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                {recentAssignments.length === 0 && (
                  <EmptyState message="No queued-up future work — everything is either done or already urgent." />
                )}
                {recentAssignments.map((a) => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    subjects={subjects}
                    onToggleAssignmentComplete={toggleAssignmentComplete}
                    onToggleSubtask={toggleSubtask}
                    compact
                    emphasis="calm"
                  />
                ))}
              </div>
            </div>
          </article>

          {/* Weekly momentum — calmer, motivating */}
          <aside
            className={cn(
              'relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_14px_34px_-22px_rgba(16,185,129,0.22)] md:p-5',
              'dark:border-emerald-900/45 dark:from-emerald-950/35 dark:via-[#060e1e]/90 dark:to-teal-950/35 dark:shadow-[0_1px_2px_rgba(2,6,23,0.5),0_22px_48px_-26px_rgba(16,185,129,0.3)]',
              annotate('green'),
            )}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-300/25 via-teal-300/10 to-transparent blur-3xl dark:from-emerald-400/25 dark:via-teal-400/10" />

            <div className="relative flex items-start gap-3">
              <div
                className="h-16 w-16 shrink-0 rounded-full p-[4px]"
                style={{
                  background: `conic-gradient(#10b981 ${weeklyProgress}%, rgba(148,163,184,0.2) ${weeklyProgress}% 100%)`,
                }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white/95 dark:bg-[#081022]">
                  <span className="text-[14px] font-bold leading-none tabular-nums text-emerald-700 dark:text-emerald-300">
                    {weeklyProgress}%
                  </span>
                  <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-emerald-600/80 dark:text-emerald-300/80">
                    week
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-white">
                    Weekly momentum
                  </h3>
                  {ANNOTATION_CAPTURE_MODE && <CaptureCallout n={5} tone="green" variant="inline" />}
                </div>
                <p className="mt-0.5 text-[11.5px] text-slate-600 dark:text-slate-300">
                  {allSubtasks.length === 0
                    ? 'Add subtasks to track bite-sized progress.'
                    : weeklyProgress >= 85
                      ? 'Almost done — finish strong this week.'
                      : weeklyProgress >= 70
                        ? 'Strong week — finish the stragglers while you’re in flow.'
                        : weeklyProgress >= 40
                          ? 'Momentum is real — one focus block will push you past half.'
                          : weeklyProgress > 0
                            ? 'Small wins add up — complete one subtask on your next study block.'
                            : 'Start with any small subtask and ride the momentum.'}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <span>Subtasks</span>
                <span className="tabular-nums text-slate-700 dark:text-slate-200">
                  {completedSubtasks}/{allSubtasks.length || 0}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:from-emerald-400 dark:to-teal-400"
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
            </div>

            {/* Study rhythm — mini day dots */}
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Study rhythm
                </p>
                <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                  {weekRangeLabel}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {rhythm.map((d, i) => {
                  const empty = d.total === 0;
                  const allDone = !empty && d.done === d.total;
                  const partial = !empty && d.done > 0 && d.done < d.total;
                  const fillClass = empty
                    ? 'bg-slate-100 text-slate-400 dark:bg-white/[0.04] dark:text-slate-500'
                    : allDone
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 dark:bg-emerald-400 dark:text-emerald-950'
                      : partial
                        ? 'bg-amber-400 text-amber-950 dark:bg-amber-300'
                        : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span
                        className={cn(
                          'flex h-7 w-full items-center justify-center rounded-md text-[10.5px] font-bold tabular-nums',
                          fillClass,
                          d.isToday && 'ring-2 ring-emerald-500/60 dark:ring-emerald-400/60',
                        )}
                        title={`${format(d.date, 'EEE MMM d')} — ${d.done}/${d.total} done`}
                      >
                        {empty ? '·' : d.total}
                      </span>
                      <span
                        className={cn(
                          'text-[9.5px] font-semibold uppercase tracking-wide',
                          d.isToday
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-500 dark:text-slate-500',
                        )}
                      >
                        {format(d.date, 'EEE').slice(0, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                Each tile shows tasks due that day. Green = all done, amber = in progress.
              </p>
            </div>

            {/* Footer stats */}
            <div className="relative grid grid-cols-2 gap-2">
              <MiniStat
                icon={<TrendingUp size={12} />}
                label="Active"
                value={String(activeAssignments.length)}
              />
              <MiniStat
                icon={<Flame size={12} />}
                label="Streak"
                value={
                  weeklyProgress >= 85
                    ? 'On fire'
                    : weeklyProgress >= 50
                      ? 'Steady'
                      : weeklyProgress > 0
                        ? 'Building'
                        : 'Fresh start'
                }
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------ Sub-components ----------------------------- */

type UrgencyTone = 'rose' | 'amber';

interface UrgencyPanelProps {
  tone: UrgencyTone;
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  footerHref: string;
  footerLabel: string;
  captureIndex?: number;
  children: React.ReactNode;
}

function UrgencyPanel({
  tone,
  eyebrow,
  title,
  description,
  count,
  footerHref,
  footerLabel,
  captureIndex,
  children,
}: UrgencyPanelProps) {
  const toneClasses =
    tone === 'rose'
      ? {
          container:
            'border-rose-200/80 bg-gradient-to-b from-rose-50/85 via-white to-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_44px_-24px_rgba(244,63,94,0.32)] dark:border-rose-900/50 dark:from-rose-950/35 dark:via-[#060e1e]/90 dark:to-[#060e1e]/95 dark:shadow-[0_1px_2px_rgba(2,6,23,0.5),0_26px_58px_-26px_rgba(225,29,72,0.42)]',
          iconWrap: 'bg-rose-100 text-rose-600 ring-1 ring-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900/55',
          eyebrow: 'text-rose-700 dark:text-rose-300',
          count: 'bg-rose-600 text-white shadow-sm shadow-rose-500/25 dark:bg-rose-500',
          footer: 'text-rose-700 hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200',
          accent: 'rose',
          icon: <AlertCircle size={14} />,
        }
      : {
          container:
            'border-amber-200/80 bg-gradient-to-b from-amber-50/85 via-white to-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_44px_-24px_rgba(245,158,11,0.28)] dark:border-amber-900/45 dark:from-amber-950/30 dark:via-[#060e1e]/90 dark:to-[#060e1e]/95 dark:shadow-[0_1px_2px_rgba(2,6,23,0.5),0_26px_58px_-26px_rgba(245,158,11,0.38)]',
          iconWrap: 'bg-amber-100 text-amber-600 ring-1 ring-amber-200/80 dark:bg-amber-950/60 dark:text-amber-200 dark:ring-amber-900/55',
          eyebrow: 'text-amber-700 dark:text-amber-300',
          count: 'bg-amber-500 text-amber-950 shadow-sm shadow-amber-500/20 dark:bg-amber-400',
          footer: 'text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100',
          accent: 'amber',
          icon: <Clock size={14} />,
        };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 md:p-5',
        toneClasses.container,
        annotate(toneClasses.accent as 'rose' | 'blue'),
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-lg',
                toneClasses.iconWrap,
              )}
            >
              {toneClasses.icon}
            </span>
            <p
              className={cn(
                'text-[10px] font-semibold uppercase tracking-[0.16em]',
                toneClasses.eyebrow,
              )}
            >
              {eyebrow}
            </p>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            {count > 0 && (
              <span
                className={cn(
                  'inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums',
                  toneClasses.count,
                )}
              >
                {count}
              </span>
            )}
          </div>
          <p className="mt-1 max-w-[36ch] text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        {ANNOTATION_CAPTURE_MODE && captureIndex && (
          <CaptureCallout
            n={captureIndex}
            tone={(toneClasses.accent as 'rose' | 'blue') === 'rose' ? 'rose' : 'blue'}
            variant="inline"
          />
        )}
      </div>

      <div className="mt-3.5 space-y-2.5">{children}</div>

      {count > 0 && (
        <Link
          to={footerHref}
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-[12px] font-semibold underline-offset-4 hover:underline',
            toneClasses.footer,
          )}
        >
          {footerLabel}
          <ArrowUpRight size={12} />
        </Link>
      )}
    </div>
  );
}

function PositiveEmpty({
  tone,
  title,
  body,
}: {
  tone: UrgencyTone;
  title: string;
  body: string;
}) {
  const toneClass =
    tone === 'rose'
      ? 'border-rose-200/70 bg-rose-50/40 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/15 dark:text-rose-200'
      : 'border-amber-200/70 bg-amber-50/40 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/15 dark:text-amber-200';
  const iconTone =
    tone === 'rose'
      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-200'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200';
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-dashed px-3 py-3',
        toneClass,
      )}
    >
      <span className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-lg', iconTone)}>
        {tone === 'rose' ? <CheckCircle2 size={13} /> : <Target size={13} />}
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold">{title}</p>
        <p className="mt-0.5 text-[11.5px] leading-snug opacity-90">{body}</p>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-white/70 px-2.5 py-2 dark:border-emerald-900/40 dark:bg-white/[0.035]">
      <span className="inline-flex size-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-200/80">
          {label}
        </p>
        <p className="text-[12px] font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
