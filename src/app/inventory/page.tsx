"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MedicineIcon } from "@/components/MedicineIcon";
import { Modal } from "@/components/Modal";
import { Reveal } from "@/components/motion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventory,
  updateInventoryItem,
} from "@/lib/store";
import type { InventoryItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function InventoryPage() {
  return (
    <AppShell>
      <Inventory />
    </AppShell>
  );
}

function Inventory() {
  const { canManage } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!canManage) router.replace("/dashboard");
  }, [canManage, router]);

  const items = useStore(() => getInventory());

  const lowStock = items.filter((i) => i.quantity <= i.reorderLevel);

  const remove = (i: InventoryItem) => {
    if (confirm(`Remove ${i.name} from inventory?`)) deleteInventoryItem(i.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Package className="h-6 w-6 text-brand-600" />
            Pharmacy Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {items.length} items · stock auto-decrements as nurses give medicines
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>

      {/* Low-stock banner */}
      {lowStock.length > 0 && (
        <Reveal className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            <strong>{lowStock.length}</strong> item{lowStock.length > 1 ? "s are" : " is"} at or
            below reorder level: {lowStock.map((i) => i.name).join(", ")}.
          </span>
        </Reveal>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i, idx) => {
          const pct = Math.min(100, Math.round((i.quantity / Math.max(1, i.reorderLevel * 3)) * 100));
          const low = i.quantity <= i.reorderLevel;
          return (
            <Reveal key={i.id} delay={idx} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MedicineIcon name={i.name} size={44} />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{i.name}</p>
                    <p className="text-xs text-slate-500">
                      {i.form}
                      {i.route ? ` · ${i.route}` : ""}
                    </p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(i);
                        setShowForm(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(i)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-end justify-between">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {i.quantity}
                  <span className="ml-1 text-sm font-medium text-slate-400">{i.unit}</span>
                </p>
                {low ? (
                  <span className="badge bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                    Low stock
                  </span>
                ) : (
                  <span className="badge bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                    In stock
                  </span>
                )}
              </div>

              {/* Stock level bar */}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${low ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Reorder at {i.reorderLevel} · updated {formatDateTime(i.updatedAt)}
              </p>
            </Reveal>
          );
        })}
      </div>

      {showForm && (
        <InventoryForm item={editing} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function InventoryForm({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  const [form, setForm] = useState({
    name: item?.name ?? "",
    form: item?.form ?? "Tablet",
    quantity: String(item?.quantity ?? 0),
    unit: item?.unit ?? "tablets",
    reorderLevel: String(item?.reorderLevel ?? 20),
  });
  const [error, setError] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) return setError("Medicine name is required.");
    const payload = {
      name: form.name.trim(),
      form: form.form,
      quantity: Number(form.quantity) || 0,
      unit: form.unit.trim() || "units",
      reorderLevel: Number(form.reorderLevel) || 0,
    };
    if (item) updateInventoryItem(item.id, payload);
    else createInventoryItem(payload);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={item ? "Edit stock item" : "Add stock item"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Medicine name</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Form</label>
          <select className="input" value={form.form} onChange={(e) => set("form", e.target.value)}>
            <option>Tablet</option>
            <option>Capsule</option>
            <option>Syrup</option>
            <option>Injection</option>
          </select>
        </div>
        <div>
          <label className="label">Unit</label>
          <input className="input" value={form.unit} onChange={(e) => set("unit", e.target.value)} />
        </div>
        <div>
          <label className="label">Quantity in stock</label>
          <input type="number" className="input" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
        </div>
        <div>
          <label className="label">Reorder level</label>
          <input type="number" className="input" value={form.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)} />
        </div>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={save} className="btn-primary">{item ? "Save" : "Add item"}</button>
      </div>
    </Modal>
  );
}
