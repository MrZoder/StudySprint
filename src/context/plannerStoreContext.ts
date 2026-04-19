import { createContext } from "react";
import type { Assignment, Subject } from "../types";

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
  }) => void;
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
