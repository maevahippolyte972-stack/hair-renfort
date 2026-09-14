"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const background = useTransform(scrollY, [0, 80], ["rgba(245,241,232,0)", "rgba(245,241,232,0.85)"]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.1]);
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 0.06]);
  const boxShadow = useTransform(shadowOpacity, (v) => `0 8px 30px -12px rgba(28,23,18,${v})`);
  const borderColor = useTransform(borderOpacity, (v) => `rgba(28,23,18,${v})`);

  return (
    <motion.header
      style={{ background, boxShadow, borderColor }}
      className="sticky top-0 z-40 border-b backdrop-blur-md"
    >
      {children}
    </motion.header>
  );
}
