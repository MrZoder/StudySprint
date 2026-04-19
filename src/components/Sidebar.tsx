import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CalendarDays,
  Settings,
  BookMarked,
  X,
  Plus,
  Flame,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ANNOTATION_CAPTURE_MODE, annotate } from '../lib/annotationCapture';
import { CaptureCallout } from './CaptureCallout';
import { usePlanner } from '../context/usePlanner';
import { isDueSoon } from '../lib/planner';

type NavItem = {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  /** Optional short descriptor shown under the label on hover/expanded states. */
  hint?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: 'Plan',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', hint: 'Week at a glance' },
      { icon: CalendarDays, label: 'Calendar', path: '/calendar', hint: 'Planner view' },
    ],
  },
  {
    label: 'Work',
    items: [
      { icon: CheckSquare, label: 'Assignments', path: '/assignments', hint: 'Tasks & progress' },
      { icon: BookOpen, label: 'Subjects', path: '/subjects', hint: 'Subject library' },
    ],
  },
  {
    label: 'Account',
    items: [{ icon: Settings, label: 'Settings', path: '/settings', hint: 'Preferences' }],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { pathname } = useLocation();
  const { assignments } = usePlanner();

  const overdueCount = assignments.filter((a) => a.status === 'Overdue').length;
  const dueSoonCount = assignments.filter(
    (a) => a.status !== 'Completed' && isDueSoon(a.dueDate, 4),
  ).length;

  const showNavCaptureBadge =
    ANNOTATION_CAPTURE_MODE && (pathname === '/dashboard' || pathname === '/subjects');

  return (
    <aside
      className={cn(
        'relative flex h-full w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-blue-950/70 dark:bg-[#050b1a]/92 dark:shadow-[12px_0_40px_-28px_rgba(2,6,23,1)]',
        annotate('navInset'),
      )}
    >
      {showNavCaptureBadge && (
        <CaptureCallout
          n={6}
          tone="orange"
          className="bottom-28 left-1/2 z-[36] -translate-x-1/2"
        />
      )}

      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/70 px-4 dark:border-blue-950/65">
        <Link to="/" className="flex items-center gap-2.5 rounded-xl transition-colors hover:opacity-90">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
            <BookMarked size={17} />
            <span className="absolute -right-0.5 -top-0.5 inline-flex size-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#050b1a]" />
          </span>
          <div className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
              StudySprint
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-blue-500/80 uppercase dark:text-blue-300/70">
              Student Planner
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-900/80"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Today status card */}
      <div className="px-3 pt-3">
        <Link
          to="/assignments"
          onClick={onClose}
          className="group block rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50/60 p-3 shadow-sm transition-all hover:-translate-y-px hover:border-blue-300 hover:shadow-md dark:border-blue-900/45 dark:from-blue-950/40 dark:via-[#060e1e] dark:to-cyan-950/25"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
              <Flame size={11} />
              Today
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">
              {dueSoonCount}
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">due soon</span>
          </div>
          {overdueCount > 0 ? (
            <p className="mt-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-300">
              {overdueCount} overdue · open now
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Keep the momentum</p>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group/nav relative flex min-h-10 items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-transparent text-blue-700 shadow-sm dark:from-blue-500/15 dark:to-transparent dark:text-blue-200'
                          : 'text-slate-600 hover:bg-slate-100/85 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          aria-hidden
                          className={cn(
                            'absolute inset-y-1 left-0 w-[3px] rounded-full bg-gradient-to-b from-blue-600 to-cyan-500 transition-all duration-300',
                            isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1',
                          )}
                        />
                        <span
                          className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                            isActive
                              ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-950/70 dark:to-cyan-950/50 dark:text-blue-200'
                              : 'bg-slate-100/70 text-slate-500 group-hover/nav:bg-slate-200/60 group-hover/nav:text-slate-700 dark:bg-slate-900/60 dark:text-slate-400 dark:group-hover/nav:bg-slate-800/80 dark:group-hover/nav:text-slate-200',
                          )}
                        >
                          <item.icon size={15} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col leading-tight">
                          <span className="truncate">{item.label}</span>
                          {item.hint && (
                            <span
                              className={cn(
                                'truncate text-[10.5px] font-normal transition-colors',
                                isActive
                                  ? 'text-blue-600/80 dark:text-blue-300/80'
                                  : 'text-slate-400 dark:text-slate-500',
                              )}
                            >
                              {item.hint}
                            </span>
                          )}
                        </span>
                        {item.path === '/assignments' && overdueCount > 0 && (
                          <span
                            className={cn(
                              'inline-flex min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums shadow-sm',
                              isActive
                                ? 'bg-rose-500 text-white'
                                : 'bg-rose-500 text-white ring-2 ring-white dark:ring-[#050b1a]',
                            )}
                          >
                            {overdueCount}
                          </span>
                        )}
                        {item.path === '/calendar' && dueSoonCount > 0 && (
                          <span
                            className={cn(
                              'inline-flex min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                              isActive
                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                            )}
                          >
                            {dueSoonCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Quick action */}
        <div className="pt-1">
          <Link
            to="/assignments"
            onClick={onClose}
            className="group/add flex items-center justify-between rounded-xl border border-dashed border-slate-300/80 bg-white/50 px-3 py-2.5 text-[13px] font-semibold text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-700 dark:border-slate-700/80 dark:bg-[#060e1e]/40 dark:text-slate-200 dark:hover:border-blue-600 dark:hover:bg-blue-950/35 dark:hover:text-blue-200"
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30 transition-transform group-hover/add:rotate-90">
                <Plus size={13} />
              </span>
              New assignment
            </span>
            <Sparkles size={13} className="text-blue-500 opacity-70" />
          </Link>
        </div>
      </nav>

      {/* User chip */}
      <div className="border-t border-slate-200/70 p-3 dark:border-blue-950/65">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white/70 p-2.5 dark:border-slate-800 dark:bg-[#060e1e]/60">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-[12px] font-bold text-white shadow-sm shadow-blue-500/25">
            ZZ
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">Zain Z.</p>
            <p className="truncate text-[10.5px] text-slate-500 dark:text-slate-400">Planner MVP</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
