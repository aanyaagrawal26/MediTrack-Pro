"use client";

// =============================================================================
// ReminderEngine — the always-on alarm.
// -----------------------------------------------------------------------------
// Mounted once in the app shell so it runs on every page. Responsibilities:
//   1. Periodically materialise due doses (generateDoses).
//   2. Show a floating, pulsing panel listing every active (overdue) reminder.
//   3. Re-trigger a soft chime every cycle while reminders remain unconfirmed —
//      the alarm literally will not stop until a nurse verifies each dose.
//
// Nurses only see reminders for patients in their ward; admins see all.
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, ChevronDown, Megaphone, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { escalationLevel, generateDoses, getActiveReminders, runEscalation } from "@/lib/reminders";
import type { EnrichedDose } from "@/lib/types";
import { describeOverdue, formatTime } from "@/lib/utils";
import { speak, stopSpeaking } from "@/lib/voice";
import { ConfirmDoseModal } from "./ConfirmDoseModal";

const ESCALATION_CHIP: Record<number, string> = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-red-600 text-white",
};
const ESCALATION_TEXT: Record<number, string> = {
  1: "L1 nurse",
  2: "L2 head nurse",
  3: "L3 doctor",
};

const TICK_MS = 15_000; // how often we re-check for due doses

export function ReminderEngine() {
  const { user, wardScoped } = useAuth();
  const [open, setOpen] = useState(true);
  const [muted, setMuted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [selected, setSelected] = useState<EnrichedDose | null>(null);

  // Live list of active reminders, scoped to ward staff.
  const reminders = useStore<EnrichedDose[]>(() => {
    generateDoses(); // fill in any newly-due doses
    runEscalation(); // raise escalation alerts as thresholds are crossed
    const all = getActiveReminders();
    if (wardScoped && user?.ward) return all.filter((d) => d.patient?.ward === user.ward);
    return all;
  }, TICK_MS);

  const count = reminders.length;
  const audioRef = useRef<{ ctx: AudioContext | null }>({ ctx: null });

  // Re-chime whenever there are outstanding reminders (every TICK_MS).
  useEffect(() => {
    if (muted || count === 0) return;
    playChime(audioRef);
    const interval = setInterval(() => playChime(audioRef), TICK_MS);
    return () => clearInterval(interval);
  }, [count, muted]);

  // Spoken announcement of the most-overdue medicine while voice is enabled.
  useEffect(() => {
    if (!voiceOn || count === 0) {
      stopSpeaking();
      return;
    }
    const announce = () => {
      const top = reminders[0];
      if (top) {
        speak(
          `Medicine due. ${top.medicine?.name} for ${top.patient?.name}, bed ${top.patient?.bedNumber}. Please verify.`
        );
      }
    };
    announce();
    const id = setInterval(announce, TICK_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn, count]);

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 w-[min(92vw,380px)]">
        {/* Panel */}
        {open && (
          <div className="card mb-3 overflow-hidden shadow-pop">
            <div
              className={`flex items-center justify-between px-4 py-3 ${
                count > 0 ? "bg-red-600 text-white" : "bg-slate-800 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                {count > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                <span className="font-semibold">
                  {count > 0 ? `${count} reminder${count > 1 ? "s" : ""} need action` : "All clear"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVoiceOn((v) => !v)}
                  className={`rounded-md p-1.5 hover:bg-white/15 ${voiceOn ? "bg-white/20" : ""}`}
                  title={voiceOn ? "Turn off voice announcements" : "Turn on voice announcements"}
                >
                  <Megaphone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="rounded-md p-1.5 hover:bg-white/15"
                  title={muted ? "Unmute alarm" : "Mute alarm"}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 hover:bg-white/15"
                  title="Minimise"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[46vh] overflow-y-auto">
              {count === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  No medicines are overdue right now. The panel will alert you the moment a dose
                  becomes due.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {reminders.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="grid h-9 w-9 shrink-0 animate-pulseRing place-items-center rounded-full bg-red-100 text-red-600">
                        <BellRing className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {d.medicine?.name} {d.medicine?.dosage}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {d.patient?.name} · Bed {d.patient?.bedNumber} ·{" "}
                          {formatTime(d.scheduledAt)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-red-600">
                            {describeOverdue(d.scheduledAt)}
                          </p>
                          {escalationLevel(d.scheduledAt) > 0 && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                ESCALATION_CHIP[escalationLevel(d.scheduledAt)]
                              }`}
                            >
                              {ESCALATION_TEXT[escalationLevel(d.scheduledAt)]}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setSelected(d)} className="btn-success px-3 py-1.5">
                        Verify
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Floating toggle button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className={`ml-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-pop transition ${
            count > 0 ? "animate-pulseRing bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"
          }`}
          title="Reminders"
        >
          <span className="relative">
            {count > 0 ? <BellRing className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
            {count > 0 && (
              <span className="absolute -right-3 -top-3 grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-red-600 ring-2 ring-red-600">
                {count}
              </span>
            )}
          </span>
        </button>
      </div>

      <ConfirmDoseModal dose={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/**
 * Play a short two-tone chime using the Web Audio API (no audio file needed).
 * Wrapped in try/catch because browsers block audio until the first user
 * interaction — failing silently is fine.
 */
function playChime(ref: React.MutableRefObject<{ ctx: AudioContext | null }>) {
  try {
    if (!ref.current.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      ref.current.ctx = new Ctx();
    }
    const ctx = ref.current.ctx!;
    const now = ctx.currentTime;
    [880, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.18);
    });
  } catch {
    /* audio not available / blocked — ignore */
  }
}
