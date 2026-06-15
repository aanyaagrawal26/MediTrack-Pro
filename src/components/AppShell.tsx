"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  BedDouble,
  CalendarClock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Pill,
  RotateCcw,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { resetDemoData } from "@/lib/store";
import { ReminderEngine } from "./ReminderEngine";
import { ThemeToggle } from "./ThemeToggle";
import { AlertsCenter } from "./AlertsCenter";
import { EmergencyButton } from "./EmergencyButton";
import { EmergencyBanner } from "./EmergencyBanner";
import { Avatar } from "./Avatar";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  section: string;
  manageOnly?: boolean; // admins + doctors
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { href: "/reminders", label: "Reminders", icon: Activity, section: "Overview" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, section: "Overview" },

  { href: "/patients", label: "Patients", icon: Users, section: "Care" },
  { href: "/prescriptions", label: "Prescriptions", icon: FileText, section: "Care" },
  { href: "/medicines", label: "Medicines", icon: Pill, section: "Care", manageOnly: true },

  { href: "/inventory", label: "Inventory", icon: Package, section: "Operations", manageOnly: true },
  { href: "/beds", label: "Bed Occupancy", icon: BedDouble, section: "Operations" },
  { href: "/shifts", label: "Nurse Shifts", icon: CalendarClock, section: "Operations" },

  { href: "/logs", label: "Medicine Logs", icon: ClipboardList, section: "Records" },
  { href: "/nurses", label: "Staff", icon: Stethoscope, section: "Records", adminOnly: true },
];

const SECTION_ORDER = ["Overview", "Care", "Operations", "Records"];

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  HEAD_NURSE: "Head Nurse",
  NURSE: "Nurse",
};

/**
 * Protected application chrome. Redirects to login when signed out, renders a
 * premium role-aware sidebar + top bar, and mounts the always-on safety systems
 * (reminder alarm, escalation alerts, emergency broadcast).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin, canManage } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>;
  }

  const items = NAV.filter((n) => {
    if (n.adminOnly) return isAdmin;
    if (n.manageOnly) return canManage;
    return true;
  });

  const handleReset = () => {
    if (confirm("Reset all demo data back to the original sample patients & medicines?")) {
      resetDemoData();
    }
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
          <Pill className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            MediTrack
          </p>
          <p className="-mt-1 text-xs font-semibold text-brand-600 dark:text-brand-400">Pro</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-2">
        {SECTION_ORDER.map((section) => {
          const sectionItems = items.filter((i) => i.section === section);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section}>
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section}
              </p>
              <div className="space-y-0.5">
                {sectionItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                        active
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-xl bg-brand-600"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
        <button
          onClick={handleReset}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
          <Avatar name={user.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {ROLE_LABEL[user.role]}
              {user.ward ? ` · ${user.ward}` : ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600 dark:hover:bg-slate-700"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-pop dark:bg-slate-900">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between px-4 py-2.5 lg:px-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="hidden items-center gap-2 text-sm text-slate-500 dark:text-slate-400 lg:flex">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500">
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                </span>
                <span className="font-medium">Live monitoring active</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <EmergencyButton />
              <AlertsCenter />
              <ThemeToggle />
            </div>
          </div>
          <EmergencyBanner />
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
      </div>

      {/* Always-on alarm */}
      <ReminderEngine />
    </div>
  );
}
