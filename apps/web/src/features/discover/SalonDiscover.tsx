"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { authFetch } from "@/lib/session";
import { SwipeCard } from "@/components/SwipeCard";
import { SwipeDeck, type SwipeDirection, type SwipeTrigger } from "@/components/SwipeDeck";
import { ApiError } from "@/lib/api";

interface Tarif {
  prestation: string;
  montant: number;
  unite: string;
}

interface FreelanceCard {
  id: string;
  prenom: string;
  nom: string;
  villeBase: string;
  zoneMobiliteKm: number;
  badgeVerifie: boolean;
  distanceKm: number;
  rating: number | null;
  tarifsAffiches: Tarif[];
  specialties: { name: string }[];
}

export function SalonDiscover() {
  const [freelances, setFreelances] = useState<FreelanceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<SwipeTrigger>(null);
  const [history, setHistory] = useState<FreelanceCard[]>([]);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    authFetch<FreelanceCard[]>("/matching/salon/search")
      .then(setFreelances)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger les profils."))
      .finally(() => setLoading(false));
  }, []);

  async function commit(freelance: FreelanceCard, direction: SwipeDirection) {
    setFreelances((prev) => prev.filter((f) => f.id !== freelance.id));
    setHistory((prev) => [freelance, ...prev]);
    try {
      await authFetch(`/matching/salon/freelances/${freelance.id}/swipe`, {
        method: "POST",
        body: JSON.stringify({ action: direction === "right" ? "LIKED" : "PASSED" }),
      });
      if (direction === "right") {
        setConfirmation("Ajoutée à vos favoris — retrouvez-la dans « Retravailler ensemble ».");
        setTimeout(() => setConfirmation(null), 2200);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  function act(direction: SwipeDirection) {
    if (freelances.length === 0) return;
    setTrigger({ direction, token: Date.now() });
  }

  function undo() {
    if (history.length === 0) return;
    const [last, ...rest] = history;
    setHistory(rest);
    setFreelances((prev) => [last, ...prev]);
  }

  if (loading) return <p className="text-sm text-noir-chaud/60">Chargement des profils…</p>;

  return (
    <div>
      <p className="text-sm text-noir-chaud/60">Profils disponibles</p>
      <h1 className="font-serif text-3xl">À proximité</h1>
      {error && <p className="mt-2 text-sm text-bordeaux">{error}</p>}

      {confirmation && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg bg-vert-confirmation/15 px-4 py-2 text-sm text-vert-confirmation"
        >
          {confirmation}
        </motion.p>
      )}

      <div className="mt-6">
        {freelances.length === 0 ? (
          <EmptyState />
        ) : (
          <SwipeDeck
            items={freelances}
            keyOf={(f) => f.id}
            onSwiped={commit}
            trigger={trigger}
            renderCard={(current) => {
              const tarif = current.tarifsAffiches?.[0];
              return (
                <SwipeCard
                  badgeTopLeft={`À ${current.distanceKm.toFixed(1)} km`}
                  badgeTopRight={current.badgeVerifie ? "Vérifiée" : undefined}
                  eyebrow={current.villeBase}
                  title={`${current.prenom} ${current.nom}`}
                  meta={[
                    ...(current.rating !== null ? [{ icon: "★", label: `${current.rating} / 5` }] : []),
                    { icon: "📍", label: `Mobile dans un rayon de ${current.zoneMobiliteKm} km` },
                  ]}
                  tags={current.specialties.slice(0, 3).map((s) => s.name)}
                  footerRight={tarif ? `${tarif.montant} € / ${tarif.unite}` : undefined}
                />
              );
            }}
          />
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
          disabled={freelances.length === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-bordeaux shadow-md shadow-noir-chaud/10 ring-1 ring-noir-chaud/5 transition disabled:opacity-40"
          aria-label="Passer"
        >
          ✕
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => act("right")}
          disabled={freelances.length === 0}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-laiton text-2xl text-ivoire shadow-lg shadow-laiton/30 transition disabled:opacity-40"
          aria-label="Ajouter aux favoris"
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
      <p className="font-serif text-xl">Plus de profils pour le moment</p>
      <p className="mt-2 text-sm text-noir-chaud/60">
        Élargissez vos filtres depuis l&apos;onglet « Rechercher » pour voir davantage de freelances.
      </p>
    </motion.div>
  );
}
