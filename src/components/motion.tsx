"use client";

// =============================================================================
// Thin Framer Motion wrappers so pages can add smooth, consistent animations
// without repeating variants everywhere.
// =============================================================================

import { motion, type HTMLMotionProps } from "framer-motion";

/** Fade + rise in. `delay` (in 60ms steps) staggers a list of items. */
export function Reveal({
  children,
  delay = 0,
  className,
  ...rest
}: { children: React.ReactNode; delay?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Card that lifts slightly on hover — used for the dashboard stat tiles. */
export function HoverCard({
  children,
  className,
  delay = 0,
  ...rest
}: { children: React.ReactNode; delay?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Animated number counter for hero stats. */
export { motion };
