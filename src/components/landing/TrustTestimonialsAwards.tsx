"use client";

import { motion } from "framer-motion";
import {
  Award,
  Eye,
  FileLock2,
  Lock,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserCog,
} from "lucide-react";
import { Reveal, SectionHeading } from "./primitives";

// ============================ SECTION 8 — TRUST & SECURITY ===================

const SECURITY = [
  { icon: ShieldCheck, title: "HIPAA Ready", desc: "Architected around healthcare privacy and compliance standards." },
  { icon: FileLock2, title: "Audit Logging", desc: "Every action is written to an immutable, exportable trail." },
  { icon: Lock, title: "End-to-End Security", desc: "Encryption in transit and at rest across the platform." },
  { icon: UserCog, title: "Role-Based Access", desc: "Admins, doctors, head nurses and nurses see only what they should." },
  { icon: Eye, title: "Real-Time Monitoring", desc: "Live oversight of every ward, dose and alert as it happens." },
];

export function TrustSecurity() {
  return (
    <section id="security" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-[#0a0f1e]">
      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Trust & security"
          title="Built to clinical-grade standards"
          subtitle="Patient data deserves more than best effort. MediTrack Pro treats security as a first principle."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.07}>
              <div className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-pop dark:border-white/10 dark:bg-white/5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg">
                  <s.icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}

          {/* trust seal card */}
          <Reveal delay={0.35}>
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-emerald-300/50 bg-gradient-to-br from-emerald-500/10 to-brand-500/10 p-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <Sparkles className="h-7 w-7" />
              </span>
              <p className="mt-3 font-bold text-slate-900 dark:text-white">Security you can audit</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Not a checkbox — a verifiable trail for every clinical action.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================ SECTION 9 — TESTIMONIALS =======================

const TESTIMONIALS = [
  {
    quote:
      "We cut late and missed doses dramatically in the first month. The fact that an alarm cannot be silenced without a verified scan changed our entire safety culture.",
    name: "Dr. Anjali Verma",
    role: "Chief Medical Officer",
    org: "Sunrise Multispecialty Hospital",
    grad: "from-brand-500 to-indigo-600",
  },
  {
    quote:
      "My nurses finally have one clear worklist. The escalation ladder means I know about a problem at 30 minutes — not at the end of the shift.",
    name: "Priya Sharma",
    role: "Head Nurse, General Ward",
    org: "City Care Hospital",
    grad: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "For the first time, our audits take minutes instead of days. Every administration is there — who, what, and exactly when. Boards love it.",
    name: "Rohan Mehta",
    role: "Hospital Administrator",
    org: "Apollo Wing, Metro Health",
    grad: "from-fuchsia-500 to-purple-600",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-[#070b18]">
      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Loved by clinical teams"
          title="Trusted by the people who give the doses"
          subtitle="From the C-suite to the bedside, MediTrack Pro earns its place on the ward."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition hover:shadow-pop dark:border-white/10 dark:bg-white/5">
                <Quote className="h-8 w-8 text-brand-300 dark:text-brand-500/60" />
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                  “{t.quote}”
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-white/10">
                  <span className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${t.grad} text-sm font-bold text-white`}>
                    {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role} · {t.org}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================ SECTION 10 — AWARDS ============================

const AWARDS = [
  { icon: Trophy, title: "Healthcare Innovation Excellence", year: "2025", grad: "from-amber-400 to-orange-500" },
  { icon: ShieldCheck, title: "Patient Safety Award", year: "2025", grad: "from-emerald-400 to-teal-500" },
  { icon: Sparkles, title: "Smart Hospital Recognition", year: "2024", grad: "from-sky-400 to-blue-500" },
  { icon: Award, title: "Clinical Technology Excellence", year: "2024", grad: "from-fuchsia-400 to-purple-500" },
];

export function Awards() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 dark:bg-[#0a0f1e]">
      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Recognition"
          title="Award-winning by design"
          subtitle="Recognised by healthcare and technology bodies for advancing patient safety."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AWARDS.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6, rotate: -1 }}
                className="flex h-full flex-col items-center rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-card transition hover:shadow-pop dark:border-white/10 dark:bg-white/5"
              >
                <motion.span
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${a.grad} text-white shadow-lg`}
                >
                  <a.icon className="h-8 w-8" />
                </motion.span>
                <p className="mt-4 font-bold leading-snug text-slate-900 dark:text-white">{a.title}</p>
                <span className="mt-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  {a.year}
                </span>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
