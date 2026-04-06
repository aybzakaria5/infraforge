variable "project_name" {
  description = "Name of the project, used for resource tagging and naming"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "eks_cluster_name" {
  description = "Name of the EKS cluster, used for OIDC provider configuration"
  type        = string
}

variable "oidc_provider_url" {
  description = "OIDC provider URL from the EKS cluster (without https:// prefix)"
  type        = string
  default     = ""
}

variable "oidc_provider_arn" {
  description = "ARN of the OIDC provider for IRSA role trust policies"
  type        = string
  default     = ""
}

variable "enable_oidc_provider" {
  description = "Whether to create the OIDC provider (set false if passing an existing one)"
  type        = bool
  default     = true
}

variable "node_group_instance_types" {
  description = "List of EC2 instance types for the managed node group (informational, used in tags)"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "irsa_roles" {
  description = "Map of IRSA roles to create. Key is the role name suffix, value defines the service account and namespace."
  type = map(object({
    namespace       = string
    service_account = string
    policy_arns     = list(string)
  }))
  default = {}
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
