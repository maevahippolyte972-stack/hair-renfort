"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getRole, getToken, type Role } from "@/lib/session";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/connexion");
      return;
    }
    setRole(getRole());
  }, [router]);

  if (!role) return null;

  return (
    <div className="min-h-screen bg-ivoire text-noir-chaud">
      <TopBar role={role} />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-xl px-4 pb-28 pt-6"
      >
        {children}
      </motion.main>
      <BottomNav role={role} />
    </div>
  );
}
