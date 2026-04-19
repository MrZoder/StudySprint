import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_ASSIGNMENTS, MOCK_SUBJECTS, type Assignment, type Subject } from "../types";
import { calculateProgress, deriveStatus } from "../lib/planner";
import { PlannerContext, type PlannerContextValue } from "./plannerStoreContext";

const STORAGE_KEY = "studysprint-data-v1";

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
      // Ignore corrupted local storage and continue with defaults.
      return [MOCK_SUBJECTS, withDerivedValues(MOCK_ASSIGNMENTS)] as const;
    }
  }, []);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

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
      refreshStatuses: () => {
        setAssignments((prev) => withDerivedValues(prev));
      },
    }),
    [subjects, assignments],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}
