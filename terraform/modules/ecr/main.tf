locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "ecr"
  })
}

# -----------------------------------------------------------------------------
# ECR Repositories
# -----------------------------------------------------------------------------

resource "aws_ecr_repository" "this" {
  for_each = var.repositories

  name                 = "${local.name_prefix}/${each.key}"
  image_tag_mutability = each.value.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = each.value.scan_on_push
  }

  encryption_configuration {
    encryption_type = var.encryption_type
    kms_key         = var.encryption_type == "KMS" ? var.kms_key_id : null
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}/${each.key}"
  })
}

# -----------------------------------------------------------------------------
# Lifecycle Policies — keep N most recent tagged images, expire untagged quickly
# -----------------------------------------------------------------------------

resource "aws_ecr_lifecycle_policy" "this" {
  for_each = var.repositories

  repository = aws_ecr_repository.this[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${each.value.keep_last_tagged_images} tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = each.value.tag_prefix_filters
          countType     = "imageCountMoreThan"
          countNumber   = each.value.keep_last_tagged_images
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Expire untagged images after ${each.value.untagged_expire_days} days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = each.value.untagged_expire_days
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
