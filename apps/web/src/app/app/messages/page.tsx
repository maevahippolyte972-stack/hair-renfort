"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { authFetch } from "@/lib/session";

interface Conversation {
  id: string;
  counterpartName: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    authFetch<Conversation[]>("/messaging/conversations")
      .then(setConversations)
      .catch(() => undefined);
  }, []);

  return (
    <AppShell>
      <p className="kicker">Messagerie</p>
      <h1 className="font-serif text-3xl">Messages</h1>

      <div className="mt-6 space-y-2">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/app/messages/${c.id}`}
            className="block editorial-card p-4 hover:border-laiton"
          >
            <p className="font-serif">{c.counterpartName}</p>
          </Link>
        ))}
        {conversations.length === 0 && (
          <p className="text-sm text-noir-chaud/60">
            Aucune conversation pour l&apos;instant — elles démarrent depuis un profil ou une mission.
          </p>
        )}
      </div>
    </AppShell>
  );
}
