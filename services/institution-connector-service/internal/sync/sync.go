// Package sync orquestra o fluxo Pluggy → canônico → persistência.
// Depende de PORTAS (Reader/Persister): o conector é o Reader; o Persister grava
// o modelo canônico. Hoje o Persister grava direto no Postgres; numa evolução
// vira publicação de eventos consumidos pelos serviços donos de cada DB.
package sync

import (
	"context"

	"opensight/packages/contracts"
	"opensight/services/institution-connector-service/internal/canonical"
	"opensight/services/institution-connector-service/internal/connector"
)

// Reader é a fonte de leitura (satisfeita por *connector.Client) — READ-ONLY.
type Reader interface {
	ListAccounts(ctx context.Context, itemID string) ([]connector.Account, error)
	ListTransactions(ctx context.Context, accountID string, f connector.TransactionFilter) ([]connector.Transaction, error)
}

// Persister grava o modelo canônico (upsert idempotente).
type Persister interface {
	UpsertAccounts(ctx context.Context, accounts []contracts.Account) error
	UpsertTransactions(ctx context.Context, transactions []contracts.Transaction) error
}

// Report resume o que foi sincronizado.
type Report struct {
	Accounts     int
	Transactions int
}

type Service struct {
	reader    Reader
	persister Persister
}

func New(reader Reader, persister Persister) *Service {
	return &Service{reader: reader, persister: persister}
}

// SyncItem lê contas e transações de um item (conexão), mapeia para o canônico
// e persiste. Idempotente (o Persister faz upsert por id).
func (s *Service) SyncItem(ctx context.Context, userID, itemID, institution string) (Report, error) {
	rawAccounts, err := s.reader.ListAccounts(ctx, itemID)
	if err != nil {
		return Report{}, err
	}

	accounts := make([]contracts.Account, 0, len(rawAccounts))
	for _, a := range rawAccounts {
		accounts = append(accounts, canonical.MapAccount(a, userID, institution))
	}
	if err := s.persister.UpsertAccounts(ctx, accounts); err != nil {
		return Report{}, err
	}

	report := Report{Accounts: len(accounts)}
	for _, a := range rawAccounts {
		rawTxs, err := s.reader.ListTransactions(ctx, a.ID, connector.TransactionFilter{})
		if err != nil {
			return report, err
		}
		txs := make([]contracts.Transaction, 0, len(rawTxs))
		for _, t := range rawTxs {
			txs = append(txs, canonical.MapTransaction(t, userID))
		}
		if err := s.persister.UpsertTransactions(ctx, txs); err != nil {
			return report, err
		}
		report.Transactions += len(txs)
	}
	return report, nil
}

// MemoryPersister acumula em memória (dev/testes).
type MemoryPersister struct {
	Accounts     []contracts.Account
	Transactions []contracts.Transaction
}

func (m *MemoryPersister) UpsertAccounts(_ context.Context, a []contracts.Account) error {
	m.Accounts = append(m.Accounts, a...)
	return nil
}
func (m *MemoryPersister) UpsertTransactions(_ context.Context, t []contracts.Transaction) error {
	m.Transactions = append(m.Transactions, t...)
	return nil
}
