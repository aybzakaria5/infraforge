# RDS PostgreSQL Module

Provisions a production-grade PostgreSQL RDS instance with Multi-AZ, automated backups, encryption at rest, custom parameter group, enhanced monitoring, and a security group locked down to approved sources.

## What Gets Created

- **DB Subnet Group** spanning ≥2 private subnets in different AZs
- **Security Group** with ingress restricted to specified source security groups (typically EKS nodes)
- **Parameter Group** with custom PostgreSQL parameters (slow query logging by default)
- **RDS Instance** — Multi-AZ, encrypted, with backups and Performance Insights
- **Enhanced Monitoring IAM Role** (when `monitoring_interval > 0`)
- **CloudWatch Log Exports** for `postgresql` and `upgrade` logs

## Usage

```hcl
module "rds" {
  source = "../../modules/rds"

  project_name = "infraforge"
  environment  = "production"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids

  # Allow only EKS nodes to connect
  allowed_security_group_ids = [module.eks.node_security_group_id]

  engine_version    = "16.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 20
  max_allocated_storage = 100

  database_name   = "infraforge"
  master_username = "infraforge"
  master_password = var.db_password  # pull from Secrets Manager in real use

  multi_az                = true
  backup_retention_period = 14
  deletion_protection     = true
  skip_final_snapshot     = false

  performance_insights_enabled = true
  monitoring_interval          = 60

  tags = {
    Team = "platform"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| `project_name` | Project name for resource naming | `string` | — | yes |
| `environment` | Deployment environment | `string` | — | yes |
| `vpc_id` | VPC ID | `string` | — | yes |
| `subnet_ids` | Private subnet IDs (≥2 in different AZs) | `list(string)` | — | yes |
| `allowed_security_group_ids` | Source SGs allowed to connect | `list(string)` | `[]` | no |
| `engine_version` | PostgreSQL version | `string` | `16.3` | no |
| `instance_class` | RDS instance class | `string` | `db.t3.medium` | no |
| `allocated_storage` | Storage in GB (20-65536) | `number` | `20` | no |
| `max_allocated_storage` | Max storage for autoscaling (0 to disable) | `number` | `100` | no |
| `storage_type` | gp2, gp3, or io1 | `string` | `gp3` | no |
| `storage_encrypted` | Encrypt storage at rest | `bool` | `true` | no |
| `kms_key_id` | KMS key for encryption | `string` | `""` | no |
| `database_name` | Initial database name | `string` | `infraforge` | no |
| `master_username` | Master DB username | `string` | `infraforge` | no |
| `master_password` | Master DB password | `string` | — | yes |
| `port` | DB port | `number` | `5432` | no |
| `multi_az` | Enable Multi-AZ HA | `bool` | `true` | no |
| `backup_retention_period` | Backup retention in days (0-35) | `number` | `7` | no |
| `backup_window` | Daily backup window (UTC) | `string` | `03:00-04:00` | no |
| `maintenance_window` | Weekly maintenance window (UTC) | `string` | `sun:04:00-sun:05:00` | no |
| `deletion_protection` | Prevent accidental deletion | `bool` | `true` | no |
| `skip_final_snapshot` | Skip snapshot on destroy | `bool` | `false` | no |
| `performance_insights_enabled` | Enable Performance Insights | `bool` | `true` | no |
| `monitoring_interval` | Enhanced monitoring interval (0/1/5/10/15/30/60) | `number` | `60` | no |
| `parameter_group_parameters` | Custom DB parameters | `list(object)` | slow query logging | no |
| `tags` | Additional tags | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| `db_instance_id` | RDS instance ID |
| `db_instance_arn` | RDS instance ARN |
| `db_instance_identifier` | RDS identifier |
| `db_instance_endpoint` | host:port endpoint |
| `db_instance_address` | Hostname only |
| `db_instance_port` | DB port |
| `db_name` | Initial database name |
| `db_master_username` | Master username (sensitive) |
| `db_subnet_group_name` | DB subnet group name |
| `db_parameter_group_name` | Parameter group name |
| `db_security_group_id` | Security group ID |
| `db_resource_id` | Resource ID for Performance Insights/IAM auth |

## Security Notes

- The security group only allows ingress from explicitly approved source SGs. By default, nothing can connect.
- `master_password` should come from AWS Secrets Manager or a Vault external-secret in production. Never commit it to tfvars.
- Storage is encrypted by default using the AWS-managed KMS key. For stricter compliance, pass a customer-managed `kms_key_id`.
- `deletion_protection = true` and `skip_final_snapshot = false` by default — production-safe.

## Cost Notes

- **db.t3.medium Multi-AZ**: ~$130/mo for instance hours alone
- **Storage**: gp3 at $0.115/GB/mo + IOPS charges
- **Backups**: free up to allocated storage size, then $0.095/GB/mo
- **Performance Insights**: free for 7 days retention, then ~$0.014/vCPU/hr
- **Enhanced Monitoring**: free, but adds CloudWatch metrics costs
- For dev/local, set `multi_az = false`, `backup_retention_period = 1`, and `instance_class = db.t3.micro` to minimize cost.
