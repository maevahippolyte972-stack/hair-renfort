"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { FREELANCE_SPECIALTIES } from "@hair-renfort/shared";

interface Tarif {
  prestation: string;
  montant: number;
  unite: string;
}

interface FreelanceResult {
  id: string;
  prenom: string;
  nom: string;
  villeBase: string;
  distanceKm: number;
  badgeVerifie: boolean;
  reliabilityScore: number;
  rating: number | null;
  tarifsAffiches: Tarif[];
  specialties: { name: string }[];
}

const SPECIALITES = FREELANCE_SPECIALTIES;

export default function RechercherPage() {
  const toast = useToast();
  const [results, setResults] = useState<FreelanceResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState<Set<string>>(new Set());

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const specialtyName = form.get("specialtyName");
    const availableOn = form.get("availableOn");
    const minRating = form.get("minRating");
    const maxDistanceKm = form.get("maxDistanceKm");
    if (specialtyName) params.set("specialtyName", String(specialtyName));
    if (availableOn) params.set("availableOn", String(availableOn));
    if (minRating) params.set("minRating", String(minRating));
    if (maxDistanceKm) params.set("maxDistanceKm", String(maxDistanceKm));

    try {
      const data = await authFetch<FreelanceResult[]>(`/matching/salon/search?${params.toString()}`);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function addFavorite(freelanceId: string, prenom: string) {
    try {
      await authFetch(`/favorites/${freelanceId}`, { method: "POST" });
      setFavorited((prev) => new Set(prev).add(freelanceId));
      toast(`${prenom} ajoutée à vos favoris`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Une erreur est survenue.", "error");
    }
  }

  return (
    <AppShell>
      <p className="text-sm text-noir-chaud/60">Recherche manuelle</p>
      <h1 className="font-serif text-3xl">Toutes les freelances</h1>
      <p className="mt-1 text-sm text-noir-chaud/60">
        Disponible avec toutes les formules — filtrez et parcourez la base librement.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-2xl border border-noir-chaud/10 bg-white/50 p-4">
        <select
          name="specialtyName"
          defaultValue=""
          className="w-full rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">Toutes spécialités</option>
          {SPECIALITES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" name="availableOn" className="rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm" />
          <input
            type="number"
            name="maxDistanceKm"
            placeholder="Distance max (km)"
            className="rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          name="minRating"
          placeholder="Note minimum"
          className="w-full rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm"
        />
        <button type="submit" disabled={loading} className="w-full rounded-full bg-noir-chaud px-4 py-2.5 text-sm text-ivoire">
          {loading ? "Recherche…" : "Rechercher"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-bordeaux">{error}</p>}

      <div className="mt-6 space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        {!loading &&
          results?.map((f) => (
          <div key={f.id} className="rounded-2xl border border-noir-chaud/10 bg-white/50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-serif text-lg">
                  {f.prenom} {f.nom}
                </p>
                <p className="text-xs text-noir-chaud/60">
                  {f.villeBase} · à {f.distanceKm.toFixed(1)} km
                  {f.badgeVerifie ? " · Vérifiée" : ""}
                  {f.rating !== null ? ` · ★ ${f.rating}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {f.specialties.map((s) => (
                    <span key={s.name} className="rounded-full bg-noir-chaud/5 px-2.5 py-1 text-xs">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              {f.tarifsAffiches?.[0] && (
                <span className="whitespace-nowrap text-sm text-noir-chaud/70">
                  {f.tarifsAffiches[0].montant} € / {f.tarifsAffiches[0].unite}
                </span>
              )}
            </div>
            <button
              onClick={() => addFavorite(f.id, f.prenom)}
              disabled={favorited.has(f.id)}
              className="mt-3 rounded-full border border-laiton px-4 py-1.5 text-xs text-laiton disabled:opacity-40"
            >
              {favorited.has(f.id) ? "Ajoutée aux favoris" : "Ajouter aux favoris"}
            </button>
          </div>
        ))}
        {results?.length === 0 && <p className="text-sm text-noir-chaud/60">Aucun résultat pour ces critères.</p>}
      </div>
    </AppShell>
  );
}
