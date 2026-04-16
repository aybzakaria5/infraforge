package service

import (
	"context"
	"fmt"
	"log"

	"github.com/aybzakarya/infraforge/src/api/internal/models"
	"github.com/aybzakarya/infraforge/src/api/internal/repository"
)

type DeploymentService struct {
	deploys *repository.DeploymentRepo
	envs    *repository.EnvironmentRepo
}

func NewDeploymentService(deploys *repository.DeploymentRepo, envs *repository.EnvironmentRepo) *DeploymentService {
	return &DeploymentService{deploys: deploys, envs: envs}
}

type TriggerDeploymentInput struct {
	EnvironmentID string `json:"environment_id"`
	CommitSHA     string `json:"commit_sha"`
	CommitMessage string `json:"commit_message"`
	Author        string `json:"author"`
	ImageTag      string `json:"image_tag"`
	Strategy      string `json:"strategy"`
}

func (s *DeploymentService) Trigger(ctx context.Context, in TriggerDeploymentInput) (*models.Deployment, error) {
	if in.EnvironmentID == "" {
		return nil, fmt.Errorf("environment_id is required")
	}
	if in.CommitSHA == "" || len(in.CommitSHA) < 7 {
		return nil, fmt.Errorf("commit_sha must be at least 7 characters")
	}
	if in.ImageTag == "" {
		return nil, fmt.Errorf("image_tag is required")
	}

	env, err := s.envs.GetByID(ctx, in.EnvironmentID)
	if err != nil {
		return nil, fmt.Errorf("environment not found: %w", err)
	}

	if env.Status != models.EnvironmentStatusRunning {
		return nil, fmt.Errorf("cannot deploy to environment %s in %s state", env.ID, env.Status)
	}

	strategy := models.DeployStrategy(in.Strategy)
	switch strategy {
	case models.DeployStrategyRolling, models.DeployStrategyCanary, models.DeployStrategyBlueGreen:
	default:
		strategy = models.DeployStrategyRolling
	}

	id, err := generateID("dep")
	if err != nil {
		return nil, fmt.Errorf("generate id: %w", err)
	}

	d := &models.Deployment{
		ID:            id,
		EnvironmentID: in.EnvironmentID,
		CommitSHA:     in.CommitSHA,
		CommitMessage: in.CommitMessage,
		Author:        in.Author,
		ImageTag:      in.ImageTag,
		Status:        models.DeploymentStatusPending,
		Strategy:      strategy,
	}

	if err := s.deploys.Create(ctx, d); err != nil {
		return nil, fmt.Errorf("create deployment: %w", err)
	}

	if err := s.envs.UpdateStatus(ctx, env.ID, models.EnvironmentStatusDeploying); err != nil {
		log.Printf("warning: failed to update env status to deploying: %v", err)
	}

	log.Printf("triggered deployment %s to %s (commit=%s, strategy=%s)", d.ID, env.Name, d.CommitSHA[:7], d.Strategy)

	return d, nil
}

func (s *DeploymentService) Get(ctx context.Context, id string) (*models.Deployment, error) {
	return s.deploys.GetByID(ctx, id)
}

func (s *DeploymentService) ListByEnvironment(ctx context.Context, envID string, limit, offset int) ([]models.Deployment, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.deploys.ListByEnvironment(ctx, envID, limit, offset)
}

func (s *DeploymentService) ListRecent(ctx context.Context, limit int) ([]models.Deployment, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	return s.deploys.ListRecent(ctx, limit)
}

func (s *DeploymentService) Complete(ctx context.Context, id string, success bool, duration float64) error {
	d, err := s.deploys.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if d.Status != models.DeploymentStatusRunning && d.Status != models.DeploymentStatusPending {
		return fmt.Errorf("deployment %s is already in terminal state %s", id, d.Status)
	}

	status := models.DeploymentStatusSuccess
	if !success {
		status = models.DeploymentStatusFailed
	}

	if err := s.deploys.Finish(ctx, id, status, duration); err != nil {
		return err
	}

	envStatus := models.EnvironmentStatusRunning
	if !success {
		envStatus = models.EnvironmentStatusFailed
	}
	if err := s.envs.UpdateStatus(ctx, d.EnvironmentID, envStatus); err != nil {
		log.Printf("warning: failed to reset env status after deploy: %v", err)
	}

	log.Printf("deployment %s completed: %s (%.1fs)", id, status, duration)
	return nil
}

func (s *DeploymentService) Rollback(ctx context.Context, id string) error {
	d, err := s.deploys.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if d.Status != models.DeploymentStatusFailed {
		return fmt.Errorf("can only rollback failed deployments, current status: %s", d.Status)
	}

	if err := s.deploys.UpdateStatus(ctx, id, models.DeploymentStatusRollback); err != nil {
		return err
	}

	log.Printf("rolling back deployment %s in environment %s", id, d.EnvironmentID)
	return nil
}
