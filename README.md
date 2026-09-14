# Hair'Renfort

Plateforme de mise en relation entre salons de coiffure et coiffeurs freelances (renfort
ponctuel, non-exclusif). Voir `ARCHITECTURE.md` pour le détail des choix techniques et des
règles métier encodées dans le modèle de données.

## Tester sans rien installer (GitHub Codespaces)

1. Sur cette page GitHub, bouton vert **Code** → onglet **Codespaces** → **Create codespace on
   claude/new-session-p07wi0** (ou la branche courante).
2. Patientez ~2-3 minutes (installation + base de données + comptes de démonstration créés
   automatiquement) — la progression s'affiche dans le terminal.
3. Une notification "Your application running on port 3000 is available" apparaît : cliquez
   **Open in Browser**.
4. Connectez-vous avec un des comptes de démonstration (mot de passe `motdepasse123`) :
   - Salon (Premium) : `contact@atelier17.fr`
   - Freelance : `inaya@example.com` ou `lea@example.com`

Tout tourne dans le Codespace (Postgres inclus) — rien n'est installé sur votre machine, et
personne d'autre que vous n'y a accès (lien privé, lié à votre compte GitHub).

## État du projet

MVP en cours de construction, dans l'ordre défini par le brief :

1. ✅ Inscription différenciée salon/freelance + vérifications + badges (`apps/api/src/modules/auth`, `.../verification`)
2. ✅ Mise en relation de base avec confidentialité appliquée au niveau des permissions (`.../missions`, `.../profiles`)
3. ✅ Recherche manuelle avec filtres, toutes formules salon (`.../matching/salon-search.*`)
4. ✅ Suggestion automatique — Premium salon + toutes les freelances (`.../matching/*`)
5. ✅ Dashboards de triangulation de preuves (`.../dashboards`)
6. ✅ Back-office administrateur (`.../admin`)
7. ✅ Web : shell, design system, flux d'inscription, découverte façon swipe, recherche,
   publication, missions, repères, messagerie (`apps/web`).
8. ⏳ Paiements Stripe (abonnements), notifications push, upload de fichiers signé (S3),
   interface du back-office (aujourd'hui API-only) : à brancher sur les points d'extension
   déjà prévus dans le code.

## Structure

```
apps/
  api/   → NestJS, toute la logique métier et les permissions
  web/   → Next.js, interface web
packages/
  db/    → schéma Prisma (source de vérité du modèle de données)
  shared/→ constantes partagées (seuils, palette, prix)
```

## Démarrer en local

Prérequis : Node ≥ 20, pnpm, une base PostgreSQL (UE en production, locale en dev).

```bash
pnpm install
pnpm --filter @hair-renfort/shared build  # requis avant l'API/le web (voir note ci-dessous)

# API
cp apps/api/.env.example apps/api/.env   # renseigner DATABASE_URL
pnpm db:migrate
pnpm db:generate
pnpm --filter @hair-renfort/db seed
pnpm --filter @hair-renfort/db seed:demo # optionnel : comptes de démo (voir plus haut)
pnpm --filter @hair-renfort/api dev      # http://localhost:4000

# Web (autre terminal)
cp apps/web/.env.example apps/web/.env
pnpm --filter @hair-renfort/web dev      # http://localhost:3000
```

`packages/shared` est compilé (pas consommé en `.ts` brut) car l'API tourne sous Node en
CommonJS : sans ce build, `apps/api` échoue au démarrage avec une erreur de résolution de
module. `pnpm dev` à la racine (via Turborepo) le rebuild automatiquement ; en lançant
`apps/api`/`apps/web` directement il faut le faire à la main après toute modification de
`packages/shared`.

## Points de configuration à trancher par la fondatrice

Voir `PlatformSetting` en base (modifiable depuis `/admin/settings` sans déploiement) :

- `urgency.thresholds_hours` — seuils déclenchant "urgent"/"très urgent" (défaut : 48h/24h)
- `reliability.cancellation_sanction` — seuils de sanction sur les annulations répétées
- `onboarding.founding_cohorts` — tailles et durées des cohortes de gratuité de lancement
