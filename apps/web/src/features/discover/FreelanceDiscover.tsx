"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { authFetch } from "@/lib/session";
import { SwipeCard } from "@/components/SwipeCard";
import { SwipeDeck, type SwipeDirection, type SwipeTrigger } from "@/components/SwipeDeck";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
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
  const toast = useToast();
  const [needs, setNeeds] = useState<NeedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<SwipeTrigger>(null);
  const [history, setHistory] = useState<NeedCard[]>([]);

  useEffect(() => {
    authFetch<NeedCard[]>("/matching/freelance/feed")
      .then(setNeeds)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger les missions."))
      .finally(() => setLoading(false));
  }, []);

  async function commit(need: NeedCard, direction: SwipeDirection) {
    setNeeds((prev) => prev.filter((n) => n.id !== need.id));
    setHistory((prev) => [need, ...prev]);
    try {
      await authFetch(`/matching/freelance/needs/${need.id}/swipe`, {
        method: "POST",
        body: JSON.stringify({ action: direction === "right" ? "LIKED" : "PASSED" }),
      });
      if (direction === "right") toast(`Candidature envoyée à ${need.salon.raisonSociale}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Une erreur est survenue.", "error");
    }
  }

  function act(direction: SwipeDirection) {
    if (needs.length === 0) return;
    setTrigger({ direction, token: Date.now(), itemId: needs[0].id });
  }

  function undo() {
    if (history.length === 0) return;
    const [last, ...rest] = history;
    setHistory(rest);
    setNeeds((prev) => [last, ...prev]);
  }

  if (loading) {
    return (
      <div>
        <p className="text-sm text-noir-chaud/60">Missions disponibles</p>
        <h1 className="font-serif text-3xl">À proximité</h1>
        <Skeleton className="mt-6 aspect-[3/4] w-full" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-noir-chaud/60">Missions disponibles</p>
      <h1 className="font-serif text-3xl">À proximité</h1>
      {error && <p className="mt-2 text-sm text-bordeaux">{error}</p>}

      <div className="mt-6">
        {needs.length === 0 ? (
          <EmptyState />
        ) : (
          <SwipeDeck
            items={needs}
            keyOf={(n) => n.id}
            onSwiped={commit}
            trigger={trigger}
            renderCard={(current) => {
              const firstSlot = current.slots[0];
              const urgencyLabel = URGENCY_LABEL[current.urgencyLevel];
              return (
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
              );
            }}
          />
        )}
        {needs[0]?.description && (
          <p className="mt-4 text-sm text-noir-chaud/70">{needs[0].description}</p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={undo}
          disabled={history.length === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-noir-chaud/10 text-xl transition disabled:opacity-30"
          aria-label="Revenir en arrière"
        >
          ↺
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => act("left")}
          disabled={needs.length === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-bordeaux shadow-md shadow-noir-chaud/10 ring-1 ring-noir-chaud/5 transition disabled:opacity-40"
          aria-label="Passer"
        >
          ✕
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => act("right")}
          disabled={needs.length === 0}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-laiton text-2xl text-ivoire shadow-lg shadow-laiton/30 transition disabled:opacity-40"
          aria-label="Candidater"
        >
          ♥
        </motion.button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-3xl border border-noir-chaud/10 bg-white/50 p-10 text-center"
    >
      <p className="font-serif text-xl">Plus de missions pour le moment</p>
      <p className="mt-2 text-sm text-noir-chaud/60">
        Revenez bientôt — de nouveaux besoins sont publiés régulièrement en Île-de-France.
      </p>
    </motion.div>
  );
}
