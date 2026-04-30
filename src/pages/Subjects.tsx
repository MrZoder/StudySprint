/**
 * Subjects — manage the units the student is studying (/subjects).
 * -----------------------------------------------------------------------------
 * Two-column layout: subject list on the left, add/edit form on the right.
 * Deleting a subject also drops every assignment attached to it (handled by
 * `deleteSubject` in the planner store), and a confirmation dialog gates that
 * destructive action.
 *
 * `COLOR_OPTIONS` is the curated palette students choose from; the Tailwind
 * utility (e.g. `bg-blue-500`) is what gets stored on Subject.color and is
 * later mapped to a full theme by getSubjectTheme.
 */
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Trash2, Pencil, X, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePlanner } from '../context/usePlanner';
import { useToast } from '../context/useToast';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import type { Subject } from '../types';
import { getSubjectTheme } from '../lib/subjectStyles';
import { isBlank, subjectCodeTaken } from '../lib/formValidation';
import { ANNOTATION_CAPTURE_MODE, annotate } from '../lib/annotationCapture';
import { CaptureCallout } from '../components/CaptureCallout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SectionHeader from '../components/ui/SectionHeader';
import FormAssist from '../components/ui/FormAssist';

const COLOR_OPTIONS: { value: string; label: string; hex: string }[] = [
  { value: 'bg-blue-500',   label: 'Blue',   hex: '#3b82f6' },
  { value: 'bg-slate-500', label: 'Slate', hex: '#64748b' },
  { value: 'bg-teal-500',   label: 'Teal',   hex: '#14b8a6' },
  { value: 'bg-cyan-500',   label: 'Cyan',   hex: '#06b6d4' },
  { value: 'bg-emerald-500',   label: 'Emerald',   hex: '#10b981' },
  { value: 'bg-amber-500',  label: 'Amber',  hex: '#f59e0b' },
];

export default function Subjects() {
  const { subjects, assignments, addSubject, updateSubject, deleteSubject } = usePlanner();
  const { showToast } = useToast();
  const [subjectPendingDelete, setSubjectPendingDelete] = useState<Subject | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Cache `subjectId -> assignment count` once per assignments change so
  // every row + the delete dialog can read it in O(1) instead of scanning
  // the assignment list per render.
  const assignmentCountBySubject = useMemo(() => {
    return assignments.reduce<Record<string, number>>((acc, assignment) => {
      acc[assignment.subjectId] = (acc[assignment.subjectId] ?? 0) + 1;
      return acc;
    }, {});
  }, [assignments]);

  const nameError = showErrors && isBlank(name) ? 'Subject name is required.' : undefined;
  const codeError = showErrors && isBlank(code) ? 'Subject code is required.' : undefined;
  const duplicateCodeError =
    !isBlank(code) && subjectCodeTaken(subjects, code, editingId)
      ? 'That subject code is already in use. Choose a different code.'
      : undefined;

  const formHasErrors = Boolean(nameError || codeError || duplicateCodeError);

  const canSubmit =
    !isBlank(name) && !isBlank(code) && !subjectCodeTaken(subjects, code, editingId);

  useEffect(() => {
    if (!formSuccess) return;
    const timer = window.setTimeout(() => setFormSuccess(null), 2800);
    return () => window.clearTimeout(timer);
  }, [formSuccess]);

  const subjectDeleteDescription: string =
    subjectPendingDelete == null
      ? ""
      : (() => {
          const s = subjectPendingDelete;
          const n = assignmentCountBySubject[s.id] ?? 0;
          return n > 0
            ? `Deleting “${s.name}” (${s.code}) will also remove ${n} assignment${n === 1 ? "" : "s"} linked to it. This cannot be undone.`
            : `Deleting “${s.name}” (${s.code}) will remove this subject. This cannot be undone.`;
        })();

  /**
   * Wipe the form back to a "new subject" state. Used on cancel-edit and
   * after a successful save so the next entry starts clean. Kept as a
   * regular function (not a useCallback) because it isn't passed to
   * memoised children.
   */
  function resetSubjectForm() {
    setEditingId(null);
    setName('');
    setCode('');
    setLecturer('');
    setNotes('');
    setColor(COLOR_OPTIONS[0].value);
    setShowOptionalDetails(false);
    setShowErrors(false);
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <div className="space-y-4">
        <SectionHeader title="Subjects" description="Manage your courses and modules." />

        {ANNOTATION_CAPTURE_MODE && (
          <div className="flex justify-end pr-0.5">
            <CaptureCallout n={1} tone="teal" variant="inline" />
          </div>
        )}

        <form
          className={cn(
            'rounded-2xl border shadow-sm transition-colors duration-200',
            'bg-white dark:bg-gray-900/80',
            annotate('teal'),
            formHasErrors
              ? 'border-rose-300 dark:border-rose-800/60'
              : 'border-gray-200/80 dark:border-gray-700/60',
          )}
          onSubmit={(event) => {
            event.preventDefault();
            // Form behaves as one component for both create and edit:
            // `editingId` decides which planner action to call, otherwise
            // the validation, payload normalisation, and reset flow are
            // identical. Code is uppercased here so duplicate detection
            // and rendering stay case-insensitive.
            setShowErrors(true);
            if (!canSubmit) return;
            if (editingId) {
              updateSubject(editingId, {
                name: name.trim(),
                code: code.trim().toUpperCase(),
                color,
                lecturer: lecturer.trim() || undefined,
                notes: notes.trim() || undefined,
              });
              setEditingId(null);
              setFormSuccess('Subject updated.');
            } else {
              addSubject({
                name: name.trim(),
                code: code.trim().toUpperCase(),
                color,
                lecturer: lecturer.trim() || undefined,
                notes: notes.trim() || undefined,
              });
              setFormSuccess('Subject added.');
            }
            setShowErrors(false);
            setName('');
            setCode('');
            setLecturer('');
            setNotes('');
            setShowOptionalDetails(false);
          }}
          noValidate
        >
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold leading-tight text-gray-900 dark:text-gray-100">
                  {editingId ? 'Edit subject' : 'New subject'}
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {editingId
                    ? 'Update this course — linked assignments follow automatically.'
                    : 'Appears on cards, chips, and the weekly planner.'}
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => resetSubjectForm()}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label="Cancel editing"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-7">
                <Input
                  id="subject-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Subject name"
                  className="w-full"
                  hasError={Boolean(nameError)}
                  aria-label="Subject name"
                />
                <FormAssist id="subject-name-error" message={nameError} tone="error" />
              </div>
              <div className="sm:col-span-5">
                <Input
                  id="subject-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Code (e.g. CS301)"
                  className="w-full font-mono text-sm tracking-wide"
                  hasError={Boolean(codeError || duplicateCodeError)}
                  aria-label="Subject code"
                />
                <FormAssist id="subject-code-error" message={codeError} tone="error" />
                <FormAssist id="subject-code-dup" message={duplicateCodeError} tone="error" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Colour</span>
                <div className="flex gap-1.5" role="group" aria-label="Subject accent colour">
                  {COLOR_OPTIONS.map((opt) => {
                    const selected = color === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setColor(opt.value)}
                        aria-pressed={selected}
                        title={opt.label}
                        style={{ backgroundColor: opt.hex }}
                        className={cn(
                          'relative flex size-7 items-center justify-center rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
                          selected
                            ? 'scale-110 ring-2 ring-offset-2 ring-white/80 shadow-md dark:ring-offset-gray-900 dark:ring-white/60'
                            : 'opacity-50 shadow-sm hover:opacity-90 hover:scale-105',
                        )}
                      >
                        {selected && <Check size={12} className="text-white drop-shadow-sm" strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowOptionalDetails((prev) => !prev)}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                aria-expanded={showOptionalDetails}
              >
                {showOptionalDetails ? 'Hide details' : 'More details'}
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-200', showOptionalDetails && 'rotate-180')}
                />
              </button>
            </div>

            <div
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
                showOptionalDetails ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <Input
                    id="subject-lecturer"
                    value={lecturer}
                    onChange={(event) => setLecturer(event.target.value)}
                    placeholder="Lecturer (optional)"
                    className="w-full"
                    aria-label="Lecturer"
                  />
                  <Input
                    id="subject-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full"
                    aria-label="Notes"
                  />
                </div>
              </div>
            </div>

            {formSuccess && <FormAssist message={formSuccess} tone="success" />}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-800/60 sm:px-5">
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={() => resetSubjectForm()}>
                Discard
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              className="min-w-[6.5rem]"
            >
              {editingId ? 'Save changes' : 'Add subject'}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-1.5">
        {ANNOTATION_CAPTURE_MODE && (
          <div className="flex justify-center">
            <CaptureCallout n={2} tone="amber" variant="inline" />
          </div>
        )}
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 rounded-2xl', annotate('amber'))}>
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className={cn(
              'bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group dark:bg-gray-900 dark:border-gray-800',
              index === 0 && annotate('indigo')
            )}
          >
            <div className="flex items-start justify-between mb-4 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0',
                    getSubjectTheme(subject).dot,
                  )}
                >
                  <BookOpen size={20} />
                </div>
                {index === 0 && ANNOTATION_CAPTURE_MODE && (
                  <CaptureCallout n={3} tone="green" variant="inline" />
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {index === 0 && ANNOTATION_CAPTURE_MODE && (
                  <CaptureCallout n={5} tone="blue" variant="inline" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(subject.id);
                    setName(subject.name);
                    setCode(subject.code);
                    setColor(subject.color);
                    setLecturer(subject.lecturer ?? '');
                    setNotes(subject.notes ?? '');
                    setShowOptionalDetails(Boolean(subject.lecturer || subject.notes));
                    setShowErrors(false);
                  }}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400 sm:opacity-0 sm:group-hover:opacity-100',
                    ANNOTATION_CAPTURE_MODE && index === 0 && 'opacity-100',
                  )}
                  aria-label={`Edit ${subject.name}`}
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectPendingDelete(subject)}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 active:bg-red-100 dark:hover:bg-red-950/40 dark:hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100',
                    ANNOTATION_CAPTURE_MODE && index === 0 && 'opacity-100',
                  )}
                  aria-label={`Delete ${subject.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{subject.name}</h3>
            <p className="text-sm font-medium text-gray-500 mb-4 dark:text-gray-400">{subject.code}</p>
            
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400 min-w-0">
                Lecturer: <span className="font-medium text-gray-900 dark:text-white">{subject.lecturer || 'TBA'}</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {index === 0 && ANNOTATION_CAPTURE_MODE && (
                  <CaptureCallout n={4} tone="rose" variant="inline" />
                )}
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium text-xs dark:bg-gray-800 dark:text-gray-300">
                  {assignmentCountBySubject[subject.id] ?? 0} Active
                </span>
              </div>
            </div>

            {subject.notes && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{subject.notes}</p>
            )}
          </div>
        ))}
      </div>
      </div>

      <ConfirmationDialog
        isOpen={Boolean(subjectPendingDelete)}
        title="Delete subject?"
        description={subjectDeleteDescription}
        confirmLabel="Delete subject"
        cancelLabel="Cancel"
        onCancel={() => setSubjectPendingDelete(null)}
        onConfirm={() => {
          if (!subjectPendingDelete) return;
          const { name, id } = subjectPendingDelete;
          deleteSubject(id);
          setSubjectPendingDelete(null);
          showToast({
            message: `Subject deleted: “${name}”`,
            tone: "destructive",
            durationMs: 5200,
          });
        }}
      />
    </div>
  );
}
