# syntax=docker/dockerfile:1.6
# =============================================================================
# InfraForge UI — multi-stage build
#   stage 1: install deps + build the Vite bundle on node:20-alpine
#   stage 2: serve static files on nginx:alpine with custom SPA config
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps as their own layer so source edits don't bust the npm cache.
COPY src/ui/package.json src/ui/package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Copy the rest of the source tree.
COPY src/ui/ ./

ARG VERSION=dev
ENV VITE_APP_VERSION=${VERSION}
ENV NODE_ENV=production

# Vite emits the production bundle to /app/dist
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2 — runtime (nginx:alpine)
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Drop the stock nginx config and ship ours instead.
RUN rm -rf /etc/nginx/conf.d /etc/nginx/nginx.conf
COPY docker/ui/nginx.conf /etc/nginx/nginx.conf

# Copy the built static assets.
COPY --from=builder /app/dist /usr/share/nginx/html

# Run nginx as the unprivileged 'nginx' user (uid 101) on port 8080 — required
# so the container can run on Kubernetes with a non-root securityContext.
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx \
    && touch /tmp/nginx.pid \
    && chown nginx:nginx /tmp/nginx.pid

USER nginx

EXPOSE 8080

LABEL org.opencontainers.image.title="infraforge-ui" \
      org.opencontainers.image.description="InfraForge platform React dashboard" \
      org.opencontainers.image.source="https://github.com/aybzakaria5/infraforge" \
      org.opencontainers.image.licenses="MIT"

# Healthcheck hits the /healthz route defined in nginx.conf
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
