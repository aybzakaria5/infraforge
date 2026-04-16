package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"strings"

	"github.com/aybzakarya/infraforge/src/api/internal/models"
	"github.com/aybzakarya/infraforge/src/api/internal/repository"
)

type EnvironmentService struct {
	repo *repository.EnvironmentRepo
}

func NewEnvironmentService(repo *repository.EnvironmentRepo) *EnvironmentService {
	return &EnvironmentService{repo: repo}
}

type CreateEnvironmentInput struct {
	Name        string `json:"name"`
	Template    string `json:"template"`
	Tier        string `json:"tier"`
	OwnerID     string `json:"owner_id"`
	AutoDestroy bool   `json:"auto_destroy"`
	TTLHours    int    `json:"ttl_hours"`
}

func (s *EnvironmentService) Provision(ctx context.Context, in CreateEnvironmentInput) (*models.Environment, error) {
	if in.Name == "" {
		return nil, fmt.Errorf("environment name is required")
	}
	if in.Template == "" {
		return nil, fmt.Errorf("template is required")
	}

	tier := models.ResourceTier(in.Tier)
	switch tier {
	case models.ResourceTierSmall, models.ResourceTierMedium, models.ResourceTierLarge:
	default:
		return nil, fmt.Errorf("invalid resource tier: %s", in.Tier)
	}

	if in.AutoDestroy && in.TTLHours <= 0 {
		return nil, fmt.Errorf("ttl_hours must be positive when auto_destroy is enabled")
	}

	id, err := generateID("env")
	if err != nil {
		return nil, fmt.Errorf("generate id: %w", err)
	}

	namespace := fmt.Sprintf("%s-%s", sanitizeName(in.Name), id[4:12])
	resources := tierResourceCount(tier)

	env := &models.Environment{
		ID:          id,
		Name:        in.Name,
		Template:    in.Template,
		Status:      models.EnvironmentStatusProvisioning,
		Tier:        tier,
		OwnerID:     in.OwnerID,
		Namespace:   namespace,
		AutoDestroy: in.AutoDestroy,
		TTLHours:    in.TTLHours,
		Resources:   resources,
	}

	if err := s.repo.Create(ctx, env); err != nil {
		return nil, fmt.Errorf("create environment: %w", err)
	}

	// In production this would trigger Terraform via a queue/worker.
	// For now we log and leave it in provisioning state.
	log.Printf("provisioning environment %s (ns=%s, tier=%s)", env.ID, env.Namespace, env.Tier)

	return env, nil
}

func (s *EnvironmentService) Get(ctx context.Context, id string) (*models.Environment, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *EnvironmentService) List(ctx context.Context, limit, offset int) ([]models.Environment, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.repo.List(ctx, limit, offset)
}

func (s *EnvironmentService) Destroy(ctx context.Context, id string) error {
	env, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	switch env.Status {
	case models.EnvironmentStatusDestroying, models.EnvironmentStatusDestroyed:
		return fmt.Errorf("environment %s is already %s", id, env.Status)
	case models.EnvironmentStatusProvisioning:
		return fmt.Errorf("cannot destroy environment %s while provisioning", id)
	}

	if err := s.repo.UpdateStatus(ctx, id, models.EnvironmentStatusDestroying); err != nil {
		return err
	}

	log.Printf("destroying environment %s (ns=%s)", id, env.Namespace)
	return nil
}

func (s *EnvironmentService) MarkReady(ctx context.Context, id string) error {
	return s.repo.UpdateStatus(ctx, id, models.EnvironmentStatusRunning)
}

func (s *EnvironmentService) MarkFailed(ctx context.Context, id string) error {
	return s.repo.UpdateStatus(ctx, id, models.EnvironmentStatusFailed)
}

func tierResourceCount(tier models.ResourceTier) int {
	switch tier {
	case models.ResourceTierSmall:
		return 4
	case models.ResourceTierMedium:
		return 8
	case models.ResourceTierLarge:
		return 14
	default:
		return 4
	}
}

func sanitizeName(name string) string {
	s := strings.ToLower(name)
	s = strings.ReplaceAll(s, " ", "-")
	// keep only alphanumeric and hyphens
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			b.WriteRune(r)
		}
	}
	result := b.String()
	if len(result) > 40 {
		result = result[:40]
	}
	return result
}

func generateID(prefix string) (string, error) {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return prefix + "-" + hex.EncodeToString(b), nil
}
