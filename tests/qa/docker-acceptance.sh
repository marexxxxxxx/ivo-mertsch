#!/usr/bin/env bash
# =============================================================================
# MARAA-7 — Docker-Abnahme (Nachziehung zu MARAA-6 / F-5)
#
# Reproduzierbare Verifikation der sechs Abnahmepunkte aus dem Issue MARAA-7.
# Muss in einer Umgebung MIT Docker-Zugriff laufen (sonst Prolog-Fail).
#
# Keine Secrets: es werden ausschliesslich Default-/Leerzustands-Container
# gestartet. Ein Key wird NICHT uebergeben.
#
# Nutzung:
#   tests/qa/docker-acceptance.sh [IMAGE_TAG] [HOST_PORT]
# Default: IMAGE_TAG=ivo-mertsch:1.0.0  HOST_PORT=4321
#
# Belege landen unter docs/qa/evidence/docker/ (JSON + TXT).
# Exit 0 = alle sechs Punkte bestanden; Exit 1 = mindestens ein Fail.
# =============================================================================
set -uo pipefail

IMAGE="${1:-ivo-mertsch:1.0.0}"
HOST_PORT="${2:-4321}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="$REPO_ROOT/docs/qa/evidence/docker"
CONTAINER="maraa7-docker-acceptance-$$"
RESULTS="$OUT_DIR/results.tsv"

PASS=0; FAIL=0; SKIP=0
mkdir -p "$OUT_DIR"
: > "$RESULTS"

record() { # status criterion evidence
  printf '%s\t%s\t%s\n' "$1" "$2" "$3" >> "$RESULTS"
  printf '[%s] %s\n' "$1" "$2"
  case "$1" in PASS) PASS=$((PASS+1));; FAIL) FAIL=$((FAIL+1));; SKIP) SKIP=$((SKIP+1));; esac
}

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

# ---- Prolog: Docker-Zugriff vorhanden? -------------------------------------
if ! docker info >/dev/null 2>&1; then
  echo "FAIL: Kein Docker-Zugriff (docker info schlaegt fehl)." >&2
  echo "      Prolog-Fail — kein Abnahmeversuch. Unblock-Owner: CEO/Infrastruktur." >&2
  record FAIL "Prolog:Docker-Zugriff" "docker info fehlgeschlagen — kein Socket/DOCKER_HOST"
  exit 1
fi

cd "$REPO_ROOT"

# ---- 1. docker build -------------------------------------------------------
if docker build -t "$IMAGE" . >"$OUT_DIR/build.log" 2>&1; then
  tail -n 15 "$OUT_DIR/build.log" > "$OUT_DIR/build-tail.txt"
  record PASS "1:docker build" "build-tail.txt (15 Zeilen)"
else
  tail -n 30 "$OUT_DIR/build.log" > "$OUT_DIR/build-tail.txt"
  record FAIL "1:docker build" "build-tail.txt — Build fehlgeschlagen"
  exit 1
fi

# ---- 6a. Image-Groesse -----------------------------------------------------
docker images "$IMAGE" --format '{{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.ID}}' \
  > "$OUT_DIR/image-size.txt" 2>&1
if [ -s "$OUT_DIR/image-size.txt" ]; then
  record PASS "6a:Image-Groesse" "image-size.txt — $(cut -f2 "$OUT_DIR/image-size.txt" | head -1)"
else
  record FAIL "6a:Image-Groesse" "image-size.txt leer"
fi

# ---- 2. docker run ---------------------------------------------------------
if docker run -d --name "$CONTAINER" -p "${HOST_PORT}:4321" "$IMAGE" >"$OUT_DIR/run-id.txt" 2>&1; then
  record PASS "2:docker run" "container=$CONTAINER, host-port=$HOST_PORT"
else
  record FAIL "2:docker run" "run-id.txt — Start fehlgeschlagen"
  exit 1
fi

# ---- 3. Healthcheck-Status (aus docker inspect) ----------------------------
# Polling statt waitForTimeout: aktiv auf den Daemon-Status warten (max ~60 s).
HEALTH=""
for _ in $(seq 1 30); do
  HEALTH="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER" 2>/dev/null || echo error)"
  [ "$HEALTH" = "healthy" ] && break
  [ "$HEALTH" = "unhealthy" ] && break
  sleep 2
done
docker inspect --format '{{json .State.Health}}' "$CONTAINER" > "$OUT_DIR/healthcheck.json" 2>&1
if [ "$HEALTH" = "healthy" ]; then
  record PASS "3:Healthcheck healthy" "healthcheck.json — Status=$HEALTH"
else
  record FAIL "3:Healthcheck" "healthcheck.json — Status=$HEALTH (erwartet: healthy)"
fi

# ---- 3b. GET /api/healthz -> 200 ------------------------------------------
HZ_CODE="$(curl -s -o "$OUT_DIR/healthz-body.txt" -w '%{http_code}' "http://127.0.0.1:${HOST_PORT}/api/healthz" || echo 000)"
if [ "$HZ_CODE" = "200" ]; then
  record PASS "3b:GET /api/healthz=200" "healthz-body.txt HTTP $HZ_CODE"
else
  record FAIL "3b:GET /api/healthz" "HTTP $HZ_CODE (erwartet 200)"
fi

# ---- 4. GET / -> 200 -------------------------------------------------------
ROOT_CODE="$({ curl -s -o "$OUT_DIR/root-body.html" -w '%{http_code}' "http://127.0.0.1:${HOST_PORT}/" || echo 000; })"
if [ "$ROOT_CODE" = "200" ]; then
  record PASS "4:GET /=200" "root-body.html HTTP $ROOT_CODE"
else
  record FAIL "4:GET /" "HTTP $ROOT_CODE (erwartet 200)"
fi

# ---- 5. Keine Buildzeit-Artefakte / Secrets im Image ----------------------
docker run --rm "$IMAGE" ls -la /app > "$OUT_DIR/app-listing.txt" 2>&1
docker history --no-trunc "$IMAGE" > "$OUT_DIR/history.txt" 2>&1
SECRET_HITS="$(grep -riE '(secret|password|passwd|api[_-]?key|token|BEGIN [A-Z ]*PRIVATE KEY)' "$OUT_DIR/app-listing.txt" "$OUT_DIR/history.txt" || true)"
SRC_HITS="$(grep -E '(^\s*(-|d).*\s(src|tests|\.git|\.env|\.astro|coverage|playwright-report|test-results)\s*$)' "$OUT_DIR/app-listing.txt" || true)"
if [ -n "$SECRET_HITS" ] || [ -n "$SRC_HITS" ]; then
  record FAIL "5:Keine Artefakte/Secrets" "app-listing.txt / history.txt — siehe Treffer"
  printf '%s\n' "$SECRET_HITS" "$SRC_HITS" > "$OUT_DIR/artefact-hits.txt"
else
  record PASS "5:Keine Artefakte/Secrets" "app-listing.txt + history.txt — keine Treffer"
fi

# ---- Zusammenfassung -------------------------------------------------------
{
  echo "MARAA-7 Docker-Abnahme — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Image: $IMAGE   Host-Port: $HOST_PORT"
  echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
  echo
  column -t -s $'\t' "$RESULTS" 2>/dev/null || cat "$RESULTS"
} | tee "$OUT_DIR/summary.txt"

echo "Belege: $OUT_DIR"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
