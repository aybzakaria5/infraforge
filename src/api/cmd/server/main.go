package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aybzakarya/infraforge/src/api/internal/config"
	"github.com/aybzakarya/infraforge/src/api/internal/handlers"
	"github.com/aybzakarya/infraforge/src/api/internal/middleware"
	"github.com/aybzakarya/infraforge/src/api/internal/repository"
	"github.com/aybzakarya/infraforge/src/api/internal/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// database
	ctx := context.Background()
	pool, err := repository.NewPool(ctx, cfg.Database.DSN())
	if err != nil {
		logger.Error("failed to connect to database", slog.String("error", err.Error()))
		os.Exit(1)
	}
	defer pool.Close()

	// repos
	envRepo := repository.NewEnvironmentRepo(pool)
	depRepo := repository.NewDeploymentRepo(pool)

	// services
	envSvc := service.NewEnvironmentService(envRepo)
	depSvc := service.NewDeploymentService(depRepo, envRepo)

	// handlers
	healthH := handlers.NewHealthHandler(pool)
	envH := handlers.NewEnvironmentHandler(envSvc)
	depH := handlers.NewDeploymentHandler(depSvc)

	router := handlers.NewRouter(healthH, envH, depH)

	// middleware chain: outermost runs first
	var handler http.Handler = router
	handler = middleware.Auth(cfg.APIKey)(handler)
	handler = middleware.Logging(logger)(handler)
	handler = middleware.CORS(handler)
	handler = middleware.RequestID(handler)

	srv := &http.Server{
		Addr:         cfg.Server.Addr(),
		Handler:      handler,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	// start server in background
	errCh := make(chan error, 1)
	go func() {
		logger.Info("starting server", slog.String("addr", srv.Addr))
		errCh <- srv.ListenAndServe()
	}()

	// wait for interrupt or server error
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		logger.Info("received signal, shutting down", slog.String("signal", sig.String()))
	case err := <-errCh:
		logger.Error("server error", slog.String("error", err.Error()))
	}

	// graceful shutdown with 10s deadline
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("forced shutdown", slog.String("error", err.Error()))
		os.Exit(1)
	}

	logger.Info("server stopped")
}
