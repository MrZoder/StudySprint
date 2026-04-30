/**
 * MobileNav — bottom tab bar shown only on lg- screens.
 * Five tabs covering the most-trafficked routes; the AI planner gets a
 * violet accent because it's the headline feature. Sits above the
 * safe-area-inset on iOS using `env(safe-area-inset-bottom)`.
 */
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, CalendarDays, BookOpen, Wand2 } from "lucide-react";
import { cn } from "../lib/utils";

const mobileItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: CheckSquare, label: "Tasks", path: "/assignments" },
  { icon: Wand2, label: "AI planner", path: "/ai-planner", accent: true },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  { icon: BookOpen, label: "Subjects", path: "/subjects" },
];

export default function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/70 bg-white/85 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl lg:hidden dark:border-blue-950/65 dark:bg-[#050b1a]/88"
      style={{ boxShadow: "0 -8px 28px rgba(15, 23, 42, 0.08)" }}
      aria-label="Primary"
    >
      <div className="grid grid-cols-5 px-1 pt-1">
        {mobileItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex h-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#050b1a]"
          >
            {({ isActive }) => (
              <span
                className={cn(
                  "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-center text-[10.5px] font-semibold leading-tight transition-all",
                  isActive
                    ? item.accent
                      ? "text-violet-600 dark:text-violet-300"
                      : "text-blue-600 dark:text-blue-300"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-all",
                    isActive
                      ? item.accent
                        ? "bg-gradient-to-br from-violet-100 via-fuchsia-100 to-cyan-100 shadow-sm shadow-violet-500/15 dark:from-violet-950/70 dark:via-fuchsia-950/40 dark:to-cyan-950/50"
                        : "bg-gradient-to-br from-blue-100 to-cyan-100 shadow-sm shadow-blue-500/15 dark:from-blue-950/70 dark:to-cyan-950/50"
                      : item.accent
                        ? "text-violet-500 dark:text-violet-300/70"
                        : "",
                  )}
                >
                  <item.icon size={19} strokeWidth={isActive ? 2.25 : 2} className="shrink-0" />
                </span>
                <span className="max-w-[4.5rem] truncate px-0.5">{item.label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
