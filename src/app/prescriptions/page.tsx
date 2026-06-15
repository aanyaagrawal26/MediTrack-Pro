"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Plus, Trash2, Wand2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { MedicineIcon } from "@/components/MedicineIcon";
import { Modal } from "@/components/Modal";
import { Reveal } from "@/components/motion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import {
  activatePrescription,
  createPrescription,
  deletePrescription,
  getPatients,
  getPrescriptions,
  updatePrescription,
} from "@/lib/store";
import type { PrescriptionItem, Prescription } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  COMPLETED: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
};

export default function PrescriptionsPage() {
  return (
    <AppShell>
      <Prescriptions />
    </AppShell>
  );
}

function Prescriptions() {
  const { canManage } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { prescriptions, patients } = useStore(() => ({
    prescriptions: getPrescriptions(),
    patients: getPatients(),
  }));

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "Unknown";
  const patient = (id: string) => patients.find((p) => p.id === id);

  const activate = (rx: Prescription) => {
    if (
      confirm(
        `Activate this prescription? It will create ${rx.items.length} medicine schedule(s) and start reminders.`
      )
    ) {
      activatePrescription(rx.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FileText className="h-6 w-6 text-brand-600" />
            Prescriptions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Doctors prescribe here; activating a prescription generates the medicine schedules.
          </p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New prescription
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {prescriptions.map((rx, idx) => (
          <Reveal key={rx.id} delay={idx} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={patientName(rx.patientId)} photoUrl={patient(rx.patientId)?.photoUrl} size={42} />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{patientName(rx.patientId)}</p>
                  <p className="text-xs text-slate-500">
                    {rx.doctorName} · {formatDate(rx.date)}
                  </p>
                </div>
              </div>
              <span className={`badge ${STATUS_STYLE[rx.status]}`}>{rx.status}</span>
            </div>

            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <strong>Dx:</strong> {rx.diagnosis}
            </p>

            <ul className="mt-3 space-y-2">
              {rx.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-700">
                  <MedicineIcon name={it.medicineName} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {it.medicineName} · {it.dosage}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {it.frequency} · {it.times.join(", ")} · {it.durationDays} days
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {rx.notes && <p className="mt-3 text-xs text-slate-500">📝 {rx.notes}</p>}

            {canManage && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => deletePrescription(rx.id)}
                  className="btn-ghost text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                {rx.status === "DRAFT" && (
                  <button onClick={() => activate(rx)} className="btn-success">
                    <Wand2 className="h-4 w-4" /> Activate → schedules
                  </button>
                )}
                {rx.status === "ACTIVE" && (
                  <button
                    onClick={() => updatePrescription(rx.id, { status: "COMPLETED" })}
                    className="btn-ghost"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark completed
                  </button>
                )}
              </div>
            )}
          </Reveal>
        ))}

        {prescriptions.length === 0 && (
          <div className="card col-span-full grid place-items-center px-6 py-16 text-center">
            <FileText className="h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-600 dark:text-slate-300">No prescriptions yet</p>
          </div>
        )}
      </div>

      {showForm && <PrescriptionForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

const EMPTY_ITEM: PrescriptionItem = {
  medicineName: "",
  dosage: "",
  frequency: "Twice daily",
  times: ["08:00", "20:00"],
  durationDays: 5,
};

function PrescriptionForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const patients = getPatients();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PrescriptionItem[]>([{ ...EMPTY_ITEM }]);
  const [error, setError] = useState("");

  const setItem = (i: number, patch: Partial<PrescriptionItem>) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const save = () => {
    if (!patientId) return setError("Select a patient.");
    if (!diagnosis.trim()) return setError("Enter a diagnosis.");
    const clean = items.filter((it) => it.medicineName.trim() && it.dosage.trim());
    if (clean.length === 0) return setError("Add at least one medicine.");

    createPrescription({
      patientId,
      doctorName: user?.name ?? "Doctor",
      diagnosis: diagnosis.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: "DRAFT",
      items: clean.map((it) => ({
        ...it,
        times: it.times.filter(Boolean),
        durationDays: Number(it.durationDays) || 1,
      })),
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="New prescription" subtitle="Prescribe one or more medicines" maxWidth="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Patient</label>
          <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.ward} · {p.bedNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Diagnosis</label>
          <input className="input" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Medicines</label>
          <button
            onClick={() => setItems((a) => [...a, { ...EMPTY_ITEM }])}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            + Add medicine
          </button>
        </div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="grid gap-2 sm:grid-cols-4">
                <input
                  className="input sm:col-span-2"
                  placeholder="Medicine name"
                  value={it.medicineName}
                  onChange={(e) => setItem(i, { medicineName: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Dosage"
                  value={it.dosage}
                  onChange={(e) => setItem(i, { dosage: e.target.value })}
                />
                <input
                  type="number"
                  className="input"
                  placeholder="Days"
                  value={it.durationDays}
                  onChange={(e) => setItem(i, { durationDays: Number(e.target.value) })}
                />
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                <select
                  className="input sm:col-span-2"
                  value={it.frequency}
                  onChange={(e) => setItem(i, { frequency: e.target.value })}
                >
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>Four times daily</option>
                </select>
                <input
                  className="input sm:col-span-2"
                  placeholder="Times (comma separated) e.g. 08:00, 20:00"
                  value={it.times.join(", ")}
                  onChange={(e) =>
                    setItem(i, { times: e.target.value.split(",").map((t) => t.trim()) })
                  }
                />
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => setItems((a) => a.filter((_, idx) => idx !== i))}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="label">Notes (optional)</label>
        <textarea className="input min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={save} className="btn-primary">Save prescription</button>
      </div>
    </Modal>
  );
}
