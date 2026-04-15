package repository

import (
	"context"
	"fmt"

	"github.com/aybzakarya/infraforge/src/api/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EnvironmentRepo struct {
	pool *pgxpool.Pool
}

func NewEnvironmentRepo(pool *pgxpool.Pool) *EnvironmentRepo {
	return &EnvironmentRepo{pool: pool}
}

func (r *EnvironmentRepo) Create(ctx context.Context, env *models.Environment) error {
	query := `
		INSERT INTO environments (id, name, template, status, tier, owner_id, namespace, auto_destroy, ttl_hours, resources, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
		RETURNING created_at, updated_at`

	return r.pool.QueryRow(ctx, query,
		env.ID, env.Name, env.Template, env.Status, env.Tier,
		env.OwnerID, env.Namespace, env.AutoDestroy, env.TTLHours, env.Resources,
	).Scan(&env.CreatedAt, &env.UpdatedAt)
}

func (r *EnvironmentRepo) GetByID(ctx context.Context, id string) (*models.Environment, error) {
	query := `
		SELECT id, name, template, status, tier, owner_id, namespace,
		       auto_destroy, ttl_hours, resources, last_deploy, created_at, updated_at
		FROM environments
		WHERE id = $1`

	var env models.Environment
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&env.ID, &env.Name, &env.Template, &env.Status, &env.Tier,
		&env.OwnerID, &env.Namespace, &env.AutoDestroy, &env.TTLHours,
		&env.Resources, &env.LastDeploy, &env.CreatedAt, &env.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("get environment %s: %w", id, err)
	}
	return &env, nil
}

func (r *EnvironmentRepo) List(ctx context.Context, limit, offset int) ([]models.Environment, error) {
	query := `
		SELECT id, name, template, status, tier, owner_id, namespace,
		       auto_destroy, ttl_hours, resources, last_deploy, created_at, updated_at
		FROM environments
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list environments: %w", err)
	}
	defer rows.Close()

	var envs []models.Environment
	for rows.Next() {
		var env models.Environment
		if err := rows.Scan(
			&env.ID, &env.Name, &env.Template, &env.Status, &env.Tier,
			&env.OwnerID, &env.Namespace, &env.AutoDestroy, &env.TTLHours,
			&env.Resources, &env.LastDeploy, &env.CreatedAt, &env.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan environment: %w", err)
		}
		envs = append(envs, env)
	}
	return envs, rows.Err()
}

func (r *EnvironmentRepo) UpdateStatus(ctx context.Context, id string, status models.EnvironmentStatus) error {
	query := `UPDATE environments SET status = $1, updated_at = NOW() WHERE id = $2`
	tag, err := r.pool.Exec(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("update environment status: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("environment %s not found", id)
	}
	return nil
}

func (r *EnvironmentRepo) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM environments WHERE id = $1`
	tag, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete environment: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("environment %s not found", id)
	}
	return nil
}
