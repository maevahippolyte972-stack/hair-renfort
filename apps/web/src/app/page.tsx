import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ScrollHeader } from "@/components/ScrollHeader";
import { CountUp } from "@/components/CountUp";

const VALEURS = [
  {
    numero: "I",
    titre: "Liberté",
    texte: "Accès rapide des deux côtés, aucune exclusivité imposée. Vous choisissez, à votre rythme.",
  },
  {
    numero: "II",
    titre: "Moins de charge mentale",
    texte: "Disponibilités réelles, urgence calculée automatiquement : la plateforme prend en charge ce qui prend du temps.",
  },
  {
    numero: "III",
    titre: "Sécurité juridique",
    texte: "Des preuves d'indépendance concrètes pour les deux parties, utiles en cas de contrôle URSSAF.",
  },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative py-1">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-laiton transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-ivoire text-noir-chaud">
      <ScrollHeader>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="font-serif text-2xl">Hair&apos;Renfort</span>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink href="/connexion">Connexion</NavLink>
            <Link
              href="/inscription"
              className="rounded-full bg-noir-chaud px-5 py-2 text-ivoire shadow-md shadow-noir-chaud/20 transition hover:-translate-y-0.5 hover:bg-laiton hover:shadow-lg hover:shadow-laiton/30"
            >
              S&apos;inscrire
            </Link>
          </nav>
        </div>
      </ScrollHeader>

      <section className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(168,121,62,0.18), transparent 70%)" }}
          aria-hidden
        />

        <Reveal>
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-laiton">Lancement en Île-de-France</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-serif text-5xl leading-[1.08] md:text-6xl">
            Le renfort ponctuel,
            <br />
            libre des deux côtés.
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-noir-chaud/80">
            Hair&apos;Renfort met en relation salons et coiffeurs freelances pour des missions
            ponctuelles et non-exclusives — sans location de fauteuil, sans engagement long.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/inscription/salon"
              className="w-full rounded-full bg-bordeaux px-8 py-3 text-center text-ivoire shadow-lg shadow-bordeaux/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-bordeaux/30 sm:w-auto"
            >
              Je suis un salon
            </Link>
            <Link
              href="/inscription/freelance"
              className="w-full rounded-full border border-noir-chaud px-8 py-3 text-center transition hover:-translate-y-0.5 hover:bg-noir-chaud hover:text-ivoire hover:shadow-lg hover:shadow-noir-chaud/20 sm:w-auto"
            >
              Je suis freelance
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 pb-24 md:grid-cols-3">
        {VALEURS.map((v, i) => (
          <Reveal key={v.titre} delay={0.1 * i} onScroll>
            <div className="group h-full rounded-2xl border border-noir-chaud/10 bg-white/40 p-8 shadow-sm shadow-noir-chaud/5 transition duration-300 hover:-translate-y-1 hover:border-laiton/40 hover:shadow-lg hover:shadow-noir-chaud/10">
              <span className="font-serif text-3xl text-laiton/50 transition group-hover:text-laiton">
                {v.numero}
              </span>
              <h2 className="mt-3 font-serif text-xl">{v.titre}</h2>
              <p className="mt-3 text-sm text-noir-chaud/70">{v.texte}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="border-t border-noir-chaud/10 bg-white/30 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal onScroll>
            <h3 className="font-serif text-2xl">Un lancement pensé pour la densité, pas la vitesse</h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-noir-chaud/70">
              Une offre dense avant de monétiser, pour que chacun constate que ça fonctionne
              réellement avant de s&apos;engager.
            </p>
          </Reveal>

          <Reveal delay={0.12} onScroll>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-8">
              <div>
                <p className="font-serif text-5xl text-bordeaux">
                  <CountUp value={200} />
                </p>
                <p className="mt-2 text-sm text-noir-chaud/60">
                  premières freelances
                  <br />
                  6 mois offerts, accès complet
                </p>
              </div>
              <div>
                <p className="font-serif text-5xl text-laiton">
                  <CountUp value={50} />
                </p>
                <p className="mt-2 text-sm text-noir-chaud/60">
                  premiers salons
                  <br />
                  3 mois offerts, accès complet
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2} onScroll>
            <p className="mx-auto mt-8 max-w-xl text-xs text-noir-chaud/50">
              Au-delà de ces quotas, l&apos;essai gratuit standard de 30 jours s&apos;applique.
            </p>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-noir-chaud/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-noir-chaud/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Hair&apos;Renfort — Île-de-France</span>
          <span>Mise en relation uniquement — aucun paiement de mission géré par la plateforme</span>
        </div>
      </footer>
    </main>
  );
}
