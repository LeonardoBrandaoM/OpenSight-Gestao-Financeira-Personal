// Comando apikey-demo — demonstra o cache de apiKey com margem de segurança.
// Sucessor do antigo FuncDemos/ApiKeyTeste.go, agora usando o Client.
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"opensight/services/institution-connector-service/internal/connector"
)

func main() {
	log.SetFlags(0)
	fmt.Println("=== Cache de apiKey (margem de segurança) ===")

	c, err := connector.NewFromEnv()
	if err != nil {
		log.Fatalf("erro: %v", err)
	}

	ctx := context.Background()
	key, err := c.APIKey(ctx)
	if err != nil {
		log.Fatalf("erro: %v", err)
	}

	fmt.Printf("✓ apiKey obtida: %s...\n", key[:min(20, len(key))])
	fmt.Printf("✓ cache expira em: %s\n", c.APIKeyExpiration().Format("15:04:05"))

	for i := 1; i <= 3; i++ {
		start := time.Now()
		if _, err := c.APIKey(ctx); err != nil {
			log.Fatalf("erro: %v", err)
		}
		fmt.Printf("  chamada %d: CACHE HIT (%v)\n", i, time.Since(start))
	}
}
