"use client";

import { useState } from "react";
import { Siren } from "lucide-react";
import { Modal } from "./Modal";
import { useAuth } from "@/lib/auth";
import { createAlert } from "@/lib/store";
import { EMERGENCY_CODES, WARD_NAMES } from "@/lib/constants";
import { speak } from "@/lib/voice";

/**
 * Panic button. Raises a hospital-wide emergency code that is broadcast to every
 * logged-in screen via the alert banner, and announced aloud.
 */
export function EmergencyButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(EMERGENCY_CODES[0].code);
  const [ward, setWard] = useState(user?.ward ?? WARD_NAMES[0]);
  const [message, setMessage] = useState("");

  const raise = () => {
    const selected = EMERGENCY_CODES.find((c) => c.code === code)!;
    createAlert({
      type: "EMERGENCY",
      code,
      ward,
      message: message.trim() || `${code} — ${selected.desc} in ${ward}`,
    });
    speak(`Attention. ${code} declared in ${ward}.`);
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
        title="Raise emergency alert"
      >
        <Siren className="h-4 w-4" />
        <span className="hidden sm:inline">Emergency</span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Raise emergency alert"
        subtitle="This broadcasts to every active screen immediately."
      >
        <div className="space-y-4">
          <div>
            <label className="label">Emergency code</label>
            <div className="grid grid-cols-2 gap-2">
              {EMERGENCY_CODES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCode(c.code)}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    code === c.code
                      ? "border-red-500 bg-red-50 dark:bg-red-500/10"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.code}
                  </span>
                  <p className="mt-1 text-xs text-slate-500">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Location / ward</label>
            <select className="input" value={ward} onChange={(e) => setWard(e.target.value)}>
              {WARD_NAMES.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Details (optional)</label>
            <input
              className="input"
              placeholder="e.g. Bed A-12, patient unresponsive"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={raise} className="btn-danger">
              <Siren className="h-4 w-4" />
              Broadcast alert
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
