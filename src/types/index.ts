export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type Status = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  lecturer?: string;
  notes?: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // ISO string
  priority: Priority;
  status: Status;
  progress: number;
  subtasks: Subtask[];
  notes?: string;
}

// Mock Data
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
