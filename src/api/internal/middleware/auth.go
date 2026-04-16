package middleware

import (
	"encoding/json"
	"net/http"
	"strings"
)

// Auth checks for a valid API key in the X-API-Key header.
// Health and readiness probes are excluded from authentication.
func Auth(apiKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// skip auth for probes and preflight
			if strings.HasPrefix(r.URL.Path, "/healthz") ||
				strings.HasPrefix(r.URL.Path, "/readyz") ||
				r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			// if no API key is configured, skip auth entirely (dev mode)
			if apiKey == "" {
				next.ServeHTTP(w, r)
				return
			}

			key := r.Header.Get("X-API-Key")
			if key == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "missing X-API-Key header"})
				return
			}

			if key != apiKey {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				json.NewEncoder(w).Encode(map[string]string{"error": "invalid API key"})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
