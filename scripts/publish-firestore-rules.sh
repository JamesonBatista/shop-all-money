#!/usr/bin/env bash
# Publishes firestore.rules to the shop-all-money Firebase project.
# Requires: npm, and a Firebase login (browser or CI token).
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v npx >/dev/null; then
  echo "npx is required"
  exit 1
fi

echo "Project: shop-all-money"
echo "Publishing firestore.rules ..."
npx --yes firebase-tools@latest deploy --only firestore:rules --project shop-all-money
echo "Done. New registrations and metrics should appear in Firestore."
