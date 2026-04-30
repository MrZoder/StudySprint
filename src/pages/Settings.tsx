/**
 * Settings — minimal preferences page (/settings).
 * Currently only exposes the two things the local-demo app actually has:
 * theme toggle and a localStorage reset. Reset clears the planner store key
 * and reloads so the next mount re-seeds with MOCK_SUBJECTS / MOCK_ASSIGNMENTS.
 */
import { useTheme } from "../context/useTheme";
import { RotateCcw, Moon, Sun } from "lucide-react";
import Button from "../components/ui/Button";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 pb-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-pretty text-gray-500 dark:text-gray-400">Customize your study experience.</p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Switch between light and dark mode.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={toggleTheme}
          iconLeft={theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          className="mt-4 w-full min-h-11 sm:w-auto"
        >
          Current: {theme === "dark" ? "Dark" : "Light"}
        </Button>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Reset local demo data if you want a clean prototype state.
        </p>
        <Button
          type="button"
          variant="danger"
          iconLeft={<RotateCcw size={18} />}
          className="mt-4 w-full min-h-11 sm:w-auto"
          onClick={() => {
            localStorage.removeItem("studysprint-data-v1");
            window.location.reload();
          }}
        >
          Reset demo data
        </Button>
      </section>
    </div>
  );
}
