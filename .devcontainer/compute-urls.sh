#!/usr/bin/env bash
# Calcule les URLs publiques (web/API) selon l'environnement : Codespaces si détecté,
# sinon localhost (devcontainer local via Docker Desktop).
set -euo pipefail

if [ -n "${CODESPACE_NAME:-}" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  WEB_URL="https://${CODESPACE_NAME}-3000.${DOMAIN}"
  API_URL="https://${CODESPACE_NAME}-4000.${DOMAIN}"
else
  WEB_URL="http://localhost:3000"
  API_URL="http://localhost:4000"
fi

export WEB_URL
export API_URL
