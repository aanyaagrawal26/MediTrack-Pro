"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Pill, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MedicineFormModal } from "@/components/MedicineFormModal";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { deleteMedicine, getMedicines, getPatientById } from "@/lib/store";
import type { Medicine } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function MedicinesPage() {
  return (
    <AppShell>
      <Medicines />
    </AppShell>
  );
}

function Medicines() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Guard: this page is admin-only.
  useEffect(() => {
    if (!isAdmin) router.replace("/dashboard");
  }, [isAdmin, router]);

  const medicines = useStore(() => getMedicines());

  const remove = (m: Medicine) => {
    if (confirm(`Delete ${m.name}? Pending doses are removed; history is kept.`)) deleteMedicine(m.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Pill className="h-6 w-6 text-brand-600" />
            Medicine Schedules
          </h1>
          <p className="text-sm text-slate-500">{medicines.length} active schedules across all patients</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add medicine
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Medicine</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Frequency</th>
                <th className="px-5 py-3 font-semibold">Times</th>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {medicines.map((m) => {
                const patient = getPatientById(m.patientId);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.dosage}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {patient ? (
                        <>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-xs text-slate-400">
                            {patient.ward} · {patient.bedNumber}
                          </p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{m.frequency}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.times.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {formatDate(m.startDate)} → {formatDate(m.endDate)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(m);
                            setShowForm(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-200"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(m)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {medicines.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No medicine schedules yet. Click “Add medicine” to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MedicineFormModal open={showForm} medicine={editing} onClose={() => setShowForm(false)} />
    </div>
  );
}
