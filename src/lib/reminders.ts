// =============================================================================
// Reminder engine
// -----------------------------------------------------------------------------
// This is the brain of MediTrack Pro. It answers two questions:
//   1. "Which doses SHOULD exist?"  -> generateDoses() materialises a Dose row
//      for every medicine time, for every active day. These rows are the source
//      of truth that survives reloads.
//   2. "Which reminders are firing right now?" -> getActiveReminders() returns
//      every PENDING dose whose scheduled time has passed. Crucially, a dose
//      stays PENDING — and therefore keeps alarming — until a nurse explicitly
//      confirms or marks it missed. Nothing here ever auto-dismisses a reminder.
//
// HOW THE LOOP WORKS (see ReminderEngine component):
//   - Every ~20s the UI calls generateDoses() (fills in any new due times) and
//     re-reads active reminders. Overdue minutes are computed from `scheduledAt`
//     vs `now`, so the badge keeps climbing until the dose is acted on.
// =============================================================================

import type { Dose, DoseStatus, EnrichedDose, Medicine } from "./types";
import {
  createAlert,
  getDoses,
  getMedicines,
  getPatients,
  getPatientById,
  getMedicineById,
  getUserById,
  getUsers,
  hasEscalationAlert,
  setDoses,
} from "./store";
import { ESCALATION_STEPS } from "./constants";
import { combineDateAndTime, toDateKey, uid } from "./utils";

/** How long after the scheduled time a "given" dose is still considered on time. */
export const GRACE_MINUTES = 15;

/**
 * Make sure a Dose row exists for every active medicine time across a window of
 * days (yesterday → +1 day by default, so doses near midnight and overdue doses
 * from earlier are all represented). Idempotent: never creates duplicates.
 *
 * Returns true if anything new was created (handy for triggering a re-render).
 *
 * Defaults to today + tomorrow only. Past days are NOT auto-generated — that
 * would turn every historical schedule time into a perpetually "overdue"
 * pending dose. History comes from the seed / real confirmations instead.
 */
export function generateDoses(daysBack = 0, daysForward = 1): boolean {
  const medicines = getMedicines();
  const existing = getDoses();

  // Fast lookup of already-materialised doses by "medicineId|isoTime".
  const seen = new Set(existing.map((d) => `${d.medicineId}|${d.scheduledAt}`));
  const created: Dose[] = [];

  const today = new Date();

  for (let offset = -daysBack; offset <= daysForward; offset++) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const dayKey = toDateKey(day);

    for (const med of medicines) {
      if (!isMedicineActiveOn(med, day)) continue;

      for (const time of med.times) {
        const scheduled = combineDateAndTime(dayKey, time);
        const iso = scheduled.toISOString();
        const key = `${med.id}|${iso}`;
        if (seen.has(key)) continue;

        seen.add(key);
        created.push({
          id: uid("dose"),
          medicineId: med.id,
          patientId: med.patientId,
          scheduledAt: iso,
          givenAt: null,
          status: "PENDING",
          nurseId: null,
          notes: null,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  if (created.length > 0) {
    setDoses([...existing, ...created]);
    return true;
  }
  return false;
}

/** Is a medicine's active date range covering this day? */
function isMedicineActiveOn(med: Medicine, day: Date): boolean {
  const start = new Date(med.startDate);
  const end = new Date(med.endDate);
  // Compare on date only (ignore time-of-day).
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d >= s && d <= e;
}

// ----- Enrichment ------------------------------------------------------------

/** Attach medicine, patient and nurse objects to a dose for display. */
export function enrichDose(dose: Dose): EnrichedDose {
  return {
    ...dose,
    medicine: getMedicineById(dose.medicineId),
    patient: getPatientById(dose.patientId),
    nurse: getUserById(dose.nurseId),
  };
}

/**
 * Batch version of enrichDose. Builds id→object maps ONCE instead of doing a
 * localStorage read + linear scan per dose — essential now that there are
 * hundreds of doses, 150 medicines and 50 patients.
 */
export function getEnrichedDoses(): EnrichedDose[] {
  const medMap = new Map(getMedicines().map((m) => [m.id, m]));
  const patMap = new Map(getPatients().map((p) => [p.id, p]));
  const userMap = new Map(getUsers().map((u) => [u.id, u]));
  return getDoses().map((d) => ({
    ...d,
    medicine: medMap.get(d.medicineId),
    patient: patMap.get(d.patientId),
    nurse: d.nurseId ? userMap.get(d.nurseId) ?? undefined : undefined,
  }));
}

// ----- Queries ---------------------------------------------------------------

/**
 * Active reminders = PENDING doses whose scheduled time has already arrived.
 * These are the ones whose alarm must keep ringing. Sorted most-overdue first.
 */
export function getActiveReminders(now = new Date()): EnrichedDose[] {
  return getEnrichedDoses()
    .filter((d) => d.status === "PENDING" && new Date(d.scheduledAt) <= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

/** Upcoming (still PENDING but not due yet) doses for today. */
export function getUpcomingToday(now = new Date()): EnrichedDose[] {
  const key = toDateKey(now);
  return getEnrichedDoses()
    .filter(
      (d) =>
        d.status === "PENDING" &&
        new Date(d.scheduledAt) > now &&
        toDateKey(new Date(d.scheduledAt)) === key
    )
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

/** Every dose scheduled for a given calendar day. */
export function getDosesForDay(day = new Date()): EnrichedDose[] {
  const key = toDateKey(day);
  return getEnrichedDoses()
    .filter((d) => toDateKey(new Date(d.scheduledAt)) === key)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

// ----- Dashboard statistics --------------------------------------------------

export interface DashboardStats {
  pending: number; // due now / overdue, awaiting confirmation
  upcoming: number; // later today, not due yet
  given: number;
  delayed: number;
  missed: number;
  total: number;
  adherenceRate: number; // % of today's actioned doses given on time
}

export function getTodayStats(now = new Date()): DashboardStats {
  const doses = getDosesForDay(now);
  const isOverdue = (d: EnrichedDose) =>
    d.status === "PENDING" && new Date(d.scheduledAt) <= now;
  const isUpcoming = (d: EnrichedDose) =>
    d.status === "PENDING" && new Date(d.scheduledAt) > now;

  const count = (status: DoseStatus) => doses.filter((d) => d.status === status).length;

  const given = count("GIVEN");
  const delayed = count("DELAYED");
  const missed = count("MISSED");
  const actioned = given + delayed + missed;

  return {
    pending: doses.filter(isOverdue).length,
    upcoming: doses.filter(isUpcoming).length,
    given,
    delayed,
    missed,
    total: doses.length,
    adherenceRate: actioned === 0 ? 0 : Math.round((given / actioned) * 100),
  };
}

/** Per-patient breakdown for the dashboard table. */
export interface PatientStatus {
  patientId: string;
  pending: number;
  given: number;
  delayed: number;
  missed: number;
  upcoming: number;
}

export function getPatientStatuses(now = new Date()): PatientStatus[] {
  const doses = getDosesForDay(now);
  const map = new Map<string, PatientStatus>();

  for (const d of doses) {
    if (!map.has(d.patientId)) {
      map.set(d.patientId, {
        patientId: d.patientId,
        pending: 0,
        given: 0,
        delayed: 0,
        missed: 0,
        upcoming: 0,
      });
    }
    const row = map.get(d.patientId)!;
    if (d.status === "PENDING") {
      if (new Date(d.scheduledAt) <= now) row.pending++;
      else row.upcoming++;
    } else if (d.status === "GIVEN") row.given++;
    else if (d.status === "DELAYED") row.delayed++;
    else if (d.status === "MISSED") row.missed++;
  }

  return Array.from(map.values());
}

// ----- Escalation engine -----------------------------------------------------
// 15 min late → remind nurse (L1), 30 min → head nurse (L2), 60 min → doctor (L3).

/** Minutes a pending dose is overdue (0 if not yet due). */
export function minutesOverdue(scheduledAt: string, now = new Date()): number {
  return Math.max(0, Math.round((now.getTime() - new Date(scheduledAt).getTime()) / 60000));
}

/** Highest escalation level a dose has currently crossed (0–3). */
export function escalationLevel(scheduledAt: string, now = new Date()): 0 | 1 | 2 | 3 {
  const min = minutesOverdue(scheduledAt, now);
  if (min >= 60) return 3;
  if (min >= 30) return 2;
  if (min >= 15) return 1;
  return 0;
}

/**
 * Walk every overdue dose and raise an escalation Alert for each threshold it
 * has crossed but not yet been alerted for. Idempotent (one alert per
 * dose+level). Returns true if any new alert was created.
 */
export function runEscalation(now = new Date()): boolean {
  let created = false;
  for (const d of getActiveReminders(now)) {
    const min = minutesOverdue(d.scheduledAt, now);
    for (const step of ESCALATION_STEPS) {
      if (min >= step.minutes && !hasEscalationAlert(d.id, step.level)) {
        createAlert({
          type: "ESCALATION",
          level: step.level,
          targetRole: step.targetRole,
          doseId: d.id,
          patientId: d.patientId,
          ward: d.patient?.ward,
          message: `${step.label} — ${d.medicine?.name} ${d.medicine?.dosage} for ${d.patient?.name} (Bed ${d.patient?.bedNumber}) is ${min} min overdue.`,
        });
        created = true;
      }
    }
  }
  return created;
}
