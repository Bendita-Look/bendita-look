#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/cf-lib.sh"

if [[ -z "${SMTP_USER:-}" || -z "${SMTP_PASSWORD:-}" ]]; then
    echo "::warning::SMTP_USER or SMTP_PASSWORD is not configured, emails stay disabled"
    exit 0
fi

echo "Configuring email and store link for '${CF_APP}'"
cf set-env "$CF_APP" SMTP_HOST "$SMTP_HOST" > /dev/null
cf set-env "$CF_APP" SMTP_PORT "$SMTP_PORT" > /dev/null
cf set-env "$CF_APP" SMTP_USER "$SMTP_USER" > /dev/null
cf set-env "$CF_APP" SMTP_PASSWORD "$SMTP_PASSWORD" > /dev/null
cf set-env "$CF_APP" STORE_URL "$UI5_PAGES_URL" > /dev/null

cf restart "$CF_APP"

check_health
