locals {
  name_prefix  = "${var.project_name}-${var.environment}"
  cluster_name = "${local.name_prefix}-eks"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "eks"
  })

  # cluster-autoscaler discovers node groups via these tags
  autoscaler_tags = var.enable_cluster_autoscaler_tags ? {
    "k8s.io/cluster-autoscaler/enabled"               = "true"
    "k8s.io/cluster-autoscaler/${local.cluster_name}" = "owned"
  } : {}
}

# -----------------------------------------------------------------------------
# Cluster security group — additional rules beyond the EKS-managed default SG
# -----------------------------------------------------------------------------

resource "aws_security_group" "cluster_additional" {
  name        = "${local.cluster_name}-cluster-additional"
  description = "Additional security group rules for the EKS cluster"
  vpc_id      = var.vpc_id

  tags = merge(local.common_tags, {
    Name = "${local.cluster_name}-cluster-additional"
  })
}

resource "aws_security_group_rule" "cluster_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.cluster_additional.id
  description       = "Allow all egress from the cluster"
}

# -----------------------------------------------------------------------------
# CloudWatch log group for EKS control plane logs (must exist before cluster)
# -----------------------------------------------------------------------------
# 💰 Cost estimate (us-east-1):
#   ~$0.50/GB ingested + ~$0.03/GB-month stored.
#   With api/audit/authenticator logs enabled, expect ~1-3 GB/day for a small
#   cluster → ~$15-50/month. Trim retention_in_days to control storage cost.

resource "aws_cloudwatch_log_group" "cluster" {
  name              = "/aws/eks/${local.cluster_name}/cluster"
  retention_in_days = var.cluster_log_retention_days

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# EKS Cluster
# -----------------------------------------------------------------------------
# 💰 Cost estimate (us-east-1):
#   EKS control plane is a flat $0.10/hour per cluster → ~$73/month.
#   This is the unavoidable baseline — independent of node count or workload.
#   Extended support versions add an extra $0.50/hour (~$365/month) — keep
#   cluster_version on a supported release to avoid this surcharge.

resource "aws_eks_cluster" "this" {
  name     = local.cluster_name
  role_arn = var.cluster_role_arn
  version  = var.cluster_version

  enabled_cluster_log_types = var.enabled_cluster_log_types

  vpc_config {
    subnet_ids              = var.subnet_ids
    security_group_ids      = [aws_security_group.cluster_additional.id]
    endpoint_private_access = var.endpoint_private_access
    endpoint_public_access  = var.endpoint_public_access
    public_access_cidrs     = var.public_access_cidrs
  }

  # Ensure log group exists first so EKS can write to it on creation
  depends_on = [aws_cloudwatch_log_group.cluster]

  tags = merge(local.common_tags, {
    Name = local.cluster_name
  })
}

# -----------------------------------------------------------------------------
# OIDC provider — required for IRSA
# -----------------------------------------------------------------------------

data "tls_certificate" "cluster" {
  url = aws_eks_cluster.this.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "cluster" {
  url             = aws_eks_cluster.this.identity[0].oidc[0].issuer
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.cluster.certificates[0].sha1_fingerprint]

  tags = merge(local.common_tags, {
    Name = "${local.cluster_name}-oidc"
  })
}

# -----------------------------------------------------------------------------
# Node group security group — for pod-to-pod traffic
# -----------------------------------------------------------------------------

resource "aws_security_group" "node_group" {
  name        = "${local.cluster_name}-node-group"
  description = "Security group for EKS managed node groups"
  vpc_id      = var.vpc_id

  tags = merge(local.common_tags, {
    Name                                          = "${local.cluster_name}-node-group"
    "kubernetes.io/cluster/${local.cluster_name}" = "owned"
  })
}

resource "aws_security_group_rule" "node_ingress_self" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 65535
  protocol                 = "-1"
  source_security_group_id = aws_security_group.node_group.id
  security_group_id        = aws_security_group.node_group.id
  description              = "Allow nodes to communicate with each other"
}

resource "aws_security_group_rule" "node_ingress_cluster" {
  type                     = "ingress"
  from_port                = 1025
  to_port                  = 65535
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.cluster_additional.id
  security_group_id        = aws_security_group.node_group.id
  description              = "Allow cluster control plane to talk to nodes"
}

resource "aws_security_group_rule" "node_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.node_group.id
  description       = "Allow all egress from nodes"
}

# -----------------------------------------------------------------------------
# Managed Node Groups
# -----------------------------------------------------------------------------
# 💰 Cost estimate (us-east-1, on-demand, per node, 730 hr/month):
#   t3.medium  (2 vCPU,  4 GiB) → ~$30.37/month
#   t3.large   (2 vCPU,  8 GiB) → ~$60.74/month
#   m5.large   (2 vCPU,  8 GiB) → ~$70.08/month
#   m5.xlarge  (4 vCPU, 16 GiB) → ~$140.16/month
#   Spot pricing typically saves 60-70% but workloads must tolerate interruption.
#   EBS gp3 root volume (default 20 GiB) adds ~$1.60/node/month.
#   Default desired_size=2 on t3.medium → ~$64/month for the data plane.

resource "aws_eks_node_group" "this" {
  for_each = var.node_groups

  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${local.cluster_name}-${each.key}"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids

  instance_types = each.value.instance_types
  capacity_type  = each.value.capacity_type
  disk_size      = each.value.disk_size

  scaling_config {
    desired_size = each.value.desired_size
    min_size     = each.value.min_size
    max_size     = each.value.max_size
  }

  update_config {
    max_unavailable_percentage = 33
  }

  labels = each.value.labels

  dynamic "taint" {
    for_each = each.value.taints
    content {
      key    = taint.value.key
      value  = taint.value.value
      effect = taint.value.effect
    }
  }

  # Tag the underlying ASG so cluster-autoscaler can discover it
  tags = merge(
    local.common_tags,
    local.autoscaler_tags,
    {
      Name = "${local.cluster_name}-${each.key}"
    }
  )

  # Don't replace nodes when desired_size drifts (autoscaler manages it)
  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
  }
}
