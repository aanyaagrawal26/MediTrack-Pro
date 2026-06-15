"use client";

import { useState } from "react";
import { ClipboardList, Download, FileText, Filter } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, resolveDisplayStatus, type DisplayStatus } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { generateDoses, getEnrichedDoses } from "@/lib/reminders";
import { getNurses, getMedicines, getPatients } from "@/lib/store";
import type { EnrichedDose } from "@/lib/types";
import { describeDelay, formatDateTime, formatTime, toDateKey } from "@/lib/utils";

// Cap rendered rows so a busy hospital (hundreds of doses) stays snappy.
// Export (CSV/PDF) always uses the full filtered set.
const ROW_LIMIT = 250;

export default function LogsPage() {
  return (
    <AppShell>
      <Logs />
    </AppShell>
  );
}

function Logs() {
  const { isNurse, user } = useAuth();

  const [patientId, setPatientId] = useState("ALL");
  const [nurseId, setNurseId] = useState("ALL");
  const [medicineName, setMedicineName] = useState("ALL");
  const [status, setStatus] = useState<DisplayStatus | "ALL">("ALL");
  const [date, setDate] = useState(""); // empty = any date

  const { doses, patients, nurses, medicines } = useStore(() => {
    generateDoses();
    return {
      doses: getEnrichedDoses(),
      patients: getPatients(),
      nurses: getNurses(),
      medicines: getMedicines(),
    };
  });

  // Unique medicine names for the dropdown.
  const medicineNames = Array.from(new Set(medicines.map((m) => m.name))).sort();
  const now = new Date();

  const rows = doses
    .filter((d) => (isNurse && user?.ward ? d.patient?.ward === user.ward : true))
    .filter((d) => (patientId === "ALL" ? true : d.patientId === patientId))
    .filter((d) => (nurseId === "ALL" ? true : d.nurseId === nurseId))
    .filter((d) => (medicineName === "ALL" ? true : d.medicine?.name === medicineName))
    .filter((d) =>
      status === "ALL" ? true : resolveDisplayStatus(d.status, d.scheduledAt, now) === status
    )
    .filter((d) => (date ? toDateKey(new Date(d.scheduledAt)) === date : true))
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const resetFilters = () => {
    setPatientId("ALL");
    setNurseId("ALL");
    setMedicineName("ALL");
    setStatus("ALL");
    setDate("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <ClipboardList className="h-6 w-6 text-brand-600" />
            Medicine Logs & History
          </h1>
          <p className="text-sm text-slate-500">
            Full administration audit trail · {rows.length} record{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCsv(rows)} className="btn-ghost">
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button onClick={() => exportPdf(rows)} className="btn-primary">
            <FileText className="h-4 w-4" />
            PDF report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Filter className="h-4 w-4" /> Filters
          <button onClick={resetFilters} className="ml-auto text-xs font-semibold text-brand-600 hover:underline">
            Reset
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select label="Patient" value={patientId} onChange={setPatientId}>
            <option value="ALL">All patients</option>
            {patients
              .filter((p) => (isNurse && user?.ward ? p.ward === user.ward : true))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </Select>
          <Select label="Nurse" value={nurseId} onChange={setNurseId}>
            <option value="ALL">All nurses</option>
            {nurses.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </Select>
          <Select label="Medicine" value={medicineName} onChange={setMedicineName}>
            <option value="ALL">All medicines</option>
            {medicineNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
          <Select label="Status" value={status} onChange={(v) => setStatus(v as DisplayStatus | "ALL")}>
            <option value="ALL">All statuses</option>
            <option value="OVERDUE">Overdue</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="GIVEN">Given</option>
            <option value="DELAYED">Delayed</option>
            <option value="MISSED">Missed</option>
          </Select>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Medicine</th>
                <th className="px-5 py-3 font-semibold">Scheduled</th>
                <th className="px-5 py-3 font-semibold">Given</th>
                <th className="px-5 py-3 font-semibold">Nurse</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {rows.slice(0, ROW_LIMIT).map((d) => (
                <tr key={d.id} className="align-top hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{d.patient?.name}</p>
                    <p className="text-xs text-slate-400">
                      {d.patient?.ward} · {d.patient?.bedNumber}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-700 dark:text-slate-200">{d.medicine?.name}</p>
                    <p className="text-xs text-slate-400">{d.medicine?.dosage}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{formatDateTime(d.scheduledAt)}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {d.givenAt ? (
                      <>
                        {formatTime(d.givenAt)}
                        <p className="text-xs text-slate-400">{describeDelay(d.scheduledAt, d.givenAt)}</p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{d.nurse?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={resolveDisplayStatus(d.status, d.scheduledAt, now)} />
                  </td>
                  <td className="max-w-[180px] px-5 py-3 text-xs text-slate-500">{d.notes || "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {rows.length > ROW_LIMIT && (
          <p className="border-t border-slate-100 px-5 py-3 text-center text-xs text-slate-500 dark:border-slate-700/60">
            Showing the most recent {ROW_LIMIT} of {rows.length} records. Narrow the filters, or use
            Export to get the full set.
          </p>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}

/** Download the currently-filtered rows as a CSV file. */
function exportCsv(rows: EnrichedDose[]) {
  const header = [
    "Patient",
    "Patient ID",
    "Medicine",
    "Dose",
    "Scheduled",
    "Given",
    "Nurse",
    "Status",
    "Notes",
  ];
  const body = rows.map((d) => [
    d.patient?.name ?? "",
    d.patientId,
    d.medicine?.name ?? "",
    d.medicine?.dosage ?? "",
    new Date(d.scheduledAt).toLocaleString(),
    d.givenAt ? new Date(d.givenAt).toLocaleString() : "",
    d.nurse?.name ?? "",
    d.status,
    (d.notes ?? "").replace(/"/g, '""'),
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medicine-logs-${toDateKey(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Generate a polished, branded PDF report of the filtered logs. */
async function exportPdf(rows: EnrichedDose[]) {
  // Dynamic import keeps these browser-only libs out of the server bundle.
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  const generated = new Date().toLocaleString();

  // Header band
  doc.setFillColor(23, 99, 245);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text("MediTrack Pro — Medicine Administration Report", 14, 14);

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.text(`Generated: ${generated}   |   ${rows.length} record(s)`, 14, 29);

  autoTable(doc, {
    startY: 34,
    head: [["Patient", "Ward/Bed", "Medicine", "Scheduled", "Given", "Nurse", "Status", "Notes"]],
    body: rows.map((d) => [
      d.patient?.name ?? "",
      `${d.patient?.ward ?? ""} ${d.patient?.bedNumber ?? ""}`,
      `${d.medicine?.name ?? ""} ${d.medicine?.dosage ?? ""}`,
      new Date(d.scheduledAt).toLocaleString(),
      d.givenAt ? new Date(d.givenAt).toLocaleString() : "—",
      d.nurse?.name ?? "—",
      d.status,
      d.notes ?? "",
    ]),
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [23, 99, 245], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [243, 246, 251] },
    // Tint the Status cell by value for an at-a-glance report.
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        const v = String(data.cell.raw);
        const map: Record<string, [number, number, number]> = {
          GIVEN: [22, 163, 74],
          DELAYED: [234, 88, 12],
          MISSED: [220, 38, 38],
          PENDING: [245, 158, 11],
        };
        if (map[v]) {
          data.cell.styles.textColor = map[v];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  doc.save(`medicine-logs-${toDateKey(new Date())}.pdf`);
}
