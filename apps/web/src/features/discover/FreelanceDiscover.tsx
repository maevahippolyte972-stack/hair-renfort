"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/session";
import { SwipeCard } from "@/components/SwipeCard";
import { ApiError } from "@/lib/api";

interface NeedCard {
  id: string;
  description: string;
  urgencyLevel: "NORMAL" | "URGENT" | "TRES_URGENT";
  distanceKm: number;
  specialty: { name: string };
  salon: { raisonSociale: string; ville: string; badgeVerifie: boolean };
  slots: { date: string; heureDebut: string; heureFin: string }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

const URGENCY_LABEL: Record<NeedCard["urgencyLevel"], string | null> = {
  NORMAL: null,
  URGENT: "Urgent",
  TRES_URGENT: "Très urgent",
};

export function FreelanceDiscover() {
  const [needs, setNeeds] = useState<NeedCard[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    authFetch<NeedCard[]>("/matching/freelance/feed")
      .then(setNeeds)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger les missions."))
      .finally(() => setLoading(false));
  }, []);

  const current = needs[index];

  async function act(action: "LIKED" | "PASSED") {
    if (!current || pending) return;
    setPending(true);
    try {
      await authFetch(`/matching/freelance/needs/${current.id}/swipe`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setIndex((i) => i + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  if (loading) return <p className="text-sm text-noir-chaud/60">Chargement des missions…</p>;
  if (error) return <p className="text-sm text-bordeaux">{error}</p>;

  if (!current) {
    return (
      <div className="rounded-3xl border border-noir-chaud/10 bg-white/50 p-10 text-center">
        <p className="font-serif text-xl">Plus de missions pour le moment</p>
        <p className="mt-2 text-sm text-noir-chaud/60">
          Revenez bientôt — de nouveaux besoins sont publiés régulièrement en Île-de-France.
        </p>
      </div>
    );
  }

  const firstSlot = current.slots[0];
  const urgencyLabel = URGENCY_LABEL[current.urgencyLevel];

  return (
    <div>
      <p className="text-sm text-noir-chaud/60">Missions disponibles</p>
      <h1 className="font-serif text-3xl">À proximité</h1>

      <div className="mt-6">
        <SwipeCard
          badgeTopLeft={current.salon.ville}
          badgeTopRight={urgencyLabel ?? undefined}
          eyebrow={current.salon.raisonSociale}
          title={current.specialty.name}
          meta={
            firstSlot
              ? [
                  { icon: "📅", label: formatDate(firstSlot.date) },
                  { icon: "🕘", label: `${firstSlot.heureDebut} — ${firstSlot.heureFin}` },
                ]
              : []
          }
          tags={[current.specialty.name]}
        />
        {current.description && (
          <p className="mt-4 text-sm text-noir-chaud/70">{current.description}</p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-noir-chaud/10 text-xl"
          aria-label="Revenir en arrière"
        >
          ↺
        </button>
        <button
          onClick={() => act("PASSED")}
          disabled={pending}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-noir-chaud/10 text-xl text-bordeaux disabled:opacity-50"
          aria-label="Passer"
        >
          ✕
        </button>
        <button
          onClick={() => act("LIKED")}
          disabled={pending}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-laiton text-2xl text-ivoire disabled:opacity-50"
          aria-label="Candidater"
        >
          ♥
        </button>
      </div>
    </div>
  );
}
