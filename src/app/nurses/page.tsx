"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Stethoscope, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { NurseFormModal } from "@/components/NurseFormModal";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { deleteUser, getDoses, getNurses } from "@/lib/store";
import type { User } from "@/lib/types";

export default function NursesPage() {
  return (
    <AppShell>
      <Nurses />
    </AppShell>
  );
}

function Nurses() {
  const { isAdmin, user } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isAdmin) router.replace("/dashboard");
  }, [isAdmin, router]);

  const { nurses, doses } = useStore(() => ({ nurses: getNurses(), doses: getDoses() }));

  const remove = (n: User) => {
    if (confirm(`Remove nurse ${n.name}? Their past confirmations stay in the logs.`)) deleteUser(n.id);
  };

  // Count how many doses each nurse has confirmed (for a quick activity stat).
  const confirmCount = (id: string) =>
    doses.filter((d) => d.nurseId === id && (d.status === "GIVEN" || d.status === "DELAYED")).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Stethoscope className="h-6 w-6 text-brand-600" />
            Nurses
          </h1>
          <p className="text-sm text-slate-500">{nurses.length} nurse accounts</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add nurse
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nurses.map((n) => (
          <div key={n.id} className="card flex items-start justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">
                {n.name.charAt(0)}
              </span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{n.name}</p>
                <p className="text-xs text-slate-500">@{n.username}</p>
                <span className="mt-1.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {n.ward}
                </span>
                <p className="mt-2 text-xs text-slate-400">
                  {confirmCount(n.id)} doses verified
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditing(n);
                  setShowForm(true);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-200"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(n)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {nurses.length === 0 && (
          <div className="card col-span-full grid place-items-center px-6 py-16 text-center">
            <Stethoscope className="h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-600">No nurses yet</p>
            <p className="text-sm text-slate-400">Add a nurse so they can verify medicines.</p>
          </div>
        )}
      </div>

      <NurseFormModal open={showForm} nurse={editing} onClose={() => setShowForm(false)} />
    </div>
  );
}
