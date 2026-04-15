package models

import "time"

type EnvironmentStatus string

const (
	EnvironmentStatusProvisioning EnvironmentStatus = "provisioning"
	EnvironmentStatusRunning      EnvironmentStatus = "running"
	EnvironmentStatusDeploying    EnvironmentStatus = "deploying"
	EnvironmentStatusFailed       EnvironmentStatus = "failed"
	EnvironmentStatusDestroying   EnvironmentStatus = "destroying"
	EnvironmentStatusDestroyed    EnvironmentStatus = "destroyed"
)

type ResourceTier string

const (
	ResourceTierSmall  ResourceTier = "small"
	ResourceTierMedium ResourceTier = "medium"
	ResourceTierLarge  ResourceTier = "large"
)

type Environment struct {
	ID          string            `json:"id" db:"id"`
	Name        string            `json:"name" db:"name"`
	Template    string            `json:"template" db:"template"`
	Status      EnvironmentStatus `json:"status" db:"status"`
	Tier        ResourceTier      `json:"tier" db:"tier"`
	OwnerID     string            `json:"owner_id" db:"owner_id"`
	Namespace   string            `json:"namespace" db:"namespace"`
	AutoDestroy bool              `json:"auto_destroy" db:"auto_destroy"`
	TTLHours    int               `json:"ttl_hours,omitempty" db:"ttl_hours"`
	Resources   int               `json:"resources" db:"resources"`
	LastDeploy  *time.Time        `json:"last_deploy,omitempty" db:"last_deploy"`
	CreatedAt   time.Time         `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at" db:"updated_at"`
}
