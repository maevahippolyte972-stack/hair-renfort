"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getRole, type Role } from "@/lib/session";
import { FreelanceDiscover } from "@/features/discover/FreelanceDiscover";
import { SalonDiscover } from "@/features/discover/SalonDiscover";

export default function DecouvrirPage() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    setRole(getRole());
  }, []);

  return (
    <AppShell>
      {role === "SALON" && <SalonDiscover />}
      {role === "FREELANCE" && <FreelanceDiscover />}
    </AppShell>
  );
}
