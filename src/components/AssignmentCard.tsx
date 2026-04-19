import type { Assignment, Subject, Subtask } from '../types';
import { format, isPast } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Eye,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useRef, useState } from 'react';
import { formatDaysLeft } from '../lib/planner';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';
import Input from './ui/Input';
import SubjectPill from './ui/SubjectPill';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { useToast } from '../context/useToast';
import {
  ANNOTATION_CAPTURE_MODE,
  captureCardFrame,
  captureProgressFill,
  captureSubtasksFill,
} from '../lib/annotationCapture';
import { CaptureCallout } from './CaptureCallout';

interface AssignmentCardProps {
  assignment: Assignment;
  subjects: Subject[];
  onToggleSubtask?: (assignmentId: string, subtaskId: string) => void;
  onToggleAssignmentComplete?: (assignmentId: string) => void;
  onAddSubtask?: (assignmentId: string, title: string) => void;
  onUpdateSubtask?: (assignmentId: string, subtaskId: string, title: string) => void;
  onDeleteSubtask?: (assignmentId: string, subtaskId: string) => void;
  onMoveSubtask?: (assignmentId: string, subtaskId: string, direction: 'up' | 'down') => void;
  onDelete?: (assignmentId: string) => void;
  compact?: boolean;
  density?: 'default' | 'compact';
  emphasis?: 'default' | 'urgent' | 'calm';
  /** Optional: enable a "focus" affordance that highlights this card in a parent detail rail. */
  onFocus?: (assignmentId: string) => void;
  isFocused?: boolean;
  /** Whether the card starts in its expanded "working" state. Defaults to false (preview). */
  defaultExpanded?: boolean;
  /** Only for proposal screenshots; revert with ANNOTATION_CAPTURE_MODE */
  captureHighlight?: 'card' | 'progress' | 'subtasks' | 'card-progress-subtasks';
}

export default function AssignmentCard({
  assignment,
  subjects,
  onToggleSubtask,
  onToggleAssignmentComplete,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onMoveSubtask,
  onDelete,
  compact = false,
  density = 'default',
  emphasis = 'default',
  onFocus,
  isFocused = false,
  defaultExpanded = false,
  captureHighlight,
}: AssignmentCardProps) {
  const { showToast } = useToast();
  const cap = ANNOTATION_CAPTURE_MODE ? captureHighlight : undefined;
  const ringCard = cap === 'card' || cap === 'card-progress-subtasks';
  const ringProgress = cap === 'progress' || cap === 'card-progress-subtasks';
  const ringSubtasks = cap === 'subtasks' || cap === 'card-progress-subtasks';
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [pendingAssignmentDelete, setPendingAssignmentDelete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [celebratingSubtaskIds, setCelebratingSubtaskIds] = useState<string[]>([]);
  const [cardCelebrating, setCardCelebrating] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const previousSubtaskCompletionRef = useRef<Record<string, boolean>>({});
  const celebrationTimeoutsRef = useRef<Record<string, number>>({});
  const previousStatusRef = useRef<string | null>(null);
  const cardCelebrateTimeoutRef = useRef<number | null>(null);

  const subtaskTools =
    Boolean(onUpdateSubtask && onDeleteSubtask && onMoveSubtask && onToggleSubtask);

  useEffect(() => {
    if (editingSubtaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSubtaskId]);

  useEffect(() => {
    const previousCompletion = previousSubtaskCompletionRef.current;
    const newlyCompleted = assignment.subtasks
      .filter((subtask) => subtask.isCompleted && !previousCompletion[subtask.id])
      .map((subtask) => subtask.id);

    if (newlyCompleted.length > 0) {
      setCelebratingSubtaskIds((current) => Array.from(new Set([...current, ...newlyCompleted])));

      newlyCompleted.forEach((subtaskId) => {
        const existingTimeout = celebrationTimeoutsRef.current[subtaskId];
        if (existingTimeout) window.clearTimeout(existingTimeout);

        celebrationTimeoutsRef.current[subtaskId] = window.setTimeout(() => {
          setCelebratingSubtaskIds((current) => current.filter((id) => id !== subtaskId));
          delete celebrationTimeoutsRef.current[subtaskId];
        }, 420);
      });
    }

    previousSubtaskCompletionRef.current = Object.fromEntries(
      assignment.subtasks.map((subtask) => [subtask.id, subtask.isCompleted]),
    );
  }, [assignment.subtasks]);

  useEffect(() => {
    if (previousStatusRef.current && previousStatusRef.current !== 'Completed' && assignment.status === 'Completed') {
      setCardCelebrating(true);
      if (cardCelebrateTimeoutRef.current) window.clearTimeout(cardCelebrateTimeoutRef.current);
      cardCelebrateTimeoutRef.current = window.setTimeout(() => setCardCelebrating(false), 1100);
    }
    previousStatusRef.current = assignment.status;
  }, [assignment.status]);

  useEffect(() => {
    return () => {
      Object.values(celebrationTimeoutsRef.current).forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      if (cardCelebrateTimeoutRef.current) window.clearTimeout(cardCelebrateTimeoutRef.current);
    };
  }, []);

  const subject = subjects.find((s) => s.id === assignment.subjectId);
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = isPast(dueDate) && assignment.status !== 'Completed';
  const completedSubtasks = assignment.subtasks.filter((task) => task.isCompleted).length;
  const remainingSubtasks = Math.max(assignment.subtasks.length - completedSubtasks, 0);
  const isCompleted = assignment.status === 'Completed';

  const priorityColors = {
    Low: 'border-slate-200/70 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200',
    Medium: 'border-blue-200/70 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200',
    High: 'border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
    Urgent: 'border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200',
  };

  const cardTone = isCompleted
    ? 'border-emerald-200/70 bg-emerald-50/55 dark:border-emerald-900/50 dark:bg-emerald-950/20'
    : isOverdue
      ? 'border-rose-200/70 bg-white/95 dark:border-rose-900/55 dark:bg-[#080f1e]/90'
      : emphasis === 'urgent'
        ? 'border-blue-200/70 bg-white/95 dark:border-blue-900/55 dark:bg-[#080f1e]/90'
        : emphasis === 'calm'
          ? 'border-slate-200/70 bg-white/95 dark:border-slate-800 dark:bg-[#080f1e]/90'
          : 'border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-[#080f1e]/90';

  const progressFillClass = isCompleted
    ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500'
    : isOverdue
      ? 'bg-gradient-to-r from-rose-400 via-amber-400 to-orange-400'
      : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500';

  const metaChipClass =
    'inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/75 px-2.5 py-1 text-[11px] font-medium text-gray-600 backdrop-blur-sm dark:border-slate-800 dark:bg-[#060e1e]/70 dark:text-slate-300';

  const progressCopy = isCompleted
    ? 'All done — nice work.'
    : assignment.subtasks.length === 0
      ? 'Tap the check to mark this done, or add subtasks to split it up.'
      : remainingSubtasks === 1
        ? '1 step left'
        : `${remainingSubtasks} steps left`;

  function startEdit(subtask: Subtask) {
    if (!subtaskTools) return;
    setEditingSubtaskId(subtask.id);
    setEditDraft(subtask.title);
  }

  function cancelEdit() {
    setEditingSubtaskId(null);
    setEditDraft('');
  }

  function commitEdit() {
    const trimmed = editDraft.trim();
    if (!editingSubtaskId || !onUpdateSubtask) return;
    if (!trimmed) {
      cancelEdit();
      return;
    }
    onUpdateSubtask(assignment.id, editingSubtaskId, trimmed);
    cancelEdit();
  }

  function handleToggleAssignment() {
    if (!onToggleAssignmentComplete) return;
    onToggleAssignmentComplete(assignment.id);
    showToast({
      message: isCompleted
        ? `Reopened: “${assignment.title}”`
        : `Completed: “${assignment.title}” — great work.`,
      tone: isCompleted ? 'info' : 'success',
      durationMs: 3000,
    });
  }

  function renderSubtaskRow(subtask: Subtask, index: number, list: Subtask[]) {
    const isEditing = editingSubtaskId === subtask.id;
    const isFirst = index === 0;
    const isLast = index === list.length - 1;
    const isCelebrating = celebratingSubtaskIds.includes(subtask.id);

    return (
      <div
        key={subtask.id}
        className={cn(
          'group/subtask relative flex items-center gap-2.5 overflow-hidden rounded-lg border p-2 transition-[background-color,border-color,box-shadow] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]',
          subtask.isCompleted
            ? 'border-emerald-200/70 bg-emerald-50/70 dark:border-emerald-900/55 dark:bg-emerald-950/18'
            : 'border-slate-200/70 bg-white/85 hover:border-blue-200/80 hover:bg-blue-50/35 dark:border-slate-800 dark:bg-[#060e1e]/55 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/16',
          isCelebrating && 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200/80 dark:border-emerald-800 dark:bg-emerald-950/30 dark:ring-emerald-900/70',
        )}
      >
        {isCelebrating && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-[-40%] w-[34%] -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer dark:via-emerald-100/10"
          />
        )}
        <button
          type="button"
          aria-label={subtask.isCompleted ? 'Mark subtask incomplete' : 'Mark subtask complete'}
          onClick={() => onToggleSubtask?.(assignment.id, subtask.id)}
          className={cn(
            'shrink-0 rounded-full border p-1 transition-[background-color,border-color,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            subtask.isCompleted
              ? 'border-emerald-500 bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/40'
              : 'border-slate-300 bg-white text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
            isCelebrating && 'scale-[1.08]',
          )}
        >
          <span className="relative block h-4 w-4">
            <Circle
              size={16}
              className={cn(
                'absolute inset-0 transition-[opacity,transform] duration-200 ease-out',
                subtask.isCompleted ? 'scale-75 opacity-0' : 'scale-100 opacity-100',
              )}
            />
            <CheckCircle2
              size={16}
              className={cn(
                'absolute inset-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                subtask.isCompleted ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
              )}
            />
          </span>
        </button>

        {subtaskTools && (
          <div className="hidden shrink-0 flex-col gap-0.5 rounded-lg border border-slate-200/70 bg-slate-50/70 p-0.5 sm:flex dark:border-slate-800 dark:bg-slate-900/60">
            <button
              type="button"
              aria-label="Move subtask up"
              disabled={isFirst}
              onClick={() => onMoveSubtask!(assignment.id, subtask.id, 'up')}
              className={cn(
                'rounded-md p-0.5 text-slate-500 transition-colors dark:text-slate-400',
                isFirst
                  ? 'cursor-not-allowed opacity-30'
                  : 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white',
              )}
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              aria-label="Move subtask down"
              disabled={isLast}
              onClick={() => onMoveSubtask!(assignment.id, subtask.id, 'down')}
              className={cn(
                'rounded-md p-0.5 text-slate-500 transition-colors dark:text-slate-400',
                isLast
                  ? 'cursor-not-allowed opacity-30'
                  : 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white',
              )}
            >
              <ChevronDown size={13} />
            </button>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Input
              ref={editInputRef}
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              onBlur={() => commitEdit()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitEdit();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
              className="w-full rounded-lg border-slate-200 bg-white/90 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          ) : (
            <button
              type="button"
              onClick={() => onToggleSubtask?.(assignment.id, subtask.id)}
              onDoubleClick={() => startEdit(subtask)}
              className={cn(
                'w-full rounded-lg px-1.5 py-1.5 text-left text-[13px] leading-snug transition-[color,opacity] duration-250',
                subtask.isCompleted
                  ? 'text-slate-500 line-through dark:text-slate-500'
                  : 'font-medium text-slate-800 dark:text-slate-200',
              )}
            >
              {subtask.title}
            </button>
          )}
        </div>

        {subtaskTools && !isEditing && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover/subtask:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              aria-label="Edit subtask"
              onClick={() => startEdit(subtask)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              aria-label="Delete subtask"
              onClick={() => setPendingDelete({ id: subtask.id, title: subtask.title })}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative isolate overflow-hidden rounded-2xl border transition-all duration-300',
        density === 'compact' ? 'p-3' : 'p-3.5',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-18px_rgba(15,23,42,0.12)]',
        'hover:border-blue-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_42px_-22px_rgba(59,130,246,0.22)]',
        'dark:shadow-[0_1px_2px_rgba(2,6,23,0.5),0_22px_44px_-24px_rgba(2,6,23,0.85)]',
        'dark:hover:border-blue-900/60 dark:hover:shadow-[0_1px_2px_rgba(2,6,23,0.5),0_26px_52px_-22px_rgba(37,99,235,0.35)]',
        cardTone,
        cardCelebrating && 'animate-pulse-ring',
        isFocused &&
          'ring-2 ring-blue-400/70 ring-offset-2 ring-offset-white dark:ring-blue-500/60 dark:ring-offset-[#020617]',
        ringCard && captureCardFrame(),
      )}
    >
      {/* Confetti burst on full completion */}
      {cardCelebrating && <ConfettiBurst />}

      {/* Top hairline */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
          isCompleted
            ? 'via-emerald-300/70 dark:via-emerald-500/55'
            : isOverdue
              ? 'via-rose-300/70 dark:via-rose-500/55'
              : 'via-blue-300/70 dark:via-blue-500/50',
        )}
      />

      <div className="relative flex items-start gap-3">
        {/* Big completion checkbox */}
        <button
          type="button"
          onClick={handleToggleAssignment}
          disabled={!onToggleAssignmentComplete}
          aria-label={isCompleted ? 'Reopen assignment' : 'Mark assignment as complete'}
          className={cn(
            'group/check relative mt-0.5 shrink-0 rounded-full border p-0.5 transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isCompleted
              ? 'border-emerald-500 bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/40'
              : 'border-slate-300 bg-white text-slate-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-500 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
            !onToggleAssignmentComplete && 'cursor-default opacity-80',
            onToggleAssignmentComplete && 'hover:scale-[1.06] active:scale-[0.98]',
          )}
        >
          <span className="relative block h-6 w-6">
            <Circle
              size={24}
              className={cn(
                'absolute inset-0 transition-[opacity,transform] duration-200',
                isCompleted ? 'scale-75 opacity-0' : 'scale-100 opacity-100',
              )}
            />
            <CheckCircle2
              size={24}
              className={cn(
                'absolute inset-0 transition-[opacity,transform] duration-300',
                isCompleted ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
              )}
            />
          </span>
          {onToggleAssignmentComplete && !isCompleted && (
            <span className="pointer-events-none absolute -right-1 -top-1 hidden size-4 items-center justify-center rounded-full bg-blue-500 text-white shadow-md opacity-0 transition-opacity duration-200 group-hover/check:flex group-hover/check:opacity-100">
              <Sparkles size={10} />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <Link to={`/assignments/${assignment.id}`} className="min-w-0">
              <h3
                className={cn(
                  'text-[15px] font-semibold leading-5 text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-300',
                  isCompleted && 'text-slate-500 line-through dark:text-slate-400',
                )}
              >
                {assignment.title}
              </h3>
            </Link>
            <div className="flex shrink-0 items-center gap-1.5 self-start">
              {onFocus && !compact && (
                <button
                  type="button"
                  onClick={() => onFocus(assignment.id)}
                  aria-pressed={isFocused}
                  aria-label={isFocused ? 'Hide details panel' : 'Show details in side panel'}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition-all duration-200',
                    isFocused
                      ? 'border-blue-300 bg-blue-50 text-blue-700 opacity-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200'
                      : 'border-transparent text-slate-500 opacity-0 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100 focus:opacity-100 dark:text-slate-400 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
                  )}
                >
                  <Eye size={12} />
                  {isFocused ? 'Focused' : 'Focus'}
                </button>
              )}
              {onDelete && !compact && (
                <button
                  type="button"
                  onClick={() => setPendingAssignmentDelete(true)}
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-rose-500 opacity-0 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  Delete
                </button>
              )}
              <Badge
                className={cn(
                  'shrink-0 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold',
                  priorityColors[assignment.priority],
                )}
              >
                {assignment.priority}
              </Badge>
            </div>
          </div>

          {/* META: subject · date · days-left — single scannable row */}
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <SubjectPill subject={subject} />
            <div
              className={cn(
                metaChipClass,
                isOverdue && !isCompleted && 'border-rose-200/70 bg-rose-50/80 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-300',
              )}
            >
              {isOverdue && !isCompleted ? <Clock size={12} /> : <Calendar size={12} />}
              <span>{format(dueDate, 'MMM d')}</span>
            </div>
            <span
              className={cn(
                'text-[11.5px] font-semibold leading-4',
                isCompleted
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : isOverdue
                    ? 'text-rose-600 dark:text-rose-300'
                    : emphasis === 'urgent'
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {isCompleted ? 'Completed' : formatDaysLeft(assignment.dueDate)}
            </span>
          </div>

          {/* STATUS: slim progress bar + % + subtask count */}
          <div
            className={cn(
              'mt-2.5 flex items-center gap-2.5',
              ringProgress && captureProgressFill(),
            )}
          >
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={cn(
                  'h-full rounded-full transition-[width,background,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  progressFillClass,
                )}
                style={{ width: `${assignment.progress}%` }}
              />
            </div>
            <span
              className={cn(
                'shrink-0 text-[10.5px] font-bold tabular-nums',
                isCompleted
                  ? 'text-emerald-700 dark:text-emerald-200'
                  : 'text-slate-600 dark:text-slate-300',
              )}
            >
              {assignment.progress}%
            </span>
            {assignment.subtasks.length > 0 && (
              <span className="shrink-0 text-[10.5px] tabular-nums text-slate-500 dark:text-slate-400">
                {completedSubtasks}/{assignment.subtasks.length}
              </span>
            )}
            {cap === 'card-progress-subtasks' && (
              <CaptureCallout n={5} tone="green" variant="inline" className="shrink-0" />
            )}
          </div>

          {/* PREVIEW: next actionable subtask (collapsed state only) */}
          {!compact && !isExpanded && !isCompleted && (() => {
            const nextSubtask = assignment.subtasks.find((s) => !s.isCompleted);
            if (!nextSubtask) return null;
            return (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200/60 bg-slate-50/40 px-2 py-1.5 dark:border-slate-800/80 dark:bg-slate-900/30">
                <span className="shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Next
                </span>
                <button
                  type="button"
                  onClick={() => onToggleSubtask?.(assignment.id, nextSubtask.id)}
                  disabled={!onToggleSubtask}
                  aria-label={`Mark "${nextSubtask.title}" complete`}
                  className={cn(
                    'shrink-0 rounded-full border p-0.5 transition-colors',
                    'border-slate-300 bg-white text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
                    !onToggleSubtask && 'cursor-default opacity-70',
                  )}
                >
                  <Circle size={12} />
                </button>
                <span className="min-w-0 flex-1 truncate text-[12px] leading-4 text-slate-700 dark:text-slate-200">
                  {nextSubtask.title}
                </span>
              </div>
            );
          })()}

          {/* EXPANDED: full subtask list + notes + add form */}
          {!compact && isExpanded && (
            <>
              <div
                className={cn(
                  'mt-2.5 space-y-1.5 rounded-xl border border-slate-200/70 bg-slate-50/55 p-2 dark:border-slate-800 dark:bg-[#050d1b]/45',
                  ringSubtasks && captureSubtasksFill(),
                )}
              >
                {cap === 'card-progress-subtasks' && (
                  <div className="flex justify-end pb-0.5">
                    <CaptureCallout n={4} tone="rose" variant="inline" />
                  </div>
                )}
                <div className="mb-1 flex items-center justify-between gap-3 px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Subtasks
                  </p>
                  <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-900/70 dark:text-slate-300">
                    {completedSubtasks}/{assignment.subtasks.length}
                  </span>
                </div>
                {assignment.subtasks.length === 0 ? (
                  <p className="px-1 py-1 text-[11.5px] text-slate-500 dark:text-slate-400">
                    No subtasks yet — add one below to split this up.
                  </p>
                ) : (
                  assignment.subtasks.map((subtask, index, list) =>
                    renderSubtaskRow(subtask, index, list),
                  )
                )}
              </div>

              {assignment.notes && (
                <div className="mt-2 rounded-lg border border-amber-200/60 bg-amber-50/50 px-2.5 py-1.5 text-[12px] leading-5 text-slate-700 dark:border-amber-900/40 dark:bg-amber-950/15 dark:text-slate-300">
                  <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    Note
                  </span>
                  {assignment.notes}
                </div>
              )}

              {onAddSubtask && (
                <form
                  className="mt-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!newSubtask.trim()) return;
                    onAddSubtask(assignment.id, newSubtask);
                    setNewSubtask('');
                  }}
                >
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300/80 bg-white/65 p-1.5 transition-colors focus-within:border-blue-400 focus-within:bg-white dark:border-slate-700/70 dark:bg-[#060e1e]/55 dark:focus-within:border-blue-500 dark:focus-within:bg-[#060e1e]/90">
                    <Plus size={14} className="ml-1.5 shrink-0 text-slate-400" />
                    <Input
                      value={newSubtask}
                      onChange={(event) => setNewSubtask(event.target.value)}
                      placeholder="Add a subtask..."
                      className="min-w-0 flex-1 border-transparent bg-transparent py-1 text-sm focus:border-transparent focus:ring-0 dark:border-transparent dark:bg-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtask.trim()}
                      className="shrink-0 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* EXPAND / COLLAPSE TOGGLE */}
          {!compact && (assignment.subtasks.length > 0 || onAddSubtask) && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                aria-expanded={isExpanded}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
              >
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isExpanded
                  ? 'Show less'
                  : assignment.subtasks.length > 0
                    ? `Expand · ${assignment.subtasks.length} subtask${assignment.subtasks.length === 1 ? '' : 's'}`
                    : 'Expand · add subtasks'}
              </button>
              {!isExpanded && progressCopy && !isCompleted && (
                <span className="truncate text-[10.5px] italic text-slate-400 dark:text-slate-500">
                  {progressCopy}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={Boolean(pendingDelete)}
        title="Remove subtask?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed. Progress will update immediately. This cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete && onDeleteSubtask) {
            onDeleteSubtask(assignment.id, pendingDelete.id);
            if (editingSubtaskId === pendingDelete.id) cancelEdit();
            showToast({
              message: `Subtask removed: “${pendingDelete.title}”`,
              tone: 'info',
              durationMs: 3600,
            });
          }
          setPendingDelete(null);
        }}
      />

      <ConfirmationDialog
        isOpen={pendingAssignmentDelete}
        title="Delete assignment?"
        description={`“${assignment.title}” and all of its subtasks will be removed from your planner.`}
        confirmLabel="Delete assignment"
        cancelLabel="Cancel"
        onCancel={() => setPendingAssignmentDelete(false)}
        onConfirm={() => {
          setPendingAssignmentDelete(false);
          onDelete?.(assignment.id);
        }}
      />
    </div>
  );
}

function ConfettiBurst() {
  const pieces = [
    { x: 24, y: -42, color: 'bg-emerald-400' },
    { x: -28, y: -46, color: 'bg-blue-400' },
    { x: 40, y: -24, color: 'bg-amber-400' },
    { x: -42, y: -20, color: 'bg-rose-400' },
    { x: 12, y: -54, color: 'bg-teal-400' },
    { x: -18, y: -58, color: 'bg-violet-400' },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute left-6 top-6 z-20">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={cn('absolute block size-1.5 rounded-sm', p.color)}
          style={{
            ['--ss-confetti-drift' as string]: `translate(${p.x}px, ${p.y}px)`,
            animation: `ss-confetti-pop 900ms cubic-bezier(0.22,1,0.36,1) ${i * 30}ms both`,
          }}
        />
      ))}
    </div>
  );
}
