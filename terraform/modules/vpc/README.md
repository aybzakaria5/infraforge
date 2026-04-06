# VPC Module

Creates a production-ready VPC with public and private subnets across 3 availability zones, NAT gateway(s) for private subnet internet access, and optional VPC flow logs.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ VPC (10.0.0.0/16)                                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Public Sub-a │  │ Public Sub-b │  │ Public Sub-c │      │
│  │  10.0.1.0/24 │  │  10.0.2.0/24 │  │  10.0.3.0/24 │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │ IGW             │                  │              │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐      │
│  │ Private Sub-a│  │ Private Sub-b│  │ Private Sub-c│      │
│  │ 10.0.10.0/24 │  │ 10.0.11.0/24 │  │ 10.0.12.0/24 │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                                                   │
│         └──── NAT Gateway ──── Internet                     │
└─────────────────────────────────────────────────────────────┘
```

## Usage

```hcl
module "vpc" {
  source = "../../modules/vpc"

  project_name       = "infraforge"
  environment        = "production"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false  # one per AZ for production HA

  enable_flow_logs        = true
  flow_log_retention_days = 30

  tags = {
    Team = "platform"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| `project_name` | Project name for resource naming | `string` | — | yes |
| `environment` | Deployment environment (dev, staging, production) | `string` | — | yes |
| `vpc_cidr` | CIDR block for the VPC | `string` | `10.0.0.0/16` | no |
| `availability_zones` | List of 3 AZs to deploy into | `list(string)` | — | yes |
| `public_subnet_cidrs` | CIDR blocks for public subnets | `list(string)` | `["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]` | no |
| `private_subnet_cidrs` | CIDR blocks for private subnets | `list(string)` | `["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]` | no |
| `enable_nat_gateway` | Provision NAT gateway for private subnets | `bool` | `true` | no |
| `single_nat_gateway` | Use one NAT instead of one per AZ | `bool` | `true` | no |
| `enable_flow_logs` | Enable VPC flow logs to CloudWatch | `bool` | `true` | no |
| `flow_log_retention_days` | CloudWatch log retention in days | `number` | `30` | no |
| `tags` | Additional tags for all resources | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| `vpc_id` | ID of the VPC |
| `vpc_cidr_block` | CIDR block of the VPC |
| `public_subnet_ids` | List of public subnet IDs |
| `private_subnet_ids` | List of private subnet IDs |
| `public_subnet_cidrs` | List of public subnet CIDR blocks |
| `private_subnet_cidrs` | List of private subnet CIDR blocks |
| `internet_gateway_id` | ID of the internet gateway |
| `nat_gateway_ids` | List of NAT gateway IDs |
| `public_route_table_id` | ID of the public route table |
| `private_route_table_ids` | List of private route table IDs |
| `flow_log_group_name` | CloudWatch log group name for flow logs |

## Cost Notes

- **NAT Gateway**: ~$0.045/hr per gateway + $0.045/GB processed. Use `single_nat_gateway = true` in non-prod to save ~$65/mo per gateway.
- **VPC Flow Logs**: CloudWatch ingestion at ~$0.50/GB. In high-traffic environments, consider sampling or disabling in dev.
- **Elastic IPs**: Free when attached to a running NAT gateway, $0.005/hr if idle.
