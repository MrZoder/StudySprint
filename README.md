# StudySprint
https://thestudysprint.netlify.app/
> A modern, calm, and focused study planner that helps university students beat deadlines, break assignments down into achievable tasks, and stay organised across every subject — in one clean interface.

<p align="center">
  <img src="screenshots/dashboard-light.png" alt="StudySprint Dashboard" width="900" />
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-the-solution">Solution</a> •
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## The Problem

University students juggle multiple subjects, overlapping due dates, group projects, readings, and part-time commitments — usually across a messy combination of spreadsheets, sticky notes, LMS portals, and generic to-do apps. The result:

- Deadlines get missed or noticed too late.
- Large assignments feel overwhelming because they aren't broken down.
- Students can't see their weekly workload at a glance.
- Generic productivity tools (Notion, Trello, Todoist) aren't designed for the academic cycle — subjects, priorities, and assignment progress are first-class concerns, not afterthoughts.

This creates real costs: last-minute work, lower grades, unnecessary stress, and a steady drag on student wellbeing.

## The Solution

**StudySprint** is a purpose-built *student productivity planner* that combines the best ideas from:

- **To-do lists** (capture quickly)
- **Calendar planners** (see workload by time)
- **Kanban boards** (track status)
- **Smart, priority-based reminders** (focus attention where it matters)

into a single, calm, university-appropriate experience. It's designed around one clear promise:

> *Open StudySprint and within 10 seconds you know exactly what's due, what's overdue, and what to work on next.*

The product is scoped as a realistic MVP — small enough to be maintained by a 3-person student team, polished enough to present as a credible software engineering prototype, and architected to grow into a full product with authentication and cloud sync.

---

## Features

### AI Brief Breakdown — the planning assistant
- A dedicated "brief-to-plan" workspace at `/ai-planner`.
- Paste or drop in an assignment brief and StudySprint returns:
  - a plain-language **summary** of what the task is really asking,
  - a **requirements checklist** (deliverables, word counts, references, rubric, submission format),
  - a **staged action plan** (understand the brief → map the rubric → research → draft → refine → rubric self-check → submit),
  - a **suggested timeline** across Discover → Research → Draft → Refine → Polish phases between now and the due date,
  - **high-mark focus tips** tailored to the deliverable type.
- The generated plan is fully editable — stages can be toggled, subtasks tweaked — and can be **converted into a real StudySprint assignment with subtasks** in one click.
- The assist runs fully on-device (no network calls, no data leaves the browser) and is scoped as a *planning* aid only — an explicit ethical safeguard clarifies that thinking, writing, and academic decisions stay with the student.

### Dashboard
- Hero summary with live counts of due-soon, overdue, and completed work.
- Stat cards, "Needs Attention", "Due Soon", "Weekly Progress", and "Up Next" panels.
- Overdue items are visually separated from active work to reduce stress, not amplify it.

### Subject Management
- Full create / edit / delete for subjects.
- Each subject carries a name, code, colour tag, lecturer, and notes.
- Subject colour identity carries through to assignment badges and the calendar.

### Assignment Tracking
- Create assignments linked to subjects, with title, due date, priority, progress, status, and notes.
- Tabs (All / Active / Completed), search, filters (status, priority), and due-date sorting.
- Priority levels are visually distinct: **Low**, **Medium**, **High**, **Urgent**.

### Task Breakdown & Progress
- Break any assignment into subtasks and tick them off.
- Assignment progress is calculated automatically from completed subtasks.
- Status derives automatically: *Not Started → In Progress → Completed → Overdue*.

### Calendar / Weekly Planner
- Weekly planner with previous / next / "today" navigation.
- Assignments appear on their due date as clickable chips in the subject's colour.
- Designed to help students see workload across the week at a glance.

### Smart Reminders (UI-level)
- In-app reminder banners for due-soon and overdue work.
- Supportive, calm tone — no gamified noise or anxiety-inducing red walls.

### Light & Dark Mode
- Fully themed light and premium navy/indigo dark mode.
- Preference persists across sessions.

### Responsive, Mobile-first
- Desktop sidebar, mobile bottom nav, and slide-in sidebar.
- Stacked cards, thumb-friendly actions, and clean hierarchy on small screens.

### Local Persistence
- All data persists to `localStorage` so nothing is lost between visits — no backend required to try it.
- A "Reset demo data" action is available in Settings.

---

## Screenshots

### Dashboard — Light & Dark

<p align="center">
  <img src="screenshots/dashboard-light.png" alt="Dashboard (light)" width="48%" />
  <img src="screenshots/dashboard-dark.png" alt="Dashboard (dark)" width="48%" />
</p>

### Assignments — Light & Dark

<p align="center">
  <img src="screenshots/assignments-light.png" alt="Assignments (light)" width="48%" />
  <img src="screenshots/assignments-dark.png" alt="Assignments (dark)" width="48%" />
</p>

### Subjects — Light & Dark

<p align="center">
  <img src="screenshots/subjects-light.png" alt="Subjects (light)" width="48%" />
  <img src="screenshots/subjects-dark.png" alt="Subjects (dark)" width="48%" />
</p>

### Weekly Planner

<p align="center">
  <img src="screenshots/calendar.png" alt="Weekly planner" width="900" />
</p>

---

## Tech Stack

| Area | Choice |
| --- | --- |
| Framework | **React 19** + **TypeScript** |
| Build tool | **Vite 7** |
| Styling | **Tailwind CSS 4** |
| Routing | **React Router 7** |
| Icons | **lucide-react** |
| Dates | **date-fns** |
| State | React Context (`PlannerContext`, `ThemeContext`, `ToastContext`) |
| Persistence | `localStorage` (Supabase-ready architecture) |
| AI Planner | Local heuristic engine (`src/lib/briefAnalyzer.ts`) — runs fully on-device |
| Lint / Format | ESLint 9 + typescript-eslint |

The codebase is intentionally lean: no Redux, no server framework, no premature abstraction — just a clean component-based architecture a small team can maintain.

---

## Project Structure

```
src/
├── App.tsx              # Router + providers
├── main.tsx             # Entry point
├── index.css            # Tailwind + theme tokens
├── layouts/             # DashboardLayout (sidebar, topbar, bottom nav)
├── pages/               # Landing, Dashboard, Subjects, Assignments,
│                        # AssignmentDetail, Calendar, Settings, AIPlanner
├── components/          # Reusable UI (cards, badges, modals, forms…)
├── context/             # PlannerContext, ThemeContext, ToastContext
├── lib/                 # Date / progress / priority helpers + briefAnalyzer
└── types/               # Shared TypeScript types
```

---

## Getting Started

### Prerequisites
- **Node.js 20+** and **npm**

### Install & Run

```bash
git clone https://github.com/MrZoder/StudySprint.git
cd StudySprint
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Stakeholder Value

StudySprint is designed with three stakeholder groups in mind:

- **Students** — deadline clarity, reduced overwhelm, simpler academic planning, better task visibility.
- **Universities** — stronger student organisation, improved time management, better academic engagement.
- **Learning Support Teams** — a lightweight tool to help at-risk students stay on track with planning and deadlines.

The product positioning is deliberately *not* a generic to-do list — it is a **smart, priority-based academic planner** with just enough calendar and dashboard workflow to feel complete.

---

## Roadmap

Current build is a polished **frontend MVP** with an on-device AI planning assist. Planned next steps:

- **Backend & Auth** — Supabase integration for user accounts and multi-device sync.
- **Optional LLM upgrade for the AI Planner** — swap the local heuristic engine for a hosted model (with a user-supplied API key) for richer briefs / PDFs.
- **PDF / DOCX ingestion** — parse uploaded assignment PDFs directly instead of requiring plain-text paste.
- **Real reminder engine** — scheduled email / push notifications, not just in-app banners.
- **Richer subtask editing** — edit text, delete, and reorder.
- **Confirmation & undo UX** — safer destructive actions with toast-based undo.
- **Richer validation** — inline validation, date rule warnings, duplicate detection.
- **Deeper planner** — monthly calendar mode, drag-to-reschedule, workload heatmap.
- **Global search** — wire the topbar search to global filtering/navigation.
- **Automated tests** — unit / integration / end-to-end coverage.

See [`ProjectStatusSummary.md`](./ProjectStatusSummary.md) for a detailed status write-up and [`Project.md`](./Project.md) for the original product brief.

---

## License

This project is released for educational and portfolio purposes. All rights reserved by the authors unless stated otherwise.

---

<p align="center">
  <strong>StudySprint</strong> — less overwhelm, more momentum.
</p>
