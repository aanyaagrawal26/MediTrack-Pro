"use client";

import { useEffect, useState } from "react";
import { BedDouble, ScanLine, ShieldCheck, User2 } from "lucide-react";
import { Modal } from "./Modal";
import { useAuth } from "@/lib/auth";
import { confirmDose, getNurses, markDoseMissed } from "@/lib/store";
import { GRACE_MINUTES } from "@/lib/reminders";
import type { EnrichedDose } from "@/lib/types";
import { describeOverdue, formatTime } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { MedicineIcon } from "./MedicineIcon";
import { Barcode, medicineCode } from "./Barcode";

/**
 * The nurse verification dialog. This is the safety gate: a reminder can only
 * leave the PENDING state by passing through here. The nurse MUST be selected
 * (defaults to the logged-in nurse) before confirmation is allowed.
 */
export function ConfirmDoseModal({
  dose,
  onClose,
}: {
  dose: EnrichedDose | null;
  onClose: () => void;
}) {
  const { user, isNurse } = useAuth();
  const nurses = getNurses();

  // Default the acting nurse to the logged-in nurse; admins pick from the list.
  const [nurseId, setNurseId] = useState<string>(isNurse && user ? user.id : "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  // BCMA gate: the medicine barcode must be "scanned" before confirmation.
  const [scanned, setScanned] = useState(false);
  const [scanInput, setScanInput] = useState("");

  // Reset the scan gate whenever a new dose is opened.
  useEffect(() => {
    setScanned(false);
    setScanInput("");
    setNotes("");
    setError("");
    setNurseId(isNurse && user ? user.id : "");
  }, [dose?.id, isNurse, user]);

  if (!dose) return null;

  const expectedCode = dose.medicine ? medicineCode(dose.medicine.id) : "";

  const tryScan = (value: string) => {
    setScanInput(value);
    if (value.trim().toUpperCase() === expectedCode) {
      setScanned(true);
      setError("");
    }
  };

  const handleConfirm = () => {
    if (!scanned) {
      setError("Scan the medicine barcode first to confirm you have the right drug.");
      return;
    }
    if (!nurseId) {
      setError("Please select the nurse administering this medicine.");
      return;
    }
    confirmDose(dose.id, { nurseId, notes: notes.trim() || undefined, graceMinutes: GRACE_MINUTES });
    reset();
    onClose();
  };

  const handleMissed = () => {
    if (!nurseId) {
      setError("Select a nurse to record who marked this dose missed.");
      return;
    }
    markDoseMissed(dose.id, { nurseId, notes: notes.trim() || undefined });
    reset();
    onClose();
  };

  const reset = () => {
    setNotes("");
    setError("");
    setScanned(false);
    setScanInput("");
  };

  const overdue = describeOverdue(dose.scheduledAt);

  return (
    <Modal
      open={!!dose}
      onClose={onClose}
      title="Verify medicine administration"
      subtitle="Confirm only after the medicine has actually been given to the patient."
    >
      {/* Patient + medicine header so the nurse double-checks the 5 rights */}
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
        <Avatar name={dose.patient?.name ?? "?"} photoUrl={dose.patient?.photoUrl} size={48} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 dark:text-white">{dose.patient?.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <BedDouble className="h-3.5 w-3.5" />
            {dose.patient?.ward} · Bed {dose.patient?.bedNumber}
            {dose.patient?.allergies && dose.patient.allergies !== "None known" && (
              <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                Allergy: {dose.patient.allergies}
              </span>
            )}
          </p>
        </div>
        {dose.medicine && <MedicineIcon name={dose.medicine.name} size={44} />}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Info
          icon={ShieldCheck}
          label="Medicine & Dose"
          value={`${dose.medicine?.name ?? "—"} — ${dose.medicine?.dosage ?? ""}`}
        />
        <Info
          icon={User2}
          label="Scheduled"
          value={`${formatTime(dose.scheduledAt)} (${overdue})`}
        />
      </div>

      {dose.medicine?.notes && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <strong>Instruction:</strong> {dose.medicine.notes}
        </p>
      )}

      {/* Barcode verification — the "right drug" safety check (BCMA) */}
      <div
        className={`mt-4 rounded-xl border-2 p-4 transition ${
          scanned
            ? "border-green-300 bg-green-50 dark:border-green-500/40 dark:bg-green-500/10"
            : "border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <ScanLine className="h-4 w-4" /> Scan medicine barcode
          </p>
          {scanned ? (
            <span className="badge bg-green-600 text-white">✓ Verified</span>
          ) : (
            <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800">Awaiting scan</span>
          )}
        </div>

        <div className="mt-3 flex flex-col items-center gap-3">
          <Barcode code={expectedCode} height={52} />
          {!scanned && (
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <input
                className="input flex-1 font-mono"
                placeholder="Type or scan code…"
                value={scanInput}
                onChange={(e) => tryScan(e.target.value)}
              />
              {/* Simulates a handheld scanner reading the label above */}
              <button onClick={() => tryScan(expectedCode)} className="btn-primary whitespace-nowrap">
                <ScanLine className="h-4 w-4" /> Simulate scan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="nurse">
            Administering nurse <span className="text-red-500">*</span>
          </label>
          {isNurse ? (
            // Nurses confirm as themselves (read-only) for accountability.
            <div className="input flex items-center bg-slate-50 font-medium text-slate-700 dark:text-slate-200">
              {user?.name}
            </div>
          ) : (
            <select
              id="nurse"
              className="input"
              value={nurseId}
              onChange={(e) => {
                setNurseId(e.target.value);
                setError("");
              }}
            >
              <option value="">Select nurse…</option>
              {nurses.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} — {n.ward}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="label" htmlFor="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            className="input min-h-[72px] resize-y"
            placeholder="e.g. Patient tolerated well / refused first attempt / vitals stable"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <p className="text-xs text-slate-400">
          The actual administration time will be recorded automatically as{" "}
          <strong>{formatTime(new Date())}</strong>. Doses given more than {GRACE_MINUTES} min
          after schedule are logged as <strong>Delayed</strong>.
        </p>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-between">
          <button onClick={handleMissed} className="btn-ghost text-red-600 hover:bg-red-50">
            Mark as missed
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button onClick={handleConfirm} className="btn-success" disabled={!scanned}>
              <ShieldCheck className="h-4 w-4" />
              Confirm given
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}
