# InfraForge

An Internal Developer Platform (IDP) that lets developers self-service infrastructure provisioning through a web portal. Request an environment, pick a template, and the platform handles the rest — Terraform provisions it, CI/CD builds and scans it, ArgoCD deploys it to Kubernetes, and Prometheus monitors it. Zero tickets, zero manual work.

## How It Works

```
Developer → Self-Service UI → Go API → Terraform → ArgoCD → Kubernetes → Observability
```

A developer picks an environment template (dev/staging/production), selects a resource tier, and clicks deploy. The platform orchestrates the full lifecycle from cloud resources to running pods with monitoring.

## Architecture

InfraForge supports two deployment modes sharing identical modules and charts:

| | Local Development | AWS Demo |
|---|---|---|
| **Kubernetes** | k3d (k3s in Docker) | EKS managed node groups |
| **AWS Services** | LocalStack | Real AWS (VPC, RDS, S3, ECR) |
| **Database** | PostgreSQL in Docker | RDS PostgreSQL Multi-AZ |
| **Cost** | Free | ~$5-8/hr (destroy after recording) |
| **Start** | `make local-up` | `make demo-up` |
| **Stop** | `make local-down` | `make demo-down` |

See [docs/architecture.md](docs/architecture.md) for the full architecture overview, layer breakdown, and request flow.

## Status

Built in phases. Current state:

- ✅ **Phase 1 — Foundation**: repo scaffolding, VPC and IAM modules, pre-commit hooks, architecture doc
- ✅ **Phase 2 — Kubernetes & Data**: EKS (managed node groups + OIDC), RDS PostgreSQL (Multi-AZ + backups), S3 (versioning + lifecycle), ECR (lifecycle policies), LocalStack provider, k3d cluster config, `docker-compose.dev.yml`, one-command local bootstrap (`scripts/local-setup.sh`)
- ⏳ **Phase 3 — CI/CD & GitOps**: GitLab pipeline, Helm charts, ArgoCD app-of-apps
- ⏳ **Phase 4 — Go API**
- ⏳ **Phase 5 — React Dashboard**
- ⏳ **Phase 6 — Observability**
- ⏳ **Phase 7 — Security & Policies**
- ⏳ **Phase 8 — Documentation & Polish**

## Tech Stack

**Infrastructure & IaC**
- Terraform (modular, environment-agnostic)
- Ansible (node setup, OS hardening)
- Packer (hardened AMIs)

**Cloud & Orchestration**
- AWS (VPC, EKS, RDS, S3, ECR, IAM, KMS, Route 53)
- Kubernetes (k3d for local, EKS for AWS)
- Helm (application and platform service charts)

**CI/CD & GitOps**
- GitLab CI (lint → test → build → scan → push → deploy)
- ArgoCD (app-of-apps pattern, canary rollouts)

**Application**
- Go REST API (pgx, golang-migrate)
- React + TypeScript dashboard (Vite, TailwindCSS, Recharts)

**Observability**
- Prometheus + Grafana + Loki + Alertmanager
- OpenTelemetry tracing in the API

**Security & Policy**
- OPA/Gatekeeper (cluster policies)
- Trivy (image scanning)
- Vault + external-secrets operator
- Network policies for namespace isolation

## Project Structure

```
infraforge/
├── terraform/           # IaC — modules + environment configs
│   ├── modules/         #   vpc, eks, rds, s3, iam, ecr, observability
│   └── environments/    #   local (LocalStack) + aws (real AWS)
├── ansible/             # Configuration management
├── packer/              # AMI templates
├── helm/                # Kubernetes charts
│   ├── infraforge-api/
│   ├── infraforge-ui/
│   └── platform-services/
├── argocd/              # GitOps application manifests
├── docker/              # Dockerfiles (multi-stage, distroless)
├── src/
│   ├── api/             # Go REST API
│   └── ui/              # React dashboard
├── policies/            # OPA/Gatekeeper rego files
├── scripts/             # Automation (local-setup, demo-up/down)
├── docs/                # Architecture, ADRs, runbooks
├── Makefile             # All automation targets (make help)
└── docker-compose.dev.yml
```

## Quick Start

```bash
# Clone the repo
git clone https://github.com/aybzakaria5/infraforge.git
cd infraforge

# See available commands
make help

# Start local development stack (requires Docker)
make local-up
```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [ADRs](docs/adr/) — Architecture Decision Records
- [Runbooks](docs/runbooks/) — Operational procedures

## License

[MIT](LICENSE)
