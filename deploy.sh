#!/usr/bin/env bash
# Deploy estándar Prasia — lo ejecuta Boteli en el VPS tras `git pull`.
# Uso (vía Boteli): cd /opt/prasia-web && git pull && bash deploy.sh
set -euo pipefail

echo "==> prasia-web: web estática servida por Nginx, sin build."
echo "==> Cambios ya activos tras git pull. OK"
