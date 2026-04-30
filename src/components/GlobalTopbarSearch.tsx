/**
 * GlobalTopbarSearch — keyboard-first search for the topbar.
 * -----------------------------------------------------------------------------
 * Searches both assignments (by title + subject name/code) and subjects
 * (by name + code) and renders grouped results in a popover. Up/Down to
 * navigate, Enter to open, Esc to close. Caps each group at MAX_* so the
 * panel never grows past a sensible size.
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BookOpen, CheckSquare, Search } from "lucide-react";
import { usePlanner } from "../context/usePlanner";
import { cn } from "../lib/utils";
import { formatDaysLeft } from "../lib/planner";
import type { Assignment, Subject } from "../types";

const MAX_ASSIGNMENTS = 8;
const MAX_SUBJECTS = 5;

type SearchRow =
  | { kind: "assignment"; assignment: Assignment; subject?: Subject }
  | { kind: "subject"; subject: Subject };

function matchesQuery(q: string, assignment: Assignment, subject: Subject | undefined): boolean {
  if (!q) return false;
  const n = q.toLowerCase();
  if (assignment.title.toLowerCase().includes(n)) return true;
  if (subject?.name.toLowerCase().includes(n)) return true;
  if (subject?.code.toLowerCase().includes(n)) return true;
  return false;
}

function subjectMatchesQuery(q: string, subject: Subject): boolean {
  if (!q) return false;
  const n = q.toLowerCase();
  return subject.name.toLowerCase().includes(n) || subject.code.toLowerCase().includes(n);
}

const statusTone: Record<string, string> = {
  Completed: "text-emerald-700 dark:text-emerald-400",
  Overdue: "text-rose-600 dark:text-rose-400",
  "In Progress": "text-blue-600 dark:text-blue-400",
  "Not Started": "text-gray-500 dark:text-gray-400",
};

interface GlobalTopbarSearchProps {
  className?: string;
}

export default function GlobalTopbarSearch({ className }: GlobalTopbarSearchProps) {
  const { assignments, subjects } = usePlanner();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();

  const rows = useMemo((): SearchRow[] => {
    if (!q) return [];
    const assignmentRows: SearchRow[] = assignments
      .filter((a) => {
        const subj = subjects.find((s) => s.id === a.subjectId);
        return matchesQuery(q, a, subj);
      })
      .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
      .slice(0, MAX_ASSIGNMENTS)
      .map((assignment) => ({
        kind: "assignment" as const,
        assignment,
        subject: subjects.find((s) => s.id === assignment.subjectId),
      }));
    const subjectRows: SearchRow[] = subjects
      .filter((s) => subjectMatchesQuery(q, s))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, MAX_SUBJECTS)
      .map((subject) => ({ kind: "subject" as const, subject }));
    return [...assignmentRows, ...subjectRows];
  }, [assignments, subjects, q]);

  const activeIndex = rows.length > 0 ? Math.min(selectedIndex, rows.length - 1) : 0;

  const resetAfterNavigate = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const goToRow = useCallback(
    (row: SearchRow) => {
      if (row.kind === "assignment") {
        navigate(`/assignments/${row.assignment.id}`);
      } else {
        navigate("/subjects");
      }
      resetAfterNavigate();
      inputRef.current?.blur();
    },
    [navigate, resetAfterNavigate],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter") && query.trim()) {
      setOpen(true);
    }
    if (!open) {
      if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (rows.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const cur = Math.min(prev, rows.length - 1);
        return (cur + 1) % rows.length;
      });
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const cur = Math.min(prev, rows.length - 1);
        return (cur - 1 + rows.length) % rows.length;
      });
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const row = rows[activeIndex];
      if (row) goToRow(row);
    }
  };

  const showPanel = open;
  const showEmptyHint = showPanel && !q;
  const showNoResults = showPanel && q && rows.length === 0;
  const showResults = showPanel && q && rows.length > 0;

  return (
    <div ref={wrapRef} className={cn("relative z-[45]", className)}>
      <div
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-gray-500 dark:bg-[#070f1f] dark:text-slate-300",
          open && "ring-2 ring-blue-400/50 dark:ring-blue-500/40",
        )}
      >
        <Search size={18} className="shrink-0 opacity-70" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search…"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls="global-search-results"
          className="min-w-0 flex-1 border-none bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm dark:text-gray-100 dark:placeholder:text-slate-500"
        />
      </div>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(50dvh,22rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl sm:max-h-[min(70vh,22rem)] dark:border-slate-800 dark:bg-[#040b18]"
        >
          {showEmptyHint && (
            <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
              Start typing to search assignments and subjects.
            </p>
          )}
          {showNoResults && (
            <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
              No matching assignments or subjects found.
            </p>
          )}
          {showResults &&
            rows.map((row, i) => (
              <Fragment key={row.kind === "assignment" ? `a-${row.assignment.id}` : `s-${row.subject.id}`}>
                {(i === 0 || rows[i - 1].kind !== row.kind) && (
                    <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    {row.kind === "assignment" ? "Assignments" : "Subjects"}
                  </div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === activeIndex}
                  id={`global-search-option-${i}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    goToRow(row);
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={cn(
                    "flex min-h-[3rem] w-full items-start gap-2 px-3 py-3 text-left transition-colors sm:min-h-0 sm:py-2.5",
                    i === activeIndex
                      ? "bg-blue-50 dark:bg-blue-950/40"
                      : "hover:bg-gray-50 dark:hover:bg-slate-900/80",
                  )}
                >
                  {row.kind === "assignment" ? (
                    <>
                      <CheckSquare size={16} className="mt-0.5 shrink-0 text-blue-500" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-gray-900 dark:text-gray-100">
                          {row.assignment.title}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-slate-400">
                          {row.subject && (
                            <span className="truncate">
                              {row.subject.code} · {row.subject.name}
                            </span>
                          )}
                          <span className="text-gray-400">·</span>
                          <span>{format(new Date(row.assignment.dueDate), "MMM d, yyyy")}</span>
                          <span className="text-gray-400">·</span>
                          <span className={statusTone[row.assignment.status] ?? "text-gray-500"}>
                            {row.assignment.status}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span>{formatDaysLeft(row.assignment.dueDate)}</span>
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <BookOpen size={16} className="mt-0.5 shrink-0 text-teal-500" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-gray-900 dark:text-gray-100">
                          {row.subject.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500 dark:text-slate-400">
                          {row.subject.code} · Open Subjects page
                        </span>
                      </span>
                    </>
                  )}
                </button>
              </Fragment>
            ))}
        </div>
      )}
    </div>
  );
}
