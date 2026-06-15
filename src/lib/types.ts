// =============================================================================
// Shared domain types
// -----------------------------------------------------------------------------
// These mirror the Prisma models 1:1 (see prisma/schema.prisma) so the UI code
// does not change when you switch from localStorage to a real database.
// Dates are stored as ISO strings here because localStorage is text-only; a DB
// layer would hand back real Date objects, but the UI uses helpers that accept
// both.
// =============================================================================

// ADMIN  -> full management
// DOCTOR -> prescribes, sees all patients
// HEAD_NURSE -> ward oversight, receives 2nd-level escalations
// NURSE  -> verifies doses, scoped to her ward
export type Role = "ADMIN" | "DOCTOR" | "HEAD_NURSE" | "NURSE";
export type Gender = "MALE" | "FEMALE" | "OTHER";

/** Working shift a nurse can be rostered on. */
export type Shift = "MORNING" | "EVENING" | "NIGHT";

/** Lifecycle of a single scheduled dose. */
export type DoseStatus = "PENDING" | "GIVEN" | "DELAYED" | "MISSED";

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // plaintext for the demo only — hash in production
  role: Role;
  ward?: string | null; // ward staff are scoped to a ward; admins/doctors see all
  shift?: Shift | null; // default/regular shift for nurses
  phone?: string | null; // for escalation notifications
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  ward: string;
  bedNumber: string;
  condition: string; // diagnosis / disease
  doctor: string;
  photoUrl?: string | null; // data URL or remote photo; falls back to initials
  bloodGroup?: string | null;
  allergies?: string | null;
  createdAt: string;
}

export interface Medicine {
  id: string;
  patientId: string;
  name: string;
  dosage: string; // "500 mg", "2 tablets"
  frequency: string; // human label, e.g. "Twice daily"
  route?: string; // Oral / IV / IM / Subcutaneous / Inhalation
  times: string[]; // daily reminder times, "HH:mm" 24h
  startDate: string; // ISO date
  endDate: string; // ISO date
  notes?: string;
  createdAt: string;
}

export interface Dose {
  id: string;
  medicineId: string;
  patientId: string;
  scheduledAt: string; // ISO datetime the dose is due
  givenAt?: string | null; // ISO datetime actually administered
  status: DoseStatus;
  nurseId?: string | null;
  notes?: string | null;
  createdAt: string;
}

/** A Dose joined with its medicine + patient, used throughout the UI. */
export interface EnrichedDose extends Dose {
  medicine?: Medicine;
  patient?: Patient;
  nurse?: User;
}

// ----- Advanced / hospital-grade entities ------------------------------------

/** A nurse rostered to a ward + shift on a given date. */
export interface ShiftAssignment {
  id: string;
  nurseId: string;
  date: string; // YYYY-MM-DD
  shift: Shift;
  ward: string;
  createdAt: string;
}

/** Pharmacy stock for a medicine. `name` matches Medicine.name. */
export interface InventoryItem {
  id: string;
  name: string;
  form: string; // Tablet / Capsule / Syrup / Injection / Inhaler
  route?: string; // Oral / IV / IM / Subcutaneous / Inhalation
  quantity: number; // units currently in stock
  unit: string; // "tablets", "ml", "vials"
  reorderLevel: number; // low-stock threshold
  updatedAt: string;
}

export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[]; // daily reminder times "HH:mm"
  durationDays: number;
}

/** A doctor's prescription that can be activated into medicine schedules. */
export interface Prescription {
  id: string;
  patientId: string;
  doctorName: string;
  diagnosis: string;
  date: string; // YYYY-MM-DD
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  items: PrescriptionItem[];
  notes?: string;
  createdAt: string;
}

/** Escalation step or emergency broadcast. */
export type AlertType = "ESCALATION" | "EMERGENCY";

export interface Alert {
  id: string;
  type: AlertType;
  level?: 1 | 2 | 3; // escalation level (1 nurse, 2 head nurse, 3 doctor)
  targetRole?: Role; // who should respond
  doseId?: string;
  patientId?: string;
  code?: string; // emergency code, e.g. "Code Blue"
  ward?: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string | null;
  createdAt: string;
}
