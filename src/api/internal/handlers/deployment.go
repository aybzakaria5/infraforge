package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/aybzakarya/infraforge/src/api/internal/service"
)

type DeploymentHandler struct {
	svc *service.DeploymentService
}

func NewDeploymentHandler(svc *service.DeploymentService) *DeploymentHandler {
	return &DeploymentHandler{svc: svc}
}

func (h *DeploymentHandler) ListRecent(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	deps, err := h.svc.ListRecent(r.Context(), limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, deps)
}

func (h *DeploymentHandler) ListByEnvironment(w http.ResponseWriter, r *http.Request) {
	envID := r.PathValue("env_id")
	if envID == "" {
		writeError(w, http.StatusBadRequest, "missing environment id")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	deps, err := h.svc.ListByEnvironment(r.Context(), envID, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, deps)
}

func (h *DeploymentHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing deployment id")
		return
	}

	dep, err := h.svc.Get(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, dep)
}

func (h *DeploymentHandler) Trigger(w http.ResponseWriter, r *http.Request) {
	var in service.TriggerDeploymentInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	dep, err := h.svc.Trigger(r.Context(), in)
	if err != nil {
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, dep)
}
