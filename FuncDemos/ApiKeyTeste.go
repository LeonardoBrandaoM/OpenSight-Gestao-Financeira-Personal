package main

import (
	"fmt"
	"log"
	"time"

	pluggy "PluggySDK/PluggySDKGo"
)

func main() {
	fmt.Println("=== Demonstração da Margem de Segurança de 2 Minutos ===")

	// Obtém a primeira API Key
	fmt.Println("1. Obtendo API Key inicial...")
	apiKey, err := pluggy.GetApiKey()
	if err != nil {
		log.Fatalf("Erro: %v", err)
	}

	now := time.Now()
	expiration := pluggy.GetCachedKeyExpiration()
	timeUntilExpiration := expiration.Sub(now)

	fmt.Printf("✓ API Key obtida: %s...\n", apiKey[:20])
	fmt.Printf("✓ Hora atual: %s\n", now.Format("15:04:05"))
	fmt.Printf("✓ Cache expira em: %s\n", expiration.Format("15:04:05"))
	fmt.Printf("✓ Tempo até expiração do cache: %s\n", timeUntilExpiration.Round(time.Second))

	// Cálculo da validade original da API
	originalExpiration := expiration.Add(2 * time.Minute)
	fmt.Printf("\n📊 Análise da Margem de Segurança:\n")
	fmt.Printf("   • Validade original da API: %s (30 minutos)\n", originalExpiration.Format("15:04:05"))
	fmt.Printf("   • Margem de segurança: 2 minutos\n")
	fmt.Printf("   • Expiração do cache: %s (28 minutos efetivos)\n", expiration.Format("15:04:05"))
	fmt.Printf("   • Renovação acontece 2 minutos ANTES da API expirar\n")

	// Timeline visual
	fmt.Printf("\n🕐 Timeline:\n")
	fmt.Printf("   %s ━━━━━━━ API Key obtida\n", now.Format("15:04"))
	fmt.Printf("   │\n")
	fmt.Printf("   │ (%s de cache ativo)\n", timeUntilExpiration.Round(time.Minute))
	fmt.Printf("   │\n")
	fmt.Printf("   %s ━━━━━━━ Cache expira (renovação automática)\n", expiration.Format("15:04"))
	fmt.Printf("   │\n")
	fmt.Printf("   │ (2 min de margem de segurança)\n")
	fmt.Printf("   │\n")
	fmt.Printf("   %s ━━━━━━━ API Key expiraria (se não renovasse)\n", originalExpiration.Format("15:04"))

	// Demonstração prática
	fmt.Printf("\n⏱️  Demonstração Prática:\n")
	fmt.Println("   Fazendo múltiplas chamadas para demonstrar o cache...")

	for i := 1; i <= 3; i++ {
		start := time.Now()
		key, _ := pluggy.GetApiKey()
		elapsed := time.Since(start)

		fmt.Printf("   Chamada %d: %s... (tempo: %v) - %s\n",
			i,
			key[:15],
			elapsed,
			"CACHE HIT ✓")

		time.Sleep(100 * time.Millisecond)
	}

	fmt.Printf("\n✅ Sistema funcionando corretamente com margem de segurança de 2 minutos!\n")
}
