"use client";

import { useState } from "react";
import { CalendarClock, Plus, Sun, Sunset, Moon, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Modal";
import { Reveal } from "@/components/motion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { createShift, deleteShift, getNurses, getShifts, getUserById } from "@/lib/store";
import { SHIFTS, WARD_NAMES } from "@/lib/constants";
import type { Shift } from "@/lib/types";
import { toDateKey } from "@/lib/utils";

const SHIFT_ICON: Record<Shift, typeof Sun> = {
  MORNING: Sun,
  EVENING: Sunset,
  NIGHT: Moon,
};
const SHIFT_TONE: Record<Shift, string> = {
  MORNING: "from-amber-50 to-white dark:from-amber-500/10 dark:to-transparent",
  EVENING: "from-violet-50 to-white dark:from-violet-500/10 dark:to-transparent",
  NIGHT: "from-indigo-50 to-white dark:from-indigo-500/10 dark:to-transparent",
};

export default function ShiftsPage() {
  return (
    <AppShell>
      <Shifts />
    </AppShell>
  );
}

function Shifts() {
  const { canManage, isHeadNurse } = useAuth();
  const canEdit = canManage || isHeadNurse;
  const [date, setDate] = useState(toDateKey(new Date()));
  const [showForm, setShowForm] = useState(false);

  const { shifts } = useStore(() => ({ shifts: getShifts() }));
  const dayShifts = shifts.filter((s) => s.date === date);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-brand-600" />
            Nurse Shift Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assign nurses to Morning / Evening / Night shifts per ward.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Assign
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {SHIFTS.map((shift, idx) => {
          const Icon = SHIFT_ICON[shift.key];
          const assignments = dayShifts.filter((s) => s.shift === shift.key);
          return (
            <Reveal key={shift.key} delay={idx} className={`card bg-gradient-to-b p-5 ${SHIFT_TONE[shift.key]}`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{shift.label}</p>
                    <p className="text-xs text-slate-500">{shift.window}</p>
                  </div>
                </div>
                <span className="badge bg-white/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {assignments.length} on duty
                </span>
              </div>

              {assignments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
                  No nurses assigned
                </p>
              ) : (
                <ul className="space-y-2">
                  {assignments.map((a) => {
                    const nurse = getUserById(a.nurseId);
                    return (
                      <li
                        key={a.id}
                        className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2 dark:bg-slate-800/70"
                      >
                        <Avatar name={nurse?.name ?? "?"} size={34} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {nurse?.name ?? "Unknown"}
                          </p>
                          <p className="truncate text-xs text-slate-400">{a.ward}</p>
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => deleteShift(a.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Reveal>
          );
        })}
      </div>

      {showForm && <ShiftForm date={date} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function ShiftForm({ date, onClose }: { date: string; onClose: () => void }) {
  const nurses = getNurses();
  const [nurseId, setNurseId] = useState(nurses[0]?.id ?? "");
  const [shift, setShift] = useState<Shift>("MORNING");
  const [ward, setWard] = useState(WARD_NAMES[0]);
  const [error, setError] = useState("");

  const save = () => {
    if (!nurseId) return setError("Select a nurse.");
    createShift({ nurseId, date, shift, ward });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Assign shift" subtitle={`Roster for ${date}`}>
      <div className="space-y-4">
        <div>
          <label className="label">Nurse</label>
          <select className="input" value={nurseId} onChange={(e) => setNurseId(e.target.value)}>
            {nurses.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Shift</label>
            <select className="input" value={shift} onChange={(e) => setShift(e.target.value as Shift)}>
              {SHIFTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label} ({s.window})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Ward</label>
            <select className="input" value={ward} onChange={(e) => setWard(e.target.value)}>
              {WARD_NAMES.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={save} className="btn-primary">Assign</button>
      </div>
    </Modal>
  );
}
