// =============================================================================
// Data store — localStorage implementation
// -----------------------------------------------------------------------------
// This is the ONLY file that talks to persistence. Everything else imports
// these functions. That isolation is deliberate: to move to PostgreSQL you
// reimplement this file against Prisma (same function names + shapes) and the
// rest of the app keeps working untouched.
//
// A tiny pub/sub (subscribe / emit) lets React components re-render whenever
// data changes, so reminders and dashboards stay live across tabs/components.
// =============================================================================

import type {
  Alert,
  Dose,
  DoseStatus,
  InventoryItem,
  Medicine,
  Patient,
  Prescription,
  ShiftAssignment,
  User,
} from "./types";
import {
  seedAlerts,
  seedDoses,
  seedInventory,
  seedMedicines,
  seedPatients,
  seedPrescriptions,
  seedShifts,
  seedUsers,
} from "./seed";
import { uid } from "./utils";

const KEYS = {
  users: "mtp.users",
  patients: "mtp.patients",
  medicines: "mtp.medicines",
  doses: "mtp.doses",
  shifts: "mtp.shifts",
  inventory: "mtp.inventory",
  prescriptions: "mtp.prescriptions",
  alerts: "mtp.alerts",
  // Bumped to v3 so existing users get the large-hospital demo data on next load.
  seeded: "mtp.seeded.v3",
} as const;

const isBrowser = typeof window !== "undefined";

// ----- low-level read / write ------------------------------------------------

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

// ----- pub/sub ---------------------------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(): void {
  listeners.forEach((fn) => fn());
}

// Keep multiple browser tabs in sync.
if (isBrowser) {
  window.addEventListener("storage", () => emit());
}

// ----- seeding ---------------------------------------------------------------

/** Populate demo data once. Safe to call on every app load. */
export function ensureSeeded(): void {
  if (!isBrowser) return;
  if (window.localStorage.getItem(KEYS.seeded)) return;
  write(KEYS.users, seedUsers);
  write(KEYS.patients, seedPatients);
  write(KEYS.medicines, seedMedicines);
  write(KEYS.doses, seedDoses);
  write(KEYS.shifts, seedShifts);
  write(KEYS.inventory, seedInventory);
  write(KEYS.prescriptions, seedPrescriptions);
  write(KEYS.alerts, seedAlerts);
  window.localStorage.setItem(KEYS.seeded, "true");
}

/** Wipe everything and re-seed (used by the "Reset demo data" button). */
export function resetDemoData(): void {
  if (!isBrowser) return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  ensureSeeded();
  emit();
}

// ----- Users -----------------------------------------------------------------

export function getUsers(): User[] {
  return read<User[]>(KEYS.users, []);
}

export function getNurses(): User[] {
  return getUsers().filter((u) => u.role === "NURSE");
}

export function findUserByCredentials(username: string, password: string): User | undefined {
  return getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password
  );
}

export function getUserById(id?: string | null): User | undefined {
  if (!id) return undefined;
  return getUsers().find((u) => u.id === id);
}

export function createUser(input: Omit<User, "id" | "createdAt">): User {
  const user: User = { ...input, id: uid("user"), createdAt: new Date().toISOString() };
  write(KEYS.users, [...getUsers(), user]);
  return user;
}

export function updateUser(id: string, patch: Partial<User>): void {
  write(
    KEYS.users,
    getUsers().map((u) => (u.id === id ? { ...u, ...patch, id } : u))
  );
}

export function deleteUser(id: string): void {
  write(
    KEYS.users,
    getUsers().filter((u) => u.id !== id)
  );
}

// ----- Patients --------------------------------------------------------------

export function getPatients(): Patient[] {
  return read<Patient[]>(KEYS.patients, []);
}

export function getPatientById(id?: string | null): Patient | undefined {
  if (!id) return undefined;
  return getPatients().find((p) => p.id === id);
}

export function createPatient(input: Omit<Patient, "id" | "createdAt">): Patient {
  const patient: Patient = { ...input, id: uid("pat"), createdAt: new Date().toISOString() };
  write(KEYS.patients, [...getPatients(), patient]);
  return patient;
}

export function updatePatient(id: string, patch: Partial<Patient>): void {
  write(
    KEYS.patients,
    getPatients().map((p) => (p.id === id ? { ...p, ...patch, id } : p))
  );
}

/** Deleting a patient cascades to their medicines and doses. */
export function deletePatient(id: string): void {
  write(
    KEYS.patients,
    getPatients().filter((p) => p.id !== id)
  );
  write(
    KEYS.medicines,
    getMedicines().filter((m) => m.patientId !== id)
  );
  write(
    KEYS.doses,
    getDoses().filter((d) => d.patientId !== id)
  );
}

// ----- Medicines -------------------------------------------------------------

export function getMedicines(): Medicine[] {
  return read<Medicine[]>(KEYS.medicines, []);
}

export function getMedicinesByPatient(patientId: string): Medicine[] {
  return getMedicines().filter((m) => m.patientId === patientId);
}

export function getMedicineById(id?: string | null): Medicine | undefined {
  if (!id) return undefined;
  return getMedicines().find((m) => m.id === id);
}

export function createMedicine(input: Omit<Medicine, "id" | "createdAt">): Medicine {
  const medicine: Medicine = { ...input, id: uid("med"), createdAt: new Date().toISOString() };
  write(KEYS.medicines, [...getMedicines(), medicine]);
  return medicine;
}

export function updateMedicine(id: string, patch: Partial<Medicine>): void {
  write(
    KEYS.medicines,
    getMedicines().map((m) => (m.id === id ? { ...m, ...patch, id } : m))
  );
  // Future scheduled doses may now be stale; drop unconfirmed future doses so
  // the engine regenerates them from the new times.
  write(
    KEYS.doses,
    getDoses().filter(
      (d) => d.medicineId !== id || d.status !== "PENDING" || new Date(d.scheduledAt) < new Date()
    )
  );
}

/** Deleting a medicine also removes its (unconfirmed) doses, but keeps history. */
export function deleteMedicine(id: string): void {
  write(
    KEYS.medicines,
    getMedicines().filter((m) => m.id !== id)
  );
  write(
    KEYS.doses,
    getDoses().filter((d) => d.medicineId !== id || d.status !== "PENDING")
  );
}

// ----- Doses -----------------------------------------------------------------

export function getDoses(): Dose[] {
  return read<Dose[]>(KEYS.doses, []);
}

export function setDoses(doses: Dose[]): void {
  write(KEYS.doses, doses);
}

export function getDoseById(id?: string | null): Dose | undefined {
  if (!id) return undefined;
  return getDoses().find((d) => d.id === id);
}

/**
 * Confirm a dose was administered. Status becomes GIVEN or DELAYED depending on
 * how late it is relative to the scheduled time + grace window.
 */
export function confirmDose(
  doseId: string,
  opts: { nurseId: string; notes?: string; graceMinutes?: number }
): void {
  const grace = opts.graceMinutes ?? 15;
  const now = new Date();
  const dose = getDoseById(doseId);
  write(
    KEYS.doses,
    getDoses().map((d) => {
      if (d.id !== doseId) return d;
      const lateMs = now.getTime() - new Date(d.scheduledAt).getTime();
      const status: DoseStatus = lateMs > grace * 60_000 ? "DELAYED" : "GIVEN";
      return {
        ...d,
        status,
        givenAt: now.toISOString(),
        nurseId: opts.nurseId,
        notes: opts.notes ?? d.notes,
      };
    })
  );
  // Giving a medicine consumes one unit from pharmacy stock.
  const med = getMedicineById(dose?.medicineId);
  if (med) decrementInventory(med.name, 1);
  // Resolve any open escalation alerts for this dose.
  resolveAlertsForDose(doseId);
}

/** Explicitly mark a dose as missed (could not be administered). */
export function markDoseMissed(doseId: string, opts: { nurseId?: string; notes?: string }): void {
  write(
    KEYS.doses,
    getDoses().map((d) =>
      d.id === doseId
        ? { ...d, status: "MISSED", nurseId: opts.nurseId ?? d.nurseId, notes: opts.notes ?? d.notes }
        : d
    )
  );
  resolveAlertsForDose(doseId);
}

// ----- Shift assignments -----------------------------------------------------

export function getShifts(): ShiftAssignment[] {
  return read<ShiftAssignment[]>(KEYS.shifts, []);
}

export function createShift(input: Omit<ShiftAssignment, "id" | "createdAt">): ShiftAssignment {
  const shift: ShiftAssignment = { ...input, id: uid("shift"), createdAt: new Date().toISOString() };
  write(KEYS.shifts, [...getShifts(), shift]);
  return shift;
}

export function deleteShift(id: string): void {
  write(
    KEYS.shifts,
    getShifts().filter((s) => s.id !== id)
  );
}

// ----- Inventory -------------------------------------------------------------

export function getInventory(): InventoryItem[] {
  return read<InventoryItem[]>(KEYS.inventory, []);
}

export function createInventoryItem(input: Omit<InventoryItem, "id" | "updatedAt">): InventoryItem {
  const item: InventoryItem = { ...input, id: uid("inv"), updatedAt: new Date().toISOString() };
  write(KEYS.inventory, [...getInventory(), item]);
  return item;
}

export function updateInventoryItem(id: string, patch: Partial<InventoryItem>): void {
  write(
    KEYS.inventory,
    getInventory().map((i) => (i.id === id ? { ...i, ...patch, id, updatedAt: new Date().toISOString() } : i))
  );
}

export function deleteInventoryItem(id: string): void {
  write(
    KEYS.inventory,
    getInventory().filter((i) => i.id !== id)
  );
}

/** Reduce stock for a medicine by name (called when a dose is given). */
export function decrementInventory(medicineName: string, by = 1): void {
  const inv = getInventory();
  const idx = inv.findIndex((i) => i.name.toLowerCase() === medicineName.toLowerCase());
  if (idx === -1) return;
  inv[idx] = {
    ...inv[idx],
    quantity: Math.max(0, inv[idx].quantity - by),
    updatedAt: new Date().toISOString(),
  };
  write(KEYS.inventory, inv);
}

// ----- Prescriptions ---------------------------------------------------------

export function getPrescriptions(): Prescription[] {
  return read<Prescription[]>(KEYS.prescriptions, []);
}

export function createPrescription(input: Omit<Prescription, "id" | "createdAt">): Prescription {
  const rx: Prescription = { ...input, id: uid("rx"), createdAt: new Date().toISOString() };
  write(KEYS.prescriptions, [...getPrescriptions(), rx]);
  return rx;
}

export function updatePrescription(id: string, patch: Partial<Prescription>): void {
  write(
    KEYS.prescriptions,
    getPrescriptions().map((r) => (r.id === id ? { ...r, ...patch, id } : r))
  );
}

export function deletePrescription(id: string): void {
  write(
    KEYS.prescriptions,
    getPrescriptions().filter((r) => r.id !== id)
  );
}

/**
 * Activate a prescription: turn each item into a real Medicine schedule for the
 * patient. This is the doctor → nurse handoff that drives the reminder engine.
 */
export function activatePrescription(id: string): void {
  const rx = getPrescriptions().find((r) => r.id === id);
  if (!rx) return;
  const start = new Date();
  rx.items.forEach((item) => {
    const end = new Date(start.getTime() + item.durationDays * 86400000);
    createMedicine({
      patientId: rx.patientId,
      name: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency,
      times: item.times,
      startDate: new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString(),
      endDate: end.toISOString(),
      notes: `From prescription by ${rx.doctorName}`,
    });
  });
  updatePrescription(id, { status: "ACTIVE" });
}

// ----- Alerts (escalation + emergency) ---------------------------------------

export function getAlerts(): Alert[] {
  return read<Alert[]>(KEYS.alerts, []);
}

export function getActiveAlerts(): Alert[] {
  return getAlerts()
    .filter((a) => !a.acknowledged)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createAlert(input: Omit<Alert, "id" | "createdAt" | "acknowledged">): Alert {
  const alert: Alert = {
    ...input,
    id: uid("alert"),
    acknowledged: false,
    createdAt: new Date().toISOString(),
  };
  write(KEYS.alerts, [...getAlerts(), alert]);
  return alert;
}

export function acknowledgeAlert(id: string, byName?: string): void {
  write(
    KEYS.alerts,
    getAlerts().map((a) =>
      a.id === id ? { ...a, acknowledged: true, acknowledgedBy: byName ?? "—" } : a
    )
  );
}

/** Auto-acknowledge any escalation alerts once the dose is dealt with. */
export function resolveAlertsForDose(doseId: string): void {
  const alerts = getAlerts();
  if (!alerts.some((a) => a.doseId === doseId && !a.acknowledged)) return;
  write(
    KEYS.alerts,
    alerts.map((a) =>
      a.doseId === doseId && !a.acknowledged
        ? { ...a, acknowledged: true, acknowledgedBy: "Resolved (dose actioned)" }
        : a
    )
  );
}

/** Does an escalation alert already exist for this dose+level? (idempotency) */
export function hasEscalationAlert(doseId: string, level: number): boolean {
  return getAlerts().some(
    (a) => a.type === "ESCALATION" && a.doseId === doseId && a.level === level
  );
}
