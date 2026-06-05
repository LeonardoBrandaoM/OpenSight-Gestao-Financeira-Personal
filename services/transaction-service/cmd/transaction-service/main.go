// Comando transaction-service — API HTTP de transações (modelo canônico).
package main

import (
	"context"
	"crypto/rsa"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"opensight/services/transaction-service/internal/api"
	"opensight/services/transaction-service/internal/config"
	"opensight/services/transaction-service/internal/platform"
	"opensight/services/transaction-service/internal/repository"
	"opensight/services/transaction-service/internal/token"
)

func main() {
	log.SetFlags(log.LstdFlags | log.LUTC)
	cfg := config.Load()

	var authPub *rsa.PublicKey
	if cfg.AuthPublicKeyPEM != "" {
		pk, err := token.ParsePublicKeyPEM(cfg.AuthPublicKeyPEM)
		if err != nil {
			log.Fatalf("AUTH_PUBLIC_KEY inválida: %v", err)
		}
		authPub = pk
		log.Println("autenticação: JWT obrigatório (chave pública carregada)")
	} else {
		log.Println("autenticação: modo dev (sem JWT; defina AUTH_PUBLIC_KEY para exigir token)")
	}

	var repo repository.TransactionRepository
	if cfg.DatabaseURL != "" {
		db, err := platform.OpenDB(context.Background(), cfg.DatabaseURL)
		if err != nil {
			log.Fatalf("falha ao conectar no Postgres: %v (driver pgx registrado?)", err)
		}
		defer db.Close()
		repo = repository.NewPostgresRepo(db)
		log.Println("repositório: Postgres")
	} else {
		repo = repository.NewMemoryRepo()
		log.Println("repositório: memória (dev) — defina DATABASE_URL para usar Postgres")
	}

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           api.NewRouter(repo, cfg, authPub),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("transaction-service ouvindo em :%s", cfg.Port)
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
