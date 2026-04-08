output "repository_urls" {
  description = "Map of repository names to their URLs"
  value       = { for k, r in aws_ecr_repository.this : k => r.repository_url }
}

output "repository_arns" {
  description = "Map of repository names to their ARNs"
  value       = { for k, r in aws_ecr_repository.this : k => r.arn }
}

output "repository_names" {
  description = "Map of repository keys to their full names"
  value       = { for k, r in aws_ecr_repository.this : k => r.name }
}

output "registry_id" {
  description = "Account ID hosting the registry"
  value       = length(aws_ecr_repository.this) > 0 ? values(aws_ecr_repository.this)[0].registry_id : null
}
