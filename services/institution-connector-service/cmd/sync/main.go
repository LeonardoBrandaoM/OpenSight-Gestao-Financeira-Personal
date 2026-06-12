// Comando sync — lê um item da Pluggy (READ-ONLY), mapeia para o modelo
// canônico e persiste. Sem ACCOUNT_DATABASE_URL/TRANSACTION_DATABASE_URL, usa
// um persister em memória (apenas imprime o resultado).
package main

import (
	"context"
	"database/sql"
	"log"
	"os"
	"time"

	"opensight/services/institution-connector-service/internal/connector"
	"opensight/services/institution-connector-service/internal/sync"
)

func main() {
	log.SetFlags(log.LstdFlags | log.LUTC)

	client, err := connector.NewFromEnv()
	if err != nil {
		log.Fatalf("credenciais ausentes: %v", err)
	}
	itemID := os.Getenv("PLUGGY_ITEM_ID")
	if itemID == "" {
		log.Fatal("defina PLUGGY_ITEM_ID (a conexão a sincronizar)")
	}
	userID := getenv("USER_ID", "00000000-0000-0000-0000-000000000001")
	institution := getenv("INSTITUTION", "")

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	var persister sync.Persister
	accURL, txURL := os.Getenv("ACCOUNT_DATABASE_URL"), os.Getenv("TRANSACTION_DATABASE_URL")
	if accURL != "" && txURL != "" {
		adb, err := openDB(ctx, accURL)
		if err != nil {
			log.Fatalf("account_db: %v", err)
		}
		defer adb.Close()
		tdb, err := openDB(ctx, txURL)
		if err != nil {
			log.Fatalf("transaction_db: %v", err)
		}
		defer tdb.Close()
		persister = sync.NewPostgresPersister(adb, tdb)
		log.Println("persister: Postgres")
	} else {
		persister = &sync.MemoryPersister{}
		log.Println("persister: memória (defina ACCOUNT_DATABASE_URL e TRANSACTION_DATABASE_URL para gravar)")
	}

	rep, err := sync.New(client, persister).SyncItem(ctx, userID, itemID, institution)
	if err != nil {
		log.Fatalf("sync: %v", err)
	}
	log.Printf("sync OK: %d conta(s), %d transação(ões)", rep.Accounts, rep.Transactions)
	if mp, ok := persister.(*sync.MemoryPersister); ok {
		for _, a := range mp.Accounts {
			log.Printf("  [%s] %s  saldo=%.2f %s", a.Type, a.Institution, float64(a.BalanceCents)/100, a.Currency)
		}
	}
}

func openDB(ctx context.Context, url string) (*sql.DB, error) {
	db, err := sql.Open("pgx", url)
	if err != nil {
		return nil, err
	}
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := db.PingContext(pingCtx); err != nil {
		_ = db.Close()
		return nil, err
	}
	return db, nil
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
