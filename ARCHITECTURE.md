# Architecture technique — Hair'Renfort

## 1. Pourquoi ce stack

Contraintes du brief qui déterminent le choix :
- Web + mobile dès la conception, mobile natif en V2 → il faut pouvoir réutiliser le **backend et la logique métier** sans réécriture, et idéalement une partie du design system.
- Règle de visibilité croisée uniquement (freelance↔salon) **au niveau des permissions/API**, pas seulement de l'UI → il faut une API centrale avec des permissions strictes, pas du Next.js "full-stack" qui mélangerait requêtes DB et UI sans couche d'autorisation explicite.
- RGPD dès la conception, hébergement UE, chiffrement, anonymisation → PostgreSQL managé en UE + storage objet UE.
- Beaucoup de règles métier fines (urgence calculée, fiabilité ≠ note, refus ≠ annulation, segmentation Base/Premium) → un ORM typé avec des contraintes explicites et une couche service qui centralise ces règles, testable indépendamment de l'UI.

### Stack retenu

| Couche | Choix | Raison |
|---|---|---|
| Backend API | **NestJS (Node/TypeScript)** | Architecture modulaire (modules/guards/interceptors) adaptée à des règles de permissions strictes et testables ; sert web ET mobile via la même API REST. |
| Base de données | **PostgreSQL** (hébergeur UE — Scaleway, OVHcloud, ou Supabase région Frankfurt) | Conformité RGPD (hébergement UE), transactions fiables pour la double validation de mission, requêtes géographiques (PostGIS) pour le rayon de mobilité. |
| ORM | **Prisma** | Schéma typé unique partagé, migrations versionnées, lisible comme documentation vivante des règles métier. |
| Frontend web | **Next.js (React) + TypeScript** | SSR pour le SEO (landing, profils publics), responsive desktop/mobile, réutilise les mêmes types/DTO que l'API. |
| Mobile V2 | **React Native (Expo)** | Réutilise la même API NestJS, le même langage (TS), et peut partager une partie des composants avec le web via une lib de design tokens commune. C'est le choix qui évite le "web only puis adaptation" demandé dans le brief. |
| Stockage fichiers | **Object storage compatible S3, UE** (justificatifs, portfolio) | Chiffrement au repos, accès signé et limité aux admins habilités pour les pièces d'identité/diplômes. |
| Paiements (abonnements uniquement) | **Stripe** (Stripe Billing) | Aucune donnée bancaire ne transite par nos serveurs ; gère essai 30 jours, cohortes de gratuité, échecs de prélèvement. |
| Auth | JWT + refresh token, hashage Argon2 | Simple, stateless, compatible web + mobile. |
| File d'attente / notifications push | **BullMQ (Redis)** pour les jobs (recalcul d'urgence, notifications), **push** via service compatible (FCM/APNs plus tard pour le natif ; web push en V1) | Le calcul d'urgence et les notifications anticipées doivent être planifiés (cron / jobs), pas seulement calculés à la volée. |
| Monorepo | **pnpm workspaces + Turborepo** | Un seul schéma Prisma et un seul jeu de types partagés entre `api`, `web` et (V2) `mobile`. |

### Organisation du monorepo

```
hair-renfort/
  apps/
    api/     → NestJS : toute la logique métier, permissions, RGPD, back-office
    web/     → Next.js : UI salon + freelance + admin, consomme l'API
    (mobile/ → V2, React Native, consomme la même API)
  packages/
    db/      → schéma Prisma (source de vérité du modèle de données) + client généré
    shared/  → types partagés, constantes (seuils d'urgence, catégories de signalement, palette)
```

## 2. La règle de confidentialité, au niveau des permissions

C'est la contrainte la plus structurante du brief : elle est appliquée à **trois niveaux**, jamais seulement dans l'UI.

1. **Modèle de données** : il n'existe aucune requête Prisma dans le code qui liste des `FreelanceProfile` pour un appelant `FREELANCE`, ni de `SalonProfile` pour un appelant `SALON`. Les services sont séparés par rôle (`FreelanceFacingService` ne peut interroger que des salons, `SalonFacingService` ne peut interroger que des freelances) : ce n'est pas un filtre appliqué après coup, c'est une impossibilité structurelle du code.
2. **Guards NestJS** (`RolesGuard`, `OwnershipGuard`) : chaque endpoint déclare le rôle appelant requis et vérifie que la ressource demandée appartient bien "au camp opposé".
3. **DTO de sortie** : les DTO de réponse pour un profil freelance n'exposent jamais les champs d'un autre freelance à un appelant freelance, même par erreur d'un futur développeur — le typage TypeScript des retours de service rend cette confusion impossible à compiler.

Voir `packages/db/schema.prisma` pour le détail des entités et `apps/api/src/modules/*` pour la structure des modules.

## 3. Ordre de construction du MVP (repris du brief)

1. **Inscription différenciée + vérifications** (salon et freelance), badge "Vérifiée"/"Salon vérifié", back-office pour valider — sans ça, personne ne peut légalement publier ou candidater.
2. **Mise en relation de base** avec la règle de confidentialité appliquée dès le modèle.
3. **Recherche manuelle avec filtres** (tous salons, formule Base incluse).
4. **Algorithme de suggestion automatique** (Premium salon + toutes les freelances).
5. En parallèle, dès que des missions ont un historique : **dashboards de preuve** (triangulation), taux de fiabilité, calcul d'urgence.

## 4. Points de configuration (à trancher par la fondatrice)

Rien n'est codé en dur : `packages/db/schema.prisma` contient une table `PlatformSetting` (clé/valeur) pour :
- Les seuils d'urgence (défaut proposé : 48h → `URGENT`, 24h → `TRES_URGENT`), modifiables depuis le back-office sans déploiement.
- Les seuils de sanction sur les annulations répétées (nombre, fenêtre de temps).

## 5. RGPD — décisions d'architecture

- Hébergement UE imposé au niveau infra (pas de choix de provider hors UE).
- `ConsentRecord` distinct pour CGU et marketing, horodaté, avec adresse IP.
- Suppression de compte → anonymisation des champs identifiants (nom, email, téléphone, pièces jointes supprimées du storage) mais conservation des lignes de mission (montants agrégés, dates) pour ne pas fausser l'historique/les preuves de l'autre partie — champ `anonymizedAt`.
- Pièces justificatives (diplôme, SIRET, RC Pro, identité gérant) dans un bucket séparé, accès signé, lisible uniquement par les comptes `ADMIN`.
- Chaque table sensible a des commentaires de durée de conservation dans le schéma (à formaliser dans un registre des traitements séparé, hors code).
