"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";
import { authFetch } from "@/lib/session";
import { ApiError } from "@/lib/api";

interface Repartition {
  missions: number;
  pourcentage: number;
  salonNom?: string;
  freelanceNom?: string;
}

interface FreelanceProof {
  nombreSalonsDifferents: number;
  totalMissionsAccepteesOuPlus: number;
  repartitionParSalon: Repartition[];
  historique: { acceptees: number; refusees: number; annulees: number; terminees: number };
}

interface SalonProof {
  nombreFreelancesDifferentes: number;
  totalMissionsConfieesOuPlus: number;
  repartitionParFreelance: Repartition[];
  historique: { acceptees: number; annulees: number; terminees: number };
}

type Proof = FreelanceProof | SalonProof;

function isFreelanceProof(p: Proof): p is FreelanceProof {
  return "nombreSalonsDifferents" in p;
}

export default function MesReperesPage() {
  const [proof, setProof] = useState<Proof | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch<Proof>("/dashboards/mine")
      .then(setProof)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Une erreur est survenue."));
  }, []);

  return (
    <AppShell>
      <p className="text-sm text-noir-chaud/60">Preuve d&apos;indépendance</p>
      <h1 className="font-serif text-3xl">Mes repères</h1>
      <p className="mt-1 text-sm text-noir-chaud/60">
        Visible uniquement par vous. Utile en cas de contrôle URSSAF : elle démontre que vous ne
        dépendez pas d&apos;un seul partenaire.
      </p>

      {error && <p className="mt-4 text-sm text-bordeaux">{error}</p>}

      {!proof && !error && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {proof && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              label={isFreelanceProof(proof) ? "Salons différents" : "Freelances différentes"}
              value={isFreelanceProof(proof) ? proof.nombreSalonsDifferents : proof.nombreFreelancesDifferentes}
            />
            <StatTile
              label="Missions au total"
              value={isFreelanceProof(proof) ? proof.totalMissionsAccepteesOuPlus : proof.totalMissionsConfieesOuPlus}
            />
          </div>

          <div>
            <h2 className="font-serif text-lg">Répartition</h2>
            <div className="mt-3 space-y-2">
              {(isFreelanceProof(proof) ? proof.repartitionParSalon : proof.repartitionParFreelance).map((r) => (
                <div key={r.salonNom ?? r.freelanceNom} className="rounded-xl bg-white/50 p-3">
                  <div className="flex justify-between text-sm">
                    <span>{r.salonNom ?? r.freelanceNom}</span>
                    <span className="text-noir-chaud/60">{r.pourcentage}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-noir-chaud/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.pourcentage}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="h-1.5 rounded-full bg-laiton"
                    />
                  </div>
                </div>
              ))}
              {(isFreelanceProof(proof) ? proof.repartitionParSalon : proof.repartitionParFreelance).length === 0 && (
                <p className="text-sm text-noir-chaud/60">Pas encore d&apos;historique de missions.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-lg">Historique</h2>
            <dl className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <dt className="text-noir-chaud/60">Terminées</dt>
                <dd className="font-serif text-xl">
                  <CountUp value={proof.historique.terminees} />
                </dd>
              </div>
              <div>
                <dt className="text-noir-chaud/60">Annulées</dt>
                <dd className="font-serif text-xl">
                  <CountUp value={proof.historique.annulees} />
                </dd>
              </div>
              {isFreelanceProof(proof) && (
                <div>
                  <dt className="text-noir-chaud/60">Refusées</dt>
                  <dd className="font-serif text-xl">
                    <CountUp value={proof.historique.refusees} />
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-noir-chaud/10 bg-white/50 p-4 text-center">
      <p className="font-serif text-3xl">
        <CountUp value={value} />
      </p>
      <p className="mt-1 text-xs text-noir-chaud/60">{label}</p>
    </div>
  );
}
