import Link from "next/link";

export default function InscriptionChoicePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivoire px-6 text-noir-chaud">
      <div className="w-full max-w-2xl text-center">
        <h1 className="font-serif text-3xl">Qui êtes-vous ?</h1>
        <p className="mt-3 text-noir-chaud/70">
          Le parcours d&apos;inscription et les vérifications diffèrent selon votre profil.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href="/inscription/salon"
            className="rounded-2xl border border-noir-chaud/15 bg-white/50 p-8 text-left transition hover:border-bordeaux"
          >
            <h2 className="font-serif text-xl">Salon de coiffure</h2>
            <p className="mt-2 text-sm text-noir-chaud/70">
              Vérification SIRET, adresse et identité du gérant. Badge &quot;Salon vérifié&quot;.
            </p>
          </Link>
          <Link
            href="/inscription/freelance"
            className="rounded-2xl border border-noir-chaud/15 bg-white/50 p-8 text-left transition hover:border-laiton"
          >
            <h2 className="font-serif text-xl">Coiffeur·se freelance</h2>
            <p className="mt-2 text-sm text-noir-chaud/70">
              Diplôme, SIRET, attestation RC Pro. Badge &quot;Vérifiée&quot;.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
