// =============================================================================
// Voice alarm using the browser's built-in Speech Synthesis API. No audio
// files or network needed. Used by the ReminderEngine to speak overdue
// medicines out loud — handy in a noisy ward.
// =============================================================================

const isBrowser = typeof window !== "undefined";

/** Speak a message aloud. Cancels anything currently being spoken. */
export function speak(message: string): void {
  if (!isBrowser || !("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel(); // avoid overlapping announcements
    const utter = new SpeechSynthesisUtterance(message);
    utter.rate = 0.98;
    utter.pitch = 1;
    utter.volume = 1;
    // Prefer a clear English voice if available.
    const voice = synth.getVoices().find((v) => /en[-_]/i.test(v.lang));
    if (voice) utter.voice = voice;
    synth.speak(utter);
  } catch {
    /* speech not available — ignore */
  }
}

export function stopSpeaking(): void {
  if (!isBrowser || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
