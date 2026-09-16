"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/session";
import { DEFAULT_URGENCY_THRESHOLDS_HOURS, DEFAULT_RELIABILITY_SANCTION } from "@hair-renfort/shared";

interface Setting {
  key: string;
  value: Record<string, unknown>;
  updatedAt: string;
}

const SUGGESTED: Record<string, Record<string, unknown>> = {
  "urgency.thresholds_hours": DEFAULT_URGENCY_THRESHOLDS_HOURS,
  "reliability.sanction": DEFAULT_RELIABILITY_SANCTION,
};

export default function AdminParametresPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<Setting[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  function load() {
    authFetch<Setting[]>("/admin/settings").then((data) => {
      setSettings(data);
      setDrafts(Object.fromEntries(data.map((s) => [s.key, JSON.stringify(s.value, null, 2)])));
    });
  }

  useEffect(load, []);

  async function save(key: string) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(drafts[key] ?? "{}");
    } catch {
      toast("JSON invalide.", "error");
      return;
    }
    setBusyKey(key);
    try {
      await authFetch(`/admin/settings/${key}`, { method: "PUT", body: JSON.stringify({ value: parsed }) });
      toast("Paramètre mis à jour, appliqué immédiatement.");
      load();
    } catch {
      toast("L'enregistrement a échoué.", "error");
    } finally {
      setBusyKey(null);
    }
  }

  const existingKeys = new Set((settings ?? []).map((s) => s.key));
  const missing = Object.keys(SUGGESTED).filter((k) => !existingKeys.has(k));

  return (
    <AdminShell>
      <h1 className="font-serif text-3xl">Paramètres de la plateforme</h1>
      <p className="mt-1 text-sm text-noir-chaud/60">
        Seuils métier modifiables sans déploiement (urgence, sanctions d&apos;annulation…). Appliqués immédiatement.
      </p>

      {settings === null && <p className="mt-4 text-sm text-noir-chaud/50">Chargement…</p>}

      <div className="mt-6 space-y-4">
        {settings?.map((s) => (
          <div key={s.key} className="editorial-card p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm">{s.key}</p>
              <p className="text-xs text-noir-chaud/40">MAJ {new Date(s.updatedAt).toLocaleString("fr-FR")}</p>
            </div>
            <textarea
              value={drafts[s.key] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
              rows={4}
              className="mt-3 w-full rounded-lg border border-noir-chaud/15 bg-white/70 p-3 font-mono text-xs"
            />
            <button
              onClick={() => save(s.key)}
              disabled={busyKey === s.key}
              className="mt-3 rounded-full bg-noir-chaud px-4 py-2 text-xs text-ivoire disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        ))}
      </div>

      {missing.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg">Non initialisés</h2>
          <p className="mt-1 text-xs text-noir-chaud/60">Tant qu&apos;un seuil n&apos;est pas créé ici, la valeur par défaut du code s&apos;applique.</p>
          <div className="mt-3 space-y-2">
            {missing.map((key) => (
              <button
                key={key}
                onClick={() => {
                  setDrafts((d) => ({ ...d, [key]: JSON.stringify(SUGGESTED[key], null, 2) }));
                  save(key);
                }}
                className="rounded-full border border-laiton/40 px-4 py-2 text-xs text-laiton"
              >
                Initialiser {key} avec les valeurs par défaut
              </button>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
