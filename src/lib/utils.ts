// =============================================================================
// Small date / formatting helpers used across the app.
// Kept dependency-free (no date library) so the project stays lightweight.
// =============================================================================

/** Generate a reasonably unique id without pulling in a uuid dependency. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

/** "2026-06-15" for a given Date (local time). */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Combine a date key ("2026-06-15") + time ("08:30") into a local Date. */
export function combineDateAndTime(dateKey: string, time: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

/** Format an ISO string / Date as "08:30 AM". Returns "—" when empty. */
export function formatTime(value?: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Format as "Mon, 15 Jun • 08:30 AM". */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString([], {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format as "15 Jun 2026". */
export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Human "5 min late" / "2 min early" relative to scheduled time. */
export function describeDelay(scheduledAt: string, givenAt?: string | null): string {
  if (!givenAt) return "";
  const diffMin = Math.round(
    (new Date(givenAt).getTime() - new Date(scheduledAt).getTime()) / 60000
  );
  if (diffMin <= 0) return "On time";
  if (diffMin < 60) return `${diffMin} min late`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `${h}h ${m}m late`;
}

/** How long a pending dose has been overdue, e.g. "12 min overdue". */
export function describeOverdue(scheduledAt: string, now = new Date()): string {
  const diffMin = Math.round((now.getTime() - new Date(scheduledAt).getTime()) / 60000);
  if (diffMin <= 0) {
    const upcoming = Math.abs(diffMin);
    return upcoming === 0 ? "Due now" : `in ${upcoming} min`;
  }
  if (diffMin < 60) return `${diffMin} min overdue`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `${h}h ${m}m overdue`;
}
