package models

import "time"

type DeploymentStatus string

const (
	DeploymentStatusPending  DeploymentStatus = "pending"
	DeploymentStatusRunning  DeploymentStatus = "running"
	DeploymentStatusSuccess  DeploymentStatus = "success"
	DeploymentStatusFailed   DeploymentStatus = "failed"
	DeploymentStatusRollback DeploymentStatus = "rollback"
)

type DeployStrategy string

const (
	DeployStrategyRolling   DeployStrategy = "rolling"
	DeployStrategyCanary    DeployStrategy = "canary"
	DeployStrategyBlueGreen DeployStrategy = "blue-green"
)

type PipelineStage struct {
	Name      string  `json:"name" db:"name"`
	Status    string  `json:"status" db:"status"`
	Duration  float64 `json:"duration_sec" db:"duration_sec"`
	StartedAt string  `json:"started_at,omitempty" db:"started_at"`
}

type Deployment struct {
	ID            string           `json:"id" db:"id"`
	EnvironmentID string           `json:"environment_id" db:"environment_id"`
	CommitSHA     string           `json:"commit_sha" db:"commit_sha"`
	CommitMessage string           `json:"commit_message" db:"commit_message"`
	Author        string           `json:"author" db:"author"`
	ImageTag      string           `json:"image_tag" db:"image_tag"`
	Status        DeploymentStatus `json:"status" db:"status"`
	Strategy      DeployStrategy   `json:"strategy" db:"strategy"`
	Stages        []PipelineStage  `json:"stages" db:"-"`
	Duration      float64          `json:"duration_sec" db:"duration_sec"`
	Vulnerabilities int            `json:"vulnerabilities" db:"vulnerabilities"`
	CreatedAt     time.Time        `json:"created_at" db:"created_at"`
	FinishedAt    *time.Time       `json:"finished_at,omitempty" db:"finished_at"`
}
