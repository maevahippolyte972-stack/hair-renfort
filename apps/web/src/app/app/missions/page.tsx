"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/session";
import { ApiError } from "@/lib/api";

interface Assignment {
  id: string;
  status: "PROPOSEE" | "ACCEPTEE" | "TERMINEE" | "REFUSEE" | "ANNULEE";
  validatedBySalonAt: string | null;
  validatedByFreelanceAt: string | null;
  missionNeed: {
    specialty: { name: string };
    salon: { id: string; raisonSociale: string; ville: string };
    slots: { date: string; heureDebut: string; heureFin: string }[];
  };
}

const STATUS_LABEL: Record<Assignment["status"], string> = {
  PROPOSEE: "Candidature envoyée",
  ACCEPTEE: "Acceptée",
  TERMINEE: "Terminée",
  REFUSEE: "Refusée",
  ANNULEE: "Annulée",
};

export default function MissionsPage() {
  const toast = useToast();
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    authFetch<Assignment[]>("/missions/assignments/mine")
      .then(setAssignments)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Une erreur est survenue."));
  }

  useEffect(load, []);

  async function valider(id: string) {
    try {
      await authFetch(`/missions/assignments/${id}/valider`, { method: "POST" });
      toast("Mission marquée comme terminée de votre côté.");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Une erreur est survenue.", "error");
    }
  }

  async function annuler(id: string) {
    const reason = window.prompt("Motif de l'annulation (obligatoire) :");
    if (!reason) return;
    try {
      await authFetch(`/missions/assignments/${id}/annuler`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      toast("Mission annulée — votre taux de fiabilité a été recalculé.");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Une erreur est survenue.", "error");
    }
  }

  return (
    <AppShell>
      <p className="kicker">Mes candidatures</p>
      <h1 className="font-serif text-3xl">Missions</h1>

      {error && <p className="mt-4 text-sm text-bordeaux">{error}</p>}

      <div className="mt-6 space-y-3">
        {assignments === null && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}
        {assignments?.map((a) => (
          <div key={a.id} className="editorial-card p-4">
            <div className="flex items-center justify-between">
              <p className="font-serif text-lg">{a.missionNeed.specialty.name}</p>
              <span className="rounded-full bg-noir-chaud/5 px-2.5 py-1 text-xs">{STATUS_LABEL[a.status]}</span>
            </div>
            <p className="mt-1 text-xs text-noir-chaud/60">
              <Link href={`/app/salons/${a.missionNeed.salon.id}`} className="underline underline-offset-2">
                {a.missionNeed.salon.raisonSociale}
              </Link>{" "}
              · {a.missionNeed.salon.ville}
            </p>
            {a.missionNeed.slots[0] && (
              <p className="mt-1 text-xs text-noir-chaud/60">
                {new Date(a.missionNeed.slots[0].date).toLocaleDateString("fr-FR")} · {a.missionNeed.slots[0].heureDebut}–
                {a.missionNeed.slots[0].heureFin}
              </p>
            )}

            {a.status === "ACCEPTEE" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => valider(a.id)}
                  disabled={!!a.validatedByFreelanceAt}
                  className="rounded-full bg-vert-confirmation px-4 py-1.5 text-xs text-ivoire disabled:opacity-40"
                >
                  {a.validatedByFreelanceAt ? "En attente du salon" : "Marquer comme terminée"}
                </button>
                <button onClick={() => annuler(a.id)} className="rounded-full border border-bordeaux px-4 py-1.5 text-xs text-bordeaux">
                  Annuler (motif requis)
                </button>
              </div>
            )}
          </div>
        ))}
        {assignments?.length === 0 && <p className="text-sm text-noir-chaud/60">Aucune mission pour l&apos;instant.</p>}
      </div>
    </AppShell>
  );
}
