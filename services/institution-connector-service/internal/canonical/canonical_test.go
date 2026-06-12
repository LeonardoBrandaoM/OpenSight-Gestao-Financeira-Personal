package canonical

import (
	"testing"

	"opensight/packages/contracts"
	"opensight/services/institution-connector-service/internal/connector"
)

func TestMapAccount(t *testing.T) {
	cat := connector.Account{ID: "a1", Type: "CREDIT", Subtype: "CREDIT_CARD", Name: "Cartão", Balance: 2480.34, CurrencyCode: "BRL"}
	got := MapAccount(cat, "u1", "Nubank")
	if got.Type != contracts.CreditCard {
		t.Errorf("type = %s, quer CREDIT_CARD", got.Type)
	}
	if got.BalanceCents != 248034 {
		t.Errorf("cents = %d, quer 248034", got.BalanceCents)
	}
	if got.UserID != "u1" || got.Institution != "Nubank" {
		t.Errorf("userID/institution não propagados: %+v", got)
	}

	savings := connector.Account{ID: "a2", Type: "BANK", Subtype: "SAVINGS_ACCOUNT", Balance: 100, CurrencyCode: "BRL"}
	if MapAccount(savings, "u1", "X").Type != contracts.Savings {
		t.Error("SAVINGS_ACCOUNT deveria mapear para SAVINGS")
	}
}

func TestMapTransaction(t *testing.T) {
	c := "Alimentação"
	tx := connector.Transaction{ID: "t1", AccountID: "a1", Date: "2026-05-30", Description: "Mercado", Amount: -28.74, CurrencyCode: "BRL", Category: &c, Type: "DEBIT", Status: "POSTED"}
	got := MapTransaction(tx, "u1")
	if got.AmountCents != -2874 {
		t.Errorf("cents = %d, quer -2874", got.AmountCents)
	}
	if got.Type != contracts.Debit || got.Category != "Alimentação" || got.UserID != "u1" {
		t.Errorf("mapeamento incorreto: %+v", got)
	}
}
