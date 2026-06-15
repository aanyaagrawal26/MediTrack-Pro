"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Siren, TriangleAlert, UserCog } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { acknowledgeAlert, getActiveAlerts } from "@/lib/store";
import { runEscalation } from "@/lib/reminders";
import type { Alert } from "@/lib/types";
import { formatTime } from "@/lib/utils";

const LEVEL_STYLE: Record<number, { label: string; cls: string }> = {
  1: { label: "L1 · Nurse", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  2: { label: "L2 · Head Nurse", cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  3: { label: "L3 · Doctor", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
};

/** Top-bar notification center. Also drives the escalation engine on a tick. */
export function AlertsCenter() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const alerts = useStore<Alert[]>(() => {
    runEscalation(); // raise any newly-crossed escalation thresholds
    return getActiveAlerts();
  }, 10_000);

  const count = alerts.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        title="Alerts"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="card absolute right-0 z-40 mt-2 w-[min(92vw,380px)] overflow-hidden shadow-pop"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-white">Alerts & escalations</p>
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {count} active
                </span>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {count === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-400">
                    No active alerts. Escalations appear here automatically when a dose is 15+
                    minutes overdue.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {alerts.map((a) => (
                      <li key={a.id} className="flex gap-3 px-4 py-3">
                        <span
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            a.type === "EMERGENCY"
                              ? "bg-red-600 text-white"
                              : a.level === 3
                                ? "bg-red-100 text-red-600 dark:bg-red-500/15"
                                : a.level === 2
                                  ? "bg-orange-100 text-orange-600 dark:bg-orange-500/15"
                                  : "bg-amber-100 text-amber-600 dark:bg-amber-500/15"
                          }`}
                        >
                          {a.type === "EMERGENCY" ? (
                            <Siren className="h-4 w-4" />
                          ) : a.level === 3 ? (
                            <UserCog className="h-4 w-4" />
                          ) : (
                            <TriangleAlert className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {a.type === "EMERGENCY" ? (
                              <span className="badge bg-red-600 text-white">{a.code}</span>
                            ) : (
                              <span className={`badge ${LEVEL_STYLE[a.level ?? 1].cls}`}>
                                {LEVEL_STYLE[a.level ?? 1].label}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">{formatTime(a.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{a.message}</p>
                        </div>
                        <button
                          onClick={() => acknowledgeAlert(a.id, user?.name)}
                          className="self-center rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
                          title="Acknowledge"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
