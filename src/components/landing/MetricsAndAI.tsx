"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  Brain,
  Cpu,
  HeartPulse,
  Pill,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { Counter, Particles, Reveal, SectionHeading } from "./primitives";

// ============================ SECTION 5 — METRICS ===========================

const METRICS = [
  { to: 10000, suffix: "+", label: "Patients Protected" },
  { to: 500000, suffix: "+", label: "Medicine Administrations" },
  { to: 99.9, suffix: "%", decimals: 1, label: "Compliance Rate" },
  { to: 250, suffix: "+", label: "Healthcare Professionals" },
  { to: 50, suffix: "+", label: "Hospital Wards" },
];

export function MetricsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-indigo-900 py-20 text-white">
      <Particles count={20} />
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-[100px]" />
      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-sky-400/20 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Trusted at scale</h2>
          <p className="mt-3 text-white/70">Real impact, measured across the ward floor.</p>
        </Reveal>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08} className="text-center">
              <p className="text-4xl font-black tracking-tight sm:text-5xl">
                <Counter to={m.to} suffix={m.suffix} decimals={m.decimals ?? 0} />
              </p>
              <p className="mt-2 text-sm font-medium text-white/70">{m.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================ SECTION 6 — AI FEATURES =======================

const AI = [
  { icon: Pill, title: "Drug Interaction Detection", desc: "Flags dangerous combinations the moment a prescription is created.", glow: "shadow-[0_0_40px_-8px_rgba(56,189,248,0.6)]", grad: "from-sky-500 to-blue-600" },
  { icon: ShieldAlert, title: "Allergy Detection", desc: "Cross-checks every order against the patient's recorded allergies.", glow: "shadow-[0_0_40px_-8px_rgba(244,63,94,0.6)]", grad: "from-rose-500 to-red-600" },
  { icon: Brain, title: "Missed-Dose Prediction", desc: "Learns ward rhythms to predict which doses are at risk of slipping.", glow: "shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)]", grad: "from-violet-500 to-purple-600" },
  { icon: TrendingUp, title: "Compliance Intelligence", desc: "Surfaces adherence patterns by ward, nurse and medication.", glow: "shadow-[0_0_40px_-8px_rgba(16,185,129,0.6)]", grad: "from-emerald-500 to-teal-600" },
  { icon: HeartPulse, title: "High-Risk Patient Monitoring", desc: "Continuously scores patients and prioritises the most critical.", glow: "shadow-[0_0_40px_-8px_rgba(251,146,60,0.6)]", grad: "from-amber-500 to-orange-600" },
  { icon: Bell, title: "Predictive Alerts", desc: "Warns staff before a dose becomes overdue — not after.", glow: "shadow-[0_0_40px_-8px_rgba(47,131,255,0.6)]", grad: "from-brand-500 to-indigo-600" },
];

export function AIFeatures() {
  return (
    <section id="ai" className="relative overflow-hidden bg-[#070b18] py-24 text-white">
      <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" />
      <Particles count={18} />

      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeading
          light
          eyebrow="Powered by AI"
          title={
            <>
              Intelligence that <span className="text-brand-400">protects patients</span>
            </>
          }
          subtitle="MediTrack Pro doesn't just record what happened — it predicts what's about to, and steps in first."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AI.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -6 }}
                className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20 ${f.glow}`}
              >
                {/* corner glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-40" />
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.grad} text-white shadow-lg`}>
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300">
                  <Cpu className="h-3.5 w-3.5" /> AI module
                </span>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10 flex items-center justify-center gap-2 text-sm text-white/50">
          <Activity className="h-4 w-4 text-emerald-400" />
          Models run continuously on every ward, every shift.
        </Reveal>
      </div>
    </section>
  );
}
