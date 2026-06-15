"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

/** Animated light/dark switch shown in the top bar. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="relative flex h-8 w-14 items-center rounded-full border border-slate-200 bg-slate-100 px-1 transition dark:border-slate-700 dark:bg-slate-800"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="grid h-6 w-6 place-items-center rounded-full bg-white text-amber-500 shadow dark:bg-slate-900 dark:text-indigo-300"
        style={{ marginLeft: dark ? "auto" : 0 }}
      >
        {dark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </motion.span>
    </button>
  );
}
