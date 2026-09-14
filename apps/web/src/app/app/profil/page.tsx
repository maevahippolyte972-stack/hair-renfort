"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { authFetch, clearSession, getRole } from "@/lib/session";

interface SalonMe {
  raisonSociale: string;
  ville: string;
  badgeVerifie: boolean;
  reliabilityScore: number;
  subscriptionTier: "BASE" | "PREMIUM";
}

interface FreelanceMe {
  prenom: string;
  nom: string;
  villeBase: string;
  badgeVerifie: boolean;
  reliabilityScore: number;
  tarifsAffiches: { prestation: string; montant: number; unite: string }[];
}

export default function ProfilPage() {
  const router = useRouter();
  const [me, setMe] = useState<SalonMe | FreelanceMe | null>(null);
  const role = getRole();

  useEffect(() => {
    authFetch<SalonMe | FreelanceMe>("/profiles/me")
      .then(setMe)
      .catch(() => undefined);
  }, []);

  function logout() {
    clearSession();
    router.push("/connexion");
  }

  return (
    <AppShell>
      <p className="text-sm text-noir-chaud/60">Mon profil</p>
      <h1 className="font-serif text-3xl">
        {me && "raisonSociale" in me ? me.raisonSociale : me ? `${me.prenom} ${me.nom}` : "…"}
      </h1>

      {me && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                me.badgeVerifie ? "bg-vert-confirmation/15 text-vert-confirmation" : "bg-laiton/15 text-laiton"
              }`}
            >
              {me.badgeVerifie ? "Vérifiée" : "Vérification en attente"}
            </span>
            {"subscriptionTier" in me && (
              <span className="rounded-full bg-noir-chaud/5 px-3 py-1 text-xs">
                Formule {me.subscriptionTier === "PREMIUM" ? "Premium" : "Base"}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-noir-chaud/10 bg-white/50 p-4">
            <p className="text-xs text-noir-chaud/60">Taux de fiabilité</p>
            <p className="font-serif text-2xl">{me.reliabilityScore}%</p>
          </div>

          {"tarifsAffiches" in me && me.tarifsAffiches?.length > 0 && (
            <div className="rounded-2xl border border-noir-chaud/10 bg-white/50 p-4">
              <p className="text-xs text-noir-chaud/60">Mes tarifs</p>
              {me.tarifsAffiches.map((t) => (
                <p key={t.prestation} className="mt-1 text-sm">
                  {t.prestation} — {t.montant} € / {t.unite}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={logout}
        className="mt-10 w-full rounded-full border border-noir-chaud/20 px-4 py-2.5 text-sm text-noir-chaud/70"
      >
        Se déconnecter
      </button>

      <p className="mt-2 text-center text-xs text-noir-chaud/40">Connecté en tant que {role === "SALON" ? "salon" : "freelance"}</p>
    </AppShell>
  );
}
