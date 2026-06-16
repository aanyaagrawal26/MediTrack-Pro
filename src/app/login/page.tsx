"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pill,
  ShieldCheck,
  Activity,
  Lock,
  User2,
  ArrowLeft,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

// Selling points shown on the login splash panel.
const FEATURES: { Icon: LucideIcon; text: string }[] = [
  { Icon: Activity, text: "Live reminders that never auto-dismiss" },
  { Icon: ShieldCheck, text: "Mandatory nurse verification & audit trail" },
  { Icon: Pill, text: "On-time / delayed / missed tracking per patient" },
];

const QUICK = [
  { u: "admin", p: "admin123", label: "Admin · Dr. Anita Rao", Icon: ShieldCheck, tone: "text-brand-600" },
  { u: "doctor", p: "doctor123", label: "Doctor · Dr. S. Menon", Icon: Stethoscope, tone: "text-indigo-600" },
  { u: "amelia", p: "nurse123", label: "Nurse · Amelia (Ward A)", Icon: Activity, tone: "text-emerald-600" },
];

/**
 * Sign-in screen (lives at /login). The marketing landing page is at /.
 * Provides one-click "quick login" chips so a demo viewer can jump straight in.
 */
export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // If already signed in, skip straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(username, password);
    if (!res.ok) {
      setError(res.error ?? "Login failed");
      return;
    }
    router.replace("/dashboard");
  };

  const quickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    const res = login(u, p);
    if (res.ok) router.replace("/dashboard");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand / value proposition */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/10 blur-2xl" />

        <Link href="/" className="relative flex items-center gap-3 transition hover:opacity-90">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-700">
            <Pill className="h-6 w-6" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">MediTrack Pro</span>
        </Link>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight">
            No reminder is dismissed without proof of administration.
          </h1>
          <p className="text-brand-100">
            A closed-loop medication safety system for hospital wards. Alarms keep ringing until a
            nurse verifies the dose — every administration is logged with who, what, and exactly
            when.
          </p>
          <ul className="space-y-3 text-sm">
            {FEATURES.map(({ Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" className="relative inline-flex items-center gap-2 text-xs text-brand-200 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to homepage
        </Link>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <Pill className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">MediTrack Pro</span>
            </Link>
            <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600">
              ← Home
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use a demo account below, or enter credentials.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="username"
                  className="input pl-9"
                  placeholder="admin / doctor / amelia"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  className="input pl-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            QUICK DEMO LOGIN
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="grid gap-2">
            {QUICK.map((q) => (
              <button
                key={q.u}
                onClick={() => quickLogin(q.u, q.p)}
                className="btn-ghost justify-between"
              >
                <span className="flex items-center gap-2">
                  <q.Icon className={`h-4 w-4 ${q.tone}`} /> {q.label}
                </span>
                <span className="text-xs text-slate-400">
                  {q.u} / {q.p}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
