"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/FormField";
import { apiFetch, ApiError } from "@/lib/api";

export default function InscriptionSalonPage() {
  const router = useRouter();
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    if (!acceptCgu) {
      setError("L'acceptation des CGU est nécessaire pour créer un compte.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch<{ accessToken: string; role: string }>("/auth/register/salon", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          raisonSociale: form.get("raisonSociale"),
          siret: form.get("siret"),
          nomGerant: form.get("nomGerant"),
          telephone: form.get("telephone"),
          adresse: form.get("adresse"),
          ville: form.get("ville"),
          codePostal: form.get("codePostal"),
          latitude: Number(form.get("latitude")),
          longitude: Number(form.get("longitude")),
          acceptCgu,
          acceptMarketing,
        }),
      });
      localStorage.setItem("hr_token", result.accessToken);
      localStorage.setItem("hr_role", result.role);
      router.push("/verification");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ivoire px-6 py-16 text-noir-chaud">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl">Inscription salon</h1>
        <p className="mt-2 text-sm text-noir-chaud/70">
          Établissement réel et identifié : SIRET, adresse et gérant seront vérifiés avant
          l&apos;ouverture du compte (badge &quot;Salon vérifié&quot;).
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <FormField id="raisonSociale" name="raisonSociale" label="Nom du salon" required />
          <FormField id="siret" name="siret" label="SIRET (14 chiffres)" pattern="\d{14}" required />
          <FormField id="nomGerant" name="nomGerant" label="Nom du gérant" required />
          <div className="grid grid-cols-2 gap-4">
            <FormField id="email" name="email" type="email" label="Email" required />
            <FormField id="telephone" name="telephone" label="Téléphone" required />
          </div>
          <FormField id="adresse" name="adresse" label="Adresse de l'établissement" required />
          <div className="grid grid-cols-2 gap-4">
            <FormField id="ville" name="ville" label="Ville" required />
            <FormField id="codePostal" name="codePostal" label="Code postal" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="latitude" name="latitude" type="number" step="any" label="Latitude" required />
            <FormField id="longitude" name="longitude" type="number" step="any" label="Longitude" required />
          </div>
          <FormField id="password" name="password" type="password" label="Mot de passe" minLength={10} required />

          <label className="flex items-start gap-2 text-sm text-noir-chaud/80">
            <input
              type="checkbox"
              checked={acceptCgu}
              onChange={(e) => setAcceptCgu(e.target.checked)}
              className="mt-1"
            />
            J&apos;accepte les CGU/CGV Hair&apos;Renfort.
          </label>
          <label className="flex items-start gap-2 text-sm text-noir-chaud/80">
            <input
              type="checkbox"
              checked={acceptMarketing}
              onChange={(e) => setAcceptMarketing(e.target.checked)}
              className="mt-1"
            />
            J&apos;accepte de recevoir des communications marketing (facultatif).
          </label>

          {error && <p className="text-sm text-bordeaux">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-bordeaux px-6 py-3 text-ivoire transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Création en cours…" : "Créer mon compte salon"}
          </button>
        </form>
      </div>
    </main>
  );
}
