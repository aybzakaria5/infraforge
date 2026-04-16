package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aybzakarya/infraforge/src/api/internal/config"
	"github.com/aybzakarya/infraforge/src/api/internal/handlers"
	"github.com/aybzakarya/infraforge/src/api/internal/repository"
	"github.com/aybzakarya/infraforge/src/api/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// database
	ctx := context.Background()
	pool, err := repository.NewPool(ctx, cfg.Database.DSN())
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
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

	srv := &http.Server{
		Addr:         cfg.Server.Addr(),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	// start server in background
	errCh := make(chan error, 1)
	go func() {
		log.Printf("starting server on %s", srv.Addr)
		errCh <- srv.ListenAndServe()
	}()

	// wait for interrupt or server error
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		log.Printf("received signal %s, shutting down", sig)
	case err := <-errCh:
		log.Printf("server error: %v", err)
	}

	// graceful shutdown with 10s deadline
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}

	log.Println("server stopped")
}
