"use client";

import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import type { Patient } from "@/lib/types";

/**
 * Wristband-style QR for a patient. Scanning it yields a JSON payload with the
 * patient's key identifiers — exactly how hospitals link a physical band to the
 * digital record for safe medicine administration.
 */
export function PatientQRModal({
  patient,
  onClose,
}: {
  patient: Patient | null;
  onClose: () => void;
}) {
  if (!patient) return null;

  const payload = JSON.stringify({
    id: patient.id,
    name: patient.name,
    ward: patient.ward,
    bed: patient.bedNumber,
    blood: patient.bloodGroup ?? null,
  });

  return (
    <Modal open={!!patient} onClose={onClose} title="Patient ID band" subtitle="Scannable QR wristband">
      <div className="flex flex-col items-center">
        {/* The printable "band" */}
        <div
          id="qr-band"
          className="w-full max-w-xs rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-center dark:border-slate-600 dark:bg-slate-900"
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <Avatar name={patient.name} photoUrl={patient.photoUrl} size={36} />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{patient.name}</p>
              <p className="text-xs text-slate-500">
                {patient.age} yrs · {patient.gender.toLowerCase()}
              </p>
            </div>
          </div>

          <div className="flex justify-center rounded-xl bg-white p-3">
            <QRCodeSVG value={payload} size={168} level="M" marginSize={2} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 text-[11px]">
            <Band label="Ward" value={patient.ward.replace("General Ward ", "GW-")} />
            <Band label="Bed" value={patient.bedNumber} />
            <Band label="Blood" value={patient.bloodGroup ?? "—"} />
          </div>
          <p className="mt-2 font-mono text-[10px] tracking-widest text-slate-400">
            ID: {patient.id.toUpperCase()}
          </p>
        </div>

        <button onClick={() => window.print()} className="btn-ghost mt-4">
          <Printer className="h-4 w-4" />
          Print wristband
        </button>
      </div>
    </Modal>
  );
}

function Band({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-100 px-1 py-1 dark:bg-slate-800">
      <p className="text-[9px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-bold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}
