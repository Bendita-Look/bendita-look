#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/cf-lib.sh"

echo "Configuring email, push and store link for '${CF_APP}'"

if [[ -n "${SETTINGS_SECRET:-}" ]]; then
    cf set-env "$CF_APP" SETTINGS_SECRET "$SETTINGS_SECRET" > /dev/null
fi

if [[ -n "${SMTP_USER:-}" && -n "${SMTP_PASSWORD:-}" ]]; then
    cf set-env "$CF_APP" SMTP_HOST "$SMTP_HOST" > /dev/null
    cf set-env "$CF_APP" SMTP_PORT "$SMTP_PORT" > /dev/null
    cf set-env "$CF_APP" SMTP_USER "$SMTP_USER" > /dev/null
    cf set-env "$CF_APP" SMTP_PASSWORD "$SMTP_PASSWORD" > /dev/null
else
    echo "::notice::SMTP_USER or SMTP_PASSWORD is not configured, register the email server in the admin settings"
fi

if [[ -n "${VAPID_PUBLIC_KEY:-}" && -n "${VAPID_PRIVATE_KEY:-}" ]]; then
    cf set-env "$CF_APP" VAPID_PUBLIC_KEY "$VAPID_PUBLIC_KEY" > /dev/null
    cf set-env "$CF_APP" VAPID_PRIVATE_KEY "$VAPID_PRIVATE_KEY" > /dev/null
    cf set-env "$CF_APP" VAPID_SUBJECT "$VAPID_SUBJECT" > /dev/null
else
    echo "::notice::VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is not configured, push notifications stay disabled"
fi

cf set-env "$CF_APP" STORE_URL "$UI5_PAGES_URL" > /dev/null

cf restart "$CF_APP"

check_health
