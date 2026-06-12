package repository

import (
	"context"
	"testing"

	"opensight/services/audit-service/internal/domain"
)

func TestAppendIsCumulativeAndScoped(t *testing.T) {
	repo := NewMemoryRepo()
	ctx := context.Background()

	if _, err := repo.Append(ctx, "u1", domain.NovoEvento{Acao: "account.read", Resultado: "sucesso", Origem: "account-service"}); err != nil {
		t.Fatalf("append 1: %v", err)
	}
	if _, err := repo.Append(ctx, "u1", domain.NovoEvento{Acao: "consent.revoke", Resultado: "sucesso", Origem: "consent-service"}); err != nil {
		t.Fatalf("append 2: %v", err)
	}
	if _, err := repo.Append(ctx, "u2", domain.NovoEvento{Acao: "account.read", Resultado: "negado", Origem: "account-service"}); err != nil {
		t.Fatalf("append 3: %v", err)
	}

	u1, _ := repo.List(ctx, "u1")
	if len(u1) != 2 {
		t.Fatalf("u1 deveria ter 2 eventos, tem %d", len(u1))
	}
	u2, _ := repo.List(ctx, "u2")
	if len(u2) != 1 {
		t.Fatalf("u2 deveria ter 1 evento (escopo por usuário), tem %d", len(u2))
	}
	if u1[0].ID == "" || u1[0].Em == "" {
		t.Fatalf("evento sem ID/timestamp: %+v", u1[0])
	}
}
