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

variable "repositories" {
  description = "Map of ECR repositories to create. Key is the repo name suffix."
  type = map(object({
    image_tag_mutability    = optional(string, "IMMUTABLE")
    scan_on_push            = optional(bool, true)
    keep_last_tagged_images = optional(number, 20)
    untagged_expire_days    = optional(number, 7)
    tag_prefix_filters      = optional(list(string), ["v", "release"])
  }))
  default = {
    api = {}
    ui  = {}
  }

  validation {
    condition = alltrue([
      for r in var.repositories : contains(["MUTABLE", "IMMUTABLE"], r.image_tag_mutability)
    ])
    error_message = "image_tag_mutability must be MUTABLE or IMMUTABLE."
  }
}

variable "encryption_type" {
  description = "Encryption type for the repository (AES256 or KMS)"
  type        = string
  default     = "AES256"

  validation {
    condition     = contains(["AES256", "KMS"], var.encryption_type)
    error_message = "Encryption type must be AES256 or KMS."
  }
}

variable "kms_key_id" {
  description = "KMS key ID for encryption (required if encryption_type is KMS)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
