"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/FormField";
import { apiFetch, ApiError } from "@/lib/api";

const SPECIALITES = [
  "Coupe femme",
  "Coupe homme",
  "Coloration",
  "Balayage",
  "Lissage",
  "Cheveux texturés",
  "Coiffure de mariage",
  "Extensions",
  "Barbier",
];

export default function InscriptionFreelancePage() {
  const router = useRouter();
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleSpecialty(name: string) {
    setSpecialties((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!acceptCgu) {
      setError("L'acceptation des CGU est nécessaire pour créer un compte.");
      return;
    }
    if (specialties.length === 0) {
      setError("Sélectionnez au moins une spécialité.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const tarif = Number(form.get("tarif"));
    const prestation = String(form.get("prestation") ?? "Prestation");

    setLoading(true);
    try {
      const result = await apiFetch<{ accessToken: string; role: string }>("/auth/register/freelance", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          prenom: form.get("prenom"),
          nom: form.get("nom"),
          telephone: form.get("telephone"),
          siret: form.get("siret"),
          villeBase: form.get("villeBase"),
          latitude: Number(form.get("latitude")),
          longitude: Number(form.get("longitude")),
          zoneMobiliteKm: Number(form.get("zoneMobiliteKm") || 15),
          specialtyNames: specialties,
          tarifsAffiches: [{ prestation, montant: tarif, unite: "prestation" }],
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
        <h1 className="font-serif text-3xl">Inscription freelance</h1>
        <p className="mt-2 text-sm text-noir-chaud/70">
          Vous fixez librement vos tarifs — la plateforme ne les négocie ni ne les standardise
          jamais. Diplôme, SIRET et RC Pro seront demandés à l&apos;étape suivante.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField id="prenom" name="prenom" label="Prénom" required />
            <FormField id="nom" name="nom" label="Nom" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="email" name="email" type="email" label="Email" required />
            <FormField id="telephone" name="telephone" label="Téléphone" required />
          </div>
          <FormField id="siret" name="siret" label="SIRET (14 chiffres)" pattern="\d{14}" required />

          <div>
            <span className="mb-2 block text-sm text-noir-chaud/80">Spécialités</span>
            <div className="flex flex-wrap gap-2">
              {SPECIALITES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSpecialty(s)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    specialties.includes(s)
                      ? "border-laiton bg-laiton text-ivoire"
                      : "border-noir-chaud/20 text-noir-chaud/70"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField id="prestation" name="prestation" label="Prestation (ex. Coupe femme)" required />
            <FormField id="tarif" name="tarif" type="number" label="Votre tarif (€)" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField id="villeBase" name="villeBase" label="Ville de base" required />
            <FormField id="zoneMobiliteKm" name="zoneMobiliteKm" type="number" label="Zone de mobilité (km)" defaultValue={15} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="latitude" name="latitude" type="number" step="any" label="Latitude" required />
            <FormField id="longitude" name="longitude" type="number" step="any" label="Longitude" required />
          </div>
          <FormField id="password" name="password" type="password" label="Mot de passe" minLength={10} required />

          <label className="flex items-start gap-2 text-sm text-noir-chaud/80">
            <input type="checkbox" checked={acceptCgu} onChange={(e) => setAcceptCgu(e.target.checked)} className="mt-1" />
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
            className="w-full rounded-full bg-laiton px-6 py-3 text-ivoire transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Création en cours…" : "Créer mon compte freelance"}
          </button>
        </form>
      </div>
    </main>
  );
}
