import clsx from "clsx";
import { getMedicineVisual } from "@/lib/medicineIcons";

/** Coloured pill/syringe/drop chip that gives each medicine a visual identity. */
export function MedicineIcon({ name, size = 40 }: { name: string; size?: number }) {
  const { Icon, bg, text, ring } = getMedicineVisual(name);
  return (
    <span
      className={clsx("grid place-items-center rounded-xl ring-1", bg, text, ring)}
      style={{ width: size, height: size }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </span>
  );
}
