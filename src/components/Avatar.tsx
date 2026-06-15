"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

// Deterministic gradient avatar (falls back from photo to initials).
const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * Patient / staff avatar. Shows the uploaded photo if present, otherwise a
 * coloured gradient with initials — always looks polished, never broken.
 */
export function Avatar({
  name,
  photoUrl,
  size = 44,
  className,
  ring = true,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const grad = GRADIENTS[hash(name) % GRADIENTS.length];
  const fontSize = Math.round(size * 0.4);

  // Track image load failure so we can fall back to initials (offline-safe).
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photoUrl]);
  const showPhoto = !!photoUrl && !failed;

  return (
    <span
      className={clsx(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-bold text-white",
        ring && "ring-2 ring-white shadow-sm dark:ring-slate-800",
        !showPhoto && `bg-gradient-to-br ${grad}`,
        className
      )}
      style={{ width: size, height: size, fontSize }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl as string}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
