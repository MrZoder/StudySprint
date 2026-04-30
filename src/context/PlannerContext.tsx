/**
 * PlannerProvider — owns the entire study graph (subjects + assignments).
 * -----------------------------------------------------------------------------
 * Acts as a tiny in-memory store with localStorage persistence. Every mutation
 * funnels through the helper actions on the context value so derived fields
 * (`progress`, `status`) stay in sync via `withDerivedValues`.
 *
 * Architecture choices:
 *   - Store + provider are kept in separate modules so consumer hooks can
 *     `import` the context type without dragging the provider tree in.
 *   - State is held as two arrays (subjects, assignments). For this app's
 *     volume (tens of items per user), this is simpler and faster than a
 *     normalised store.
 *   - Persistence is "save everything on every change" — cheap because the
 *     payload is small and JSON.stringify is fast.
 *   - `crypto.randomUUID()` is used for ids so we don't need a counter or
 *     dependency on uuid.
 */
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_ASSIGNMENTS, MOCK_SUBJECTS, type Assignment, type Subject } from "../types";
import { calculateProgress, deriveStatus } from "../lib/planner";
import { PlannerContext, type PlannerContextValue } from "./plannerStoreContext";

/**
 * Bumping the version suffix invalidates older localStorage shapes. The
 * loader silently falls back to defaults if it can't parse what it finds.
 */
const STORAGE_KEY = "studysprint-data-v1";

/**
 * Re-derives `progress` (% of subtasks complete) and `status` (Not Started /
 * In Progress / Completed / Overdue) for every assignment. Called after any
 * mutation that could affect those fields so consumers never see stale
 * derived state.
 */
function withDerivedValues(assignments: Assignment[]): Assignment[] {
  return assignments.map((assignment) => {
    const progress = calculateProgress(assignment.subtasks);
    return {
      ...assignment,
      progress,
      status: deriveStatus({ ...assignment, progress }),
    };
  });
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  // Hydrate from localStorage on first render. The `useMemo([])` is a
  // deliberate one-shot — we don't want to re-read storage on re-renders.
  const [initialSubjects, initialAssignments] = useMemo(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [MOCK_SUBJECTS, withDerivedValues(MOCK_ASSIGNMENTS)] as const;

    try {
      const parsed = JSON.parse(raw) as { subjects: Subject[]; assignments: Assignment[] };
      const restoredSubjects = Array.isArray(parsed.subjects) ? parsed.subjects : MOCK_SUBJECTS;
      const restoredAssignments = Array.isArray(parsed.assignments)
        ? withDerivedValues(parsed.assignments)
        : withDerivedValues(MOCK_ASSIGNMENTS);
      return [restoredSubjects, restoredAssignments] as const;
    } catch {
      // Corrupted JSON shouldn't brick the app — fall back to seed data.
      return [MOCK_SUBJECTS, withDerivedValues(MOCK_ASSIGNMENTS)] as const;
    }
  }, []);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  // Persist on every mutation. The payload is tiny so we don't bother
  // debouncing — a single localStorage write per state change is plenty.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ subjects, assignments }));
  }, [subjects, assignments]);

  const value = useMemo<PlannerContextValue>(
    () => ({
      subjects,
      assignments,
      addSubject: (subject) => {
        setSubjects((prev) => [...prev, { ...subject, id: crypto.randomUUID() }]);
      },
      updateSubject: (id, subject) => {
        setSubjects((prev) => prev.map((item) => (item.id === id ? { ...item, ...subject, id } : item)));
      },
      deleteSubject: (id) => {
        setSubjects((prev) => prev.filter((subject) => subject.id !== id));
        setAssignments((prev) => prev.filter((assignment) => assignment.subjectId !== id));
      },
      addAssignment: (assignment) => {
        const id = crypto.randomUUID();
        // Either the caller seeds subtasks (e.g. AI Planner conversion) or
        // we drop in two generic ones so the assignment isn't an empty shell.
        const seedSubtaskTitles =
          assignment.subtasks && assignment.subtasks.length > 0
            ? assignment.subtasks
            : ["Plan your approach", "Start first draft"];
        const { subtasks: _ignoredSeed, ...rest } = assignment;
        void _ignoredSeed;
        const newAssignment: Assignment = {
          id,
          ...rest,
          progress: 0,
          status: "Not Started",
          subtasks: seedSubtaskTitles.map((title) => ({
            id: crypto.randomUUID(),
            title,
            isCompleted: false,
          })),
        };
        // Prepend so newest assignments surface at the top of unsorted lists.
        setAssignments((prev) => withDerivedValues([newAssignment, ...prev]));
        return id;
      },
      deleteAssignment: (id) => {
        setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
      },
      restoreAssignment: (assignment) => {
        setAssignments((prev) => {
          if (prev.some((a) => a.id === assignment.id)) return prev;
          return withDerivedValues([assignment, ...prev]);
        });
      },
      updateAssignment: (id, assignment) => {
        setAssignments((prev) =>
          withDerivedValues(
            prev.map((item) => (item.id === id ? { ...item, ...assignment, id: item.id } : item)),
          ),
        );
      },
      getAssignmentById: (id) => assignments.find((assignment) => assignment.id === id),
      toggleSubtask: (assignmentId, subtaskId) => {
        setAssignments((prev) =>
          withDerivedValues(
            prev.map((assignment) => {
              if (assignment.id !== assignmentId) return assignment;
              return {
                ...assignment,
                subtasks: assignment.subtasks.map((subtask) =>
                  subtask.id === subtaskId
                    ? { ...subtask, isCompleted: !subtask.isCompleted }
                    : subtask,
                ),
              };
            }),
          ),
        );
      },
      toggleAssignmentComplete: (assignmentId) => {
        // One-shot toggle for the whole assignment:
        //   - empty subtasks → seed a sentinel so progress can hit 100 %
        //   - any incomplete → mark all complete
        //   - all complete   → flip everything back to incomplete
        setAssignments((prev) =>
          withDerivedValues(
            prev.map((assignment) => {
              if (assignment.id !== assignmentId) return assignment;

              if (assignment.subtasks.length === 0) {
                return {
                  ...assignment,
                  subtasks: [
                    {
                      id: crypto.randomUUID(),
                      title: "Mark as done",
                      isCompleted: true,
                    },
                  ],
                };
              }

              const isFullyComplete = assignment.subtasks.every((s) => s.isCompleted);
              const nextCompleted = !isFullyComplete;
              return {
                ...assignment,
                subtasks: assignment.subtasks.map((subtask) => ({
                  ...subtask,
                  isCompleted: nextCompleted,
                })),
              };
            }),
          ),
        );
      },
      addSubtask: (assignmentId, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        setAssignments((prev) =>
          withDerivedValues(
            prev.map((assignment) => {
              if (assignment.id !== assignmentId) return assignment;
              return {
                ...assignment,
                subtasks: [
                  ...assignment.subtasks,
                  { id: crypto.randomUUID(), title: trimmed, isCompleted: false },
                ],
              };
            }),
          ),
        );
      },
      updateSubtask: (assignmentId, subtaskId, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        setAssignments((prev) =>
          withDerivedValues(
            prev.map((assignment) => {
              if (assignment.id !== assignmentId) return assignment;
              return {
                ...assignment,
                subtasks: assignment.subtasks.map((subtask) =>
                  subtask.id === subtaskId ? { ...subtask, title: trimmed } : subtask,
                ),
              };
            }),
          ),
        );
      },
      deleteSubtask: (assignmentId, subtaskId) => {
        setAssignments((prev) =>
          withDerivedValues(
            prev.map((assignment) => {
              if (assignment.id !== assignmentId) return assignment;
              return {
                ...assignment,
                subtasks: assignment.subtasks.filter((subtask) => subtask.id !== subtaskId),
              };
            }),
          ),
        );
      },
      moveSubtask: (assignmentId, subtaskId, direction) => {
        // Manual reordering by swapping with the neighbour. Refuses no-ops at
        // the array boundaries so the UI doesn't have to special-case them.
        setAssignments((prev) =>
          withDerivedValues(
            prev.map((assignment) => {
              if (assignment.id !== assignmentId) return assignment;
              const index = assignment.subtasks.findIndex((s) => s.id === subtaskId);
              if (index < 0) return assignment;
              const nextIndex = direction === "up" ? index - 1 : index + 1;
              if (nextIndex < 0 || nextIndex >= assignment.subtasks.length) return assignment;
              const next = [...assignment.subtasks];
              [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
              return { ...assignment, subtasks: next };
            }),
          ),
        );
      },
      /**
       * Force a re-derivation pass — useful at app start or after the calendar
       * date rolls over so an assignment's `Overdue` flag updates without any
       * subtask change.
       */
      refreshStatuses: () => {
        setAssignments((prev) => withDerivedValues(prev));
      },
    }),
    [subjects, assignments],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}
