# EKS Module

Provisions an EKS cluster with managed node groups, OIDC provider for IRSA, additional security groups, and full control plane logging to CloudWatch. Designed to work with the `vpc` and `iam` modules in this repo.

## What Gets Created

- **EKS Cluster** with configurable Kubernetes version and endpoint access
- **OIDC Provider** for IRSA, derived from the cluster's identity
- **Managed Node Groups** (one or more) with autoscaler-friendly tags
- **Security Groups** for additional cluster and node-level rules
- **CloudWatch Log Group** for control plane logs (api, audit, authenticator, controllerManager, scheduler)

## Usage

```hcl
module "eks" {
  source = "../../modules/eks"

  project_name    = "infraforge"
  environment     = "production"
  cluster_version = "1.29"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids

  cluster_role_arn = module.iam.eks_cluster_role_arn
  node_role_arn    = module.iam.eks_node_group_role_arn

  endpoint_public_access = true
  public_access_cidrs    = ["203.0.113.0/24"]  # restrict in production

  node_groups = {
    system = {
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
      desired_size   = 2
      min_size       = 2
      max_size       = 4
      disk_size      = 30
      labels         = { workload = "system" }
      taints = [{
        key    = "CriticalAddonsOnly"
        value  = "true"
        effect = "NO_SCHEDULE"
      }]
    }
    workers = {
      instance_types = ["t3.large"]
      capacity_type  = "SPOT"
      desired_size   = 3
      min_size       = 1
      max_size       = 10
      disk_size      = 50
      labels         = { workload = "general" }
      taints         = []
    }
  }

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
| `cluster_version` | Kubernetes version (1.25+) | `string` | `1.29` | no |
| `vpc_id` | ID of the VPC | `string` | — | yes |
| `subnet_ids` | List of subnet IDs (≥2) | `list(string)` | — | yes |
| `cluster_role_arn` | ARN of the EKS cluster IAM role | `string` | — | yes |
| `node_role_arn` | ARN of the node group IAM role | `string` | — | yes |
| `endpoint_private_access` | Enable private API endpoint | `bool` | `true` | no |
| `endpoint_public_access` | Enable public API endpoint | `bool` | `true` | no |
| `public_access_cidrs` | CIDRs allowed to reach public endpoint | `list(string)` | `["0.0.0.0/0"]` | no |
| `enabled_cluster_log_types` | Control plane log types to enable | `list(string)` | all 5 | no |
| `cluster_log_retention_days` | Retention for cluster logs | `number` | `30` | no |
| `node_groups` | Map of node group configs | `map(object)` | one default group | no |
| `enable_cluster_autoscaler_tags` | Tag ASGs for cluster-autoscaler | `bool` | `true` | no |
| `tags` | Additional tags | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| `cluster_id` | EKS cluster ID |
| `cluster_name` | EKS cluster name |
| `cluster_arn` | EKS cluster ARN |
| `cluster_endpoint` | API server endpoint URL |
| `cluster_version` | Kubernetes version |
| `cluster_ca_certificate` | Base64-encoded CA certificate |
| `cluster_oidc_issuer_url` | OIDC issuer URL for IRSA |
| `oidc_provider_arn` | OIDC provider ARN |
| `cluster_security_group_id` | EKS-managed primary cluster SG |
| `cluster_additional_security_group_id` | Additional cluster SG ID |
| `node_security_group_id` | Node group SG ID |
| `node_groups` | Map of node group attributes |
| `cloudwatch_log_group_name` | CloudWatch log group name |

## Cluster Autoscaler Notes

When `enable_cluster_autoscaler_tags = true` (default), node group ASGs are tagged so the cluster-autoscaler can discover and scale them automatically. To deploy the autoscaler, install the official Helm chart and pass it `autoDiscovery.clusterName = <cluster_name>`.

The `lifecycle.ignore_changes` on `desired_size` is intentional — once the autoscaler is running, Terraform should not fight it for the desired count.

## Cost Notes

- **Control Plane**: $0.10/hr (~$73/mo) per cluster, regardless of size
- **Node Groups**: pay for the underlying EC2 instances. SPOT can save 60-90% for non-critical workloads.
- **CloudWatch Logs**: ~$0.50/GB ingested. Disable verbose log types like `api` in dev to save cost.
- **EBS Volumes**: $0.08/GB/mo for gp3 (default). 30GB × 3 nodes = ~$7/mo.
