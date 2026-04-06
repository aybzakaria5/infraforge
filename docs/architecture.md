# Architecture Overview

InfraForge is an Internal Developer Platform (IDP) that abstracts away infrastructure complexity. Developers request environments through a web portal, and the platform handles provisioning, deployment, and monitoring automatically.

## Platform Concept

The core idea: developers should never file a ticket to get an environment. They pick a template, click a button, and the platform orchestrates everything — from spinning up cloud resources to deploying their application with full observability.

```
Developer Request → Self-Service API → Terraform Provision → GitOps Deploy → Observability
```

No tickets. No waiting. No "can you SSH into the box and restart the service."

## Dual-Mode Architecture

InfraForge runs in two modes sharing the same Terraform modules, Helm charts, and application code:

### Local Development (default)

For day-to-day development and testing. Runs entirely on your machine with no cloud costs.

```
┌─────────────────────────────────────────────────────────┐
│  Docker Host                                            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   k3d        │  │  LocalStack  │  │  PostgreSQL   │  │
│  │  (k8s in     │  │  (AWS API    │  │  (app state)  │  │
│  │   Docker)    │  │   emulator)  │  │              │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
│         │                                               │
│  ┌──────┴───────────────────────────────────────────┐   │
│  │  Helm Charts: API, UI, Prometheus, Grafana, Loki │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

Start: make local-up    Stop: make local-down
```

- **k3d** runs a lightweight Kubernetes cluster (k3s) inside Docker containers
- **LocalStack** emulates AWS services (S3, IAM, SQS, SNS, SecretsManager) so Terraform modules work without real AWS credentials
- **PostgreSQL** runs in Docker Compose for the API's application state
- Helm charts deploy the same way they would on a real cluster

### AWS Demo (temporary, for recording)

Full cloud deployment for demo recordings. Spin up, record, destroy.

```
┌─────────────────────────────────────────────────────────┐
│  AWS Account                                            │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   VPC    │  │   EKS    │  │   RDS    │              │
│  │  3 AZs   │  │  Managed │  │ Postgres │              │
│  │  NAT GW  │  │  Nodes   │  │ Multi-AZ │              │
│  └──────────┘  └────┬─────┘  └──────────┘              │
│                     │                                   │
│  ┌──────────┐  ┌────┴─────┐  ┌──────────┐              │
│  │   ECR    │  │  ArgoCD  │  │   ALB    │              │
│  │  Images  │  │  GitOps  │  │  Ingress │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Prometheus + Grafana + Loki (Helm on EKS)       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

Start: make demo-up (~15 min)    Stop: make demo-down
```

Both modes use identical Terraform modules — the only difference is the provider configuration (LocalStack endpoints vs real AWS).

## Layers

### 1. Infrastructure (Terraform)

Modular Terraform defining all cloud resources. Each module (VPC, EKS, RDS, S3, IAM, ECR) is self-contained with its own variables, outputs, and README.

```
terraform/
├── modules/         # Reusable, environment-agnostic
└── environments/
    ├── local/       # Provider → LocalStack
    └── aws/         # Provider → Real AWS
```

### 2. Configuration (Ansible + Packer)

Ansible playbooks handle node setup and OS hardening. Packer builds hardened AMIs based on CIS benchmarks for the AWS deployment mode.

### 3. Orchestration (Kubernetes + Helm)

All workloads run on Kubernetes. Helm charts package deployments for:
- **infraforge-api** — the Go REST API
- **infraforge-ui** — the React dashboard
- **platform-services** — Prometheus, Grafana, Loki, ArgoCD

Each chart has environment-specific values files (`values-local.yaml`, `values-aws.yaml`).

### 4. Delivery (GitLab CI/CD + ArgoCD)

GitLab CI handles the build pipeline: lint → test → build → scan → push images. ArgoCD watches the Git repo and syncs desired state to the cluster using an app-of-apps pattern.

### 5. Application

- **API (Go)** — REST endpoints for environment CRUD, deployment triggers, health checks. Talks to PostgreSQL via pgx, structured as cmd/internal/pkg.
- **UI (React)** — Dashboard for managing environments, viewing deployments, monitoring cluster health. Dark-first design, dense layout, monospaced data.

### 6. Observability (Prometheus + Grafana + Loki)

- **Prometheus** scrapes metrics from the API and cluster components
- **Grafana** dashboards visualize cluster health, app performance, and cost
- **Loki** aggregates logs from all pods via Promtail
- **Alertmanager** routes alerts for error spikes, crash loops, resource pressure

### 7. Security & Policy

- **OPA/Gatekeeper** enforces cluster policies (no privileged pods, require resource limits, require labels)
- **Trivy** scans container images in CI
- **Network Policies** isolate namespaces
- **Vault** manages secrets with external-secrets operator syncing to Kubernetes

## Request Flow

What happens when a developer creates an environment:

```
1. Developer clicks "New Environment" in the UI
2. UI calls POST /api/v1/environments with template + config
3. API validates request, stores in PostgreSQL
4. API triggers Terraform run for the requested resources
5. Terraform provisions infrastructure (or simulates via LocalStack)
6. API creates ArgoCD Application manifest
7. ArgoCD detects the new manifest, deploys workloads to the namespace
8. Prometheus begins scraping the new endpoints
9. UI polls deployment status, shows pipeline progress
10. Environment is live — developer gets the URL
```

## Directory Structure

See the project root `README.md` for the full directory tree.
