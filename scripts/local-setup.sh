#!/usr/bin/env bash
#
# local-setup.sh — bootstrap the full InfraForge local environment.
#
# Brings up:
#   1. docker-compose dev stack (LocalStack + Postgres + registry)
#   2. k3d cluster wired to the local registry
#   3. terraform init for the local environment
#
# Idempotent: safe to re-run. Existing resources are reused.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CLUSTER_NAME="infraforge"
COMPOSE_FILE="docker-compose.dev.yml"
K3D_CONFIG="k3d-config.yaml"
TF_LOCAL_DIR="terraform/environments/local"

# --- pretty output -----------------------------------------------------------
c_reset="\033[0m"; c_blue="\033[1;34m"; c_green="\033[1;32m"; c_red="\033[1;31m"
log()  { printf "${c_blue}==>${c_reset} %s\n" "$*"; }
ok()   { printf "${c_green}ok${c_reset}  %s\n" "$*"; }
fail() { printf "${c_red}!!${c_reset}  %s\n" "$*" >&2; exit 1; }

# --- prerequisite checks -----------------------------------------------------
require() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required tool: $1"
}

log "checking prerequisites"
require docker
require k3d
require kubectl
require terraform
docker info >/dev/null 2>&1 || fail "docker daemon is not running"
ok "all prerequisites present"

# --- 1. docker compose stack -------------------------------------------------
log "starting docker compose dev stack"
docker compose -f "$COMPOSE_FILE" up -d
ok "compose stack up"

log "waiting for LocalStack to become healthy"
for i in {1..30}; do
  if curl -fsS http://localhost:4566/_localstack/health >/dev/null 2>&1; then
    ok "LocalStack ready"
    break
  fi
  [[ $i -eq 30 ]] && fail "LocalStack did not become healthy in time"
  sleep 2
done

log "waiting for Postgres to accept connections"
for i in {1..30}; do
  if docker exec infraforge-postgres pg_isready -U infraforge >/dev/null 2>&1; then
    ok "Postgres ready"
    break
  fi
  [[ $i -eq 30 ]] && fail "Postgres did not become ready in time"
  sleep 1
done

# --- 2. k3d cluster ----------------------------------------------------------
if k3d cluster list 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "$CLUSTER_NAME"; then
  ok "k3d cluster '$CLUSTER_NAME' already exists — reusing"
else
  log "creating k3d cluster from $K3D_CONFIG"
  k3d cluster create --config "$K3D_CONFIG"
  ok "k3d cluster created"
fi

log "waiting for cluster nodes to be Ready"
kubectl --context "k3d-${CLUSTER_NAME}" wait --for=condition=Ready nodes --all --timeout=120s
ok "cluster nodes ready"

# --- 3. terraform init -------------------------------------------------------
if [[ -d "$TF_LOCAL_DIR" ]]; then
  log "running terraform init in $TF_LOCAL_DIR"
  ( cd "$TF_LOCAL_DIR" && terraform init -upgrade -input=false )
  ok "terraform initialised"
fi

# --- summary -----------------------------------------------------------------
cat <<EOF

${c_green}InfraForge local environment is up.${c_reset}

  LocalStack    http://localhost:4566
  Postgres      postgres://infraforge:infraforge@localhost:5432/infraforge
  Registry      http://localhost:5000
  Cluster       kubectl --context k3d-${CLUSTER_NAME} get nodes
  Ingress       http://localhost:8080

Next steps:
  cd ${TF_LOCAL_DIR} && terraform plan
  make help

EOF
