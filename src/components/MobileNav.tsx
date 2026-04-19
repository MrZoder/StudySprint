import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, CalendarDays, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";

const mobileItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CheckSquare, label: "Assignments", path: "/assignments" },
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
      <div className="grid grid-cols-4 px-1 pt-1">
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
                    ? "text-blue-600 dark:text-blue-300"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-all",
                    isActive
                      ? "bg-gradient-to-br from-blue-100 to-cyan-100 shadow-sm shadow-blue-500/15 dark:from-blue-950/70 dark:to-cyan-950/50"
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
