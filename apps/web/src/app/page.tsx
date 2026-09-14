import Link from "next/link";

const VALEURS = [
  {
    titre: "Liberté",
    texte: "Accès rapide des deux côtés, aucune exclusivité imposée. Vous choisissez, à votre rythme.",
  },
  {
    titre: "Moins de charge mentale",
    texte: "Disponibilités réelles, urgence calculée automatiquement : la plateforme prend en charge ce qui prend du temps.",
  },
  {
    titre: "Sécurité juridique",
    texte: "Des preuves d'indépendance concrètes pour les deux parties, utiles en cas de contrôle URSSAF.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-ivoire text-noir-chaud">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <span className="font-serif text-2xl">Hair&apos;Renfort</span>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/connexion" className="hover:text-laiton">
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-noir-chaud px-5 py-2 text-ivoire transition hover:bg-laiton"
          >
            S&apos;inscrire
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="mb-4 text-sm uppercase tracking-widest text-laiton">Lancement en Île-de-France</p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          Le renfort ponctuel, libre des deux côtés.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-noir-chaud/80">
          Hair&apos;Renfort met en relation salons et coiffeurs freelances pour des missions
          ponctuelles et non-exclusives — sans location de fauteuil, sans engagement long.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/inscription/salon"
            className="w-full rounded-full bg-bordeaux px-8 py-3 text-center text-ivoire transition hover:opacity-90 sm:w-auto"
          >
            Je suis un salon
          </Link>
          <Link
            href="/inscription/freelance"
            className="w-full rounded-full border border-noir-chaud px-8 py-3 text-center transition hover:bg-noir-chaud hover:text-ivoire sm:w-auto"
          >
            Je suis freelance
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 pb-24 md:grid-cols-3">
        {VALEURS.map((v) => (
          <div key={v.titre} className="rounded-2xl border border-noir-chaud/10 bg-white/40 p-8">
            <h2 className="font-serif text-xl">{v.titre}</h2>
            <p className="mt-3 text-sm text-noir-chaud/70">{v.texte}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-noir-chaud/10 bg-white/30 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h3 className="font-serif text-2xl">Un lancement pensé pour la densité, pas la vitesse</h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-noir-chaud/70">
            Les 200 premières freelances inscrites bénéficient de 6 mois de gratuité totale,
            accès complet compris. Les 50 premiers salons, 3 mois. Au-delà, l&apos;essai gratuit
            standard de 30 jours s&apos;applique.
          </p>
        </div>
      </section>
    </main>
  );
}
