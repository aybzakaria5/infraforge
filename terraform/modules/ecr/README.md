# ECR Module

Creates one or more ECR repositories with image scanning, immutable tags, AES256 encryption, and lifecycle policies that prune old images automatically. Defaults provision repos for the API and UI.

## What Gets Created

- **ECR Repositories** — one per entry in `var.repositories` (defaults: `api`, `ui`)
- **Image Scanning** — Trivy/native scan on push, enabled by default
- **Immutable Tags** — prevents tag overwriting (immutable by default)
- **Encryption** — AES256 at rest by default, KMS optional
- **Lifecycle Policies** — keep last N tagged images, expire untagged after N days

## Usage

```hcl
module "ecr" {
  source = "../../modules/ecr"

  project_name = "infraforge"
  environment  = "production"

  repositories = {
    api = {
      keep_last_tagged_images = 30
      untagged_expire_days    = 7
      tag_prefix_filters      = ["v", "release"]
    }
    ui = {
      keep_last_tagged_images = 20
      untagged_expire_days    = 7
    }
    worker = {
      image_tag_mutability    = "MUTABLE"
      keep_last_tagged_images = 10
    }
  }

  encryption_type = "AES256"

  tags = {
    Team = "platform"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| `project_name` | Project name for repo naming | `string` | — | yes |
| `environment` | Deployment environment | `string` | — | yes |
| `repositories` | Map of repos to create | `map(object)` | `{api={}, ui={}}` | no |
| `encryption_type` | `AES256` or `KMS` | `string` | `AES256` | no |
| `kms_key_id` | KMS key ID for encryption | `string` | `""` | no |
| `tags` | Additional tags | `map(string)` | `{}` | no |

### Per-repository options

| Field | Description | Default |
|-------|-------------|---------|
| `image_tag_mutability` | `MUTABLE` or `IMMUTABLE` | `IMMUTABLE` |
| `scan_on_push` | Enable native image scanning | `true` |
| `keep_last_tagged_images` | Tagged image retention count | `20` |
| `untagged_expire_days` | Days before untagged images expire | `7` |
| `tag_prefix_filters` | Tag prefixes the retention rule applies to | `["v", "release"]` |

## Outputs

| Name | Description |
|------|-------------|
| `repository_urls` | Map of repo key → URL |
| `repository_arns` | Map of repo key → ARN |
| `repository_names` | Map of repo key → full name |
| `registry_id` | AWS account ID hosting the registry |

## Repository Naming

Repos are named `{project_name}-{environment}/{key}`, e.g. `infraforge-production/api`. This keeps environments separated within the registry and matches the convention used by ArgoCD image updaters.

## Cost Notes

- **Storage**: $0.10/GB/mo
- **Data Transfer**: free within the same region, ~$0.09/GB across regions
- Lifecycle policies are essential — without them, every CI build accumulates and costs grow linearly. With defaults (20 tagged + 7 day untagged), a typical service stays under $1/mo.
