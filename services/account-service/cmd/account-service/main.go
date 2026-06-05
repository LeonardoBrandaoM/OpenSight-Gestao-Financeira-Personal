// Comando account-service — API HTTP de contas consolidadas.
// Arquitetura: Frontend → ESTA API → repositório → Postgres. O navegador nunca
// executa SQL nem toca no banco (ArquiteturaOpenSight.md §3.4, §4).
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

	"opensight/services/account-service/internal/api"
	"opensight/services/account-service/internal/config"
	"opensight/services/account-service/internal/platform"
	"opensight/services/account-service/internal/repository"
	"opensight/services/account-service/internal/token"
)

func main() {
	log.SetFlags(log.LstdFlags | log.LUTC)
	cfg := config.Load()

	// Autenticação: com a chave pública do auth-service configurada, o JWT é
	// obrigatório; sem ela, modo dev (X-User-ID/usuário-semente).
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

	// Seleção de repositório: Postgres se DATABASE_URL estiver definido; senão,
	// repositório em memória (dev) — permite rodar e integrar o frontend sem DB.
	var repo repository.AccountRepository
	if cfg.DatabaseURL != "" {
		db, err := platform.OpenDB(context.Background(), cfg.DatabaseURL)
		if err != nil {
			log.Fatalf("falha ao conectar no Postgres: %v (o driver pgx está registrado no main?)", err)
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
		ReadHeaderTimeout: 5 * time.Second, // mitiga slowloris
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("account-service ouvindo em :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("servidor: %v", err)
		}
	}()

	// Encerramento gracioso.
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
