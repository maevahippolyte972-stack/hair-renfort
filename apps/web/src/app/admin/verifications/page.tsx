"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/session";

const TYPE_LABELS: Record<string, string> = {
  DIPLOME: "Diplôme",
  SIRET: "SIRET",
  RC_PRO: "Attestation RC Pro",
  IDENTITE_GERANT: "Identité du gérant",
  ADRESSE_ETABLISSEMENT: "Adresse de l'établissement",
};

interface PendingDoc {
  id: string;
  type: string;
  fileUrl: string;
  createdAt: string;
  user: { id: string; email: string; role: string };
}

export default function AdminVerificationsPage() {
  const toast = useToast();
  const [docs, setDocs] = useState<PendingDoc[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    authFetch<PendingDoc[]>("/admin/verification/pending").then(setDocs).catch(() => undefined);
  }

  useEffect(load, []);

  async function approve(id: string) {
    setBusyId(id);
    try {
      await authFetch(`/admin/verification/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "APPROVED" }),
      });
      toast("Document approuvé.");
      load();
    } catch {
      toast("L'action n'a pas abouti.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    const rejectionReason = window.prompt("Motif du rejet (obligatoire) :");
    if (!rejectionReason) return;
    setBusyId(id);
    try {
      await authFetch(`/admin/verification/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "REJECTED", rejectionReason }),
      });
      toast("Document rejeté.");
      load();
    } catch {
      toast("L'action n'a pas abouti.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell>
      <h1 className="font-serif text-3xl">Vérifications en attente</h1>
      <p className="mt-1 text-sm text-noir-chaud/60">
        Condition d&apos;ouverture du compte : chaque pièce requise doit être approuvée manuellement avant activation.
      </p>

      {docs === null && <p className="mt-4 text-sm text-noir-chaud/50">Chargement…</p>}
      {docs?.length === 0 && <p className="mt-6 text-sm text-noir-chaud/50">Aucune pièce en attente.</p>}

      <div className="mt-6 space-y-3">
        {docs?.map((doc) => (
          <div key={doc.id} className="editorial-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {TYPE_LABELS[doc.type] ?? doc.type} — {doc.user.email}
                </p>
                <p className="mt-0.5 text-xs text-noir-chaud/60">
                  {doc.user.role === "SALON" ? "Compte salon" : "Compte freelance"} · déposé le{" "}
                  {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-laiton underline"
                >
                  Voir le document
                </a>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => approve(doc.id)}
                  disabled={busyId === doc.id}
                  className="rounded-full bg-vert-confirmation px-4 py-2 text-xs text-ivoire disabled:opacity-50"
                >
                  Approuver
                </button>
                <button
                  onClick={() => reject(doc.id)}
                  disabled={busyId === doc.id}
                  className="rounded-full border border-bordeaux/40 px-4 py-2 text-xs text-bordeaux disabled:opacity-50"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
