"use client";

// =============================================================================
// Shared building blocks for the marketing landing page.
// All deterministic (no Math.random at render) so SSR + hydration stay in sync.
// =============================================================================

import { motion, useInView, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

// Deterministic pseudo-random from an integer seed (stable across SSR/CSR).
export function seeded(n: number): number {
  const x = Math.sin(n * 999.123) * 43758.5453;
  return x - Math.floor(x);
}

// ----- Scroll reveal ---------------------------------------------------------

export function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
  ...rest
}: { children: React.ReactNode; delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ----- Animated counter (fires when scrolled into view) ----------------------

export function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// ----- Section heading (eyebrow + title + subtitle) --------------------------

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
  center = true,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={clsx("mx-auto max-w-3xl", center && "text-center")}>
      {eyebrow && (
        <Reveal>
          <span
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
              light
                ? "border-white/20 bg-white/10 text-white/80"
                : "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
            )}
          >
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={clsx(
            "mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl",
            light ? "text-white" : "text-slate-900 dark:text-white"
          )}
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p
            className={clsx(
              "mt-4 text-base leading-relaxed sm:text-lg",
              light ? "text-white/70" : "text-slate-600 dark:text-slate-400"
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

// ----- Gradient text ---------------------------------------------------------

export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "bg-gradient-to-r from-brand-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}

// ----- Particle field (subtle floating dots) ---------------------------------

export function Particles({
  count = 22,
  className,
  onDark = false,
}: {
  count?: number;
  className?: string;
  // Set true on permanently-dark gradient bands (metrics / CTA) so the dots
  // stay white. Otherwise they adapt: slate on light, white on dark.
  onDark?: boolean;
}) {
  const dots = Array.from({ length: count }, (_, i) => {
    const left = seeded(i + 1) * 100;
    const top = seeded(i + 99) * 100;
    const size = 1.5 + seeded(i + 7) * 3.5;
    const dur = 6 + seeded(i + 13) * 8;
    const delay = seeded(i + 21) * 6;
    const drift = 18 + seeded(i + 5) * 26;
    return { left, top, size, dur, delay, drift, i };
  });

  return (
    <div className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {dots.map((d) => (
        <motion.span
          key={d.i}
          className={clsx(
            "absolute rounded-full",
            onDark ? "bg-white/40" : "bg-brand-400/40 dark:bg-white/40"
          )}
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -d.drift, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ----- Scrolling ECG heartbeat strip -----------------------------------------

export function EcgLine({ className, stroke = "#34d399" }: { className?: string; stroke?: string }) {
  // One heartbeat cycle, 240 units wide, baseline y = 30.
  const cycle = "M0,30 H70 L82,30 88,12 96,52 104,6 112,30 H170 L182,30 188,22 196,38 204,30 H240";
  return (
    <div className={clsx("pointer-events-none overflow-hidden", className)} aria-hidden>
      <motion.svg
        viewBox="0 0 480 60"
        className="h-full w-[200%]"
        preserveAspectRatio="none"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <path d={cycle} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        <path d={cycle} transform="translate(240,0)" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      </motion.svg>
    </div>
  );
}

// ----- Floating element (gentle infinite bob) --------------------------------

export function Floaty({
  children,
  className,
  delay = 0,
  amount = 14,
  duration = 6,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amount, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
