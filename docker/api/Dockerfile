# syntax=docker/dockerfile:1.6
# =============================================================================
# InfraForge API — multi-stage build
#   stage 1: compile a fully static Go binary on golang:alpine
#   stage 2: ship it on gcr.io/distroless/static-debian12 (no shell, no libc)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — builder
# -----------------------------------------------------------------------------
FROM golang:1.22-alpine AS builder

# git is needed for `go mod download` to fetch private/VCS deps;
# ca-certificates lets `go mod` talk to HTTPS module proxies.
RUN apk add --no-cache git ca-certificates tzdata && update-ca-certificates

WORKDIR /src

# Cache module downloads as their own layer so source edits don't bust them.
COPY src/api/go.mod src/api/go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy the rest of the source tree.
COPY src/api/ ./

ARG VERSION=dev
ARG COMMIT=unknown
ARG BUILD_DATE=unknown

# CGO_ENABLED=0 + -ldflags "-s -w" → fully static, stripped binary that runs
# on distroless/static. -trimpath strips local paths from the binary for
# reproducibility. The version/commit ldflags get surfaced via /healthz.
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
        -trimpath \
        -ldflags "-s -w \
            -X main.version=${VERSION} \
            -X main.commit=${COMMIT} \
            -X main.buildDate=${BUILD_DATE}" \
        -o /out/infraforge-api \
        ./cmd/server

# -----------------------------------------------------------------------------
# Stage 2 — runtime (distroless)
# -----------------------------------------------------------------------------
# distroless/static-debian12 contains: ca-certs, /etc/passwd (nonroot user),
# tzdata, /tmp. No shell, no package manager, no libc — minimal attack surface.
FROM gcr.io/distroless/static-debian12:nonroot AS runtime

# Copy CA bundle and timezone data from the builder so the binary can do
# TLS and time conversions without needing them baked into Go.
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Bring in the binary and embedded SQL migrations.
COPY --from=builder /out/infraforge-api /usr/local/bin/infraforge-api
COPY --from=builder /src/migrations /migrations

# distroless ships a 'nonroot' user (uid 65532) — never run as root.
USER nonroot:nonroot

# Service listens on 8080 by default.
EXPOSE 8080

# OCI labels — picked up by ECR / GitHub container registries.
LABEL org.opencontainers.image.title="infraforge-api" \
      org.opencontainers.image.description="InfraForge platform REST API" \
      org.opencontainers.image.source="https://github.com/aybzakaria5/infraforge" \
      org.opencontainers.image.licenses="MIT"

ENTRYPOINT ["/usr/local/bin/infraforge-api"]
