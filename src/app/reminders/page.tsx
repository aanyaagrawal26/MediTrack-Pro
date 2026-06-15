"use client";

import { useState } from "react";
import { Activity, BedDouble } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, resolveDisplayStatus, type DisplayStatus } from "@/components/StatusBadge";
import { ConfirmDoseModal } from "@/components/ConfirmDoseModal";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { generateDoses, getDosesForDay } from "@/lib/reminders";
import type { EnrichedDose } from "@/lib/types";
import { describeDelay, describeOverdue, formatTime } from "@/lib/utils";

const FILTERS: { key: DisplayStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "GIVEN", label: "Given" },
  { key: "DELAYED", label: "Delayed" },
  { key: "MISSED", label: "Missed" },
];

export default function RemindersPage() {
  return (
    <AppShell>
      <Reminders />
    </AppShell>
  );
}

function Reminders() {
  const { user, isNurse } = useAuth();
  const [filter, setFilter] = useState<DisplayStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<EnrichedDose | null>(null);

  const doses = useStore<EnrichedDose[]>(() => {
    generateDoses();
    let list = getDosesForDay();
    if (isNurse && user?.ward) list = list.filter((d) => d.patient?.ward === user.ward);
    return list;
  });

  const now = new Date();
  const visible = doses.filter((d) => {
    if (filter === "ALL") return true;
    return resolveDisplayStatus(d.status, d.scheduledAt, now) === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Activity className="h-6 w-6 text-brand-600" />
            Today's Reminders
          </h1>
          <p className="text-sm text-slate-500">
            Every scheduled dose for today. Overdue items stay active until verified.
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="card overflow-hidden">
        {visible.length === 0 ? (
          <p className="px-6 py-12 text-center text-slate-400">
            No doses match this filter.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {visible.map((d) => {
              const display = resolveDisplayStatus(d.status, d.scheduledAt, now);
              const actionable = d.status === "PENDING";
              return (
                <li
                  key={d.id}
                  className={`flex flex-wrap items-center gap-4 px-5 py-4 ${
                    display === "OVERDUE" ? "bg-red-50/50" : ""
                  }`}
                >
                  {/* time column */}
                  <div className="w-16 shrink-0 text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {formatTime(d.scheduledAt).replace(/\s?[AP]M/i, "")}
                    </p>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      {formatTime(d.scheduledAt).match(/[AP]M/i)?.[0]}
                    </p>
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {d.medicine?.name}{" "}
                      <span className="font-normal text-slate-500">{d.medicine?.dosage}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-slate-500">
                      <BedDouble className="h-3.5 w-3.5" />
                      {d.patient?.name} · {d.patient?.ward} · Bed {d.patient?.bedNumber}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    {display === "OVERDUE" && (
                      <p className="font-semibold text-red-600">{describeOverdue(d.scheduledAt)}</p>
                    )}
                    {d.givenAt && (
                      <p className="text-slate-500">
                        Given {formatTime(d.givenAt)} · {describeDelay(d.scheduledAt, d.givenAt)}
                      </p>
                    )}
                    {d.nurse && <p className="text-slate-400">by {d.nurse.name}</p>}
                  </div>

                  <StatusBadge status={display} />

                  {actionable ? (
                    <button onClick={() => setSelected(d)} className="btn-success px-3 py-1.5">
                      Verify
                    </button>
                  ) : (
                    <span className="w-[76px]" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDoseModal dose={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
