// Comando connector-service — ponto de partida do institution-connector-service.
// Por enquanto faz um smoke READ-ONLY: autentica na Pluggy e, se PLUGGY_ITEM_ID
// estiver definido, lista as contas do item. O servidor HTTP/gRPC, os workers de
// sync e a persistência criptografada entram nas próximas etapas (ver
// Documentação/ArquiteturaOpenSight.md §3.3 e §10).
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"opensight/services/institution-connector-service/internal/connector"
)

func main() {
	log.SetFlags(0)

	c, err := connector.NewFromEnv()
	if err != nil {
		log.Fatalf("credenciais ausentes: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	if _, err := c.APIKey(ctx); err != nil {
		log.Fatalf("falha ao autenticar na Pluggy: %v", err)
	}
	fmt.Printf("✓ autenticado (apiKey expira em %s)\n", c.APIKeyExpiration().Format(time.RFC3339))

	itemID := os.Getenv("PLUGGY_ITEM_ID")
	if itemID == "" {
		fmt.Println("defina PLUGGY_ITEM_ID para listar contas (modo somente-leitura).")
		return
	}

	accounts, err := c.ListAccounts(ctx, itemID)
	if err != nil {
		log.Fatalf("erro ao listar contas: %v", err)
	}
	fmt.Printf("✓ %d conta(s) encontradas para o item %s\n", len(accounts), itemID)
	for _, a := range accounts {
		fmt.Printf("  - [%s/%s] %s  saldo=%.2f %s\n", a.Type, a.Subtype, a.Name, a.Balance, a.CurrencyCode)
	}
}
