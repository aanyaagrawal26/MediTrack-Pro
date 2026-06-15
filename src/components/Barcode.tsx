"use client";

// =============================================================================
// A lightweight faux-barcode renderer (Code-128 look-alike). It is decorative
// but deterministic: the same code always produces the same bars, so it reads
// like a real medicine label. Used in the barcode-verification UI.
// =============================================================================

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Build a pseudo-random but stable set of bar widths from the code string. */
function bars(code: string, count = 48): number[] {
  let seed = hash(code);
  const widths: number[] = [];
  for (let i = 0; i < count; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    widths.push(1 + (seed % 4)); // bar width 1–4px
  }
  return widths;
}

export function Barcode({ code, height = 64 }: { code: string; height?: number }) {
  const widths = bars(code);
  return (
    <div className="inline-block">
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {widths.map((w, i) => (
          <span
            key={i}
            className="bg-slate-900 dark:bg-slate-100"
            style={{ width: w, height: i % 7 === 0 ? height : height - 8 }}
          />
        ))}
      </div>
      <p className="mt-1 text-center font-mono text-[11px] tracking-[0.3em] text-slate-600 dark:text-slate-300">
        {code}
      </p>
    </div>
  );
}

/** Stable scannable code for a medicine (what the nurse "scans"). */
export function medicineCode(medicineId: string): string {
  return `MED-${(hash(medicineId) % 100000000).toString().padStart(8, "0")}`;
}
