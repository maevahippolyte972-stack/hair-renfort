"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/session";
import { ApiError } from "@/lib/api";

const SPECIALITES = [
  "Coupe femme",
  "Coupe homme",
  "Coloration",
  "Balayage",
  "Lissage",
  "Coiffure de mariage",
  "Extensions",
  "Barbier",
];

interface Need {
  id: string;
  description: string;
  status: string;
  urgencyLevel: string;
  specialty: { name: string };
  slots: { date: string; heureDebut: string; heureFin: string }[];
}

export default function PublierPage() {
  const toast = useToast();
  const [myNeeds, setMyNeeds] = useState<Need[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function loadMine() {
    authFetch<Need[]>("/missions/needs/mine")
      .then(setMyNeeds)
      .catch(() => undefined);
  }

  useEffect(loadMine, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    setLoading(true);
    try {
      await authFetch("/missions/needs", {
        method: "POST",
        body: JSON.stringify({
          specialtyName: form.get("specialtyName"),
          description: form.get("description"),
          slots: [
            {
              date: form.get("date"),
              heureDebut: form.get("heureDebut"),
              heureFin: form.get("heureFin"),
            },
          ],
        }),
      });
      toast("Besoin publié — visible dans le flux des freelances concernées.");
      (e.target as HTMLFormElement).reset();
      loadMine();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <p className="text-sm text-noir-chaud/60">Nouveau besoin</p>
      <h1 className="font-serif text-3xl">Publier un renfort</h1>
      <p className="mt-1 text-sm text-noir-chaud/60">
        Aucun tarif à indiquer ici : c&apos;est la freelance qui fixe et affiche le sien.
        L&apos;urgence est calculée automatiquement selon le délai avant la mission.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-noir-chaud/10 bg-white/50 p-4">
        <select
          name="specialtyName"
          required
          defaultValue=""
          className="w-full rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Spécialité recherchée
          </option>
          {SPECIALITES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          required
          placeholder="Décrivez le contexte de la mission…"
          rows={3}
          className="w-full rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-3 gap-3">
          <input type="date" name="date" required className="rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm" />
          <input type="time" name="heureDebut" required defaultValue="09:00" className="rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm" />
          <input type="time" name="heureFin" required defaultValue="18:00" className="rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm" />
        </div>

        {error && <p className="text-sm text-bordeaux">{error}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-full bg-bordeaux px-4 py-2.5 text-sm text-ivoire">
          {loading ? "Publication…" : "Publier"}
        </button>
      </form>

      <h2 className="mt-10 font-serif text-xl">Mes besoins publiés</h2>
      <div className="mt-4 space-y-3">
        {myNeeds === null && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}
        <AnimatePresence initial={false}>
          {myNeeds?.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="rounded-2xl border border-noir-chaud/10 bg-white/50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-serif">{n.specialty.name}</p>
                <span className="text-xs text-noir-chaud/60">{n.status}</span>
              </div>
              {n.slots[0] && (
                <p className="mt-1 text-xs text-noir-chaud/60">
                  {new Date(n.slots[0].date).toLocaleDateString("fr-FR")} · {n.slots[0].heureDebut}–{n.slots[0].heureFin}
                </p>
              )}
              {n.urgencyLevel !== "NORMAL" && (
                <span className="mt-2 inline-block rounded-full bg-bordeaux/10 px-2.5 py-1 text-xs text-bordeaux">
                  {n.urgencyLevel === "TRES_URGENT" ? "Très urgent" : "Urgent"}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {myNeeds?.length === 0 && <p className="text-sm text-noir-chaud/60">Aucun besoin publié pour l&apos;instant.</p>}
      </div>
    </AppShell>
  );
}
