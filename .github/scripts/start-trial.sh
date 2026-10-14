#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/cf-lib.sh"

start_hana

echo "Restarting application '${CF_APP}'"
cf restart "$CF_APP"

check_health
