"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      <main className="mx-auto max-w-xl px-4 pb-28 pt-6">{children}</main>
      <BottomNav role={role} />
    </div>
  );
}
