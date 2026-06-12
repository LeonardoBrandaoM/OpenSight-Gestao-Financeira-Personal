package sync

import (
	"context"
	"testing"

	"opensight/services/institution-connector-service/internal/connector"
)

type fakeReader struct {
	accounts []connector.Account
	txs      map[string][]connector.Transaction
}

func (f fakeReader) ListAccounts(_ context.Context, _ string) ([]connector.Account, error) {
	return f.accounts, nil
}
func (f fakeReader) ListTransactions(_ context.Context, accountID string, _ connector.TransactionFilter) ([]connector.Transaction, error) {
	return f.txs[accountID], nil
}

func TestSyncItem(t *testing.T) {
	reader := fakeReader{
		accounts: []connector.Account{
			{ID: "a1", Type: "CREDIT", Name: "Cartão", Balance: 100, CurrencyCode: "BRL"},
			{ID: "a2", Type: "BANK", Subtype: "CHECKING_ACCOUNT", Name: "CC", Balance: 200, CurrencyCode: "BRL"},
		},
		txs: map[string][]connector.Transaction{
			"a1": {{ID: "t1", AccountID: "a1", Amount: -10, Type: "DEBIT", Status: "POSTED", CurrencyCode: "BRL", Date: "2026-05-30", Description: "x"}},
			"a2": {
				{ID: "t2", AccountID: "a2", Amount: 200, Type: "CREDIT", Status: "POSTED", CurrencyCode: "BRL", Date: "2026-05-29", Description: "y"},
				{ID: "t3", AccountID: "a2", Amount: -5, Type: "DEBIT", Status: "POSTED", CurrencyCode: "BRL", Date: "2026-05-28", Description: "z"},
			},
		},
	}
	mp := &MemoryPersister{}
	rep, err := New(reader, mp).SyncItem(context.Background(), "u1", "item1", "Nubank")
	if err != nil {
		t.Fatalf("sync: %v", err)
	}
	if rep.Accounts != 2 || rep.Transactions != 3 {
		t.Fatalf("report = %+v, quer {2,3}", rep)
	}
	if len(mp.Accounts) != 2 || len(mp.Transactions) != 3 {
		t.Fatalf("persistido contas=%d txs=%d, quer 2/3", len(mp.Accounts), len(mp.Transactions))
	}
	// canônico aplicado: userID propagado e tipo mapeado.
	if mp.Accounts[0].UserID != "u1" || string(mp.Accounts[0].Type) != "CREDIT_CARD" {
		t.Fatalf("mapeamento canônico incorreto: %+v", mp.Accounts[0])
	}
}
