"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/session";
import { ApiError } from "@/lib/api";

interface Notes {
  overall: number;
  ponctualite: number;
  technique: number;
  relationnel: number;
  avisCount: number;
}

interface SalonProfile {
  id: string;
  raisonSociale: string;
  ville: string;
  description: string | null;
  badgeVerifie: boolean;
  reliabilityScore: number;
  notes: Notes | null;
}

const CRITERIA: { key: keyof Notes; label: string }[] = [
  { key: "ponctualite", label: "Ponctualité" },
  { key: "technique", label: "Technique" },
  { key: "relationnel", label: "Relationnel" },
];

export default function SalonProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState<SalonProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    authFetch<SalonProfile>(`/profiles/salons/${params.id}`)
      .then(setProfile)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Une erreur est survenue."));
  }, [params.id]);

  async function contact() {
    setContacting(true);
    try {
      const conversation = await authFetch<{ id: string }>(`/messaging/conversations/freelance/${params.id}`, {
        method: "POST",
      });
      router.push(`/app/messages/${conversation.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Une erreur est survenue.", "error");
    } finally {
      setContacting(false);
    }
  }

  return (
    <AppShell>
      {error && <p className="text-sm text-bordeaux">{error}</p>}
      {!profile && !error && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      {profile && (
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(160deg, #6B2737 0%, #1C1712 55%, #A8793E 100%)" }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noir-chaud via-noir-chaud/20 to-transparent p-5 text-ivoire">
              <p className="text-xs uppercase tracking-widest text-ivoire/70">{profile.ville}</p>
              <h1 className="font-serif text-3xl">{profile.raisonSociale}</h1>
            </div>
            {profile.badgeVerifie && (
              <span className="absolute right-4 top-4 rounded-full bg-noir-chaud/70 px-3 py-1 text-xs text-ivoire backdrop-blur">
                Salon vérifié
              </span>
            )}
          </div>

          {profile.description && (
            <p className="mt-4 text-sm leading-relaxed text-noir-chaud/80">{profile.description}</p>
          )}

          <div className="mt-6 editorial-card p-4 text-center">
            <p className="font-serif text-2xl">{profile.reliabilityScore}%</p>
            <p className="mt-1 text-xs text-noir-chaud/60">Missions honorées</p>
          </div>

          <h2 className="mt-8 font-serif text-lg">Notes détaillées</h2>
          {profile.notes ? (
            <div className="mt-3 space-y-2">
              {CRITERIA.map((c) => (
                <div key={c.key} className="rounded-xl bg-white/50 p-3">
                  <div className="flex justify-between text-sm">
                    <span>{c.label}</span>
                    <span className="text-noir-chaud/60">{profile.notes![c.key]} / 5</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-noir-chaud/10">
                    <div className="h-1.5 rounded-full bg-laiton" style={{ width: `${(Number(profile.notes![c.key]) / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
              <p className="mt-2 text-xs text-noir-chaud/50">
                Note moyenne {profile.notes.overall} / 5 sur {profile.notes.avisCount} avis.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-noir-chaud/60">Pas encore d&apos;avis.</p>
          )}

          <button
            onClick={contact}
            disabled={contacting}
            className="mt-8 w-full rounded-full bg-laiton px-6 py-3 text-sm text-ivoire disabled:opacity-50"
          >
            {contacting ? "Ouverture…" : "Contacter"}
          </button>
        </div>
      )}
    </AppShell>
  );
}
