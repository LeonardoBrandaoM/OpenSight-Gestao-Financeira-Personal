package api

import (
	"net/http"

	"opensight/packages/contracts"
	"opensight/services/transaction-service/internal/httpx"
	"opensight/services/transaction-service/internal/repository"
)

type Handlers struct {
	repo repository.TransactionRepository
}

func NewHandlers(repo repository.TransactionRepository) *Handlers {
	return &Handlers{repo: repo}
}

func (h *Handlers) health(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// GET /api/v1/transactions?accountId=... — transações do usuário (filtro opcional).
func (h *Handlers) listTransactions(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r.Context())
	accountID := r.URL.Query().Get("accountId")
	txs, err := h.repo.List(r.Context(), uid, accountID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao listar transações")
		return
	}
	if txs == nil {
		txs = []contracts.Transaction{}
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"results": txs})
}
