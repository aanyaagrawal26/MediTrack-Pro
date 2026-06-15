"use client";

// =============================================================================
// useStore — re-render React components whenever the data store changes.
// -----------------------------------------------------------------------------
// Pass a selector that reads from the store; the hook re-runs it on every
// store change (CRUD, dose confirmation) AND on a timer so time-based views
// (overdue counters, "due now") stay fresh.
// =============================================================================

import { useEffect, useState } from "react";
import { subscribe } from "./store";

export function useStore<T>(selector: () => T, tickMs = 20_000): T {
  const [value, setValue] = useState<T>(() => selector());

  useEffect(() => {
    const recompute = () => setValue(selector());

    // 1. Recompute immediately on mount (handles SSR -> client hydration).
    recompute();

    // 2. Recompute whenever the store emits a change.
    const unsub = subscribe(recompute);

    // 3. Recompute on an interval so time-derived data (overdue, due-now)
    //    refreshes without any data change.
    const timer = setInterval(recompute, tickMs);

    return () => {
      unsub();
      clearInterval(timer);
    };
    // selector is intentionally not a dependency — callers pass an inline fn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickMs]);

  return value;
}
