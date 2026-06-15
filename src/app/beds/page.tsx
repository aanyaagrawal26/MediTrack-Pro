"use client";

import { BedDouble } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { Reveal } from "@/components/motion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { getPatients } from "@/lib/store";
import { WARDS, bedLabels } from "@/lib/constants";

export default function BedsPage() {
  return (
    <AppShell>
      <Beds />
    </AppShell>
  );
}

function Beds() {
  const { wardScoped, user } = useAuth();
  const patients = useStore(() => getPatients());

  // Map bedNumber -> patient for quick lookup.
  const byBed = new Map(patients.map((p) => [p.bedNumber, p]));
  const wards = wardScoped && user?.ward ? WARDS.filter((w) => w.name === user.ward) : WARDS;

  const totalBeds = wards.reduce((n, w) => n + w.beds, 0);
  const occupied = wards.reduce(
    (n, w) => n + bedLabels(w).filter((b) => byBed.has(b)).length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BedDouble className="h-6 w-6 text-brand-600" />
            Bed Occupancy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {occupied} of {totalBeds} beds occupied ·{" "}
            {Math.round((occupied / Math.max(1, totalBeds)) * 100)}% utilisation
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <Legend className="bg-brand-500" label="Occupied" />
          <Legend className="bg-slate-200 dark:bg-slate-700" label="Available" />
        </div>
      </div>

      <div className="space-y-5">
        {wards.map((ward, wi) => {
          const beds = bedLabels(ward);
          const wardOccupied = beds.filter((b) => byBed.has(b)).length;
          const pct = Math.round((wardOccupied / ward.beds) * 100);
          return (
            <Reveal key={ward.name} delay={wi} className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white">{ward.name}</h2>
                  <p className="text-xs text-slate-500">
                    {wardOccupied}/{ward.beds} occupied
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${pct > 85 ? "bg-red-500" : "bg-brand-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{pct}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {beds.map((bed) => {
                  const patient = byBed.get(bed);
                  return (
                    <div
                      key={bed}
                      title={patient ? `${patient.name} — ${patient.condition}` : "Available"}
                      className={`group flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                        patient
                          ? "border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10"
                          : "border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/40"
                      }`}
                    >
                      {patient ? (
                        <Avatar name={patient.name} photoUrl={patient.photoUrl} size={32} ring={false} />
                      ) : (
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-slate-400 dark:bg-slate-700">
                          <BedDouble className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{bed}</span>
                      {patient && (
                        <span className="w-full truncate text-[10px] text-slate-500">
                          {patient.name.split(" ")[0]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  );
}
