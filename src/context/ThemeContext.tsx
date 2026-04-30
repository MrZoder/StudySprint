/**
 * ThemeProvider — light/dark mode for the whole app.
 * -----------------------------------------------------------------------------
 * Strategy:
 *   1. Restore the saved preference from localStorage.
 *   2. If none, fall back to the OS-level `prefers-color-scheme` media query
 *      so first-time visitors land on the right theme without a flash.
 *   3. Toggling the `dark` class on <html> drives all Tailwind dark-mode
 *      variants used across the codebase.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./themeStoreContext";

const THEME_KEY = "studysprint-theme-v1";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Pick the initial theme exactly once — saved preference > OS preference.
  const initialTheme = useMemo<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }, []);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // Reflect the current theme on <html> and persist it. Tailwind's `dark:`
  // variants key off this class.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
