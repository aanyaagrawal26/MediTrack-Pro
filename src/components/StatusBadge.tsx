import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { DoseStatus } from "@/lib/types";

// A dose that is PENDING but already past its time is shown as "Overdue" to the
// user even though its stored status is still PENDING (it has not been actioned).
export type DisplayStatus = DoseStatus | "OVERDUE" | "UPCOMING";

const CONFIG: Record<
  DisplayStatus,
  { label: string; className: string; Icon: typeof Clock }
> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800", Icon: Clock },
  UPCOMING: { label: "Upcoming", className: "bg-slate-100 text-slate-600", Icon: Clock },
  OVERDUE: {
    label: "Overdue",
    className: "bg-red-100 text-red-700 ring-1 ring-red-300",
    Icon: AlertTriangle,
  },
  GIVEN: { label: "Given", className: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  DELAYED: { label: "Delayed", className: "bg-orange-100 text-orange-700", Icon: AlertTriangle },
  MISSED: { label: "Missed", className: "bg-red-100 text-red-700", Icon: XCircle },
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const { label, className, Icon } = CONFIG[status];
  return (
    <span className={clsx("badge", className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/** Resolve a stored dose status into the richer display status. */
export function resolveDisplayStatus(
  status: DoseStatus,
  scheduledAt: string,
  now = new Date()
): DisplayStatus {
  if (status !== "PENDING") return status;
  return new Date(scheduledAt) <= now ? "OVERDUE" : "UPCOMING";
}
