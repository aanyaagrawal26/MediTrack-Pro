// =============================================================================
// Maps a medicine to a visual identity (icon + colour) so every drug looks
// distinct in the UI — like real pharmacy software. Deterministic: the same
// name always produces the same look.
// =============================================================================

import { Pill, Syringe, Droplet, Tablets, FlaskConical, type LucideIcon } from "lucide-react";

export interface MedicineVisual {
  Icon: LucideIcon;
  /** Tailwind text + bg classes for the icon chip. */
  bg: string;
  text: string;
  ring: string;
  form: string;
}

// Known forms by keyword → icon.
const FORM_RULES: { match: RegExp; Icon: LucideIcon; form: string }[] = [
  { match: /inject|vaccine|insulin|heparin|azithro|cef/i, Icon: Syringe, form: "Injection" },
  { match: /syrup|solution|drop|suspension|cough/i, Icon: Droplet, form: "Syrup" },
  { match: /capsule|omeprazole|amoxi/i, Icon: FlaskConical, form: "Capsule" },
  { match: /tablet|metformin|amlodipine|paracetamol|aspirin|furosemide/i, Icon: Tablets, form: "Tablet" },
];

// A small palette; index chosen from a hash of the name.
const PALETTE = [
  { bg: "bg-blue-100 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-300", ring: "ring-blue-200 dark:ring-blue-500/30" },
  { bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-500/30" },
  { bg: "bg-violet-100 dark:bg-violet-500/15", text: "text-violet-600 dark:text-violet-300", ring: "ring-violet-200 dark:ring-violet-500/30" },
  { bg: "bg-amber-100 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-300", ring: "ring-amber-200 dark:ring-amber-500/30" },
  { bg: "bg-rose-100 dark:bg-rose-500/15", text: "text-rose-600 dark:text-rose-300", ring: "ring-rose-200 dark:ring-rose-500/30" },
  { bg: "bg-cyan-100 dark:bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-300", ring: "ring-cyan-200 dark:ring-cyan-500/30" },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function getMedicineVisual(name: string): MedicineVisual {
  const rule = FORM_RULES.find((r) => r.match.test(name));
  const Icon = rule?.Icon ?? Pill;
  const form = rule?.form ?? "Tablet";
  const palette = PALETTE[hash(name) % PALETTE.length];
  return { Icon, form, ...palette };
}
