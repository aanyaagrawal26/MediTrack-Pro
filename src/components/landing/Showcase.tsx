"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  LayoutDashboard,
  Package,
  Pill,
  QrCode,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Reveal, SectionHeading } from "./primitives";

interface Screen {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  render: () => React.ReactNode;
}

// ---- mini mockup helpers ----------------------------------------------------

const Bar = ({ w, c }: { w: string; c: string }) => (
  <div className={`h-2 rounded-full ${c}`} style={{ width: w }} />
);
const Chip = ({ children, c }: { children: React.ReactNode; c: string }) => (
  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${c}`}>{children}</span>
);
const Tile = ({ label, value, c }: { label: string; value: string; c: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
    <p className="text-[10px] font-medium text-slate-400">{label}</p>
    <p className={`text-lg font-extrabold ${c}`}>{value}</p>
  </div>
);

const SCREENS: Screen[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Command Dashboard",
    desc: "Overdue, upcoming, given, delayed and missed — your whole ward at a glance.",
    render: () => (
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          <Tile label="Overdue" value="04" c="text-red-500" />
          <Tile label="Given" value="287" c="text-emerald-500" />
          <Tile label="Delayed" value="12" c="text-orange-500" />
          <Tile label="Adherence" value="99%" c="text-sky-500" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 flex items-end gap-1.5">
            {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-brand-500 to-sky-400"
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-400">Weekly administration trend</p>
        </div>
      </div>
    ),
  },
  {
    id: "patients",
    icon: Users,
    title: "Patient Management",
    desc: "Rich patient profiles with photos, allergies, blood group, ward and bed.",
    render: () => (
      <div className="space-y-2">
        {[
          ["JM", "John Mathew", "Diabetes · A-12", "from-blue-500 to-indigo-600"],
          ["FS", "Fatima Sheikh", "Post-op · A-07", "from-fuchsia-500 to-purple-600"],
          ["DO", "David Okoro", "Cardiac · ICU-03", "from-emerald-500 to-teal-600"],
        ].map(([ini, name, meta, grad]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-white/5">
            <span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${grad} text-xs font-bold text-white`}>{ini}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white">{name}</p>
              <p className="text-[11px] text-slate-400">{meta}</p>
            </div>
            <Chip c="bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">Allergy</Chip>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "schedule",
    icon: Pill,
    title: "Medicine Scheduling",
    desc: "Multiple medicines, routes and exact reminder times per patient.",
    render: () => (
      <div className="space-y-2">
        {[
          ["Metformin", "500mg · Oral", "08:00 · 20:00", "from-blue-500 to-indigo-600"],
          ["Insulin", "10IU · S.C.", "07:00 · 19:00", "from-rose-500 to-pink-600"],
          ["Ceftriaxone", "1g · IV", "06:00 · 14:00 · 22:00", "from-emerald-500 to-teal-600"],
        ].map(([n, d, t, grad]) => (
          <div key={n} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-white/5">
            <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${grad} text-white`}><Pill className="h-4 w-4" /></span>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white">{n} <span className="font-normal text-slate-400">{d}</span></p>
              <p className="text-[11px] text-slate-400">{t}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "qr",
    icon: QrCode,
    title: "QR Patient Verification",
    desc: "Scannable wristbands + barcode medicine checks enforce the 5 rights.",
    render: () => (
      <div className="flex items-center gap-4">
        <div className="grid grid-cols-5 gap-0.5 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/10">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className={`h-3.5 w-3.5 rounded-[2px] ${[0, 2, 3, 6, 8, 9, 11, 12, 14, 17, 18, 20, 23, 24].includes(i) ? "bg-slate-900 dark:bg-white" : "bg-transparent"}`} />
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <Chip c="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">✓ Patient matched</Chip>
          <p className="text-sm font-bold text-slate-800 dark:text-white">Bed A-12 · O+</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Right drug · Right dose · Right patient
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "inventory",
    icon: Package,
    title: "Inventory Management",
    desc: "Live stock that auto-decrements on administration, with low-stock alerts.",
    render: () => (
      <div className="space-y-2">
        {[
          ["Paracetamol", "480", "82%", "bg-emerald-500"],
          ["Furosemide", "12", "18%", "bg-red-500"],
          ["Omeprazole", "8", "12%", "bg-red-500"],
          ["Azithromycin", "90", "64%", "bg-emerald-500"],
        ].map(([n, q, w, c]) => (
          <div key={n} className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-white/5">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-800 dark:text-white">{n}</span>
              <span className="text-xs text-slate-400">{q} units</span>
            </div>
            <Bar w={w} c={c} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "shifts",
    icon: CalendarClock,
    title: "Nurse Shift Tracking",
    desc: "Morning, evening and night rosters across every ward.",
    render: () => (
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Morning", "07–15", "6", "from-amber-400 to-orange-500"],
          ["Evening", "15–23", "5", "from-violet-400 to-purple-500"],
          ["Night", "23–07", "4", "from-indigo-400 to-blue-600"],
        ].map(([s, w, n, grad]) => (
          <div key={s} className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-white/10 dark:bg-white/5">
            <span className={`mx-auto grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${grad} text-white`}><CalendarClock className="h-4 w-4" /></span>
            <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">{s}</p>
            <p className="text-[10px] text-slate-400">{w}</p>
            <p className="mt-1 text-xs font-bold text-brand-600 dark:text-brand-400">{n} on duty</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Adherence trends, ward performance and per-nurse verification stats.",
    render: () => (
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-end gap-2" style={{ height: 110 }}>
          {[60, 80, 45, 95, 70, 88, 100, 75].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-emerald-400"
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, ease: "easeOut" }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-400">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Avg</span>
        </div>
      </div>
    ),
  },
  {
    id: "emergency",
    icon: AlertTriangle,
    title: "Emergency Alerts",
    desc: "One-tap Code Blue broadcast and automatic escalation to head nurse & doctor.",
    render: () => (
      <div className="space-y-2">
        <motion.div
          className="flex items-center gap-3 rounded-xl bg-red-600 p-3 text-white"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <AlertTriangle className="h-5 w-5" />
          <div className="flex-1">
            <p className="text-sm font-extrabold">Code Blue · ICU-03</p>
            <p className="text-[11px] text-white/80">Broadcast to all staff · 0:08 ago</p>
          </div>
        </motion.div>
        {[
          ["15 min", "Nurse notified", "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"],
          ["30 min", "Head nurse alerted", "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"],
          ["60 min", "Doctor escalation", "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"],
        ].map(([t, l, c]) => (
          <div key={t} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{l}</span>
            <Chip c={c}>{t}</Chip>
          </div>
        ))}
      </div>
    ),
  },
];

export function Showcase() {
  const [active, setActive] = useState(0);
  const screen = SCREENS[active];

  return (
    <section id="product" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-[#0a0f1e]">
      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Live product showcase"
          title="One platform. The entire medication journey."
          subtitle="Eight purpose-built modules, working as a single closed-loop system."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          {/* tab list */}
          <div className="lg:col-span-5">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {SCREENS.map((s, i) => {
                const on = i === active;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(i)}
                    className={`flex shrink-0 items-center gap-3 rounded-2xl border p-3.5 text-left transition lg:w-full ${
                      on
                        ? "border-brand-300 bg-white shadow-card dark:border-brand-500/40 dark:bg-white/10"
                        : "border-transparent bg-white/40 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
                        on ? "bg-gradient-to-br from-brand-500 to-indigo-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</p>
                      <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 lg:block">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* mockup browser frame */}
          <Reveal className="lg:col-span-7" y={20}>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-pop dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-400 dark:bg-white/10">
                  app.meditrack.pro/{screen.id}
                </span>
              </div>
              <div className="min-h-[300px] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <screen.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white">{screen.title}</h3>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={screen.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    {screen.render()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
