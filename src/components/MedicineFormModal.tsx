"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Modal } from "./Modal";
import { createMedicine, getPatients, updateMedicine } from "@/lib/store";
import type { Medicine } from "@/lib/types";
import { toDateKey } from "@/lib/utils";

const todayKey = toDateKey(new Date());
const weekLaterKey = toDateKey(new Date(Date.now() + 7 * 86400000));

/** Add / edit a medicine schedule for a patient (admin only). */
export function MedicineFormModal({
  open,
  onClose,
  medicine,
  patientId,
}: {
  open: boolean;
  onClose: () => void;
  medicine?: Medicine | null;
  patientId?: string; // pre-selected patient (when adding from a patient card)
}) {
  const patients = getPatients();
  const [form, setForm] = useState({
    patientId: patientId ?? patients[0]?.id ?? "",
    name: "",
    dosage: "",
    frequency: "Twice daily",
    startDate: todayKey,
    endDate: weekLaterKey,
    notes: "",
  });
  const [times, setTimes] = useState<string[]>(["08:00", "20:00"]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (medicine) {
      setForm({
        patientId: medicine.patientId,
        name: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        startDate: toDateKey(new Date(medicine.startDate)),
        endDate: toDateKey(new Date(medicine.endDate)),
        notes: medicine.notes ?? "",
      });
      setTimes(medicine.times);
    } else {
      setForm((f) => ({
        ...f,
        patientId: patientId ?? patients[0]?.id ?? "",
        name: "",
        dosage: "",
        frequency: "Twice daily",
        startDate: todayKey,
        endDate: weekLaterKey,
        notes: "",
      }));
      setTimes(["08:00", "20:00"]);
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicine, open, patientId]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addTime = () => setTimes((t) => [...t, "12:00"]);
  const removeTime = (i: number) => setTimes((t) => t.filter((_, idx) => idx !== i));
  const setTime = (i: number, v: string) =>
    setTimes((t) => t.map((x, idx) => (idx === i ? v : x)));

  const save = () => {
    const cleanTimes = times.filter(Boolean);
    if (!form.patientId) return setError("Select a patient.");
    if (!form.name.trim() || !form.dosage.trim()) return setError("Medicine name and dosage are required.");
    if (cleanTimes.length === 0) return setError("Add at least one reminder time.");
    if (new Date(form.endDate) < new Date(form.startDate))
      return setError("End date cannot be before start date.");

    const payload = {
      patientId: form.patientId,
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency,
      // store as start-of-day / end-of-day ISO
      startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${form.endDate}T23:59:59`).toISOString(),
      times: [...cleanTimes].sort(),
      notes: form.notes.trim() || undefined,
    };

    if (medicine) updateMedicine(medicine.id, payload);
    else createMedicine(payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={medicine ? "Edit medicine schedule" : "Add medicine schedule"}
      subtitle="Doses are generated automatically from the reminder times you set."
      maxWidth="max-w-xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Patient" className="sm:col-span-2">
          <select
            className="input"
            value={form.patientId}
            onChange={(e) => set("patientId", e.target.value)}
            disabled={!!medicine || !!patientId}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.ward} · Bed {p.bedNumber}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Medicine name">
          <input className="input" placeholder="Metformin" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Dosage">
          <input className="input" placeholder="500 mg" value={form.dosage} onChange={(e) => set("dosage", e.target.value)} />
        </Field>
        <Field label="Frequency (label)">
          <select className="input" value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
            <option>Once daily</option>
            <option>Twice daily</option>
            <option>Three times daily</option>
            <option>Four times daily</option>
            <option>As needed</option>
          </select>
        </Field>
        <Field label="">
          <span className="hidden sm:block" />
        </Field>
        <Field label="Start date">
          <input type="date" className="input" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="End date">
          <input type="date" className="input" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </Field>
      </div>

      {/* Reminder times */}
      <div className="mt-4">
        <label className="label">Daily reminder times</label>
        <div className="flex flex-wrap gap-2">
          {times.map((t, i) => (
            <div key={i} className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1">
              <input
                type="time"
                className="border-0 p-0 text-sm focus:outline-none focus:ring-0"
                value={t}
                onChange={(e) => setTime(i, e.target.value)}
              />
              <button
                onClick={() => removeTime(i)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                aria-label="Remove time"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addTime} className="btn-ghost px-2.5 py-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add time
          </button>
        </div>
      </div>

      <Field label="Notes / instructions (optional)" className="mt-4">
        <textarea
          className="input min-h-[64px] resize-y"
          placeholder="e.g. Give with food"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button onClick={save} className="btn-primary">
          {medicine ? "Save changes" : "Add medicine"}
        </button>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? <label className="label">{label}</label> : null}
      {children}
    </div>
  );
}
