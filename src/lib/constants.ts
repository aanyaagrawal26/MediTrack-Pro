// =============================================================================
// Static hospital configuration shared across the app.
// =============================================================================

import type { Shift } from "./types";

/** Wards and their physical bed capacity (used by the bed-occupancy tracker). */
export interface WardConfig {
  name: string;
  prefix: string; // bed label prefix, e.g. "A" -> A-01
  beds: number;
}

// 8 wards · 120 beds total — a mid-to-large hospital footprint.
export const WARDS: WardConfig[] = [
  { name: "General Ward A", prefix: "A", beds: 18 },
  { name: "General Ward B", prefix: "B", beds: 18 },
  { name: "ICU", prefix: "ICU", beds: 12 },
  { name: "Cardiac Care (CCU)", prefix: "CCU", beds: 12 },
  { name: "Pediatrics", prefix: "PED", beds: 16 },
  { name: "Maternity", prefix: "MAT", beds: 14 },
  { name: "Emergency", prefix: "ER", beds: 16 },
  { name: "Orthopedics", prefix: "ORT", beds: 14 },
];

export const WARD_NAMES = WARDS.map((w) => w.name);

/** Generate the bed labels for a ward, e.g. ["A-01", "A-02", ...]. */
export function bedLabels(ward: WardConfig): string[] {
  return Array.from({ length: ward.beds }, (_, i) => `${ward.prefix}-${String(i + 1).padStart(2, "0")}`);
}

export const SHIFTS: { key: Shift; label: string; window: string; color: string }[] = [
  { key: "MORNING", label: "Morning", window: "07:00 – 15:00", color: "amber" },
  { key: "EVENING", label: "Evening", window: "15:00 – 23:00", color: "violet" },
  { key: "NIGHT", label: "Night", window: "23:00 – 07:00", color: "indigo" },
];

/** Escalation thresholds (minutes overdue → who gets alerted). */
export const ESCALATION_STEPS = [
  { level: 1 as const, minutes: 15, targetRole: "NURSE" as const, label: "Remind nurse" },
  { level: 2 as const, minutes: 30, targetRole: "HEAD_NURSE" as const, label: "Alert head nurse" },
  { level: 3 as const, minutes: 60, targetRole: "DOCTOR" as const, label: "Alert doctor" },
];

/** Emergency codes for the panic button. */
export const EMERGENCY_CODES = [
  { code: "Code Blue", desc: "Cardiac / respiratory arrest", color: "#2563eb" },
  { code: "Code Red", desc: "Fire", color: "#dc2626" },
  { code: "Code Pink", desc: "Infant / child emergency", color: "#db2777" },
  { code: "Rapid Response", desc: "Patient deteriorating", color: "#ea580c" },
];
