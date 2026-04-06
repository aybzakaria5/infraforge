locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "iam"
  })

  # Resolve the OIDC values — either from a newly created provider or from input vars
  oidc_provider_arn = var.enable_oidc_provider ? aws_iam_openid_connect_provider.eks[0].arn : var.oidc_provider_arn
  oidc_provider_url = var.enable_oidc_provider ? aws_iam_openid_connect_provider.eks[0].url : var.oidc_provider_url
}

# -----------------------------------------------------------------------------
# EKS Cluster Role — assumed by the EKS control plane
# -----------------------------------------------------------------------------

resource "aws_iam_role" "eks_cluster" {
  name = "${local.name_prefix}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-eks-cluster-role"
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "eks_vpc_resource_controller" {
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
}

# -----------------------------------------------------------------------------
# EKS Node Group Role — assumed by EC2 instances in managed node groups
# -----------------------------------------------------------------------------

resource "aws_iam_role" "eks_node_group" {
  name = "${local.name_prefix}-eks-node-group-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-eks-node-group-role"
  })
}

resource "aws_iam_role_policy_attachment" "node_worker_policy" {
  role       = aws_iam_role.eks_node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "node_cni_policy" {
  role       = aws_iam_role.eks_node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "node_ecr_read" {
  role       = aws_iam_role.eks_node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "node_ssm_managed" {
  role       = aws_iam_role.eks_node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "eks_node_group" {
  name = "${local.name_prefix}-eks-node-group-profile"
  role = aws_iam_role.eks_node_group.name

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# OIDC Provider — enables IAM Roles for Service Accounts (IRSA)
# -----------------------------------------------------------------------------

data "tls_certificate" "eks" {
  count = var.enable_oidc_provider ? 1 : 0
  url   = "https://${var.oidc_provider_url}"
}

resource "aws_iam_openid_connect_provider" "eks" {
  count = var.enable_oidc_provider ? 1 : 0

  url             = "https://${var.oidc_provider_url}"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks[0].certificates[0].sha1_fingerprint]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-eks-oidc"
  })
}

# -----------------------------------------------------------------------------
# IRSA Roles — per-service-account IAM roles for least-privilege pod access
# -----------------------------------------------------------------------------

resource "aws_iam_role" "irsa" {
  for_each = var.irsa_roles

  name = "${local.name_prefix}-irsa-${each.key}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = local.oidc_provider_arn
      }
      Condition = {
        StringEquals = {
          "${replace(local.oidc_provider_url, "https://", "")}:sub" = "system:serviceaccount:${each.value.namespace}:${each.value.service_account}"
          "${replace(local.oidc_provider_url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = merge(local.common_tags, {
    Name           = "${local.name_prefix}-irsa-${each.key}"
    ServiceAccount = "${each.value.namespace}/${each.value.service_account}"
  })
}

resource "aws_iam_role_policy_attachment" "irsa" {
  for_each = {
    for pair in flatten([
      for role_key, role in var.irsa_roles : [
        for idx, policy_arn in role.policy_arns : {
          key        = "${role_key}-${idx}"
          role_name  = aws_iam_role.irsa[role_key].name
          policy_arn = policy_arn
        }
      ]
    ]) : pair.key => pair
  }

  role       = each.value.role_name
  policy_arn = each.value.policy_arn
}
