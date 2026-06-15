"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck } from "lucide-react";

/**
 * Gradient hero banner with a lightweight inline hospital illustration and a
 * couple of live headline stats — the "SaaS product" first impression.
 */
export function DashboardHero({
  name,
  scopeLabel,
  time,
  totalToday,
  overdue,
  adherence,
}: {
  name: string;
  scopeLabel: string;
  time: string;
  totalToday: number;
  overdue: number;
  adherence: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-6 text-white shadow-pop sm:p-8"
    >
      {/* Decorative blobs */}
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-emerald-300">
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-300" />
            </span>
            {scopeLabel} · {time}
          </div>
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
            Welcome back{name ? `, ${name}` : ""} 👋
          </h1>
          <p className="mt-2 text-sm text-brand-100">
            {overdue > 0
              ? `${overdue} medicine${overdue > 1 ? "s" : ""} need verification right now. Reminders stay active until administration is confirmed.`
              : "All due medicines are verified. Patient safety is on track."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <HeroStat icon={<Activity className="h-4 w-4" />} label="Doses today" value={totalToday} />
            <HeroStat icon={<ShieldCheck className="h-4 w-4" />} label="On-time adherence" value={`${adherence}%`} />
            <HeroStat
              icon={<span className="text-base leading-none">⏰</span>}
              label="Needs action"
              value={overdue}
              danger={overdue > 0}
            />
          </div>
        </div>

        {/* Inline SVG hospital illustration */}
        <HospitalArt />
      </div>
    </motion.div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 backdrop-blur ${
        danger ? "bg-red-500/30 ring-1 ring-red-300/40" : "bg-white/15"
      }`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-white/70">{label}</p>
        <p className="text-lg font-bold leading-none">{value}</p>
      </div>
    </div>
  );
}

/** Simple, friendly hospital scene drawn with SVG (no external assets). */
function HospitalArt() {
  return (
    <motion.svg
      viewBox="0 0 220 150"
      className="hidden h-36 w-56 shrink-0 drop-shadow-lg md:block"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      role="img"
      aria-label="Hospital illustration"
    >
      {/* ground */}
      <rect x="0" y="128" width="220" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
      {/* main building */}
      <rect x="40" y="46" width="140" height="82" rx="6" fill="#ffffff" opacity="0.95" />
      <rect x="40" y="46" width="140" height="18" rx="6" fill="#dbe8ff" />
      {/* cross sign */}
      <rect x="100" y="20" width="20" height="20" rx="4" fill="#ffffff" />
      <rect x="107.5" y="24" width="5" height="12" rx="1" fill="#ef4444" />
      <rect x="104" y="27.5" width="12" height="5" rx="1" fill="#ef4444" />
      {/* door */}
      <rect x="98" y="98" width="24" height="30" rx="3" fill="#2f83ff" />
      {/* windows */}
      {[58, 86, 134, 162].map((x) =>
        [74, 98].map((y) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="16" height="14" rx="2" fill="#bcdcff" />
        ))
      )}
      {/* side wings */}
      <rect x="14" y="80" width="30" height="48" rx="4" fill="#ffffff" opacity="0.85" />
      <rect x="176" y="80" width="30" height="48" rx="4" fill="#ffffff" opacity="0.85" />
      {/* pulse line */}
      <polyline
        points="50,118 64,118 70,108 78,126 86,118 170,118"
        fill="none"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
