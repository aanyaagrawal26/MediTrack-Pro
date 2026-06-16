"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Heart,
  Pill,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Syringe,
} from "lucide-react";
import { EcgLine, Floaty, GradientText, Particles } from "./primitives";

export function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#070b18] pb-24 pt-32 text-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-40 left-1/4 h-[42rem] w-[42rem] rounded-full bg-brand-600/30 blur-[120px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 right-1/4 h-[40rem] w-[40rem] rounded-full bg-indigo-600/30 blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* Network visualization + particles */}
      <NetworkViz />
      <Particles count={26} />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur"
        >
          <Sparkles className="h-4 w-4 text-brand-300" />
          AI-Powered Hospital Medication Safety Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto max-w-4xl text-center text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          MediTrack <GradientText>Pro</GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mx-auto mt-5 max-w-2xl text-center text-lg text-white/70 sm:text-xl"
        >
          AI-Powered Hospital Medication Safety Platform
        </motion.p>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-base font-semibold sm:text-lg"
        >
          <span className="text-brand-300">Ensuring Every Dose.</span>
          <span className="text-sky-300">Protecting Every Patient.</span>
          <span className="text-emerald-300">Empowering Every Nurse.</span>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_30px_rgba(47,131,255,0.4)] transition hover:shadow-[0_10px_40px_rgba(47,131,255,0.55)]"
          >
            Enter Platform
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#product"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/10"
          >
            <PlayCircle className="h-5 w-5" />
            Watch Product Tour
          </a>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold text-white/80 transition hover:text-white"
          >
            Explore Features
          </a>
        </motion.div>

        {/* 3D dashboard preview + floating satellites */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          {/* Floating satellite cards (desktop only) */}
          <Floaty className="absolute -left-24 top-6 z-20 hidden xl:block" amount={16} duration={7}>
            <SatelliteCard tone="emerald" icon={<Pill className="h-4 w-4" />} title="Metformin 500mg" sub="08:00 · Bed A-12" />
          </Floaty>
          <Floaty className="absolute -right-24 top-24 z-20 hidden xl:block" amount={18} duration={8} delay={1}>
            <NurseCard />
          </Floaty>
          <Floaty className="absolute -left-20 bottom-10 z-20 hidden xl:block" amount={14} duration={6.5} delay={0.5}>
            <SatelliteCard tone="sky" icon={<BedDouble className="h-4 w-4" />} title="ICU · 11/12 beds" sub="92% occupancy" />
          </Floaty>
          <Floaty className="absolute -right-16 bottom-2 z-20 hidden xl:block" amount={16} duration={7.5} delay={1.5}>
            <SatelliteCard tone="red" icon={<AlertTriangle className="h-4 w-4" />} title="Code Blue · ICU-03" sub="Escalated to doctor" pulse />
          </Floaty>

          <DashboardPreview />
        </div>
      </div>

      {/* ECG heartbeat strip across the bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-4 text-emerald-300/80">
          <Heart className="h-4 w-4 animate-pulse" />
          <EcgLine className="h-10 flex-1" />
          <span className="hidden text-xs font-semibold tracking-wider sm:block">LIVE · 72 BPM</span>
        </div>
      </div>
    </section>
  );
}

// ---- Floating satellite card ------------------------------------------------

function SatelliteCard({
  tone,
  icon,
  title,
  sub,
  pulse,
}: {
  tone: "emerald" | "sky" | "red";
  icon: React.ReactNode;
  title: string;
  sub: string;
  pulse?: boolean;
}) {
  const tones = {
    emerald: "from-emerald-500/20 text-emerald-300 ring-emerald-400/30",
    sky: "from-sky-500/20 text-sky-300 ring-sky-400/30",
    red: "from-red-500/20 text-red-300 ring-red-400/30",
  };
  return (
    <div className="flex w-56 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-pop backdrop-blur-xl">
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b ring-1 ${tones[tone]} ${pulse ? "animate-pulseRing" : ""}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{title}</p>
        <p className="truncate text-xs text-white/60">{sub}</p>
      </div>
    </div>
  );
}

function NurseCard() {
  return (
    <div className="flex w-60 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-pop backdrop-blur-xl">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white">
        AC
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">Amelia Carter</p>
        <p className="flex items-center gap-1 truncate text-xs text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" /> Verified dose · on time
        </p>
      </div>
      <Syringe className="h-4 w-4 text-white/40" />
    </div>
  );
}

// ---- The 3D dashboard mockup ------------------------------------------------

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 24 }}
      animate={{ opacity: 1, y: 0, rotateX: 12 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1400, transformStyle: "preserve-3d" }}
      className="relative"
    >
      <Floaty amount={10} duration={9}>
        <div
          className="overflow-hidden rounded-3xl border border-white/15 bg-slate-900/70 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          style={{ transform: "rotateY(-6deg)" }}
        >
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-3 flex items-center gap-2 text-xs font-semibold text-white/60">
              <Activity className="h-3.5 w-3.5 text-emerald-400" /> Live Ward Monitoring
            </span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              ● LIVE
            </span>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-3">
            {/* stat tiles */}
            <MiniStat label="Overdue" value="04" tone="text-red-300" />
            <MiniStat label="Given today" value="287" tone="text-emerald-300" />
            <MiniStat label="Adherence" value="99.4%" tone="text-sky-300" />

            {/* chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
              <p className="mb-2 text-xs font-semibold text-white/60">7-day administration trend</p>
              <Sparkline />
            </div>

            {/* compliance ring */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4">
              <ComplianceRing />
              <p className="mt-2 text-xs text-white/60">Compliance</p>
            </div>

            {/* reminder + alert rows */}
            <div className="space-y-2 sm:col-span-3">
              <Row tone="amber" icon={<Pill className="h-4 w-4" />} title="Paracetamol 650mg · Bed A-07" right="Due now" />
              <Row tone="red" icon={<AlertTriangle className="h-4 w-4" />} title="Furosemide 40mg · ICU-03" right="34m overdue · L2" pulse />
              <Row tone="emerald" icon={<ShieldCheck className="h-4 w-4" />} title="Azithromycin 250mg · Bed A-15" right="Verified ✓" />
            </div>
          </div>
        </div>
      </Floaty>
    </motion.div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-medium text-white/50">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function Row({
  tone,
  icon,
  title,
  right,
  pulse,
}: {
  tone: "amber" | "red" | "emerald";
  icon: React.ReactNode;
  title: string;
  right: string;
  pulse?: boolean;
}) {
  const tones = {
    amber: "bg-amber-500/15 text-amber-300",
    red: "bg-red-500/15 text-red-300",
    emerald: "bg-emerald-500/15 text-emerald-300",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone]} ${pulse ? "animate-pulseRing" : ""}`}>
        {icon}
      </span>
      <p className="flex-1 truncate text-sm font-semibold text-white/90">{title}</p>
      <span className={`text-xs font-bold ${tones[tone].split(" ")[1]}`}>{right}</span>
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 320 80" className="h-20 w-full">
      <defs>
        <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,60 C30,52 50,30 80,34 C110,38 130,18 160,22 C190,26 210,44 240,38 C270,32 290,16 320,20"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <path
        d="M0,60 C30,52 50,30 80,34 C110,38 130,18 160,22 C190,26 210,44 240,38 C270,32 290,16 320,20 L320,80 L0,80 Z"
        fill="url(#hero-spark)"
      />
    </svg>
  );
}

function ComplianceRing() {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
      <motion.circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c * 0.006 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />
      <text x="36" y="34" transform="rotate(90 36 36)" textAnchor="middle" className="fill-white text-[13px] font-bold">
        99%
      </text>
    </svg>
  );
}

// ---- Background network visualization ---------------------------------------

function NetworkViz() {
  const nodes = [
    [12, 22], [28, 12], [42, 30], [62, 18], [78, 28], [88, 14],
    [18, 60], [34, 72], [50, 58], [68, 70], [82, 60], [92, 46],
  ];
  const links: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 8], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [3, 8], [4, 10],
  ];
  return (
    <svg className="absolute inset-0 -z-10 h-full w-full opacity-40" preserveAspectRatio="none" aria-hidden>
      {links.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={`${nodes[a][0]}%`}
          y1={`${nodes[a][1]}%`}
          x2={`${nodes[b][0]}%`}
          y2={`${nodes[b][1]}%`}
          stroke="url(#netgrad)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.4, delay: i * 0.08 }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={`${x}%`}
          cy={`${y}%`}
          r={2.5}
          fill="#7dd3fc"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <defs>
        <linearGradient id="netgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2f83ff" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  );
}
