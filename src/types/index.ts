/**
 * StudySprint domain model
 * -----------------------------------------------------------------------------
 * Single source of truth for the data shapes that flow through the planner.
 * Every page, context, and component imports from here, so keep these
 * deliberately narrow — adding a field rolls out everywhere.
 *
 * Persistence note: the planner store serialises this graph to localStorage
 * under a single key (see PlannerContext). All fields must be JSON-safe;
 * dates are stored as ISO strings rather than `Date` instances for that
 * reason.
 */

/** Visual + sort weight for an assignment. Ordered low → urgent. */
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

/**
 * Lifecycle state of an assignment. `Overdue` is computed from `dueDate`
 * + completion state at refresh time, not directly settable by the user.
 */
export type Status = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';

/**
 * A unit / module / class the student is studying. Used as the categorisation
 * axis for assignments, calendar colour-coding, and the Subjects page.
 *
 * `color` holds a Tailwind background utility (e.g. "bg-blue-500") so the
 * planner can render subject pills without a colour-translation layer.
 */
export interface Subject {
  id: string;
  name: string;
  /** Short course code shown in pills, e.g. "CS301". */
  code: string;
  /** Tailwind utility class used as the subject's accent colour. */
  color: string;
  lecturer?: string;
  notes?: string;
}

/** Atomic checkable item inside an assignment. */
export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

/**
 * The central object the app revolves around. Owned by `PlannerContext`,
 * mutated through helper actions, and rendered by Dashboard, Assignments,
 * Calendar, and the AI Planner conversion flow.
 */
export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  /** ISO 8601 string; never a `Date` instance so persistence stays simple. */
  dueDate: string;
  priority: Priority;
  /** Derived from subtask completion + due-date drift; see `refreshStatuses`. */
  status: Status;
  /** 0–100; mirrors the proportion of completed subtasks. */
  progress: number;
  subtasks: Subtask[];
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/* Mock Data — seed used on first run / when localStorage is empty.           */
/* -------------------------------------------------------------------------- */
export const MOCK_SUBJECTS: Subject[] = [
  { id: '1', name: 'Software Engineering', code: 'CS301', color: 'bg-blue-500', lecturer: 'Dr. Smith' },
  { id: '2', name: 'Data Structures', code: 'CS201', color: 'bg-amber-500', lecturer: 'Prof. Johnson' },
  { id: '3', name: 'Web Development', code: 'CS305', color: 'bg-teal-500', lecturer: 'Dr. Lee' },
  { id: '4', name: 'English Composition', code: 'ENG202', color: 'bg-cyan-500' },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Project Proposal',
    subjectId: '1',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    priority: 'Urgent',
    status: 'In Progress',
    progress: 50,
    subtasks: [
      { id: 's1', title: 'Write introduction', isCompleted: true },
      { id: 's2', title: 'Define scope', isCompleted: false },
    ],
  },
  {
    id: '2',
    title: 'Binary Tree Implementation',
    subjectId: '2',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    priority: 'High',
    status: 'Overdue',
    progress: 20,
    subtasks: [
      { id: 's3', title: 'Implement insert', isCompleted: true },
      { id: 's4', title: 'Implement delete', isCompleted: false },
      { id: 's5', title: 'Write tests', isCompleted: false },
    ],
  },
  {
    id: '3',
    title: 'React Dashboard UI',
    subjectId: '3',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    priority: 'Medium',
    status: 'Not Started',
    progress: 0,
    subtasks: [
      { id: 's6', title: 'Setup project', isCompleted: false },
      { id: 's7', title: 'Build components', isCompleted: false },
    ],
  },
  {
    id: '4',
    title: 'SQL Queries Assignment',
    subjectId: '4',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    priority: 'Low',
    status: 'Completed',
    progress: 100,
    subtasks: [
      { id: 's8', title: 'Write SELECT queries', isCompleted: true },
      { id: 's9', title: 'Write JOIN queries', isCompleted: true },
    ],
  }
];
