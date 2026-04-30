/** Hook for reading current theme + toggling it. Must be used inside ThemeProvider. */
import { useContext } from "react";
import { ThemeContext } from "./themeStoreContext";

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
