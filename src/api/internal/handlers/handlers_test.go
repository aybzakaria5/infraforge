package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/aybzakarya/infraforge/src/api/internal/handlers"
	"github.com/aybzakarya/infraforge/src/api/internal/models"
	"github.com/aybzakarya/infraforge/src/api/internal/repository"
	"github.com/aybzakarya/infraforge/src/api/internal/service"
	"github.com/jackc/pgx/v5/pgxpool"
)

func setupTestServer(t *testing.T) (*httptest.Server, *pgxpool.Pool) {
	t.Helper()

	dsn := os.Getenv("INFRAFORGE_TEST_DSN")
	if dsn == "" {
		t.Skip("INFRAFORGE_TEST_DSN not set, skipping integration tests")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("connect to test db: %v", err)
	}

	// create tables for test
	pool.Exec(ctx, `DROP TABLE IF EXISTS deployments, environments, users`)
	pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS users (
			id VARCHAR(32) PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE,
			name VARCHAR(255) NOT NULL, avatar_url TEXT, role VARCHAR(20) NOT NULL DEFAULT 'member',
			active BOOLEAN NOT NULL DEFAULT TRUE, last_login TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`)
	pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS environments (
			id VARCHAR(32) PRIMARY KEY, name VARCHAR(255) NOT NULL, template VARCHAR(50) NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'provisioning', tier VARCHAR(20) NOT NULL DEFAULT 'small',
			owner_id VARCHAR(32) NOT NULL REFERENCES users(id), namespace VARCHAR(100) NOT NULL UNIQUE,
			auto_destroy BOOLEAN NOT NULL DEFAULT FALSE, ttl_hours INTEGER NOT NULL DEFAULT 0,
			resources INTEGER NOT NULL DEFAULT 0, last_deploy TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`)
	pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS deployments (
			id VARCHAR(32) PRIMARY KEY, environment_id VARCHAR(32) NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
			commit_sha VARCHAR(40) NOT NULL, commit_message TEXT NOT NULL DEFAULT '', author VARCHAR(255) NOT NULL DEFAULT '',
			image_tag VARCHAR(255) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'pending',
			strategy VARCHAR(20) NOT NULL DEFAULT 'rolling', duration_sec DOUBLE PRECISION NOT NULL DEFAULT 0,
			vulnerabilities INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			finished_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`)

	// seed a test user
	pool.Exec(ctx, `INSERT INTO users (id, email, name, role) VALUES ('usr-test-00000001', 'test@infraforge.dev', 'Test User', 'admin') ON CONFLICT DO NOTHING`)

	envRepo := repository.NewEnvironmentRepo(pool)
	depRepo := repository.NewDeploymentRepo(pool)

	envSvc := service.NewEnvironmentService(envRepo)
	depSvc := service.NewDeploymentService(depRepo, envRepo)

	healthH := handlers.NewHealthHandler(pool)
	envH := handlers.NewEnvironmentHandler(envSvc)
	depH := handlers.NewDeploymentHandler(depSvc)

	router := handlers.NewRouter(healthH, envH, depH)
	srv := httptest.NewServer(router)

	t.Cleanup(func() {
		srv.Close()
		pool.Exec(context.Background(), `DROP TABLE IF EXISTS deployments, environments, users`)
		pool.Close()
	})

	return srv, pool
}

func TestHealthEndpoint(t *testing.T) {
	srv, _ := setupTestServer(t)

	resp, err := http.Get(srv.URL + "/healthz")
	if err != nil {
		t.Fatalf("GET /healthz: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	var body map[string]string
	json.NewDecoder(resp.Body).Decode(&body)
	if body["status"] != "ok" {
		t.Errorf("expected status ok, got %s", body["status"])
	}
}

func TestCreateAndGetEnvironment(t *testing.T) {
	srv, _ := setupTestServer(t)

	// create
	payload := `{"name":"payment-service-staging","template":"staging","tier":"medium","owner_id":"usr-test-00000001"}`
	resp, err := http.Post(srv.URL+"/api/v1/environments", "application/json", bytes.NewBufferString(payload))
	if err != nil {
		t.Fatalf("POST /api/v1/environments: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201, got %d", resp.StatusCode)
	}

	var env models.Environment
	json.NewDecoder(resp.Body).Decode(&env)

	if env.Name != "payment-service-staging" {
		t.Errorf("expected name payment-service-staging, got %s", env.Name)
	}
	if env.Status != models.EnvironmentStatusProvisioning {
		t.Errorf("expected status provisioning, got %s", env.Status)
	}
	if env.Tier != models.ResourceTierMedium {
		t.Errorf("expected tier medium, got %s", env.Tier)
	}
	if env.Resources != 8 {
		t.Errorf("expected 8 resources for medium tier, got %d", env.Resources)
	}

	// get by id
	resp2, err := http.Get(srv.URL + "/api/v1/environments/" + env.ID)
	if err != nil {
		t.Fatalf("GET /api/v1/environments/%s: %v", env.ID, err)
	}
	defer resp2.Body.Close()

	if resp2.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp2.StatusCode)
	}

	var fetched models.Environment
	json.NewDecoder(resp2.Body).Decode(&fetched)
	if fetched.ID != env.ID {
		t.Errorf("expected id %s, got %s", env.ID, fetched.ID)
	}
}

func TestListEnvironments(t *testing.T) {
	srv, _ := setupTestServer(t)

	// create two environments
	for _, name := range []string{"auth-service-dev", "worker-v3-staging"} {
		payload, _ := json.Marshal(map[string]string{
			"name": name, "template": "staging", "tier": "small", "owner_id": "usr-test-00000001",
		})
		resp, err := http.Post(srv.URL+"/api/v1/environments", "application/json", bytes.NewBuffer(payload))
		if err != nil {
			t.Fatalf("POST create %s: %v", name, err)
		}
		resp.Body.Close()
	}

	// list
	resp, err := http.Get(srv.URL + "/api/v1/environments?limit=10")
	if err != nil {
		t.Fatalf("GET /api/v1/environments: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	var envs []models.Environment
	json.NewDecoder(resp.Body).Decode(&envs)
	if len(envs) < 2 {
		t.Errorf("expected at least 2 environments, got %d", len(envs))
	}
}

func TestCreateEnvironmentValidation(t *testing.T) {
	srv, _ := setupTestServer(t)

	tests := []struct {
		name    string
		payload string
		status  int
	}{
		{
			name:    "missing name",
			payload: `{"template":"staging","tier":"small","owner_id":"usr-test-00000001"}`,
			status:  http.StatusUnprocessableEntity,
		},
		{
			name:    "invalid tier",
			payload: `{"name":"test-env","template":"staging","tier":"xxl","owner_id":"usr-test-00000001"}`,
			status:  http.StatusUnprocessableEntity,
		},
		{
			name:    "auto_destroy without ttl",
			payload: `{"name":"test-env","template":"staging","tier":"small","owner_id":"usr-test-00000001","auto_destroy":true}`,
			status:  http.StatusUnprocessableEntity,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			resp, err := http.Post(srv.URL+"/api/v1/environments", "application/json", bytes.NewBufferString(tc.payload))
			if err != nil {
				t.Fatalf("POST: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tc.status {
				t.Errorf("expected %d, got %d", tc.status, resp.StatusCode)
			}
		})
	}
}
