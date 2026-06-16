"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Clock,
  FileLock2,
  HeartPulse,
  Pill,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { Counter, Reveal, SectionHeading } from "./primitives";

// ============================ SECTION 2 — THE PROBLEM ========================

const STORY = [
  { icon: Clock, title: "Patient waiting", desc: "A dose is due. The patient depends on it being given on time.", tone: "amber" },
  { icon: AlertTriangle, title: "Reminder ignored", desc: "On paper charts, an alert is dismissed — or simply missed.", tone: "orange" },
  { icon: HeartPulse, title: "Treatment delayed", desc: "Minutes turn to hours. Recovery slows. Risk climbs.", tone: "red" },
];

const STATS = [
  { value: 7, suffix: "M+", label: "Medication errors every year", sub: "One of the most common preventable harms in hospitals." },
  { value: 50, suffix: "%", label: "Are tied to manual workflows", sub: "Paper charts and verbal handoffs invite human error." },
  { value: 40, suffix: "%", label: "Of doses given late or missed", sub: "When there is no closed-loop verification system." },
];

const TONES: Record<string, string> = {
  amber: "from-amber-500/15 text-amber-600 dark:text-amber-300 ring-amber-300/40",
  orange: "from-orange-500/15 text-orange-600 dark:text-orange-300 ring-orange-300/40",
  red: "from-red-500/15 text-red-600 dark:text-red-300 ring-red-300/40",
};

export function ProblemSection() {
  return (
    <section id="problem" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-[#0a0f1e]">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-red-500/10 blur-[100px]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="The healthcare problem"
          title={
            <>
              Every missed dose is a <span className="text-red-500">silent risk</span>
            </>
          }
          subtitle="In busy wards, a dismissed reminder doesn't mean the medicine was given. That gap between intention and proof is where patients get hurt."
        />

        {/* Story flow */}
        <div className="mt-14 grid items-stretch gap-4 md:grid-cols-7">
          {STORY.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="md:col-span-2">
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/5">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b ring-1 ${TONES[s.tone]}`}>
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
              </div>
            </Reveal>
          ))}

          {/* arrow + resolution */}
          <div className="hidden items-center justify-center md:col-span-1 md:flex">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <ArrowRight className="h-8 w-8 text-emerald-500" />
            </motion.div>
          </div>
        </div>

        {/* Resolution banner */}
        <Reveal delay={0.2} className="mt-6">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-300/40 bg-gradient-to-r from-emerald-500/10 to-brand-500/10 p-6 text-center sm:flex-row sm:text-left">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
              <HeartPulse className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">MediTrack Pro catches it — every time</h3>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                The reminder keeps ringing and escalates up the chain until a nurse verifies the dose
                with a barcode scan. No dose is ever closed without proof.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Stats */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-card dark:border-white/10 dark:bg-white/5">
                <p className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 font-semibold text-slate-800 dark:text-slate-200">{s.label}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================ SECTION 3 — HOW IT WORKS =======================

const STEPS = [
  { icon: Stethoscope, title: "Doctor prescribes", desc: "Clinician creates a prescription with dose, route and frequency.", tone: "from-brand-500 to-blue-600" },
  { icon: CalendarClock, title: "Medicine scheduled", desc: "The system generates exact dose events across the patient's stay.", tone: "from-indigo-500 to-violet-600" },
  { icon: Clock, title: "Reminder triggered", desc: "When a dose is due, the ward alarm fires — and never auto-dismisses.", tone: "from-amber-500 to-orange-600" },
  { icon: UserCheck, title: "Nurse verification", desc: "Nurse scans the medicine barcode and confirms — capturing the real time.", tone: "from-emerald-500 to-teal-600" },
  { icon: Pill, title: "Medicine administered", desc: "Status is auto-classified: given, delayed or missed.", tone: "from-cyan-500 to-sky-600" },
  { icon: FileLock2, title: "Permanent audit record", desc: "Who, what, when — written to an immutable, exportable log.", tone: "from-fuchsia-500 to-purple-600" },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-white py-24 dark:bg-[#070b18]">
      <div className="relative mx-auto max-w-5xl px-4">
        <SectionHeading
          eyebrow="How MediTrack works"
          title="A closed safety loop, end to end"
          subtitle="From prescription to permanent record — every step is tracked, verified and impossible to skip."
        />

        <div className="relative mt-16">
          {/* center line */}
          <motion.div
            className="absolute left-6 top-0 w-0.5 origin-top bg-gradient-to-b from-brand-500 via-emerald-500 to-fuchsia-500 md:left-1/2 md:-translate-x-1/2"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            style={{ bottom: 0 }}
          />

          <div className="space-y-8">
            {STEPS.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <div
                  key={s.title}
                  className={`relative flex items-center gap-6 ${left ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* node */}
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                    className={`absolute left-6 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg md:left-1/2 ${s.tone}`}
                  >
                    <s.icon className="h-6 w-6" />
                  </motion.span>

                  {/* card */}
                  <Reveal
                    delay={0.05}
                    y={20}
                    className={`ml-16 flex-1 md:ml-0 md:w-1/2 ${left ? "md:pr-16 md:text-right" : "md:pl-16"}`}
                  >
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-pop dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Step {i + 1}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
                    </div>
                  </Reveal>

                  <div className="hidden md:block md:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
