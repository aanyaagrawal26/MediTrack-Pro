"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Siren, X } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { acknowledgeAlert, getActiveAlerts } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import type { Alert } from "@/lib/types";

/** Full-width pulsing banner shown while any emergency code is active. */
export function EmergencyBanner() {
  const { user } = useAuth();
  const emergencies = useStore<Alert[]>(
    () => getActiveAlerts().filter((a) => a.type === "EMERGENCY"),
    8_000
  );

  return (
    <AnimatePresence>
      {emergencies.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          {emergencies.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 bg-red-600 px-4 py-2.5 text-white"
            >
              <span className="grid h-7 w-7 animate-pulseRing place-items-center rounded-full bg-white/20">
                <Siren className="h-4 w-4" />
              </span>
              <p className="flex-1 text-sm font-semibold">
                <span className="font-extrabold">{a.code}</span> · {a.message}
              </p>
              <button
                onClick={() => acknowledgeAlert(a.id, user?.name)}
                className="flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 text-xs font-bold hover:bg-white/25"
              >
                Acknowledge <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
