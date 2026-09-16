"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/session";

const CATEGORY_LABELS: Record<string, string> = {
  NON_PAIEMENT: "Non-paiement",
  COMPORTEMENT_INAPPROPRIE: "Comportement inapproprié",
  NON_RESPECT_CONDITIONS: "Non-respect des conditions",
  FAUSSE_INFORMATION: "Fausse information",
};

const STATUS_LABELS: Record<string, string> = {
  RECU: "Reçu",
  EN_COURS_EXAMEN: "En cours d'examen",
  TRAITE: "Traité",
};

const ISSUE_OPTIONS: { value: string; label: string }[] = [
  { value: "SANS_SUITE", label: "Sans suite" },
  { value: "AVERTISSEMENT", label: "Avertissement" },
  { value: "SUSPENSION", label: "Suspension du compte" },
  { value: "EXCLUSION", label: "Exclusion du compte" },
];

interface ReportItem {
  id: string;
  category: string;
  description: string;
  status: string;
  issue: string | null;
  createdAt: string;
  reporter: { id: string; email: string; role: string };
  reported: { id: string; email: string; role: string };
}

export default function AdminSignalementsPage() {
  const toast = useToast();
  const [reports, setReports] = useState<ReportItem[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    authFetch<ReportItem[]>("/admin/reports").then(setReports).catch(() => undefined);
  }

  useEffect(load, []);

  async function markInReview(id: string) {
    setBusyId(id);
    try {
      await authFetch(`/admin/reports/${id}/en-cours`, { method: "PATCH" });
      toast("Signalement passé en cours d'examen.");
      load();
    } catch {
      toast("L'action n'a pas abouti.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function resolve(id: string, issue: string) {
    setBusyId(id);
    try {
      await authFetch(`/admin/reports/${id}/resoudre`, { method: "PATCH", body: JSON.stringify({ issue }) });
      toast("Signalement résolu.");
      load();
    } catch {
      toast("L'action n'a pas abouti.", "error");
    } finally {
      setBusyId(null);
    }
  }

  const open = reports?.filter((r) => r.status !== "TRAITE") ?? [];
  const closed = reports?.filter((r) => r.status === "TRAITE") ?? [];

  return (
    <AdminShell>
      <h1 className="font-serif text-3xl">Signalements</h1>
      <p className="mt-1 text-sm text-noir-chaud/60">
        File de traitement réelle : chaque signalement est horodaté, catégorisé et suivi jusqu&apos;à résolution.
      </p>

      {reports === null && <p className="mt-4 text-sm text-noir-chaud/50">Chargement…</p>}

      {reports && (
        <div className="mt-6 space-y-8">
          <div>
            <h2 className="font-serif text-lg">À traiter ({open.length})</h2>
            <div className="mt-3 space-y-3">
              {open.length === 0 && <p className="text-sm text-noir-chaud/50">Rien à traiter.</p>}
              {open.map((r) => (
                <div key={r.id} className="rounded-2xl border border-bordeaux/20 bg-bordeaux/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{CATEGORY_LABELS[r.category] ?? r.category}</p>
                    <span className="rounded-full bg-white/60 px-3 py-1 text-xs text-noir-chaud/60">
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-noir-chaud/80">{r.description}</p>
                  <p className="mt-2 text-xs text-noir-chaud/60">
                    Signalé par {r.reporter.email} ({r.reporter.role.toLowerCase()}) contre {r.reported.email} (
                    {r.reported.role.toLowerCase()}) le {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {r.status === "RECU" && (
                      <button
                        onClick={() => markInReview(r.id)}
                        disabled={busyId === r.id}
                        className="rounded-full border border-noir-chaud/20 px-4 py-2 text-xs disabled:opacity-50"
                      >
                        Passer en cours d&apos;examen
                      </button>
                    )}
                    {ISSUE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => resolve(r.id, opt.value)}
                        disabled={busyId === r.id}
                        className="rounded-full bg-noir-chaud px-4 py-2 text-xs text-ivoire disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-lg">Traités ({closed.length})</h2>
            <div className="mt-3 space-y-2">
              {closed.map((r) => (
                <div key={r.id} className="rounded-xl bg-white/40 px-4 py-3 text-sm">
                  <span className="text-noir-chaud/80">{CATEGORY_LABELS[r.category] ?? r.category}</span>
                  <span className="ml-2 text-noir-chaud/50">
                    — {ISSUE_OPTIONS.find((o) => o.value === r.issue)?.label ?? "traité"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
