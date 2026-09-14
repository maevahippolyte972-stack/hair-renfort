"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/session";
import { SwipeCard } from "@/components/SwipeCard";
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
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    authFetch<FreelanceCard[]>("/matching/salon/search")
      .then(setFreelances)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger les profils."))
      .finally(() => setLoading(false));
  }, []);

  const current = freelances[index];

  async function act(action: "LIKED" | "PASSED") {
    if (!current || pending) return;
    setPending(true);
    try {
      await authFetch(`/matching/salon/freelances/${current.id}/swipe`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      if (action === "LIKED") {
        setConfirmation("Ajoutée à vos favoris — retrouvez-la dans « Retravailler ensemble ».");
        setTimeout(() => setConfirmation(null), 2500);
      }
      setIndex((i) => i + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  if (loading) return <p className="text-sm text-noir-chaud/60">Chargement des profils…</p>;
  if (error) return <p className="text-sm text-bordeaux">{error}</p>;

  if (!current) {
    return (
      <div className="rounded-3xl border border-noir-chaud/10 bg-white/50 p-10 text-center">
        <p className="font-serif text-xl">Plus de profils pour le moment</p>
        <p className="mt-2 text-sm text-noir-chaud/60">
          Élargissez vos filtres depuis l&apos;onglet « Rechercher » pour voir davantage de freelances.
        </p>
      </div>
    );
  }

  const tarif = current.tarifsAffiches?.[0];

  return (
    <div>
      <p className="text-sm text-noir-chaud/60">Profils disponibles</p>
      <h1 className="font-serif text-3xl">À proximité</h1>

      {confirmation && (
        <p className="mt-3 rounded-lg bg-vert-confirmation/15 px-4 py-2 text-sm text-vert-confirmation">
          {confirmation}
        </p>
      )}

      <div className="mt-6">
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
          aria-label="Ajouter aux favoris"
        >
          ♥
        </button>
      </div>
    </div>
  );
}
