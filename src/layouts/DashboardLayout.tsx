import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, Menu, Moon, Sun, Plus, Home, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/useTheme';
import MobileNav from '../components/MobileNav';
import GlobalTopbarSearch from '../components/GlobalTopbarSearch';
import { usePlanner } from '../context/usePlanner';

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/assignments': 'Assignments',
  '/calendar': 'Calendar',
  '/subjects': 'Subjects',
  '/settings': 'Settings',
};

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const { assignments } = usePlanner();

  const overdueCount = assignments.filter((a) => a.status === 'Overdue').length;
  const hasNotifications = overdueCount > 0;

  const pageTitle = Object.entries(routeTitleMap).find(([key]) => pathname.startsWith(key))?.[1] ?? 'StudySprint';

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-50 text-gray-900 dark:bg-[#020617]/95 dark:text-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="relative flex min-h-[calc(4rem+env(safe-area-inset-top,0px))] shrink-0 items-center gap-2 border-b border-slate-200/70 bg-white/80 px-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md sm:px-4 lg:px-6 dark:border-blue-950/60 dark:bg-[#020617]/80">
          {/* Soft glow accent */}
          <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent dark:via-blue-500/30" />

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="-ml-1 flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-900/85"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden min-w-0 items-center gap-1.5 md:flex">
              <Link
                to="/dashboard"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-white"
                aria-label="Home"
              >
                <Home size={15} />
              </Link>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
              <span className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">
                {pageTitle}
              </span>
            </div>

            <GlobalTopbarSearch className="min-w-0 flex-1 md:max-w-sm lg:max-w-md" />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <Link
              to="/assignments"
              className="hidden items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/35 md:inline-flex"
            >
              <Plus size={13} />
              New
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex size-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/85"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/85"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {hasNotifications && (
                <span className="absolute right-2.5 top-2.5 flex size-2">
                  <span className="absolute inline-flex size-2 animate-ping rounded-full bg-rose-400 opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full border border-white bg-rose-500 dark:border-[#020617]" />
                </span>
              )}
            </button>
            <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
            <button
              type="button"
              className="group flex min-h-10 items-center gap-2 rounded-full border border-transparent p-1 pr-2.5 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm dark:hover:border-slate-800 dark:hover:bg-[#060e1e]/80"
              aria-label="Account"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-[11px] font-bold text-white shadow-sm shadow-blue-500/25">
                ZZ
              </span>
              <span className="hidden text-[13px] font-semibold text-gray-900 sm:inline dark:text-white">Zain Z.</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overscroll-y-contain p-3 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:p-5 sm:pb-5 lg:p-6 lg:pb-6">
          <div className="mx-auto w-full max-w-[92rem]">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
