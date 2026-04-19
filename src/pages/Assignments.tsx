import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import type { Assignment, Priority, Status } from '../types';
import AssignmentCard from '../components/AssignmentCard';
import {
  ArrowDownUp,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Filter,
  Flag,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  PieChart,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { usePlanner } from '../context/usePlanner';
import { useToast } from '../context/useToast';
import { cn } from '../lib/utils';
import { formatDaysLeft } from '../lib/planner';
import {
  assignmentTitleTaken,
  isBlank,
  isHtmlDateInPast,
  parseHtmlDateValue,
} from '../lib/formValidation';
import { ANNOTATION_CAPTURE_MODE, annotate } from '../lib/annotationCapture';
import { CaptureCallout } from '../components/CaptureCallout';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FormAssist from '../components/ui/FormAssist';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SubjectPill from '../components/ui/SubjectPill';
import Badge from '../components/ui/Badge';

const assignmentTabs = ['All', 'Active', 'Completed'] as const;
type AssignmentTab = (typeof assignmentTabs)[number];

const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'] as const;

const priorityTone: Record<Priority, { label: string; bar: string; dot: string; chip: string }> = {
  Low: {
    label: 'Low',
    bar: 'bg-slate-400 dark:bg-slate-500',
    dot: 'bg-slate-400 dark:bg-slate-500',
    chip: 'border-slate-200/70 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200',
  },
  Medium: {
    label: 'Medium',
    bar: 'bg-blue-500 dark:bg-blue-400',
    dot: 'bg-blue-500 dark:bg-blue-400',
    chip: 'border-blue-200/70 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200',
  },
  High: {
    label: 'High',
    bar: 'bg-amber-500 dark:bg-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400',
    chip: 'border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
  },
  Urgent: {
    label: 'Urgent',
    bar: 'bg-rose-500 dark:bg-rose-400',
    dot: 'bg-rose-500 dark:bg-rose-400',
    chip: 'border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200',
  },
};

const statusTone: Record<Status, string> = {
  'Not Started':
    'border-slate-200/70 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200',
  'In Progress':
    'border-blue-200/70 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200',
  Completed:
    'border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
  Overdue:
    'border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200',
};

export default function Assignments() {
  const {
    assignments,
    subjects,
    addAssignment,
    toggleSubtask,
    toggleAssignmentComplete,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    moveSubtask,
    deleteAssignment,
    restoreAssignment,
  } = usePlanner();
  const { showToast } = useToast();

  const handleDeleteAssignment = useCallback(
    (assignmentId: string) => {
      const snap = assignments.find((a) => a.id === assignmentId);
      if (!snap) return;
      const copy = structuredClone(snap);
      deleteAssignment(assignmentId);
      showToast({
        message: `Assignment deleted: “${copy.title}”`,
        tone: 'destructive',
        durationMs: 8000,
        action: {
          label: 'Undo',
          onPress: () => restoreAssignment(copy),
        },
      });
    },
    [assignments, deleteAssignment, restoreAssignment, showToast],
  );

  const [tab, setTab] = useState<AssignmentTab>('All');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');
  const [subjectFilter, setSubjectFilter] = useState<'All' | string>('All');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // Quick-add state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');
  const [showAssignmentErrors, setShowAssignmentErrors] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);
  const quickAddTitleRef = useRef<HTMLInputElement | null>(null);

  const focusQuickAdd = useCallback(() => {
    setFocusedId(null);
    requestAnimationFrame(() => {
      quickAddTitleRef.current?.focus();
      quickAddTitleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, []);

  const titleError =
    showAssignmentErrors && isBlank(title) ? 'Assignment title is required.' : undefined;
  const subjectError =
    showAssignmentErrors && !subjectId ? 'Select a subject for this assignment.' : undefined;
  const dueError =
    showAssignmentErrors && (!dueDate || !parseHtmlDateValue(dueDate))
      ? 'Choose a valid due date.'
      : undefined;
  const duplicateTitleError =
    subjectId && !isBlank(title) && assignmentTitleTaken(assignments, subjectId, title)
      ? 'You already have an assignment with this title in this subject.'
      : undefined;

  const assignmentFormHasErrors = Boolean(
    titleError || subjectError || dueError || duplicateTitleError,
  );

  const assignmentCanSubmit =
    !isBlank(title) &&
    Boolean(subjectId) &&
    Boolean(parseHtmlDateValue(dueDate)) &&
    !assignmentTitleTaken(assignments, subjectId, title);

  const dueDateWarning =
    dueDate && parseHtmlDateValue(dueDate) && isHtmlDateInPast(dueDate)
      ? 'This due date is in the past. It will appear as overdue until completed.'
      : undefined;

  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status !== 'Completed',
  ).length;
  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === 'Completed',
  ).length;
  const overdueAssignments = assignments.filter(
    (assignment) => assignment.status === 'Overdue',
  ).length;
  const dueSoonAssignments = assignments.filter((assignment) => {
    if (assignment.status === 'Completed') return false;
    const diffMs = new Date(assignment.dueDate).getTime() - Date.now();
    return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const tabCounts: Record<AssignmentTab, number> = {
    All: totalAssignments,
    Active: activeAssignments,
    Completed: completedAssignments,
  };

  const headerPills = [
    {
      label: 'Active',
      value: activeAssignments,
      icon: Clock3,
      classes:
        'border-blue-200/70 bg-blue-50/80 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200',
      iconClasses: 'text-blue-500 dark:text-blue-300',
    },
    {
      label: 'Due this week',
      value: dueSoonAssignments,
      icon: CalendarDays,
      classes:
        'border-amber-200/70 bg-amber-50/80 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
      iconClasses: 'text-amber-500 dark:text-amber-300',
    },
    {
      label: 'Completed',
      value: completedAssignments,
      icon: CheckCircle2,
      classes:
        'border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
      iconClasses: 'text-emerald-500 dark:text-emerald-300',
    },
  ];

  const filteredAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => {
          if (tab === 'Active' && assignment.status === 'Completed') return false;
          if (tab === 'Completed' && assignment.status !== 'Completed') return false;
          if (statusFilter !== 'All' && assignment.status !== statusFilter) return false;
          if (priorityFilter !== 'All' && assignment.priority !== priorityFilter) return false;
          if (subjectFilter !== 'All' && assignment.subjectId !== subjectFilter) return false;
          if (search.trim()) {
            const normalized = search.toLowerCase();
            const subject = subjects.find((item) => item.id === assignment.subjectId);
            return (
              assignment.title.toLowerCase().includes(normalized) ||
              subject?.name.toLowerCase().includes(normalized) ||
              subject?.code.toLowerCase().includes(normalized)
            );
          }
          return true;
        })
        .sort((a, b) =>
          sortBy === 'date-asc'
            ? +new Date(a.dueDate) - +new Date(b.dueDate)
            : +new Date(b.dueDate) - +new Date(a.dueDate),
        ),
    [
      assignments,
      priorityFilter,
      search,
      sortBy,
      statusFilter,
      subjectFilter,
      subjects,
      tab,
    ],
  );

  // Ensure focused assignment is still valid
  useEffect(() => {
    if (focusedId && !assignments.some((a) => a.id === focusedId)) {
      setFocusedId(null);
    }
  }, [assignments, focusedId]);

  const focusedAssignment = useMemo(
    () => (focusedId ? assignments.find((a) => a.id === focusedId) ?? null : null),
    [assignments, focusedId],
  );

  const upcomingDeadlines = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.status !== 'Completed')
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
        .slice(0, 5),
    [assignments],
  );

  const workloadByPriority = useMemo(() => {
    const active = assignments.filter((assignment) => assignment.status !== 'Completed');
    const totals: Record<Priority, number> = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
    for (const assignment of active) {
      totals[assignment.priority] += 1;
    }
    const total = active.length;
    return {
      total,
      items: (['Urgent', 'High', 'Medium', 'Low'] as Priority[]).map((key) => ({
        priority: key,
        count: totals[key],
        pct: total === 0 ? 0 : Math.round((totals[key] / total) * 100),
      })),
    };
  }, [assignments]);

  const selectedSubject = subjects.find((subject) => subject.id === subjectId);
  const dueDateValue = parseHtmlDateValue(dueDate);

  // Animations (list)
  const hasAnimatedOnceRef = useRef(false);
  const previousTabRef = useRef<AssignmentTab>(tab);
  const previousAnimatedViewKeyRef = useRef(
    `${tab}|${statusFilter}|${priorityFilter}|${subjectFilter}|${sortBy}`,
  );
  const listShellRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const listAnimationRef = useRef<Animation | null>(null);
  const listHeightRef = useRef<number | null>(null);
  const listHeightAnimationRef = useRef<Animation | null>(null);

  useEffect(() => {
    if (!assignmentSuccess) return;
    const t = window.setTimeout(() => setAssignmentSuccess(null), 2800);
    return () => window.clearTimeout(t);
  }, [assignmentSuccess]);

  useEffect(() => {
    if (!hasAnimatedOnceRef.current) {
      hasAnimatedOnceRef.current = true;
      previousTabRef.current = tab;
      previousAnimatedViewKeyRef.current = `${tab}|${statusFilter}|${priorityFilter}|${subjectFilter}|${sortBy}`;
      return;
    }

    const previousTab = previousTabRef.current;
    const nextAnimatedViewKey = `${tab}|${statusFilter}|${priorityFilter}|${subjectFilter}|${sortBy}`;
    const shouldAnimate = previousAnimatedViewKeyRef.current !== nextAnimatedViewKey;

    previousAnimatedViewKeyRef.current = nextAnimatedViewKey;
    previousTabRef.current = tab;

    if (!shouldAnimate) return;

    const nextDirection: 1 | -1 =
      previousTab === tab
        ? 1
        : assignmentTabs.indexOf(tab) > assignmentTabs.indexOf(previousTab)
          ? 1
          : -1;
    const target = listContainerRef.current;
    if (!target) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    listAnimationRef.current?.cancel();
    listAnimationRef.current = target.animate(
      previousTab === tab
        ? [
            { opacity: 0.65, transform: 'translateY(10px) scale(0.995)' },
            { opacity: 1, transform: 'translateY(0px) scale(1)' },
          ]
        : [
            {
              opacity: 0.6,
              transform: `translateX(${nextDirection > 0 ? '18px' : '-18px'}) scale(0.99)`,
              filter: 'blur(0.6px)',
            },
            { opacity: 1, transform: 'translateX(0px) scale(1)', filter: 'blur(0px)' },
          ],
      {
        duration: previousTab === tab ? 260 : 360,
        easing: 'cubic-bezier(0.22,1,0.36,1)',
      },
    );
  }, [filteredAssignments, priorityFilter, sortBy, statusFilter, subjectFilter, tab]);

  useEffect(
    () => () => {
      listAnimationRef.current?.cancel();
      listHeightAnimationRef.current?.cancel();
      if (listShellRef.current) {
        listShellRef.current.style.height = '';
        listShellRef.current.style.overflow = '';
      }
    },
    [],
  );

  useLayoutEffect(() => {
    const shell = listShellRef.current;
    if (!shell) return;

    const nextHeight = shell.getBoundingClientRect().height;
    if (listHeightRef.current === null) {
      listHeightRef.current = nextHeight;
      return;
    }

    const previousHeight = listHeightRef.current;
    listHeightRef.current = nextHeight;

    if (Math.abs(previousHeight - nextHeight) < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    listHeightAnimationRef.current?.cancel();
    shell.style.overflow = 'hidden';
    shell.style.height = `${previousHeight}px`;

    const rafId = window.requestAnimationFrame(() => {
      listHeightAnimationRef.current = shell.animate(
        [{ height: `${previousHeight}px` }, { height: `${nextHeight}px` }],
        {
          duration: 340,
          easing: 'cubic-bezier(0.22,1,0.36,1)',
        },
      );
      listHeightAnimationRef.current.onfinish = () => {
        shell.style.height = '';
        shell.style.overflow = '';
      };
      listHeightAnimationRef.current.oncancel = () => {
        shell.style.height = '';
        shell.style.overflow = '';
      };
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [filteredAssignments]);

  const activeFilterCount =
    (statusFilter !== 'All' ? 1 : 0) +
    (priorityFilter !== 'All' ? 1 : 0) +
    (subjectFilter !== 'All' ? 1 : 0) +
    (search.trim() ? 1 : 0);

  function clearFilters() {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSubjectFilter('All');
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* ===== HEADER / COMMAND STRIP ===== */}
      <section
        className={cn(
          'relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/92 px-4 py-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:px-5 sm:py-5 dark:border-slate-800 dark:bg-[#050d1b]/86',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.1),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
              <LayoutDashboard size={13} />
              Assignment command center
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:bg-gradient-to-r dark:from-slate-100 dark:via-blue-100 dark:to-slate-200 dark:bg-clip-text dark:text-transparent">
                Assignments
              </h1>
              <p className="mt-1 max-w-xl text-sm text-gray-500 dark:text-slate-400">
                Plan, filter, and finish coursework in a single workspace — list on the left,
                utilities on the right.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:flex-wrap lg:justify-end">
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              {headerPills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <div
                    key={pill.label}
                    className={cn(
                      'inline-flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 shadow-sm',
                      pill.classes,
                    )}
                  >
                    <Icon size={14} className={pill.iconClasses} />
                    <div className="flex items-baseline gap-1.5 leading-none">
                      <span className="text-lg font-bold tabular-nums">{pill.value}</span>
                      <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">
                        {pill.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              onClick={focusQuickAdd}
              iconLeft={<Plus size={16} />}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[0_16px_32px_-22px_rgba(79,70,229,0.9)]"
            >
              New Assignment
            </Button>
          </div>
        </div>
      </section>

      {/* ===== WORKSPACE (main + rail) ===== */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        {/* ===== MAIN WORKSPACE ===== */}
        <div className="min-w-0 space-y-4">
          {/* Command bar */}
          <div className="space-y-1.5">
            {ANNOTATION_CAPTURE_MODE && (
              <div className="flex justify-end pr-0.5">
                <CaptureCallout n={2} tone="amber" variant="inline" />
              </div>
            )}
            <div
              className={cn(
                'rounded-2xl border border-slate-200/80 bg-white/92 p-2 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:border-slate-800 dark:bg-[#050d1b]/84',
                annotate('amber'),
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-[2_1_280px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title or subject"
                    className="w-full rounded-xl border-slate-200/80 bg-white/95 py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-blue-400 dark:bg-[#070f1f]"
                  />
                </div>

                <CommandSelect
                  icon={<Filter size={14} />}
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as 'All' | Status)
                  }
                  className="flex-[1_1_150px]"
                >
                  {(['All', 'Not Started', 'In Progress', 'Completed', 'Overdue'] as const).map(
                    (item) => (
                      <option key={item} value={item}>
                        {item === 'All' ? 'Any status' : item}
                      </option>
                    ),
                  )}
                </CommandSelect>

                <CommandSelect
                  icon={<Flag size={14} />}
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(event.target.value as 'All' | Priority)
                  }
                  className="flex-[1_1_140px]"
                >
                  {(['All', ...priorityOptions] as const).map((item) => (
                    <option key={item} value={item}>
                      {item === 'All' ? 'Any priority' : item}
                    </option>
                  ))}
                </CommandSelect>

                <CommandSelect
                  icon={<BookOpen size={14} />}
                  value={subjectFilter}
                  onChange={(event) => setSubjectFilter(event.target.value)}
                  className="flex-[1_1_160px]"
                >
                  <option value="All">All subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code}
                    </option>
                  ))}
                </CommandSelect>

                <CommandSelect
                  icon={<ArrowDownUp size={14} />}
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as 'date-asc' | 'date-desc')
                  }
                  className="flex-[1_1_170px]"
                >
                  <option value="date-asc">Due: Soonest</option>
                  <option value="date-desc">Due: Latest</option>
                </CommandSelect>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#070f1f] dark:text-slate-300 dark:hover:bg-slate-900/70"
                  >
                    <X size={12} />
                    Clear ({activeFilterCount})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs + result meta */}
          <div className="space-y-1.5">
            {ANNOTATION_CAPTURE_MODE && (
              <div className="flex justify-end pr-1">
                <CaptureCallout n={6} tone="violet" variant="inline" />
              </div>
            )}
            <div
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-1.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-[#050d1b]/84',
                annotate('violet'),
              )}
            >
              <div className="relative grid min-w-[280px] flex-1 grid-cols-3 gap-0 overflow-hidden rounded-[14px] sm:min-w-[320px] sm:flex-none sm:w-auto">
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/3 rounded-[12px] bg-white shadow-[0_12px_28px_-20px_rgba(79,70,229,0.8)] transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-[#0a1428]"
                  style={{
                    transform: `translateX(${assignmentTabs.indexOf(tab) * 100}%)`,
                  }}
                />
                {assignmentTabs.map((tabLabel) => (
                  <button
                    key={tabLabel}
                    type="button"
                    onClick={() => setTab(tabLabel)}
                    className={cn(
                      'relative z-[1] flex min-h-[40px] items-center justify-center gap-2 rounded-[12px] px-4 py-2 text-sm font-semibold transition-[color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:min-w-[96px]',
                      tab === tabLabel
                        ? 'text-blue-600 dark:text-blue-300'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-950/70 dark:hover:text-white',
                    )}
                  >
                    <span>{tabLabel}</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                        tab === tabLabel
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300',
                      )}
                    >
                      {tabCounts[tabLabel]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 pr-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className="tabular-nums">
                  {filteredAssignments.length} shown · {totalAssignments} total
                </span>
                {overdueAssignments > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/70 bg-rose-50 px-2 py-0.5 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                    <Clock3 size={11} />
                    {overdueAssignments} overdue
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Assignments grid */}
          <div className="space-y-1.5">
            {ANNOTATION_CAPTURE_MODE && (
              <div className="flex justify-start pl-0.5">
                <CaptureCallout n={3} tone="indigo" variant="inline" />
              </div>
            )}
            <div
              ref={listShellRef}
              className={cn('relative overflow-hidden rounded-2xl', annotate('indigo'))}
            >
              <div
                ref={listContainerRef}
                className={cn(
                  'relative z-0 grid grid-cols-1 gap-4 p-0.5 md:grid-cols-2',
                  'will-change-[transform,opacity]',
                )}
              >
                {filteredAssignments.length === 0 ? (
                  <EmptyState
                    message={
                      activeFilterCount > 0
                        ? 'No assignments match your filters. Try clearing one.'
                        : 'No assignments yet — use the quick add panel to create your first.'
                    }
                    className="col-span-full flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-white/70 p-8 shadow-sm dark:border-slate-800 dark:bg-[#050d1b]/72"
                  />
                ) : (
                  filteredAssignments.map((assignment, index) => (
                    <div key={assignment.id}>
                      <AssignmentCard
                        assignment={assignment}
                        subjects={subjects}
                        onToggleSubtask={toggleSubtask}
                        onToggleAssignmentComplete={toggleAssignmentComplete}
                        onAddSubtask={addSubtask}
                        onUpdateSubtask={updateSubtask}
                        onDeleteSubtask={deleteSubtask}
                        onMoveSubtask={moveSubtask}
                        onDelete={handleDeleteAssignment}
                        density="compact"
                        emphasis={tab === 'Active' ? 'urgent' : 'default'}
                        onFocus={(id) =>
                          setFocusedId((current) => (current === id ? null : id))
                        }
                        isFocused={focusedId === assignment.id}
                        captureHighlight={index === 0 ? 'card-progress-subtasks' : undefined}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT UTILITY RAIL ===== */}
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-4">
          {focusedAssignment ? (
            <FocusedDetailPanel
              assignment={focusedAssignment}
              subjects={subjects}
              onClose={() => setFocusedId(null)}
              onToggleComplete={toggleAssignmentComplete}
              onDelete={handleDeleteAssignment}
            />
          ) : (
            <QuickAddPanel
              titleRef={quickAddTitleRef}
              title={title}
              setTitle={setTitle}
              subjectId={subjectId}
              setSubjectId={setSubjectId}
              dueDate={dueDate}
              setDueDate={setDueDate}
              priority={priority}
              setPriority={setPriority}
              notes={notes}
              setNotes={setNotes}
              subjects={subjects}
              titleError={titleError}
              subjectError={subjectError}
              dueError={dueError}
              duplicateTitleError={duplicateTitleError}
              dueDateWarning={dueDateWarning}
              assignmentCanSubmit={assignmentCanSubmit}
              assignmentFormHasErrors={assignmentFormHasErrors}
              assignmentSuccess={assignmentSuccess}
              selectedSubject={selectedSubject}
              dueDateValue={dueDateValue}
              onSubmit={(event) => {
                event.preventDefault();
                setShowAssignmentErrors(true);
                if (!assignmentCanSubmit) return;
                addAssignment({
                  title: title.trim(),
                  subjectId,
                  dueDate: new Date(`${dueDate}T12:00:00`).toISOString(),
                  priority,
                  notes: notes.trim() || undefined,
                });
                setShowAssignmentErrors(false);
                setAssignmentSuccess('Assignment created.');
                showToast({
                  message: 'Assignment created.',
                  tone: 'success',
                  durationMs: 3200,
                });
                setTitle('');
                setDueDate('');
                setNotes('');
              }}
            />
          )}

          <WorkloadSnapshot
            total={workloadByPriority.total}
            items={workloadByPriority.items}
            overdue={overdueAssignments}
            completed={completedAssignments}
          />

          <UpcomingDeadlinesPanel
            assignments={upcomingDeadlines}
            subjects={subjects}
            onFocus={(id) => setFocusedId(id)}
          />
        </aside>
      </div>
    </div>
  );
}

/* ============================================================ */
/*                       Support components                      */
/* ============================================================ */

interface CommandSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon: React.ReactNode;
}

function CommandSelect({ icon, className, children, ...rest }: CommandSelectProps) {
  return (
    <div className={cn('relative min-w-[130px]', className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-gray-400 dark:text-gray-500">
        {icon}
      </span>
      <Select
        {...rest}
        className="w-full rounded-xl border-slate-200/80 bg-white/95 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-blue-400 dark:bg-[#070f1f]"
      >
        {children}
      </Select>
    </div>
  );
}

/* ---------------------- Quick Add Panel ---------------------- */

interface QuickAddPanelProps {
  titleRef: React.RefObject<HTMLInputElement | null>;
  title: string;
  setTitle: (value: string) => void;
  subjectId: string;
  setSubjectId: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  priority: Priority;
  setPriority: (value: Priority) => void;
  notes: string;
  setNotes: (value: string) => void;
  subjects: { id: string; name: string; code: string }[];
  titleError?: string;
  subjectError?: string;
  dueError?: string;
  duplicateTitleError?: string;
  dueDateWarning?: string;
  assignmentCanSubmit: boolean;
  assignmentFormHasErrors: boolean;
  assignmentSuccess: string | null;
  selectedSubject?: { code: string };
  dueDateValue: Date | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function QuickAddPanel({
  titleRef,
  title,
  setTitle,
  subjectId,
  setSubjectId,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  notes,
  setNotes,
  subjects,
  titleError,
  subjectError,
  dueError,
  duplicateTitleError,
  dueDateWarning,
  assignmentCanSubmit,
  assignmentFormHasErrors,
  assignmentSuccess,
  selectedSubject,
  dueDateValue,
  onSubmit,
}: QuickAddPanelProps) {
  return (
    <div className="space-y-1.5">
      {ANNOTATION_CAPTURE_MODE && (
        <div className="flex justify-end pr-0.5">
          <CaptureCallout n={1} tone="teal" variant="inline" />
        </div>
      )}
      <form
        onSubmit={onSubmit}
        noValidate
        className={cn(
          'relative overflow-hidden rounded-[22px] border bg-white/95 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:bg-[#050d1b]/86',
          annotate('teal'),
          assignmentFormHasErrors
            ? 'border-rose-200 dark:border-rose-900/55'
            : 'border-slate-200/80 dark:border-slate-800',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_28%)]" />
        <div className="relative space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
              <NotebookPen size={13} />
              Quick Add
            </div>
            <span className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {subjects.length
                ? `${subjects.length} subject${subjects.length === 1 ? '' : 's'}`
                : 'No subjects yet'}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1.5">
              <label
                className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500"
                htmlFor="qa-title"
              >
                Title
              </label>
              <div className="relative">
                <BookOpen
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <Input
                  id="qa-title"
                  ref={titleRef}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Essay draft, lab write-up..."
                  hasError={Boolean(titleError || duplicateTitleError)}
                  aria-invalid={Boolean(titleError || duplicateTitleError)}
                  className="w-full rounded-xl border-slate-200/80 bg-white/95 py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-blue-400 dark:bg-gray-950/75"
                />
              </div>
              <FormAssist message={titleError} tone="error" />
              <FormAssist message={duplicateTitleError} tone="error" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label
                  className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500"
                  htmlFor="qa-subject"
                >
                  Subject
                </label>
                <Select
                  id="qa-subject"
                  value={subjectId}
                  onChange={(event) => setSubjectId(event.target.value)}
                  hasError={Boolean(subjectError)}
                  aria-invalid={Boolean(subjectError)}
                  className="w-full rounded-xl border-slate-200/80 bg-white/95 py-2.5 px-3 text-sm shadow-sm focus:border-blue-400 dark:bg-gray-950/75"
                >
                  <option value="">Select</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code}
                    </option>
                  ))}
                </Select>
                <FormAssist message={subjectError} tone="error" />
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500"
                  htmlFor="qa-due"
                >
                  Due
                </label>
                <Input
                  id="qa-due"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  hasError={Boolean(dueError)}
                  aria-invalid={Boolean(dueError)}
                  className="w-full rounded-xl border-slate-200/80 bg-white/95 py-2.5 px-3 text-sm shadow-sm focus:border-blue-400 dark:bg-gray-950/75"
                />
                <FormAssist message={dueError} tone="error" />
                <FormAssist message={dueDateWarning} tone="warning" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
                Priority
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {priorityOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPriority(option)}
                    className={cn(
                      'rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors',
                      priority === option
                        ? priorityTone[option].chip
                        : 'border-slate-200/80 bg-white/70 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900/90',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500"
                htmlFor="qa-notes"
              >
                Notes
              </label>
              <Input
                id="qa-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Reminder, brief, next step"
                className="w-full rounded-xl border-slate-200/80 bg-white/95 py-2.5 px-3 text-sm shadow-sm focus:border-blue-400 dark:bg-gray-950/75"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="rounded-full border border-slate-200/70 bg-slate-50/70 px-2 py-0.5 dark:border-slate-800 dark:bg-slate-900/50">
                {selectedSubject ? `${selectedSubject.code}` : 'Pick subject'}
              </span>
              <span className="rounded-full border border-slate-200/70 bg-slate-50/70 px-2 py-0.5 dark:border-slate-800 dark:bg-slate-900/50">
                {dueDateValue
                  ? dueDateValue.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'No date'}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
                  priorityTone[priority].chip,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', priorityTone[priority].dot)} />
                {priority}
              </span>
            </div>

            <Button
              type="submit"
              disabled={!assignmentCanSubmit || subjects.length === 0}
              iconLeft={<Plus size={16} />}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[0_16px_32px_-22px_rgba(79,70,229,0.9)]"
            >
              Add assignment
            </Button>
            {assignmentSuccess && <FormAssist message={assignmentSuccess} tone="success" />}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------------------- Workload Snapshot ---------------------- */

interface WorkloadSnapshotProps {
  total: number;
  items: Array<{ priority: Priority; count: number; pct: number }>;
  overdue: number;
  completed: number;
}

function WorkloadSnapshot({ total, items, overdue, completed }: WorkloadSnapshotProps) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:border-slate-800 dark:bg-[#050d1b]/84">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
            <PieChart size={14} />
          </span>
          <div className="leading-tight">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Workload snapshot
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active work, by priority
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {total}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="mb-3 flex h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {total === 0 ? (
          <div className="flex-1 bg-slate-100 dark:bg-slate-800" />
        ) : (
          items
            .filter((item) => item.count > 0)
            .map((item) => (
              <div
                key={item.priority}
                className={cn('h-full', priorityTone[item.priority].bar)}
                style={{ width: `${item.pct}%` }}
                aria-label={`${item.priority}: ${item.count}`}
              />
            ))
        )}
      </div>

      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.priority}
            className="flex items-center justify-between gap-2 text-[12px]"
          >
            <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className={cn('h-2 w-2 rounded-full', priorityTone[item.priority].dot)} />
              {priorityTone[item.priority].label}
            </span>
            <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-200">
              {item.count}
              <span className="ml-1 text-[10px] font-normal text-slate-400 dark:text-slate-500">
                {item.pct}%
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-800">
        <div className="rounded-lg border border-rose-200/60 bg-rose-50/70 px-2.5 py-1.5 text-[11px] dark:border-rose-900/50 dark:bg-rose-950/30">
          <p className="text-rose-600 dark:text-rose-300">Overdue</p>
          <p className="text-base font-bold tabular-nums text-rose-700 dark:text-rose-200">
            {overdue}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/70 px-2.5 py-1.5 text-[11px] dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-emerald-600 dark:text-emerald-300">Done</p>
          <p className="text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-200">
            {completed}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Upcoming Deadlines ---------------------- */

interface UpcomingDeadlinesPanelProps {
  assignments: Assignment[];
  subjects: { id: string; name: string; code: string; color: string }[];
  onFocus: (id: string) => void;
}

function UpcomingDeadlinesPanel({
  assignments,
  subjects,
  onFocus,
}: UpcomingDeadlinesPanelProps) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:border-slate-800 dark:bg-[#050d1b]/84">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
            <CalendarClock size={14} />
          </span>
          <div className="leading-tight">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Upcoming deadlines
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sorted by soonest first
            </p>
          </div>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-[12px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          Nothing scheduled — you’re all clear.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {assignments.map((assignment) => {
            const subject = subjects.find((s) => s.id === assignment.subjectId);
            const dueDate = new Date(assignment.dueDate);
            const isOverdue = assignment.status === 'Overdue';
            return (
              <li key={assignment.id}>
                <button
                  type="button"
                  onClick={() => onFocus(assignment.id)}
                  className="group/row flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-slate-200/80 hover:bg-slate-50/70 dark:hover:border-slate-800 dark:hover:bg-slate-900/50"
                >
                  <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      priorityTone[assignment.priority].dot,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-slate-800 dark:text-slate-200">
                      {assignment.title}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {subject?.code ?? 'No subject'} · {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold tabular-nums',
                      isOverdue
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200',
                    )}
                  >
                    {formatDaysLeft(assignment.dueDate)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------------------- Focused Detail Panel ---------------------- */

interface FocusedDetailPanelProps {
  assignment: Assignment;
  subjects: { id: string; name: string; code: string; color: string }[];
  onClose: () => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

function FocusedDetailPanel({
  assignment,
  subjects,
  onClose,
  onToggleComplete,
  onDelete,
}: FocusedDetailPanelProps) {
  const subject = subjects.find((s) => s.id === assignment.subjectId);
  const dueDate = new Date(assignment.dueDate);
  const isCompleted = assignment.status === 'Completed';
  const completedSubtasks = assignment.subtasks.filter((task) => task.isCompleted).length;
  const total = assignment.subtasks.length;

  return (
    <div className="rounded-[22px] border border-blue-200/70 bg-white/95 shadow-[0_20px_50px_-28px_rgba(59,130,246,0.4)] backdrop-blur-sm dark:border-blue-900/55 dark:bg-[#050d1b]/90">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 bg-gradient-to-r from-blue-50/80 to-transparent px-4 py-2.5 dark:border-slate-800 dark:from-blue-950/30">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
            <Sparkles size={14} />
          </span>
          <div className="leading-tight">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-200">
              Focused
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Detail context</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close focus panel"
          className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <SubjectPill subject={subject} />
            <Badge
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10.5px] font-semibold',
                priorityTone[assignment.priority].chip,
              )}
            >
              {assignment.priority}
            </Badge>
            <Badge
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10.5px] font-semibold',
                statusTone[assignment.status],
              )}
            >
              {assignment.status}
            </Badge>
          </div>
          <Link
            to={`/assignments/${assignment.id}`}
            className="block text-base font-semibold leading-snug text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-300"
          >
            {assignment.title}
          </Link>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            {dueDate.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            · {formatDaysLeft(assignment.dueDate)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <span>Progress</span>
            <span className="tabular-nums">{assignment.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500',
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500',
              )}
              style={{ width: `${assignment.progress}%` }}
            />
          </div>
        </div>

        {total > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ListChecks size={12} />
                Subtasks
              </span>
              <span className="tabular-nums text-slate-500 dark:text-slate-400">
                {completedSubtasks}/{total}
              </span>
            </div>
            <ul className="space-y-1 text-[12.5px]">
              {assignment.subtasks.slice(0, 5).map((subtask) => (
                <li
                  key={subtask.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-slate-800 dark:bg-[#060e1e]/55',
                    subtask.isCompleted && 'opacity-70',
                  )}
                >
                  {subtask.isCompleted ? (
                    <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
                  ) : (
                    <Circle size={13} className="shrink-0 text-slate-400" />
                  )}
                  <span
                    className={cn(
                      'truncate',
                      subtask.isCompleted
                        ? 'text-slate-500 line-through dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-200',
                    )}
                  >
                    {subtask.title}
                  </span>
                </li>
              ))}
              {total > 5 && (
                <li className="pl-1 text-[11px] text-slate-400 dark:text-slate-500">
                  +{total - 5} more…
                </li>
              )}
            </ul>
          </div>
        )}

        {assignment.notes && (
          <div className="rounded-xl border border-slate-200/70 bg-amber-50/40 px-3 py-2 text-[12px] leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-amber-950/15 dark:text-slate-300">
            {assignment.notes}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Link to={`/assignments/${assignment.id}`} className="flex-1">
            <Button
              type="button"
              variant="secondary"
              iconLeft={<ArrowUpRight size={14} />}
              className="w-full rounded-xl py-2 text-xs"
            >
              Open
            </Button>
          </Link>
          <Button
            type="button"
            onClick={() => onToggleComplete(assignment.id)}
            iconLeft={<CheckCircle2 size={14} />}
            className="flex-1 rounded-xl py-2 text-xs"
          >
            {isCompleted ? 'Reopen' : 'Complete'}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
          <Link
            to={`/assignments/${assignment.id}`}
            className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Edit details
            <ChevronRight size={12} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(assignment.id)}
            className="text-rose-500 hover:text-rose-600 dark:text-rose-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

