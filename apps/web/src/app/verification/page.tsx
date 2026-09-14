"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";

const REQUIRED_DOCS: Record<string, { type: string; label: string }[]> = {
  SALON: [
    { type: "SIRET", label: "Extrait SIRET" },
    { type: "ADRESSE_ETABLISSEMENT", label: "Justificatif d'adresse de l'établissement" },
    { type: "IDENTITE_GERANT", label: "Pièce d'identité du gérant" },
  ],
  FREELANCE: [
    { type: "DIPLOME", label: "Diplôme" },
    { type: "SIRET", label: "Extrait SIRET" },
    { type: "RC_PRO", label: "Attestation RC Pro" },
  ],
};

interface DocRow {
  id: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function VerificationPage() {
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("hr_role"));
    setToken(localStorage.getItem("hr_token"));
  }, []);

  useEffect(() => {
    if (!token) return;
    apiFetch<DocRow[]>("/verification/documents/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setDocs)
      .catch(() => undefined);
  }, [token]);

  async function submit(e: FormEvent<HTMLFormElement>, type: string) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const fileUrl = String(form.get("fileUrl") ?? "");
    if (!fileUrl) return;

    try {
      const doc = await apiFetch<DocRow>("/verification/documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, fileUrl }),
      });
      setDocs((prev) => [...prev.filter((d) => d.type !== type), doc]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  const required = role ? REQUIRED_DOCS[role] ?? [] : [];

  return (
    <main className="min-h-screen bg-ivoire px-6 py-16 text-noir-chaud">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl">Vérification de votre compte</h1>
        <p className="mt-2 text-sm text-noir-chaud/70">
          Votre compte reste en attente tant que ces pièces ne sont pas validées par notre équipe.
          Vous ne pourrez ni publier ni candidater avant cette validation.
        </p>

        {error && <p className="mt-4 text-sm text-bordeaux">{error}</p>}

        <div className="mt-10 space-y-6">
          {required.map((doc) => {
            const existing = docs.find((d) => d.type === doc.type);
            return (
              <div key={doc.type} className="rounded-2xl border border-noir-chaud/15 bg-white/50 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg">{doc.label}</h2>
                  {existing && <StatusBadge status={existing.status} />}
                </div>
                {!existing && (
                  <form onSubmit={(e) => submit(e, doc.type)} className="mt-4 flex gap-2">
                    <input
                      name="fileUrl"
                      placeholder="URL du document déposé"
                      required
                      className="flex-1 rounded-lg border border-noir-chaud/20 bg-white px-3 py-2 text-sm outline-none focus:border-laiton"
                    />
                    <button type="submit" className="rounded-lg bg-noir-chaud px-4 py-2 text-sm text-ivoire">
                      Envoyer
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <Link
          href="/app/decouvrir"
          className="mt-10 block rounded-full border border-noir-chaud/20 px-6 py-3 text-center text-sm text-noir-chaud/70 hover:border-laiton"
        >
          Continuer vers la plateforme
        </Link>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: DocRow["status"] }) {
  const styles: Record<DocRow["status"], string> = {
    PENDING: "bg-laiton/20 text-laiton",
    APPROVED: "bg-vert-confirmation/20 text-vert-confirmation",
    REJECTED: "bg-bordeaux/20 text-bordeaux",
  };
  const labels: Record<DocRow["status"], string> = {
    PENDING: "En attente d'examen",
    APPROVED: "Validé",
    REJECTED: "Rejeté",
  };
  return <span className={`rounded-full px-3 py-1 text-xs ${styles[status]}`}>{labels[status]}</span>;
}
