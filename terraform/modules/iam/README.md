# IAM Module

Creates IAM roles and policies required for EKS operation: cluster role, node group role with instance profile, OIDC provider for IRSA, and dynamic per-service-account IRSA roles.

## What Gets Created

- **EKS Cluster Role** — assumed by the EKS control plane (`AmazonEKSClusterPolicy`, `AmazonEKSVPCResourceController`)
- **Node Group Role** — assumed by worker EC2 instances (`AmazonEKSWorkerNodePolicy`, `AmazonEKS_CNI_Policy`, `AmazonEC2ContainerRegistryReadOnly`, `AmazonSSMManagedInstanceCore`)
- **Node Group Instance Profile** — attached to the node group role for EC2 launch
- **OIDC Provider** — enables Kubernetes service accounts to assume IAM roles (IRSA)
- **IRSA Roles** — dynamically created per-service-account roles with scoped trust policies

## Usage

```hcl
module "iam" {
  source = "../../modules/iam"

  project_name    = "infraforge"
  environment     = "production"
  eks_cluster_name = "infraforge-production-eks"

  # Pass the OIDC issuer URL from the EKS cluster (without https://)
  oidc_provider_url    = module.eks.cluster_oidc_issuer_url
  enable_oidc_provider = true

  irsa_roles = {
    alb-controller = {
      namespace       = "kube-system"
      service_account = "aws-load-balancer-controller"
      policy_arns     = [aws_iam_policy.alb_controller.arn]
    }
    external-dns = {
      namespace       = "kube-system"
      service_account = "external-dns"
      policy_arns     = [aws_iam_policy.external_dns.arn]
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
| `environment` | Deployment environment (dev, staging, production) | `string` | — | yes |
| `eks_cluster_name` | Name of the EKS cluster | `string` | — | yes |
| `oidc_provider_url` | OIDC issuer URL from EKS (without `https://`) | `string` | `""` | no |
| `oidc_provider_arn` | ARN of an existing OIDC provider (if not creating one) | `string` | `""` | no |
| `enable_oidc_provider` | Whether to create the OIDC provider | `bool` | `true` | no |
| `node_group_instance_types` | Instance types for node group (informational) | `list(string)` | `["t3.medium"]` | no |
| `irsa_roles` | Map of IRSA roles: namespace, service_account, policy_arns | `map(object)` | `{}` | no |
| `tags` | Additional tags for all resources | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| `eks_cluster_role_arn` | ARN of the EKS cluster IAM role |
| `eks_cluster_role_name` | Name of the EKS cluster IAM role |
| `eks_node_group_role_arn` | ARN of the EKS node group IAM role |
| `eks_node_group_role_name` | Name of the EKS node group IAM role |
| `eks_node_group_instance_profile_arn` | ARN of the node group instance profile |
| `eks_node_group_instance_profile_name` | Name of the node group instance profile |
| `oidc_provider_arn` | ARN of the OIDC provider |
| `oidc_provider_url` | URL of the OIDC provider |
| `irsa_role_arns` | Map of IRSA role names to ARNs |

## IRSA Flow

```
Pod with SA annotation
        │
        ▼
K8s Service Account ──▶ OIDC Token ──▶ STS AssumeRoleWithWebIdentity
        │                                         │
        ▼                                         ▼
eks.amazonaws.com/role-arn annotation     IAM Role with scoped
        │                                 trust policy
        ▼                                         │
Pod receives temporary                            ▼
AWS credentials                           Only this SA in this
                                          namespace can assume it
```

## Cost Notes

- IAM roles, policies, and OIDC providers are free. No ongoing cost for this module.
