"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { authFetch } from "@/lib/session";

interface Stats {
  inscrits: { salons: number; freelances: number };
  missions: { besoinsPublies: number; missionsAcceptees: number };
  aTraiter: { verificationsEnAttente: number; signalementsOuverts: number };
  abonnements: { salonsEnEssai: number; tauxConversionSalonPct: number };
  zonesLesPlusActives: { ville: string; salons: number }[];
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    authFetch<Stats>("/admin/stats").then(setStats).catch(() => undefined);
  }, []);

  return (
    <AdminShell>
      <h1 className="font-serif text-3xl">Vue d&apos;ensemble</h1>
      {!stats && <p className="mt-4 text-sm text-noir-chaud/50">Chargement…</p>}

      {stats && (
        <div className="mt-6 space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Tile label="Salons inscrits" value={stats.inscrits.salons} />
            <Tile label="Freelances inscrites" value={stats.inscrits.freelances} />
            <Tile label="Besoins publiés" value={stats.missions.besoinsPublies} />
            <Tile label="Missions acceptées" value={stats.missions.missionsAcceptees} />
          </div>

          <div>
            <h2 className="font-serif text-lg">À traiter</h2>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Link
                href="/admin/verifications"
                className="rounded-2xl border border-laiton/30 bg-laiton/10 p-4 transition hover:bg-laiton/15"
              >
                <p className="font-serif text-3xl">{stats.aTraiter.verificationsEnAttente}</p>
                <p className="mt-1 text-xs text-noir-chaud/60">Vérifications en attente</p>
              </Link>
              <Link
                href="/admin/signalements"
                className="rounded-2xl border border-bordeaux/30 bg-bordeaux/5 p-4 transition hover:bg-bordeaux/10"
              >
                <p className="font-serif text-3xl">{stats.aTraiter.signalementsOuverts}</p>
                <p className="mt-1 text-xs text-noir-chaud/60">Signalements ouverts</p>
              </Link>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-lg">Abonnements</h2>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Tile label="Salons en essai" value={stats.abonnements.salonsEnEssai} />
              <Tile label="Taux de conversion salon" value={`${stats.abonnements.tauxConversionSalonPct}%`} />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-lg">Zones les plus actives</h2>
            <div className="mt-3 space-y-2">
              {stats.zonesLesPlusActives.length === 0 && <p className="text-sm text-noir-chaud/50">Pas encore de données.</p>}
              {stats.zonesLesPlusActives.map((z) => (
                <div key={z.ville} className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-2.5 text-sm">
                  <span>{z.ville}</span>
                  <span className="text-noir-chaud/60">{z.salons} salon(s)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="editorial-card p-4">
      <p className="font-serif text-3xl">{value}</p>
      <p className="mt-1 text-xs text-noir-chaud/60">{label}</p>
    </div>
  );
}
