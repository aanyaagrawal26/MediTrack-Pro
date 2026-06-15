"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { createUser, getUsers, updateUser } from "@/lib/store";
import { WARD_NAMES } from "@/lib/constants";
import type { User } from "@/lib/types";

const EMPTY = { name: "", username: "", password: "", ward: "General Ward A" };

/** Add / edit a nurse account (admin only). */
export function NurseFormModal({
  open,
  onClose,
  nurse,
}: {
  open: boolean;
  onClose: () => void;
  nurse?: User | null;
}) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (nurse) {
      setForm({ name: nurse.name, username: nurse.username, password: nurse.password, ward: nurse.ward ?? "General Ward A" });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [nurse, open]);

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      setError("Name, username and password are required.");
      return;
    }
    // Enforce a unique username (excluding the nurse being edited).
    const clash = getUsers().some(
      (u) => u.username.toLowerCase() === form.username.toLowerCase().trim() && u.id !== nurse?.id
    );
    if (clash) {
      setError("That username is already taken.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password,
      ward: form.ward,
      role: "NURSE" as const,
    };
    if (nurse) updateUser(nurse.id, payload);
    else createUser(payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={nurse ? "Edit nurse" : "Add nurse"}
      subtitle="Nurses can verify medicines and view patients in their assigned ward."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" className="sm:col-span-2">
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Username">
          <input className="input" value={form.username} onChange={(e) => set("username", e.target.value)} />
        </Field>
        <Field label="Password">
          <input className="input" value={form.password} onChange={(e) => set("password", e.target.value)} />
        </Field>
        <Field label="Assigned ward" className="sm:col-span-2">
          <select className="input" value={form.ward} onChange={(e) => set("ward", e.target.value)}>
            {WARD_NAMES.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </Field>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button onClick={save} className="btn-primary">
          {nurse ? "Save changes" : "Add nurse"}
        </button>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
