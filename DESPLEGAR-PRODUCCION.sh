#!/bin/sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

[ -f "$ENV_FILE" ] || { echo "Falta $ENV_FILE" >&2; exit 1; }
[ -f "apps/api/prisma/migrations/0_init/migration.sql" ] || {
  echo "BLOQUEANTE: falta la migración inicial versionada." >&2
  exit 1
}

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --pull

# El compose con PostgreSQL local inicia la DB primero; en managed DB no existe ese servicio.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d postgres 2>/dev/null || true

# Las migraciones se aplican antes de publicar la nueva API.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm api npm run db:deploy

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
