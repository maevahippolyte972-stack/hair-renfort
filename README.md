# Hair'Renfort

Plateforme de mise en relation entre salons de coiffure et coiffeurs freelances (renfort
ponctuel, non-exclusif). Voir `ARCHITECTURE.md` pour le détail des choix techniques et des
règles métier encodées dans le modèle de données.

## État du projet

MVP en cours de construction, dans l'ordre défini par le brief :

1. ✅ Inscription différenciée salon/freelance + vérifications + badges (`apps/api/src/modules/auth`, `.../verification`)
2. ✅ Mise en relation de base avec confidentialité appliquée au niveau des permissions (`.../missions`, `.../profiles`)
3. ✅ Recherche manuelle avec filtres, toutes formules salon (`.../matching/salon-search.*`)
4. ✅ Suggestion automatique — Premium salon + toutes les freelances (`.../matching/*`)
5. ✅ Dashboards de triangulation de preuves (`.../dashboards`)
6. ✅ Back-office administrateur (`.../admin`)
7. ⏳ Web : shell, design system et flux d'inscription en place (`apps/web`) ; swipe, dashboards,
   messagerie et back-office restent à construire côté interface.
8. ⏳ Paiements Stripe (abonnements), notifications push, upload de fichiers signé (S3) : à
   brancher sur les points d'extension déjà prévus dans le code.

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

# API
cp apps/api/.env.example apps/api/.env   # renseigner DATABASE_URL
pnpm db:migrate
pnpm db:generate
pnpm --filter @hair-renfort/db seed
pnpm --filter @hair-renfort/api dev      # http://localhost:4000

# Web (autre terminal)
cp apps/web/.env.example apps/web/.env
pnpm --filter @hair-renfort/web dev      # http://localhost:3000
```

## Points de configuration à trancher par la fondatrice

Voir `PlatformSetting` en base (modifiable depuis `/admin/settings` sans déploiement) :

- `urgency.thresholds_hours` — seuils déclenchant "urgent"/"très urgent" (défaut : 48h/24h)
- `reliability.cancellation_sanction` — seuils de sanction sur les annulations répétées
- `onboarding.founding_cohorts` — tailles et durées des cohortes de gratuité de lancement
