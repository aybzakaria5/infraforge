package handlers

import "net/http"

func NewRouter(
	health *HealthHandler,
	envs *EnvironmentHandler,
	deps *DeploymentHandler,
) *http.ServeMux {
	mux := http.NewServeMux()

	// probes
	mux.HandleFunc("GET /healthz", health.Health)
	mux.HandleFunc("GET /readyz", health.Ready)

	// environments
	mux.HandleFunc("GET /api/v1/environments", envs.List)
	mux.HandleFunc("POST /api/v1/environments", envs.Create)
	mux.HandleFunc("GET /api/v1/environments/{id}", envs.Get)
	mux.HandleFunc("DELETE /api/v1/environments/{id}", envs.Destroy)

	// deployments
	mux.HandleFunc("GET /api/v1/deployments", deps.ListRecent)
	mux.HandleFunc("POST /api/v1/deployments", deps.Trigger)
	mux.HandleFunc("GET /api/v1/deployments/{id}", deps.Get)
	mux.HandleFunc("GET /api/v1/environments/{env_id}/deployments", deps.ListByEnvironment)

	return mux
}
