/**
 * Planner store contract.
 * -----------------------------------------------------------------------------
 * Splitting the context object out of `PlannerContext.tsx` keeps the shape of
 * the store importable without pulling in the provider tree (and its
 * localStorage / mock-data dependencies). The `usePlanner` hook reads from
 * here; only `PlannerProvider` writes to it.
 */
import { createContext } from "react";
import type { Assignment, Subject } from "../types";

/**
 * Everything a consumer can read or do with the planner store. Each action
 * keeps `progress` and `status` in sync via `withDerivedValues` inside the
 * provider — callers should never have to compute those themselves.
 */
export interface PlannerContextValue {
  subjects: Subject[];
  assignments: Assignment[];
  addSubject: (subject: Omit<Subject, "id">) => void;
  updateSubject: (id: string, subject: Omit<Subject, "id">) => void;
  deleteSubject: (id: string) => void;
  addAssignment: (assignment: {
    title: string;
    subjectId: string;
    dueDate: string;
    priority: Assignment["priority"];
    notes?: string;
    /** Optional seed subtasks (titles). Falls back to defaults when omitted. */
    subtasks?: string[];
  }) => string;
  updateAssignment: (
    id: string,
    assignment: Partial<Omit<Assignment, "id" | "subtasks" | "progress" | "status">> & {
      title?: string;
      dueDate?: string;
      subjectId?: string;
      priority?: Assignment["priority"];
      notes?: string;
    },
  ) => void;
  getAssignmentById: (id: string) => Assignment | undefined;
  deleteAssignment: (id: string) => void;
  /** Re-insert a previously removed assignment (same id). Used for delete undo. */
  restoreAssignment: (assignment: Assignment) => void;
  toggleSubtask: (assignmentId: string, subtaskId: string) => void;
  /**
   * One-shot completion toggle for an entire assignment.
   * If any subtask is incomplete, all subtasks flip to completed.
   * If everything is already complete, all subtasks flip back to incomplete.
   * Seeds a sentinel subtask when the assignment has none yet.
   */
  toggleAssignmentComplete: (assignmentId: string) => void;
  addSubtask: (assignmentId: string, title: string) => void;
  updateSubtask: (assignmentId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (assignmentId: string, subtaskId: string) => void;
  moveSubtask: (assignmentId: string, subtaskId: string, direction: "up" | "down") => void;
  refreshStatuses: () => void;
}

export const PlannerContext = createContext<PlannerContextValue | null>(null);
