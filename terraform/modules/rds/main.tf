locals {
  name_prefix = "${var.project_name}-${var.environment}"
  identifier  = "${local.name_prefix}-postgres"

  # PostgreSQL major version (e.g. "16.3" → "16")
  major_version = split(".", var.engine_version)[0]
  family        = "postgres${local.major_version}"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "rds"
  })
}

# -----------------------------------------------------------------------------
# DB Subnet Group — must span ≥2 AZs for Multi-AZ deployments
# -----------------------------------------------------------------------------

resource "aws_db_subnet_group" "this" {
  name        = "${local.identifier}-subnet-group"
  description = "Subnet group for ${local.identifier}"
  subnet_ids  = var.subnet_ids

  tags = merge(local.common_tags, {
    Name = "${local.identifier}-subnet-group"
  })
}

# -----------------------------------------------------------------------------
# Security Group — allow ingress only from approved security groups
# -----------------------------------------------------------------------------

resource "aws_security_group" "this" {
  name        = "${local.identifier}-sg"
  description = "Security group for ${local.identifier}"
  vpc_id      = var.vpc_id

  tags = merge(local.common_tags, {
    Name = "${local.identifier}-sg"
  })
}

resource "aws_security_group_rule" "ingress" {
  for_each = toset(var.allowed_security_group_ids)

  type                     = "ingress"
  from_port                = var.port
  to_port                  = var.port
  protocol                 = "tcp"
  source_security_group_id = each.value
  security_group_id        = aws_security_group.this.id
  description              = "PostgreSQL access from ${each.value}"
}

resource "aws_security_group_rule" "egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.this.id
  description       = "Allow all egress"
}

# -----------------------------------------------------------------------------
# Parameter Group — custom PostgreSQL parameters
# -----------------------------------------------------------------------------

resource "aws_db_parameter_group" "this" {
  name        = "${local.identifier}-pg"
  family      = local.family
  description = "Custom parameter group for ${local.identifier}"

  dynamic "parameter" {
    for_each = var.parameter_group_parameters
    content {
      name         = parameter.value.name
      value        = parameter.value.value
      apply_method = parameter.value.apply_method
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.identifier}-pg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# Enhanced Monitoring IAM Role
# -----------------------------------------------------------------------------
# 💰 Cost estimate (us-east-1):
#   The IAM role itself is free. Enhanced Monitoring metrics are delivered to
#   CloudWatch Logs and billed at ~$0.30/GB ingested. At a 60s interval expect
#   <$2/month per instance; at 1s interval this can climb past $20/month.

resource "aws_iam_role" "monitoring" {
  count = var.monitoring_interval > 0 ? 1 : 0

  name = "${local.identifier}-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "monitoring" {
  count = var.monitoring_interval > 0 ? 1 : 0

  role       = aws_iam_role.monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# -----------------------------------------------------------------------------
# RDS PostgreSQL Instance
# -----------------------------------------------------------------------------
# 💰 Cost estimate (us-east-1, PostgreSQL, on-demand, 730 hr/month):
#
#   Instance compute (single-AZ):
#     db.t3.micro    (2 vCPU,  1 GiB) → ~$12.41/month
#     db.t3.small    (2 vCPU,  2 GiB) → ~$24.82/month
#     db.t3.medium   (2 vCPU,  4 GiB) → ~$49.64/month
#     db.m5.large    (2 vCPU,  8 GiB) → ~$124.83/month
#     db.m5.xlarge   (4 vCPU, 16 GiB) → ~$249.66/month
#   ⚠ Multi-AZ DOUBLES the compute cost (a standby instance runs 24/7).
#
#   Storage (gp3): ~$0.115/GB-month — also doubled under Multi-AZ.
#     20 GB single-AZ ≈ $2.30/mo  |  100 GB Multi-AZ ≈ $23.00/mo
#
#   Backups: storage equal to DB size is free; beyond that ~$0.095/GB-month.
#   Performance Insights: free with the default 7-day retention window.
#   CloudWatch logs export (postgresql/upgrade): ~$0.50/GB ingested.
#
#   Typical small prod baseline (db.t3.small Multi-AZ + 50 GB gp3):
#     ~$50/mo compute + ~$11.50/mo storage ≈ $62/month before backups/logs.

resource "aws_db_instance" "this" {
  identifier = local.identifier

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage > 0 ? var.max_allocated_storage : null
  storage_type          = var.storage_type
  storage_encrypted     = var.storage_encrypted
  kms_key_id            = var.kms_key_id != "" ? var.kms_key_id : null

  db_name  = var.database_name
  username = var.master_username
  password = var.master_password
  port     = var.port

  vpc_security_group_ids = [aws_security_group.this.id]
  db_subnet_group_name   = aws_db_subnet_group.this.name
  parameter_group_name   = aws_db_parameter_group.this.name
  publicly_accessible    = false

  multi_az = var.multi_az

  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window
  copy_tags_to_snapshot   = true

  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${local.identifier}-final-${formatdate("YYYYMMDDhhmmss", timestamp())}"

  performance_insights_enabled = var.performance_insights_enabled
  monitoring_interval          = var.monitoring_interval
  monitoring_role_arn          = var.monitoring_interval > 0 ? aws_iam_role.monitoring[0].arn : null

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  auto_minor_version_upgrade = true
  apply_immediately          = false

  tags = merge(local.common_tags, {
    Name = local.identifier
  })

  lifecycle {
    ignore_changes = [
      final_snapshot_identifier,
      password,
    ]
  }
}
