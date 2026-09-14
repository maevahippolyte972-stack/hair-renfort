"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/session";

const FREELANCE_TABS = [
  { href: "/app/decouvrir", label: "Découvrir" },
  { href: "/app/missions", label: "Missions" },
  { href: "/app/mes-reperes", label: "Mes repères" },
  { href: "/app/messages", label: "Messages" },
  { href: "/app/profil", label: "Profil" },
];

const SALON_TABS = [
  { href: "/app/decouvrir", label: "Découvrir" },
  { href: "/app/rechercher", label: "Rechercher" },
  { href: "/app/publier", label: "Publier" },
  { href: "/app/messages", label: "Messages" },
  { href: "/app/profil", label: "Profil" },
];

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const tabs = role === "SALON" ? SALON_TABS : FREELANCE_TABS;

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-noir-chaud/10 bg-ivoire">
      <div className="mx-auto flex max-w-xl justify-between px-4 py-3">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 text-xs ${
                active ? "text-bordeaux" : "text-noir-chaud/50"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-bordeaux" : "bg-transparent"}`} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
