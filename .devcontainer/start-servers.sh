#!/usr/bin/env bash
# Exécuté À CHAQUE démarrage du Codespace : (re)calcule les URLs et (re)lance les serveurs.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

source .devcontainer/compute-urls.sh

cat > apps/api/.env <<EOF
DATABASE_URL="postgresql://postgres:postgres@db:5432/hairrenfort"
JWT_SECRET="codespaces-demo-secret-change-me"
WEB_ORIGIN="$WEB_URL"
PORT=4000
EOF

cat > apps/web/.env.local <<EOF
NEXT_PUBLIC_API_URL="$API_URL"
EOF

mkdir -p /tmp/hair-renfort-logs

if ! (echo > /dev/tcp/localhost/4000) 2>/dev/null; then
  echo "→ Démarrage de l'API…"
  (cd apps/api && nohup pnpm dev > /tmp/hair-renfort-logs/api.log 2>&1 &)
fi

if ! (echo > /dev/tcp/localhost/3000) 2>/dev/null; then
  echo "→ Démarrage du site web…"
  (cd apps/web && nohup pnpm dev > /tmp/hair-renfort-logs/web.log 2>&1 &)
fi

cat <<EOF

────────────────────────────────────────────────────────
  Hair'Renfort — prêt à tester

  Web : $WEB_URL
  (l'onglet PORTS ci-dessous vous donnera le lien cliquable
   dès que le port 3000 sera détecté — ça prend ~10-20s)

  Comptes de démonstration (mot de passe : motdepasse123) :
    Salon      contact@atelier17.fr
    Freelance  inaya@example.com
    Freelance  lea@example.com
    Freelance  fatou@example.com
────────────────────────────────────────────────────────

EOF
