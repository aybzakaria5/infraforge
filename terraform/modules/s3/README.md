# S3 Module

Creates an S3 bucket with sensible production defaults: versioning enabled, server-side encryption, public access blocked, lifecycle rules for cost optimization, and optional CORS for browser uploads.

## What Gets Created

- **S3 Bucket** with the given name
- **Versioning** enabled by default
- **Server-Side Encryption** (SSE-S3 by default, SSE-KMS optional)
- **Public Access Block** (all four settings on by default)
- **Lifecycle Configuration** (transitions to STANDARD_IA → GLACIER, expires old versions, aborts incomplete multipart uploads)
- **CORS Configuration** (optional, for UI direct uploads)

## Usage

```hcl
module "uploads" {
  source = "../../modules/s3"

  project_name = "infraforge"
  environment  = "production"
  bucket_name  = "infraforge-prod-uploads"

  versioning_enabled   = true
  encryption_algorithm = "AES256"

  lifecycle_rules = [{
    id      = "expire-old-versions"
    enabled = true
    transitions = [
      { days = 30, storage_class = "STANDARD_IA" },
      { days = 90, storage_class = "GLACIER" }
    ]
    noncurrent_version_expiration_days     = 60
    abort_incomplete_multipart_upload_days = 7
  }]

  cors_rules = [{
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["https://infraforge.example.com"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }]

  tags = {
    Team = "platform"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| `project_name` | Project name for tagging | `string` | — | yes |
| `environment` | Deployment environment | `string` | — | yes |
| `bucket_name` | Globally unique bucket name | `string` | — | yes |
| `force_destroy` | Allow Terraform to delete a non-empty bucket | `bool` | `false` | no |
| `versioning_enabled` | Enable object versioning | `bool` | `true` | no |
| `encryption_algorithm` | `AES256` or `aws:kms` | `string` | `AES256` | no |
| `kms_key_id` | KMS key for SSE-KMS | `string` | `""` | no |
| `block_public_access` | Block all public access | `bool` | `true` | no |
| `lifecycle_rules` | List of lifecycle rule objects | `list(object)` | default rule | no |
| `cors_rules` | List of CORS rule objects | `list(object)` | `[]` | no |
| `tags` | Additional tags | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| `bucket_id` | Bucket ID (name) |
| `bucket_arn` | Bucket ARN |
| `bucket_domain_name` | Global bucket domain |
| `bucket_regional_domain_name` | Regional bucket domain |
| `bucket_region` | Bucket region |
| `bucket_hosted_zone_id` | Route 53 hosted zone ID |

## Cost Notes

- **Standard Storage**: $0.023/GB/mo for first 50TB
- **STANDARD_IA**: $0.0125/GB/mo (50% cheaper, 30-day minimum, retrieval fees apply)
- **GLACIER**: $0.004/GB/mo (90-day minimum, retrieval delay)
- **Versioning**: every overwrite/delete keeps a copy → costs add up. Use `noncurrent_version_expiration_days` to bound this.
- **Requests**: PUT/COPY/POST/LIST = $0.005 per 1k, GET = $0.0004 per 1k
- For dev, set `force_destroy = true` so Terraform can clean up freely.
