"use client";

// =============================================================================
// Theme (dark / light) context. Persists the choice in localStorage and toggles
// the `dark` class on <html>, which Tailwind's `darkMode: "class"` keys off.
// =============================================================================

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "mtp.theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Restore saved theme (or follow OS preference) on first mount.
  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Theme | null;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = saved ?? (prefersDark ? "dark" : "light");
    apply(initial);
    setTheme(initial);
  }, []);

  const apply = (t: Theme) => {
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      apply(next);
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
