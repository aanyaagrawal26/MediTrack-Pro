"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Pill } from "lucide-react";
import { EcgLine, Particles, Reveal } from "./primitives";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-700 to-slate-900 py-28 text-white">
      <Particles count={24} />
      <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-[120px]" />
      <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-sky-400/20 blur-[120px]" />
      <EcgLine className="absolute left-0 right-0 top-8 mx-auto h-10 max-w-3xl px-4 opacity-40" />

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
            <Pill className="h-4 w-4 text-brand-200" /> MediTrack Pro
          </span>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Transform Patient Safety
            <br />
            With MediTrack Pro
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
            The future of medication administration starts here. Close the loop on every dose,
            on every ward, for every patient.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-slate-900 shadow-pop transition hover:bg-brand-50"
            >
              Access Platform
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              <CalendarDays className="h-5 w-5" />
              Schedule Demo
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <p className="mt-8 text-sm text-white/50">
            No credit card · Instant demo access · 5 sample roles included
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const cols: { title: string; links: string[] }[] = [
    { title: "Product", links: ["Dashboard", "Patients", "Scheduling", "Analytics", "Inventory"] },
    { title: "Platform", links: ["AI Engine", "Escalation", "QR Verification", "Audit Trail"] },
    { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
    { title: "Legal", links: ["Privacy", "Security", "HIPAA", "Terms"] },
  ];
  return (
    <footer className="border-t border-white/10 bg-[#070b18] py-14 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white">
                <Pill className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold">
                MediTrack <span className="text-brand-400">Pro</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-white/50">
              AI-powered hospital medication safety & patient monitoring.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-bold text-white">{c.title}</p>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link href="/login" className="text-sm text-white/50 transition hover:text-white">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} MediTrack Pro. A patient-safety demonstration project.</p>
          <p>Built with Next.js · TypeScript · Tailwind · Framer Motion · Recharts</p>
        </div>
      </div>
    </footer>
  );
}
