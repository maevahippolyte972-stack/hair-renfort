"use client";

import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Déclenche l'apparition au défilement plutôt qu'au montage (sections sous la ligne de flottaison). */
  onScroll?: boolean;
}

/** Petit fondu d'entrée réutilisable — importable depuis un composant serveur. */
export function Reveal({ children, delay = 0, className, onScroll = false }: RevealProps) {
  const motionProps = onScroll
    ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.35 } }
    : { animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      {...motionProps}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
