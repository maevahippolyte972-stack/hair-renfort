"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getRole, getToken } from "@/lib/session";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/verifications", label: "Vérifications" },
  { href: "/admin/signalements", label: "Signalements" },
  { href: "/admin/parametres", label: "Paramètres" },
];

/** Back-office — réservé au rôle ADMIN, jamais atteignable depuis un compte salon/freelance. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken() || getRole() !== "ADMIN") {
      router.replace("/connexion");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  function logout() {
    clearSession();
    router.push("/connexion");
  }

  return (
    <div className="min-h-screen bg-ivoire text-noir-chaud">
      <header className="glass-bar sticky top-0 z-40 flex items-center justify-between px-6 py-4">
        <span className="font-serif text-2xl">
          Hair<span className="text-laiton">&apos;</span>Renfort <span className="text-noir-chaud/40">· Back-office</span>
        </span>
        <button onClick={logout} className="press text-sm text-noir-chaud/60 hover:text-noir-chaud">
          Se déconnecter
        </button>
      </header>

      <div className="mx-auto flex max-w-5xl gap-8 px-6 py-8">
        <nav className="w-48 shrink-0 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`press block rounded-full px-4 py-2 text-sm transition ${
                pathname === item.href
                  ? "bg-gradient-to-br from-laiton to-laiton/80 text-ivoire shadow-[0_8px_24px_-12px_rgba(168,121,62,0.75)]"
                  : "text-noir-chaud/70 hover:bg-laiton/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
