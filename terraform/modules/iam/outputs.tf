output "eks_cluster_role_arn" {
  description = "ARN of the EKS cluster IAM role"
  value       = aws_iam_role.eks_cluster.arn
}

output "eks_cluster_role_name" {
  description = "Name of the EKS cluster IAM role"
  value       = aws_iam_role.eks_cluster.name
}

output "eks_node_group_role_arn" {
  description = "ARN of the EKS node group IAM role"
  value       = aws_iam_role.eks_node_group.arn
}

output "eks_node_group_role_name" {
  description = "Name of the EKS node group IAM role"
  value       = aws_iam_role.eks_node_group.name
}

output "eks_node_group_instance_profile_arn" {
  description = "ARN of the EKS node group instance profile"
  value       = aws_iam_instance_profile.eks_node_group.arn
}

output "eks_node_group_instance_profile_name" {
  description = "Name of the EKS node group instance profile"
  value       = aws_iam_instance_profile.eks_node_group.name
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC provider for IRSA"
  value       = local.oidc_provider_arn
}

output "oidc_provider_url" {
  description = "URL of the OIDC provider"
  value       = local.oidc_provider_url
}

output "irsa_role_arns" {
  description = "Map of IRSA role names to their ARNs"
  value       = { for k, v in aws_iam_role.irsa : k => v.arn }
}
