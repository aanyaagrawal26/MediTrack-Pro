"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { createPatient, updatePatient } from "@/lib/store";
import { WARD_NAMES } from "@/lib/constants";
import type { Gender, Patient } from "@/lib/types";

const EMPTY = {
  name: "",
  age: "",
  gender: "MALE" as Gender,
  ward: "General Ward A",
  bedNumber: "",
  condition: "",
  doctor: "",
  bloodGroup: "",
  allergies: "",
};

/** Add / edit patient dialog (admin only). */
export function PatientFormModal({
  open,
  onClose,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
}) {
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Hydrate the form when editing an existing patient.
  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name,
        age: String(patient.age),
        gender: patient.gender,
        ward: patient.ward,
        bedNumber: patient.bedNumber,
        condition: patient.condition,
        doctor: patient.doctor,
        bloodGroup: patient.bloodGroup ?? "",
        allergies: patient.allergies ?? "",
      });
      setPhoto(patient.photoUrl ?? null);
    } else {
      setForm(EMPTY);
      setPhoto(null);
    }
    setError("");
  }, [patient, open]);

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Read the chosen image file into a base64 data URL (stored in localStorage).
  const onPickPhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.name.trim() || !form.bedNumber.trim() || !form.condition.trim()) {
      setError("Name, bed number and condition are required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      age: Number(form.age) || 0,
      gender: form.gender,
      ward: form.ward,
      bedNumber: form.bedNumber.trim(),
      condition: form.condition.trim(),
      doctor: form.doctor.trim(),
      bloodGroup: form.bloodGroup.trim() || null,
      allergies: form.allergies.trim() || null,
      photoUrl: photo,
    };
    if (patient) updatePatient(patient.id, payload);
    else createPatient(payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={patient ? "Edit patient" : "Admit new patient"}
      subtitle="Patient demographics and ward assignment."
      maxWidth="max-w-xl"
    >
      {/* Photo uploader */}
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={form.name || "New patient"} photoUrl={photo} size={64} />
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost">
            <Camera className="h-4 w-4" /> {photo ? "Change photo" : "Upload photo"}
          </button>
          {photo && (
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
              title="Remove photo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" className="sm:col-span-2">
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Age">
          <input
            type="number"
            min={0}
            className="input"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
          />
        </Field>
        <Field label="Gender">
          <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Ward">
          <select className="input" value={form.ward} onChange={(e) => set("ward", e.target.value)}>
            {WARD_NAMES.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </Field>
        <Field label="Bed number">
          <input
            className="input"
            placeholder="A-12"
            value={form.bedNumber}
            onChange={(e) => set("bedNumber", e.target.value)}
          />
        </Field>
        <Field label="Condition / Diagnosis" className="sm:col-span-2">
          <input
            className="input"
            placeholder="e.g. Type 2 Diabetes"
            value={form.condition}
            onChange={(e) => set("condition", e.target.value)}
          />
        </Field>
        <Field label="Attending doctor" className="sm:col-span-2">
          <input
            className="input"
            placeholder="Dr. ..."
            value={form.doctor}
            onChange={(e) => set("doctor", e.target.value)}
          />
        </Field>
        <Field label="Blood group">
          <select className="input" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
            <option value="">—</option>
            {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Allergies">
          <input
            className="input"
            placeholder="e.g. Penicillin (or None known)"
            value={form.allergies}
            onChange={(e) => set("allergies", e.target.value)}
          />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button onClick={save} className="btn-primary">
          {patient ? "Save changes" : "Admit patient"}
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
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
