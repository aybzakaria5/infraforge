package repository

import (
	"context"
	"fmt"

	"github.com/aybzakarya/infraforge/src/api/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DeploymentRepo struct {
	pool *pgxpool.Pool
}

func NewDeploymentRepo(pool *pgxpool.Pool) *DeploymentRepo {
	return &DeploymentRepo{pool: pool}
}

func (r *DeploymentRepo) Create(ctx context.Context, d *models.Deployment) error {
	query := `
		INSERT INTO deployments (id, environment_id, commit_sha, commit_message, author, image_tag, status, strategy, duration_sec, vulnerabilities, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
		RETURNING created_at`

	return r.pool.QueryRow(ctx, query,
		d.ID, d.EnvironmentID, d.CommitSHA, d.CommitMessage,
		d.Author, d.ImageTag, d.Status, d.Strategy,
		d.Duration, d.Vulnerabilities,
	).Scan(&d.CreatedAt)
}

func (r *DeploymentRepo) GetByID(ctx context.Context, id string) (*models.Deployment, error) {
	query := `
		SELECT id, environment_id, commit_sha, commit_message, author, image_tag,
		       status, strategy, duration_sec, vulnerabilities, created_at, finished_at
		FROM deployments
		WHERE id = $1`

	var d models.Deployment
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&d.ID, &d.EnvironmentID, &d.CommitSHA, &d.CommitMessage,
		&d.Author, &d.ImageTag, &d.Status, &d.Strategy,
		&d.Duration, &d.Vulnerabilities, &d.CreatedAt, &d.FinishedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("get deployment %s: %w", id, err)
	}
	return &d, nil
}

func (r *DeploymentRepo) ListByEnvironment(ctx context.Context, envID string, limit, offset int) ([]models.Deployment, error) {
	query := `
		SELECT id, environment_id, commit_sha, commit_message, author, image_tag,
		       status, strategy, duration_sec, vulnerabilities, created_at, finished_at
		FROM deployments
		WHERE environment_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.pool.Query(ctx, query, envID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list deployments: %w", err)
	}
	defer rows.Close()

	var deps []models.Deployment
	for rows.Next() {
		var d models.Deployment
		if err := rows.Scan(
			&d.ID, &d.EnvironmentID, &d.CommitSHA, &d.CommitMessage,
			&d.Author, &d.ImageTag, &d.Status, &d.Strategy,
			&d.Duration, &d.Vulnerabilities, &d.CreatedAt, &d.FinishedAt,
		); err != nil {
			return nil, fmt.Errorf("scan deployment: %w", err)
		}
		deps = append(deps, d)
	}
	return deps, rows.Err()
}

func (r *DeploymentRepo) ListRecent(ctx context.Context, limit int) ([]models.Deployment, error) {
	query := `
		SELECT id, environment_id, commit_sha, commit_message, author, image_tag,
		       status, strategy, duration_sec, vulnerabilities, created_at, finished_at
		FROM deployments
		ORDER BY created_at DESC
		LIMIT $1`

	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("list recent deployments: %w", err)
	}
	defer rows.Close()

	var deps []models.Deployment
	for rows.Next() {
		var d models.Deployment
		if err := rows.Scan(
			&d.ID, &d.EnvironmentID, &d.CommitSHA, &d.CommitMessage,
			&d.Author, &d.ImageTag, &d.Status, &d.Strategy,
			&d.Duration, &d.Vulnerabilities, &d.CreatedAt, &d.FinishedAt,
		); err != nil {
			return nil, fmt.Errorf("scan deployment: %w", err)
		}
		deps = append(deps, d)
	}
	return deps, rows.Err()
}

func (r *DeploymentRepo) UpdateStatus(ctx context.Context, id string, status models.DeploymentStatus) error {
	query := `UPDATE deployments SET status = $1, updated_at = NOW() WHERE id = $2`
	tag, err := r.pool.Exec(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("update deployment status: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("deployment %s not found", id)
	}
	return nil
}

func (r *DeploymentRepo) Finish(ctx context.Context, id string, status models.DeploymentStatus, duration float64) error {
	query := `UPDATE deployments SET status = $1, duration_sec = $2, finished_at = NOW(), updated_at = NOW() WHERE id = $3`
	tag, err := r.pool.Exec(ctx, query, status, duration, id)
	if err != nil {
		return fmt.Errorf("finish deployment: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("deployment %s not found", id)
	}
	return nil
}
