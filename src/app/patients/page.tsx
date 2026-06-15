"use client";

import { useState } from "react";
import {
  BedDouble,
  Droplet,
  Pencil,
  Pill,
  QrCode,
  Search,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PatientFormModal } from "@/components/PatientFormModal";
import { MedicineFormModal } from "@/components/MedicineFormModal";
import { PatientQRModal } from "@/components/PatientQRModal";
import { Avatar } from "@/components/Avatar";
import { MedicineIcon } from "@/components/MedicineIcon";
import { Reveal } from "@/components/motion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { deleteMedicine, deletePatient, getMedicines, getPatients } from "@/lib/store";
import type { Medicine, Patient } from "@/lib/types";

export default function PatientsPage() {
  return (
    <AppShell>
      <Patients />
    </AppShell>
  );
}

function Patients() {
  const { isAdmin, wardScoped, user } = useAuth();
  const [query, setQuery] = useState("");
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [qrPatient, setQrPatient] = useState<Patient | null>(null);
  const [medModal, setMedModal] = useState<{ patientId?: string; medicine?: Medicine } | null>(null);

  const { patients, medicines } = useStore(() => ({
    patients: getPatients(),
    medicines: getMedicines(),
  }));

  // Ward staff see only their ward.
  const scoped = patients.filter((p) => (wardScoped && user?.ward ? p.ward === user.ward : true));
  const filtered = scoped.filter((p) =>
    [p.name, p.ward, p.bedNumber, p.condition, p.doctor]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const removePatient = (p: Patient) => {
    if (confirm(`Delete ${p.name}? This also removes their medicines and pending doses.`)) {
      deletePatient(p.id);
    }
  };

  const removeMedicine = (m: Medicine) => {
    if (confirm(`Remove ${m.name} schedule? Past logs are kept.`)) deleteMedicine(m.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Users className="h-6 w-6 text-brand-600" />
            Patients
          </h1>
          <p className="text-sm text-slate-500">
            {wardScoped ? `Admitted patients in ${user?.ward}` : "All admitted patients"} ·{" "}
            {filtered.length} shown
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditPatient(null);
              setShowPatientForm(true);
            }}
            className="btn-primary"
          >
            <UserPlus className="h-4 w-4" />
            Admit patient
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search patients, beds, conditions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p, idx) => {
          const meds = medicines.filter((m) => m.patientId === p.id);
          return (
            <Reveal key={p.id} delay={idx} className="card flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} photoUrl={p.photoUrl} size={44} />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      {p.age} yrs · {p.gender.charAt(0) + p.gender.slice(1).toLowerCase()}
                      {p.bloodGroup && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-0.5 font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                          <Droplet className="h-3 w-3" /> {p.bloodGroup}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <IconBtn onClick={() => setQrPatient(p)} title="Patient QR band">
                    <QrCode className="h-4 w-4" />
                  </IconBtn>
                  {isAdmin && (
                    <>
                      <IconBtn onClick={() => { setEditPatient(p); setShowPatientForm(true); }} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn onClick={() => removePatient(p)} title="Delete" danger>
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <Row icon={BedDouble} text={`${p.ward} · Bed ${p.bedNumber}`} />
                <Row icon={Stethoscope} text={p.doctor || "—"} />
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  {p.condition}
                </p>
              </div>

              {/* Medicines */}
              <div className="mt-4 flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <Pill className="h-3.5 w-3.5" /> Medicines ({meds.length})
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setMedModal({ patientId: p.id })}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      + Add
                    </button>
                  )}
                </div>
                {meds.length === 0 ? (
                  <p className="text-sm text-slate-400">No medicines scheduled.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {meds.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-700"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <MedicineIcon name={m.name} size={32} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-700 dark:text-slate-200">
                              {m.name} · {m.dosage}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {m.frequency} · {m.times.join(", ")}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex shrink-0 gap-1">
                            <IconBtn onClick={() => setMedModal({ medicine: m })} title="Edit medicine">
                              <Pencil className="h-3.5 w-3.5" />
                            </IconBtn>
                            <IconBtn onClick={() => removeMedicine(m)} title="Delete medicine" danger>
                              <Trash2 className="h-3.5 w-3.5" />
                            </IconBtn>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          );
        })}

        {filtered.length === 0 && (
          <div className="card col-span-full grid place-items-center px-6 py-16 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-600 dark:text-slate-300">No patients found</p>
            <p className="text-sm text-slate-400">
              {isAdmin ? "Admit a patient to get started." : "Nothing in your ward yet."}
            </p>
          </div>
        )}
      </div>

      <PatientFormModal
        open={showPatientForm}
        patient={editPatient}
        onClose={() => setShowPatientForm(false)}
      />
      <MedicineFormModal
        open={!!medModal}
        patientId={medModal?.patientId}
        medicine={medModal?.medicine}
        onClose={() => setMedModal(null)}
      />
      <PatientQRModal patient={qrPatient} onClose={() => setQrPatient(null)} />
    </div>
  );
}

function Row({ icon: Icon, text }: { icon: typeof BedDouble; text: string }) {
  return (
    <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
      <Icon className="h-4 w-4 text-slate-400" />
      {text}
    </p>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg p-1.5 transition ${
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
