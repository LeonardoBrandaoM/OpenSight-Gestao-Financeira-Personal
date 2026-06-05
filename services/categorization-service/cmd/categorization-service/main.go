// Comando categorization-service — categorias e tipos de transação (RF-004).
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

	"opensight/packages/httpkit"
	"opensight/services/categorization-service/internal/api"
	"opensight/services/categorization-service/internal/repository"
)

func main() {
	log.SetFlags(log.LstdFlags | log.LUTC)
	cfg := httpkit.LoadConfig("8091")

	var authPub *rsa.PublicKey
	if cfg.AuthPublicKeyPEM != "" {
		pk, err := httpkit.ParsePublicKeyPEM(cfg.AuthPublicKeyPEM)
		if err != nil {
			log.Fatalf("AUTH_PUBLIC_KEY inválida: %v", err)
		}
		authPub = pk
		log.Println("autenticação: JWT obrigatório")
	} else {
		log.Println("autenticação: modo dev (sem JWT)")
	}

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           api.NewRouter(repository.NewMemoryRepo(), cfg, authPub),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("categorization-service ouvindo em :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("servidor: %v", err)
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
	log.Println("encerrado")
}
