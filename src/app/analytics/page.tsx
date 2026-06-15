"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { Reveal } from "@/components/motion";
import { useStore } from "@/lib/useStore";
import { generateDoses, getEnrichedDoses } from "@/lib/reminders";
import { getNurses } from "@/lib/store";
import { WARD_NAMES } from "@/lib/constants";
import { resolveDisplayStatus } from "@/components/StatusBadge";
import { toDateKey } from "@/lib/utils";
import type { EnrichedDose } from "@/lib/types";

const COLORS = {
  given: "#16a34a",
  delayed: "#ea580c",
  missed: "#dc2626",
  pending: "#f59e0b",
};

export default function AnalyticsPage() {
  return (
    <AppShell>
      <Analytics />
    </AppShell>
  );
}

function Analytics() {
  const doses = useStore<EnrichedDose[]>(() => {
    generateDoses();
    return getEnrichedDoses();
  });
  const nurses = useStore(() => getNurses());
  const now = new Date();

  // --- 7-day adherence trend ---
  const days: { date: string; label: string; Given: number; Delayed: number; Missed: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = toDateKey(d);
    const dayDoses = doses.filter((x) => toDateKey(new Date(x.scheduledAt)) === key);
    days.push({
      date: key,
      label: d.toLocaleDateString([], { weekday: "short" }),
      Given: dayDoses.filter((x) => x.status === "GIVEN").length,
      Delayed: dayDoses.filter((x) => x.status === "DELAYED").length,
      Missed: dayDoses.filter((x) => x.status === "MISSED").length,
    });
  }

  // --- Today's status distribution ---
  const today = doses.filter((d) => toDateKey(new Date(d.scheduledAt)) === toDateKey(now));
  const dist = [
    { name: "Given", value: today.filter((d) => d.status === "GIVEN").length, color: COLORS.given },
    { name: "Delayed", value: today.filter((d) => d.status === "DELAYED").length, color: COLORS.delayed },
    { name: "Missed", value: today.filter((d) => d.status === "MISSED").length, color: COLORS.missed },
    {
      name: "Pending",
      value: today.filter((d) => resolveDisplayStatus(d.status, d.scheduledAt, now) === "OVERDUE" || resolveDisplayStatus(d.status, d.scheduledAt, now) === "UPCOMING").length,
      color: COLORS.pending,
    },
  ].filter((d) => d.value > 0);

  // --- Doses per ward (today) ---
  const byWard = WARD_NAMES.map((w) => ({
    ward: w.replace("General Ward ", "GW-"),
    doses: today.filter((d) => d.patient?.ward === w).length,
  })).filter((w) => w.doses > 0);

  // --- Per-nurse verifications (all time) ---
  const byNurse = nurses
    .map((n) => ({
      name: n.name.split(" ")[0],
      verified: doses.filter((d) => d.nurseId === n.id && (d.status === "GIVEN" || d.status === "DELAYED")).length,
    }))
    .filter((n) => n.verified > 0);

  // --- KPI: overall adherence ---
  const actioned = doses.filter((d) => d.status !== "PENDING");
  const givenCount = doses.filter((d) => d.status === "GIVEN").length;
  const adherence = actioned.length ? Math.round((givenCount / actioned.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-brand-600" />
          Analytics & Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Medication adherence and ward activity at a glance.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="On-time adherence" value={`${adherence}%`} tone="text-emerald-600" />
        <Kpi label="Total doses tracked" value={doses.length} tone="text-brand-600" />
        <Kpi label="Delayed (all time)" value={doses.filter((d) => d.status === "DELAYED").length} tone="text-orange-600" />
        <Kpi label="Missed (all time)" value={doses.filter((d) => d.status === "MISSED").length} tone="text-red-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Adherence trend */}
        <Reveal className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <TrendingUp className="h-5 w-5 text-emerald-500" /> 7-day administration trend
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={days} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="gGiven" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.given} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={COLORS.given} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="Given" stroke={COLORS.given} fill="url(#gGiven)" strokeWidth={2} />
              <Area type="monotone" dataKey="Delayed" stroke={COLORS.delayed} fillOpacity={0} strokeWidth={2} />
              <Area type="monotone" dataKey="Missed" stroke={COLORS.missed} fillOpacity={0} strokeWidth={2} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </Reveal>

        {/* Status distribution */}
        <Reveal delay={1} className="card p-5">
          <h2 className="mb-4 font-bold text-slate-800 dark:text-white">Today's dose status</h2>
          {dist.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={dist} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                  {dist.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Reveal>

        {/* Doses per ward */}
        <Reveal delay={2} className="card p-5">
          <h2 className="mb-4 font-bold text-slate-800 dark:text-white">Doses by ward (today)</h2>
          {byWard.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byWard} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis dataKey="ward" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(47,131,255,0.08)" }} />
                <Bar dataKey="doses" fill="#2f83ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Reveal>

        {/* Per-nurse */}
        <Reveal delay={3} className="card p-5">
          <h2 className="mb-4 font-bold text-slate-800 dark:text-white">Verifications per nurse</h2>
          {byNurse.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byNurse} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" width={70} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(16,163,74,0.08)" }} />
                <Bar dataKey="verified" fill="#16a34a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Reveal>
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 13,
  boxShadow: "0 10px 30px rgba(16,24,40,0.18)",
};

function Kpi({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <Reveal className="card p-4">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </Reveal>
  );
}

function Empty() {
  return (
    <div className="grid h-[260px] place-items-center text-sm text-slate-400">
      Not enough data yet — verify a few doses to see this chart.
    </div>
  );
}
