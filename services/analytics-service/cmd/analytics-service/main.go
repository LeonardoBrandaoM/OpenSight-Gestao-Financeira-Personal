// Comando analytics-service — agregações do dashboard (cashflow, por categoria,
// série de saldo, resumo). Hoje servidas de seed em memória.
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

	"opensight/services/analytics-service/internal/api"
	"opensight/services/analytics-service/internal/config"
	"opensight/services/analytics-service/internal/repository"
	"opensight/services/analytics-service/internal/token"
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
		log.Println("autenticação: JWT obrigatório")
	} else {
		log.Println("autenticação: modo dev (sem JWT)")
	}

	repo := repository.NewMemoryRepo()
	log.Println("repositório: memória (seed) — precompute para analytics_db é o próximo passo")

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           api.NewRouter(repo, cfg, authPub),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("analytics-service ouvindo em :%s", cfg.Port)
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
