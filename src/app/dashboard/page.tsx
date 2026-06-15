"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  HeartPulse,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { ConfirmDoseModal } from "@/components/ConfirmDoseModal";
import { DashboardHero } from "@/components/DashboardHero";
import { HoverCard } from "@/components/motion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import {
  generateDoses,
  getActiveReminders,
  getDosesForDay,
  getPatientStatuses,
  getTodayStats,
} from "@/lib/reminders";
import { getPatients } from "@/lib/store";
import type { EnrichedDose } from "@/lib/types";
import { describeOverdue, formatTime } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { user, wardScoped } = useAuth();
  const [selected, setSelected] = useState<EnrichedDose | null>(null);

  // Scope helper — ward staff only see their ward.
  const inScope = (wardName?: string) =>
    !wardScoped || !user?.ward ? true : wardName === user.ward;

  const data = useStore(() => {
    generateDoses();
    const stats = getTodayStats();
    const overdue = getActiveReminders().filter((d) => inScope(d.patient?.ward));
    const today = getDosesForDay().filter((d) => inScope(d.patient?.ward));
    const patientStatuses = getPatientStatuses();
    const patients = getPatients();
    return { stats, overdue, today, patientStatuses, patients };
  });

  // Recompute stats from scoped doses so nurse numbers match what they see.
  const scoped = data.today;
  const now = new Date();
  const overdueCount = data.overdue.length;
  const upcoming = scoped.filter(
    (d) => d.status === "PENDING" && new Date(d.scheduledAt) > now
  );
  const given = scoped.filter((d) => d.status === "GIVEN").length;
  const delayed = scoped.filter((d) => d.status === "DELAYED").length;
  const missed = scoped.filter((d) => d.status === "MISSED").length;

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <DashboardHero
        name={user?.name.split(" ")[0] ?? ""}
        scopeLabel={wardScoped ? (user?.ward ?? "") : "All wards"}
        time={formatTime(now)}
        totalToday={scoped.length}
        overdue={overdueCount}
        adherence={data.stats.adherenceRate}
      />

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Overdue", value: overdueCount, Icon: AlertTriangle, tone: "red" as const, hint: "Need action now" },
          { label: "Upcoming", value: upcoming.length, Icon: Clock, tone: "amber" as const, hint: "Later today" },
          { label: "Given", value: given, Icon: CheckCircle2, tone: "green" as const, hint: "On time" },
          { label: "Delayed", value: delayed, Icon: CalendarClock, tone: "orange" as const, hint: "Late but given" },
          { label: "Missed", value: missed, Icon: XCircle, tone: "slate" as const, hint: "Not administered" },
        ].map((s, i) => (
          <HoverCard key={s.label} delay={i}>
            <StatCard label={s.label} value={s.value} Icon={s.Icon} tone={s.tone} hint={s.hint} />
          </HoverCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overdue / action list */}
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Needs verification now
            </h2>
            <span className="badge bg-red-100 text-red-700">{overdueCount}</span>
          </div>

          {data.overdue.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing overdue"
              subtitle="Every due medicine has been verified. Great work keeping patients safe."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {data.overdue.map((d) => (
                <li key={d.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {d.medicine?.name}{" "}
                      <span className="font-normal text-slate-500">{d.medicine?.dosage}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      {d.patient?.name} · Bed {d.patient?.bedNumber} · scheduled{" "}
                      {formatTime(d.scheduledAt)}
                    </p>
                  </div>
                  <span className="hidden text-sm font-semibold text-red-600 sm:block">
                    {describeOverdue(d.scheduledAt)}
                  </span>
                  <button onClick={() => setSelected(d)} className="btn-success px-3 py-1.5">
                    Verify
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming list */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
              <Clock className="h-5 w-5 text-amber-500" />
              Upcoming today
            </h2>
            <span className="badge bg-amber-100 text-amber-700">{upcoming.length}</span>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState icon={Clock} title="No more doses today" subtitle="The schedule is clear." />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {upcoming.slice(0, 8).map((d) => (
                <li key={d.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {d.medicine?.name} {d.medicine?.dosage}
                    </p>
                    <p className="truncate text-xs text-slate-500">{d.patient?.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">
                    {formatTime(d.scheduledAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Patient-wise status */}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <HeartPulse className="h-5 w-5 text-brand-600" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Patient-wise medicine status (today)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Ward / Bed</th>
                <th className="px-3 py-3 text-center font-semibold">Overdue</th>
                <th className="px-3 py-3 text-center font-semibold">Upcoming</th>
                <th className="px-3 py-3 text-center font-semibold">Given</th>
                <th className="px-3 py-3 text-center font-semibold">Delayed</th>
                <th className="px-3 py-3 text-center font-semibold">Missed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {data.patients
                .filter((p) => inScope(p.ward))
                .map((p) => {
                  const s =
                    data.patientStatuses.find((row) => row.patientId === p.id) ?? {
                      pending: 0,
                      upcoming: 0,
                      given: 0,
                      delayed: 0,
                      missed: 0,
                    };
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">{p.name}</td>
                      <td className="px-5 py-3 text-slate-500">
                        {p.ward} · {p.bedNumber}
                      </td>
                      <Cell value={s.pending} tone="red" />
                      <Cell value={s.upcoming} tone="amber" />
                      <Cell value={s.given} tone="green" />
                      <Cell value={s.delayed} tone="orange" />
                      <Cell value={s.missed} tone="slate" />
                    </tr>
                  );
                })}
              {data.patients.filter((p) => inScope(p.ward)).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No patients to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmDoseModal dose={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Cell({ value, tone }: { value: number; tone: string }) {
  const tones: Record<string, string> = {
    red: "text-red-600",
    amber: "text-amber-600",
    green: "text-green-600",
    orange: "text-orange-600",
    slate: "text-slate-400",
  };
  return (
    <td className="px-3 py-3 text-center">
      <span className={value > 0 ? `font-bold ${tones[tone]}` : "text-slate-300"}>{value}</span>
    </td>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof CheckCircle2;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}
