#!/usr/bin/env bash
# Exécuté UNE FOIS à la création du Codespace : installe, migre, seed.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "→ Activation de pnpm (corepack)…"
corepack enable
corepack prepare pnpm@10.33.0 --activate

echo "→ Attente de PostgreSQL…"
until (echo > /dev/tcp/db/5432) 2>/dev/null; do sleep 1; done
echo "  Postgres prêt."

echo "→ Installation des dépendances…"
pnpm install

echo "→ Build de packages/shared…"
pnpm --filter @hair-renfort/shared build

source .devcontainer/compute-urls.sh
echo "→ URLs détectées : web=$WEB_URL api=$API_URL"

cat > apps/api/.env <<EOF
DATABASE_URL="postgresql://postgres:postgres@db:5432/hairrenfort"
JWT_SECRET="codespaces-demo-secret-change-me"
WEB_ORIGIN="$WEB_URL"
PORT=4000
EOF

cat > apps/web/.env.local <<EOF
NEXT_PUBLIC_API_URL="$API_URL"
EOF

echo "→ Migration de la base de données…"
pnpm --filter @hair-renfort/db exec prisma migrate deploy
pnpm --filter @hair-renfort/db exec prisma generate

echo "→ Données de base (spécialités, réglages)…"
pnpm --filter @hair-renfort/db seed

echo "→ Comptes de démonstration…"
pnpm --filter @hair-renfort/db seed:demo

echo "✓ Installation terminée."
