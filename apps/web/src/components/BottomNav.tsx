"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Compass, MessageCircle, Search, Send, UserRound } from "lucide-react";
import type { Role } from "@/lib/session";

const FREELANCE_TABS = [
  { href: "/app/decouvrir", label: "Découvrir", icon: Compass },
  { href: "/app/missions", label: "Missions", icon: BarChart3 },
  { href: "/app/mes-reperes", label: "Repères", icon: BarChart3 },
  { href: "/app/messages", label: "Messages", icon: MessageCircle },
  { href: "/app/profil", label: "Profil", icon: UserRound },
];

const SALON_TABS = [
  { href: "/app/decouvrir", label: "Découvrir", icon: Compass },
  { href: "/app/rechercher", label: "Rechercher", icon: Search },
  { href: "/app/publier", label: "Publier", icon: Send },
  { href: "/app/messages", label: "Messages", icon: MessageCircle },
  { href: "/app/profil", label: "Profil", icon: UserRound },
];

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const tabs = role === "SALON" ? SALON_TABS : FREELANCE_TABS;

  return (
    <nav aria-label="Navigation principale" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl md:bottom-6">
      <div className="grid grid-cols-5 gap-1 rounded-full border border-laiton/25 bg-surface/88 p-1.5 shadow-[0_24px_60px_-30px_rgba(28,23,18,0.32)] backdrop-blur-xl">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="press relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-full px-1 py-2.5 text-[0.65rem] font-semibold text-noir-chaud/50 transition-colors hover:text-noir-chaud"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-laiton to-laiton/80 shadow-[0_8px_24px_-12px_rgba(168,121,62,0.75)]"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span className={`relative flex flex-col items-center gap-1 ${active ? "text-ivoire" : ""}`}>
                <Icon className="size-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
