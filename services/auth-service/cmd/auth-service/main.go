// Comando auth-service — autenticação (registro/login) e emissão de JWT RS256.
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"opensight/services/auth-service/internal/api"
	"opensight/services/auth-service/internal/config"
	"opensight/services/auth-service/internal/platform"
	"opensight/services/auth-service/internal/repository"
	"opensight/services/auth-service/internal/token"
)

func main() {
	log.SetFlags(log.LstdFlags | log.LUTC)
	cfg := config.Load()

	signer, err := token.NewSigner(cfg.JWTPrivPEM, cfg.JWTIssuer, cfg.AccessTTL)
	if err != nil {
		log.Fatalf("falha ao iniciar o signer JWT: %v", err)
	}
	if signer.Ephemeral() {
		log.Println("AVISO: chave JWT efêmera (dev). Defina JWT_PRIVATE_KEY/_FILE em produção.")
	}

	var users repository.UserRepository
	if cfg.DatabaseURL != "" {
		db, err := platform.OpenDB(context.Background(), cfg.DatabaseURL)
		if err != nil {
			log.Fatalf("falha ao conectar no Postgres: %v (driver pgx registrado?)", err)
		}
		defer db.Close()
		users = repository.NewPostgresRepo(db)
		log.Println("repositório: Postgres")
	} else {
		users = repository.NewMemoryRepo()
		log.Println("repositório: memória (dev) — defina DATABASE_URL para usar Postgres")
	}

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           api.NewRouter(users, signer, cfg),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("auth-service ouvindo em :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("servidor: %v", err)
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("erro no shutdown: %v", err)
	}
	log.Println("encerrado")
}
