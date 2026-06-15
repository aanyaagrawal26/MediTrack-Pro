import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

/** Coloured metric tile used on the dashboard. */
export function StatCard({
  label,
  value,
  Icon,
  tone = "slate",
  hint,
}: {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  tone?: "amber" | "green" | "orange" | "red" | "brand" | "slate";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    amber: "from-amber-50 to-white text-amber-600 ring-amber-100",
    green: "from-green-50 to-white text-green-600 ring-green-100",
    orange: "from-orange-50 to-white text-orange-600 ring-orange-100",
    red: "from-red-50 to-white text-red-600 ring-red-100",
    brand: "from-brand-50 to-white text-brand-600 ring-brand-100",
    slate: "from-slate-50 to-white text-slate-600 ring-slate-100",
  };

  return (
    <div className="card overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={clsx(
            "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b ring-1",
            tones[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
