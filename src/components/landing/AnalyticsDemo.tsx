"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Reveal, SectionHeading } from "./primitives";

const adherence = [
  { d: "Mon", on: 88, late: 8 },
  { d: "Tue", on: 91, late: 6 },
  { d: "Wed", on: 86, late: 10 },
  { d: "Thu", on: 94, late: 4 },
  { d: "Fri", on: 92, late: 5 },
  { d: "Sat", on: 96, late: 3 },
  { d: "Sun", on: 99, late: 1 },
];
const wards = [
  { w: "Gen-A", v: 96 },
  { w: "Gen-B", v: 92 },
  { w: "ICU", v: 99 },
  { w: "CCU", v: 97 },
  { w: "Peds", v: 90 },
  { w: "ER", v: 88 },
];
const nurses = [
  { n: "Amelia", v: 142 },
  { n: "Raj", v: 128 },
  { n: "Priya", v: 119 },
  { n: "Sneha", v: 104 },
  { n: "Arjun", v: 96 },
];
const inventory = [
  { m: "W1", s: 80 },
  { m: "W2", s: 72 },
  { m: "W3", s: 64 },
  { m: "W4", s: 78 },
  { m: "W5", s: 58 },
  { m: "W6", s: 88 },
];

const WARD_COLORS = ["#2f83ff", "#6366f1", "#10b981", "#06b6d4", "#f59e0b", "#ef4444"];

const tip = {
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.92)",
  color: "#fff",
  fontSize: 12,
};

export function AnalyticsDemo() {
  return (
    <section id="analytics" className="relative overflow-hidden bg-white py-24 dark:bg-[#070b18]">
      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Premium analytics"
          title="Enterprise-grade clinical insight"
          subtitle="Board-ready dashboards that turn every administration into actionable intelligence."
        />

        <Reveal className="mt-14" y={24}>
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-pop dark:border-white/10 dark:from-white/5 dark:to-transparent sm:p-7">
            {/* KPI strip */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["On-time adherence", "99.2%", "text-emerald-500"],
                ["Avg verify time", "1.4 min", "text-brand-500"],
                ["Doses this week", "1,820", "text-indigo-500"],
                ["Stock alerts", "3", "text-amber-500"],
              ].map(([l, v, c]) => (
                <div key={l} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-medium text-slate-400">{l}</p>
                  <p className={`mt-1 text-2xl font-extrabold ${c}`}>{v}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <ChartCard title="Medication adherence" badge="+4.1% WoW">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={adherence} margin={{ left: -18, right: 6, top: 6 }}>
                    <defs>
                      <linearGradient id="lg-on" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} />
                    <Tooltip contentStyle={tip} />
                    <Area type="monotone" dataKey="on" stroke="#10b981" strokeWidth={2.5} fill="url(#lg-on)" />
                    <Area type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Ward performance" badge="6 wards">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={wards} margin={{ left: -18, right: 6, top: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="w" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} />
                    <Tooltip contentStyle={tip} cursor={{ fill: "rgba(47,131,255,0.08)" }} />
                    <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                      {wards.map((_, i) => (
                        <Cell key={i} fill={WARD_COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Nurse verifications" badge="Top 5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={nurses} layout="vertical" margin={{ left: 8, right: 10, top: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis type="category" dataKey="n" tick={{ fontSize: 11, fill: "#94a3b8" }} width={56} />
                    <Tooltip contentStyle={tip} cursor={{ fill: "rgba(16,185,129,0.08)" }} />
                    <Bar dataKey="v" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Inventory trend" badge="6 weeks">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={inventory} margin={{ left: -18, right: 6, top: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} />
                    <Tooltip contentStyle={tip} />
                    <Line type="monotone" dataKey="s" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ChartCard({ title, badge, children }: { title: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
          <TrendingUp className="h-4 w-4 text-brand-500" />
          {title}
        </h3>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          {badge}
        </span>
      </div>
      {children}
    </div>
  );
}
