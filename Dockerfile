# syntax=docker/dockerfile:1
# =============================================================================
# Ivo Mertsch — ein Image, ein Prozess (ADR 0001 §8.1).
# Multi-Stage, Non-Root, Healthcheck, genau ein CMD. Keine Secrets im Image:
# alle Geheimnisse werden zur LAUFZEIT per `docker run -e` injiziert.
# Paketmanager: npm (mit package-lock.json) statt pnpm — reine Umsetzungs-
# entscheidung, im ADR als reviewpflichtiges Detail benannt (§8.1).
# =============================================================================

# ---- Stage 1: Produktions-Abhaengigkeiten ----------------------------------
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 2: Build ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# prebuild validiert content/ gegen docs/contracts (ADR §9.2). Ungueltiger
# Content bricht den Build ab, statt still falsche Daten auszuliefern.
RUN npm run build

# ---- Stage 3: Runtime -------------------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=4321 \
    HOST=0.0.0.0 \
    REVIEWS_CACHE_DIR=.cache
WORKDIR /app
# Nur Produktionsabhaengigkeiten, der Build-Output und die package.json.
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./package.json
# Volume-Punkt fuer den Places-Inhalts-Cache (nicht ins Image gebacken).
RUN mkdir -p /app/.cache && chown -R node:node /app/.cache
USER node
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4321)+'/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "./dist/server/entry.mjs"]
